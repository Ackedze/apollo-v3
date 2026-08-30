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
      targetName:
        evaluation.focusNodeName ||
        evaluation.subjectNodeName ||
        evaluation.focusNodeId,
    };
    return template.replace(
      /\{\{(actual|duplicates|expected|context|contextLabel|measured|targetFact|contextFact|nodeName|targetName)\}\}/g,
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
  return {
    title: 'Исполняемое правило не содержит presentation',
    observed: () => `RuleID: ${ruleId}.`,
    expectation: () =>
      'Каждое исполняемое правило должно содержать apollo.predicate-presentation.v1 в источнике истины.',
    action: () =>
      'Дополнить source package и пересобрать knowledge bundle ApolloProxyControl.',
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
