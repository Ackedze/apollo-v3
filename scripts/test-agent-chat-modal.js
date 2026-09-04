const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const uiSource = fs.readFileSync(path.join(root, 'src/ui.html'), 'utf8');
const codeSource = fs.readFileSync(path.join(root, 'src/code.ts'), 'utf8');

function assertIncludes(source, value, message) {
  if (!source.includes(value)) {
    throw new Error(message);
  }
}

assertIncludes(
  uiSource,
  'data-figma-node-id="12473:114528"',
  'The Figma-matched chat launcher is missing.',
);
assertIncludes(
  uiSource,
  'right: 12px;\n        bottom: 12px;',
  'The chat launcher must keep the 12px right and bottom offsets.',
);
assertIncludes(
  uiSource,
  'M8.33301 0.501015C12.7865',
  'The exact exported bubble-alt vector path is missing.',
);
assertIncludes(
  uiSource,
  'data-figma-node-id="12473:114588"',
  'The Figma-matched chat modal is missing.',
);
assertIncludes(
  uiSource,
  'background: rgba(0, 0, 0, 0.6);',
  'The chat modal backdrop must match Figma.',
);
assertIncludes(
  uiSource,
  'placeholder="Задай вопрос"',
  'The chat composer placeholder must match Figma.',
);
assertIncludes(
  uiSource,
  'data-agent-source="langflow"',
  'The chat source control must expose LangFlow.',
);
assertIncludes(
  uiSource,
  'data-agent-source="codex"',
  'The chat source control must expose local Codex.',
);
assertIncludes(
  uiSource,
  '>Локальный Codex</button>',
  'The local Codex option must be clearly named for designers.',
);
assertIncludes(
  uiSource,
  'id="agent-proxy-version"',
  'Generation mode must expose the local Apollo Proxy version.',
);
assertIncludes(
  uiSource,
  "type: 'get-apollo-proxy-status'",
  'Opening generation chat must refresh the Apollo Proxy version.',
);
assertIncludes(
  uiSource,
  'generationOriginalBrief',
  'Generation chat must preserve the original brief across clarification rounds.',
);
assertIncludes(
  uiSource,
  'clarificationRound: generationClarificationRound',
  'Generation chat must send a bounded clarification round counter.',
);
assertIncludes(
  uiSource,
  'payload.blocked === true',
  'Generation chat must render a terminal blocked outcome without automatic retry.',
);
assertIncludes(
  uiSource,
  "msg.type === 'apollo-proxy-status'",
  'The chat must render Apollo Proxy health responses.',
);
assertIncludes(
  uiSource,
  "type: 'set-apollo-agent-source'",
  'The selected source must be persisted through the plugin runtime.',
);
assertIncludes(
  uiSource,
  "requestKind === 'question' ? agentDialogueSource : null",
  'Only direct questions should carry the selected dialogue source.',
);
assertIncludes(
  uiSource,
  'background: rgba(0, 0, 0, 0.08);',
  'The user message bubble must remain visible on the white chat surface.',
);
assertIncludes(
  uiSource,
  'fill="#000000"',
  'The chat close glyph must use the black icon color.',
);
assertIncludes(
  uiSource,
  "agentChatLauncher?.addEventListener('click', openAgentDialogue);",
  'The floating button must open the dialogue.',
);
assertIncludes(
  uiSource,
  "return agentDialogueMode === 'generation'\n              ? 'generation'\n              : 'question';",
  'Open dialogue messages must use isolated question and generation channels.',
);
assertIncludes(
  uiSource,
  'if (agentDialogueOpen || agentRequestInProgress)',
  'Background reports must not take over the shared request channel while chat is open.',
);
assertIncludes(
  uiSource,
  "type: 'send-apollo-agent-report'",
  'Dialogue submissions must use the Apollo agent transport.',
);
assertIncludes(
  codeSource,
  "action: 'user-question'",
  'The plugin runtime must route open questions to the knowledge agent.',
);
assertIncludes(
  codeSource,
  "mode: 'design-dialogue'",
  'Open questions must use the design-dialogue knowledge mode.',
);
assertIncludes(
  codeSource,
  "source: normalizeApolloAgentSource(agentSource)",
  'The plugin runtime must forward a normalized dialogue source.',
);
assertIncludes(
  codeSource,
  'APOLLO_AGENT_SOURCE_STORAGE_KEY',
  'The selected dialogue source must survive plugin restarts.',
);

console.log('Agent chat modal regression checks passed.');
