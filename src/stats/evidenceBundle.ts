import type {
  ApolloAuditEvidenceBundle,
  ApolloEvidenceBaselineReference,
  ApolloEvidenceBounds,
  ApolloEvidenceChangeFact,
  ApolloEvidenceComponentOwner,
  ApolloEvidenceNode,
  ApolloEvidencePaint,
  ApolloEvidenceRelation,
  ApolloEvidenceRuleCandidate,
  ApolloEvidenceScalar,
  ApolloEvidenceVariableBinding,
} from './evidenceTypes';
import type {
  ApolloBaselineCustomizationReport,
  ApolloStatsReport,
  StatsComponentContractRule,
  StatsCustomizationChange,
} from './types';

type ResolveNodePath = (node: SceneNode) => string;
type ResolveComponentKey = (node: SceneNode) => Promise<string | null>;
type ResolveVariableMetadata = (variableId: string) => {
  variableId: string | null;
  variableKey: string | null;
  variableName: string | null;
  collectionId: string | null;
  collectionName: string | null;
} | null;

export type BuildApolloAuditEvidenceBundleInput = {
  report: ApolloStatsReport;
  baselineCustomizationReport: ApolloBaselineCustomizationReport;
  pageId: string;
  roots: readonly SceneNode[];
  resolveNodePath: ResolveNodePath;
  resolveComponentKey: ResolveComponentKey;
  resolveVariableMetadata?: ResolveVariableMetadata;
};

type BuildCoverage = {
  hidden: number;
  decorative: number;
  components: number;
  texts: number;
};

const DECORATIVE_NODE_TYPES = new Set([
  'BOOLEAN_OPERATION',
  'ELLIPSE',
  'LINE',
  'POLYGON',
  'STAR',
  'VECTOR',
]);

export async function buildApolloAuditEvidenceBundle(
  input: BuildApolloAuditEvidenceBundleInput,
): Promise<ApolloAuditEvidenceBundle> {
  const baselineResult = buildBaselineEvidence(
    input.baselineCustomizationReport,
    input.report,
  );
  const changedNodeIds = new Set(
    baselineResult.changes.map((change) => change.nodeId),
  );
  const nodes: ApolloEvidenceNode[] = [];
  const nodeById = new Map<string, ApolloEvidenceNode>();
  const visitedNodeIds = new Set<string>();
  const coverage: BuildCoverage = {
    hidden: 0,
    decorative: 0,
    components: 0,
    texts: 0,
  };

  const visit = async (
    node: SceneNode,
    parentEvidenceNode: ApolloEvidenceNode | null,
    owner: ApolloEvidenceComponentOwner | null,
    depth: number,
    inheritedVisible: boolean,
    forceInclude: boolean,
  ): Promise<void> => {
    if (visitedNodeIds.has(node.id)) return;
    visitedNodeIds.add(node.id);

    const visible = inheritedVisible && node.visible !== false;
    if (!visible) {
      coverage.hidden += countSceneSubtree(node);
      return;
    }

    const include = forceInclude || !DECORATIVE_NODE_TYPES.has(node.type);
    let evidenceNode = parentEvidenceNode;
    let descendantOwner = owner;
    if (include) {
      const componentKey = isComponentNode(node)
        ? await input.resolveComponentKey(node)
        : null;
      const childOrder = parentEvidenceNode
        ? parentEvidenceNode.childNodeIds.length
        : nodes.filter((candidate) => candidate.parentNodeId === null).length;
      const created = createEvidenceNode(
        node,
        parentEvidenceNode,
        owner,
        componentKey,
        childOrder,
        depth,
        input.resolveNodePath,
        input.resolveVariableMetadata,
      );
      nodes.push(created);
      nodeById.set(created.nodeId, created);
      if (parentEvidenceNode) parentEvidenceNode.childNodeIds.push(created.nodeId);
      evidenceNode = created;
      if (created.component) coverage.components += 1;
      if (created.text) coverage.texts += 1;
      if (created.component) {
        descendantOwner = {
          nodeId: created.nodeId,
          componentKey: created.component.key,
        name: created.component.name,
        path: created.path,
        relativePath: '',
        variantProperties: Object.assign({}, created.component.variantProperties),
        componentProperties: Object.assign({}, created.component.componentProperties),
      };
      }
    } else {
      coverage.decorative += 1;
    }

    if (!('children' in node)) return;
    for (const child of node.children) {
      const childOwner = descendantOwner
        ? Object.assign({}, descendantOwner, {
            relativePath: relativePath(descendantOwner.path, input.resolveNodePath(child)),
          })
        : null;
      await visit(
        child,
        evidenceNode,
        childOwner,
        include ? depth + 1 : depth,
        visible,
        changedNodeIds.has(child.id),
      );
    }
  };

  for (const root of input.roots) {
    await visit(root, null, null, 0, true, true);
  }

  const relations = buildRelations(nodes, nodeById);
  const includedRoots = nodes.filter((node) => node.parentNodeId === null);
  const viewportWidth = includedRoots.length === 1
    ? includedRoots[0].bounds?.width ?? null
    : null;

  return {
    schemaVersion: 2,
    documentType: 'apollo-audit-evidence-bundle',
    reportId: `${input.report.reportId}:evidence`,
    sourceReportId: input.report.reportId,
    generatedAt: input.report.generatedAt,
    context: {
      fileKey: input.report.figma.fileKey,
      pageId: input.pageId,
      platform: normalizePlatform(input.report.scan.channel),
      channel: input.report.scan.channel,
      pageType: input.report.scan.pageType ?? null,
      viewportWidth,
      selectionNodeIds: input.roots.map((root) => root.id),
    },
    graph: { nodes, relations },
    baselines: baselineResult.baselines,
    changes: baselineResult.changes,
    ruleCandidates: baselineResult.ruleCandidates,
    coverage: {
      visibleNodeCount: nodes.length,
      excludedHiddenNodeCount: coverage.hidden,
      excludedDecorativeNodeCount: coverage.decorative,
      componentNodeCount: coverage.components,
      textNodeCount: coverage.texts,
      baselineChangeCount: baselineResult.changes.length,
      limitations: [
        'prototype-reactions-not-collected',
        'responsive-counterparts-not-linked',
        'baseline-structures-referenced-by-identity',
      ],
    },
  };
}

function normalizePlatform(
  channel: string,
): 'desktop' | 'mobile-web' | 'ios' | 'android' {
  const normalized = channel.trim().toLowerCase();
  if (normalized === 'mobileweb' || normalized === 'mobile-web') {
    return 'mobile-web';
  }
  if (normalized === 'ios') return 'ios';
  if (normalized === 'android') return 'android';
  return 'desktop';
}

function createEvidenceNode(
  node: SceneNode,
  parent: ApolloEvidenceNode | null,
  owner: ApolloEvidenceComponentOwner | null,
  componentKey: string | null,
  childOrder: number,
  depth: number,
  resolveNodePath: ResolveNodePath,
  resolveVariableMetadata: ResolveVariableMetadata | undefined,
): ApolloEvidenceNode {
  const componentProperties = readComponentProperties(node);
  const component = isComponentNode(node)
    ? {
        key: componentKey,
        name: node.name,
        variantProperties: readVariantProperties(node),
        componentProperties,
        directOverrides: readDirectOverrides(node),
      }
    : null;
  const path = resolveNodePath(node);
  const variableBindings = readVariableBindings(node, resolveVariableMetadata);
  return {
    nodeId: node.id,
    parentNodeId: parent?.nodeId ?? null,
    childNodeIds: [],
    childOrder,
    depth,
    path,
    type: node.type,
    name: node.name,
    visible: node.visible !== false,
    bounds: readBounds(node),
    layout: {
      mode: readStringProperty(node, 'layoutMode'),
      positioning: readStringProperty(node, 'layoutPositioning'),
      wrap: readStringProperty(node, 'layoutWrap'),
      sizingHorizontal: readStringProperty(node, 'layoutSizingHorizontal'),
      sizingVertical: readStringProperty(node, 'layoutSizingVertical'),
      primaryAxisAlignItems: readStringProperty(node, 'primaryAxisAlignItems'),
      counterAxisAlignItems: readStringProperty(node, 'counterAxisAlignItems'),
      padding: readPadding(node),
      itemSpacing: readNumberProperty(node, 'itemSpacing'),
      clipsContent: readBooleanProperty(node, 'clipsContent'),
    },
    component,
    componentOwner: owner,
    text: node.type === 'TEXT'
      ? {
          characters: node.characters,
          length: node.characters.length,
          textStyleId: readStyleId(node, 'textStyleId'),
          lineHeight: readTextLineHeight(node),
        }
      : null,
    styles: {
      fillStyleId: readStyleId(node, 'fillStyleId'),
      strokeStyleId: readStyleId(node, 'strokeStyleId'),
      textStyleId: readStyleId(node, 'textStyleId'),
      effectStyleId: readStyleId(node, 'effectStyleId'),
    },
    appearance: {
      opacity: readNumberProperty(node, 'opacity'),
      radius: readRadius(node),
      fill: readPaintAppearance(node, 'fills', 'fillStyleId', variableBindings),
      stroke: readPaintAppearance(node, 'strokes', 'strokeStyleId', variableBindings),
    },
    variableBindings,
  };
}

function readTextLineHeight(node: SceneNode): number | null {
  if (node.type !== 'TEXT' || node.lineHeight === figma.mixed) return null;
  if (!node.lineHeight || node.lineHeight.unit !== 'PIXELS') return null;
  return Number.isFinite(node.lineHeight.value) ? node.lineHeight.value : null;
}

function readPaintAppearance(
  node: SceneNode,
  paintProperty: 'fills' | 'strokes',
  styleProperty: 'fillStyleId' | 'strokeStyleId',
  variableBindings: ApolloEvidenceVariableBinding[],
): ApolloEvidencePaint | null {
  const rawPaints = readUnknownProperty(node, paintProperty);
  if (!Array.isArray(rawPaints)) return null;
  const visiblePaints = rawPaints.filter((paint) => (
    paint && typeof paint === 'object' && (paint as { visible?: unknown }).visible !== false
  ));
  const paintTypes = visiblePaints
    .map((paint) => String((paint as { type?: unknown }).type ?? 'UNKNOWN'))
    .sort();
  const binding = variableBindings.find((item) => item.property === paintProperty) ?? null;
  const variable = binding?.variables.length === 1 ? binding.variables[0] : null;
  const styleId = readStyleId(node, styleProperty);
  const rawValue = canonicalPaintValue(visiblePaints);
  const strokeGeometry = paintProperty === 'strokes'
    ? readStrokeGeometry(node)
    : { weight: null, weights: null, align: null };
  const resourceType = variable?.name
    ? 'token'
    : styleId
      ? 'style'
      : visiblePaints.length
        ? 'paint'
        : null;
  const resourceId = variable?.key ?? variable?.id ?? styleId;
  const resourceName = variable?.name ?? (styleId ? `style:${styleId}` : null);
  return {
    value: resourceName ?? rawValue,
    resourceType,
    resourceId: resourceId ?? null,
    resourceName,
    bindingName: variable?.name ?? null,
    bindingCollection: variable?.collectionName ?? null,
    styleId,
    visible: visiblePaints.length > 0,
    paintCount: visiblePaints.length,
    paintTypes,
    weight: strokeGeometry.weight,
    weights: strokeGeometry.weights,
    align: strokeGeometry.align,
  };
}

function readStrokeGeometry(node: SceneNode): {
  weight: number | null;
  weights: {
    top: number | null;
    right: number | null;
    bottom: number | null;
    left: number | null;
  } | null;
  align: string | null;
} {
  const scalarWeight = readNumberProperty(node, 'strokeWeight');
  const weights = {
    top: readNumberProperty(node, 'strokeTopWeight'),
    right: readNumberProperty(node, 'strokeRightWeight'),
    bottom: readNumberProperty(node, 'strokeBottomWeight'),
    left: readNumberProperty(node, 'strokeLeftWeight'),
  };
  const hasSideWeights = Object.values(weights).some((value) => value !== null);
  const representativeWeight = hasSideWeights
    ? Math.max(...Object.values(weights).filter(
        (value): value is number => typeof value === 'number',
      ))
    : null;
  return {
    weight: scalarWeight ?? representativeWeight,
    weights: hasSideWeights ? weights : null,
    align: readStringProperty(node, 'strokeAlign'),
  };
}

function canonicalPaintValue(paints: unknown[]): string | null {
  if (!paints.length) return null;
  if (paints.length === 1) {
    const paint = paints[0] as {
      type?: unknown;
      color?: { r?: unknown; g?: unknown; b?: unknown };
      opacity?: unknown;
    };
    if (
      paint.type === 'SOLID' &&
      paint.color &&
      typeof paint.color.r === 'number' &&
      typeof paint.color.g === 'number' &&
      typeof paint.color.b === 'number'
    ) {
      const channels = [paint.color.r, paint.color.g, paint.color.b]
        .map((value) => Math.max(0, Math.min(255, Math.round(value * 255))))
        .map((value) => value.toString(16).padStart(2, '0').toUpperCase());
      const opacity = typeof paint.opacity === 'number' ? paint.opacity : 1;
      return opacity === 1
        ? `#${channels.join('')}`
        : `#${channels.join('')}@${roundMeasurement(opacity)}`;
    }
  }
  const types = paints.map((paint) => String(
    (paint as { type?: unknown })?.type ?? 'UNKNOWN',
  ));
  return `paint:${types.join('+')}`;
}

function readRadius(node: SceneNode): ApolloEvidenceNode['appearance']['radius'] {
  if (!('cornerRadius' in node)) return null;
  if (typeof node.cornerRadius === 'number') return node.cornerRadius;
  const candidate = node as SceneNode & Partial<RectangleCornerMixin>;
  if (
    typeof candidate.topLeftRadius === 'number' &&
    typeof candidate.topRightRadius === 'number' &&
    typeof candidate.bottomRightRadius === 'number' &&
    typeof candidate.bottomLeftRadius === 'number'
  ) {
    return {
      topLeft: candidate.topLeftRadius,
      topRight: candidate.topRightRadius,
      bottomRight: candidate.bottomRightRadius,
      bottomLeft: candidate.bottomLeftRadius,
    };
  }
  return null;
}

function buildRelations(
  nodes: ApolloEvidenceNode[],
  nodeById: Map<string, ApolloEvidenceNode>,
): ApolloEvidenceRelation[] {
  const relations: ApolloEvidenceRelation[] = [];
  for (const node of nodes) {
    for (const childNodeId of node.childNodeIds) {
      relations.push({
        id: relationId('child', node.nodeId, childNodeId),
        kind: 'direct-child',
        fromNodeId: node.nodeId,
        toNodeId: childNodeId,
        containerNodeId: node.nodeId,
        axis: null,
        edge: null,
        measurement: null,
      });
    }
    addSiblingRelations(node, nodeById, relations);
    addContainerPaddingRelations(node, nodeById, relations);
  }
  return relations.sort((left, right) => left.id.localeCompare(right.id));
}

function addSiblingRelations(
  container: ApolloEvidenceNode,
  nodeById: Map<string, ApolloEvidenceNode>,
  relations: ApolloEvidenceRelation[],
): void {
  const children = container.childNodeIds
    .map((nodeId) => nodeById.get(nodeId) ?? null)
    .filter((node): node is ApolloEvidenceNode => Boolean(node?.bounds));
  for (let index = 0; index < children.length - 1; index += 1) {
    const from = children[index];
    const to = children[index + 1];
    if (!from.bounds || !to.bounds) continue;
    const relation = measureSiblingGap(from, to, container.nodeId);
    if (relation) relations.push(relation);
  }
}

function measureSiblingGap(
  from: ApolloEvidenceNode,
  to: ApolloEvidenceNode,
  containerNodeId: string,
): ApolloEvidenceRelation | null {
  if (!from.bounds || !to.bounds) return null;
  const xOverlap = overlapLength(
    from.bounds.x,
    from.bounds.x + from.bounds.width,
    to.bounds.x,
    to.bounds.x + to.bounds.width,
  );
  const yOverlap = overlapLength(
    from.bounds.y,
    from.bounds.y + from.bounds.height,
    to.bounds.y,
    to.bounds.y + to.bounds.height,
  );
  const verticalGap = to.bounds.y - (from.bounds.y + from.bounds.height);
  const horizontalGap = to.bounds.x - (from.bounds.x + from.bounds.width);
  let axis: 'horizontal' | 'vertical';
  let actualPx: number;
  if (xOverlap > 0 && verticalGap >= 0) {
    axis = 'vertical';
    actualPx = verticalGap;
  } else if (yOverlap > 0 && horizontalGap >= 0) {
    axis = 'horizontal';
    actualPx = horizontalGap;
  } else {
    return null;
  }
  return {
    id: relationId(`gap-${axis}`, from.nodeId, to.nodeId),
    kind: 'sibling-gap',
    fromNodeId: from.nodeId,
    toNodeId: to.nodeId,
    containerNodeId,
    axis,
    edge: null,
    measurement: {
      actualPx: roundMeasurement(actualPx),
      source: 'bounding-box-gap',
      quality: 'exact',
    },
  };
}

function addContainerPaddingRelations(
  container: ApolloEvidenceNode,
  nodeById: Map<string, ApolloEvidenceNode>,
  relations: ApolloEvidenceRelation[],
): void {
  if (!container.bounds || !container.childNodeIds.length) return;
  const childBounds = container.childNodeIds
    .map((nodeId) => nodeById.get(nodeId)?.bounds ?? null)
    .filter((bounds): bounds is ApolloEvidenceBounds => bounds !== null);
  if (!childBounds.length) return;
  const left = Math.min(...childBounds.map((bounds) => bounds.x));
  const top = Math.min(...childBounds.map((bounds) => bounds.y));
  const right = Math.max(...childBounds.map((bounds) => bounds.x + bounds.width));
  const bottom = Math.max(...childBounds.map((bounds) => bounds.y + bounds.height));
  const values: Array<{
    edge: 'top' | 'right' | 'bottom' | 'left';
    axis: 'horizontal' | 'vertical';
    value: number;
  }> = [
    { edge: 'top', axis: 'vertical', value: top - container.bounds.y },
    {
      edge: 'right',
      axis: 'horizontal',
      value: container.bounds.x + container.bounds.width - right,
    },
    {
      edge: 'bottom',
      axis: 'vertical',
      value: container.bounds.y + container.bounds.height - bottom,
    },
    { edge: 'left', axis: 'horizontal', value: left - container.bounds.x },
  ];
  for (const item of values) {
    if (item.value < 0) continue;
    relations.push({
      id: relationId(`padding-${item.edge}`, container.nodeId, null),
      kind: 'container-padding',
      fromNodeId: container.nodeId,
      toNodeId: null,
      containerNodeId: container.nodeId,
      axis: item.axis,
      edge: item.edge,
      measurement: {
        actualPx: roundMeasurement(item.value),
        source: 'child-envelope',
        quality: 'exact',
      },
    });
  }
}

function buildBaselineEvidence(
  baselineReport: ApolloBaselineCustomizationReport,
  sourceReport: ApolloStatsReport,
): {
  baselines: ApolloEvidenceBaselineReference[];
  changes: ApolloEvidenceChangeFact[];
  ruleCandidates: ApolloEvidenceRuleCandidate[];
} {
  const baselineById = new Map<string, ApolloEvidenceBaselineReference>();
  const ruleById = new Map<string, ApolloEvidenceRuleCandidate>();
  const changeById = new Map<string, ApolloEvidenceChangeFact>();
  const items = baselineReport.category.items.concat(
    sourceReport.categories?.customizations?.items ?? [],
  );
  for (const item of items) {
    for (const change of item.changes) {
      const baseline = toBaselineReference(change);
      baselineById.set(baseline.id, baseline);
      for (const rule of change.componentRules) {
        if (!ruleById.has(rule.ruleId)) ruleById.set(rule.ruleId, toRuleCandidate(rule));
      }
      const evidenceChange = toChangeFact(change, item.component.key, baseline.id);
      if (!changeById.has(evidenceChange.id)) {
        changeById.set(evidenceChange.id, evidenceChange);
      }
    }
  }
  return {
    baselines: [...baselineById.values()].sort((left, right) => left.id.localeCompare(right.id)),
    changes: [...changeById.values()].sort((left, right) => left.id.localeCompare(right.id)),
    ruleCandidates: [...ruleById.values()].sort((left, right) => left.ruleId.localeCompare(right.ruleId)),
  };
}

function toBaselineReference(
  change: StatsCustomizationChange,
): ApolloEvidenceBaselineReference {
  const variants = change.context.referenceVariantProperties ?? {};
  const nestedOwnerKey =
    change.context.nestedOwnerComponentKey ??
    change.context.actualNestedOwnerComponentKey ??
    null;
  const nestedPath =
    change.context.nestedOwnerRelativePath ??
    change.context.actualNestedOwnerRelativePath ??
    null;
  const parts = [
    change.context.referenceComponentKey ?? 'unknown',
    nestedOwnerKey ?? 'host',
    nestedPath ?? 'root',
    stableRecord(variants),
  ];
  return {
    id: `baseline:${parts.map(encodePart).join(':')}`,
    componentKey: change.context.referenceComponentKey,
    nestedOwnerComponentKey: nestedOwnerKey,
    nestedOwnerRelativePath: nestedPath,
    variantProperties: copyStringRecord(variants),
  };
}

function toChangeFact(
  change: StatsCustomizationChange,
  fallbackOwnerComponentKey: string | null,
  baselineReferenceId: string,
): ApolloEvidenceChangeFact {
  const candidateRuleIds = change.componentRules
    .map((rule) => rule.ruleId)
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));
  const ownerComponentKey =
    change.context.actualNestedOwnerComponentKey ??
    change.context.actualComponentKey ??
    fallbackOwnerComponentKey;
  return {
    id: `change:${encodePart(change.node.id)}:${encodePart(change.signature)}`,
    nodeId: change.node.id,
    nodeName: change.node.name,
    nodePath: change.node.path,
    property: change.property,
    kind: change.kind,
    ownerComponentKey,
    baselineReferenceId,
    baseline: {
      value: toScalar(change.reference.value),
      resourceType: change.reference.resource?.type ?? null,
      resourceName: change.reference.resource?.name ?? null,
      bindingName: change.reference.binding?.name ?? null,
      bindingCollection: change.reference.binding?.collectionName ?? null,
    },
    actual: {
      value: toScalar(change.actual.value),
      resourceType: change.actual.resource?.type ?? null,
      resourceName: change.actual.resource?.name ?? null,
      bindingName: change.actual.binding?.name ?? null,
      bindingCollection: change.actual.binding?.collectionName ?? null,
    },
    bindingStatus: change.bindingStatus,
    mapping: {
      method: 'apollo-effective-baseline-diff',
      quality: change.context.referenceComponentKey ? 'exact' : 'derived',
      referenceOrigin: change.context.referenceOrigin,
      nestedOwnerRelativePath:
        change.context.actualNestedOwnerRelativePath ??
        change.context.nestedOwnerRelativePath ??
        null,
    },
    candidateRuleIds,
  };
}

function toRuleCandidate(
  rule: StatsComponentContractRule,
): ApolloEvidenceRuleCandidate {
  return {
    ruleId: rule.ruleId,
    severity: rule.severity,
    source: rule.source,
    ruleKind: rule.ruleKind,
    authority: rule.authority
      ? {
          status: rule.authority.status,
          provenance: rule.authority.provenance,
          revision: rule.authority.revision,
        }
      : null,
    appliesTo: rule.appliesTo,
    checkType: rule.checkType,
    matchKind: rule.matchKind,
    ruleText: rule.ruleText,
    remediation: rule.remediation,
  };
}

function readBounds(node: SceneNode): ApolloEvidenceBounds | null {
  const bounds = node.absoluteBoundingBox;
  if (!bounds) return null;
  return {
    x: roundMeasurement(bounds.x),
    y: roundMeasurement(bounds.y),
    width: roundMeasurement(bounds.width),
    height: roundMeasurement(bounds.height),
  };
}

function readPadding(node: SceneNode): ApolloEvidenceNode['layout']['padding'] {
  const top = readNumberProperty(node, 'paddingTop');
  const right = readNumberProperty(node, 'paddingRight');
  const bottom = readNumberProperty(node, 'paddingBottom');
  const left = readNumberProperty(node, 'paddingLeft');
  if (top === null && right === null && bottom === null && left === null) return null;
  return { top, right, bottom, left };
}

function readComponentProperties(
  node: SceneNode,
): Record<string, ApolloEvidenceScalar> {
  const result: Record<string, ApolloEvidenceScalar> = {};
  const properties = readUnknownProperty(node, 'componentProperties');
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) return result;
  for (const [name, rawProperty] of Object.entries(properties)) {
    if (!rawProperty || typeof rawProperty !== 'object') continue;
    const value = (rawProperty as { value?: unknown }).value;
    result[normalizeComponentPropertyName(name)] = toScalar(value);
  }
  return result;
}

function readVariantProperties(node: SceneNode): Record<string, string> {
  const result: Record<string, string> = {};
  const properties = readUnknownProperty(node, 'componentProperties');
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) return result;
  for (const [name, rawProperty] of Object.entries(properties)) {
    if (!rawProperty || typeof rawProperty !== 'object') continue;
    const property = rawProperty as { type?: unknown; value?: unknown };
    if (property.type !== 'VARIANT') continue;
    result[normalizeComponentPropertyName(name)] = String(property.value ?? '');
  }
  return result;
}

function readDirectOverrides(node: SceneNode): Array<{ nodeId: string; fields: string[] }> {
  const raw = readUnknownProperty(node, 'overrides');
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const value = item as { id?: unknown; overriddenFields?: unknown };
      if (typeof value.id !== 'string') return null;
      return {
        nodeId: value.id,
        fields: Array.isArray(value.overriddenFields)
          ? value.overriddenFields.filter((field): field is string => typeof field === 'string')
          : [],
      };
    })
    .filter((item): item is { nodeId: string; fields: string[] } => item !== null);
}

function readVariableBindings(
  node: SceneNode,
  resolveVariableMetadata: ResolveVariableMetadata | undefined,
): ApolloEvidenceVariableBinding[] {
  const raw = readUnknownProperty(node, 'boundVariables');
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
  const result: ApolloEvidenceVariableBinding[] = [];
  for (const [property, binding] of Object.entries(raw)) {
    const ids = collectVariableIds(binding);
    if (ids.length) {
      result.push({
        property,
        variableIds: ids,
        variables: ids.map((id) => {
          const metadata = resolveVariableMetadata?.(id) ?? null;
          return {
            id,
            key: metadata?.variableKey ?? null,
            name: metadata?.variableName ?? null,
            collectionId: metadata?.collectionId ?? null,
            collectionName: metadata?.collectionName ?? null,
          };
        }),
      });
    }
  }
  return result.sort((left, right) => left.property.localeCompare(right.property));
}

function collectVariableIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return [...new Set(value.flatMap((item) => collectVariableIds(item)))].sort();
  }
  if (!value || typeof value !== 'object') return [];
  const id = (value as { id?: unknown }).id;
  return typeof id === 'string' ? [id] : [];
}

function countSceneSubtree(node: SceneNode): number {
  if (!('children' in node)) return 1;
  return 1 + node.children.reduce((sum, child) => sum + countSceneSubtree(child), 0);
}

function isComponentNode(node: SceneNode): node is InstanceNode | ComponentNode {
  return node.type === 'INSTANCE' || node.type === 'COMPONENT';
}

function readUnknownProperty(node: SceneNode, property: string): unknown {
  return (node as unknown as Record<string, unknown>)[property];
}

function readStringProperty(node: SceneNode, property: string): string | null {
  const value = readUnknownProperty(node, property);
  return typeof value === 'string' ? value : null;
}

function readNumberProperty(node: SceneNode, property: string): number | null {
  const value = readUnknownProperty(node, property);
  return typeof value === 'number' && Number.isFinite(value)
    ? roundMeasurement(value)
    : null;
}

function readBooleanProperty(node: SceneNode, property: string): boolean | null {
  const value = readUnknownProperty(node, property);
  return typeof value === 'boolean' ? value : null;
}

function readStyleId(node: SceneNode, property: string): string | null {
  const value = readUnknownProperty(node, property);
  return typeof value === 'string' && value !== '' ? value : null;
}

function normalizeComponentPropertyName(value: string): string {
  return value.split('#')[0].trim();
}

function relativePath(ownerPath: string, nodePath: string): string {
  if (nodePath === ownerPath) return '';
  if (nodePath.startsWith(`${ownerPath}/`)) return nodePath.slice(ownerPath.length + 1);
  return nodePath;
}

function copyStringRecord(value: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(value).sort()) result[key] = value[key];
  return result;
}

function stableRecord(value: Record<string, string>): string {
  return Object.keys(value)
    .sort()
    .map((key) => `${key}=${value[key]}`)
    .join(',');
}

function encodePart(value: string): string {
  return encodeURIComponent(value).replace(/%/g, '_');
}

function relationId(kind: string, fromNodeId: string, toNodeId: string | null): string {
  return `relation:${kind}:${encodePart(fromNodeId)}:${encodePart(toNodeId ?? 'none')}`;
}

function overlapLength(startA: number, endA: number, startB: number, endB: number): number {
  return Math.max(0, Math.min(endA, endB) - Math.max(startA, startB));
}

function roundMeasurement(value: number): number {
  return Math.round(value * 100) / 100;
}

function toScalar(value: unknown): ApolloEvidenceScalar {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  if (value === undefined) return null;
  return String(value);
}
