// Actual built UI → actual /analyze route → owned synthetic HTTP provider / fake executable.
// No production Proxy listener, real agent, live Figma or paid call is used.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { pathToFileURL } = require('node:url');
const { createUiMainBridge, SOURCE_SCHEMA } = require('../../src/design-check/ui-protocol');
const repo = path.resolve(__dirname, '../../../..'), proxy = process.env.APOLLO_DIALOGUE_TEST_PROXY_ROOT || path.resolve(repo, '../../services/apollo-proxy');
const output = process.env.DESIGN_CHECK_QA_ROOT;
const listen = server => new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve('http://127.0.0.1:' + server.address().port)));
const close = server => new Promise(resolve => server.close(resolve));
async function run() {
  if (!output) throw Error('Set DESIGN_CHECK_QA_ROOT to a new private QA directory.');
  fs.mkdirSync(path.join(output, 'screenshots'), { recursive: true });
  const wire = [], providerRequests = [], storageWrites = [], sizes = [], errors = [], blocked = [], headers = [], cryptoCapabilities = [];
  let releaseBackground, backgroundStarted;
  const markdown = '# Паттерны\n\nВ базе **37 паттернов**, *пример* и `token`.\n\n- [Форма](products/ab/patterns/form.md)\n- [Документация](https://example.test/docs)\n\n1. Первый\n2. Второй\n\n> Цитата\n\n| Имя | Значение |\n| --- | --- |\n| Токен | 10% |\n\n```css\nbutton { color: red; }\n```\n\n<script>window.__markdownInjected = true</script>\n<img src=x onerror=attack()> [Unsafe](javascript:injected)';
  const provider = http.createServer(async (req, res) => {
    let raw = ''; for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw); providerRequests.push(body);
    const input = JSON.parse(body.input_value);
    if (input.question === 'synthetic-delay') await new Promise(resolve => setTimeout(resolve, 300));
    if (input.question === 'synthetic-background') await new Promise(resolve => { releaseBackground = resolve; backgroundStarted?.(); });
    res.setHeader('Content-Type', 'application/json');
    if (input.question === 'synthetic-error') { res.statusCode = 503; res.end(JSON.stringify({ error: 'synthetic provider unavailable' })); }
    else res.end(JSON.stringify({ result: input.question === 'markdown-proof' ? markdown : 'Синтетический ответ Langflow для проверки транспорта. Он не подтверждает правила макета.' }));
  });
  const providerOrigin = await listen(provider), executable = path.join(output, 'synthetic-codex.cjs');
  fs.writeFileSync(executable, '#!' + process.execPath + '\n' +
    "const fs=require('node:fs');let text='';process.stdin.on('data',v=>text+=v);process.stdin.on('end',()=>{const i=process.argv.indexOf('--output-last-message');if(i<0)process.exit(2);fs.appendFileSync(" + JSON.stringify(path.join(output, 'synthetic-codex-invocations.txt')) + ", 'synthetic invocation\\n');fs.writeFileSync(process.argv[i+1], 'Синтетический ответ Codex: транспорт работает. Правила и статус приёмки макета этим ответом не подтверждаются.');});\n", { mode: 0o700 });
  process.env.CODEX_BIN = executable;
  process.env.APOLLO_AGENT_URL = providerOrigin + '/synthetic-agent';
  process.env.LANGFLOW_URL = process.env.APOLLO_AGENT_URL;
  process.env.APOLLO_AGENT_KEY = process.env.LANGFLOW_KEY = 'synthetic-only';
  process.env.APOLLO_AGENT_MAX_ATTEMPTS = '1';
  process.env.APOLLO_CODEX_DEBUG_ENABLED = '0';
  process.env.APOLLO_KNOWLEDGE_CONTENT_VERSION = 'synthetic-ui-http';
  const express = require(path.join(proxy, 'node_modules/express')), actualProxy = require(path.join(proxy, 'server.js'));
  const app = express(); app.use(express.json());
  app.use((req, res, next) => { if (req.path === '/analyze') wire.push(JSON.parse(JSON.stringify(req.body))); next(); });
  app.use(actualProxy.app);
  const server = http.createServer(app), origin = await listen(server);
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  let checks = 0;
  try {
    const page = await browser.newPage({ viewport: { width: 800, height: 860 } });
    page.on('pageerror', e => errors.push(e.message));
    let stored = null, releasePreference, delayPreference = true;
    const bridge = createUiMainBridge({ storage: {
      async getAsync() { if (delayPreference) return new Promise(resolve => { releasePreference = resolve; }); return stored; },
      async setAsync(key, value) { storageWrites.push({ key, value }); stored = value; }
    }, resize: (width, height) => sizes.push({ width, height }), post: m => page.evaluate(message => window.emitPlugin(message), m) });
    await page.exposeFunction('__ownedUiBridge', message => bridge.accept(message));
    await page.addInitScript(() => {
      // Reproduce the Figma iframe without randomUUID before the built UI runs.
      Object.defineProperty(globalThis.crypto, 'randomUUID', { value: undefined, configurable: true });
      // The narrowest case also exercises the host with no usable Web Crypto.
      if (innerWidth === 360) Object.defineProperty(globalThis.crypto, 'getRandomValues', { value: undefined, configurable: true });
      window.bridgeMessages = [];
      window.emitPlugin = data => window.dispatchEvent(new MessageEvent('message', { source: window, data: { pluginMessage: data } }));
      parent.postMessage = value => { window.bridgeMessages.push(value.pluginMessage); if (value.pluginMessage?.type === 'design-check-ui-request') void window.__ownedUiBridge(value.pluginMessage); };
    });
    await page.route(/^https?:/, async route => {
      const url = route.request().url();
      if (!['http://localhost:3001/analyze', 'http://localhost:3001/health'].includes(url)) { blocked.push(url); await route.abort(); return; }
      const response = await fetch(origin + new URL(url).pathname, { method: route.request().method(),
        headers: { 'Content-Type': 'application/json' }, body: route.request().postData() || undefined });
      const body = await response.text();
      try { await route.fulfill({ status: response.status, contentType: 'application/json', body }); } catch { /* client wait was cancelled */ }
    });
    const goto = () => page.goto(pathToFileURL(path.join(repo, 'apps/apollo-v4/dist/ui.html')).href);
    const question = async text => { await page.getByRole('textbox', { name: 'Вопрос Apollo' }).fill(text); await page.getByRole('button', { name: 'Отправить вопрос', exact: true }).click(); };
    const checkHeader = async width => {
      await page.waitForFunction(() => document.querySelector('.agent-proxy-version')?.textContent.includes('Proxy v'));
      const header = await page.locator('.design-check-chat-controls').evaluate(node => {
        node.scrollLeft = 0;
        const boxes = Array.from(node.children, child => { const r = child.getBoundingClientRect(); return { className: child.className, x: r.x, y: r.y, height: r.height }; });
        const navigation = document.querySelector('.design-check-rail'), r = navigation.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + 20);
        return { boxes, overflow: document.documentElement.scrollWidth > innerWidth, railAccessible: navigation === hit || navigation.contains(hit), scrollable: node.scrollWidth > node.clientWidth };
      });
      assert.deepEqual(header.boxes.map(box => box.className), ['agent-proxy-version', 'agent-source-control', 'agent-dialogue-mode-control']);
      assert.ok(header.boxes.every(box => box.height === 40 && box.y === header.boxes[0].y));
      assert.ok(header.boxes[0].x < header.boxes[1].x && header.boxes[1].x < header.boxes[2].x);
      assert.equal(header.overflow, false); assert.equal(header.railAccessible, true);
      assert.equal(header.scrollable, width < 800); checks += 6;
      headers.push({ width, ...header });
      // Tab into an off-screen goal must scroll it into view while keeping the navigation available.
      await page.getByRole('button', { name: 'Codex', exact: true }).focus(); await page.keyboard.press('Tab');
      const goalAccessible = await page.getByRole('button', { name: 'Вопрос', exact: true }).evaluate(node => {
        const r = node.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return node === document.activeElement && (hit === node || node.contains(hit));
      });
      assert.equal(goalAccessible, true); checks++;
      await page.locator('.design-check-chat-controls').evaluate(node => { node.scrollLeft = 0; });
      const capabilities = await page.evaluate(() => ({ randomUUID: typeof crypto.randomUUID, getRandomValues: typeof crypto.getRandomValues }));
      assert.equal(capabilities.randomUUID, 'undefined');
      assert.equal(capabilities.getRandomValues, width === 360 ? 'undefined' : 'function'); checks += 2;
      cryptoCapabilities.push({ width, ...capabilities });
    };
    await goto();
    assert.equal(await page.locator('[aria-label="Не проверено"]').count(), 13); checks++;
    await page.getByRole('button', { name: 'Открыть чат с Apollo' }).click();
    await question('Первый синтетический вопрос');
    await page.locator('.assistant-copy').waitFor();
    delayPreference = false; releasePreference({ schemaVersion: SOURCE_SCHEMA, source: 'codex' }); await bridge.flush();
    assert.equal(await page.getByRole('button', { name: 'Langflow', exact: true }).getAttribute('aria-pressed'), 'true'); checks++;
    await question('Продолжение синтетического вопроса');
    await page.waitForFunction(() => document.querySelectorAll('.assistant-copy').length === 2);
    assert.equal(wire[1].source, 'langflow'); assert.equal(wire[1].session_id, wire[0].session_id); assert.equal(wire[1].dialogue.length, 2); checks += 3;
    assert.match(await page.locator('.design-check-provenance').first().innerText(), /Langflow.*synthetic-ui-http.*не меняет результат/); checks++;
    await page.getByRole('button', { name: 'Codex', exact: true }).click();
    await question('Синтетический вопрос Codex'); await page.locator('.assistant-copy').waitFor();
    assert.match(await page.locator('.assistant-copy').innerText(), /Синтетический ответ Codex/); checks++;
    assert.equal(wire.at(-1).source, 'codex'); assert.notEqual(wire.at(-1).session_id, wire[0].session_id); assert.deepEqual(wire.at(-1).dialogue, []); checks += 3;
    assert.match(await page.locator('.design-check-provenance').innerText(), /Codex.*synthetic-ui-http/); checks++;
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('button', { name: 'Открыть чат с Apollo' }).evaluate(node => node === document.activeElement), true); checks++;
    const fixture = require('../fixtures'), runtime = require('../../dist/runtime.cjs'), document = fixture.contract(), snapshot = fixture.snapshot();
    snapshot.nodes[0].appearance.opacity = .5;
    const audit = { auditId: 'a'.repeat(64), release: { channel: 'local-file' }, result: runtime.auditContractSnapshot(snapshot, document), snapshot, warnings: [] };
    for (const width of [800, 440, 360]) {
      await page.setViewportSize({ width, height: 860 }); await goto();
      await page.getByRole('button', { name: 'Тип страницы', exact: true }).click();
      await page.getByRole('button', { name: 'Страница с таблицей', exact: true }).click();
      await page.getByRole('button', { name: 'Открыть настройки Apollo' }).click();
      for (const name of ['Проверять шаред', 'Тестировать Contract v2', 'Показывать Expected']) assert.equal(await page.getByRole('button', { name, exact: true }).isDisabled(), true);
      checks += 3; await page.screenshot({ path: path.join(output, 'screenshots', 'integrated-settings-' + width + '.png') });
      await page.getByRole('button', { name: 'Компактный вид', exact: true }).click();
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => document.querySelector('.design-check-shell.compact'));
      await page.getByRole('button', { name: 'Открыть настройки Apollo' }).click(); await page.getByRole('button', { name: 'Компактный вид', exact: true }).click(); await page.keyboard.press('Escape');
      await page.evaluate(() => window.emitPlugin({ type: 'selection', valid: true, name: 'Синтетический компонент', id: 'synthetic', invalidated: true }));
      // The category remains the user's choice; select the contract report explicitly.
      await page.getByRole('complementary', { name: 'Категории проверки' }).getByRole('button', { name: /^Кастомизации(?! \[WIP\])/ }).click();
      await page.getByRole('button', { name: 'Проверить', exact: true }).click();
      const requests = await page.evaluate(() => window.bridgeMessages.filter(m => m.type === 'audit')); assert.equal(requests.length, 1); assert.deepEqual(Object.keys(requests[0]).sort(), ['requestId', 'type']); checks += 2;
      await page.evaluate(data => window.emitPlugin(data), { type: 'audit-result', requestId: requests[0].requestId, audit, rules: document.rules.map(r => ({ ruleId: r.ruleId, title: r.presentation.title })) });
      // A repeated terminal reply cannot overwrite the accepted report.
      await page.evaluate(data => window.emitPlugin(data), { type: 'audit-result', requestId: requests[0].requestId, audit: Object.assign({}, audit, { auditId: 'b'.repeat(64), result: { engine: { evaluations: [] }, coverage: {} } }), rules: [] });
      assert.equal(await page.locator('.finding').count(), 1); assert.match(await page.locator('#coverage').innerText(), /завершены/); assert.equal(await page.locator('[aria-label="Не проверено"]').count(), 12); checks += 3;
      await page.locator('.finding button').click(); assert.equal((await page.evaluate(() => window.bridgeMessages.at(-1))).type, 'focus'); checks++;
      const download = page.waitForEvent('download'); await page.locator('#export').click(); assert.match((await download).suggestedFilename(), /apollo-v4-/); checks++;
      await page.getByRole('button', { name: 'Генерация', exact: true }).click(); assert.equal(await page.locator('#generation-review').isVisible(), true); assert.equal(await page.locator('#generation-target').isVisible(), true); checks += 2;
      await page.locator('#native-diagnostic-status').scrollIntoViewIfNeeded();
      const geometry = await page.evaluate(() => {
        const node = document.getElementById('native-diagnostic-status'), r = node.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return { overflow: document.documentElement.scrollWidth > innerWidth, unobscured: hit === node || node.contains(hit) };
      });
      if (geometry.overflow || !geometry.unobscured) {
        await page.screenshot({ path: path.join(output, 'screenshots', 'scroll-failure-' + width + '.png') });
        console.log(JSON.stringify(await page.evaluate(() => { const n = document.getElementById('native-diagnostic-status'), r = n.getBoundingClientRect(), hit = document.elementFromPoint(r.x+r.width/2,r.y+r.height/2); return {width:innerWidth,rect:r.toJSON(),hit:hit?.outerHTML,workspace:getComputedStyle(document.querySelector('.workspace')).cssText}; })));
      }
      assert.deepEqual(geometry, { overflow: false, unobscured: true }); checks++;
      await page.screenshot({ path: path.join(output, 'screenshots', 'integrated-result-generation-' + width + '.png') });
      await page.getByRole('button', { name: 'Проверка', exact: true }).click();
      assert.equal(await page.locator('#result').isVisible(), true); checks++;
      await page.getByRole('button', { name: 'Открыть чат с Apollo' }).click();
      await checkHeader(width);
      await page.getByRole('button', { name: 'Langflow', exact: true }).click();
      await question('markdown-proof'); await page.locator('.assistant-copy').waitFor();
      const answer = page.locator('.assistant-copy');
      assert.equal(await answer.locator('strong').innerText(), '37 паттернов'); assert.equal(await answer.locator('em').innerText(), 'пример');
      assert.equal(await answer.locator('h1').innerText(), 'Паттерны'); assert.equal(await answer.locator('ul li').count(), 2); assert.equal(await answer.locator('ol li').count(), 2);
      assert.equal(await answer.locator('table tbody td').count(), 2); assert.match(await answer.locator('pre code').innerText(), /button \{ color: red; \}/);
      assert.equal(await answer.locator('a').getAttribute('href'), 'https://example.test/docs');
      assert.equal(await answer.locator('script,img,a[href^="javascript:"]').count(), 0); assert.equal(await page.evaluate(() => window.__markdownInjected), undefined); checks += 10;
      await page.screenshot({ path: path.join(output, 'screenshots', 'markdown-chat-' + width + '.png') });
      await page.getByRole('button', { name: 'Codex', exact: true }).click(); await page.getByRole('button', { name: 'Langflow', exact: true }).click();
      await question('Проверка совместимости iframe ' + width); await page.locator('.assistant-copy').waitFor();
      assert.equal(await page.locator('.design-check-error').count(), 0); checks++;
      await page.locator('.design-check-chat-controls').evaluate(node => { node.scrollLeft = 0; });
      await page.screenshot({ path: path.join(output, 'screenshots', 'chat-fixed-' + width + '.png') });
      // Reset the source before the existing cancellation regression.
      await page.getByRole('button', { name: 'Codex', exact: true }).click();
      await page.getByRole('button', { name: 'Langflow', exact: true }).click();
      await question('synthetic-delay'); await page.getByRole('button', { name: 'Остановить ожидание ответа' }).click();
      assert.match(await page.locator('.design-check-error').innerText(), /на сервере может продолжаться/); checks++;
      await page.waitForTimeout(400); assert.equal(await page.locator('.assistant-copy').count(), 0); checks++;
      await question('synthetic-error'); await page.locator('.design-check-error').waitFor();
      await page.waitForFunction(() => document.querySelector('.design-check-error')?.textContent.includes('503'));
      await page.screenshot({ path: path.join(output, 'screenshots', 'integrated-chat-' + width + '.png') }); checks++;
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Открыть чат с Apollo' }).click();
      await question('synthetic-background');
      await new Promise(resolve => { if (releaseBackground) resolve(); else backgroundStarted = resolve; });
      await page.getByRole('button', { name: 'Проверка', exact: true }).click();
      await page.evaluate(() => window.emitPlugin({ type: 'selection', valid: true, name: 'Background layout check', id: 'background', invalidated: true }));
      await page.getByRole('button', { name: 'Проверить', exact: true }).click();
      const backgroundAudit = await page.evaluate(() => window.bridgeMessages.filter(m => m.type === 'audit').at(-1));
      await page.evaluate(data => window.emitPlugin(data), { type: 'audit-result', requestId: backgroundAudit.requestId, audit, rules: [] });
      releaseBackground(); releaseBackground = null; backgroundStarted = null;
      await page.locator('.design-check-chat-unread').waitFor();
      assert.equal(await page.locator('.design-check-chat-unread').innerText(), '1'); assert.equal(await page.getByRole('region', { name: 'Чат с Apollo', exact: true }).count(), 0);
      assert.equal(await page.locator('#result').isVisible(), true); checks += 3;
      await page.screenshot({ path: path.join(output, 'screenshots', 'unread-after-audit-' + width + '.png') });
      await page.getByRole('button', { name: 'Генерация', exact: true }).click();
      assert.equal(await page.locator('.design-check-chat-unread').isVisible(), true); checks++;
      await page.screenshot({ path: path.join(output, 'screenshots', 'unread-in-generation-' + width + '.png') });
      await page.getByRole('button', { name: 'Открыть чат с Apollo' }).click();
      assert.equal(await page.locator('.design-check-chat-unread').count(), 0); assert.equal(await page.locator('.assistant-copy').count(), 1); checks += 2;
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('button', { name: 'Генерация', exact: true }).getAttribute('aria-pressed'), 'true'); checks++;
      await page.getByRole('button', { name: 'Проверка', exact: true }).click();
      assert.equal(await page.locator('#result').isVisible(), true); checks++;
      await page.evaluate(() => window.emitPlugin({ type: 'selection', valid: false, name: '', invalidated: true, id: '' }));
      await page.evaluate(data => window.emitPlugin(data), { type: 'audit-result', requestId: requests[0].requestId, audit, rules: [] });
      assert.equal(await page.locator('#result').isVisible(), true); assert.equal(await page.getByRole('button', { name: 'Проверить', exact: true }).isDisabled(), true); checks += 2;
      // Cursor movement during capture keeps the original roots and busy correlation.
      await page.evaluate(() => window.emitPlugin({ type: 'selection', valid: true, name: 'First', id: 'first', invalidated: true }));
      await page.getByRole('button', { name: 'Проверить', exact: true }).click();
      const cancelled = await page.evaluate(() => window.bridgeMessages.filter(m => m.type === 'audit').at(-1));
      await page.evaluate(() => window.emitPlugin({ type: 'selection', valid: true, name: 'Second', id: 'second', invalidated: true }));
      assert.equal(await page.getByRole('button', { name: 'Проверяем', exact: true }).isDisabled(), true); checks++;
      await page.evaluate(data => window.emitPlugin(data), { type: 'audit-result', requestId: cancelled.requestId, audit, rules: [] });
      assert.equal(await page.locator('#result').isVisible(), true); assert.equal(await page.getByRole('button', { name: 'Проверить', exact: true }).isDisabled(), false); checks += 2;
      await page.reload(); assert.equal(await page.getByRole('button', { name: 'Тип страницы', exact: true }).isVisible(), true); checks++;
    }
    for (const request of wire) {
      assert.deepEqual(JSON.parse(request.text).context, { selection: null, finding: null, auditReport: null, componentContext: null });
      assert.ok(request.dialogue.length <= 12); assert.ok(request.dialogue.every(m => m.text.length <= 8000));
    }
    assert.ok(storageWrites.every(w => Object.keys(w.value).sort().join(',') === 'schemaVersion,source'));
    assert.ok(sizes.some(v => v.width === 400)); assert.ok(sizes.some(v => v.width === 800));
    assert.deepEqual(errors, []); assert.deepEqual(blocked, []);
    fs.writeFileSync(path.join(output, 'browser-summary.json'), JSON.stringify({ checks, widths: [800, 440, 360], headers, cryptoCapabilities, wire, providerRequests, storageWrites, sizes, errors, blocked,
      actualProxyRoute: true, syntheticProvidersOnly: true, realAgentConnectivity: 'unverified', liveFigma: false }, null, 2) + '\n');
    console.log(JSON.stringify({ checks, wireRequests: wire.length, syntheticProviderRequests: providerRequests.length, actualProxyRoute: true, realAgent: false, liveFigma: false }));
  } finally { await browser.close(); await close(server); await close(provider); }
}
run().catch(error => { console.error(error.stack); process.exitCode = 1; });
