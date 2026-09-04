export const APOLLO_GENERATION_PLAN_SCHEMA = 'apollo.generation-plan.v5';

export type ApolloGenerationWidth = number | 'fill';
export type ApolloGenerationPlacement = 'append' | 'replace-slot' | 'swap-instance';
export type ApolloGenerationOccurrence = number | null;

export type ApolloGenerationTextOverride = {
  path: string;
  occurrence?: number;
  nodeTypes?: string[];
  semanticTarget?: string;
  value: string;
};

export type ApolloGenerationNodeOverride = {
  path: string;
  occurrence: number;
  nodeTypes: string[];
  semanticTarget: string;
  visible: boolean;
};

export type ApolloGenerationInstancePropertyOverride = {
  path: string;
  occurrence: number;
  nodeTypes: string[];
  semanticTarget: string;
  properties: Array<{ name: string; value: string | boolean }>;
};

export type ApolloGenerationFrameNode = {
  id: string;
  type: 'frame';
  parentId: string | null;
  name: string;
  semanticRole: string;
  placement: ApolloGenerationPlacement;
  parentPath: string | null;
  parentOccurrence?: ApolloGenerationOccurrence;
  parentSemanticTarget?: string | null;
  width: ApolloGenerationWidth;
  minHeight?: number;
  layout: 'vertical' | 'horizontal';
  gap: number;
  padding: number;
  fillVariableKey: string | null;
  fillVariableName: string | null;
  cornerRadius: number;
};

export type ApolloGenerationComponentNode = {
  id: string;
  type: 'component';
  parentId: string;
  name: string;
  semanticRole: string;
  semanticComponentId: string;
  placement: ApolloGenerationPlacement;
  parentPath: string | null;
  parentOccurrence?: ApolloGenerationOccurrence;
  parentSemanticTarget?: string | null;
  componentId: string;
  componentKey: string;
  width: ApolloGenerationWidth;
  knowledgePath: string;
  presentation: 'inline' | 'modal';
  variantProperties: Array<{ name: string; value: string | boolean }>;
  textOverrides: ApolloGenerationTextOverride[];
  preconditionOverrides: ApolloGenerationInstancePropertyOverride[];
  nodeOverrides: ApolloGenerationNodeOverride[];
  instancePropertyOverrides: ApolloGenerationInstancePropertyOverride[];
};

export type ApolloGenerationNode =
  | ApolloGenerationFrameNode
  | ApolloGenerationComponentNode;

export type ApolloGenerationPlan = {
  schemaVersion: typeof APOLLO_GENERATION_PLAN_SCHEMA;
  title: string;
  summary: string;
  kind: 'recipe' | 'pattern';
  recipe: string | null;
  pattern: {
    id: string;
    key: string;
    name: string;
    sourcePath: string;
    sourceChecksum: string;
    ruleIds: string[];
  } | null;
  platform: 'desktop' | 'mobile-web';
  knowledge: {
    primarySource: 'ds-ai-hub';
    technicalSource: 'design-system_ab';
    retrieval: {
      schemaVersion: 'apollo.generation-context.v3';
      packetChecksum: string;
      documentCount: number;
      packetChars: number;
      patternIds: string[];
      componentIds: string[];
    } | null;
    catalogRoot: string;
    componentCount: number;
    sources: Array<{
      source: 'ds-ai-hub' | 'design-system_ab';
      path: string;
      role: string;
      purpose: string;
      ruleIds: string[];
      checksum: string | null;
    }>;
  };
  warnings: string[];
  preflight: {
    schemaVersion: 'apollo.generation-preflight.v1';
    status: 'passed';
    intent: Record<string, unknown>;
    checks: Array<{
      id: string;
      status: 'pass';
      message: string;
      evidence: unknown;
    }>;
  };
  nodes: ApolloGenerationNode[];
};

const MAX_GENERATION_NODES = 64;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isText(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function isNumberBetween(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum;
}

function isWidth(value: unknown): value is ApolloGenerationWidth {
  return value === 'fill' || isNumberBetween(value, 120, 1920);
}

function isFigmaKey(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{40}$/i.test(value);
}

function isFrameNode(value: unknown): value is ApolloGenerationFrameNode {
  if (!isRecord(value) || value.type !== 'frame') return false;
  return (
    isText(value.id, 80) &&
    (value.parentId === null || isText(value.parentId, 80)) &&
    isText(value.name, 160) &&
    isText(value.semanticRole, 80) &&
    (value.placement === 'append' || value.placement === 'replace-slot') &&
    (value.placement === 'append' ? value.parentPath === null : isText(value.parentPath, 500)) &&
    (value.parentOccurrence === undefined || value.parentOccurrence === null || isNumberBetween(value.parentOccurrence, 0, 255)) &&
    (value.parentSemanticTarget === undefined || value.parentSemanticTarget === null || isText(value.parentSemanticTarget, 200)) &&
    isWidth(value.width) &&
    (value.minHeight === undefined || isNumberBetween(value.minHeight, 1, 2160)) &&
    (value.layout === 'vertical' || value.layout === 'horizontal') &&
    isNumberBetween(value.gap, 0, 128) &&
    isNumberBetween(value.padding, 0, 160) &&
    (value.fillVariableKey === null || isFigmaKey(value.fillVariableKey)) &&
    (value.fillVariableName === null || isText(value.fillVariableName, 200)) &&
    isNumberBetween(value.cornerRadius, 0, 160)
  );
}

function isNameValuePair(value: unknown): boolean {
  return (
    isRecord(value) &&
    isText(value.name, 200) &&
    (typeof value.value === 'boolean' || isText(value.value, 500))
  );
}

function isTextOverride(value: unknown): boolean {
  return (
    isRecord(value) &&
    isText(value.path, 500) &&
    (value.occurrence === undefined || isNumberBetween(value.occurrence, 0, 255)) &&
    (value.nodeTypes === undefined || (
      Array.isArray(value.nodeTypes) &&
      value.nodeTypes.length >= 1 &&
      value.nodeTypes.length <= 8 &&
      value.nodeTypes.every((item) => isText(item, 40))
    )) &&
    (value.semanticTarget === undefined || isText(value.semanticTarget, 200)) &&
    isText(value.value, 2000)
  );
}

function isNodeOverride(value: unknown): boolean {
  return (
    isRecord(value) &&
    isText(value.path, 500) &&
    isNumberBetween(value.occurrence, 0, 255) &&
    Array.isArray(value.nodeTypes) &&
    value.nodeTypes.length >= 1 &&
    value.nodeTypes.length <= 8 &&
    value.nodeTypes.every((item) => isText(item, 40)) &&
    isText(value.semanticTarget, 200) &&
    typeof value.visible === 'boolean'
  );
}

function isInstancePropertyOverride(value: unknown): boolean {
  return (
    isRecord(value) &&
    isText(value.path, 500) &&
    isNumberBetween(value.occurrence, 0, 255) &&
    Array.isArray(value.nodeTypes) &&
    value.nodeTypes.length >= 1 &&
    value.nodeTypes.length <= 8 &&
    value.nodeTypes.every((item) => isText(item, 40)) &&
    isText(value.semanticTarget, 200) &&
    Array.isArray(value.properties) &&
    value.properties.length >= 1 &&
    value.properties.length <= 16 &&
    value.properties.every(isNameValuePair)
  );
}

function isComponentNode(value: unknown): value is ApolloGenerationComponentNode {
  if (!isRecord(value) || value.type !== 'component') return false;
  return (
    isText(value.id, 80) &&
    isText(value.parentId, 80) &&
    isText(value.name, 160) &&
    isText(value.semanticRole, 80) &&
    isText(value.semanticComponentId, 200) &&
    ['append', 'swap-instance'].includes(String(value.placement)) &&
    (value.placement === 'append' ? value.parentPath === null : isText(value.parentPath, 500)) &&
    (value.parentOccurrence === undefined || value.parentOccurrence === null || isNumberBetween(value.parentOccurrence, 0, 255)) &&
    (value.parentSemanticTarget === undefined || value.parentSemanticTarget === null || isText(value.parentSemanticTarget, 200)) &&
    isText(value.componentId, 200) &&
    typeof value.componentKey === 'string' &&
    isFigmaKey(value.componentKey) &&
    isWidth(value.width) &&
    isText(value.knowledgePath, 500) &&
    (value.presentation === 'inline' || value.presentation === 'modal') &&
    Array.isArray(value.variantProperties) &&
    value.variantProperties.length <= 40 &&
    value.variantProperties.every(isNameValuePair) &&
    Array.isArray(value.textOverrides) &&
    value.textOverrides.length <= 40 &&
    value.textOverrides.every(isTextOverride) &&
    Array.isArray(value.preconditionOverrides) &&
    value.preconditionOverrides.length <= 80 &&
    value.preconditionOverrides.every(isInstancePropertyOverride) &&
    Array.isArray(value.nodeOverrides) &&
    value.nodeOverrides.length <= 80 &&
    value.nodeOverrides.every(isNodeOverride) &&
    Array.isArray(value.instancePropertyOverrides) &&
    value.instancePropertyOverrides.length <= 80 &&
    value.instancePropertyOverrides.every(isInstancePropertyOverride)
  );
}

function isKnowledgeSource(value: unknown): boolean {
  return (
    isRecord(value) &&
    (value.source === 'ds-ai-hub' || value.source === 'design-system_ab') &&
    isText(value.path, 500) &&
    isText(value.role, 100) &&
    isText(value.purpose, 500) &&
    Array.isArray(value.ruleIds) &&
    value.ruleIds.length <= 100 &&
    value.ruleIds.every((ruleId) => isText(ruleId, 300)) &&
    (value.checksum === null || /^[a-f0-9]{64}$/i.test(String(value.checksum)))
  );
}

function isRetrievalTrace(value: unknown): boolean {
  return (
    value === null ||
    (
      isRecord(value) &&
      value.schemaVersion === 'apollo.generation-context.v3' &&
      /^[a-f0-9]{64}$/i.test(String(value.packetChecksum || '')) &&
      isNumberBetween(value.documentCount, 1, 256) &&
      isNumberBetween(value.packetChars, 1, 500000) &&
      Array.isArray(value.patternIds) &&
      value.patternIds.length <= 16 &&
      value.patternIds.every((item) => isText(item, 200)) &&
      Array.isArray(value.componentIds) &&
      value.componentIds.length <= 40 &&
      value.componentIds.every((item) => isText(item, 200))
    )
  );
}

function isPatternReference(value: unknown): boolean {
  return (
    isRecord(value) &&
    isText(value.id, 200) &&
    isText(value.key, 200) &&
    isText(value.name, 200) &&
    isText(value.sourcePath, 500) &&
    /^[a-f0-9]{64}$/i.test(String(value.sourceChecksum || '')) &&
    Array.isArray(value.ruleIds) &&
    value.ruleIds.length > 0 &&
    value.ruleIds.length <= 100 &&
    value.ruleIds.every((ruleId) => isText(ruleId, 300))
  );
}

function isPreflight(value: unknown): boolean {
  return (
    isRecord(value) &&
    value.schemaVersion === 'apollo.generation-preflight.v1' &&
    value.status === 'passed' &&
    isRecord(value.intent) &&
    Array.isArray(value.checks) &&
    value.checks.length >= 1 &&
    value.checks.length <= 128 &&
    value.checks.every((check) =>
      isRecord(check) &&
      isText(check.id, 200) &&
      check.status === 'pass' &&
      isText(check.message, 1000)
    )
  );
}

export function parseApolloGenerationPlan(value: unknown): ApolloGenerationPlan {
  if (!isRecord(value) || value.schemaVersion !== APOLLO_GENERATION_PLAN_SCHEMA) {
    throw new Error('Apollo Proxy вернул неподдерживаемую версию плана генерации.');
  }
  if (
    !isText(value.title, 160) ||
    !isText(value.summary, 500) ||
    (value.kind !== 'recipe' && value.kind !== 'pattern') ||
    (value.kind === 'pattern'
      ? value.recipe !== null || !isPatternReference(value.pattern)
      : !isText(value.recipe, 80) || value.pattern !== null) ||
    (value.platform !== 'desktop' && value.platform !== 'mobile-web') ||
    !isRecord(value.knowledge) ||
    value.knowledge.primarySource !== 'ds-ai-hub' ||
    value.knowledge.technicalSource !== 'design-system_ab' ||
    !isRetrievalTrace(value.knowledge.retrieval) ||
    !isText(value.knowledge.catalogRoot, 500) ||
    !isNumberBetween(value.knowledge.componentCount, 1, MAX_GENERATION_NODES) ||
    !Array.isArray(value.knowledge.sources) ||
    value.knowledge.sources.length < 1 ||
    value.knowledge.sources.length > 128 ||
    !value.knowledge.sources.every(isKnowledgeSource) ||
    !Array.isArray(value.warnings) ||
    !value.warnings.every((warning) => typeof warning === 'string' && warning.length <= 500) ||
    !isPreflight(value.preflight) ||
    !Array.isArray(value.nodes) ||
    value.nodes.length < 2 ||
    value.nodes.length > MAX_GENERATION_NODES
  ) {
    throw new Error('Apollo Proxy вернул некорректный план генерации.');
  }

  const nodes = value.nodes;
  const ids = new Set<string>();
  const nodeTypes = new Map<string, 'frame' | 'component'>();
  let rootCount = 0;
  for (const node of nodes) {
    if (!isFrameNode(node) && !isComponentNode(node)) {
      throw new Error('План генерации содержит неподдерживаемый узел.');
    }
    if (ids.has(node.id)) {
      throw new Error(`План генерации содержит повторяющийся id: ${node.id}.`);
    }
    if (node.parentId === null) {
      rootCount += 1;
      if (node.type !== 'frame' || node.placement !== 'append' || node.parentPath !== null) {
        throw new Error('Корнем плана генерации может быть только frame.');
      }
    } else if (!ids.has(node.parentId)) {
      throw new Error(`Родитель ${node.parentId} должен предшествовать дочернему узлу.`);
    } else {
      const parentType = nodeTypes.get(node.parentId);
      if (node.placement === 'append' && parentType !== 'frame') {
        throw new Error(`Append-узел ${node.id} требует frame-родителя.`);
      }
      if (node.placement !== 'append' && parentType !== 'component') {
        throw new Error(`Структурная операция ${node.id} требует instance-родителя.`);
      }
    }
    ids.add(node.id);
    nodeTypes.set(node.id, node.type);
  }
  if (rootCount !== 1) {
    throw new Error('План генерации должен содержать ровно один корневой frame.');
  }

  return value as ApolloGenerationPlan;
}
