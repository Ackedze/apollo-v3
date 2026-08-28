const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');

function loadDeliveryModule() {
  const outfile = path.join(
    os.tmpdir(),
    `apollo-stats-delivery-${process.pid}-${Date.now()}.cjs`,
  );
  esbuild.buildSync({
    entryPoints: [path.resolve(__dirname, '../src/stats/delivery.ts')],
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

function createMemoryStorage() {
  const values = new Map();
  return {
    async getAsync(key) {
      return values.get(key);
    },
    async setAsync(key, value) {
      values.set(key, value);
    },
    read(key) {
      return values.get(key);
    },
  };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });
  return { promise, resolve, reject };
}

async function main() {
  const {
    APOLLO_STATS_OUTBOX_STORAGE_KEY,
    createApolloStatsDelivery,
  } = loadDeliveryModule();

  const storage = createMemoryStorage();
  const firstUpload = deferred();
  const uploadedIds = [];
  const statuses = [];
  const delivery = createApolloStatsDelivery({
    storage,
    upload: async (item) => {
      uploadedIds.push(item.report.reportId);
      await firstUpload.promise;
      return { path: 'report.json', commitUrl: null };
    },
    onStatus: (status) => statuses.push(status),
    now: () => new Date('2026-08-25T10:00:00.000Z'),
  });

  await delivery.enqueuePredicateReport(predicateReport('first'));
  assert.equal(
    storage.read(APOLLO_STATS_OUTBOX_STORAGE_KEY).length,
    1,
    'Report must be durable before the network upload finishes.',
  );
  await delivery.enqueuePredicateReport(predicateReport('first'));
  assert.equal(
    storage.read(APOLLO_STATS_OUTBOX_STORAGE_KEY).length,
    1,
    'Repeated enqueue must not duplicate the same reportId.',
  );

  await delivery.enqueuePredicateReport(predicateReport('second'));
  assert.equal(
    storage.read(APOLLO_STATS_OUTBOX_STORAGE_KEY).length,
    2,
    'A second report must be persisted while the first upload is in flight.',
  );
  firstUpload.resolve();
  await delivery.flush();
  assert.deepEqual(uploadedIds, ['first', 'second']);
  assert.deepEqual(storage.read(APOLLO_STATS_OUTBOX_STORAGE_KEY), []);
  assert.equal(statuses.at(-1).phase, 'success');
  assert.equal(statuses.at(-1).uploadedCount, 2);

  const failedStorage = createMemoryStorage();
  const failedStatuses = [];
  let failedAttempts = 0;
  const failingDelivery = createApolloStatsDelivery({
    storage: failedStorage,
    upload: async () => {
      failedAttempts += 1;
      throw new Error('temporary outage');
    },
    onStatus: (status) => failedStatuses.push(status),
  });
  await failingDelivery.enqueuePredicateReport(predicateReport('retained'));
  await failingDelivery.flush();
  const retained = failedStorage.read(APOLLO_STATS_OUTBOX_STORAGE_KEY);
  assert.equal(failedAttempts, 1);
  assert.equal(retained.length, 1);
  assert.equal(retained[0].id, 'retained');
  assert.equal(retained[0].attempts, 1);
  assert.equal(retained[0].lastError, 'temporary outage');
  assert.equal(failedStatuses.at(-1).phase, 'failed');

  const recoveredStatuses = [];
  const recoveredDelivery = createApolloStatsDelivery({
    storage: failedStorage,
    upload: async () => ({ path: 'recovered.json', commitUrl: null }),
    onStatus: (status) => recoveredStatuses.push(status),
  });
  await recoveredDelivery.flush();
  assert.deepEqual(
    failedStorage.read(APOLLO_STATS_OUTBOX_STORAGE_KEY),
    [],
    'A new plugin session must flush reports retained by the previous session.',
  );
  assert.equal(recoveredStatuses.at(-1).phase, 'success');

  console.log('Apollo stats delivery tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
