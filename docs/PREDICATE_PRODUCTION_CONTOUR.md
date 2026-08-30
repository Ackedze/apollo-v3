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

## TableView в боевом контуре

TableView больше не зависит от удалённого `pilot-rules.js`. Его пакет закрыт
`manual.executionPolicy`, а исполняемые проверки компилируются из
`TableView/rules.json` универсальными contour-операторами.

Детерминированы: граница публичных корней и платформ, структура Compact и
multi-column Row, согласованность Compact строки с корнем, вертикальный
spacing строки, обязательный Header, Vertical и SidePanel-контуры, а также
effective-baseline визуальных свойств. `Row :: SidePanel` нормализуется как
семейство `row-side-panel` и получает те же owner/column/spacing facts без
ветки по имени компонента в evaluator.

Контекстными остаются правила, которым не хватает продуктового смысла или
явных наблюдаемых фактов: направление чтения, рекомендуемая ширина, семантика
данных/действий, скрытые строки и ShowMore, Divider последней строки,
заголовочные сигнатуры, surface context и ручное изменение ширины колонок.
Они перечислены в `contextOnlyRules` с конкретными `missingFacts` и не создают
автоматических ошибок.

Четыре исходных ButtonsGroup pilot-проверки также имеют эквивалентные
source-derived composition rules и не зависят от hardcode.

## Gate перед Figma-тестом

1. Все source rules закрыты `manual.executionPolicy`.
2. Все predicate/composition rules имеют active authority и presentation.
3. Proxy tests подтверждают компиляцию только из knowledge release.
4. Apollo v3 проходит `npm run validate` и пересобран.
5. Knowledge bundle ApolloProxyControl пересобран, приложение полностью перезапущено.
