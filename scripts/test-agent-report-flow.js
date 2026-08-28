const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'src/code.ts'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'src/ui.html'), 'utf8');

assert.match(code, /v1\/analyze\/codex\/runs/);
assert.match(code, /v1\/validate\/predicates/);
assert.match(
  code,
  /lastApolloBaselineCustomizationReport = baselineCustomizationReport/,
  'Apollo v3 must retain the deterministic WIP report for the agent tab.',
);
assert.match(code, /body: JSON\.stringify\(\{ report \}\)/);
const patternRequestFunction = code.slice(
  code.indexOf('async function requestPredicatePatternReport'),
  code.indexOf('async function requestCodexTextReport'),
);
assert.doesNotMatch(
  patternRequestFunction,
  /requestedRuleIds/,
  'Missing pageType must not skip the general pattern audit request.',
);
assert.match(patternRequestFunction, /ruleSet: 'buttons-group-pilot'/);
assert.match(patternRequestFunction, /report\.evidenceBundle/);
assert.match(code, /buildApolloPredicateUiValidation/);
assert.match(code, /buildApolloPredicateStatsReport/);
assert.doesNotMatch(
  patternRequestFunction,
  /await statsDelivery\.enqueuePredicateReport\(/,
  'Predicate UI must not wait for the dedicated stats report upload.',
);
assert.match(
  patternRequestFunction,
  /void statsDelivery[\s\S]*?\.enqueuePredicateReport\(/,
  'Predicate stats report must be persisted asynchronously after UI validation.',
);
assert.match(code, /createApolloStatsDelivery/);
assert.match(code, /retryStatsUpload: \(\) => statsDelivery\.flush\(\)/);
assert.match(code, /type: 'apollo-agent-progress'/);
assert.match(code, /responseMarkdown/);
assert.match(code, /findings: Array\.isArray\(validation\.findings\)/);
assert.match(code, /validation\.allowedCustomizations\.map/);
assert.match(ui, /msg\.type === 'apollo-agent-progress'/);
assert.match(ui, /msg\.type === 'apollo-stats-delivery-status'/);
assert.match(ui, /type: 'retry-stats-upload'/);
assert.match(ui, /function handleAgentProgress\(payload\)/);
assert.match(
  ui,
  /activeApolloView === 'texts' &&[\s\S]*agentRequestedTextReportId !== textReportId/,
  'Text audit must stay lazy while the predicate contour is being tested.',
);
assert.match(ui, /Math\.round\(progress\)/);
assert.match(ui, /tr\[data-node-id\]/);
assert.match(ui, /focusNodeById\(findingRow\.getAttribute\('data-node-id'\)\)/);
assert.match(ui, /class="md-tr md-tr--interactive"/);
assert.match(ui, /tabindex="0" role="button"/);
assert.match(ui, /message\.findings/);
assert.match(ui, /function buildAgentFindingResetActions\(finding\)/);
assert.match(ui, /resolveViewArray\(\['changesWip'\]\)/);
assert.match(ui, /type: 'reset-customization-group'/);
assert.match(ui, /data-agent-finding-action/);
assert.match(ui, /function mergePatternReportTables\(blocks, findings\)/);
assert.match(ui, /rowsByScope\[currentScope\]\.push\(\.\.\.rows\)/);
assert.doesNotMatch(
  ui,
  /patternFindings\[findingIndex\]/,
  'Pattern rows must stay in their Markdown section instead of borrowing scope by global finding index.',
);
assert.match(ui, /label: 'База'/);
assert.match(ui, /label: 'Раздел'/);
assert.match(ui, /blocks: \[createTable\('general'\)\]/);
assert.match(ui, /blocks: \[createTable\('page-specific'\)\]/);
assert.match(ui, /patternScope: scope/);
assert.match(ui, /function getPatternReportScope\(value\)/);
assert.match(ui, /function collectAgentFindingTables\(blocks, tables = \[\]\)/);
assert.match(ui, /function normalizeAgentReportBlock\(block\)/);
assert.match(ui, /headers: \['Статус', 'Причина', 'Ожидание', 'Действие'\]/);
assert.match(ui, /function normalizeAgentFindingRows\(block\)/);
assert.match(ui, /function getCompactAgentSource\(value\)/);
assert.match(ui, /slice\(-2\)\.join\('\/'\)/);
assert.match(ui, /function renderStackedMarkdownTableCell\(value\)/);
assert.match(ui, /\.md-cell-secondary\s*\{[^}]*color:\s*rgba\(4, 4, 19, 0\.55\)/);
assert.match(ui, /function normalizeAllowedPatternRows\(block\)/);
assert.match(ui, /getMarkdownStatusSortOrder\(left\[0\]\)/);
assert.match(ui, /function sortAgentFindingsByPriority\(findings\)/);
assert.match(ui, /finding\.patternScope === scope/);
assert.match(ui, /data-md-tab-index/);
assert.match(ui, /data-md-tab-panel/);
assert.match(ui, /function activateMarkdownTab\(tab\)/);
assert.match(ui, /function getMarkdownStatusType\(value\)/);
assert.match(ui, /allowed:\s*2/);
assert.match(ui, /function getMarkdownTableHeaders\(block\)/);
assert.match(ui, /md-status--error/);
assert.match(ui, /statusType === 'success'/);
assert.match(ui, /\? 'Ок'/);
assert.match(ui, /: 'Зови ДС'/);
assert.match(ui, /table-layout: fixed/);
assert.match(ui, /\.md-block--table\s*\{[^}]*padding:\s*12px 0/);
assert.match(ui, /\.md-table-wrap\s*\{[^}]*width:\s*calc\(100% \+ 24px\)/);
assert.match(ui, /\.md-table-wrap\s*\{[^}]*margin-left:\s*-12px/);
assert.match(ui, /\.md-th:first-child,[\s\S]*?width:\s*102px/);
assert.match(ui, /\.md-tr--interactive:hover \.md-td,[\s\S]*?background:\s*#f5f5f5/);
assert.match(ui, /\.agent-chat-overlay\.report-visible,[\s\S]*?background:\s*#fff/);
assert.doesNotMatch(
  ui,
  /\.md-table-scroll\s*\{[^}]*overflow-x:\s*auto/,
  'Markdown audit tables must fit without a horizontal scrollbar.',
);
assert.match(ui, /resetActions\[0\]\.label \|\| 'Применить'/);
assert.match(ui, /getLayoutTokenBindingRemediation/);
assert.match(ui, /findInterpretedCustomizationDiff/);
assert.match(ui, /resolveViewArray\(\['changes'\]\)/);
assert.doesNotMatch(
  ui,
  /getAgentResetProposal/,
  'Agent findings must not authorize mutations; Apollo resolves reset actions locally.',
);
assert.match(
  ui,
  /escapeHtml\(errorDetails\)/,
  'Proxy errors must be visible in the report tab for debugging.',
);

console.log('Apollo v3 Codex report flow checks passed.');
