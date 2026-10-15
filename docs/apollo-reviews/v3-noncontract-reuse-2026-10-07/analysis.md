# Переиспользование проверок Apollo v3 в Apollo v4

Большинство проверок документа и библиотеки из v3 можно использовать в v4 независимо от готовности контрактов компонентов. Переносить следует алгоритмы и необходимые источники метаданных через отдельный адаптер проверки документа. Подключение всего `src/code.ts`, старого загрузчика reference или классификатора принесёт в v4 второй контрактный движок и побочные настройки.

Получатель — Apollo CB :: Design Check; автор анализа — General. Целевая реализация — `apps/apollo-v4`. Этот анализ является входом для реализации; он не назначает нового writer общих source/build/config и не изменяет действующие frozen snapshots или Ready gates.

## Что уже есть в v4

Перенесены 13 табов v3, выбор типа страницы, платформа, продуктовый канал, настройки и чат. Реальная contract-проверка подключена к `changes`; остальные категории первоначально имеют `not-connected`, пустые items и неизвестный count. Это честное состояние, его нельзя заменять нулём ошибок до выполнения проверки.

Три конкретных разрыва интеграции:

1. [Контроллер](/Users/alexkukhta/Desktop/workplace/projects/Apollo-v3/apps/apollo-v4/src/design-check/controller.js:135) отдаёт `uiPreferences` в `onAudit`, но [текущий обработчик](/Users/alexkukhta/Desktop/workplace/projects/Apollo-v3/apps/apollo-v4/src/ui.js:26) берёт только `requestId`. Настройки UI сейчас не становятся подтверждённым контекстом аудита.
2. `setTabData` позволяет добавить результаты с явными scope/coverage. Однако [рендерер](/Users/alexkukhta/Desktop/workplace/projects/Apollo-v3/apps/apollo-v4/src/design-check/index.tsx:164) показывает existing audit slot только на `changes`, а запасные карточки рендерит лишь при отсутствии `slots.audit`. V4 этот slot передаёт: простое заполнение других табов недостаточно для отображения findings.
3. [Main focus routing](/Users/alexkukhta/Desktop/workplace/projects/Apollo-v3/apps/apollo-v4/src/code.ts:268) проверяет текущий contract audit и его evaluation/component registry. Нужен проверяемый registry для новых style/page/frame findings, привязанный к тому же актуальному контексту, а не произвольный nodeId из UI.

Статический граф относительных runtime-imports подтверждает: 12 рассмотренных сервисов v3 присутствуют в v3 main и отсутствуют в v4 main/UI closure. Это анализ зависимостей, не доказательство runtime-поведения или полный build inventory.

## Матрица переноса

| Функциональность | Исходник v3 | Что переиспользовать и что адаптировать |
| --- | --- | --- |
| Темизация страницы | `src/services/themeAudit.ts` | Поиск коллекции `Theme`, режима `Corp` и проверка explicit page mode не требуют контрактов компонентов. Выделить page-ветку из модуля, связанного с legacy reference; различать отсутствие коллекции/режима, ошибку доступа, неприменимость и отсутствие нарушения. Существующая политика: Desktop/MobileWeb. |
| Старые Corporate-компоненты | `themeAudit.ts`, `reference/library.ts` | Отдельная от page theme проверка `[Corporate]`, с исключением role Part. Для рекомендации замены нужны подтверждённые counterpart keys; не угадывать их по имени. |
| Кастомные стили и токены | `auditViewBuilder.ts`, `styleMetadata.ts`, `filters/customStyleFilters.ts`, `filters/ignoredComponentFilters.ts` | Переиспользовать диагностику fill/stroke, effect, text/typography и mixed text segments, известные style/token bindings и действующие исключения. Нужен versioned metadata provider. Ошибка загрузки каталога не означает ни «все стили кастомные», ни «всё чисто». |
| Локальные компоненты | `componentClassifier.ts`, `localComponentDependencyAudit.ts` | Выделить native locality по определению компонента: `remote === false`. Отсутствие компонента в каталоге не означает local. Сохранить обход зависимостей локальных определений, source owner и фокус на соответствующий объект в макете; unknown main остаётся unknown. |
| Пора обновить | `libraryComponentFreshness.ts`, `libraryUpdateResults.ts` | Самостоятельный checker с injected importer: проверяет remote/key, опубликованный источник и его identity. Статусы current/update-available/not-applicable/unknown, cache на один audit, взаимоисключение current/update. Вложенные instance-sublayer исключаются, SLOT projection обрабатывается отдельно. Это обновление Figma-компонентов, а не приложения или знаний Proxy. |
| Не тот канал | `channelAudit.ts` | Небольшой независимый алгоритм platform/source matching. V3 `AuditChannel` означает Desktop/MobileWeb/iOS/Android; его нельзя перепутать с v4 `channelId` b2b/b2c/site/invest. Отсутствующие метаданные требуют unknown, а не старого `false`. |
| Устаревшие компоненты | `policies/componentAuditPolicy.ts`, `componentClassifier.ts` | Использовать проверенные lifecycle/library metadata и forced-category policy. Technical/deprecated могут отключать глубокую диагностику поддерева по существующей политике; это не вердикт контракта. |
| Устаревшие стили | `deprecatedStyleAudit.ts`, `config/deprecatedStyleSources.ts` | Helper уже принимает resolver метаданных. Переносимый scope: fill/stroke, включая fillStyleId текстовых сегментов, dedupe. Текущее покрытие не является полной проверкой всех text/effect styles. |
| Детач | `detachedComponentSource.ts`, `auditViewBuilder.ts` | Native `detachedInfo` для FRAME/GROUP с `type: library` и componentKey плюс подтверждённый reference. Не угадывать бывший компонент по имени/форме. Отсутствие происхождения не доказывает ни библиотечный detach, ни его отсутствие во всём документе. |
| Пресеты | `auditTargetCollector.ts` | Существующая эвристика: INSTANCE с reference, в displayName/names которого есть `🔒`. Переносить как явно обозначенную политику классификации, не объявлять универсальной нормативной истиной. |
| Технические | `componentAuditPolicy.ts` | Изолировать library policy и правила пропуска поддерева. Потребуются закреплённые metadata; компонент не становится technical из-за неизвестного контракта. |
| Актуальные компоненты | `componentClassifier.ts`, `libraryUpdateResults.ts` | Catalog relevance и freshness выводить отдельно от contract PASS. Unknown не помещать в current; current/update не дублируются. |
| Кастомизации WIP | `auditViewBuilder.ts`, `structure/snapshot.ts`, `structure/diff.ts` | Повторно использовать факты отличия от baseline как диагностическую информацию. Existing baseline helper также добавляет required-paint contract findings: эту ветку нельзя незаметно объявить независимой от контрактов. Подготовка nested references сложнее основных документных проверок. |
| Кастомизации | `componentClassifier.ts`, `auditViewBuilder.ts`, `src/contracts/` | Не переносить legacy engine целиком. V4 contracts остаются источником нормативного вердикта; baseline-facts могут дополнять его после отдельной интеграции, без новых правил допустимости и без обхода Draft/Ready. |

## Источники метаданных и зависимости

[V4 manifest](/Users/alexkukhta/Desktop/workplace/projects/Apollo-v3/apps/apollo-v4/manifest.json) допускает сеть только `http://localhost:3001`. Старый [reference loader](/Users/alexkukhta/Desktop/workplace/projects/Apollo-v3/src/reference/referenceList.ts:118) использует внешний `referenceSourcesMVP.json`. Скопировать loader без адаптации недостаточно; расширение manifest domains тоже не решает его привязку к старым runtime registries.

Текущий [сборщик knowledge package](/Users/alexkukhta/Desktop/workplace/services/apollo-proxy/scripts/build-knowledge-package.js:90) выбирает `JSONS/apollo`, tokens, indexed rules/composition/generatedContract, semantic targets и остальные перечисленные источники. Raw component/style catalogs и `referenceSourcesMVP.json` этой выборкой не включены. Нельзя считать существующий Proxy package готовым поставщиком всех метаданных v3. Выбор между ограниченным локальным индексом и отдельным versioned Proxy resource API потребует согласованного интерфейса и отдельного sole-writer handoff. Нужны метаданные выбранных областей, а не копия всех private каталогов в tracked fixtures.

Даже тематически независимый сервис может импортировать старый движок через helper: runtime closure `themeAudit`, `auditViewBuilder`, `localComponentDependencyAudit`, `styleMetadata` включает по 10 файлов `src/contracts/`; classifier — 15. Для них следует выделить небольшой алгоритм либо внедрить порты данных. Freshness, channel matching, deprecated-style и detached-source helpers имеют независимые relative-import closures без `src/contracts/`.

Существующий v4 [area scan](/Users/alexkukhta/Desktop/workplace/projects/Apollo-v3/apps/apollo-v4/src/area-scan.ts) подходит как основа bounded обхода выделения: visible nodes, dedupe roots, лимиты 10000 nodes/1000 components и incomplete при превышении. Обход локальных source definitions — отдельная область, её нельзя подменять только rendered tree. Page-theme поиск также проходит дерево страницы: при переносе нужны cancellation и отдельная явная область/границы.

[Display sidecar](/Users/alexkukhta/Desktop/workplace/projects/Apollo-v3/apps/apollo-v4/src/audit-display-resources.js) даёт подписи ресурсов для UI, но не является источником нормативных фактов и не выполняет проверки custom/deprecated styles.

## Предлагаемый порядок реализации

1. Узкий adapter проверки документа: native local classification, published freshness и page theme. Использовать существующие табы, реальные карточки и focus; согласованный platform context подтверждает main. Эти проверки не должны ждать Ready всех компонентных контрактов. Импорт published reference для freshness проверяется в пользовательском Figma-run, без автоматического swap экземпляров.
2. Ограниченный закреплённый metadata provider и подключение custom/deprecated styles, platform channel, lifecycle/technical/presets/current и library-detach. Показать источник, версию, scope, complete/incomplete и недоступность ресурса для каждой категории. Имена и hardcoded v3 политики не становятся новыми нормами без проверки существующих источников.
3. Явные действия исправления после диагностики: theme mode, component update/replacement, style/token rebinding. Existing action registry/resolver полезен как образец. Каждое действие проверяет текущий audit/context и целевую identity, затем инвалидирует результаты и запускает повторную проверку. Автоматических исправлений при сканировании нет.
4. Baseline customizations, отчёт и тексты после отдельной интеграции фактов. `stats/textReport.ts`, карточки результатов и evidence collection могут быть переиспользованы. Старые `stats/delivery.ts`, auto outbox/upload/currentuser permissions и LLM/layout-generation flow не нужны для этих проверок.

Для новых карточек можно адаптировать поведение `src/ui-app/bridge/resultsBridge.tsx` и `ResultCardPresets.tsx`. Их визуальные примитивы нельзя копировать автоматически: v4 сохраняет утверждённую систему и использует только подтверждённые API arui-private. Изменение arui-private для описанного переноса не требуется.

## Критерии приёмки

- Local/remote без catalog entry/missing main различаются; remote dependency внутри локального source definition сохраняет owner/focus и не дублируется.
- Freshness: current/update/import denied/key mismatch/missing key; update/current взаимоисключаются, cache не переживает новый audit, instance-sublayer/SLOT scope не смешивается.
- Theme: explicit Corp, другой/отсутствующий explicit mode, нет Theme/Corp, ошибка native API, устаревший cached anchor; native mobile не получает web-проверку.
- Styles: known style/token и raw/custom, effect, typography, mixed segments, hidden/ignored scopes; missing metadata — explicit unknown/incomplete. Deprecated проверяется лишь в заявленном поддерживаемом scope.
- Platform/source match, universal/missing metadata и отличие platform от product channel. Preset/technical/lifecycle основаны на подтверждённой политике.
- Native library-detach provenance проверяется; name/FRAME similarity не создаёт finding.
- Settings передаются в main и отражаются в контексте результата. Selection/document/settings/resource-version changes отменяют старые результаты, focus и action IDs. Scan limits/cancellation не дают complete.
- Видимые карточки и категории проверены на 800/440/360, keyboard/focus, loading/error/empty/unknown; исправления допускаются только по свежему explicit user action.
- Source/API/coverage/live/release остаются отдельными статусами; ручная Figma-проверка пользователя и v4 browser acceptance нужны после реализации. Перед заявлением «готово к reload» выполняется применимый `validate` gate.

## Выполненная проверка этого анализа

Шесть существующих regression suites повторно выполнены `/usr/local/bin/node scripts/<name>` и завершились с exit 0. Логи сохранены в `verification/`: themization, library freshness, local dependency audit, audit view builder, deprecated styles, audit policies. Это synthetic/mocked проверки v3. Themization suite проверяет counterpart/variant/action helpers и не доказывает всю page-theme detection ветку; audit policies не заменяет полный live channel run.

`dependency-inspection.json` содержит 212 прочитанных локальных файлов, SHA-256 и relative runtime-import graph. `source-pins.json` дополнительно закрепляет рассмотренные UI/provider/policy/test inputs, `verification/results.json` — конкретные команды и результаты. Этот анализ не менял source/build/runtime, не выполнял Figma live, новые реальные imports или browser-сценарии v4. Реальные targets и ранее принятые imports/browser proofs сохраняют только свои ранее заявленные области; новые категории v4 ими не проверены.

Все пять исходных целей Apollo остаются открытыми. Готовность анализа и тестов v3 не равна завершению переноса или пилота.
