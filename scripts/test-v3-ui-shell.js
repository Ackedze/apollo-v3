const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const uiSource = fs.readFileSync(path.join(root, 'src/ui.html'), 'utf8');
const topSectionSource = fs.readFileSync(
  path.join(root, 'src/ui-app/components/TopSection.tsx'),
  'utf8',
);
const topSectionCss = fs.readFileSync(
  path.join(root, 'src/ui-app/components/TopSection.module.css'),
  'utf8',
);
const resultCardCss = fs.readFileSync(
  path.join(root, 'src/ui-app/components/ResultCard.module.css'),
  'utf8',
);
const resultSubCardCss = fs.readFileSync(
  path.join(root, 'src/ui-app/components/ResultSubCard.module.css'),
  'utf8',
);
const buttonCss = fs.readFileSync(
  path.join(root, 'src/ui-app/components/Button.module.css'),
  'utf8',
);
const categoryCardCss = fs.readFileSync(
  path.join(root, 'src/ui-app/components/CategoryCard.module.css'),
  'utf8',
);

for (const label of [
  'Форма',
  'Просмотровая',
  'Страница с таблицей',
  'Лендинг',
  'Дашборд',
  'Другое',
]) {
  assert.ok(
    topSectionSource.includes(`label: '${label}'`),
    `Page type picker must include ${label}.`,
  );
}

for (const label of ['Компоненты', 'Паттерны', 'Тексты']) {
  assert.ok(
    uiSource.includes(`<span>${label}</span>`),
    `The primary view switcher must include ${label}.`,
  );
}

assert.ok(
  uiSource.includes('background: #d46dfa;'),
  'The Apollo v3 shell must use the Figma purple chrome.',
);
assert.ok(
  uiSource.includes('pageType: currentPageTypeId'),
  'The selected page type must be sent with scan requests.',
);
assert.ok(
  topSectionCss.includes('width: 212px;'),
  'The page type menu must match the Figma menu width.',
);
assert.ok(
  resultCardCss.includes(
    'box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);',
  ),
  'Result cards must keep the subtle Figma inset border without changing their geometry.',
);
assert.ok(
  resultCardCss.includes('background: rgba(0, 0, 0, 0.04);'),
  'Result cards must use the Figma hover fill.',
);
assert.equal(
  (resultCardCss.match(/max-width: 200px;/g) ?? []).length,
  2,
  'Result card titles and captions must use the Figma 200px truncation width.',
);
assert.ok(
  resultSubCardCss.includes('gap: 0;'),
  'Result subcard value rows must follow the compact Figma stack.',
);
assert.ok(
  uiSource.includes('border-radius: 20px 20px 0 0;'),
  'The main content shell must not round its bottom corners.',
);
assert.ok(
  topSectionCss.includes('.pageTypeButtonSelected.pageTypeButtonSelected'),
  'The selected page type must use its dedicated Figma state.',
);
assert.ok(
  topSectionSource.includes('Скрыть кастомизации'),
  'Settings must expose the customization visibility toggle.',
);
assert.ok(
  buttonCss.includes('.loading:disabled'),
  'The loading action must retain its visual state while disabled.',
);
assert.match(
  categoryCardCss,
  /\.active,[\s\S]*?background: #fff;/,
  'Selected categories must use the white Figma surface.',
);
assert.match(
  categoryCardCss,
  /\.button:hover,[\s\S]*?background: #fff;/,
  'Category hover must use the white surface.',
);

console.log('Apollo v3 UI shell regression checks passed.');
