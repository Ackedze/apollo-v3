const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');

const outfile = path.join(
  os.tmpdir(),
  `apollo-page-context-${process.pid}-${Date.now()}.cjs`,
);

esbuild.buildSync({
  entryPoints: [path.resolve(__dirname, '../src/types/pageContext.ts')],
  outfile,
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: ['node18'],
  logLevel: 'silent',
});

try {
  const { normalizeApolloPageType } = require(outfile);
  assert.equal(normalizeApolloPageType('form'), 'form');
  assert.equal(normalizeApolloPageType(' landing '), 'landing');
  assert.equal(normalizeApolloPageType(null), null);
  assert.equal(normalizeApolloPageType('unknown-page'), null);
  console.log('Page context checks passed');
} finally {
  fs.rmSync(outfile, { force: true });
}
