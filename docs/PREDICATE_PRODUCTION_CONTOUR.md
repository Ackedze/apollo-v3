# Боевой predicate-контур Apollo v3

## Цель

Apollo v3 исполняет только правила, объявленные в источнике истины и собранные в knowledge bundle ApolloProxyControl. Плагин собирает факты Figma и контекст страницы, но не выбирает RuleID и не содержит семантику конкретных компонентов или паттернов.

## Сохраняемый runtime

1. Сбор видимых узлов выбранной области Figma.
2. Нормализация componentKey, variant/component properties, layout, appearance, token bindings, текста, bounds и отношений дерева.
3. Evidence bundle и predicate snapshot adapter.
4. Универсальные predicate-операторы и компиляторы composition/contour rules.
5. Загрузка пакетов по `componentContractIndex.json` и объявленным в пакете artifacts.
6. Проверка authority, source checksum, execution-policy closure и repeatability.
7. UI-рендеринг только из `apollo.predicate-presentation.v1`, переданного вместе с исполняемым правилом.
8. Статистика, фокус на `focusNodeId` и безопасные действия Apollo.

## Удаляемый legacy-контур

- API-параметр `ruleSet: buttons-group-pilot`;
- `src/predicate-engine/pilot-rules.js` в proxy;
- безусловная загрузка TitleView, ButtonsGroup, Benefits, TableView и form/button Markdown в release loader;
- тестовые логи `p13Evaluations` … `p19Evaluations` в endpoint;
- выбор конкретных RuleID внутри `src/stats/patternReport.ts`;
- словарь `RULE_PRESENTATION` и специальный BackgroundPlate fallback в UI;
- legacy agent pattern pipeline, который формировал verdict для вкладки `Паттерны`;
- regression-тесты, которые повторяют правила компонентов в JavaScript вместо проверки source package.

Текстовый аудит, чат и классификация кастомизаций сохраняются как отдельные продуктовые контуры. Они не выбирают правила, не добавляют строки и не меняют verdict production Predicate Engine.

## Инварианты

- Нет правила в source package — нет автоматического verdict.
- Нет active authority — правило не исполняется.
- Нет `predicateContour` или composition contract — правило остаётся human/delegated/context-only согласно execution policy.
- Нет `apollo.predicate-presentation.v1` — knowledge release считается неполным; UI не сочиняет текст нарушения.
- Плагин не передаёт список RuleID. Применимость определяется scope/select/when исполняемого release.
- Правила клиента и произвольный rule set запрещены.

## Выявленный coverage gap

`component:web-corp.table-view.compact-is-consistent-across-rows` описан в `TableView/rules.json`, но пока не имеет `predicateContour`. Сейчас его исполняет только удаляемый `pilot-rules.js`. После очистки правило намеренно перестанет давать автоматический verdict до корректной миграции в source package.

Четыре исходных ButtonsGroup pilot-проверки уже имеют эквивалентные source-derived composition rules и не зависят от hardcode.

## Gate перед Figma-тестом

1. Все source rules закрыты `manual.executionPolicy`.
2. Все predicate/composition rules имеют active authority и presentation.
3. Proxy tests подтверждают компиляцию только из knowledge release.
4. Apollo v3 проходит `npm run validate` и пересобран.
5. Knowledge bundle ApolloProxyControl пересобран, приложение полностью перезапущено.
