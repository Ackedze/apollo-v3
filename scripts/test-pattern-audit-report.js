const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');

function loadModule() {
  const outfile = path.join(
    os.tmpdir(),
    `apollo-pattern-report-${process.pid}-${Date.now()}.cjs`,
  );
  esbuild.buildSync({
    entryPoints: [path.resolve(__dirname, '../src/stats/patternReport.ts')],
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

function item(
  id,
  name,
  componentName,
  variantName,
  nodePath,
  visible = true,
  ancestorNodeIds = [],
) {
  return {
    node: {
      id,
      name,
      type: 'INSTANCE',
      pageName: 'Page',
      path: nodePath,
      visible,
      ancestorNodeIds,
      figmaUrl: null,
    },
    component: {
      type: 'component',
      name: componentName,
      key: `${id}-component`,
      library: 'Web _ Corp Components',
      sourceFile: null,
    },
    variant: variantName ? {
      type: 'component',
      name: variantName,
      key: `${id}-variant`,
      library: 'Web _ Corp Components',
      sourceFile: null,
    } : null,
    reasons: [],
  };
}

function report(pageType) {
  const platePath = 'Page / Form / [D] BackgroundPlateSlot';
  const plateOne = item(
    '1:2',
    '[D] BackgroundPlateSlot',
    '[D] BackgroundPlateSlot',
    'Type=Primary',
    platePath,
  );
  const plateTwo = item(
    '1:6',
    '[D] BackgroundPlateSlot',
    '[D] BackgroundPlateSlot',
    'Type=Primary',
    platePath,
  );
  const titleOne = item(
    '1:3',
    '[D] TitleView',
    '[D] TitleView',
    'View=Medium, Skeleton=False',
    `${platePath} / [D] TitleView 1`,
    true,
    ['1:2'],
  );
  const titleTwo = item(
    '1:4',
    '[D] TitleView',
    '[D] TitleView',
    'View=Medium, Skeleton=False',
    `${platePath} / [D] TitleView 2`,
    true,
    ['1:6'],
  );
  const hiddenTitle = item(
    '1:5',
    '[D] TitleView',
    '[D] TitleView',
    'View=Medium',
    `${platePath} / Hidden TitleView`,
    false,
    ['1:2'],
  );
  const emptyCategory = { count: 0, items: [] };
  return {
    schemaVersion: 1,
    reportId: 'report-1',
    generatedAt: '2026-08-17T00:00:00.000Z',
    suggestedFileName: 'report.json',
    user: { id: 'user-1', name: 'Designer' },
    plugin: { name: 'Apollo', version: 'test' },
    figma: { fileKey: 'file-key', fileName: 'Test', editorType: 'figma' },
    scan: {
      channel: 'Desktop',
      pageType,
      startedAt: '2026-08-17T00:00:00.000Z',
      finishedAt: '2026-08-17T00:00:01.000Z',
      durationMs: 1000,
      shellAuditEnabled: false,
      experimentalContractV2Enabled: false,
      selection: [{ nodeId: '1:1', name: 'Form', nodeType: 'SECTION' }],
    },
    summary: { scannedComponents: 5 },
    categories: {
      deprecatedComponents: emptyCategory,
      updates: emptyCategory,
      customizations: emptyCategory,
      customizationsWip: emptyCategory,
      localComponents: emptyCategory,
      presets: emptyCategory,
      technicalComponents: emptyCategory,
      currentComponents: {
        count: 5,
        items: [plateOne, plateTwo, titleOne, titleTwo, hiddenTitle],
      },
      wrongChannel: emptyCategory,
      deprecatedStyles: emptyCategory,
      customPaintStyles: emptyCategory,
      customTextStyles: emptyCategory,
      unboundColors: emptyCategory,
      typography: emptyCategory,
      themization: emptyCategory,
    },
  };
}

const {
  FORM_PATTERN_RULE_IDS,
  GENERAL_PATTERN_RULE_IDS,
  buildApolloPatternAuditReport,
  parseVariantProperties,
} = loadModule();

assert.deepEqual(
  parseVariantProperties('View=Medium, Skeleton=False'),
  { View: 'Medium', Skeleton: 'False' },
);

const formReport = buildApolloPatternAuditReport(report('form'));
assert.equal(formReport.reportKind, 'apollo-pattern-audit-report');
assert.deepEqual(formReport.requestedRuleIds, [...FORM_PATTERN_RULE_IDS]);
assert.equal(formReport.summary.generalChangeCount, 0);
assert.equal(formReport.category.changeCount, 0);
assert.deepEqual(formReport.category.items, []);
assert.equal(formReport.facts.occurrences.length, 4);
assert.equal(formReport.facts.occurrences.some((entry) => entry.node.id === '1:5'), false);
const titleOccurrence = formReport.facts.occurrences.find(
  (entry) => entry.node.id === '1:3',
);
assert.deepEqual(titleOccurrence.variant.properties, {
  View: 'Medium',
  Skeleton: 'False',
});
assert.deepEqual(
  titleOccurrence.ancestors.map((entry) => entry.nodeId),
  ['1:2'],
);
assert.deepEqual(
  formReport.facts.occurrences
    .find((entry) => entry.node.id === '1:4')
    .ancestors.map((entry) => entry.nodeId),
  ['1:6'],
  'identically named sibling plates must stay distinct by Figma node id',
);
assert.match(formReport.suggestedFileName, /_patterns\.json$/);

const unspecifiedReport = buildApolloPatternAuditReport(report(null));
assert.deepEqual(unspecifiedReport.requestedRuleIds, []);

const generalCategory = {
  id: 'customizationsWip',
  title: 'Кастомизации [WIP]',
  count: 1,
  changeCount: 1,
  items: [{ node: { id: '1:3' }, changes: [{ property: 'fill' }] }],
};
const combinedReport = buildApolloPatternAuditReport(
  report(null),
  { category: generalCategory },
);
assert.equal(combinedReport.summary.generalChangeCount, 1);
assert.equal(combinedReport.category, generalCategory);
assert.deepEqual(combinedReport.requestedRuleIds, []);

const layoutRelations = [{
  id: '1:2>1:3:page-top-margin',
  relationKind: 'page-top-margin',
  measurement: { actualPx: 16, source: 'spacer-height' },
}];
const architectureReport = buildApolloPatternAuditReport(
  report(null),
  undefined,
  layoutRelations,
);
assert.deepEqual(
  architectureReport.requestedRuleIds,
  [...GENERAL_PATTERN_RULE_IDS],
);
assert.equal(architectureReport.summary.layoutRelationCount, 1);
assert.equal(architectureReport.facts.layoutRelations, layoutRelations);

console.log('Pattern audit report regression checks passed');
