const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');

function loadModule() {
  const outfile = path.join(
    os.tmpdir(),
    `apollo-text-report-${process.pid}-${Date.now()}.cjs`,
  );
  esbuild.buildSync({
    entryPoints: [path.resolve(__dirname, '../src/stats/textReport.ts')],
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

function attach(parent, child) {
  child.parent = parent;
  parent.children.push(child);
  return child;
}

const documentNode = { type: 'DOCUMENT', name: 'Document', parent: null, children: [] };
const pageNode = attach(documentNode, {
  id: '0:1',
  type: 'PAGE',
  name: 'Page',
  visible: true,
  children: [],
});
const rootNode = attach(pageNode, {
  id: '1:1',
  type: 'FRAME',
  name: 'Form',
  visible: true,
  children: [],
});
const buttonNode = attach(rootNode, {
  id: '1:2',
  type: 'INSTANCE',
  name: '[D] Button',
  visible: true,
  componentProperties: {
    View: { value: 'Primary' },
  },
  children: [],
});
attach(buttonNode, {
  id: '1:3',
  type: 'TEXT',
  name: 'Label',
  visible: true,
  characters: 'Сохранение',
});
const hiddenFrame = attach(rootNode, {
  id: '1:4',
  type: 'FRAME',
  name: 'Hidden',
  visible: false,
  children: [],
});
attach(hiddenFrame, {
  id: '1:5',
  type: 'TEXT',
  name: 'Hidden label',
  visible: true,
  characters: 'Не отправлять',
});

const {
  buildApolloTextAuditReport,
  collectApolloTextFacts,
} = loadModule();

(async () => {
  const facts = await collectApolloTextFacts(
    [rootNode],
    (node) => `Page / ${node.name}`,
    async (node) => node.id === '1:2' ? 'button-key' : null,
  );
  assert.equal(facts.length, 1);
  assert.equal(facts[0].node.id, '1:3');
  assert.equal(facts[0].text, 'Сохранение');
  assert.equal(facts[0].owner.componentKey, 'button-key');
  assert.equal(facts[0].owner.variantProperties.View, 'Primary');
  assert.deepEqual(facts[0].node.ancestorNodeIds, ['1:2']);

  const sourceReport = {
    reportId: 'report-1',
    generatedAt: '2026-08-18T00:00:00.000Z',
    suggestedFileName: 'report.json',
    user: { id: 'user-1', name: 'Designer', slug: 'designer' },
    plugin: { name: 'Apollo', version: 'test' },
    figma: { fileKey: 'file', fileName: 'Test', editorType: 'figma' },
    scan: { channel: 'Desktop', pageType: 'form' },
  };
  const report = buildApolloTextAuditReport(sourceReport, facts);
  assert.equal(report.reportKind, 'apollo-text-audit-report');
  assert.equal(report.summary.scannedTextNodes, 1);
  assert.match(report.suggestedFileName, /_texts\.json$/);
  assert.equal(report.facts.texts[0].text, 'Сохранение');

  console.log('Text audit report regression checks passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
