const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');

function loadModule() {
  const outfile = path.join(
    os.tmpdir(),
    `apollo-audit-results-${process.pid}-${Date.now()}.cjs`,
  );
  esbuild.buildSync({
    entryPoints: [path.resolve(__dirname, '../src/services/auditResults.ts')],
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

function auditItem(overrides = {}) {
  return {
    id: '1:1',
    name: '[D] Button',
    nodeType: 'INSTANCE',
    pageName: 'Page',
    fullPath: 'Page/[D] Button',
    pathSegments: [],
    relevance: 'current',
    librarySource: 'Web :: Core',
    librarySourceFile: 'components.json',
    componentKey: 'button-key',
    isLocal: false,
    reference: null,
    comparisonIssues: [],
    diffs: [],
    ...overrides,
  };
}

async function main() {
  const { buildAuditResultViews, prepareAuditReport } = loadModule();
  const assessedDiff = {
      message: 'Заливка: neutral/100 → accent/secondary',
      nodePath: 'Page/[D] Button/Background',
      nodeName: 'Background',
      nodeId: '1:1;2:1',
      visible: true,
      diffKind: 'paint',
      context: {
        actualComponentKey: 'button-key',
        referenceComponentKey: 'button-key',
        referenceOrigin: 'host',
        actualNestedOwnerComponentKey: null,
        actualNestedOwnerPath: null,
        actualNestedOwnerRelativePath: null,
        nestedOwnerComponentKey: null,
        nestedOwnerComponentRole: null,
        nestedOwnerPath: null,
        nestedOwnerRelativePath: null,
      },
      details: {
        property: 'fill',
        reference: { value: 'neutral/100', resourceType: 'token' },
        actual: { value: 'accent/secondary', resourceType: 'token' },
      },
      assessment: {
        verdict: 'violation',
        source: 'component-contract',
        reasonCode: 'component-contract-violation',
        ruleId: 'component:test.button.fill',
        message: 'Button fill is fixed.',
        remediation: null,
      },
  };
  const current = auditItem({
    diffs: [assessedDiff],
    baselineDiffs: [Object.assign({}, assessedDiff, {assessment: null})],
  });
  const update = auditItem({
    id: '1:2',
    relevance: 'update',
    updateReasons: ['library-update-available'],
  });
  const local = auditItem({
    id: '1:3',
    name: 'Local component',
    relevance: 'unknown',
    componentKey: null,
    isLocal: true,
  });
  const ignoredLocal = auditItem({
    id: '1:4',
    name: '❌template',
    relevance: 'unknown',
    componentKey: null,
    isLocal: true,
  });
  const detachedContractCustomization = auditItem({
    id: '1:5',
    name: '[D] BodyRow :: Basic',
    nodeType: 'FRAME',
    componentKey: 'body-row-basic-key',
    customizationOnly: true,
    diffs: [{
      message: 'В BodyRow :: Basic должно быть от одной до пяти видимых информационных ячеек',
      nodePath: '[D] BodyRow :: Basic',
      nodeName: '[D] BodyRow :: Basic',
      nodeId: '1:5',
      visible: true,
      context: { referenceOrigin: 'host' },
      diffKind: 'other',
      details: {
        property: 'component.composition',
        reference: { value: '1-5' },
        actual: { value: 6 },
      },
    }],
  });
  const checkState = {
    relevanceBuckets: {
      technical: [],
      deprecated: [],
      update: [update],
      current: [current],
      unknown: [],
    },
    themizationEntries: [],
    wrongChannelEntries: [],
    localLibraryItems: [local, ignoredLocal],
    presetItems: [],
    detachedEntries: [],
    customStyleEntries: [],
    deprecatedStyleEntries: [],
    contractCustomizationItems: [detachedContractCustomization],
    totalItems: 3,
  };

  const views = buildAuditResultViews(checkState);
  assert.deepEqual(views.visibleViews.local.map((item) => item.id), ['1:3']);
  assert.equal(views.visibleViews.relevance.current[0], current);
  assert.equal(views.statsViews.updates[0], update);
  assert.equal(views.statsViews.currentComponents[0], current);
  assert.deepEqual(
    views.visibleViews.changes.map((item) => item.id),
    ['1:1', '1:5'],
  );
  assert.deepEqual(
    views.visibleViews.changesWip.map((item) => item.id),
    ['1:1'],
    'WIP customizations must only contain direct baseline evidence',
  );
  assert.deepEqual(
    views.statsViews.currentComponents.map((item) => item.id),
    ['1:1'],
    'Detached contract findings must not pollute current components',
  );

  let componentKeyReads = 0;
  const {
    report,
    agentReport,
    baselineCustomizationReport,
    patternReport,
  } = await prepareAuditReport({
    pluginVersion: 'test',
    user: { id: 'user-1', name: 'Test User' },
    figma: {
      fileKey: 'file-1',
      fileName: 'Audit fixture',
      editorType: 'figma',
    },
    scan: {
      channel: 'Desktop',
      pageType: 'form',
      startedAt: new Date('2026-08-04T09:00:00.000Z'),
      finishedAt: new Date('2026-08-04T09:00:01.000Z'),
      shellAuditEnabled: false,
    },
    selection: [
      { id: 'selection:1', name: 'Frame', type: 'FRAME' },
      { id: 'selection:2', name: 'Button', type: 'INSTANCE' },
    ],
    checkState,
    views,
    resolveNodePath: (node) => `Page/${node.name}`,
    resolveComponentKey: async () => {
      componentKeyReads += 1;
      return 'selection-component-key';
    },
    resolveStyleResource: () => null,
    resolveTokenResource: () => null,
  });

  assert.equal(componentKeyReads, 1);
  assert.equal(report.summary.scannedComponents, 3);
  assert.equal(report.scan.pageType, 'form');
  assert.equal(agentReport.scan.pageType, 'form');
  assert.equal(baselineCustomizationReport.scan.pageType, 'form');
  assert.equal(patternReport.scan.pageType, 'form');
  assert.equal(patternReport.reportKind, 'apollo-pattern-audit-report');
  assert.deepEqual(patternReport.requestedRuleIds, []);
  assert.equal(patternReport.summary.generalChangeCount, 1);
  assert.equal(patternReport.category.count, 1);
  assert.equal(patternReport.category.changeCount, 1);
  assert.equal(patternReport.category.items.length, 1);
  assert.equal(report.scan.selection[0].componentKey, null);
  assert.equal(
    report.scan.selection[1].componentKey,
    'selection-component-key',
  );
  assert.equal(report.categories.localComponents.count, 1);
  assert.equal(report.categories.updates.count, 1);
  assert.equal(agentReport.reportId, `${report.reportId}:agent`);
  assert.equal(
    baselineCustomizationReport.reportId,
    `${report.reportId}:customizations-wip`,
  );
  assert.equal(
    baselineCustomizationReport.reportKind,
    'apollo-customizations-wip-report',
  );
  assert.equal(baselineCustomizationReport.category.count, 1);
  assert.equal(baselineCustomizationReport.category.changeCount, 1);
  assert.equal(
    baselineCustomizationReport.category.items[0].changes[0].assessment.verdict,
    'violation',
  );
  assert.equal(
    baselineCustomizationReport.category.items[0].changes[0].assessment.ruleId,
    'component:test.button.fill',
  );
  assert.equal(
    views.visibleViews.changesWip[0].diffs[0].assessment,
    null,
    'The raw WIP fact must remain uninterpreted before report reconciliation',
  );
  assert.deepEqual(
    baselineCustomizationReport.category.items[0].changes[0].componentRules,
    [],
  );
  assert.equal(
    baselineCustomizationReport.category.items[0].changes[0].presentation,
    null,
  );
  assert.match(
    baselineCustomizationReport.suggestedFileName,
    /_customizations-wip\.json$/,
  );

  console.log('Audit result orchestration regression checks passed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
