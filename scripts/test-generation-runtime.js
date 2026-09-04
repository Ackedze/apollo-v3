const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const codeSource = fs.readFileSync(path.join(root, 'src/code.ts'), 'utf8');
const routerSource = fs.readFileSync(
  path.join(root, 'src/plugin/messageRouter.ts'),
  'utf8',
);
const uiSource = fs.readFileSync(path.join(root, 'src/ui.html'), 'utf8');
const executorSource = fs.readFileSync(
  path.join(root, 'src/generation/executePlan.ts'),
  'utf8',
);
const serviceSource = fs.readFileSync(
  path.join(root, 'src/generation/service.ts'),
  'utf8',
);

function loadTypeScriptModule(relativePath, name) {
  const outfile = path.join(
    os.tmpdir(),
    `apollo-generation-${name}-${process.pid}-${Date.now()}.cjs`,
  );
  esbuild.buildSync({
    entryPoints: [path.join(root, relativePath)],
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

function createPlan() {
  return {
    schemaVersion: 'apollo.generation-plan.v5',
    title: 'Форма',
    summary: 'Форма: 1 компонент из базы Apollo Proxy.',
    kind: 'recipe',
    recipe: 'form',
    pattern: null,
    platform: 'desktop',
    knowledge: {
      primarySource: 'ds-ai-hub',
      technicalSource: 'design-system_ab',
      retrieval: {
        schemaVersion: 'apollo.generation-context.v3',
        packetChecksum: 'f'.repeat(64),
        documentCount: 12,
        packetChars: 42000,
        patternIds: ['ptrn:test'],
        componentIds: ['Button'],
      },
      catalogRoot: 'web/components',
      componentCount: 1,
      sources: [{
        source: 'ds-ai-hub',
        path: 'products/ab/patterns/form-construction-rules.md',
        role: 'pattern',
        purpose: 'Структура формы',
        ruleIds: [],
        checksum: 'd'.repeat(64),
      }],
    },
    warnings: [],
    preflight: {
      schemaVersion: 'apollo.generation-preflight.v1',
      status: 'passed',
      intent: { kind: 'form' },
      checks: [{
        id: 'placement:screen',
        status: 'pass',
        message: 'Корневой frame проверен.',
        evidence: null,
      }],
    },
    nodes: [
      {
        id: 'screen',
        type: 'frame',
        parentId: null,
        name: 'Apollo · Форма',
        semanticRole: 'screen',
        placement: 'append',
        parentPath: null,
        width: 1200,
        minHeight: 720,
        layout: 'vertical',
        gap: 24,
        padding: 48,
        fillVariableKey: 'c'.repeat(40),
        fillVariableName: 'base-bg-alt/primary',
        cornerRadius: 32,
      },
      {
        id: 'component-1',
        type: 'component',
        parentId: 'screen',
        name: '[D] Input',
        semanticRole: 'field',
        semanticComponentId: 'Input',
        placement: 'append',
        parentPath: null,
        componentId: 'input.desktop',
        componentKey: 'a'.repeat(40),
        width: 'fill',
        knowledgePath: 'web/components/Input/contract.generated.json',
        presentation: 'inline',
        variantProperties: [{ name: 'Size', value: '56' }],
        textOverrides: [],
        preconditionOverrides: [],
        nodeOverrides: [],
        instancePropertyOverrides: [],
      },
    ],
  };
}

const { parseApolloGenerationPlan } = loadTypeScriptModule(
  'src/generation/contracts.ts',
  'contracts',
);
assert.equal(parseApolloGenerationPlan(createPlan()).recipe, 'form');

const patternPlan = createPlan();
patternPlan.kind = 'pattern';
patternPlan.recipe = null;
patternPlan.pattern = {
  id: 'ptrn:landing-pages.alfa-business',
  key: 'landing-pages.alfa-business',
  name: 'Лендинги в Альфа-Бизнесе',
  sourcePath: 'products/ab/patterns/landing-pages.md',
  sourceChecksum: 'c'.repeat(64),
  ruleIds: ['rule:landing-pages.alfa-business.required-three-sections'],
};
assert.equal(
  parseApolloGenerationPlan(patternPlan).pattern.id,
  'ptrn:landing-pages.alfa-business',
);

const patternWithoutEvidence = createPlan();
patternWithoutEvidence.kind = 'pattern';
patternWithoutEvidence.recipe = null;
assert.throws(
  () => parseApolloGenerationPlan(patternWithoutEvidence),
  /некорректный план генерации/,
  'Pattern plans must carry source identity and checksum.',
);

const unsafePlan = createPlan();
unsafePlan.nodes.push({
  id: 'script',
  type: 'script',
  parentId: 'screen',
  source: 'figma.currentPage.remove()',
});
assert.throws(
  () => parseApolloGenerationPlan(unsafePlan),
  /неподдерживаемый узел/,
  'The plugin must reject executable or unknown operations from the proxy.',
);

for (const forbidden of [
  'runAudit(',
  'scanSelection',
  'lastApolloAgentReport',
  'lastApolloPatternReport',
  'evaluatePredicate',
]) {
  assert.equal(
    serviceSource.includes(forbidden),
    false,
    `Generation must not access audit state or execution: ${forbidden}`,
  );
}
assert.equal(
  executorSource.includes('../predicate'),
  false,
  'The generation executor must not import predicate modules.',
);
assert.ok(
  codeSource.includes('createApolloLayoutGenerator'),
  'The main runtime must only wire the isolated layout generator service.',
);
assert.ok(
  routerSource.includes("case 'generate-apollo-layout':"),
  'Generation must have a dedicated plugin message.',
);
assert.ok(
  uiSource.includes('let agentDialogueMode = \'question\';'),
  'Question mode must be active by default.',
);
assert.ok(
  uiSource.includes('data-agent-dialogue-mode="generation"'),
  'The chat must expose Generation mode.',
);
assert.ok(
  uiSource.includes('data-agent-dialogue-mode="question"'),
  'The chat must expose Question mode.',
);
assert.ok(
  uiSource.includes('Агент прочитает подходящие паттерны и рецепты ds-ai-hub'),
  'Generation intro must explain the agent-backed source of truth.',
);
assert.ok(
  serviceSource.includes("data.status === 'clarification_required'"),
  'Generation must support clarification without executing a plan.',
);
assert.ok(
  routerSource.includes('message.payload?.dialogue'),
  'Generation clarification context must cross the plugin message boundary.',
);

function createMockNode(type, id) {
  return {
    id,
    type,
    name: '',
    width: 100,
    height: 40,
    visible: true,
    characters: '',
    fontName: { family: 'Inter', style: 'Regular' },
    removed: false,
    children: [],
    resize(width, height) {
      this.width = width;
      this.height = height;
    },
    appendChild(child) {
      if (child.parent?.children) {
        child.parent.children = child.parent.children.filter((item) => item !== child);
      }
      this.children.push(child);
      child.parent = this;
    },
    remove() {
      this.removed = true;
      if (this.parent?.children) {
        this.parent.children = this.parent.children.filter((item) => item !== this);
      }
    },
    setProperties(properties) {
      this.lastProperties = properties;
      if (typeof this.onSetProperties === 'function') {
        this.onSetProperties(properties);
      }
    },
    swapComponent(component) {
      this.swappedComponentKey = component.key;
    },
    getRangeAllFontNames() {
      return [this.fontName];
    },
  };
}

async function testGenerationExecutor() {
  const { executeApolloGenerationPlan } = loadTypeScriptModule(
    'src/generation/executePlan.ts',
    'executor',
  );
  const frames = [];
  const importedKeys = [];
  const importedVariableKeys = [];
  const executionEvents = [];
  const api = {
    currentPage: { selection: [] },
    viewport: {
      center: { x: 800, y: 500 },
      scrollAndZoomIntoView(nodes) {
        this.lastFocused = nodes;
      },
    },
    createFrame() {
      const frame = createMockNode('FRAME', `frame-${frames.length + 1}`);
      frames.push(frame);
      return frame;
    },
    variables: {
      async importVariableByKeyAsync(key) {
        importedVariableKeys.push(key);
        return { key };
      },
      setBoundVariableForPaint(paint) {
        return paint;
      },
    },
    async importComponentByKeyAsync(key) {
      importedKeys.push(key);
      if (key.startsWith('b')) {
        throw new Error('library unavailable');
      }
      return {
        key,
        createInstance() {
          const instance = createMockNode('INSTANCE', `instance-${importedKeys.length}`);
          if (key.startsWith('c')) {
            const slot = createMockNode('SLOT', 'body-slot');
            slot.name = '[M] Body';
            const placeholder = createMockNode('FRAME', 'placeholder');
            placeholder.name = 'Placeholder';
            slot.appendChild(placeholder);
            instance.appendChild(slot);
          }
          if (key.startsWith('d')) {
            const content = createMockNode('FRAME', 'hero-content');
            content.name = 'Content';
            const wrapper = createMockNode('FRAME', 'hero-wrapper');
            wrapper.name = 'ContentWrapper';
            const group = createMockNode('INSTANCE', 'hero-button-group');
            group.name = 'ButtonGroup';
            wrapper.appendChild(group);
            content.appendChild(wrapper);
            instance.appendChild(content);
          }
          if (key.startsWith('f')) {
            for (let index = 0; index < 2; index += 1) {
              const card = createMockNode('INSTANCE', `benefit-card-${index + 1}`);
              card.name = '[D] BenefitCard';
              const title = createMockNode('FRAME', `benefit-title-${index + 1}`);
              title.name = 'Title';
              const value = createMockNode('TEXT', `benefit-value-${index + 1}`);
              value.name = 'value';
              value.characters = `Benefit ${index + 1}`;
              title.appendChild(value);
              card.appendChild(title);
              instance.appendChild(card);
            }
          }
          if (key.startsWith('0')) {
            const item = createMockNode('INSTANCE', 'faq-item-1');
            item.name = 'FAQItem 01';
            item.onSetProperties = (properties) => {
              executionEvents.push(['properties', properties.Open]);
            };
            const accordion = createMockNode('FRAME', 'faq-accordion');
            accordion.name = 'Accordion';
            const body = createMockNode('FRAME', 'faq-body');
            body.name = 'Body';
            const accordionBody = createMockNode('INSTANCE', 'faq-accordion-body');
            accordionBody.name = '🔩 AccordionBody';
            const answer = createMockNode('TEXT', 'faq-answer');
            answer.name = 'Subtitle';
            let answerCharacters = '';
            Object.defineProperty(answer, 'characters', {
              configurable: true,
              get() {
                return answerCharacters;
              },
              set(value) {
                answerCharacters = value;
                executionEvents.push(['text', value]);
              },
            });
            accordionBody.appendChild(answer);
            body.appendChild(accordionBody);
            accordion.appendChild(body);
            item.appendChild(accordion);
            instance.appendChild(item);
          }
          return instance;
        },
      };
    },
    async loadFontAsync() {},
  };

  const plan = parseApolloGenerationPlan(createPlan());
  const result = await executeApolloGenerationPlan(plan, api);
  assert.equal(result.componentCount, 1);
  assert.equal(api.currentPage.selection[0].id, result.rootNodeId);
  assert.deepEqual(importedKeys, ['a'.repeat(40)]);
  assert.deepEqual(importedVariableKeys, ['c'.repeat(40)]);
  assert.equal(frames[0].children.length, 1);
  assert.deepEqual(frames[0].children[0].lastProperties, { Size: '56' });

  const semanticTargetPlanValue = createPlan();
  semanticTargetPlanValue.nodes[1].componentKey = 'f'.repeat(40);
  semanticTargetPlanValue.nodes[1].variantProperties = [];
  semanticTargetPlanValue.nodes[1].textOverrides = [{
    path: '[D] BenefitCard / Title / value',
    occurrence: 1,
    nodeTypes: ['TEXT'],
    semanticTarget: 'items.2.title',
    value: 'Второе преимущество',
  }];
  semanticTargetPlanValue.nodes[1].nodeOverrides = [{
    path: '[D] BenefitCard',
    occurrence: 0,
    nodeTypes: ['INSTANCE'],
    semanticTarget: 'items.1.visible',
    visible: false,
  }];
  semanticTargetPlanValue.nodes[1].instancePropertyOverrides = [{
    path: '[D] BenefitCard',
    occurrence: 1,
    nodeTypes: ['INSTANCE'],
    semanticTarget: 'items.2.compact',
    properties: [{ name: 'Compact', value: 'True' }],
  }];
  const semanticTargetPlan = parseApolloGenerationPlan(semanticTargetPlanValue);
  const semanticTargetResult = await executeApolloGenerationPlan(semanticTargetPlan, api);
  const semanticTargetRoot = frames.find((frame) => frame.id === semanticTargetResult.rootNodeId);
  const semanticTargetInstance = semanticTargetRoot.children[0];
  assert.equal(semanticTargetInstance.children[0].visible, false);
  assert.equal(
    semanticTargetInstance.children[1].children[0].children[0].characters,
    'Второе преимущество',
  );
  assert.deepEqual(semanticTargetInstance.children[1].lastProperties, { Compact: 'True' });

  executionEvents.length = 0;
  const editContextPlanValue = createPlan();
  editContextPlanValue.nodes[1].componentKey = '0'.repeat(40);
  editContextPlanValue.nodes[1].variantProperties = [];
  editContextPlanValue.nodes[1].preconditionOverrides = [{
    path: 'FAQItem 01',
    occurrence: 0,
    nodeTypes: ['INSTANCE'],
    semanticTarget: 'items.1.open',
    properties: [{ name: 'Open', value: 'True' }],
  }];
  editContextPlanValue.nodes[1].textOverrides = [{
    path: 'FAQItem 01 / Accordion / Body / 🔩 AccordionBody / Subtitle',
    occurrence: 0,
    nodeTypes: ['TEXT'],
    semanticTarget: 'items.1.answer',
    value: 'Ответ FAQ',
  }];
  editContextPlanValue.nodes[1].instancePropertyOverrides = [{
    path: 'FAQItem 01',
    occurrence: 0,
    nodeTypes: ['INSTANCE'],
    semanticTarget: 'items.1.open',
    properties: [{ name: 'Open', value: 'False' }],
  }];
  await executeApolloGenerationPlan(parseApolloGenerationPlan(editContextPlanValue), api);
  assert.deepEqual(executionEvents, [
    ['properties', 'True'],
    ['text', 'Ответ FAQ'],
    ['properties', 'False'],
  ]);

  const failedPlanValue = createPlan();
  failedPlanValue.nodes[1].componentKey = 'b'.repeat(40);
  const failedPlan = parseApolloGenerationPlan(failedPlanValue);
  const failedRootIndex = frames.length;
  await assert.rejects(
    () => executeApolloGenerationPlan(failedPlan, api),
    /library unavailable/,
  );
  assert.equal(
    frames[failedRootIndex].removed,
    true,
    'A failed generation must remove its partially created root.',
  );

  const nestedPlanValue = createPlan();
  nestedPlanValue.knowledge.componentCount = 3;
  nestedPlanValue.nodes = [
    nestedPlanValue.nodes[0],
    {
      ...nestedPlanValue.nodes[1],
      id: 'corporate',
      semanticRole: 'content',
      semanticComponentId: 'CorporateContent',
      name: '[M] CorporateContent',
      componentId: 'corporate-content.mobile-web',
      componentKey: 'c'.repeat(40),
      knowledgePath: 'web/components/CorporateContent/contract.generated.json',
      variantProperties: [],
    },
    {
      ...nestedPlanValue.nodes[0],
      id: 'main',
      parentId: 'corporate',
      name: 'Основной контент',
      semanticRole: 'main-content',
      placement: 'replace-slot',
      parentPath: '[M] Body',
      fillVariableKey: null,
      fillVariableName: null,
    },
    {
      ...nestedPlanValue.nodes[1],
      id: 'hero',
      parentId: 'main',
      semanticRole: 'hero',
      semanticComponentId: 'PromoMainBlock',
      name: '[M] PromoMainBlock',
      componentId: 'promo-main-block.mobile-web',
      componentKey: 'd'.repeat(40),
      knowledgePath: 'web/components/PromoMainBlock/contract.generated.json',
      variantProperties: [],
    },
    {
      ...nestedPlanValue.nodes[1],
      id: 'hero-action',
      parentId: 'hero',
      semanticRole: 'primary-action',
      semanticComponentId: 'ButtonStack',
      name: '🔒 [M] ButtonStack',
      componentId: 'button-stack.mobile-web',
      componentKey: 'e'.repeat(40),
      knowledgePath: 'web/components/ButtonStack/contract.generated.json',
      placement: 'swap-instance',
      parentPath: 'Content / ContentWrapper / ButtonGroup',
      variantProperties: [],
    },
  ];
  const nestedPlan = parseApolloGenerationPlan(nestedPlanValue);
  const nestedResult = await executeApolloGenerationPlan(nestedPlan, api);
  const nestedRoot = frames.find((frame) => frame.id === nestedResult.rootNodeId);
  const corporate = nestedRoot.children[0];
  const bodySlot = corporate.children[0];
  assert.equal(bodySlot.type, 'SLOT');
  assert.equal(bodySlot.children.length, 1);
  assert.equal(bodySlot.children[0].name, 'Основной контент');
  const swappedAction = bodySlot.children[0].children[0].children[0].children[0].children[0];
  assert.equal(swappedAction.name, '🔒 [M] ButtonStack');
  assert.equal(swappedAction.swappedComponentKey, 'e'.repeat(40));
}

async function testGenerationClarificationFlow() {
  const { createApolloLayoutGenerator } = loadTypeScriptModule(
    'src/generation/service.ts',
    'service',
  );
  const messages = [];
  let requestBody = null;
  const generator = createApolloLayoutGenerator({
    api: {
      createFrame() {
        throw new Error('Clarification must not mutate Figma.');
      },
    },
    async request(_url, init) {
      requestBody = JSON.parse(init.body);
      return {
        ok: true,
        async json() {
          return {
            success: true,
            status: 'clarification_required',
            clarification: {
              question: 'Какие поля нужны?',
              reason: 'От этого зависит структура формы.',
              suggestedAnswers: ['Контакты', 'Реквизиты'],
            },
          };
        },
      };
    },
    postMessage(message) {
      messages.push(message);
    },
  });
  await generator.generate(
    'generation-clarification',
    'Собери форму',
    [{ role: 'assistant', text: 'Какой сценарий?' }],
    'Исходный бриф формы',
    2,
  );
  assert.deepEqual(requestBody.dialogue, [
    { role: 'assistant', text: 'Какой сценарий?' },
  ]);
  assert.equal(requestBody.brief, 'Исходный бриф формы');
  assert.equal(requestBody.clarificationRound, 2);
  const result = messages.find((message) =>
    message.type === 'apollo-generation-result'
  );
  assert.equal(result.payload.clarificationRequired, true);
  assert.match(result.payload.text, /Какие поля нужны/);
}

async function testGenerationBlockedFlow() {
  const { createApolloLayoutGenerator } = loadTypeScriptModule(
    'src/generation/service.ts',
    'service-blocked',
  );
  const messages = [];
  const generator = createApolloLayoutGenerator({
    api: {
      createFrame() {
        throw new Error('Blocked generation must not mutate Figma.');
      },
    },
    async request() {
      return {
        ok: true,
        async json() {
          return {
            success: true,
            status: 'blocked',
            blocked: {
              code: 'GENERATION_CAPABILITY_MISSING',
              message: 'Этот блок пока нельзя собрать.',
              reason: 'Нет semantic target.',
              missingCapabilities: ['content.image'],
            },
          };
        },
      };
    },
    postMessage(message) {
      messages.push(message);
    },
  });
  await generator.generate('generation-blocked', 'Собери макет');
  const result = messages.find((message) =>
    message.type === 'apollo-generation-result'
  );
  assert.equal(result.payload.blocked, true);
  assert.match(result.payload.text, /Этот блок пока нельзя собрать/);
  assert.match(result.payload.text, /content\.image/);
}

async function testProxyStatusFlow() {
  const { createApolloLayoutGenerator } = loadTypeScriptModule(
    'src/generation/service.ts',
    'service-status',
  );
  const messages = [];
  let requestedUrl = null;
  const generator = createApolloLayoutGenerator({
    api: {},
    async request(url) {
      requestedUrl = url;
      return {
        ok: true,
        async json() {
          return {
            ok: true,
            proxy: { name: 'apollo-proxy', version: '1.3.0' },
          };
        },
      };
    },
    postMessage(message) {
      messages.push(message);
    },
  });
  await generator.getProxyStatus();
  assert.equal(requestedUrl, 'http://localhost:3001/health');
  assert.deepEqual(messages, [{
    type: 'apollo-proxy-status',
    payload: { available: true, version: '1.3.0' },
  }]);
}

Promise.all([
  testGenerationExecutor(),
  testGenerationClarificationFlow(),
  testGenerationBlockedFlow(),
  testProxyStatusFlow(),
])
  .then(() => {
    console.log('Apollo generation runtime and isolation checks passed.');
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
