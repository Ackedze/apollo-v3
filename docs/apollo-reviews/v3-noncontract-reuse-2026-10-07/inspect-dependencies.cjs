// Read-only static relative-import inspection; no bundling or production outputs.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const repo = path.resolve(__dirname, '../../..');
const services = [
  'themeAudit', 'auditViewBuilder', 'localComponentDependencyAudit',
  'libraryComponentFreshness', 'libraryUpdateResults', 'channelAudit',
  'deprecatedStyleAudit', 'detachedComponentSource', 'componentClassifier',
  'auditTargetCollector', 'auditResults', 'styleMetadata',
].map(name => `src/services/${name}.ts`);
const entries = ['src/code.ts', 'apps/apollo-v4/src/code.ts', 'apps/apollo-v4/src/ui.js',
  'src/reference/library.ts', ...services];
const files = new Map();
function resolve(from, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(repo, path.dirname(from), spec);
  for (const p of [base, ...['.ts', '.tsx', '.js', '.jsx', '.json', '/index.ts', '/index.tsx', '/index.js'].map(s => base + s)]) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return path.relative(repo, p);
  }
  return null;
}
function inspect(file) {
  if (files.has(file)) return files.get(file);
  const buf = fs.readFileSync(path.join(repo, file));
  const record = { path: file, bytes: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex'), runtimeRelative: [], typeOnlyRelative: [], externalOrUnresolved: [] };
  files.set(file, record);
  if (!/\.[cm]?[jt]sx?$/.test(file)) return record;
  const ast = ts.createSourceFile(file, buf.toString(), ts.ScriptTarget.Latest, true);
  function add(spec, typeOnly) {
    const target = resolve(file, spec);
    if (target) {
      const list = typeOnly ? record.typeOnlyRelative : record.runtimeRelative;
      if (!list.includes(target)) list.push(target);
    } else if (!record.externalOrUnresolved.includes(spec)) record.externalOrUnresolved.push(spec);
  }
  function visit(n) {
    if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) {
      const c = n.importClause, b = c?.namedBindings;
      const onlyTypes = c?.isTypeOnly || (!c?.name && b && ts.isNamedImports(b) && b.elements.length > 0 && b.elements.every(e => e.isTypeOnly));
      add(n.moduleSpecifier.text, Boolean(onlyTypes));
    } else if (ts.isExportDeclaration(n) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)) {
      add(n.moduleSpecifier.text, Boolean(n.isTypeOnly));
    } else if (ts.isCallExpression(n) && n.arguments.length === 1 && ts.isStringLiteral(n.arguments[0]) &&
      (n.expression.kind === ts.SyntaxKind.ImportKeyword || ts.isIdentifier(n.expression) && n.expression.text === 'require')) {
      add(n.arguments[0].text, false);
    }
    ts.forEachChild(n, visit);
  }
  visit(ast); return record;
}
function closure(entry) {
  const found = new Set(), stack = [entry];
  while (stack.length) {
    const file = stack.pop();
    if (found.has(file)) continue;
    found.add(file); stack.push(...inspect(file).runtimeRelative);
  }
  return [...found].sort();
}
const closures = Object.fromEntries(entries.map(e => [e, closure(e)]));
const result = {
  inspectedAt: new Date().toISOString(), methodology: 'TypeScript AST, literal relative runtime imports/exports/require/dynamic import only. Type-only imports are excluded from runtime closure. Package imports, aliases, build transforms and nonliteral imports are outside this analysis; this is not a build inventory.',
  tool: { node: process.version, typescript: ts.version, esbuild: require('esbuild').version },
  closures,
  services: services.map(s => ({ path: s, v3Main: closures[entries[0]].includes(s), v4Main: closures[entries[1]].includes(s), v4Ui: closures[entries[2]].includes(s), legacyContractDependencies: closures[s].filter(p => p.startsWith('src/contracts/')).length })),
  files: [...files.values()].sort((a, b) => a.path.localeCompare(b.path)),
};
fs.writeFileSync(path.join(__dirname, 'dependency-inspection.json'), JSON.stringify(result, null, 2) + '\n');
process.stdout.write(JSON.stringify({ readFiles: result.files.length, services: result.services, tool: result.tool }, null, 2) + '\n');
