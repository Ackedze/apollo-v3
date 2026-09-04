import { parseApolloGenerationPlan } from './contracts';
import { executeApolloGenerationPlan } from './executePlan';

const APOLLO_GENERATION_PLAN_URL =
  'http://localhost:3001/v1/generation/plan';
const APOLLO_PROXY_HEALTH_URL = 'http://localhost:3001/health';

export type ApolloLayoutGeneratorDependencies = {
  api: PluginAPI;
  request: typeof fetch;
  postMessage(message: unknown): void;
};

export type ApolloLayoutGenerator = {
  getProxyStatus(): Promise<void>;
  generate(
    requestId: string | null | undefined,
    prompt: string | null | undefined,
    dialogue?: unknown,
    brief?: string | null,
    clarificationRound?: unknown,
  ): Promise<void>;
  cancel(requestId: string | null | undefined): boolean;
};

export function createApolloLayoutGenerator(
  dependencies: ApolloLayoutGeneratorDependencies,
): ApolloLayoutGenerator {
  let activeRequestId: string | null = null;

  async function getProxyStatus(): Promise<void> {
    try {
      const response = await dependencies.request(APOLLO_PROXY_HEALTH_URL, {
        method: 'GET',
      });
      const data = await response.json().catch(() => null);
      const version =
        typeof data?.proxy?.version === 'string'
          ? data.proxy.version.trim()
          : '';
      dependencies.postMessage({
        type: 'apollo-proxy-status',
        payload: {
          available: response.ok,
          version: version || null,
        },
      });
    } catch {
      dependencies.postMessage({
        type: 'apollo-proxy-status',
        payload: {
          available: false,
          version: null,
        },
      });
    }
  }

  async function generate(
    requestId?: string | null,
    prompt?: string | null,
    dialogue?: unknown,
    brief?: string | null,
    clarificationRound?: unknown,
  ): Promise<void> {
    const currentRequestId = requestId || `apollo-generation-${Date.now()}`;
    const normalizedPrompt = typeof prompt === 'string' ? prompt.trim() : '';
    if (!normalizedPrompt) {
      dependencies.postMessage({
        type: 'apollo-generation-result',
        payload: {
          requestId: currentRequestId,
          error: 'Опишите макет, который нужно создать.',
        },
      });
      return;
    }

    activeRequestId = currentRequestId;
    dependencies.postMessage({
      type: 'apollo-generation-started',
      payload: {
        requestId: currentRequestId,
        message: 'Подбираем паттерн или рецепт и компоненты',
      },
    });

    try {
      const response = await dependencies.request(APOLLO_GENERATION_PLAN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: normalizedPrompt,
          brief:
            typeof brief === 'string' && brief.trim()
              ? brief.trim()
              : normalizedPrompt,
          dialogue: Array.isArray(dialogue) ? dialogue : [],
          clarificationRound: Math.max(
            0,
            Math.min(4, Number(clarificationRound) || 0),
          ),
        }),
      });
      if (activeRequestId !== currentRequestId) return;

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `Apollo Proxy generation error ${response.status}`,
        );
      }
      const data = await response.json().catch(() => null);
      if (!data?.success) {
        throw new Error(data?.error || 'Apollo Proxy не вернул план генерации.');
      }
      if (data.status === 'clarification_required') {
        const question = data?.clarification?.question;
        const reason = data?.clarification?.reason;
        const suggestedAnswers = Array.isArray(
          data?.clarification?.suggestedAnswers,
        )
          ? data.clarification.suggestedAnswers
          : [];
        if (typeof question !== 'string' || !question.trim()) {
          throw new Error('Apollo Proxy вернул некорректный запрос уточнения.');
        }
        const reasonText = typeof reason === 'string' && reason.trim()
          ? `\n\nПочему спрашиваю: ${reason.trim()}`
          : '';
        const suggestionsText = suggestedAnswers.length
          ? `\n\nВарианты: ${suggestedAnswers.join(' · ')}`
          : '';
        dependencies.postMessage({
          type: 'apollo-generation-result',
          payload: {
            requestId: currentRequestId,
            clarificationRequired: true,
            text: `${question.trim()}${reasonText}${suggestionsText}`,
          },
        });
        return;
      }
      if (data.status === 'blocked') {
        const message = typeof data?.blocked?.message === 'string'
          ? data.blocked.message.trim()
          : 'Текущий набор возможностей не позволяет безопасно собрать макет.';
        const reason = typeof data?.blocked?.reason === 'string'
          ? data.blocked.reason.trim()
          : '';
        const capabilities = Array.isArray(data?.blocked?.missingCapabilities)
          ? data.blocked.missingCapabilities.filter(
            (item: unknown) => typeof item === 'string' && item.trim(),
          )
          : [];
        const reasonText = reason ? `\n\nПричина: ${reason}` : '';
        const capabilityText = capabilities.length
          ? `\n\nНе хватает возможностей: ${capabilities.join(', ')}.`
          : '';
        dependencies.postMessage({
          type: 'apollo-generation-result',
          payload: {
            requestId: currentRequestId,
            blocked: true,
            text: `${message}${reasonText}${capabilityText}`,
          },
        });
        return;
      }
      const plan = parseApolloGenerationPlan(data.plan);
      dependencies.postMessage({
        type: 'apollo-generation-progress',
        payload: {
          requestId: currentRequestId,
          message: 'Собираем макет в Figma',
        },
      });

      const result = await executeApolloGenerationPlan(
        plan,
        dependencies.api,
        () => activeRequestId === currentRequestId,
      );
      if (activeRequestId !== currentRequestId) return;

      const warningText = plan.warnings.length
        ? `\n\nПредупреждения: ${plan.warnings.join(' ')}`
        : '';
      const preflightText =
        `План прошёл ${plan.preflight.checks.length} предгенерационных проверок.`;
      dependencies.postMessage({
        type: 'apollo-generation-result',
        payload: {
          requestId: currentRequestId,
          rootNodeId: result.rootNodeId,
          componentCount: result.componentCount,
          text:
            `${plan.summary}\n\n${preflightText}\n\nМакет создан и выделен на текущей странице. ` +
            `Действие можно отменить стандартной командой Undo в Figma.${warningText}`,
        },
      });
    } catch (error) {
      if (activeRequestId !== currentRequestId) return;
      dependencies.postMessage({
        type: 'apollo-generation-result',
        payload: {
          requestId: currentRequestId,
          error:
            error instanceof Error
              ? error.message
              : 'Не удалось создать макет.',
        },
      });
    } finally {
      if (activeRequestId === currentRequestId) {
        activeRequestId = null;
      }
    }
  }

  function cancel(requestId?: string | null): boolean {
    if (!requestId || requestId === activeRequestId) {
      activeRequestId = null;
      return true;
    }
    return false;
  }

  return { getProxyStatus, generate, cancel };
}
