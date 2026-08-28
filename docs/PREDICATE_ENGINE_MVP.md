# Apollo Predicate Engine MVP

Status: ratification candidate  
Date: 2026-08-22  
Test section: `12161:122197` in the Apollo workshop Figma file.

## Decision

Apollo will replace the current agent-owned pattern verdict path with a closed,
deterministic predicate engine. The agent is not part of verdict calculation.
It may later explain a completed machine result, but it cannot add, remove,
promote or downgrade a finding.

The existing Semantic Fact Model / faceted-agent runtime is frozen as a
comparison baseline. New predicate work does not add branches to that runtime.
It is removed after the replacement passes the cutover gates below.

## What “all predicates” means

Apollo does not implement every historical `required*`, `allowed*` or
`*Policy` field as a new operator. Those fields mix facts, selectors, macros
and prose. The MVP implements one closed algebra:

1. selectors choose an ordered node set;
2. fact readers return a typed value or `unknown`;
3. predicates evaluate facts with three-valued logic;
4. authority and evidence gates decide whether evaluation is permitted;
5. a compiler lowers component rules and patterns into this algebra;
6. a coverage ledger gives every target exactly one terminal classification.

Domain macros such as `neighborSpacingByPair`, `requiredParent`,
`primaryIsFirstAndUnique` and `paddingUsesSpacingTokens` compile into the
primitive predicates. They are not runtime branches.

The machine-readable capability list is
`services/apollo-proxy/schemas/apollo-predicate-capabilities.v1.json`.

## Stable evaluation semantics

Predicate truth is `true | false | unknown`. Applicability is evaluated
separately as `applicable | not-applicable | unknown`.

- `false` under an active violation rule produces `violation`.
- `true` under a require/forbid rule produces `compliant` when the normative
  assertion is satisfied; `allowed` is reserved for an explicit allow rule.
- missing evidence, an unsupported capability or ambiguous identity produces
  `not-evaluable`, never a guessed verdict.
- missing user context that can change applicability produces `human-review`
  only after the clarification path cannot resolve it.
- a non-matching scope produces `not-applicable`.
- hidden Figma layers are excluded from the audit and from aggregate counts.
- the same snapshot and rule release must produce byte-identical normalized
  results, ids, ordering, focus targets and actions.

## MVP scope

### In scope

- component public API and variant-domain validation;
- exact effective-baseline comparison;
- paint, typography, effect, opacity, radius and layout properties;
- token/style binding presence, collection and token identity;
- component ownership, direct parent, ancestors, slots and replacements;
- visible child counts, uniqueness, equality, order and position;
- geometric containment, alignment and horizontal/vertical distances;
- page context: platform, selected page type, surface and modal boundary;
- active authority, exceptions, conflicts and missing-evidence handling;
- all observable active deterministic rules for `BackgroundPlate`,
  `TitleView` and `ButtonsGroup`, plus the first field-proven rules for
  `Benefits` and `TableView`;
- the nine deterministic form rules: 1, 4, 5, 6, 7, 9, 12, 13 and 18.

### Explicitly outside this MVP

- prototype/interaction semantics;
- editorial meaning and red-policy review;
- prose-only `llm` rules;
- automatic mutation by an agent;
- rules whose required user/business context is absent from Figma;
- automatic conversion of unknown prose fields into executable rules.

Outside-scope rules remain visible in coverage diagnostics as
`not-evaluable`; they do not create vague “Зови ДС” rows for every override.

## Canonical snapshot v2

The plugin produces one immutable snapshot. Proxy may normalize and index it,
but may not invent expected values or verdicts.

Required context:

- audit id and snapshot hash;
- Figma file, page and selection identities;
- platform and one page-type choice;
- exact width of the single selected root (`viewportWidth`); multiple roots or
  unavailable bounds produce explicit `unknown`;
- library/catalog release ids and checksums;
- selected surface and detected modal boundary.

Required visible-node evidence:

- stable node id, parent id, ordered child ids, path and node type;
- absolute bounds and document order;
- auto-layout mode, sizing, alignment, gap and four paddings;
- component key, family key, library, lifecycle and component properties;
- slot/owner identity and instance-swap identity;
- fills, strokes, effects, opacity, radii and text style;
- variable/style bindings with id, name, collection and mode;
- text characters only for predicates that request them;
- effective baseline for every auditable property, including baseline origin,
  selected variant and source revision;
- explicit override records: property, baseline, actual and target node.

Snapshot collection must fail locally per node, not abort the whole audit.
Unavailable exact baseline is `unknown`; a visually similar value is not a
baseline substitute.

## RuleIR v1

Every executable rule has:

```json
{
  "ruleId": "canonical-id",
  "revision": 1,
  "source": { "path": "...", "checksum": "..." },
  "authority": { "status": "active", "provenance": "design-system-author" },
  "scope": { "platform": ["desktop"], "pageType": ["form"] },
  "select": { "from": "selection-root", "traverse": "descendants", "where": [] },
  "when": { "predicate": "all", "args": [] },
  "assert": { "predicate": "equals", "actual": {}, "expected": {} },
  "severity": "error",
  "unknownPolicy": "not-evaluable",
  "remediation": null
}
```

`ruleText` is presentation evidence only. It cannot add a selector, condition,
expected value or exception.

RuleIR value references are closed as well: `{literal}`, `{fact}`, `{query}`
or `{derive}`. `query` performs an ordered graph selection and optional fact
projection; `derive` supports only the registered arithmetic operators. This
lets page aggregates and formulas remain declarative instead of becoming
component-specific adapter branches.

## Universal rule contours P21–P28

The second contour wave compiles normalized source assertions into eight
component-independent templates in
`services/apollo-proxy/src/predicate-engine/contour-rules.js`:

1. P21 `public-root` — published public API and ownership boundary;
2. P22 `context-map` — conditional fact-to-fact/value correspondence;
3. P23 `uniform-allowed-collection` — allowed values, count and uniformity;
4. P24 `breakpoint-map` — viewport range to platform/variant mapping;
5. P25 `sizing` — horizontal and vertical sizing contracts;
6. P26 `baseline` — arbitrary actual facts against effective baseline facts;
7. P27 `query-count` — selection- or page-wide filtered aggregation;
8. P28 `derived-geometry` — arithmetic layout formulas with explicit tolerance.

Component and pattern identities are data supplied by a compiled rule. The
engine contains no branches for AccountSelect, CardSwiper, BackgroundPlate or
any other component. Unknown contour kinds, query origins, derivations and
predicates fail at rule validation.

Component contours are discovered in active package `rules.json` files.
Pattern contours are discovered from fenced `json apollo-predicate-contour`
blocks in active Markdown pattern documents. Both sources compile through the
same closed contour registry and pin their exact source checksum.

## Coverage ledger and result contract

Each evaluated unit is identified by:

`snapshotHash + ruleId + ruleRevision + subjectNodeId + targetNodeId + factPath + contextKey`.

Every unit receives exactly one terminal classification:

- `violation`
- `compliant`
- `allowed`
- `human-review`
- `not-applicable`
- `not-evaluable`

Each UI finding contains the exact subject/focus node, actual value, expected
value, rule source/revision, predicate trace and optional opaque remediation
action id. Report rendering must not merge different node ids or relations.

## Predicate test contour

The empty Figma section `12161:122197` becomes the canonical field contour.
It is organized by predicate, not by component:

```text
Predicate: <id>
  PASS — canonical component state
  FAIL — one intentional defect
  UNKNOWN — one required fact intentionally unavailable
  NOT APPLICABLE — same structure outside rule scope
```

Each case has one expected machine result and one expected focus node. A case
may use several components only when the predicate itself is relational.

Initial field sequence:

1. `exists`, `equals`, `one-of` — component property/variant facts;
2. `matches-effective-baseline` — TitleView fixed typography or color;
3. `binding-satisfies` — BackgroundPlate spacing token;
4. `count-between`, `all-equal`, `value-position` — ButtonsGroup;
5. `exists`, `equals`, `one-of`, `after`, `contains` — BackgroundPlate Level 2 overlay composition;
6. `sequence-equals`, `before`, `after` — TitleView slots/actions;
7. `distance`, `aligned`, `contains` — form paddings and block gaps;
8. page grid and form action placement using geometry plus order;
9. authority conflict, missing evidence and unsupported rule behavior.

Every predicate receives pure unit fixtures before its Figma case is created.

## Cutover gates

The replacement is an MVP only when all gates pass:

1. registry and RuleIR schemas reject unknown capabilities;
2. every predicate has PASS, FAIL, UNKNOWN and NOT-APPLICABLE unit fixtures;
3. every pilot Figma case produces the expected focus target and trace;
4. ten consecutive runs of an unchanged section are byte-identical after
   removing wall-clock timestamps;
5. zero unclassified targets and zero duplicate identities;
6. zero agent-created or agent-modified verdicts;
7. a packet remains below the transport budget because only requested facts
   and rules are evaluated; no full-document prompt is required;
8. current Apollo component checks remain available until predicate parity is
   proven, then the old agent verdict path is removed in one cutover.

## Delivery order

### M0 — contract

- freeze old verdict development;
- ratify capability registry, RuleIR, snapshot v2 and result schema;
- publish the predicate-to-source-field compiler mapping.

### M1 — pure engine

- [x] implement selectors, typed value resolution and three-valued logic;
- [x] implement all 36 registry predicates;
- [x] add coverage ledger, deterministic ids/order and full traces.
- [x] add graph `query`, arithmetic `derive` and `approximately-equals` for
  universal P21–P28 rules without component-specific runtime code.

### M2 — snapshot

- compare predicate requirements with the current plugin report;
- add only missing evidence fields;
- validate and hash the snapshot before evaluation.

### M3 — component contour

- [x] build P01/P02 PASS/FAIL cases in Figma from the published ButtonsGroup;
- [x] build P03 `value-position`, P04 `matches-effective-baseline` and P05
  `binding-satisfies` PASS/FAIL cases from published components;
- [x] route the Patterns pilot through `/v1/validate/predicates` without Codex;
- [x] persist every predicate release, evaluation, tri-state trace, focus target and rendered finding as a linked `*_predicates.json` stats report;
- [x] field-prove P10 `Benefits.Capacity`, P11 Horizontal TableView Header and
  P12 TableView Compact/SpacingVertical consistency on published components;
- [x] field-prove P13 uniform nested BenefitCard settings; the deterministic
  PASS/FAIL/UNKNOWN/NOT-APPLICABLE contour and published Figma fixtures are ready;
- [x] field-prove P14 one data Column per Body Row in compact Horizontal
  TableView; published PASS/FAIL fixtures and the exact nested Row focus are
  confirmed by the 2026-08-23 runtime report;
- [x] field-prove P15 24 px vertical distance between adjacent first-level
  BackgroundPlate blocks on a form page; the published PASS/FAIL fixtures,
  measured gaps and exact second-block focus are confirmed by the 2026-08-23
  runtime report;
- [x] field-prove P16 at most one TitleView Medium per first-level form plate;
  the PASS `single`, first `first`, second `last` violation and exact second-title
  focus are confirmed by the 2026-08-24 runtime report;
- [x] field-prove P17 24 px from TitleView Medium to the first content block;
  two compliant `24 px` relations, the `40 px` violation, exact content focus
  and human-readable UI presentation are confirmed by the 2026-08-24 runtime report;
- [x] field-prove P18 standard first-level form surface content insets;
  the runtime gate confirms the compliant 32 px contour and the exact
  right-inset violation on its `BackgroundPlateSlot` focus;
- [x] field-prove P19 desktop form grid 8+4 with a 24 px gutter;
  the 2026-08-24 report classified the canonical PASS owner `12276:48914` as
  compliant and the canonical FAIL owner `12276:51033` as a violation with
  exact focus on that horizontal layout container;
- [x] run every predicate request through a ten-run repeatability gate over the
  same in-memory Snapshot v2 and rule release; persist `runCount`, `stable`, and
  `resultHash` in the predicate report; the 2026-08-24 Figma run passed `10/10`
  with `stable=true` and result hash
  `dc87cbab54532fe82fc61b12597d3f3ceca52955917217b05b49120821f988b2`;
- [x] build and run component predicate cases P05–P06 in Figma;
- migrate BackgroundPlate, TitleView and ButtonsGroup rules to RuleIR;
- [x] implement the pure P21–P28 universal contour compiler and the complete
  PASS/FAIL/UNKNOWN/NOT-APPLICABLE unit matrix;
- [x] activate P21 from the authoritative AccountSelect `rules.json` through
  release discovery and the generic `public-root` compiler;
- [x] field-prove P21 AccountSelect public-root and P22 Status preset-to-Shape
  context mapping with exact focus and human-readable presentation;
- [x] activate P23 from the authoritative AccountSelect `rules.json` through
  release discovery and the generic `uniform-allowed-collection` compiler;
- [x] field-prove P23 and activate P24 from the authoritative CardSwiperMobile
  `rules.json` through the generic `breakpoint-map` compiler;
- [x] activate P25 from authoritative Benefits `rules.json` and P26 from
  authoritative TitleView `rules.json`; P26 uses the generic `baseline`
  compiler with observable root opacity and fail-closed baseline evidence;
- [x] field-prove P26 on published TitleView PASS/FAIL roots: the 2026-08-25
  report returned exactly one `0.5 != 1` violation, exact root focus and a
  stable ten-run result;
- [x] activate P27 from the authoritative `p_title-view.md` rule through
  generic Markdown contour discovery and the universal `query-count`
  compiler; the full PASS/FAIL/UNKNOWN/NOT-APPLICABLE integration matrix is
  green;
- [ ] build and field-prove the P21–P28 Figma fixtures described in
  `docs/PREDICATE_FIELD_CASES.md`;
- [x] debug until the repeatability gate passes in the real Figma flow.

### M4 — form contour

- [x] build and run predicate cases P07–P08;
- [x] compile and field-prove the current deterministic form contour P15–P19;
- [x] verify page-type scoping and Base/Section report routing.

### M5 — cutover

- [x] compare old and new reports only as diagnostics;
- [x] enable the predicate engine for the P01–P19 pilot scope;
- [x] pass the complete mixed synthetic-section regression with ownership-aware
  component selectors, exact Base/Section routing and stable ten-run output;
- [ ] run the pilot against a curated set of real product screens;
- [ ] remove old SFM/faceted-agent verdict code after the real-screen cutover gate.
