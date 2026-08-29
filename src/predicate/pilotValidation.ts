import type { ApolloPatternAuditReport } from '../stats/types';

export type ApolloPredicateTrace = {
  predicate: string;
  truth: 'true' | 'false' | 'unknown';
  reason: string;
  actual: unknown;
  expected: unknown;
  factPaths: string[];
  children?: ApolloPredicateTrace[];
};

function stablePresentationValueKey(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    return `[${value.map(stablePresentationValueKey).join(',')}]`;
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stablePresentationValueKey(record[key])}`)
      .join(',')}}`;
  }
  return `${typeof value}:${String(value)}`;
}

function duplicatePresentationValues(value: unknown): unknown[] {
  if (!Array.isArray(value)) return [];
  const counts = new Map<string, number>();
  value.forEach((item) => {
    const key = stablePresentationValueKey(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return value.filter((item) => (
    (counts.get(stablePresentationValueKey(item)) || 0) > 1
  ));
}

export type ApolloPredicateEvaluation = {
  evaluationId: string;
  ruleId: string;
  ruleRevision: number;
  subjectNodeId: string;
  subjectNodeName?: string;
  focusNodeId: string;
  focusNodeName?: string;
  applicability: 'applicable' | 'not-applicable' | 'unknown';
  classification:
    | 'violation'
    | 'compliant'
    | 'allowed'
    | 'human-review'
    | 'not-applicable'
    | 'not-evaluable';
  severity: 'error' | 'warning' | 'info';
  trace: ApolloPredicateTrace;
  actionId?: string | null;
  rootFindingId?: string;
  derivedFindingIds?: string[];
  causalGroupingReason?: string;
};

export type ApolloPredicateRuleManifestEntry = {
  ruleId: string;
  revision: number;
  severity: 'error' | 'warning' | 'info';
  source: {
    path: string;
    checksum: string;
    anchor?: string;
  };
  scope?: {
    platform?: string[];
    pageType?: string[];
  };
  presentation?: {
    schemaVersion: 'apollo.predicate-presentation.v1';
    title: string;
    observed: string;
    expectation: string;
    action: string;
    contextFact?: string;
    targetFact?: string;
    contextLabels?: Record<string, string>;
    valueLabels?: Record<string, string>;
  } | null;
};

export type ApolloPredicatePilotValidation = {
  rules: ApolloPredicateRuleManifestEntry[];
  repeatability?: {
    runCount: number;
    stable: boolean;
    resultHash: string;
  };
  result: {
    schemaVersion: 'apollo.predicate-result.v1';
    snapshotHash: string;
    ruleRelease: string;
    evaluations: ApolloPredicateEvaluation[];
    coverage: {
      total: number;
      byClassification: Record<string, number>;
      unclassified: number;
      duplicateEvaluationIds: number;
    };
  };
};

export type ApolloPredicateUiFinding = {
  id: string;
  nodeId: string;
  priority: 'error' | 'warning' | 'human_review' | 'allowed';
  verdict: 'confirmed' | 'assumption';
  title: string;
  observed: string;
  factPath: string;
  patternScope: 'general' | 'page-specific';
  rootFindingId?: string;
  derivedFindingIds?: string[];
  isConsequence?: boolean;
  causalGroupingReason?: string;
};

export type ApolloPredicateUiValidation = {
  responseMarkdown: string;
  findings: ApolloPredicateUiFinding[];
};

export type ApolloPredicateStatsReport = {
  schemaVersion: 1;
  reportKind: 'apollo-predicate-report';
  reportId: string;
  sourceReportId: string;
  generatedAt: string;
  suggestedFileName: string;
  user: ApolloPatternAuditReport['user'];
  plugin: ApolloPatternAuditReport['plugin'];
  figma: ApolloPatternAuditReport['figma'];
  scan: ApolloPatternAuditReport['scan'];
  summary: {
    ruleCount: number;
    evaluationCount: number;
    findingCount: number;
    byClassification: Record<string, number>;
    unclassified: number;
    duplicateEvaluationIds: number;
  };
  validation: ApolloPredicatePilotValidation;
  ui: ApolloPredicateUiValidation;
};

type RulePresentation = {
  title: string;
  observed?: (evaluation: ApolloPredicateEvaluation) => string;
  expectation: (evaluation: ApolloPredicateEvaluation) => string;
  action: (evaluation: ApolloPredicateEvaluation) => string;
};

const RULE_PRESENTATION: Record<string, RulePresentation> = {
  'component:web-corp.buttons-group.button-count': {
    title: 'Неверное количество кнопок в ButtonsGroup',
    observed: (evaluation) =>
      `В группе ${formatVisibleButtonCount(evaluation.trace.actual)}.`,
    expectation: () => 'В ButtonsGroup должно быть от двух до четырёх видимых кнопок.',
    action: () => 'Оставить в группе от двух до четырёх кнопок.',
  },
  'component:web.benefits.capacity-matches-card-count': {
    title: 'Количество BenefitCard не совпадает с Capacity',
    observed: (evaluation) => {
      const children = evaluation.trace.children || [];
      const capacity = traceActualForFact(children, 'composition.capacity');
      const count = traceActualForFact(
        children,
        'composition.visibleBenefitCardCount',
      );
      return `Capacity=${formatValue(capacity)}; видимых BenefitCard: ${formatValue(count)}.`;
    },
    expectation: () =>
      'Benefits должен содержать ровно три или четыре BenefitCard, а их количество должно совпадать с Capacity.',
    action: () =>
      'Выбрать Capacity, равный числу карточек; для другого количества использовать отдельные BenefitCard без Benefits.',
  },
  'component:web.benefits.nested-card-settings-are-uniform': {
    title: 'Настройки BenefitCard внутри Benefits различаются',
    observed: (evaluation) => {
      const propertyLabels = ['Background', 'CardAxis', 'Compact', 'GraphicPosition'];
      const differences = (evaluation.trace.children || [])
        .map((trace, index) => ({ trace, label: propertyLabels[index] }))
        .filter((entry) => entry.trace.truth === 'false')
        .map((entry) => {
          const values = Array.isArray(entry.trace.actual)
            ? entry.trace.actual.map(formatValue).join(' → ')
            : formatValue(entry.trace.actual);
          return `${entry.label}: ${values}`;
        });
      return differences.length
        ? `${differences.join('; ')}.`
        : 'Не удалось определить различающиеся настройки BenefitCard.';
    },
    expectation: () =>
      'Все BenefitCard внутри одного Benefits должны одинаково использовать Background, CardAxis, Compact и GraphicPosition.',
    action: () =>
      'Выбрать одинаковые значения Background, CardAxis, Compact и GraphicPosition у всех карточек группы.',
  },
  'component:web-corp.table-view.horizontal-multi-column-header-required': {
    title: 'В Horizontal TableView отсутствует строка заголовка',
    observed: (evaluation) =>
      `Compact=False; видимых строк Row / Presets=Header: ${formatValue(evaluation.trace.actual)}.`,
    expectation: () =>
      'Horizontal TableView с Compact=False должен содержать одну видимую строку Row / Presets=Header.',
    action: () =>
      'Вернуть или добавить строку Row с Presets=Header и Compact=False.',
  },
  'component:web-corp.table-view.compact-is-consistent-across-rows': {
    title: 'Row не соответствует Compact TableView',
    observed: (evaluation) => {
      const children = evaluation.trace.children || [];
      const compact = traceActualForFact(children, 'component.properties.Compact');
      const ownerCompact = traceExpectedForFact(
        children,
        'composition.tableViewOwner.component.properties.Compact',
      );
      const spacing = traceActualForFact(
        children,
        'composition.spacingVertical',
      );
      const expectedSpacing = traceExpectedForFact(
        children,
        'composition.expectedRowSpacing',
      );
      return `Row Compact=${formatValue(compact)}, spacing=${formatValue(spacing)} px; TableView Compact=${formatValue(ownerCompact)}, ожидаемый spacing=${formatValue(expectedSpacing)} px.`;
    },
    expectation: () =>
      'Все прямые Row должны повторять Compact корневого TableView: spacing 16 px для Compact=False и 12 px для Compact=True.',
    action: (evaluation) => {
      const children = evaluation.trace.children || [];
      const ownerCompact = traceExpectedForFact(
        children,
        'composition.tableViewOwner.component.properties.Compact',
      );
      const expectedSpacing = traceExpectedForFact(
        children,
        'composition.expectedRowSpacing',
      );
      return `Установить Row Compact=${formatValue(ownerCompact)} и spacing=${formatValue(expectedSpacing)} px.`;
    },
  },
  'component:web-corp.table-view.horizontal-compact-one-column': {
    title: 'В Compact TableView больше одной колонки данных',
    observed: (evaluation) =>
      `В строке найдено колонок данных: ${formatValue(evaluation.trace.actual)}.`,
    expectation: () =>
      'Каждая Row в Horizontal TableView с Compact=True должна содержать ровно одну Column.',
    action: () =>
      'Оставить в строке одну колонку данных или отключить Compact для многоколоночной таблицы.',
  },
  'rule:forms.construction-rules.block-spacing.second-level-actions': {
    title: 'Неверный отступ от контента формы до основных действий',
    observed: (evaluation) => {
      const expected = evaluation.trace.expected as {
        measured?: unknown;
      } | null;
      return `Вертикальный отступ от контента формы до основных действий: ${formatValue(expected?.measured)} px.`;
    },
    expectation: () =>
      'Между контентом формы и основными действиями должно быть 32 px.',
    action: () =>
      'Установить вертикальный отступ перед основными действиями 32 px.',
  },
  'rule:forms.construction-rules.title-medium-one-per-plate': {
    title: 'Лишний TitleView Medium на подложке формы',
    observed: (evaluation) =>
      `Заголовок занимает позицию ${formatValue(evaluation.trace.actual)} среди TitleView Medium этой подложки.`,
    expectation: () =>
      'На одной подложке формы допускается не более одного TitleView Medium.',
    action: () =>
      'Оставить один главный TitleView Medium, а дополнительный заголовок перевести на следующий уровень иерархии.',
  },
  'rule:forms.construction-rules.inner-padding-standard.title-to-content': {
    title: 'Неверный отступ от TitleView Medium до контента',
    observed: (evaluation) => {
      const expected = evaluation.trace.expected as {
        measured?: unknown;
      } | null;
      return `Вертикальный отступ от заголовка до первого контентного блока: ${formatValue(expected?.measured)} px.`;
    },
    expectation: () =>
      'От TitleView Medium до первого контентного блока должно быть 24 px.',
    action: () =>
      'Установить вертикальный отступ между TitleView Medium и контентом 24 px.',
  },
  'rule:forms.construction-rules.inner-padding-standard.content-insets': {
    title: 'Неверные внутренние отступы блока формы',
    observed: (evaluation) => {
      const children = evaluation.trace.children || [];
      const top = traceActualForFact(
        children,
        'composition.formFirstLevelSurface.contentInsets.top',
      );
      const right = traceActualForFact(
        children,
        'composition.formFirstLevelSurface.contentInsets.right',
      );
      const bottom = traceActualForFact(
        children,
        'composition.formFirstLevelSurface.contentInsets.bottom',
      );
      const left = traceActualForFact(
        children,
        'composition.formFirstLevelSurface.contentInsets.left',
      );
      return `Сверху: ${formatValue(top)} px; справа: ${formatValue(right)} px; снизу: ${formatValue(bottom)} px; слева: ${formatValue(left)} px.`;
    },
    expectation: () =>
      'В стандартном блоке формы внутренние отступы сверху, справа, снизу и слева должны быть 32 px.',
    action: () =>
      'Установить внутренние отступы блока 32 px.',
  },
  'rule:forms.construction-rules.layout-8-4.geometry': {
    title: 'Нарушена сетка формы 8 + 4',
    observed: (evaluation) => {
      const children = evaluation.trace.children || [];
      const gap = traceActualForFact(
        children,
        'composition.formEightFourLayout.gutter',
      );
      const mainWidth = traceActualForFact(
        children,
        'composition.formEightFourLayout.mainWidth',
      );
      const expectedMainWidth = traceExpectedForFact(
        children,
        'composition.formEightFourLayout.mainWidth',
      );
      const islandWidth = traceActualForFact(
        children,
        'composition.formEightFourLayout.islandWidth',
      );
      const expectedIslandWidth = traceExpectedForFact(
        children,
        'composition.formEightFourLayout.islandWidth',
      );
      return `Основная зона: ${formatValue(mainWidth)} px вместо ${formatValue(expectedMainWidth)} px; островок: ${formatValue(islandWidth)} px вместо ${formatValue(expectedIslandWidth)} px; расстояние: ${formatValue(gap)} px.`;
    },
    expectation: () =>
      'На desktop-форме основная зона должна занимать 8 колонок, островок — 4 колонки, а расстояние между ними — 24 px.',
    action: () =>
      'Восстановить пропорции сетки 8 + 4 и расстояние 24 px.',
  },
  'rule:controls.buttons-and-button-groups.desktop-safe-variants': {
    title: 'В desktop используется запрещённый View кнопки',
    observed: (evaluation) =>
      `У кнопки выбран View=${formatValue(evaluation.trace.children?.[0]?.actual)}.`,
    expectation: () =>
      'На desktop нельзя использовать Button с View=Accent или View=Outlined.',
    action: () => 'Выбрать допустимый desktop-вариант кнопки.',
  },
  'component:web-corp.buttons-group.allowed-views': {
    title: 'Недопустимый вариант вложенной кнопки',
    expectation: () => 'View вложенной кнопки должен быть Primary или Secondary.',
    action: () => 'Выбрать View=Primary или View=Secondary.',
  },
  'component:web-corp.buttons-group.uniform-size': {
    title: 'Размер вложенной кнопки не совпадает с ButtonsGroup',
    expectation: (evaluation) =>
      `Size вложенной кнопки должен совпадать с Size группы: ${formatValue(evaluation.trace.expected)}.`,
    action: (evaluation) =>
      `Вернуть Size=${formatValue(evaluation.trace.expected)}.`,
  },
  'component:web-corp.buttons-group.single-icon-position': {
    title: 'SingleIcon расположен неправильно',
    observed: (evaluation) => {
      const overflow = evaluation.trace.children?.[0]?.actual;
      const sequence = evaluation.trace.children?.[1]?.actual;
      const ordered = Array.isArray(sequence)
        ? sequence.map(formatValue).join(' → ')
        : formatValue(sequence);
      return `Overflow=${formatValue(overflow)}; порядок SingleIcon: ${ordered}.`;
    },
    expectation: () =>
      'SingleIcon=true допускается только у последней кнопки при Overflow=true и только один раз.',
    action: () =>
      'Оставить SingleIcon=true только у последней кнопки или отключить SingleIcon.',
  },
  'component:web-corp.title-view.title-and-subtitle-typography-is-fixed': {
    title: 'Изменена фиксированная типографика TitleView',
    observed: (evaluation) => {
      const baselineTrace = evaluation.trace.children?.find((trace) => (
        trace.predicate === 'matches-effective-baseline'
      ));
      const actual = baselineTrace?.actual ?? evaluation.trace.actual;
      const expected = baselineTrace?.expected ?? evaluation.trace.expected;
      const existsTrace = evaluation.trace.children?.find((trace) => (
        trace.predicate === 'exists'
      ));
      if (existsTrace?.truth === 'false') {
        return 'У Title или Subtitle отсутствует текстовый стиль.';
      }
      if (isUnavailableTraceValue(expected)) {
        return `Текущий стиль: ${formatValue(actual)}; effective baseline не удалось определить.`;
      }
      return `Стиль текста изменён с ${formatValue(expected)} на ${formatValue(actual)}.`;
    },
    expectation: (evaluation) => {
      const baselineTrace = evaluation.trace.children?.find((trace) => (
        trace.predicate === 'matches-effective-baseline'
      ));
      const expected = baselineTrace?.expected ?? evaluation.trace.expected;
      const existsTrace = evaluation.trace.children?.find((trace) => (
        trace.predicate === 'exists'
      ));
      if (existsTrace?.truth === 'false') {
        return 'Title и Subtitle должны сохранять текстовый стиль, заданный контрактом TitleView.';
      }
      if (isUnavailableTraceValue(expected)) {
        return 'Для проверки фиксированной типографики нужен доступный effective baseline TitleView.';
      }
      return `Title и Subtitle должны использовать стиль effective baseline: ${formatValue(expected)}.`;
    },
    action: (evaluation) => {
      const baselineTrace = evaluation.trace.children?.find((trace) => (
        trace.predicate === 'matches-effective-baseline'
      ));
      const expected = baselineTrace?.expected ?? evaluation.trace.expected;
      const existsTrace = evaluation.trace.children?.find((trace) => (
        trace.predicate === 'exists'
      ));
      if (existsTrace?.truth === 'false') {
        return 'Сбросить типографику Title или Subtitle к компоненту.';
      }
      if (isUnavailableTraceValue(expected)) {
        return 'Проверить контракт и generated baseline TitleView.';
      }
      return `Вернуть стиль ${formatValue(expected)}.`;
    },
  },
  'component:web-corp.title-view.status-and-title-status-color-match': {
    title: 'Типы Status и TitleStatus не совпадают',
    observed: (evaluation) => {
      const values = Array.isArray(evaluation.trace.actual)
        ? evaluation.trace.actual.map(formatValue)
        : [formatValue(evaluation.trace.actual)];
      return `Status.Type → TitleStatus.Type: ${values.join(' → ')}.`;
    },
    expectation: () =>
      'При одновременно видимых Status и TitleStatus их Type должен совпадать.',
    action: (evaluation) => {
      const values = Array.isArray(evaluation.trace.actual)
        ? evaluation.trace.actual
        : [];
      return `Установить TitleStatus.Type=${formatValue(values[0])}.`;
    },
  },
  'component:web-corp.title-view.visible-slots-follow-required-order': {
    title: 'Нарушен порядок слотов TitleView',
    observed: (evaluation) => {
      const role = evaluation.trace.children?.[1]?.actual;
      const previousRole = evaluation.trace.children?.[2]?.actual;
      return `Слот ${formatValue(role)} расположен раньше обязательного предшественника ${formatValue(previousRole)}.`;
    },
    expectation: () =>
      'Видимые слоты должны сохранять порядок Status → Heading → Holding → Subtitle → TitleStatus → Button group.',
    action: () => 'Восстановить канонический порядок слотов TitleView.',
  },
  'component:web-corp.background-plate.level-2-requires-level-1': {
    title: 'BackgroundPlate Level 2 находится без корректной подложки Level 1',
    observed: (evaluation) => {
      const children = evaluation.trace.children || [];
      const underlayPositioning = traceActualForFact(
        children,
        'composition.level1Underlay.layout.positioning',
      );
      const contentPositioning = traceActualForFact(
        children,
        'composition.level1Underlay.contentLayout.positioning',
      );
      const order = children.find((trace) => trace.predicate === 'after')?.truth;
      const containment = children.find((trace) => trace.predicate === 'contains')?.truth;
      if (isUnavailableTraceValue(underlayPositioning)) {
        return 'В общем Auto Layout не найден BackgroundPlate Level 1, который можно подтвердить как подложку.';
      }
      return `Level 1 positioning=${formatValue(underlayPositioning)}; content-ветка positioning=${formatValue(contentPositioning)}; Level 1 расположен ниже=${formatTruth(order)}; Level 1 содержит Level 2=${formatTruth(containment)}.`;
    },
    expectation: () =>
      'Level 1 и content-ветка с Level 2 должны находиться в общем Auto Layout: Level 1 — ABSOLUTE-подложка перед content-веткой, а его границы должны содержать Level 2.',
    action: () =>
      'Собрать общий Auto Layout, перевести Level 1 в Absolute и разместить его первым; content-ветку с Level 2 оставить в Auto Layout поверх него.',
  },
};

function findTraceForFact(
  trace: ApolloPredicateTrace,
  factPath: string,
  preferredTruth: ApolloPredicateTrace['truth'][] = [],
): ApolloPredicateTrace | undefined {
  const matches: ApolloPredicateTrace[] = [];
  const visit = (candidate: ApolloPredicateTrace): void => {
    if (
      candidate.factPaths.includes(factPath) &&
      !(candidate.children || []).length
    ) {
      matches.push(candidate);
    }
    for (const child of candidate.children || []) visit(child);
  };
  visit(trace);
  return preferredTruth
    .map((truth) => matches.find((candidate) => candidate.truth === truth))
    .find(Boolean) || matches[0];
}

function traceActualForFact(
  traces: ApolloPredicateTrace[],
  factPath: string,
): unknown {
  return traces.find((trace) => trace.factPaths.includes(factPath))?.actual;
}

function traceExpectedForFact(
  traces: ApolloPredicateTrace[],
  factPath: string,
): unknown {
  return traces.find((trace) => trace.factPaths.includes(factPath))?.expected;
}

function formatTruth(value: ApolloPredicateTrace['truth'] | undefined): string {
  if (value === 'true') return 'да';
  if (value === 'false') return 'нет';
  return 'неизвестно';
}

function isUnavailableTraceValue(value: unknown): boolean {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof (value as { state?: unknown }).state === 'string',
  );
}

function formatValue(value: unknown): string {
  if (value === undefined) return 'неизвестно';
  if (value === null) return 'null';
  if (isUnavailableTraceValue(value)) {
    const state = (value as { state: string }).state;
    if (state === 'absent') return 'отсутствует';
    return 'неизвестно';
  }
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
}

function formatVisibleButtonCount(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return `неизвестное количество видимых кнопок: ${formatValue(value)}`;
  }
  const integer = Math.trunc(value);
  const lastTwo = Math.abs(integer) % 100;
  const last = Math.abs(integer) % 10;
  if (lastTwo < 11 || lastTwo > 14) {
    if (last === 1) return `${integer} видимая кнопка`;
    if (last >= 2 && last <= 4) return `${integer} видимые кнопки`;
  }
  return `${integer} видимых кнопок`;
}

function compactSourcePath(path: string): string {
  const parts = String(path || '')
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean);
  return parts.slice(-2).join('/');
}

function markdownCell(value: string): string {
  return value
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

function priorityFor(
  classification: ApolloPredicateEvaluation['classification'],
  severity: ApolloPredicateEvaluation['severity'],
): ApolloPredicateUiFinding['priority'] | null {
  if (classification === 'violation') {
    return severity === 'warning' ? 'warning' : 'error';
  }
  if (classification === 'human-review' || classification === 'not-evaluable') {
    return 'human_review';
  }
  if (classification === 'allowed') return 'allowed';
  return null;
}

function statusLabel(priority: ApolloPredicateUiFinding['priority']): string {
  if (priority === 'error') return 'Ошибка';
  if (priority === 'warning') return 'Предупреждение';
  if (priority === 'allowed') return 'Ок';
  return 'Зови ДС';
}

function presentationFromManifest(
  manifest: ApolloPredicateRuleManifestEntry | undefined,
): RulePresentation | null {
  const declaration = manifest?.presentation;
  if (
    !declaration ||
    declaration.schemaVersion !== 'apollo.predicate-presentation.v1'
  ) return null;

  const render = (
    template: string,
    evaluation: ApolloPredicateEvaluation,
  ): string => {
    const contextTrace = declaration.contextFact
      ? findTraceForFact(evaluation.trace, declaration.contextFact, ['true'])
      : undefined;
    const targetTrace = declaration.targetFact
      ? findTraceForFact(
          evaluation.trace,
          declaration.targetFact,
          ['false', 'unknown'],
        )
      : undefined;
    const context = formatValue(contextTrace?.actual);
    const contextLabel = declaration.contextLabels?.[String(contextTrace?.actual)]
      || context;
    const formatDeclaredValue = (value: unknown): string => {
      if (Array.isArray(value)) {
        return value
          .map((entry) => (
            declaration.valueLabels?.[String(entry)] || formatValue(entry)
          ))
          .join(', ');
      }
      return declaration.valueLabels?.[String(value)] || formatValue(value);
    };
    const values: Record<string, string> = {
      actual: formatDeclaredValue(
        targetTrace?.actual ?? evaluation.trace.actual,
      ),
      duplicates: formatDeclaredValue(
        duplicatePresentationValues(
          targetTrace?.actual ?? evaluation.trace.actual,
        ),
      ),
      expected: formatDeclaredValue(
        targetTrace?.expected ?? evaluation.trace.expected,
      ),
      context,
      contextLabel,
      measured: formatDeclaredValue(
        evaluation.trace.expected &&
        typeof evaluation.trace.expected === 'object' &&
        !Array.isArray(evaluation.trace.expected)
          ? (evaluation.trace.expected as { measured?: unknown }).measured
          : undefined,
      ),
      targetFact: declaration.targetFact || '',
      contextFact: declaration.contextFact || '',
      nodeName:
        evaluation.focusNodeName ||
        evaluation.subjectNodeName ||
        evaluation.focusNodeId,
    };
    return template.replace(
      /\{\{(actual|duplicates|expected|context|contextLabel|measured|targetFact|contextFact|nodeName)\}\}/g,
      (_match, token: string) => values[token] || '',
    );
  };

  return {
    title: declaration.title,
    observed: (evaluation) => render(declaration.observed, evaluation),
    expectation: (evaluation) => render(declaration.expectation, evaluation),
    action: (evaluation) => render(declaration.action, evaluation),
  };
}

function getPresentation(
  ruleId: string,
  manifest?: ApolloPredicateRuleManifestEntry,
): RulePresentation {
  const declared = presentationFromManifest(manifest);
  if (declared) return declared;
  const backgroundPlatePaddingPrefix =
    'component:web-corp.background-plate.padding-uses-spacing-tokens.';
  if (ruleId.startsWith(backgroundPlatePaddingPrefix)) {
    const side = ruleId.slice(backgroundPlatePaddingPrefix.length);
    const sideLabel: Record<string, string> = {
      top: 'Верхний',
      right: 'Правый',
      bottom: 'Нижний',
      left: 'Левый',
    };
    return {
      title: `${sideLabel[side] || side} padding задан без Spacing token`,
      observed: (evaluation) => {
        const actual = evaluation.trace.actual as {
          bound?: boolean;
          value?: unknown;
          collection?: string | null;
          token?: string | null;
        } | null;
        const value = formatValue(actual?.value);
        if (actual?.bound) {
          return `${value} px привязан к ${formatValue(actual.collection)}/${formatValue(actual.token)}.`;
        }
        return `${value} px задан как raw-значение без token binding.`;
      },
      expectation: () =>
        'Каждый layout.padding.* должен быть привязан к токену коллекции Spacing.',
      action: (evaluation) => {
        const actual = evaluation.trace.actual as { value?: unknown } | null;
        return `Привязать значение ${formatValue(actual?.value)} к соответствующему токену Spacing.`;
      },
    };
  }
  const known = RULE_PRESENTATION[ruleId];
  if (known) return known;
  return {
    title: 'Нарушено правило дизайн-системы',
    expectation: (evaluation) =>
      `Ожидаемое значение: ${formatValue(evaluation.trace.expected)}.`,
    action: () => 'Проверить значение по указанному правилу.',
  };
}

function missingFactPresentation(
  evaluation: ApolloPredicateEvaluation,
): RulePresentation | null {
  if (
    evaluation.classification !== 'not-evaluable' ||
    evaluation.trace.reason !== 'comparison value is absent'
  ) return null;

  const factPath = evaluation.trace.factPaths[0] || evaluation.trace.predicate;
  const factLabel = factPath.split('.').filter(Boolean).pop() || 'факта';
  const nodeLabel = (
    evaluation.focusNodeName ||
    evaluation.subjectNodeName ||
    evaluation.focusNodeId
  )
    .replace(/^(?:PASS|FAIL)\s*·\s*/i, '')
    .replace(/\[D\]\s*/g, '')
    .replace(/\s*·\s*/g, ' ')
    .trim();
  const subject = nodeLabel ? ` у ${nodeLabel}` : '';

  return {
    title: `Недостаточно данных для проверки ${factLabel}${subject}`,
    observed: () =>
      `В снапшоте отсутствует значение ${factLabel}${subject}.`,
    expectation: () =>
      `Для применения правила необходимо получить ${factPath}.`,
    action: () =>
      `Повторно получить данные компонента и проверить передачу свойства ${factLabel}.`,
  };
}

function getPatternScope(
  manifest: ApolloPredicateRuleManifestEntry | undefined,
): ApolloPredicateUiFinding['patternScope'] {
  return manifest?.scope?.pageType?.length ? 'page-specific' : 'general';
}

export function buildApolloPredicateUiValidation(
  validation: ApolloPredicatePilotValidation,
): ApolloPredicateUiValidation {
  const rules = new Map(
    validation.rules.map((rule) => [rule.ruleId, rule] as const),
  );
  const evaluations = validation.result.evaluations
    .filter(
      (evaluation) =>
        !(
          evaluation.classification === 'not-evaluable' &&
          evaluation.trace.reason === 'selector evidence is unknown'
        ),
    )
    .map((evaluation) => ({
      evaluation,
      priority: priorityFor(evaluation.classification, evaluation.severity),
    }))
    .filter(
      (entry): entry is {
        evaluation: ApolloPredicateEvaluation;
        priority: ApolloPredicateUiFinding['priority'];
      } => entry.priority !== null,
    )
    .sort((left, right) => {
      const order = { error: 0, warning: 1, human_review: 1, allowed: 2 };
      const leftRoot = left.evaluation.rootFindingId || left.evaluation.evaluationId;
      const rightRoot = right.evaluation.rootFindingId || right.evaluation.evaluationId;
      if (leftRoot === rightRoot) {
        const leftIsRoot = left.evaluation.evaluationId === leftRoot ? 0 : 1;
        const rightIsRoot = right.evaluation.evaluationId === rightRoot ? 0 : 1;
        if (leftIsRoot !== rightIsRoot) return leftIsRoot - rightIsRoot;
      }
      return (
        order[left.priority] - order[right.priority] ||
        left.evaluation.focusNodeId.localeCompare(
          right.evaluation.focusNodeId,
        ) ||
        left.evaluation.ruleId.localeCompare(right.evaluation.ruleId)
      );
    });

  if (!evaluations.length) {
    return {
      responseMarkdown: 'Нарушений не найдено.',
      findings: [],
    };
  }

  const findings: ApolloPredicateUiFinding[] = [];
  const rowsByScope: Record<
    ApolloPredicateUiFinding['patternScope'],
    string[][]
  > = {
    general: [],
    'page-specific': [],
  };
  evaluations.forEach(({ evaluation, priority }) => {
    const manifest = rules.get(evaluation.ruleId);
    const presentation = missingFactPresentation(evaluation) ||
      getPresentation(evaluation.ruleId, manifest);
    const patternScope = getPatternScope(manifest);
    const actual = formatValue(evaluation.trace.actual);
    const factPath = evaluation.trace.factPaths[0] || evaluation.trace.predicate;
    const observed = presentation.observed
      ? presentation.observed(evaluation)
      : `${factPath}: ${actual}`;
    const isConsequence = Boolean(
      evaluation.rootFindingId
      && evaluation.rootFindingId !== evaluation.evaluationId,
    );
    const renderedObserved = isConsequence
      ? `Следствие корневой ошибки. ${observed}`
      : observed;
    const source = compactSourcePath(manifest?.source.path || evaluation.ruleId);
    findings.push({
      id: evaluation.evaluationId,
      nodeId: evaluation.focusNodeId,
      priority,
      verdict: priority === 'human_review' ? 'assumption' : 'confirmed',
      title: presentation.title,
      observed: renderedObserved,
      factPath,
      patternScope,
      rootFindingId: evaluation.rootFindingId,
      derivedFindingIds: evaluation.derivedFindingIds,
      isConsequence,
      causalGroupingReason: evaluation.causalGroupingReason,
    });
    rowsByScope[patternScope].push([
      statusLabel(priority),
      `${presentation.title}<br>${renderedObserved}`,
      `${presentation.expectation(evaluation)}<br>${source}`,
      presentation.action(evaluation),
    ].map(markdownCell));
  });

  const header = [
    '| Статус | Причина | Ожидание | Действие |',
    '| --- | --- | --- | --- |',
  ];
  const section = (
    title: string,
    rows: string[][],
  ): string[] => [
    `## ${title}`,
    ...header,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ];
  return {
    responseMarkdown: [
      ...section('Общие паттерны', rowsByScope.general),
      '',
      ...section('Паттерны страницы', rowsByScope['page-specific']),
    ].join('\n'),
    findings,
  };
}

export function buildApolloPredicateStatsReport(
  report: ApolloPatternAuditReport,
  validation: ApolloPredicatePilotValidation,
  ui: ApolloPredicateUiValidation,
): ApolloPredicateStatsReport {
  return {
    schemaVersion: 1,
    reportKind: 'apollo-predicate-report',
    reportId: `${report.sourceReportId}:predicates:${validation.result.snapshotHash}`,
    sourceReportId: report.sourceReportId,
    generatedAt: new Date().toISOString(),
    suggestedFileName: getPredicateReportFileName(report.suggestedFileName),
    user: report.user,
    plugin: report.plugin,
    figma: report.figma,
    scan: report.scan,
    summary: {
      ruleCount: validation.rules.length,
      evaluationCount: validation.result.evaluations.length,
      findingCount: ui.findings.length,
      byClassification: validation.result.coverage.byClassification,
      unclassified: validation.result.coverage.unclassified,
      duplicateEvaluationIds:
        validation.result.coverage.duplicateEvaluationIds,
    },
    validation,
    ui,
  };
}

function getPredicateReportFileName(fileName: string): string {
  const suffixes = [
    '_patterns.json',
    '_agent.json',
    '_customizations-wip.json',
    '.json',
  ];
  for (const suffix of suffixes) {
    if (fileName.endsWith(suffix)) {
      return `${fileName.slice(0, -suffix.length)}_predicates.json`;
    }
  }
  return `${fileName}_predicates.json`;
}
