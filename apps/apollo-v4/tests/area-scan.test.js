const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const moduleBox = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/area-scan.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports: moduleBox.exports, module: moduleBox, require:require('node:module').createRequire(path.resolve(__dirname,'../src/area-scan.ts')),setTimeout,clearTimeout });
const { scanArea, AREA_NODE_LIMIT, AREA_COMPONENT_LIMIT } = moduleBox.exports;
function area(count, type) {
  const page = { type: 'PAGE', id: 'page' }, root = { type: 'FRAME', id: 'area', visible: true, parent: page, children: [] };
  for (let i = 0; i < count; i++) root.children.push({ id: 'node-' + i, type, name: 'Node', parent: root, visible: true,
    x: 0, y: 0, width: 1, height: 1, getMainComponentAsync: async () => ({ key: 'test-key' }) });
  return root;
}
test('node traversal limit is explicit and does not scan beyond its bound', async () => {
  const result = await scanArea([area(AREA_NODE_LIMIT, 'RECTANGLE')], () => {});
  assert.equal(result.selection.complete, false); assert.equal(result.selection.issues[0], 'area-node-limit');
  assert.equal(result.selection.scannedNodes, AREA_NODE_LIMIT);
});
test('component limit preserves a partial identity inventory with explicit incomplete coverage', async () => {
  const result = await scanArea([area(AREA_COMPONENT_LIMIT + 1, 'INSTANCE')], () => {});
  assert.equal(result.selection.complete, false); assert.equal(result.selection.issues[0], 'area-component-limit');
  assert.equal(result.selection.components.length, AREA_COMPONENT_LIMIT);
});
test('a selected child of a hidden ancestor is skipped, even when the hidden ancestor is not selected', async () => {
  const root = area(1, 'INSTANCE'); root.visible = false;
  const result = await scanArea([root.children[0]], () => {});
  assert.equal(result.selection.scannedNodes, 0); assert.equal(result.selection.components.length, 0);
});
