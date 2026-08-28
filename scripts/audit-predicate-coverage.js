const fs = require('node:fs');
const path = require('node:path');

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

const predicatePath = process.argv[2];
if (!predicatePath) {
  fail('Usage: node scripts/audit-predicate-coverage.js <*_predicates.json>');
} else if (!predicatePath.endsWith('_predicates.json')) {
  fail('Expected an Apollo *_predicates.json report.');
} else {
  const wipPath = predicatePath.replace(/_predicates\.json$/, '_customizations-wip.json');
  if (!fs.existsSync(predicatePath)) {
    fail(`Predicate report not found: ${predicatePath}`);
  } else if (!fs.existsSync(wipPath)) {
    fail(`Customization WIP report not found: ${wipPath}`);
  } else {
    const predicate = JSON.parse(fs.readFileSync(predicatePath, 'utf8'));
    const wip = JSON.parse(fs.readFileSync(wipPath, 'utf8'));
    const releasedRuleIds = new Set(
      (predicate.validation?.rules || []).map((rule) => rule.ruleId),
    );
    const isReleased = (ruleId) => Array.from(releasedRuleIds).some(
      (releasedRuleId) =>
        releasedRuleId === ruleId || releasedRuleId.startsWith(`${ruleId}.`),
    );
    const changes = (wip.category?.items || []).flatMap((item) =>
      (item.changes || []).map((change) => ({
        rootNodeId: item.node?.id || null,
        rootName: item.node?.name || null,
        nodeId: change.node?.id || null,
        nodeName: change.node?.name || null,
        property: change.property || null,
        ruleIds: (change.componentRules || [])
          .map((rule) => rule.ruleId)
          .filter(Boolean),
      })),
    );
    const result = {
      predicateReport: path.basename(predicatePath),
      customizationReport: path.basename(wipPath),
      summary: {
        changeCount: changes.length,
        coveredChangeCount: 0,
        uncoveredChangeCount: 0,
        noRuleEvidenceCount: 0,
      },
      uncovered: [],
      noRuleEvidence: [],
    };
    for (const change of changes) {
      const coveredRuleIds = change.ruleIds.filter(isReleased);
      if (coveredRuleIds.length) {
        result.summary.coveredChangeCount += 1;
      } else if (!change.ruleIds.length) {
        result.summary.noRuleEvidenceCount += 1;
        result.noRuleEvidence.push(change);
      } else {
        result.summary.uncoveredChangeCount += 1;
        result.uncovered.push(change);
      }
    }
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
}
