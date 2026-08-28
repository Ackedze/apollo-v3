const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');

function loadModule() {
  const outfile = path.join(
    os.tmpdir(),
    `apollo-layout-relations-${process.pid}-${Date.now()}.cjs`,
  );
  esbuild.buildSync({
    entryPoints: [path.resolve(__dirname, '../src/stats/layoutRelations.ts')],
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

function node(type, id, name, y, height, extra = {}) {
  return {
    type,
    id,
    name,
    visible: true,
    parent: null,
    absoluteBoundingBox: { x: 0, y, width: 100, height },
    ...extra,
  };
}

function attach(parent, children) {
  parent.children = children;
  for (const child of children) child.parent = parent;
  return parent;
}

const page = node('PAGE', '0:0', 'Page', 0, 1000);
const root = node('FRAME', '1:1', '[D] Content', 56, 804, {
  layoutMode: 'VERTICAL',
  itemSpacing: 0,
});
root.parent = page;
const topMargin = node('INSTANCE', '1:2', 'TopMargin', 56, 16);
const contentBody = node('FRAME', '1:3', 'ContentBody', 72, 400, {
  layoutMode: 'VERTICAL',
  itemSpacing: 40,
});
const title = node('INSTANCE', '1:4', '[D] TitleView', 72, 48, {
  componentProperties: {
    View: { type: 'VARIANT', value: 'xLarge' },
  },
});
const body = node('FRAME', '1:5', 'Body', 160, 300, {
  layoutMode: 'VERTICAL',
  itemSpacing: 24,
});
attach(contentBody, [title, body]);
attach(root, [topMargin, contentBody]);

const { collectApolloLayoutRelations } = loadModule();
const relations = collectApolloLayoutRelations(
  [root],
  (entry) => entry.name,
);

assert.equal(relations.length, 2);
const topRelation = relations.find((entry) => entry.relationKind === 'page-top-margin');
assert.equal(topRelation.measurement.actualPx, 16);
assert.equal(topRelation.measurement.source, 'spacer-height');
assert.deepEqual(topRelation.semantic, {
  fromRole: 'header',
  toRole: 'title-view',
});

const contentRelation = relations.find((entry) => entry.relationKind === 'next-content-gap');
assert.equal(contentRelation.measurement.actualPx, 40);
assert.equal(contentRelation.container.nodeId, '1:3');
assert.equal(contentRelation.container.itemSpacing, 40);
assert.equal(contentRelation.semantic.toRole, 'content');

body.visible = false;
assert.equal(
  collectApolloLayoutRelations([root], (entry) => entry.name).length,
  1,
  'hidden following layers must not produce layout relations',
);

console.log('Layout relation snapshot regression checks passed');
