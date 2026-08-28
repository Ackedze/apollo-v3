const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');

function loadModule() {
  const outfile = path.join(
    os.tmpdir(),
    `apollo-predicate-pilot-validation-${process.pid}-${Date.now()}.cjs`,
  );
  esbuild.buildSync({
    entryPoints: [
      path.resolve(__dirname, '../src/predicate/pilotValidation.ts'),
    ],
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

const {
  buildApolloPredicateStatsReport,
  buildApolloPredicateUiValidation,
} = loadModule();

const source = {
  path: 'design-system_ab/JSONS/web/components/web-corp/ButtonGroup [D]/composition-contract.json',
  checksum: 'a'.repeat(64),
};
const titleViewSource = {
  path: 'design-system_ab/JSONS/web/components/web-corp/TitleView/rules.json',
  checksum: 'b'.repeat(64),
};
const backgroundPlateSource = {
  path: 'design-system_ab/JSONS/web/components/web-corp/BackgroundPlate/rules.json',
  checksum: 'c'.repeat(64),
};
const benefitsSource = {
  path: 'design-system_ab/JSONS/web/components/web-corp-promo/Benefits/rules.json',
  checksum: 'd'.repeat(64),
};
const tableViewSource = {
  path: 'design-system_ab/JSONS/web/components/web-corp/TableView/rules.json',
  checksum: 'e'.repeat(64),
};
const base = {
  applicability: 'applicable',
  classification: 'violation',
  severity: 'error',
  actionId: null,
};
const validation = buildApolloPredicateUiValidation({
  rules: [
    {
      ruleId: 'component:web-corp.buttons-group.button-count',
      revision: 1,
      severity: 'error',
      source,
    },
    {
      ruleId: 'component:web-corp.buttons-group.allowed-views',
      revision: 1,
      severity: 'error',
      source,
    },
    {
      ruleId: 'component:web-corp.buttons-group.uniform-size',
      revision: 1,
      severity: 'error',
      source,
    },
    {
      ruleId: 'component:web-corp.buttons-group.single-icon-position',
      revision: 1,
      severity: 'error',
      source,
    },
    {
      ruleId: 'component:web-corp.title-view.title-and-subtitle-typography-is-fixed',
      revision: 1,
      severity: 'error',
      source: titleViewSource,
    },
    {
      ruleId: 'component:web-corp.title-view.status-and-title-status-color-match',
      revision: 1,
      severity: 'error',
      source: titleViewSource,
    },
    {
      ruleId: 'component:web-corp.background-plate.padding-uses-spacing-tokens.right',
      revision: 1,
      severity: 'error',
      source: backgroundPlateSource,
    },
    {
      ruleId: 'component:web-corp.background-plate.level-2-requires-level-1',
      revision: 2,
      severity: 'error',
      source: backgroundPlateSource,
    },
    {
      ruleId: 'component:web.benefits.capacity-matches-card-count',
      revision: 1,
      severity: 'error',
      source: benefitsSource,
    },
    {
      ruleId: 'component:web.benefits.nested-card-settings-are-uniform',
      revision: 1,
      severity: 'error',
      source: benefitsSource,
    },
    {
      ruleId: 'component:web-corp.table-view.horizontal-multi-column-header-required',
      revision: 1,
      severity: 'error',
      source: tableViewSource,
    },
    {
      ruleId: 'component:web-corp.table-view.compact-is-consistent-across-rows',
      revision: 1,
      severity: 'error',
      source: tableViewSource,
    },
    {
      ruleId: 'component:web-corp.table-view.horizontal-compact-one-column',
      revision: 1,
      severity: 'error',
      source: tableViewSource,
    },
  ],
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'snapshot',
    ruleRelease: 'release',
    coverage: {
      total: 13,
      byClassification: { violation: 13 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [
      Object.assign({}, base, {
        evaluationId: 'p01',
        ruleId: 'component:web-corp.buttons-group.allowed-views',
        ruleRevision: 1,
        subjectNodeId: '1:2',
        focusNodeId: '1:2',
        trace: {
          predicate: 'one-of',
          truth: 'false',
          reason: 'value is outside the allowed set',
          actual: 'Accent',
          expected: ['Primary', 'Secondary'],
          factPaths: ['component.properties.View'],
        },
      }),
      Object.assign({}, base, {
        evaluationId: 'p02',
        ruleId: 'component:web-corp.buttons-group.uniform-size',
        ruleRevision: 1,
        subjectNodeId: '1:3',
        focusNodeId: '1:3',
        trace: {
          predicate: 'equals',
          truth: 'false',
          reason: 'values differ',
          actual: '40',
          expected: '56',
          factPaths: [
            'component.properties.Size',
            'ownership.owner.component.properties.Size',
          ],
        },
      }),
      Object.assign({}, base, {
        evaluationId: 'p03',
        ruleId: 'component:web-corp.buttons-group.single-icon-position',
        ruleRevision: 1,
        subjectNodeId: '1:4',
        focusNodeId: '1:4',
        trace: {
          predicate: 'all',
          truth: 'false',
          reason: 'logical all evaluated',
          actual: ['true', 'false'],
          expected: 'all true',
          factPaths: [
            'composition.siblingPropertyValues.SingleIcon',
            'ownership.owner.component.properties.Overflow',
          ],
          children: [
            {
              predicate: 'equals',
              truth: 'true',
              reason: 'values are equal',
              actual: true,
              expected: true,
              factPaths: ['ownership.owner.component.properties.Overflow'],
            },
            {
              predicate: 'value-position',
              truth: 'false',
              reason: 'matching values violate position or count constraints',
              actual: ['False', 'True', 'False'],
              expected: { value: 'True', positions: ['last'], maxCount: 1 },
              factPaths: ['composition.siblingPropertyValues.SingleIcon'],
            },
          ],
        },
      }),
      Object.assign({}, base, {
        evaluationId: 'p04',
        ruleId: 'component:web-corp.title-view.title-and-subtitle-typography-is-fixed',
        ruleRevision: 1,
        subjectNodeId: '2:1',
        focusNodeId: '2:1',
        trace: {
          predicate: 'matches-effective-baseline',
          truth: 'false',
          reason: 'actual value differs from effective baseline',
          actual: 'Headline–System/30–36 Medium',
          expected: 'Headline–System/40–48 Large',
          factPaths: [
            'appearance.styles.textStyle',
            'baseline.effective.appearance.styles.textStyle',
          ],
        },
      }),
      Object.assign({}, base, {
        evaluationId: 'p05',
        ruleId: 'component:web-corp.background-plate.padding-uses-spacing-tokens.right',
        ruleRevision: 1,
        subjectNodeId: '3:1',
        focusNodeId: '3:1',
        trace: {
          predicate: 'binding-satisfies',
          truth: 'false',
          reason: 'contract constraint is not satisfied',
          actual: {
            bound: false,
            value: 32,
            variableIds: [],
            variables: [],
            collection: null,
            token: null,
            variableId: null,
          },
          expected: { bound: true, collection: 'Spacing' },
          factPaths: ['bindings.padding.right'],
        },
      }),
      Object.assign({}, base, {
        evaluationId: 'p07',
        ruleId: 'component:web-corp.title-view.status-and-title-status-color-match',
        ruleRevision: 1,
        subjectNodeId: '5:2',
        focusNodeId: '5:2',
        trace: {
          predicate: 'all-equal',
          truth: 'false',
          reason: 'values differ',
          actual: ['Approved', 'Attention'],
          expected: 'all values equal',
          factPaths: ['composition.ownerStatusTypeValues'],
        },
      }),
      Object.assign({}, base, {
        evaluationId: 'p06',
        ruleId: 'component:web-corp.background-plate.level-2-requires-level-1',
        ruleRevision: 4,
        subjectNodeId: '4:2',
        focusNodeId: '4:2',
        trace: {
          predicate: 'all',
          truth: 'false',
          reason: 'logical all evaluated',
          actual: ['true', 'true', 'true', 'true', 'true', 'false', 'true', 'true', 'true'],
          expected: 'all true',
          factPaths: [
            'composition.level1Underlay.bounds',
            'composition.level1Underlay.component.identity',
            'composition.level1Underlay.component.properties.Position',
            'composition.level1Underlay.layout.positioning',
            'composition.level1Underlay.nodeId',
            'composition.level1Underlay.contentLayout.positioning',
            'bounds',
            'id',
          ],
          children: [
            {
              predicate: 'exists',
              truth: 'true',
              reason: 'fact exists',
              actual: '4:1',
              expected: null,
              factPaths: ['composition.level1Underlay.nodeId'],
            },
            {
              predicate: 'equals',
              truth: 'true',
              reason: 'values are equal',
              actual: '4:0',
              expected: '4:0',
              factPaths: ['composition.level1Underlay.parentNodeId', 'parentId'],
            },
            {
              predicate: 'one-of',
              truth: 'true',
              reason: 'value belongs to the allowed set',
              actual: 'VERTICAL',
              expected: ['HORIZONTAL', 'VERTICAL'],
              factPaths: ['composition.level1Underlay.parentLayoutMode'],
            },
            {
              predicate: 'equals',
              truth: 'true',
              reason: 'values are equal',
              actual: 'web-corp.background-plate',
              expected: 'web-corp.background-plate',
              factPaths: ['composition.level1Underlay.component.identity'],
            },
            {
              predicate: 'equals',
              truth: 'true',
              reason: 'values are equal',
              actual: 'Level 1 (outer)',
              expected: 'Level 1 (outer)',
              factPaths: ['composition.level1Underlay.component.properties.Position'],
            },
            {
              predicate: 'equals',
              truth: 'false',
              reason: 'values differ',
              actual: 'AUTO',
              expected: 'ABSOLUTE',
              factPaths: ['composition.level1Underlay.layout.positioning'],
            },
            {
              predicate: 'equals',
              truth: 'true',
              reason: 'values are equal',
              actual: 'AUTO',
              expected: 'AUTO',
              factPaths: ['composition.level1Underlay.contentLayout.positioning'],
            },
            {
              predicate: 'after',
              truth: 'true',
              reason: 'node relation after holds',
              actual: '4:2',
              expected: '4:1',
              factPaths: ['composition.level1Underlay.nodeId', 'id'],
            },
            {
              predicate: 'contains',
              truth: 'true',
              reason: 'geometry contains passed',
              actual: { x: 0, y: 0, width: 396, height: 304 },
              expected: { x: 24, y: 24, width: 348, height: 256 },
              factPaths: ['bounds', 'composition.level1Underlay.bounds'],
            },
          ],
        },
      }),
      Object.assign({}, base, {
        evaluationId: 'p09',
        ruleId: 'component:web-corp.buttons-group.button-count',
        ruleRevision: 1,
        subjectNodeId: '6:1',
        focusNodeId: '6:1',
        trace: {
          predicate: 'count-between',
          truth: 'false',
          reason: 'number is outside the inclusive range',
          actual: 1,
          expected: { lower: 2, upper: 4, bounds: 'inclusive' },
          factPaths: ['composition.visibleButtonNodeIds'],
        },
      }),
      Object.assign({}, base, {
        evaluationId: 'p10',
        ruleId: 'component:web.benefits.capacity-matches-card-count',
        ruleRevision: 1,
        subjectNodeId: '7:1',
        focusNodeId: '7:1',
        trace: {
          predicate: 'all',
          truth: 'false',
          reason: 'logical all evaluated',
          actual: ['true', 'true', 'false'],
          expected: 'all true',
          factPaths: [
            'composition.capacity',
            'composition.visibleBenefitCardNodeIds',
            'composition.visibleBenefitCardCount',
          ],
          children: [
            {
              predicate: 'one-of',
              truth: 'true',
              reason: 'value belongs to the allowed set',
              actual: 4,
              expected: [3, 4],
              factPaths: ['composition.capacity'],
            },
            {
              predicate: 'count-between',
              truth: 'true',
              reason: 'number belongs to the inclusive range',
              actual: 3,
              expected: { lower: 3, upper: 4, bounds: 'inclusive' },
              factPaths: ['composition.visibleBenefitCardNodeIds'],
            },
            {
              predicate: 'equals',
              truth: 'false',
              reason: 'values differ',
              actual: 3,
              expected: 4,
              factPaths: [
                'composition.visibleBenefitCardCount',
                'composition.capacity',
              ],
            },
          ],
        },
      }),
      Object.assign({}, base, {
        evaluationId: 'p11',
        ruleId: 'component:web-corp.table-view.horizontal-multi-column-header-required',
        ruleRevision: 1,
        subjectNodeId: '8:1',
        focusNodeId: '8:1',
        trace: {
          predicate: 'equals',
          truth: 'false',
          reason: 'values differ',
          actual: 0,
          expected: 1,
          factPaths: ['composition.visibleHeaderRowCount'],
        },
      }),
      Object.assign({}, base, {
        evaluationId: 'p13',
        ruleId: 'component:web.benefits.nested-card-settings-are-uniform',
        ruleRevision: 1,
        subjectNodeId: '7:1',
        focusNodeId: '7:1',
        trace: {
          predicate: 'all',
          truth: 'false',
          reason: 'logical all evaluated',
          actual: ['true', 'false', 'true', 'false'],
          expected: 'all true',
          factPaths: [
            'composition.benefitCardPropertyValues.Background',
            'composition.benefitCardPropertyValues.CardAxis',
            'composition.benefitCardPropertyValues.Compact',
            'composition.benefitCardPropertyValues.GraphicPosition',
          ],
          children: [
            {
              predicate: 'all-equal', truth: 'true', reason: 'all collection values are equal',
              actual: ['Primary', 'Primary', 'Primary'], expected: 'Primary',
              factPaths: ['composition.benefitCardPropertyValues.Background'],
            },
            {
              predicate: 'all-equal', truth: 'false', reason: 'collection values differ',
              actual: ['Vertical', 'Horizontal', 'Vertical'], expected: 'Vertical',
              factPaths: ['composition.benefitCardPropertyValues.CardAxis'],
            },
            {
              predicate: 'all-equal', truth: 'true', reason: 'all collection values are equal',
              actual: ['False', 'False', 'False'], expected: 'False',
              factPaths: ['composition.benefitCardPropertyValues.Compact'],
            },
            {
              predicate: 'all-equal', truth: 'false', reason: 'collection values differ',
              actual: ['Top', 'Left', 'Top'], expected: 'Top',
              factPaths: ['composition.benefitCardPropertyValues.GraphicPosition'],
            },
          ],
        },
      }),
      Object.assign({}, base, {
        evaluationId: 'p12',
        ruleId: 'component:web-corp.table-view.compact-is-consistent-across-rows',
        ruleRevision: 1,
        subjectNodeId: '8:2',
        focusNodeId: '8:2',
        trace: {
          predicate: 'all',
          truth: 'false',
          reason: 'logical all evaluated',
          actual: ['false', 'false'],
          expected: 'all true',
          factPaths: [
            'component.properties.Compact',
            'composition.tableViewOwner.component.properties.Compact',
            'composition.spacingVertical',
            'composition.expectedRowSpacing',
          ],
          children: [
            {
              predicate: 'equals',
              truth: 'false',
              reason: 'values differ',
              actual: 'True',
              expected: 'False',
              factPaths: [
                'component.properties.Compact',
                'composition.tableViewOwner.component.properties.Compact',
              ],
            },
            {
              predicate: 'equals',
              truth: 'false',
              reason: 'values differ',
              actual: 12,
              expected: 16,
              factPaths: [
                'composition.spacingVertical',
                'composition.expectedRowSpacing',
              ],
            },
          ],
        },
      }),
      Object.assign({}, base, {
        evaluationId: 'p14',
        ruleId: 'component:web-corp.table-view.horizontal-compact-one-column',
        ruleRevision: 1,
        subjectNodeId: '8:3',
        focusNodeId: '8:3',
        trace: {
          predicate: 'count-between',
          truth: 'false',
          reason: 'numeric range inclusive evaluated',
          actual: 2,
          expected: { lower: 1, upper: 1, bounds: 'inclusive' },
          factPaths: ['composition.visibleDataColumnNodeIds'],
        },
      }),
    ],
  },
});

assert.equal(validation.findings.length, 13);
assert.equal(validation.findings[0].nodeId, '1:2');
assert.equal(validation.findings[0].patternScope, 'general');
assert.equal(validation.findings[1].nodeId, '1:3');
assert.equal(validation.findings[2].nodeId, '1:4');
assert.equal(validation.findings[3].nodeId, '2:1');
assert.equal(validation.findings[4].nodeId, '3:1');
assert.equal(validation.findings[5].nodeId, '4:2');
assert.equal(validation.findings[6].nodeId, '5:2');
assert.equal(validation.findings[7].nodeId, '6:1');
assert.equal(validation.findings[8].nodeId, '7:1');
assert.equal(validation.findings[9].nodeId, '7:1');
assert.equal(validation.findings[10].nodeId, '8:1');
assert.equal(validation.findings[11].nodeId, '8:2');
assert.equal(validation.findings[12].nodeId, '8:3');
assert.match(validation.responseMarkdown, /Недопустимый вариант/);
assert.match(validation.responseMarkdown, /Size=56/);
assert.match(validation.responseMarkdown, /SingleIcon расположен неправильно/);
assert.match(
  validation.responseMarkdown,
  /Overflow=true; порядок SingleIcon: False → True → False\./,
);
assert.match(
  validation.responseMarkdown,
  /ButtonGroup \[D\]\/composition-contract\.json/,
);
assert.match(
  validation.responseMarkdown,
  /Стиль текста изменён с Headline–System\/40–48 Large на Headline–System\/30–36 Medium\./,
);
assert.match(validation.responseMarkdown, /TitleView\/rules\.json/);
assert.match(validation.responseMarkdown, /Правый padding задан без Spacing token/);
assert.match(validation.responseMarkdown, /32 px задан как raw-значение без token binding/);
assert.match(validation.responseMarkdown, /Привязать значение 32 к соответствующему токену Spacing/);
assert.match(validation.responseMarkdown, /BackgroundPlate\/rules\.json/);
assert.match(validation.responseMarkdown, /BackgroundPlate Level 2 находится без корректной подложки Level 1/);
assert.match(
  validation.responseMarkdown,
  /Level 1 positioning=AUTO; content-ветка positioning=AUTO; Level 1 расположен ниже=да; Level 1 содержит Level 2=да\./,
);
assert.match(validation.responseMarkdown, /общем Auto Layout/);
assert.match(validation.responseMarkdown, /Типы Status и TitleStatus не совпадают/);
assert.match(
  validation.responseMarkdown,
  /Status\.Type → TitleStatus\.Type: Approved → Attention\./,
);
assert.match(validation.responseMarkdown, /Установить TitleStatus\.Type=Approved\./);
assert.match(validation.responseMarkdown, /Неверное количество кнопок в ButtonsGroup/);
assert.match(validation.responseMarkdown, /В группе 1 видимая кнопка\./);
assert.match(validation.responseMarkdown, /от двух до четырёх видимых кнопок/);
assert.match(validation.responseMarkdown, /Количество BenefitCard не совпадает с Capacity/);
assert.match(validation.responseMarkdown, /Capacity=4; видимых BenefitCard: 3\./);
assert.match(validation.responseMarkdown, /Benefits\/rules\.json/);
assert.match(validation.responseMarkdown, /ровно три или четыре BenefitCard/);
assert.match(validation.responseMarkdown, /Выбрать Capacity, равный числу карточек/);
assert.match(validation.responseMarkdown, /Настройки BenefitCard внутри Benefits различаются/);
assert.match(
  validation.responseMarkdown,
  /CardAxis: Vertical → Horizontal → Vertical; GraphicPosition: Top → Left → Top\./,
);
assert.match(validation.responseMarkdown, /Выбрать одинаковые значения Background/);
assert.match(validation.responseMarkdown, /В Horizontal TableView отсутствует строка заголовка/);
assert.match(validation.responseMarkdown, /видимых строк Row \/ Presets=Header: 0/);
assert.match(validation.responseMarkdown, /TableView\/rules\.json/);
assert.match(validation.responseMarkdown, /Вернуть или добавить строку Row с Presets=Header/);
assert.match(validation.responseMarkdown, /Row не соответствует Compact TableView/);
assert.match(
  validation.responseMarkdown,
  /Row Compact=True, spacing=12 px; TableView Compact=False, ожидаемый spacing=16 px\./,
);
assert.match(validation.responseMarkdown, /Установить Row Compact=False и spacing=16 px/);
assert.match(validation.responseMarkdown, /В Compact TableView больше одной колонки данных/);
assert.match(validation.responseMarkdown, /В строке найдено колонок данных: 2/);
assert.match(validation.responseMarkdown, /ровно одну Column/);
assert.match(validation.responseMarkdown, /Оставить в строке одну колонку данных/);

const accountSelectValidation = buildApolloPredicateUiValidation({
  rules: [{
    ruleId: 'component:web-corp.account-select.public-roots-only',
    revision: 1,
    severity: 'error',
    source: {
      path: 'design-system_ab/JSONS/web/components/web-corp/AccountSelect/rules.json',
      checksum: '0'.repeat(64),
    },
    presentation: {
      schemaVersion: 'apollo.predicate-presentation.v1',
      title: 'Служебный компонент AccountSelect используется отдельно',
      observed: '{{actual}} размещён как самостоятельный компонент.',
      expectation: 'Самостоятельно допускается использовать только {{expected}}.',
      action: 'Заменить {{actual}} на {{expected}}.',
      targetFact: 'ownership.contour.root.component.family',
      valueLabels: {
        'account-item': 'AccountItem',
        'account-option-list-content': 'AccountOptionListContent',
      },
    },
  }],
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'account-select-snapshot',
    ruleRelease: 'release',
    coverage: {
      total: 1,
      byClassification: { violation: 1 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [Object.assign({}, base, {
      evaluationId: 'p21',
      ruleId: 'component:web-corp.account-select.public-roots-only',
      ruleRevision: 1,
      subjectNodeId: '21:1',
      focusNodeId: '21:1',
      trace: {
        predicate: 'one-of',
        truth: 'false',
        reason: 'value is outside the allowed set',
        actual: 'account-item',
        expected: ['account-option-list-content'],
        factPaths: ['ownership.contour.root.component.family'],
      },
    })],
  },
});
assert.equal(accountSelectValidation.findings[0].nodeId, '21:1');
assert.match(
  accountSelectValidation.responseMarkdown,
  /Служебный компонент AccountSelect используется отдельно/,
);
assert.match(
  accountSelectValidation.responseMarkdown,
  /AccountItem размещён как самостоятельный компонент\./,
);
assert.match(
  accountSelectValidation.responseMarkdown,
  /Самостоятельно допускается использовать только AccountOptionListContent\./,
);
assert.match(
  accountSelectValidation.responseMarkdown,
  /Заменить AccountItem на AccountOptionListContent\./,
);

const accountSelectUniformValidation = buildApolloPredicateUiValidation({
  rules: [{
    ruleId: 'component:web-corp.account-select.list-content-is-uniform',
    revision: 1,
    severity: 'error',
    source: {
      path: 'design-system_ab/JSONS/web/components/web-corp/AccountSelect/rules.json',
      checksum: '2'.repeat(64),
    },
    presentation: {
      schemaVersion: 'apollo.predicate-presentation.v1',
      title: 'Строки AccountSelect используют разные или недопустимые типы',
      observed: 'В AccountSelect обнаружены значения AccountItem.Type: {{actual}}.',
      expectation: 'В списке должна быть хотя бы одна строка; все строки используют одинаковый Type=Sum или Type=Number.',
      action: 'Выбрать для всех строк один допустимый Type: Sum или Number.',
      targetFact: 'component.properties.Type',
    },
  }],
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'account-select-uniform-snapshot',
    ruleRelease: 'release',
    coverage: {
      total: 1,
      byClassification: { violation: 1 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [Object.assign({}, base, {
      evaluationId: 'p23',
      ruleId: 'component:web-corp.account-select.list-content-is-uniform',
      ruleRevision: 1,
      subjectNodeId: '23:0',
      focusNodeId: '23:0',
      trace: {
        predicate: 'all',
        truth: 'false',
        reason: 'logical all evaluated',
        actual: ['true', 'true', 'false'],
        expected: 'all true',
        factPaths: ['component.properties.Type'],
        children: [{
          predicate: 'count-between',
          truth: 'true',
          reason: 'value is inside range',
          actual: 2,
          expected: { lower: 1, upper: 1000000, bounds: 'inclusive' },
          factPaths: ['component.properties.Type'],
        }, {
          predicate: 'every',
          truth: 'true',
          reason: 'collection membership every evaluated',
          actual: ['Sum', 'Number'],
          expected: ['Sum', 'Number'],
          factPaths: ['component.properties.Type'],
        }, {
          predicate: 'all-equal',
          truth: 'false',
          reason: 'collection values differ',
          actual: ['Sum', 'Number'],
          expected: 'Sum',
          factPaths: ['component.properties.Type'],
        }],
      },
    })],
  },
});
assert.equal(accountSelectUniformValidation.findings[0].nodeId, '23:0');
assert.match(
  accountSelectUniformValidation.responseMarkdown,
  /Строки AccountSelect используют разные или недопустимые типы/,
);
assert.match(
  accountSelectUniformValidation.responseMarkdown,
  /В AccountSelect обнаружены значения AccountItem\.Type: Sum, Number\./,
);
assert.match(
  accountSelectUniformValidation.responseMarkdown,
  /все строки используют одинаковый Type=Sum или Type=Number/,
);
assert.match(
  accountSelectUniformValidation.responseMarkdown,
  /Выбрать для всех строк один допустимый Type: Sum или Number\./,
);

const uniqueLabelsValidation = buildApolloPredicateUiValidation({
  rules: [{
    ruleId: 'component:web-corp.tabs-view.labels-are-unique-within-level',
    revision: 3,
    severity: 'error',
    source: {
      path: 'design-system_ab/JSONS/web/components/web-corp/TabsView/rules.json',
      checksum: '4'.repeat(64),
    },
    presentation: {
      schemaVersion: 'apollo.predicate-presentation.v1',
      title: 'Названия табов повторяются',
      observed: 'На одном уровне повторяются названия табов: {{duplicates}}.',
      expectation: 'Названия соседних табов одного уровня должны быть уникальными.',
      action: 'Переименовать повторяющиеся табы так, чтобы их названия различались.',
    },
  }],
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'tabs-unique-labels-snapshot',
    ruleRelease: 'release',
    coverage: {
      total: 1,
      byClassification: { violation: 1 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [Object.assign({}, base, {
      evaluationId: 'query-unique-labels',
      ruleId: 'component:web-corp.tabs-view.labels-are-unique-within-level',
      ruleRevision: 3,
      subjectNodeId: '25:0',
      focusNodeId: '25:0',
      trace: {
        predicate: 'unique',
        truth: 'false',
        reason: 'collection contains duplicates',
        actual: ['TabSecondary 1', 'Обзор', 'Обзор', 'История', 'История'],
        expected: 'unique values',
        factPaths: ['text.characters'],
      },
    })],
  },
});
assert.match(
  uniqueLabelsValidation.responseMarkdown,
  /На одном уровне повторяются названия табов: Обзор, Обзор, История, История\./,
);
assert.doesNotMatch(
  uniqueLabelsValidation.responseMarkdown,
  /повторяются названия табов: TabSecondary 1/,
);

const cardSwiperBreakpointValidation = buildApolloPredicateUiValidation({
  rules: [{
    ruleId: 'component:web-corp.card-swiper-mobile.screen-size-follows-viewport',
    revision: 1,
    severity: 'error',
    source: {
      path: 'design-system_ab/JSONS/web/components/web-corp/CardSwiperMobile [M]/rules.json',
      checksum: '3'.repeat(64),
    },
    presentation: {
      schemaVersion: 'apollo.predicate-presentation.v1',
      title: 'Screen Size не соответствует ширине страницы',
      observed: 'При ширине {{context}} px выбран Screen Size={{actual}}.',
      expectation: 'При ширине 320–359 px используется Screen Size=320-360; при ширине от 360 px — Screen Size=360+.',
      action: 'Выбрать Screen Size, соответствующий ширине страницы.',
      contextFact: 'page.context.viewportWidth',
      targetFact: 'component.properties.Screen Size',
    },
  }],
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'card-swiper-breakpoint-snapshot',
    ruleRelease: 'release',
    coverage: {
      total: 1,
      byClassification: { violation: 1 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [Object.assign({}, base, {
      evaluationId: 'p24',
      ruleId: 'component:web-corp.card-swiper-mobile.screen-size-follows-viewport',
      ruleRevision: 1,
      subjectNodeId: '24:0',
      focusNodeId: '24:0',
      trace: {
        predicate: 'any',
        truth: 'false',
        reason: 'logical any evaluated',
        actual: ['false', 'false'],
        expected: 'at least one true',
        factPaths: [
          'page.context.viewportWidth',
          'component.properties.Screen Size',
        ],
        children: [{
          predicate: 'all',
          truth: 'false',
          reason: 'logical all evaluated',
          actual: ['true', 'false'],
          expected: 'all true',
          factPaths: [
            'page.context.viewportWidth',
            'component.properties.Screen Size',
          ],
          children: [{
            predicate: 'between',
            truth: 'true',
            reason: 'value is inside range',
            actual: 340,
            expected: { lower: 320, upper: 359, bounds: 'inclusive' },
            factPaths: ['page.context.viewportWidth'],
          }, {
            predicate: 'equals',
            truth: 'false',
            reason: 'values differ',
            actual: '360+',
            expected: '320-360',
            factPaths: ['component.properties.Screen Size'],
          }],
        }, {
          predicate: 'all',
          truth: 'false',
          reason: 'logical all evaluated',
          actual: ['false', 'true'],
          expected: 'all true',
          factPaths: [
            'page.context.viewportWidth',
            'component.properties.Screen Size',
          ],
          children: [{
            predicate: 'compare',
            truth: 'false',
            reason: 'comparison failed',
            actual: 340,
            expected: 360,
            factPaths: ['page.context.viewportWidth'],
          }, {
            predicate: 'equals',
            truth: 'true',
            reason: 'values match',
            actual: '360+',
            expected: '360+',
            factPaths: ['component.properties.Screen Size'],
          }],
        }],
      },
    })],
  },
});
assert.equal(cardSwiperBreakpointValidation.findings[0].nodeId, '24:0');
assert.match(
  cardSwiperBreakpointValidation.responseMarkdown,
  /Screen Size не соответствует ширине страницы/,
);
assert.match(
  cardSwiperBreakpointValidation.responseMarkdown,
  /При ширине 340 px выбран Screen Size=360\+\./,
);
assert.match(
  cardSwiperBreakpointValidation.responseMarkdown,
  /При ширине 320–359 px используется Screen Size=320-360/,
);
assert.match(
  cardSwiperBreakpointValidation.responseMarkdown,
  /Выбрать Screen Size, соответствующий ширине страницы\./,
);

const statusShapeValidation = buildApolloPredicateUiValidation({
  rules: [{
    ruleId: 'component:web-corp.status-property.shape-is-fixed-by-preset',
    revision: 1,
    severity: 'error',
    source: {
      path: 'design-system_ab/JSONS/web/components/web-corp/Status & Property/rules.json',
      checksum: '1'.repeat(64),
    },
    presentation: {
      schemaVersion: 'apollo.predicate-presentation.v1',
      title: 'Форма Status не соответствует preset',
      observed: 'Внутри {{contextLabel}} у Status выбран Shape={{actual}}.',
      expectation: 'Форма вложенного Status должна соответствовать preset: Shape={{expected}}.',
      action: 'Вернуть Shape={{expected}}.',
      contextFact: 'ownership.owner.component.family',
      targetFact: 'component.properties.Shape',
      contextLabels: {
        'status-preset': 'StatusPreset',
        'property-preset': 'PropertyPreset',
      },
    },
  }],
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'status-shape-snapshot',
    ruleRelease: 'release',
    coverage: {
      total: 1,
      byClassification: { violation: 1 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [Object.assign({}, base, {
      evaluationId: 'p22',
      ruleId: 'component:web-corp.status-property.shape-is-fixed-by-preset',
      ruleRevision: 1,
      subjectNodeId: '22:1',
      focusNodeId: '22:1',
      trace: {
        predicate: 'any',
        truth: 'false',
        reason: 'logical any evaluated',
        actual: ['false', 'false'],
        expected: 'at least one true',
        factPaths: [
          'ownership.owner.component.family',
          'component.properties.Shape',
        ],
        children: [{
          predicate: 'all',
          truth: 'false',
          reason: 'logical all evaluated',
          actual: ['false', 'true'],
          expected: 'all true',
          factPaths: [
            'ownership.owner.component.family',
            'component.properties.Shape',
          ],
          children: [{
            predicate: 'equals', truth: 'false', reason: 'values differ',
            actual: 'property-preset', expected: 'status-preset',
            factPaths: ['ownership.owner.component.family'],
          }, {
            predicate: 'equals', truth: 'true', reason: 'values are equal',
            actual: 'Rounded', expected: 'Rounded',
            factPaths: ['component.properties.Shape'],
          }],
        }, {
          predicate: 'all',
          truth: 'false',
          reason: 'logical all evaluated',
          actual: ['true', 'false'],
          expected: 'all true',
          factPaths: [
            'ownership.owner.component.family',
            'component.properties.Shape',
          ],
          children: [{
            predicate: 'equals', truth: 'true', reason: 'values are equal',
            actual: 'property-preset', expected: 'property-preset',
            factPaths: ['ownership.owner.component.family'],
          }, {
            predicate: 'equals', truth: 'false', reason: 'values differ',
            actual: 'Rounded', expected: 'Rectangular',
            factPaths: ['component.properties.Shape'],
          }],
        }],
      },
    })],
  },
});
assert.equal(statusShapeValidation.findings[0].nodeId, '22:1');
assert.match(statusShapeValidation.responseMarkdown, /Форма Status не соответствует preset/);
assert.match(
  statusShapeValidation.responseMarkdown,
  /Внутри PropertyPreset у Status выбран Shape=Rounded\./,
);
assert.match(
  statusShapeValidation.responseMarkdown,
  /Форма вложенного Status должна соответствовать preset: Shape=Rectangular\./,
);
assert.match(statusShapeValidation.responseMarkdown, /Вернуть Shape=Rectangular\./);
assert.match(statusShapeValidation.responseMarkdown, /Status & Property\/rules\.json/);

const statusFillNodeNameValidation = buildApolloPredicateUiValidation({
  rules: [{
    ruleId: 'component:web-corp.status-property.fill-follows-effective-baseline.fill',
    revision: 2,
    severity: 'error',
    source: {
      path: 'design-system_ab/JSONS/web/components/web-corp/Status & Property/rules.json',
      checksum: '2'.repeat(64),
    },
    presentation: {
      schemaVersion: 'apollo.predicate-presentation.v1',
      title: 'Изменена заливка внутри Status',
      observed: 'Заливка слоя «{{nodeName}}» изменена с {{expected}} на {{actual}}.',
      expectation: 'Заливка должна совпадать с effective baseline.',
      action: 'Сбросить заливку слоя «{{nodeName}}».',
    },
  }],
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'status-fill-node-name-snapshot',
    ruleRelease: 'release',
    coverage: {
      total: 1,
      byClassification: { violation: 1 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [Object.assign({}, base, {
      evaluationId: 'status-fill-node-name',
      ruleId: 'component:web-corp.status-property.fill-follows-effective-baseline.fill',
      ruleRevision: 2,
      subjectNodeId: '22:2',
      subjectNodeName: 'Label',
      focusNodeId: '22:2',
      focusNodeName: 'Label',
      trace: {
        predicate: 'matches-effective-baseline',
        truth: 'false',
        reason: 'actual value differs from effective baseline',
        actual: 'text/info',
        expected: 'static_text_inverted/primary',
        factPaths: [
          'appearance.fill.value',
          'baseline.effective.appearance.fill.value',
        ],
      },
    })],
  },
});
assert.match(
  statusFillNodeNameValidation.responseMarkdown,
  /Заливка слоя «Label» изменена с static_text_inverted\/primary на text\/info\./,
);
assert.match(
  statusFillNodeNameValidation.responseMarkdown,
  /Сбросить заливку слоя «Label»\./,
);
assert.doesNotMatch(statusFillNodeNameValidation.responseMarkdown, /\{\{nodeName\}\}/);

const declaredDistanceValidation = buildApolloPredicateUiValidation({
  rules: [{
    ruleId: 'rule:forms.construction-rules.block-spacing.first-level',
    revision: 4,
    severity: 'error',
    scope: { platform: ['desktop'], pageType: ['form'] },
    source: {
      path: 'design-system_ab/patterns/p_form-construction-rules.md',
      checksum: 'f'.repeat(64),
    },
    presentation: {
      schemaVersion: 'apollo.predicate-presentation.v1',
      title: 'Неверный отступ между блоками первого уровня формы',
      observed: 'Вертикальный отступ между соседними подложками: {{measured}} px.',
      expectation: 'Между соседними блоками первого уровня формы должно быть 24 px.',
      action: 'Установить вертикальный отступ между подложками 24 px.',
    },
  }],
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'snapshot',
    ruleRelease: 'release',
    coverage: {
      total: 1,
      byClassification: { violation: 1 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [Object.assign({}, base, {
      evaluationId: 'c05-distance',
      ruleId: 'rule:forms.construction-rules.block-spacing.first-level',
      ruleRevision: 4,
      subjectNodeId: '15:2',
      focusNodeId: '15:2',
      trace: {
        predicate: 'distance',
        truth: 'false',
        reason: 'geometry distance does not hold',
        actual: { x: 0, y: 112, width: 600, height: 100 },
        expected: {
          distance: 24,
          axis: 'vertical',
          tolerance: 0,
          measured: 12,
        },
        factPaths: ['bounds', 'composition.previousFormFirstLevelBlock.bounds'],
      },
    })],
  },
});
assert.equal(declaredDistanceValidation.findings[0].nodeId, '15:2');
assert.match(declaredDistanceValidation.responseMarkdown, /Неверный отступ между блоками первого уровня формы/);
assert.match(declaredDistanceValidation.responseMarkdown, /Вертикальный отступ между соседними подложками: 12 px\./);
assert.match(declaredDistanceValidation.responseMarkdown, /Между соседними блоками первого уровня формы должно быть 24 px\./);

const formInsetsValidation = buildApolloPredicateUiValidation({
  rules: [{
    ruleId: 'rule:forms.construction-rules.inner-padding-standard.content-insets',
    revision: 1,
    severity: 'error',
    source: {
      path: 'design-system_ab/patterns/p_form-construction-rules.md',
      checksum: 'f'.repeat(64),
    },
  }],
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'snapshot',
    ruleRelease: 'release',
    coverage: {
      total: 1,
      byClassification: { violation: 1 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [Object.assign({}, base, {
      evaluationId: 'p18',
      ruleId: 'rule:forms.construction-rules.inner-padding-standard.content-insets',
      ruleRevision: 1,
      subjectNodeId: '17:0',
      focusNodeId: '17:0',
      trace: {
        predicate: 'all',
        truth: 'false',
        reason: 'logical all evaluated',
        actual: ['true', 'false', 'true', 'true'],
        expected: 'all true',
        factPaths: [
          'composition.formFirstLevelSurface.contentInsets.top',
          'composition.formFirstLevelSurface.contentInsets.right',
          'composition.formFirstLevelSurface.contentInsets.bottom',
          'composition.formFirstLevelSurface.contentInsets.left',
        ],
        children: [
          { predicate: 'equals', truth: 'true', reason: 'values are equal', actual: 32, expected: 32, factPaths: ['composition.formFirstLevelSurface.contentInsets.top'] },
          { predicate: 'equals', truth: 'false', reason: 'values differ', actual: 48, expected: 32, factPaths: ['composition.formFirstLevelSurface.contentInsets.right'] },
          { predicate: 'equals', truth: 'true', reason: 'values are equal', actual: 32, expected: 32, factPaths: ['composition.formFirstLevelSurface.contentInsets.bottom'] },
          { predicate: 'equals', truth: 'true', reason: 'values are equal', actual: 32, expected: 32, factPaths: ['composition.formFirstLevelSurface.contentInsets.left'] },
        ],
      },
    })],
  },
});
assert.equal(formInsetsValidation.findings[0].nodeId, '17:0');
assert.match(formInsetsValidation.responseMarkdown, /Неверные внутренние отступы блока формы/);
assert.match(formInsetsValidation.responseMarkdown, /Сверху: 32 px; справа: 48 px; снизу: 32 px; слева: 32 px\./);
assert.match(formInsetsValidation.responseMarkdown, /внутренние отступы сверху, справа, снизу и слева должны быть 32 px/);
assert.match(formInsetsValidation.responseMarkdown, /Установить внутренние отступы блока 32 px/);

const formEightFourValidation = buildApolloPredicateUiValidation({
  rules: [{
    ruleId: 'rule:forms.construction-rules.layout-8-4.geometry',
    revision: 1,
    severity: 'error',
    scope: { platform: ['desktop'], pageType: ['form'] },
    source: {
      path: 'design-system_ab/patterns/p_form-construction-rules.md',
      checksum: 'f'.repeat(64),
    },
  }],
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'snapshot',
    ruleRelease: 'release',
    coverage: {
      total: 1,
      byClassification: { violation: 1 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [Object.assign({}, base, {
      evaluationId: 'p19',
      ruleId: 'rule:forms.construction-rules.layout-8-4.geometry',
      ruleRevision: 1,
      subjectNodeId: '19:1',
      focusNodeId: '19:1',
      trace: {
        predicate: 'all',
        truth: 'false',
        reason: 'logical all evaluated',
        actual: ['true', 'true', 'false'],
        expected: 'all true',
        factPaths: [
          'composition.formEightFourLayout.mainZoneNodeId',
          'composition.formEightFourLayout.islandZoneNodeId',
          'composition.formEightFourLayout.gutter',
          'composition.formEightFourLayout.expectedGutter',
        ],
        children: [
          { predicate: 'exists', truth: 'true', reason: 'fact exists', actual: '19:2', expected: null, factPaths: ['composition.formEightFourLayout.mainZoneNodeId'] },
          { predicate: 'exists', truth: 'true', reason: 'fact exists', actual: '19:3', expected: null, factPaths: ['composition.formEightFourLayout.islandZoneNodeId'] },
          { predicate: 'equals', truth: 'false', reason: 'values differ', actual: 12, expected: 24, factPaths: ['composition.formEightFourLayout.gutter', 'composition.formEightFourLayout.expectedGutter'] },
        ],
      },
    })],
  },
});
assert.equal(formEightFourValidation.findings[0].nodeId, '19:1');
assert.equal(formEightFourValidation.findings[0].patternScope, 'page-specific');
assert.match(formEightFourValidation.responseMarkdown, /## Общие паттерны/);
assert.match(formEightFourValidation.responseMarkdown, /## Паттерны страницы/);
assert.match(formEightFourValidation.responseMarkdown, /Нарушена сетка формы 8 \+ 4/);
assert.match(formEightFourValidation.responseMarkdown, /Основная зона: неизвестно px вместо неизвестно px; островок: неизвестно px вместо неизвестно px; расстояние: 12 px\./);
assert.match(formEightFourValidation.responseMarkdown, /На desktop-форме основная зона должна занимать 8 колонок, островок — 4 колонки, а расстояние между ними — 24 px\./);
assert.match(formEightFourValidation.responseMarkdown, /Восстановить пропорции сетки 8 \+ 4 и расстояние 24 px/);

const empty = buildApolloPredicateUiValidation({
  rules: [],
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'snapshot',
    ruleRelease: 'release',
    coverage: {
      total: 1,
      byClassification: { compliant: 1 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [
      Object.assign({}, base, {
        evaluationId: 'ok',
        ruleId: 'rule',
        ruleRevision: 1,
        subjectNodeId: '1:1',
        focusNodeId: '1:1',
        classification: 'compliant',
        trace: {
          predicate: 'equals',
          truth: 'true',
          reason: 'values match',
          actual: '56',
          expected: '56',
          factPaths: ['component.properties.Size'],
        },
      }),
    ],
  },
});

assert.deepEqual(empty.findings, []);
assert.equal(empty.responseMarkdown, 'Нарушений не найдено.');

const selectorUnknown = buildApolloPredicateUiValidation({
  rules: [{
    ruleId: 'component:web-corp.buttons-group.button-count',
    revision: 1,
    severity: 'error',
    source,
  }],
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'snapshot',
    ruleRelease: 'release',
    coverage: {
      total: 1,
      byClassification: { 'not-evaluable': 1 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [Object.assign({}, base, {
      evaluationId: 'selector-unknown',
      ruleId: 'component:web-corp.buttons-group.button-count',
      ruleRevision: 1,
      subjectNodeId: '1:0',
      focusNodeId: '1:0',
      applicability: 'unknown',
      classification: 'not-evaluable',
      trace: {
        predicate: 'count-between',
        truth: 'unknown',
        reason: 'selector evidence is unknown',
        actual: { state: 'unknown' },
        expected: { state: 'unknown' },
        factPaths: [],
      },
    })],
  },
});
assert.deepEqual(selectorUnknown.findings, []);
assert.equal(selectorUnknown.responseMarkdown, 'Нарушений не найдено.');

const absentFact = buildApolloPredicateUiValidation({
  rules: [{
    ruleId: 'component:web-corp.background-plate.no-secondary-for-level-2',
    revision: 1,
    severity: 'error',
    source,
    presentation: {
      schemaVersion: 'apollo.predicate-presentation.v1',
      title: 'Для BackgroundPlate Level 2 выбран Secondary',
      observed: 'У Level 2 выбран Type={{actual}}.',
      expectation: 'Для Level 2 допустимы только Primary, Colored и Border.',
      action: 'Выбрать Primary, Colored или Border.',
      targetFact: 'component.properties.Type',
    },
  }],
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'snapshot',
    ruleRelease: 'release',
    coverage: {
      total: 1,
      byClassification: { 'not-evaluable': 1 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [Object.assign({}, base, {
      evaluationId: 'background-plate-type-absent',
      ruleId: 'component:web-corp.background-plate.no-secondary-for-level-2',
      ruleRevision: 1,
      subjectNodeId: '2:0',
      subjectNodeName: 'PASS · [D] BackgroundPlate · Level 2',
      focusNodeId: '2:0',
      focusNodeName: 'PASS · [D] BackgroundPlate · Level 2',
      applicability: 'applicable',
      classification: 'not-evaluable',
      trace: {
        predicate: 'one-of',
        truth: 'unknown',
        reason: 'comparison value is absent',
        actual: { state: 'absent' },
        expected: ['Primary', 'Colored', 'Border'],
        factPaths: ['component.properties.Type'],
      },
    })],
  },
});
assert.equal(absentFact.findings[0].priority, 'human_review');
assert.match(
  absentFact.responseMarkdown,
  /Недостаточно данных для проверки Type у BackgroundPlate Level 2/,
);
assert.match(
  absentFact.responseMarkdown,
  /В снапшоте отсутствует значение Type у BackgroundPlate Level 2\./,
);
assert.doesNotMatch(
  absentFact.responseMarkdown,
  /Для BackgroundPlate Level 2 выбран Secondary/,
);

const unavailableTitleBaseline = buildApolloPredicateUiValidation({
  rules: [{
    ruleId: 'component:web-corp.title-view.title-and-subtitle-typography-is-fixed',
    revision: 1,
    severity: 'error',
    source: titleViewSource,
  }],
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'snapshot',
    ruleRelease: 'release',
    coverage: {
      total: 1,
      byClassification: { 'not-evaluable': 1 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [Object.assign({}, base, {
      evaluationId: 'title-baseline-unknown',
      ruleId: 'component:web-corp.title-view.title-and-subtitle-typography-is-fixed',
      ruleRevision: 1,
      subjectNodeId: '1:2',
      focusNodeId: '1:2',
      applicability: 'applicable',
      classification: 'not-evaluable',
      trace: {
        predicate: 'matches-effective-baseline',
        truth: 'unknown',
        reason: 'expected fact is unknown',
        actual: { state: 'absent' },
        expected: { state: 'unknown' },
        factPaths: [
          'appearance.styles.textStyle',
          'baseline.effective.appearance.styles.textStyle',
        ],
      },
    })],
  },
});
assert.equal(unavailableTitleBaseline.findings[0].priority, 'human_review');
assert.doesNotMatch(unavailableTitleBaseline.responseMarkdown, /\{"state":/);
assert.match(
  unavailableTitleBaseline.responseMarkdown,
  /Текущий стиль: отсутствует; effective baseline не удалось определить\./,
);
assert.match(
  unavailableTitleBaseline.responseMarkdown,
  /Проверить контракт и generated baseline TitleView\./,
);

const persistedValidation = {
  rules: [],
  repeatability: {
    runCount: 10,
    stable: true,
    resultHash: 'f'.repeat(64),
  },
  result: {
    schemaVersion: 'apollo.predicate-result.v1',
    snapshotHash: 'snapshot-hash',
    ruleRelease: 'release',
    coverage: {
      total: 1,
      byClassification: { compliant: 1 },
      unclassified: 0,
      duplicateEvaluationIds: 0,
    },
    evaluations: [
      Object.assign({}, base, {
        evaluationId: 'trace-preserved',
        ruleId: 'rule',
        ruleRevision: 1,
        subjectNodeId: '9:1',
        focusNodeId: '9:2',
        classification: 'compliant',
        trace: {
          predicate: 'equals',
          truth: 'true',
          reason: 'values match',
          actual: '56',
          expected: '56',
          factPaths: ['component.properties.Size'],
        },
      }),
    ],
  },
};
const statsReport = buildApolloPredicateStatsReport(
  {
    sourceReportId: 'source-report',
    suggestedFileName: 'User_23-08-2026_12-09-22_patterns.json',
    user: { id: 'user', name: 'User', slug: 'User' },
    plugin: { name: 'Apollo v3', version: '3' },
    figma: { fileKey: 'file', fileName: 'File', pageId: '1:1', pageName: 'Page' },
    scan: { selection: [], pageType: 'form' },
  },
  persistedValidation,
  empty,
);
assert.equal(statsReport.reportKind, 'apollo-predicate-report');
assert.equal(
  statsReport.suggestedFileName,
  'User_23-08-2026_12-09-22_predicates.json',
);
assert.equal(statsReport.summary.evaluationCount, 1);
assert.equal(statsReport.validation.result.evaluations[0].focusNodeId, '9:2');
assert.equal(statsReport.validation.result.evaluations[0].trace.truth, 'true');
assert.deepEqual(statsReport.validation.repeatability, {
  runCount: 10,
  stable: true,
  resultHash: 'f'.repeat(64),
});

console.log('Apollo predicate pilot validation regression test passed.');
