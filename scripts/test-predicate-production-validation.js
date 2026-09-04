const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');

function loadModule() {
  const outfile = path.join(
    os.tmpdir(),
    `apollo-predicate-production-validation-${process.pid}-${Date.now()}.cjs`,
  );
  esbuild.buildSync({
    entryPoints: [path.resolve(__dirname, '../src/predicate/predicateValidation.ts')],
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

const { buildApolloPredicateUiValidation } = loadModule();
const source = {
  path: 'design-system_ab/JSONS/web/components/web-core/core/Amount/rules.json',
  checksum: 'a'.repeat(64),
};
const baseEvaluation = {
  applicability: 'applicable',
  classification: 'violation',
  severity: 'error',
  actionId: null,
};

function evaluation(overrides) {
  return Object.assign({}, baseEvaluation, {
    evaluationId: overrides.evaluationId,
    ruleId: overrides.ruleId,
    ruleRevision: 2,
    subjectNodeId: overrides.subjectNodeId,
    subjectNodeName: overrides.subjectNodeName,
    focusNodeId: overrides.focusNodeId,
    focusNodeName: overrides.focusNodeName,
    trace: overrides.trace,
  });
}

const validation = buildApolloPredicateUiValidation({
  rules: [{
    ruleId: 'component:web-core.amount.opacity-property-is-forbidden',
    revision: 2,
    severity: 'error',
    source,
    presentation: {
      schemaVersion: 'apollo.predicate-presentation.v1',
      title: 'Включена запрещённая прозрачность Amount',
      observed: 'У компонента «{{targetName}}» свойство Opacity имеет значение {{actual}}.',
      expectation: 'У Minor и Currency свойство Opacity должно иметь значение False.',
      action: 'Установить свойство Opacity=False.',
    },
  }, {
    ruleId: 'rule:forms.construction-rules.layout-8-4',
    revision: 1,
    severity: 'error',
    source: {
      path: 'design-system_ab/patterns/p_form-construction-rules.md',
      checksum: 'b'.repeat(64),
    },
    scope: { platform: ['desktop'], pageType: ['form'] },
    presentation: {
      schemaVersion: 'apollo.predicate-presentation.v1',
      title: 'Нарушена сетка формы 8+4',
      observed: 'Фактическое значение: {{actual}}.',
      expectation: 'Ожидаемое значение: {{expected}}.',
      action: 'Вернуть сетку формы к 8+4.',
    },
  }, {
    ruleId: 'component:test.missing-presentation',
    revision: 1,
    severity: 'error',
    source: {
      path: 'design-system_ab/JSONS/test/rules.json',
      checksum: 'c'.repeat(64),
    },
  }, {
    ruleId: 'component:test.raw-binding-presentation',
    revision: 1,
    severity: 'error',
    source: {
      path: 'design-system_ab/JSONS/test/rules.json',
      checksum: 'd'.repeat(64),
    },
    presentation: {
      schemaVersion: 'apollo.predicate-presentation.v1',
      title: 'Интервал задан без токена',
      observed: 'Интервал MiddleSlot имеет значение {{actual}} без token binding.',
      expectation: 'Интервал должен быть привязан к токену Spacing.',
      action: 'Привязать текущее значение к токену Spacing.',
    },
  }],
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'production-renderer-snapshot',
    ruleRelease: 'release',
    coverage: {
      total: 4,
      byClassification: { violation: 4 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [
      evaluation({
        evaluationId: 'amount-opacity',
        ruleId: 'component:web-core.amount.opacity-property-is-forbidden',
        subjectNodeId: '22:3',
        subjectNodeName: 'Minor',
        focusNodeId: '22:3',
        focusNodeName: 'Minor',
        trace: {
          predicate: 'equals',
          truth: 'false',
          reason: 'values differ',
          actual: 'True',
          expected: 'False',
          factPaths: ['component.properties.Opacity'],
        },
      }),
      evaluation({
        evaluationId: 'form-layout',
        ruleId: 'rule:forms.construction-rules.layout-8-4',
        subjectNodeId: '30:1',
        subjectNodeName: 'Form layout',
        focusNodeId: '30:1',
        focusNodeName: 'Form layout',
        trace: {
          predicate: 'approximately-equals',
          truth: 'false',
          reason: 'values differ',
          actual: 12,
          expected: 24,
          factPaths: ['composition.formEightFourLayout.gutter'],
        },
      }),
      evaluation({
        evaluationId: 'missing-presentation',
        ruleId: 'component:test.missing-presentation',
        subjectNodeId: '40:1',
        subjectNodeName: 'Missing presentation',
        focusNodeId: '40:1',
        focusNodeName: 'Missing presentation',
        trace: {
          predicate: 'equals',
          truth: 'false',
          reason: 'values differ',
          actual: 1,
          expected: 2,
          factPaths: ['component.properties.Value'],
        },
      }),
      evaluation({
        evaluationId: 'raw-binding-presentation',
        ruleId: 'component:test.raw-binding-presentation',
        subjectNodeId: '50:1',
        subjectNodeName: 'MiddleSlot',
        focusNodeId: '50:1',
        focusNodeName: 'MiddleSlot',
        trace: {
          predicate: 'binding-satisfies',
          truth: 'false',
          reason: 'token binding is absent',
          actual: {
            bound: false,
            value: 12,
            variableIds: [],
            variables: [],
            collection: null,
            token: null,
            variableId: null,
          },
          expected: { collection: 'Spacing', bound: true },
          factPaths: ['layout.itemSpacing'],
        },
      }),
    ],
  },
});

assert.equal(validation.findings.length, 4);
assert.match(
  validation.responseMarkdown,
  /У компонента «Minor» свойство Opacity имеет значение True./,
);
assert.doesNotMatch(validation.responseMarkdown, /\{\{targetName\}\}/);
assert.match(validation.responseMarkdown, /Amount\/rules\.json/);
assert.match(validation.responseMarkdown, /Нарушена сетка формы 8\+4/);
assert.match(validation.responseMarkdown, /Фактическое значение: 12\./);
assert.match(validation.responseMarkdown, /Ожидаемое значение: 24\./);
assert.match(
  validation.responseMarkdown,
  /Исполняемое правило не содержит presentation/,
);
assert.match(validation.responseMarkdown, /RuleID: component:test\.missing-presentation/);
assert.match(
  validation.responseMarkdown,
  /Интервал MiddleSlot имеет значение 12 px без token binding\./,
);
assert.doesNotMatch(validation.responseMarkdown, /"bound":false/);

const amountFinding = validation.findings.find(
  (finding) => finding.id === 'amount-opacity',
);
assert.equal(amountFinding.nodeId, '22:3');
assert.equal(amountFinding.patternScope, 'general');

const formFinding = validation.findings.find(
  (finding) => finding.id === 'form-layout',
);
assert.equal(formFinding.nodeId, '30:1');
assert.equal(formFinding.patternScope, 'page-specific');

console.log('Predicate production presentation regression checks passed');
