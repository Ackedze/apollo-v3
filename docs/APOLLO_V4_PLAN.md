# План отдельной версии Apollo на новых контрактах

Решение от 01.10.2026: вести Apollo v4 в существующем `Ackedze/apollo-v3`,
в `apps/apollo-v4`, с отдельными Figma manifest и сборкой. Корень workspace
не является Git-репозиторием. Локальный Codex gateway продолжаем развивать
в существующем `Ackedze/apollo-proxy`; источники контрактов остаются
в `design-system_ab`.

Состояние после сверки 05.10.2026: локальные Editor **0.2.90**, shared core
**0.1.9**, v4 runtime profile **0.4.0**; v4 validate **136/136**. Исторические
пилотные этапы и числа ниже сохранены. Текущий срез PARITY-001–018,
подтверждённые открытые дефекты, live и release gates —
[в каноническом бэклоге](ARCHITECTURE_BACKLOG.md#сверка-с-editor--05102026).
Fresh Editor reset/negative main aliases Size=56 приняты 05.10.2026,
12:12:48 / 12:33:21 UTC; остались другие variants и live Apollo.
Сначала — эта приёмка и исправление relevant host context
(PARITY-018/014), отдельное воспроизведение stale bug, затем полный scenario
coverage (PARITY-004) и единый source/runtime release. В локальной папке 7 ZIP,
в collection manifest 6 пакетов, в существующем unpublished pilot 5; source
readiness и local compile не обновляют выпуск автоматически.

Отдельный repository имеет смысл при появлении независимых владельцев,
доступов или release lifecycle. Для начала разработки нового потребителя
того же продукта дополнительный repository не нужен. Подпроекты не получают
вложенный `.git`. Изменения нормативных правил выполняются по процессу
design-system_ab с синхронизацией реестров и леджера.

## Выполненный первый эксперимент

- [x] Создать изолированный local consumer новых ComponentContract v2.1.
- [x] Собирать канонические runtime Editor и Predicate Engine без нового evaluator.
- [x] Отклонять legacy/draft/unsupported contracts до исполнения.
- [x] Сохранять явное pending coverage для delegated и context-only.
- [x] Проверить Spinner: шесть архивных captures, 1008 evaluations,
  точный historical replay и семантическая parity принятого r8.

## Реализованный локальный пилот

- [x] Versioned общий package `packages/component-contract-core` 0.1.0.
  Editor переведён на source reexports; все 699 tests прошли.
- [x] Автономная сборка Apollo source без sibling Editor/Proxy sources,
  с уже установленным tooling; build проверяет границы repository.
- [x] Отдельный Figma manifest и панель, общий capture выделения с независимым
  library baseline; focus по evaluation ID, JSON export и stale-capture guard.
- [x] 98 v4 tests; main bundle проверен в Plugin API simulation.
- [x] Локальный unpublished CorporateContent + Button + Spinner + Amount + AmountStyles release: 1097 routing keys,
  artifact/source hashes и закреплённый runtime.
- [x] Proxy GET `/v2/contracts`, GET `/v2/contracts/:id`,
  POST `/v2/contracts/explain`; локальный пакет включается в сборку `.app`.
- [x] Объяснение Codex из frozen snapshot и того же release. Proxy заново
  исполняет snapshot и проверяет RuleID/evaluation references ответа.
  23 service/HTTP/projection tests и отдельный CLI launcher test с busy/auth failures прошли.
- [x] Браузерная проверка панели на 440/360 px, включая приём сообщений
  через вложенные editor iframe и отклонение посторонних отправителей.
- [x] Собрана локальная ad-hoc `.app`, проверены подпись и встроенный release.
- [x] Настоящий Codex через сервер из `.app` объяснил synthetic violation;
  exact RuleID/evaluation references проверены.
- [x] Пользовательский live FAIL масштабированного Spinner: два нарушения
  размеров 72×72 против 48×48; полный capture и exact offline replay.
- [x] Pinned Button r31 → Spinner r8: полный closure gate, собственные
  RuleID, две occurrences, независимые references, host focus и явные gaps.
- [x] Runtime profile 0.3.0; главный manual с bound facts — основной вход Apollo и Proxy. Shared compiler Editor создаёт внутренний compiled cache; source/manual/facts hashes, dependency index и source closure проверяются до исполнения.
- [x] Загрузка authoring ZIP, manual вместе с JSON-фактами и source package; compiled-only импорт отклоняется. Каждый child сохраняет собственный manual и нормы.
- [x] CorporateContent r11: прямой источник `authoring/contract.manual.json` с `authoring/src`; точное совпадение 17 checks с принятой проекцией и replay пяти архивов, включая 34 evaluations r11. Button/Spinner сохраняют принятые compiled hashes.
- [x] 115 Button archives: точный JSON replay 33 937 historical evaluations;
  r31 исполнил 32 062 evaluations с сохранением исходных scenario limitations.
- [x] Проекция для объяснения Codex: все source rules и pins сохранены,
  variant evidence ограничен выбранным снимком; полный контракт исполняется в Proxy.

- [x] Runtime profile 0.4.0: пакетный POST `/v2/contracts/resolve` по библиотечным ключам, полный source closure и release verification перед публикацией результата.
- [x] Любое выделение: DFS с пропуском скрытых веток, несколько корней, дедупликация occurrences, отдельные snapshots, scoped IDs/focus, notChecked и aggregate coverage.
- [x] Amount r5 и AmountStyles r10: главные manual точно воспроизводят принятые проекции; полный локальный каталог содержит пять компонентов.
- [x] Объяснение Codex выбирается для конкретного checked instance; область не отправляется агенту автоматически.
- [x] BUG-003: карточки показывают фактическое отклонение, ожидаемые/эталонные значения и единицы из trace; RuleID и focus сохранены. Числа, цвета, составные условия и missing evidence проверены автоматически; живое отображение принимает пользователь.

Пилот не опубликован. Spinner runtime index остаётся draft/unpublished.
Подтверждён один live FAIL-кейс; полная матрица живых тестов выполняется пользователем.
CLI в regression tests имитируется;
отдельный smoke с настоящим авторизованным Codex прошёл на предыдущем профиле 0.1.0.
Объяснение агента не исполняет delegated rules. Production
updater/rollback новых packages ещё не подключён.
Полные legacy gates запускаются, но имеют прежние ошибки knowledge paths
и source crosswalk; детали зафиксированы в README v4.

## Последовательность следующих этапов

Открытые ошибки живых проверок: [бэклог исправлений Apollo v4](ARCHITECTURE_BACKLOG.md#apollo-v4-бэклог-исправлений).

Доработки чтения контрактов после Editor 0.2.71–0.2.73 и обязательный учёт
будущих изменений: [бэклог совместимости Editor](ARCHITECTURE_BACKLOG.md#apollo-v4-совместимость-с-componentcontract-editor),
PARITY-001–018. Общий код capture уже обновлён; consumer verification, полное
coverage и подключение принятого mobile CorporateContent остаются отдельными этапами.

1. Пользователь проверяет живые Spinner/Button PASS/FAIL/UNKNOWN, exact focus
   и объяснение Codex из панели. Агент не запускает эти тесты самостоятельно.
2. Добавить adapter полного Editor scenario coverage: policy-only boundaries,
   ожидания сценария и before snapshot для переходов. Сохранять unknown, если
   inputs отсутствуют; объяснение не заменяет факты.
3. Подключить новый release к existing updater/rollback ApolloProxyControl,
   сохраняя compatibility gates и pins на весь audit.
4. Расширять каталог главными ready manual остальных компонентов. Отдельно решить проверку COMPONENT definitions и coverage detached/non-component layers. Открытый внешний payload проверяется по своему контракту, если доступен; host не считает его собственными нормами.
5. Добавить исполнение явно delegated проверок через нормативную agent projection
   из того же release с проверяемыми rule/evidence references. Оно остаётся
   отдельным от уже реализованного объяснения deterministic результата.
6. Проверить отмену агентского запроса; protocol errors, missing package,
   несовместимый release и отсутствие Codex authorization уже покрыты regression.
   Каждый audit закрепляет
   release на весь run. Выпустить scoped pilot после offline и live gates.
7. Расширять компоненты, новые pattern contracts и редполитику отдельными
   пакетами. Legacy checks не переносятся без новых нормативных контрактов.

## Критерий готовности пилота

Apollo v4 работает отдельной сборкой, получает только новый release, собирает
факты без нормативных веток по именам компонентов и исполняет их общим ядром
с Editor. Одни входы дают одни deterministic результаты. Компоненты без
контракта, непроверенные факты и неисполненные маршруты видны в coverage.
Codex использует ту же версию контрактов. Raw catalogs и legacy rules
не подмешиваются в результат. Текущий локальный пилот ещё требует live gates, delegated execution и
release updater, прежде чем этот критерий можно считать выполненным.

## Единая генерация фронта и Figma

Решение владельца от 05.10.2026: соединить генерацию с Apollo V4. [GENERATION.md](GENERATION.md) фиксирует модули и следующий порядок действий. G02 реализует общий ZIP inventory и закреплённый lock через существующий authoring source/runtime, без новой системы норм. G03 задаёт одну спецификацию и один план, G04/G05 — generation projection и adapter protocol; Figma и frontend остаются отдельными исполнителями. Их готовность, audit coverage и release acceptance учитываются отдельно.
