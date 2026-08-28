const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');

function loadAuditViewBuilder() {
  const entryPoint = path.resolve(__dirname, '../src/services/auditViewBuilder.ts');
  const outfile = path.join(
    os.tmpdir(),
    `apollo-audit-view-builder-${process.pid}-${Date.now()}.cjs`,
  );

  esbuild.buildSync({
    entryPoints: [entryPoint],
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

function makeAuditItem(nodeType, name, diffs, visible = true) {
  return {
    id: `${nodeType}-${name}`,
    name,
    nodeType,
    relevance: 'current',
    isLocal: false,
    pageName: 'Page',
    pathSegments: [{ id: `${nodeType}-${name}`, label: name, nodeType, visible }],
    fullPath: name,
    librarySource: 'Web :: Corp Components',
    componentKey: `${nodeType}-${name}`,
    comparisonIssues: [],
    diffs,
  };
}

async function main() {
  const {
    computeBaselineChangeResults,
    computeChangesResults,
    describeCustomStyleReasons,
  } =
    loadAuditViewBuilder();

  const componentItem = makeAuditItem('COMPONENT', '[D] BackgroundPlate', [
    {
      message: 'заливка: — → #FF0000',
      nodePath: '[D] BackgroundPlate / Position=Level 1 (outer)',
      nodeName: 'Position=Level 1 (outer)',
      visible: true,
    },
  ]);

  const instanceItem = makeAuditItem('INSTANCE', '[D] Card', [
    {
      message: 'заливка: neutral/100 → accent/secondary',
      nodePath: '[D] Card',
      nodeName: '[D] Card',
      visible: true,
    },
  ]);

  const frameItem = makeAuditItem('FRAME', 'Wrapper', [
    {
      message: 'заливка: — → #FF0000',
      nodePath: 'Wrapper',
      nodeName: 'Wrapper',
      visible: true,
    },
  ]);

  const results = computeChangesResults([componentItem, instanceItem, frameItem]);

  assert.equal(
    results.length,
    2,
    'Customization results must include component and instance nodes with meaningful diffs',
  );
  assert.deepEqual(
    results.map((item) => item.nodeType),
    ['COMPONENT', 'INSTANCE'],
    'FRAME nodes must stay excluded from customization results',
  );

  const allowedBaselineDiff = {
    message: 'заливка: neutral/100 → accent/secondary',
    nodePath: '[D] Card',
    nodeName: '[D] Card',
    visible: true,
    assessment: { verdict: 'allowed' },
  };
  const hiddenBaselineDiff = {
    message: 'скрытый слой: baseline → actual',
    nodePath: '[D] Card / Hidden',
    nodeName: 'Hidden',
    visible: false,
  };
  const richerAllowedBaselineDiff = Object.assign({}, allowedBaselineDiff, {
    context: {
      surfaceContext: { kind: 'white', source: 'ancestor-fill-color' },
    },
  });
  const requiredPaintStateDiff = {
    message: 'заливка: — → base-bg-alt/secondary',
    nodeId: 'I:background-plate-style-level-1',
    nodePath: '[D] BackgroundPlate / [D] Style Level 1',
    nodeName: '[D] Style Level 1',
    visible: true,
    diffKind: 'paint',
    details: {
      property: 'fill',
      reference: { value: null },
      actual: {
        value: 'VariableID:base-bg-alt-secondary',
        resourceType: 'token',
        displayName: 'base-bg-alt/secondary',
      },
    },
    assessment: {
      verdict: 'violation',
      source: 'component-contract',
      reasonCode: 'component-contract-required-paint-state',
      ruleId: 'component:background-plate.border-has-no-visible-fill',
      message: 'Type=Border must not have a visible fill',
    },
  };
  const unrelatedContractFinding = {
    message: 'variant: Primary → Secondary',
    nodeId: 'I:unrelated-component',
    nodePath: '[D] Card / [D] Button',
    nodeName: '[D] Button',
    visible: true,
    diffKind: 'other',
    details: {
      property: 'variant.View',
      reference: { value: 'Primary' },
      actual: { value: 'Secondary' },
    },
    assessment: {
      verdict: 'violation',
      source: 'component-contract',
      reasonCode: 'component-contract-pattern-violation',
      ruleId: 'component:button.view',
      message: 'View is not allowed in this context',
    },
  };
  instanceItem.diffs = instanceItem.diffs.concat(
    requiredPaintStateDiff,
    unrelatedContractFinding,
  );
  instanceItem.baselineDiffs = [
    allowedBaselineDiff,
    richerAllowedBaselineDiff,
    hiddenBaselineDiff,
  ];
  const baselineResults = computeBaselineChangeResults([
    componentItem,
    instanceItem,
    frameItem,
  ]);
  assert.equal(baselineResults.length, 1);
  assert.equal(
    baselineResults[0].diffs.length,
    2,
    'WIP must keep raw facts, merge duplicates and restore contract-required paint-state facts',
  );
  assert.equal(
    baselineResults[0].diffs[0].assessment.verdict,
    'allowed',
    'View construction must not manufacture or reinterpret a verdict',
  );
  assert.equal(
    baselineResults[0].diffs[0].context.surfaceContext.kind,
    'white',
    'Deduplication must preserve the duplicate carrying richer context evidence',
  );
  assert.equal(
    baselineResults[0].diffs[1].assessment.reasonCode,
    'component-contract-required-paint-state',
    'A contract-confirmed no-paint baseline must remain visible without native override evidence',
  );
  assert.equal(
    baselineResults[0].diffs.some(
      (diff) => diff.assessment?.reasonCode === 'component-contract-pattern-violation',
    ),
    false,
    'WIP must not import unrelated interpreted contract or pattern findings',
  );

  globalThis.figma = { mixed: Symbol('mixed') };
  const customStyleReasons = await describeCustomStyleReasons(
    {
      id: '1:custom-style',
      name: '[D] SpotlightBar',
      type: 'RECTANGLE',
      parent: null,
      fills: [
        {
          type: 'SOLID',
          visible: true,
          color: { r: 1, g: 1, b: 1 },
        },
      ],
      fillStyleId:
        'S:27ba925a81fd8c8a03755940253f21d1c9099141,317:32',
    },
    {
      tokenLabelMap: new Map(),
      isKnownStyleId: async () => false,
      resolveStyleMetadata: async () => null,
    },
  );
  assert.deepEqual(
    customStyleReasons,
    ['fill'],
    'An unresolved custom style must remain visible in the separate custom-styles audit',
  );

  console.log('Audit view builder regression checks passed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
