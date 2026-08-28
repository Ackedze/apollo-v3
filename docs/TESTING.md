# Тестирование Apollo

## Обязательная локальная проверка

```bash
npm ci
npm run validate
```

`validate` последовательно выполняет TypeScript type-check, production build, проверку совместимости с Figma runtime и все `scripts/test-*.js` regression-тесты.

После любого изменения Apollo должен быть пересобран. Перед публикацией используется чистая установка зависимостей через `npm ci`.

## Требования по типу изменения

| Изменение | Автоматическая проверка | Ручная проверка |
| --- | --- | --- |
| Bug fix | Regression fixture, воспроизводящий ошибку | Исходный Figma-кейс |
| UI | Тест bridge/state, если меняется логика | Скриншот или видео до/после, expanded/collapsed states |
| Audit/diff | Positive и negative fixture | Проверка standalone и nested/slot context |
| Reference/index | Manifest/index failure и lazy-loading tests | Console evidence: загружены только необходимые каталоги |
| Reset | Тест remediation payload | Повторная проверка после reset не показывает нарушение |
| Stats | Schema/serialization test | Обезличенный локальный отчёт без лишних данных |
| Agent | Request isolation и response-state tests | Отчёт и диалог проверены раздельно |
| Manifest/network | Runtime check | Endpoint failure, permission и privacy scenarios |

Полная миграция реального компонентного пакета проверяется по отдельному
production-playbook: [`EXECUTABLE_RULE_PACKAGE_MIGRATION.md`](./EXECUTABLE_RULE_PACKAGE_MIGRATION.md).
Он фиксирует обязательные gates для source-rule closure, четырёх состояний
predicate, exact focus, repeatability, authority и сохранности manual-слоя при
перегенерации Athena/Athena CLI.

## Минимальная матрица Figma

Для изменения audit semantics проверьте:

1. Standalone instance без кастомизации.
2. Standalone instance с ручным изменением.
3. Nested instance с expected host override.
4. Nested instance с ручным изменением поверх expected override.
5. Slot или variant switch внутри component family.
6. Reset и повторную проверку.
7. Повторный аудит того же selection без изменения результата.

Если сценарий неприменим, укажите причину в PR.

## Получение полевого отчёта

После каждого автоматизированного прогона в Figma используйте один и тот же
порядок действий:

1. Дождитесь стадии `completed` для нужного `runId` в ApolloProxyControl.
2. Выполните `git pull --ff-only` в `shared/design-system_stats`.
3. Выберите отчёт из обновлённой локальной копии по времени прогона и
   проверяемой области; не анализируйте JSON, который был доступен до pull.
4. Сопоставьте строки отчёта с predicate evaluation id, source node id и
   ожидаемым Figma fixture.

Если `git pull --ff-only` не может быть выполнен из-за локальных изменений или
расхождения истории, полевой результат не считается полученным: остановите
цикл и сначала устраните состояние репозитория без потери пользовательских
изменений.

## P0 rollout acceptance

После публикации нового bootstrap/config выполните один полевой прогон в Figma:

1. `Status / 🔩 Label / Label` с `Uppercase=True` отсутствует в `Кастомные стили и токены`, а самостоятельный raw `Label` остаётся finding.
2. Один локальный компонент, проверенный как instance и как detached content, даёт одинаковые `8` update-findings и `24` current components.
3. Каждая карточка `Пора обновить` фокусирует реальный source node без ошибки страницы.
4. Native library update сохраняет component properties и пользовательские overrides.
5. Update внутри local owner применяется к source dependency и исчезает после повторного аудита.
6. Action из старой карточки отклоняется после ручного изменения target node и не перезаписывает новое значение.

Результат считается принятым только после повторного аудита без дубликатов между `Пора обновить` и `Актуальные компоненты`.

## Test fixtures

- Используйте минимальный JSON, достаточный для воспроизведения.
- Удаляйте имена пользователей, file keys, node URLs, тексты продукта и другие приватные данные.
- Не копируйте полные production-каталоги в `scripts/fixtures`.
- Закрепляйте ожидаемую семантику, а не случайный порядок полей или внутренние логи.

## Evidence в PR

PR должен содержать команды и результат автоматических проверок. Для UI и runtime приложите скриншот/видео. Для найденной в отчёте ошибки приложите только минимальный обезличенный fragment с actual, expected, component key и library, если эти данные допустимы к публикации.

## Checkpoint 27 августа 2026 — C23 IconView

Закрыт полевой контур первого переиспользуемого Core boundary-пакета:

- `IconView` проверяет public/internal root и component-owned layout, radius и
  opacity через исполняемые source rules;
- изменения публичных paint-поверхностей `Border`, `Shape/BgColor` и
  `Content/PaintMe` остаются разрешёнными без отдельного host-ограничения;
- изменённые декоративные Figma-узлы (`BOOLEAN_OPERATION`, vector/shape
  primitives) включаются в evidence graph по точному `changes[].nodeId`, а
  неизменённый декоративный шум по-прежнему исключается;
- финальный Figma-отчёт `18-32-24_predicates.json` содержит 6 ожидаемых
  нарушений, включая `Shape radius 6 → 10` с точным focus node;
- `unclassified=0`, `duplicateEvaluationIds=0`, десять повторов дали один hash
  `6838ec9fbf61082a211fd497269eb2acc8c02ce0a628c43e1c695e486bef1929`;
- после исправления Apollo v3 прошёл production build и все 80 regression
  tests.

Следующая сессия начинается после C23: выбрать следующий Core boundary из
бэклога (`Text` либо извлечение `StatusPreset`/`Status`) и сначала подготовить
source-rule closure и изолированные PASS/FAIL/UNKNOWN fixtures.
