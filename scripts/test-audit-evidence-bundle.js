const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');

globalThis.figma = { mixed: Symbol('mixed') };

function loadModule() {
  const outfile = path.join(
    os.tmpdir(),
    `apollo-audit-evidence-bundle-${process.pid}-${Date.now()}.cjs`,
  );
  esbuild.buildSync({
    entryPoints: [path.resolve(__dirname, '../src/stats/evidenceBundle.ts')],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: ['node18'],
    logLevel: 'silent',
  });
  try {
    return require(outfile);
  } finally {
    fs.rmSync(outfile, { force: true });
  }
}

function node(type, id, name, bounds, extra = {}) {
  return Object.assign({
    type,
    id,
    name,
    visible: true,
    parent: null,
    absoluteBoundingBox: bounds,
  }, extra);
}

function attach(parent, children) {
  parent.children = children;
  for (const child of children) child.parent = parent;
  return parent;
}

const root = node('FRAME', '1:1', 'Form', { x: 0, y: 0, width: 400, height: 400 }, {
  layoutMode: 'VERTICAL',
  itemSpacing: 32,
  paddingTop: 24,
  paddingRight: 24,
  paddingBottom: 24,
  paddingLeft: 24,
});
const title = node('INSTANCE', '1:2', '[D] TitleView', { x: 24, y: 24, width: 352, height: 48 }, {
  opacity: 1,
  cornerRadius: 0,
  componentProperties: {
    'View#1:0': { type: 'VARIANT', value: 'xLarge' },
  },
  overrides: [
    { id: '1:3', overriddenFields: ['characters'] },
    { id: '1:7', overriddenFields: ['cornerRadius'] },
  ],
});
const titleText = node('TEXT', '1:3', 'Title', { x: 24, y: 24, width: 200, height: 48 }, {
  characters: 'Главный заголовок',
  textStyleId: 'S:title',
  fills: [{
    type: 'SOLID',
    visible: true,
    opacity: 1,
    color: { r: 0, g: 0, b: 0 },
  }],
  strokes: [{
    type: 'SOLID',
    visible: true,
    opacity: 1,
    color: { r: 0.25, g: 0.25, b: 0.25 },
  }],
  boundVariables: {
    fills: [{ type: 'VARIABLE_ALIAS', id: 'VariableID:text-primary' }],
    strokes: [{ type: 'VARIABLE_ALIAS', id: 'VariableID:border-primary' }],
  },
  strokeWeight: Symbol('mixed'),
  strokeTopWeight: 0,
  strokeRightWeight: 0,
  strokeBottomWeight: 1,
  strokeLeftWeight: 0,
  strokeAlign: 'INSIDE',
});
const changedShape = node(
  'BOOLEAN_OPERATION',
  '1:7',
  'Shape',
  { x: 24, y: 24, width: 48, height: 48 },
  { cornerRadius: 10 },
);
const unchangedDecoration = node(
  'VECTOR',
  '1:8',
  'Decoration',
  { x: 32, y: 32, width: 16, height: 16 },
);
attach(title, [titleText, changedShape, unchangedDecoration]);
const body = node('FRAME', '1:4', 'Fields', { x: 24, y: 104, width: 352, height: 248 }, {
  layoutMode: 'VERTICAL',
  layoutPositioning: 'ABSOLUTE',
  itemSpacing: 16,
  fills: [{
    type: 'SOLID',
    visible: true,
    opacity: 0.5,
    color: { r: 1, g: 1, b: 1 },
  }],
});
const promoButton = node(
  'INSTANCE',
  '1:9',
  '[D] Button',
  { x: 24, y: 120, width: 120, height: 56 },
  {
    componentProperties: {
      'View#1:0': { type: 'VARIANT', value: 'Transparent' },
    },
  },
);
attach(body, [promoButton]);
const hidden = node('FRAME', '1:5', 'Hidden', { x: 0, y: 0, width: 10, height: 10 }, {
  visible: false,
});
const hiddenText = node('TEXT', '1:6', 'Hidden text', { x: 0, y: 0, width: 10, height: 10 }, {
  characters: 'hidden',
});
attach(hidden, [hiddenText]);
attach(root, [title, body, hidden]);

const sourceReport = {
  reportId: 'report-1',
  generatedAt: '2026-08-19T10:00:00.000Z',
  figma: {
    fileKey: 'figma-file-key',
  },
  scan: {
    channel: 'web-corp',
    pageType: 'form',
  },
};

const baselineReport = {
  category: {
    items: [{
      component: { key: 'component:title-view' },
      changes: [{
        node: {
          id: '1:3',
          name: 'Title',
          path: 'Form/[D] TitleView/Title',
        },
        kind: 'style',
        property: 'styles.text',
        signature: 'title-text-style',
        reference: {
          value: 'Headline/40',
          resource: { type: 'style', name: 'Headline/40' },
          binding: null,
        },
        actual: {
          value: 'Headline/32',
          resource: { type: 'style', name: 'Headline/32' },
          binding: null,
        },
        bindingStatus: null,
        context: {
          actualComponentKey: 'component:title-view',
          referenceComponentKey: 'component:title-view',
          referenceOrigin: 'host',
          actualNestedOwnerComponentKey: null,
          actualNestedOwnerRelativePath: null,
          nestedOwnerComponentKey: null,
          nestedOwnerRelativePath: null,
          referenceVariantProperties: { View: 'xLarge' },
        },
        componentRules: [{
          ruleId: 'component:title-view.fixed-title-style',
          severity: 'error',
          source: 'TitleView/rules.json',
          ruleKind: 'design-rule',
          authority: {
            status: 'active',
            provenance: 'design-system',
            revision: 1,
          },
          appliesTo: 'Title',
          checkType: 'style',
          matchKind: 'exact',
          ruleText: 'Title style is fixed by View.',
          remediation: 'Reset the style.',
        }],
      }, {
        node: {
          id: '1:7',
          name: 'Shape',
          path: 'Form/[D] TitleView/Shape',
        },
        kind: 'layer',
        property: 'radius',
        signature: 'shape-radius',
        reference: {
          value: 6,
          resource: null,
          binding: null,
        },
        actual: {
          value: 10,
          resource: null,
          binding: null,
        },
        bindingStatus: null,
        context: {
          actualComponentKey: 'component:title-view',
          referenceComponentKey: 'component:title-view',
          referenceOrigin: 'host',
          actualNestedOwnerComponentKey: null,
          actualNestedOwnerRelativePath: null,
          nestedOwnerComponentKey: null,
          nestedOwnerRelativePath: null,
          referenceVariantProperties: { View: 'xLarge' },
        },
        componentRules: [{
          ruleId: 'component:title-view.layer-properties-use-effective-baseline',
          severity: 'error',
          source: 'TitleView/rules.json',
          ruleKind: 'design-rule',
          authority: {
            status: 'active',
            provenance: 'design-system',
            revision: 1,
          },
          appliesTo: 'Shape',
          checkType: 'layer',
          matchKind: 'baseline',
          ruleText: 'Shape radius is fixed by the effective baseline.',
          remediation: 'Reset the radius.',
        }],
      }],
    }],
  },
};

sourceReport.categories = {
  customizations: {
    items: [{
      component: { key: 'component:promo-main-block' },
      changes: [{
        node: {
          id: '1:9',
          name: 'Primary',
          path: 'Form/[D] PromoMainBlock/ButtonGroup/Primary',
        },
        kind: 'other',
        property: 'variant.View',
        signature: 'promo-primary-view',
        reference: {
          value: 'Primary',
          resource: null,
          binding: null,
        },
        actual: {
          value: 'Transparent',
          resource: null,
          binding: null,
        },
        bindingStatus: null,
        context: {
          actualComponentKey: 'component:button-transparent',
          referenceComponentKey: null,
          referenceOrigin: 'host',
          actualNestedOwnerComponentKey: 'component:promo-actions',
          actualNestedOwnerRelativePath: 'ButtonGroup/Primary',
          nestedOwnerComponentKey: null,
          nestedOwnerRelativePath: null,
          referenceVariantProperties: { View: 'Primary' },
        },
        componentRules: [{
          ruleId: 'component:promo-main-block.desktop-actions-follow-baseline',
          severity: 'error',
          source: 'PromoMainBlock/rules.json',
          ruleKind: 'design-rule',
          authority: {
            status: 'active',
            provenance: 'design-system',
            revision: 1,
          },
          appliesTo: 'desktop.actions.View',
          checkType: 'deterministic',
          matchKind: 'exact_component_rule',
          ruleText: 'Desktop button View follows the effective baseline.',
          remediation: 'Reset View.',
        }],
      }],
    }],
  },
};

function resolvePath(entry) {
  const names = [];
  let cursor = entry;
  while (cursor) {
    names.unshift(cursor.name);
    cursor = cursor.parent;
  }
  return names.join('/');
}

const { buildApolloAuditEvidenceBundle } = loadModule();

(async () => {
  const bundle = await buildApolloAuditEvidenceBundle({
    report: sourceReport,
    baselineCustomizationReport: baselineReport,
    pageId: '0:1',
    roots: [root],
    resolveNodePath: resolvePath,
    resolveComponentKey: async (entry) => (
      entry.id === '1:2' ? 'component:title-view' : null
    ),
    resolveVariableMetadata: (variableId) => variableId === 'VariableID:border-primary'
      ? {
          variableId,
          variableKey: 'stroke-token-key',
          variableName: 'border/primary',
          collectionId: 'collection:interface-dynamic',
          collectionName: 'Interface Dynamic',
        }
      : {
          variableId,
          variableKey: 'text-primary-key',
          variableName: 'text/primary',
          collectionId: 'collection:text',
          collectionName: 'Text',
        },
  });

  assert.equal(bundle.schemaVersion, 2);
  assert.equal(bundle.documentType, 'apollo-audit-evidence-bundle');
  assert.equal(bundle.context.fileKey, 'figma-file-key');
  assert.equal(bundle.context.pageId, '0:1');
  assert.equal(bundle.context.platform, 'desktop');
  assert.equal(bundle.context.pageType, 'form');
  assert.equal(bundle.coverage.excludedHiddenNodeCount, 2);
  assert.equal(bundle.graph.nodes.some((entry) => entry.nodeId === '1:5'), false);
  assert.equal(bundle.graph.nodes.some((entry) => entry.nodeId === '1:6'), false);
  assert.equal(bundle.graph.nodes.some((entry) => entry.nodeId === '1:8'), false);
  assert.equal(
    bundle.graph.nodes.find((entry) => entry.nodeId === '1:4').layout.positioning,
    'ABSOLUTE',
  );

  const text = bundle.graph.nodes.find((entry) => entry.nodeId === '1:3');
  assert.equal(text.componentOwner.nodeId, '1:2');
  assert.equal(text.componentOwner.componentKey, 'component:title-view');
  assert.equal(text.componentOwner.relativePath, 'Title');
  assert.deepEqual(text.componentOwner.variantProperties, { View: 'xLarge' });
  assert.deepEqual(text.componentOwner.componentProperties, { View: 'xLarge' });
  assert.deepEqual(text.variableBindings, [{
    property: 'fills',
    variableIds: ['VariableID:text-primary'],
    variables: [{
      id: 'VariableID:text-primary',
      key: 'text-primary-key',
      name: 'text/primary',
      collectionId: 'collection:text',
      collectionName: 'Text',
    }],
  }, {
    property: 'strokes',
    variableIds: ['VariableID:border-primary'],
    variables: [{
      id: 'VariableID:border-primary',
      key: 'stroke-token-key',
      name: 'border/primary',
      collectionId: 'collection:interface-dynamic',
      collectionName: 'Interface Dynamic',
    }],
  }]);
  assert.deepEqual(text.appearance.fill, {
    value: 'text/primary',
    resourceType: 'token',
    resourceId: 'text-primary-key',
    resourceName: 'text/primary',
    bindingName: 'text/primary',
    bindingCollection: 'Text',
    styleId: null,
    visible: true,
    paintCount: 1,
    paintTypes: ['SOLID'],
    weight: null,
    weights: null,
    align: null,
  });
  assert.deepEqual(text.appearance.stroke, {
    value: 'border/primary',
    resourceType: 'token',
    resourceId: 'stroke-token-key',
    resourceName: 'border/primary',
    bindingName: 'border/primary',
    bindingCollection: 'Interface Dynamic',
    styleId: null,
    visible: true,
    paintCount: 1,
    paintTypes: ['SOLID'],
    weight: 1,
    weights: { top: 0, right: 0, bottom: 1, left: 0 },
    align: 'INSIDE',
  });

  const bodyEvidence = bundle.graph.nodes.find((entry) => entry.nodeId === '1:4');
  assert.equal(bodyEvidence.appearance.fill.value, '#FFFFFF@0.5');
  assert.equal(bodyEvidence.appearance.fill.resourceType, 'paint');

  const titleEvidence = bundle.graph.nodes.find((entry) => entry.nodeId === '1:2');
  assert.equal(titleEvidence.appearance.opacity, 1);
  assert.equal(titleEvidence.appearance.radius, 0);

  const shapeEvidence = bundle.graph.nodes.find((entry) => entry.nodeId === '1:7');
  assert.equal(shapeEvidence.type, 'BOOLEAN_OPERATION');
  assert.equal(shapeEvidence.appearance.radius, 10);
  assert.equal(shapeEvidence.componentOwner.nodeId, '1:2');
  assert.equal(shapeEvidence.componentOwner.relativePath, 'Shape');

  const gap = bundle.graph.relations.find((entry) => (
    entry.kind === 'sibling-gap' &&
    entry.fromNodeId === '1:2' &&
    entry.toNodeId === '1:4'
  ));
  assert.equal(gap.measurement.actualPx, 32);
  assert.equal(gap.axis, 'vertical');

  const topPadding = bundle.graph.relations.find((entry) => (
    entry.kind === 'container-padding' &&
    entry.fromNodeId === '1:1' &&
    entry.edge === 'top'
  ));
  assert.equal(topPadding.measurement.actualPx, 24);

  assert.equal(bundle.baselines.length, 2);
  assert.equal(bundle.changes.length, 3);
  const promoButtonView = bundle.changes.find((entry) => entry.property === 'variant.View');
  assert.equal(promoButtonView.baseline.value, 'Primary');
  assert.equal(promoButtonView.actual.value, 'Transparent');
  assert.deepEqual(bundle.changes[0].candidateRuleIds, [
    'component:title-view.fixed-title-style',
  ]);
  assert.equal(bundle.ruleCandidates[0].authority.status, 'active');
  console.log('Audit evidence bundle regression checks passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
