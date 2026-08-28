const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');

function loadCollectorModule() {
  const outfile = path.join(
    os.tmpdir(),
    `apollo-stats-collector-${process.pid}-${Date.now()}.cjs`,
  );
  esbuild.buildSync({
    entryPoints: [path.resolve(__dirname, '../src/stats/collector.ts')],
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

function predicateReport(id) {
  return {
    schemaVersion: 1,
    reportKind: 'apollo-predicate-report',
    reportId: id,
    sourceReportId: 'source-report',
    suggestedFileName: `${id}.json`,
    user: { name: 'Test User' },
    summary: {},
    validation: {
      rules: [],
      result: { evaluations: [], coverage: {} },
    },
    ui: { responseMarkdown: '', findings: [] },
  };
}

async function main() {
  const { submitApolloPredicateStatsReport } = loadCollectorModule();
  const originalFetch = global.fetch;
  const originalAbortController = global.AbortController;
  const originalLog = console.log;
  const originalWarn = console.warn;

  try {
    console.log = () => {};
    console.warn = () => {};
    global.AbortController = undefined;

    let activeRequests = 0;
    let maxActiveRequests = 0;
    const serializedReportIds = [];
    global.fetch = async (_url, options) => {
      assert.equal('signal' in options, false);
      activeRequests += 1;
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
      serializedReportIds.push(JSON.parse(options.body).reportId);
      await new Promise((resolve) => setTimeout(resolve, 20));
      activeRequests -= 1;
      return new Response(JSON.stringify({ path: 'report.json' }), {
        status: 201,
      });
    };

    await Promise.all([
      submitApolloPredicateStatsReport(predicateReport('first'), 'collector'),
      submitApolloPredicateStatsReport(predicateReport('second'), 'collector'),
    ]);
    assert.equal(maxActiveRequests, 1);
    assert.deepEqual(serializedReportIds, ['first', 'second']);

    let retryAttempts = 0;
    global.fetch = async () => {
      retryAttempts += 1;
      if (retryAttempts === 1) {
        return new Response('temporary conflict', { status: 500 });
      }
      return new Response(JSON.stringify({ path: 'retry.json' }), {
        status: 201,
      });
    };

    await submitApolloPredicateStatsReport(
      predicateReport('retry'),
      'collector',
    );
    assert.equal(retryAttempts, 2);

    let permanentFailureAttempts = 0;
    global.fetch = async () => {
      permanentFailureAttempts += 1;
      return new Response('invalid payload', { status: 400 });
    };
    await assert.rejects(
      submitApolloPredicateStatsReport(
        predicateReport('permanent-failure'),
        'collector',
      ),
      /HTTP 400: invalid payload/,
      'A final upload failure must be observable by the delivery outbox.',
    );
    assert.equal(permanentFailureAttempts, 1);
  } finally {
    global.fetch = originalFetch;
    global.AbortController = originalAbortController;
    console.log = originalLog;
    console.warn = originalWarn;
  }

  console.log('Apollo stats collector tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
