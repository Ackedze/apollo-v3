# Predicate Engine field cases

Figma section: `12161:122197`  
Status: P01–P28 are field-proven, except the intentionally non-mutable live
FAIL contour for P08. P21 confirmed public AccountSelect ownership and exact
focus; P22 confirmed the preset-to-Status Shape mapping; P23 confirmed the
uniform AccountItem Type collection; P24–P28 confirmed breakpoint, sizing,
baseline, query-count and derived-geometry contours. The Patterns tab uses the
predicate pilot instead of Codex for this rule set.

Every predicate endpoint request is also evaluated ten times against the same
Snapshot v2 and rule release. A response is returned only when all ten stable
result hashes match; the gate metadata is stored in the predicate report. The
2026-08-24 Figma run passed the gate with `runCount=10`, `stable=true`, and
`resultHash=dc87cbab54532fe82fc61b12597d3f3ceca52955917217b05b49120821f988b2`.

Fixture root: `12164:14353`.

## P01 — `one-of`: ButtonsGroup allowed views

Normative source:

- package: `web-corp/ButtonGroup [D]`;
- contract: `buttons-group.composition`;
- constraint: `allowed-views`;
- expected values: `Primary | Secondary`;
- target: every visible nested `[D] Button` in document order.

Figma contour:

1. `P01 / PASS` — `[D] ButtonsGroup`, visible nested buttons use only
   `View=Primary` and `View=Secondary`; group `12164:48506`.
2. `P01 / FAIL` — the same group with exactly one nested button changed to
   `View=Accent`; group `12164:48531`, expected focus
   `I12164:48531;62786:48896`.
3. `P01 / UNKNOWN` — supplied by the sanitized snapshot fixture, because a
   deliberately unreadable Figma component set is not a stable field fixture.
4. `P01 / NOT APPLICABLE` — a frame without ButtonsGroup; selector matches no
   target component.

Expected FAIL result:

- classification: `violation`;
- focus: the nested Button with `View=Accent`, not the group root;
- actual: `Accent`;
- expected: `[Primary, Secondary]`;
- trace predicate: `one-of`;
- exactly one row and one evaluation id;
- no agent call.

Repeatability gate: run the unchanged test section ten times. Normalized
Predicate Result JSON must be byte-identical after timestamps are removed.

## P02 — `equals`: ButtonsGroup uniform size

Normative source:

- package: `web-corp/ButtonGroup [D]`;
- contract: `buttons-group.composition`;
- constraint: `uniform-size`;
- actual fact: `component.properties.Size` on every nested Button;
- expected fact: `ownership.owner.component.properties.Size` calculated by
  the snapshot builder for the owning ButtonsGroup.

Figma contour:

1. `P02 / PASS` — ButtonsGroup `Size=56`; every visible nested Button has
   `Size=56`; group `12164:48574`.
2. `P02 / FAIL` — the same group with exactly one nested Button changed to
   `Size=40`; group `12164:48599`, expected focus
   `I12164:48599;62786:48896`.
3. `P02 / UNKNOWN` — a sanitized snapshot fixture with
   `ownership.owner.component.properties.Size` listed in `unknownFacts`.
4. `P02 / NOT APPLICABLE` — a frame without ButtonsGroup.

Expected FAIL result:

- classification: `violation`;
- focus: the nested Button with `Size=40`;
- actual: `40`;
- expected: `56`;
- trace predicate: `equals`;
- exactly one violation and no agent call.

## P03 — `value-position`: ButtonsGroup SingleIcon position

Normative source:

- package: `web-corp/ButtonGroup [D]`;
- contract: `buttons-group.composition`;
- constraint: `single-icon-position`;
- precondition: the nested Button has `SingleIcon=True`;
- expected state: when `Overflow=true`, no more than one SingleIcon button is
  present and it occupies the last visible position.

Figma contour:

1. `P03 / PASS` — the only `SingleIcon=True` button is the last visible member;
   group `12169:11280`.
2. `P03 / FAIL` — the `SingleIcon=True` button occupies a middle position;
   group `12169:11443`, expected focus
   `I12169:11443;62786:48901`.
3. `P03 / UNKNOWN` — a sanitized snapshot fixture with the sibling
   `SingleIcon` sequence listed in `unknownFacts`.
4. `P03 / NOT APPLICABLE` — a ButtonsGroup without a visible
   `SingleIcon=True` member.

Expected FAIL result:

- classification: `violation`;
- focus: the middle nested Button with `SingleIcon=True`;
- actual: the ordered sibling `SingleIcon` sequence;
- expected: `True` only at `last`, `maxCount=1`;
- trace predicate: `all` containing `equals` and `value-position`;
- no agent call.

## P04 — `matches-effective-baseline`: TitleView fixed typography

Normative source:

- package: `web-corp/TitleView`;
- source: `design-system_ab/JSONS/web/components/web-corp/TitleView/rules.json`;
- rule: `component:web-corp.title-view.title-and-subtitle-typography-is-fixed`;
- target: visible `Title` and `Subtitle` text nodes owned by TitleView;
- expected state: `styles.text` equals the effective baseline of the selected
  `View`.

Figma contour:

1. `P04 / PASS` — published `View=xLarge` TitleView with canonical Title text
   style; instance `12175:11210`, Title
   `I12175:11210;37705:55353`.
2. `P04 / FAIL` — the same published variant with Title text style overridden
   from `Headline–System/40–48 Large` to the canonical Subtitle style;
   instance `12175:11328`, expected focus
   `I12175:11328;37705:55353`.
3. `P04 / UNKNOWN` — a sanitized fixture where Figma reports a text-style
   override but the exact baseline diff is unavailable.
4. `P04 / NOT APPLICABLE` — a text node outside a TitleView owner.

Baseline proof:

- for a changed text style, the adapter uses the exact WIP change pair and its
  resource names as baseline/actual;
- for an unchanged published instance, absence of the corresponding direct
  text-style override proves that the current value is the effective baseline;
- an override without an exact diff is `not-evaluable`, never a guessed PASS.

Expected FAIL result:

- classification: `violation`;
- focus: the exact overridden Title text node, not the TitleView instance;
- trace predicate: `matches-effective-baseline`;
- source: the active TitleView rule above;
- exactly one Title finding and no agent call.

## P05 — `binding-satisfies`: BackgroundPlate padding tokens

Source rule:
`component:web-corp.background-plate.padding-uses-spacing-tokens` from
`design-system_ab/JSONS/web/components/web-corp/BackgroundPlate/rules.json`.

The numeric padding value is designer-controlled. The predicate checks only
that every observed `layout.padding.*` edge is bound to a variable from the
published `Spacing` collection. Snapshot v2 carries the raw value together
with stable variable identity, readable token name and collection metadata.

1. `P05 / PASS` — every visible padding edge is bound to `Spacing`; card
   `12186:11163`, BackgroundPlateSlot `12186:11177`;
2. `P05 / FAIL` — exactly one edge is a known raw px value without binding;
   card `12186:11179`, BackgroundPlateSlot `12186:11193`, expected focus
   `12186:11193`;
3. `P05 / UNKNOWN` — an edge has a variable id, but its token/collection
   metadata cannot be resolved;
4. `P05 / NOT APPLICABLE` — the same layout is outside BackgroundPlate.

The FAIL result focuses the exact BackgroundPlate node and names the affected
edge. It must never recommend resetting the padding value to a baseline.

Field result: PASS. The report contains one P05 violation for raw right
padding `24 px`, no P05 finding for the PASS fixture, and activating the row
focuses the exact FAIL instance `12186:11193`.

## P06 — overlay composition: BackgroundPlate Level 2 over Level 1

Source rule:
`component:web-corp.background-plate.level-2-requires-level-1` from
`design-system_ab/JSONS/web/components/web-corp/BackgroundPlate/rules.json`.

The canonical Figma assembly uses a common Auto Layout container. Level 1 is
the absolute-positioned underlay. The content branch above it remains a normal
Auto Layout child; Level 2 may be that direct child or may be nested inside a
published owner component such as a card. The source rule declares the generic
`co-located-underlay` contour. The adapter exposes the matching Level 1 and the
top-level content branch under
`composition.underlayRelations.level1Underlay`. The assertion is compiled from
that source declaration and checks that:

1. exactly one Level 1 underlay can be resolved in the shared parent;
2. the parent is an Auto Layout container;
3. the underlay identity is `web-corp.background-plate` with
   `Position=Level 1 (outer)`;
4. Level 1 has `layout.positioning=ABSOLUTE`, while the top-level content
   branch has `AUTO`;
5. Level 1 precedes the content branch in sibling order;
6. Level 1 bounds contain Level 2 bounds.

Expected contour:

1. `P06 / PASS` — the published Level 1 and Level 2 instances use the overlay
   assembly above; canonical fixture `12201:123360`;
2. `P06 / FAIL` — Level 2 has no Level 1 underlay, Level 1 is not absolute,
   is above Level 2, or does not contain it; focus must be the exact Level 2;
3. `P06 / UNKNOWN` — Level 2 is the selection root and its parent is outside
   the captured graph;
4. `P06 / NOT APPLICABLE` — no visible BackgroundPlate Level 2 is present.

Field result: PASS on 2026-08-25. One request over the published PASS
`12201:123360` and FAIL `12208:46602` fixtures classified the exact Level 2
roots as `compliant` and `violation`, focused FAIL node `12208:46606`, produced
zero unclassified or duplicate evaluations and passed the ten-run repeatability
gate. The trace uses only the generic
`composition.underlayRelations.level1Underlay.*` fact family; the legacy
`composition.level1Underlay` path is absent.

The rule does not infer structure from names. Component identity and Position
come from the published component metadata; order, positioning and containment
come from the captured scene graph. A shared parent outside the snapshot or an
ambiguous choice between several Level 1 candidates is `not-evaluable`.

Field status: READY FOR SOURCE-DRIVEN FIELD RUN. The user-provided canonical
assembly at `12201:123360` is the PASS fixture; `12208:46602` is the canonical
FAIL fixture. The generic contour passes its complete local
PASS/FAIL/UNKNOWN/NOT-APPLICABLE matrix. The field gate must additionally prove
exact Level 2 focus, stable repeatability and absence of the legacy
`composition.level1Underlay` fact.

## P07 — `all-equal`: TitleView Status consistency

Source rule:
`component:web-corp.title-view.status-and-title-status-color-match` from
`design-system_ab/JSONS/web/components/web-corp/TitleView/rules.json`.

The source rule uses the generic
`predicateContour.kind=owned-peer-property-equality`: it declares its owner,
target, peer roles and `component.properties.Type` fact. The adapter resolves
the declared peers inside the target's nearest owner boundary and the compiled
predicate compares their ordered values. No TitleView, StatusPreset,
TitleStatus or Type branch remains in runtime code; the predicate does not
infer status semantics from colors or geometry.

1. `P07 / PASS` — both slots are visible and use `Type=Approved`; card
   `12196:86198`, TitleView `12196:86200`;
2. `P07 / FAIL` — Status uses `Approved`, TitleStatus uses `Attention`; card
   `12196:86201`, TitleView `12196:86203`, expected focus
   `I12196:86203;58026:551404`;
3. `P07 / UNKNOWN` — both slots are visible, but one nested Type cannot be
   resolved;
4. `P07 / NOT APPLICABLE` — fewer than two status roles are visible.

Expected FAIL result:

- classification: `violation`;
- focus: the exact mismatching TitleStatus instance;
- trace predicate: `all-equal`;
- actual values: `Approved → Attention`;
- exactly one P07 finding and no agent call.

## P08 — `after`: TitleView visible slot order

Source rule:
`component:web-corp.title-view.visible-slots-follow-required-order` from
`design-system_ab/JSONS/web/components/web-corp/TitleView/composition-contract.json`.

The adapter resolves visible TitleView slots by exact owner and canonical role,
then evaluates every non-first role against its required visible predecessor.
Duplicate or ambiguous roles are `not-evaluable`; a non-matching platform is
`not-applicable`.

## P09 — `count-between`: ButtonsGroup visible button count

Source constraint: `buttons-group.composition/constraints/button-count` from
`design-system_ab/JSONS/web/components/web-corp/ButtonGroup [D]/composition-contract.json`.

The adapter collects only visible nested `web-core.button` instances owned by
the same published ButtonsGroup. The predicate evaluates their stable node-id
collection against the inclusive range `2..4` and focuses the aggregate result
on the ButtonsGroup owner.

1. `P09 / PASS` — the group contains 2–4 visible buttons;
2. `P09 / FAIL` — the group contains 1 or more than 4 visible buttons; expected
   focus is the ButtonsGroup owner;
3. `P09 / UNKNOWN` — child collection for the owner failed and
   `composition.visibleButtonNodeIds` is explicitly marked unknown;
4. `P09 / NOT APPLICABLE` — the rule is outside its desktop/mobile-web scope.

The engine does not infer missing children as hidden buttons when collection
failed. The collection error is attached to the exact owner fact and produces
`not-evaluable`, not a guessed count.

## P10 — `count-between` + `equals`: Benefits Capacity

Source rule:
`component:web.benefits.capacity-matches-card-count` from
`design-system_ab/JSONS/web/components/web-corp-promo/Benefits/rules.json`.

The adapter resolves visible direct `BenefitCard` owners, preserves their
stable ids and compares the collection length with the published Benefits
`Capacity`. The accepted count is three or four.

1. `P10 / PASS` — Capacity and three visible cards agree; Benefits
   `12224:47033`;
2. `P10 / FAIL` — Capacity and visible-card count differ; Benefits
   `12224:47124`;
3. `P10 / UNKNOWN` — Capacity or the direct-card collection is explicitly
   unavailable;
4. `P10 / NOT APPLICABLE` — no visible Benefits root is present.

Field result: PASS. The aggregate produces one owner-level evaluation and
never duplicates the finding per nested card.

### CUTOVER C09 — source-driven typed Capacity mapping

Purpose: replace the hand-written P10 RuleIR factory with the generic
source-owned `context-map` contour while preserving numeric Capacity values.

Source:
`design-system_ab/JSONS/web/components/web-corp-promo/Benefits/rules.json#component:web.benefits.capacity-matches-card-count`.

- generic kind `context-map`;
- source-declared context fact `composition.capacity`;
- source-declared target fact `composition.visibleBenefitCardCount`;
- typed mappings `3 -> 3` and `4 -> 4` through `mappingEntries`;
- component scope and UI copy are owned by the source rule;
- the former `benefitsCapacityRule` factory and runtime registration are
  removed.

Acceptance gate:

1. Benefits with Capacity `3` and three visible cards is `compliant`;
2. a Capacity/card-count mismatch is one owner-level `violation`;
3. subject, focus and rendered row resolve to the exact Benefits root;
4. the rendered row is a component rule and appears only in `База`;
5. source path, checksum, revision `2` and presentation come from
   `Benefits/rules.json`;
6. coverage has zero unclassified and duplicate evaluations;
7. ten identical runs have one stable result hash and no Codex process starts.

Field result: PASS on 26 August 2026. Source report
`apollo-1096330610570928879-1787733082671-16fooe0k` evaluated the existing
PASS and FAIL fixtures in one frozen snapshot. Benefits `12224:47033` was
`compliant` with Capacity `3` and three visible BenefitCard children. Benefits
`12224:47124` was the only P10 `violation`, with Capacity `4` and three visible
children. Subject, focus and rendered row all resolved to that exact Benefits
root, and the component rule remained in `База`.

The report used revision `2` and source checksum
`0cf9af21a6ffd50e3891297e9a76c3054c730a8509e0a88414f4054acc2688c1`,
which matches the published `Benefits/rules.json`. Coverage had zero
unclassified and duplicate evaluations. The ten-run gate was stable with
result hash
`3257d65076cbe06d1db1f4637b943ef3a3717576fdfe016ccff82848bdfaea0e`.
Both fixtures also expose an unrelated Benefits sizing violation; it does not
change the C09 verdict and remains fixture-hygiene cleanup.

### CUTOVER C10 — source-driven uniform member properties

Purpose: replace the hand-written P13 Benefits RuleIR factory with the generic
source-owned `uniform-collection-properties` contour.

Source:
`design-system_ab/JSONS/web/components/web-corp-promo/Benefits/rules.json#component:web.benefits.nested-card-settings-are-uniform`.

- the source declares owner identity `web.benefits`;
- the source declares member identity `web.benefit-card`;
- the source declares direct children as the member collection boundary, so
  renamed BenefitCard instances remain members while unrelated unresolved
  deep descendants cannot poison the identity query;
- the source declares the four projected facts: `Background`, `CardAxis`,
  `Compact` and `GraphicPosition`;
- the generic engine queries descendants, projects each property and applies
  `all-equal` without Benefits-specific RuleIR;
- allowed fill/stroke differences remain outside the asserted property set;
- the former `benefitsNestedCardSettingsUniformRule` factory and runtime
  registration are removed.

Acceptance gate:

1. equal settings on every visible BenefitCard remain `compliant`;
2. any difference in a declared property produces one owner-level
   `violation`;
3. missing member identity or a missing declared property is `not-evaluable`;
4. subject, focus and rendered row resolve to the exact Benefits root;
5. the row is a component rule and appears only in `База`;
6. source path, checksum, revision `4` and presentation come from
   `Benefits/rules.json`;
7. coverage has zero unclassified/duplicate evaluations and the ten-run hash
   is stable without Codex process starts.

First field attempt on revision `2`: both controls became `not-evaluable`.
Unrelated nested instances with unresolved `component.identity` were traversed
before the intended BenefitCard collection and poisoned the query. Revision
`3` used a source-owned public member-name boundary, but that excluded the
intentionally renamed failing BenefitCard and made both controls `compliant`.
Revision `4` declares the actual composition boundary instead: direct children
of Benefits. Renamed direct BenefitCards are included; unresolved deep content
is excluded; an unresolved direct child still fails closed.

Final field result: PASS. Report
`Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_12-53-28_predicates.json`
evaluated both controls in one frozen snapshot. Benefits `12238:47999` was
`compliant`: all three cards exposed `Vertical`. Benefits `12238:48065` was
the only P13 `violation`: its ordered CardAxis collection was `Vertical`,
`Horizontal`, `Vertical`. Subject, focus and rendered row resolved to the exact
FAIL Benefits root, and the component rule remained in `База`.

The report used revision `4` and source checksum
`60ac8041c2935a142f72edd1c7a8633c7856f8f091b0bb7c7d9e87b355c86bc8`.
Coverage had zero unclassified and duplicate evaluations. The ten-run gate was
stable with result hash
`1087efbe29dcb323a79422de756e56c4d77c4ab80c90c97f7b0db0444ee7fecb`.
Both controls still expose the known unrelated Benefits sizing fixture noise;
it does not affect the C10 verdict.

## P11 — `count-between`: Horizontal TableView Header

Source rule:
`component:web-corp.table-view.horizontal-multi-column-header-required` from
`design-system_ab/JSONS/web/components/web-corp/TableView/rules.json`.

A visible non-compact Horizontal TableView must contain exactly one direct Row
with `Presets=Header`. The adapter resolves direct rows by published component
identity and exact owner; names are not predicates.

1. `P11 / PASS` — one direct Header Row; TableView `12227:46999`;
2. `P11 / FAIL` — zero direct Header Rows; TableView `12227:47519`, expected
   focus is the TableView owner;
3. `P11 / UNKNOWN` — direct-row collection or Presets is unavailable;
4. `P11 / NOT APPLICABLE` — another TableView family or Compact=True.

Field result: PASS. UI text names the missing Header state and focuses the
exact failing TableView.

### CUTOVER C11 — source-driven required Header count

Purpose: replace the hand-written P11 TableView RuleIR factory with the
generic source-owned `fact-domain` contour.

Source:
`design-system_ab/JSONS/web/components/web-corp/TableView/rules.json#component:web-corp.table-view.horizontal-multi-column-header-required`.

- the source selector declares published Horizontal TableView with
  `Compact=False`;
- the source asserts `composition.visibleHeaderRowCount` belongs to `[1]`;
- the snapshot adapter remains responsible only for resolving visible direct
  Row instances with `Presets=Header` under the exact TableView owner;
- the source owns platform scope, authority, presentation and action;
- the former `tableViewHorizontalHeaderRule` factory and runtime registration
  are removed.

Acceptance gate:

1. TableView `12227:46999` remains `compliant` with one Header Row;
2. TableView `12227:47519` produces one owner-level violation with zero Header
   Rows;
3. unresolved direct-row evidence remains `not-evaluable`;
4. Compact=True and other TableView families remain `not-applicable`;
5. subject, focus and rendered row resolve to the exact TableView root;
6. the component rule appears only in `База`;
7. source path, checksum, revision `2` and presentation come from
   `TableView/rules.json`;
8. coverage has zero unclassified/duplicate evaluations and the ten-run hash
   is stable without Codex process starts.

Cutover field result: PASS on 2026-08-26. Report
`Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_13-05-07_predicates.json`
keeps TableView `12227:46999` compliant with `actual=1` and emits one
owner-level violation for TableView `12227:47519` with `actual=0`. Both
evaluations focus the exact TableView root and remain in `База`. The report
uses source revision `2`, source checksum
`99d2ee90c9ff58e91c93107f91aeae1ca66b457413d481281269ac48f3c43d84`,
has zero unclassified and duplicate evaluations, and produces stable ten-run
hash `f8dbc3969b91cc48e18c4b146c656708dee21b1c822925032fd3784cd846520e`.

### CUTOVER C12 — source-driven TitleStatus property dependency

Purpose: express the TitleView boolean-property dependency entirely in
`design-system_ab/JSONS/web/components/web-corp/TitleView/rules.json`:
`TitleStatus=true` requires `Status=true` on the same public TitleView root.

- the source selects a public `[D]/[M] TitleView` whose `TitleStatus` boolean is
  enabled;
- the universal `fact-domain` contour checks
  `component.properties.Status` against `[true]`;
- the engine contains no TitleView-specific branch;
- the former source statement allowing standalone TitleStatus is removed from
  rules, README, examples, contract overrides and agent context;
- source owns authority, platform scope, UI copy and action.

Acceptance gate:

1. `TitleStatus=true, Status=true` is `compliant`;
2. `TitleStatus=true, Status=false` produces exactly one violation on the same
   TitleView root;
3. `TitleStatus=false` is outside the selector and is `not-applicable`;
4. unsupported platforms are `not-applicable`;
5. the finding stays in `База`, focuses the exact TitleView and uses the
   source-owned presentation;
6. coverage has zero unclassified/duplicate evaluations and the ten-run hash
   is stable without Codex process starts.

Cutover field result: PASS on 2026-08-26. Report
`Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_13-25-01_predicates.json`
keeps TitleView `12196:86200` compliant for `TitleStatus=true, Status=true` and
emits exactly one violation for TitleView `12418:79821` when
`TitleStatus=true, Status=false`. Both evaluations focus the exact TitleView
root; the finding remains in `База` and uses the source-owned presentation.
The report uses source revision `1`, source checksum
`d862d145b40a65ab8d737afc98c059a405ff1cf20564abc0badfe54987672b3b`,
has zero unclassified and duplicate evaluations, and produces stable ten-run
hash `d59aa24c5fce6a0f668aad01e6e98ce6db2bd36be14472e3e39190c1b6920110`.

## P12 — `all` + `equals`: TableView Compact and row spacing

Source rule:
`component:web-corp.table-view.compact-is-consistent-across-rows` from
`design-system_ab/JSONS/web/components/web-corp/TableView/rules.json`.

Every visible direct Row must repeat the root TableView `Compact` value. The
canonical vertical spacing is not `Row.itemSpacing`: it is represented by the
two direct nested `↕ SpacingVertical` instances and their public `Size`
property. The adapter exposes `composition.tableViewOwner`,
`composition.expectedRowSpacing`, `composition.spacingVerticalNodeIds`,
`composition.spacingVerticalValues` and the unambiguous scalar
`composition.spacingVertical`. Missing or conflicting spacer evidence is
`unknown`.

1. `P12 / PASS` — Compact=False and both row spacers are Size=16; TableView
   `12234:47602`;
2. `P12 / FAIL` — one direct Row is Compact=True with both spacers Size=12
   under a Compact=False root; TableView `12234:49890`, expected focus
   `I12234:49890;60611:7919`;
3. `P12 / UNKNOWN` — Compact or either canonical spacer value is unavailable
   or ambiguous;
4. `P12 / NOT APPLICABLE` — no supported TableView root/direct Row pair.

Field result: PASS on 2026-08-23. The complete section produced 24 P12
evaluations (four TableViews × six direct Rows): 23 `compliant` and exactly one
`violation`. Its trace independently records `Compact True != False` and
`spacing 12 != 16`. Activating the single UI row focuses the exact nested Row;
the Figma right panel shows `Row`, `Compact=True`, not the TableView root or the
test section.

## P13 — `all` + `all-equal`: uniform nested BenefitCard settings

Source rule:
`component:web.benefits.nested-card-settings-are-uniform` from
`design-system_ab/JSONS/web/components/web-corp-promo/Benefits/rules.json`.

Every direct visible BenefitCard in one Benefits owner must use the same
`Background`, `CardAxis`, `Compact` and `GraphicPosition` values. The adapter
exposes ordered owner facts in
`composition.benefitCardPropertyValues.<Property>` and evaluates all four
collections as one rule. Missing card identity or any missing property is
`unknown`; a difference produces one owner-level finding rather than four
unrelated customization rows.

1. `P13 / PASS` — three cards use identical settings; Benefits `12238:47999`;
2. `P13 / FAIL` — the middle card uses `CardAxis=Horizontal` while its siblings
   use `Vertical`; Benefits `12238:48065`;
3. `P13 / UNKNOWN` — a direct card identity or one required property is absent;
4. `P13 / NOT APPLICABLE` — no supported Benefits owner is present.

Expected focus for FAIL is the Benefits owner `12238:48065`: `all-equal`
classifies a composition-wide invariant and does not guess a canonical card
when several values disagree.

## P14 — `count-between`: one data Column in compact Horizontal TableView

Source rule:
`component:web-corp.table-view.horizontal-compact-one-column` from
`design-system_ab/JSONS/web/components/web-corp/TableView/rules.json`.

For every direct Body Row owned by `[D] TableView :: Horizontal` with `Compact=True`,
the adapter resolves visible `Column` descendants belonging to that Row and
exposes `composition.visibleDataColumnNodeIds` plus
`composition.visibleDataColumnCount`. The rule requires exactly one Column and
focuses the concrete offending Row.

1. `P14 / PASS` — compact Horizontal TableView whose Row contains one Column;
2. `P14 / FAIL` — the same configuration with two visible Column instances;
3. `P14 / UNKNOWN` — a visible Column cannot be resolved through the pinned component index;
4. `P14 / NOT APPLICABLE` — `Compact=False`, another TableView family, or no supported owner.

Field result: PASS on 2026-08-23. Published PASS TableView `12242:17323`
produces four compliant Body Row evaluations with `actual=1`. Published FAIL
TableView `12242:17647` produces one P14 violation with `actual=2` and exact
focus `I12242:17647;60668:82232`; its remaining Body Rows stay compliant.
Header Row is deliberately outside the selector because it contains headings,
not data Columns. The linked stats artifact is
`Alexey-Kukhta-CORP-Lead-Designer_23-08-2026_23-21-54_predicates.json`.

### CUTOVER C13 — source-driven compact TableView column count

Purpose: replace the hand-written P14 RuleIR factory with the generic
source-owned `fact-domain` contour.

Source:
`design-system_ab/JSONS/web/components/web-corp/TableView/rules.json#component:web-corp.table-view.horizontal-compact-one-column`.

- the source selector declares Body Row instances owned by Horizontal
  TableView with `Compact=True`;
- the source asserts `composition.visibleDataColumnCount` belongs to `[1]`;
- the adapter only resolves visible data Column descendants within the exact
  Row ownership boundary;
- the source owns platform scope, authority, presentation and action;
- the former `tableViewHorizontalCompactOneColumnRule` factory and global
  runtime registration are removed.

Acceptance gate:

1. every Body Row of TableView `12242:17323` remains `compliant` with one data
   Column;
2. the offending Body Row under TableView `12242:17647` produces exactly one
   violation with `actual=2`;
3. unresolved Column identity remains `not-evaluable`;
4. Compact=False, Header rows and other TableView families remain
   `not-applicable`;
5. subject, focus and rendered row resolve to the exact offending Body Row;
6. the component rule appears only in `База`;
7. source path, checksum, revision `2` and presentation come from
   `TableView/rules.json`;
8. coverage has zero unclassified/duplicate evaluations and the ten-run hash
   is stable without Codex process starts.

Cutover field result: pending.

Cross-component portability fixtures:

1. `C13 / TabsView / PASS` — published `[D] TabsView` with nested
   `[D] TabsSecondary`; every nested `[D] Tag` keeps `SingleIcon=False`;
2. `C13 / TabsView / FAIL` — the same published root with one `[D] Tag`
   inside `[D] TabsSecondary` changed to `SingleIcon=True`; focus must resolve
   to that exact Tag;
3. `C13 / TitleView / PASS` — published `[D] TitleView` with
   `TitleStatus=True`, `Status=True`;
4. `C13 / TitleView / FAIL` — the same root with `TitleStatus=True`,
   `Status=False`; focus must resolve to the exact TitleView root.

The four fixtures verify the generic `fact-domain` compiler and runtime across
two unrelated component families. They must not introduce component-specific
factories or runtime registration.

## P15 — `distance`: first-level form block spacing

Source rule:
`rule:forms.construction-rules.block-spacing` from
`design-system_ab/patterns/p_form-construction-rules.md`.

For `pageType=form`, the adapter identifies adjacent published
`BackgroundPlate` instances with `Position=Level 1 (outer)` and the same direct
parent. It exposes the previous block id and bounds on the second block as
`composition.previousFormFirstLevelBlock`. The generic vertical `distance`
predicate requires `24 px`; no layer names or container `itemSpacing` values
are used as the verdict.

1. `P15 / PASS` — fixture `12248:11164`, blocks `12248:11167` and
   `12248:11169`, measured gap `24 px`;
2. `P15 / FAIL` — fixture `12248:11171`, blocks `12248:11174` and
   `12248:11176`, measured gap `12 px`;
3. `P15 / UNKNOWN` — either block has unavailable bounds;
4. `P15 / NOT APPLICABLE` — page type is not `form`, or there is no adjacent
   supported first-level pair.

Expected focus for FAIL is the second block `12248:11176`.

Field result: PASS `12248:11169` is `compliant` with measured gap `24 px`;
FAIL `12248:11176` is `violation` with measured gap `12 px`. Both
`subjectNodeId` and `focusNodeId` resolve to the second block. The linked stats
artifact is
`Alexey-Kukhta-CORP-Lead-Designer_23-08-2026_23-42-30_predicates.json`.

## P16 — `one-of`: one TitleView Medium per form plate

Source rule:
`rule:forms.construction-rules.title-medium-one-per-plate` from
`design-system_ab/patterns/p_form-construction-rules.md`.

For `pageType=form`, the adapter assigns each visible `TitleView` with
`View=Medium` to its nearest published first-level BackgroundPlate surface.
The first Medium title is allowed; every additional Medium title is an exact
violation focused on that extra TitleView. Component names are used only to
fail closed when a TitleView identity is unresolved, never as positive proof.

1. `P16 / PASS` — fixture `12252:11338`, published `BackgroundPlateSlot`
   `12252:11343` with one Medium TitleView
   `I12252:11343;136846:8891;12252:11346`;
2. `P16 / FAIL` — fixture `12252:11442`, published `BackgroundPlateSlot`
   `12252:11447` with two Medium TitleViews; expected exact focus is the
   second title `I12252:11447;136846:8891;12252:11453`;
3. `P16 / UNKNOWN` — a candidate TitleView has unresolved component identity;
4. `P16 / NOT APPLICABLE` — page type is not `form`, or no Medium TitleView is
   present on a supported first-level surface.

Field result (2026-08-24): PASS title
`I12252:11343;136846:8891;12252:11346` is `compliant` with position `single`.
In the FAIL fixture, the first title
`I12252:11447;136846:8891;12252:11451` is `compliant` with position `first`,
while the second title `I12252:11447;136846:8891;12252:11453` is `violation`
with position `last`. Its `subjectNodeId`, `focusNodeId` and rendered finding
node all resolve to the second TitleView. The linked stats artifact is
`Alexey-Kukhta-CORP-Lead-Designer_24-08-2026_00-03-40_predicates.json`.

## P17 — `distance`: TitleView Medium to first content

Source rule:
`rule:forms.construction-rules.inner-padding-standard` from
`design-system_ab/patterns/p_form-construction-rules.md`. The executable RuleIR
projection is
`rule:forms.construction-rules.inner-padding-standard.title-to-content`.

For `pageType=form`, the adapter finds the last visible published
`TitleView View=Medium` on the nearest first-level BackgroundPlate surface and
links it to the first following visible sibling that is not another Medium
title. The rule measures the vertical geometry between the title and that
content node. The expected gap is exactly `24 px`; violations focus the content
node rather than the whole test section.

1. `P17 / PASS` — fixture `12256:11380`, published `BackgroundPlateSlot`
   `12256:11382`; title
   `I12256:11382;136846:8891;12256:11385`, content
   `I12256:11382;136846:8891;12256:11386`, gap `24 px`;
2. `P17 / FAIL` — fixture `12256:11481`, published `BackgroundPlateSlot`
   `12256:11483`; title
   `I12256:11483;136846:8891;12256:11486`, content and expected exact focus
   `I12256:11483;136846:8891;12256:11487`, gap `40 px`;
3. `P17 / UNKNOWN` — title/content geometry or TitleView identity is unresolved;
4. `P17 / NOT APPLICABLE` — page type is not `form`, or the supported
   title-to-content relation is absent.

Field result: the 2026-08-24 runtime report confirms two compliant `24 px`
relations and one `40 px` violation. The violation's `subjectNodeId`,
`focusNodeId` and rendered finding node all resolve to
`I12256:11483;136846:8891;12256:11487`. The UI presentation is
`Неверный отступ от TitleView Medium до контента`, with the expected `24 px`
and the action to set the vertical gap to `24 px`. The linked stats artifact is
`Alexey-Kukhta-CORP-Lead-Designer_24-08-2026_10-47-50_predicates.json`.

## P18 — `contentInsets`: standard first-level form surface

Source rule:
`rule:forms.construction-rules.inner-padding-standard` from
`design-system_ab/patterns/p_form-construction-rules.md`. The executable RuleIR
projection is
`rule:forms.construction-rules.inner-padding-standard.content-insets`.

For `pageType=form`, the adapter reuses the proven TitleView-to-content relation
to identify the first-level `BackgroundPlateSlot`, then climbs to the direct
content boundary under that surface. It derives one reusable geometric fact:
`composition.formFirstLevelSurface.contentInsets` with `top`, `right`, `bottom`
and `left`. All four values must equal `32 px`. The evaluation and UI finding
focus the `BackgroundPlateSlot`, because its padding is the property the
designer changes.

1. `P18 / PASS` — fixture `12268:11163`, published `BackgroundPlateSlot`
   `12268:11165`, direct Slot boundary `I12268:11165;136846:8891`; measured
   insets `{top:32,right:32,bottom:32,left:32}`;
2. `P18 / FAIL` — fixture `12268:11279`, published `BackgroundPlateSlot`
   `12268:11281`, direct Slot boundary `I12268:11281;136846:8891`; measured
   insets `{top:32,right:48,bottom:32,left:32}` and expected exact focus
   `12268:11281`;
3. `P18 / UNKNOWN` — surface or direct content-boundary geometry is unresolved;
4. `P18 / NOT APPLICABLE` — page type is not `form`, or the proven standard
   first-level TitleView/content contour is absent.

Field result: the runtime evaluation confirms PASS as `compliant` with
`{top:32,right:32,bottom:32,left:32}` and FAIL as `violation` with
`{top:32,right:48,bottom:32,left:32}`. Both the evaluation and click focus of
the violation resolve to `12268:11281`.

## P19 — `all` + `equals`: desktop form grid 8+4

Source rule:
`rule:forms.construction-rules.layout-8-4` from
`design-system_ab/patterns/p_form-construction-rules.md`. The executable RuleIR
projection is `rule:forms.construction-rules.layout-8-4.geometry`.

For `platform=desktop` and `pageType=form`, the adapter finds a shared visible
horizontal owner with two distinct flow children: the main zone contains a
published `BackgroundPlateSlot`, and the island zone contains a published
`IsleBlock`. Absolute children are excluded. Component identity comes only
from the released Figma-key index; layer names are not positive evidence.

The adapter publishes one aggregate fact,
`composition.formEightFourLayout`, containing the owner, the two zone IDs,
inner width, measured gutter and measured widths. Expected widths are derived
from the same 12-column grid with a 24 px gutter:
`column=(contentWidth-11*24)/12`, `main=8*column+7*24`,
`island=4*column+3*24`. One deterministic `all` requires both widths and the
gutter to match.

1. `P19 / PASS` — fixture `12276:48912`, horizontal owner `12276:48914`,
   main zone `12276:48915`, published `BackgroundPlateSlot` `12276:48916`,
   published `IsleBlock` `12276:48918`; geometry is `720 + 24 + 348 = 1092`;
2. `P19 / FAIL` — fixture `12276:51031`, horizontal owner and expected exact
   focus `12276:51033`, main zone `12276:51034`, published
   `BackgroundPlateSlot` `12276:51035`, published `IsleBlock` `12276:51037`;
   the widths remain 720/348 but the measured gutter is `12 px`;
3. `P19 / UNKNOWN` — the pair is ambiguous or any required owner/zone geometry
   is unavailable;
4. `P19 / NOT APPLICABLE` — platform is not desktop, page type is not `form`,
   or the released main/island composition is absent.

Pure adapter, RuleIR, endpoint and UI-presentation regressions are green. The
runtime report confirmed one compliant PASS, one exact 12 px violation and
focus on the shared horizontal owner. The loaded Figma plugin instance used the
previous generic composite-predicate presentation; reopening the rebuilt plugin
activates the P19-specific human wording already covered by the UI regression
test.

## P01–P19 mixed-section regression

The complete canonical section `12161:122197` was evaluated in one request with
`platform=desktop` and `pageType=form` after every isolated predicate had passed.
The first mixed run exposed an ownership-boundary defect: P05 and P06 selected
published BackgroundPlate instances nested inside another component's
implementation. RuleIR now requires the audited BackgroundPlate to be a public
instance root (`ownership.ownerNodeId` is absent); no component-specific branch
was added to the predicate engine.

The repeated 2026-08-24 run is recorded in
`Alexey-Kukhta-CORP-Lead-Designer_24-08-2026_15-39-55_predicates.json`:

- evaluations fell from `529` to `290`;
- rendered findings fell from `285` to `46`;
- P05 violations fell from `255` to `27`, all on public test-fixture
  BackgroundPlateSlot roots whose paddings are genuinely raw and unbound;
- P06 violations fell from `12` to the one canonical FAIL fixture;
- all five page-specific P15–P19 violations remained unchanged and route to
  `Раздел`; the other 41 rows route to `База`;
- coverage has zero unclassified and zero duplicate evaluations;
- the ten-run gate is stable with result hash
  `7e6079831701bdc0dcee7f3680a474389844271f554d698fb0906262450a8b7e`.

This closes the mixed synthetic-section boundary gate. The next gate is a
curated set of real product screens; test fixtures that claim PASS for a page
predicate should also bind their public BackgroundPlate paddings to Spacing
tokens so cross-rule findings remain intentional.

## Universal contour wave P21–P28

Build the following groups in the canonical Figma section `12161:122197`.
Each group has four frames named `PASS`, `FAIL`, `UNKNOWN` and
`NOT APPLICABLE`. `UNKNOWN` stays a sanitized proxy fixture when creating the
missing evidence in a published Figma instance would require corrupting or
detaching it.

### P21 — public component root

Active source:
`AccountSelect/rules.json#component:web-corp.account-select.public-roots-only`.
The source rule owns an `apollo.contour-definition.v1` declaration; the proxy
discovers it from the requested component package, pins the rules checksum and
compiles it through the generic `public-root` builder. There is no
AccountSelect branch in the evaluator.

- PASS A: place published `[D] AccountOptionListContent`.
- PASS B: keep an internal `AccountItem` inside the published public root.
- FAIL A: place the published internal `AccountItem` as a standalone instance.
- FAIL B: place `AccountItem` inside a foreign published component owner.
- UNKNOWN: keep the component key unresolved in a sanitized snapshot.
- NOT APPLICABLE: select a regular frame without the target identity or use an
  unsupported platform.
- Expected focus: the public/internal instance itself, never the test frame.
- Expected report tab: `Base`; this rule does not depend on `pageType`.

### P22 — conditional context mapping

Active source:
`Status & Property/rules.json#component:web-corp.status-property.shape-is-fixed-by-preset`.
The source rule owns an `apollo.contour-definition.v1` declaration compiled by
the generic `context-map` builder.

- PASS A: `StatusPreset` contains `Status.Shape=Rounded`.
- PASS B: `PropertyPreset` contains `Status.Shape=Rectangular`.
- FAIL: `PropertyPreset` contains `Status.Shape=Rounded`.
- UNKNOWN: owner family or nested Shape is unresolved.
- NOT APPLICABLE: another component context or unsupported platform.
- Expected focus: the exact nested Status instance.

### P23 — allowed and uniform collection

Active source:
`AccountSelect/rules.json#component:web-corp.account-select.list-content-is-uniform`.
Its `uniform-allowed-collection` contour selects the published list owner,
queries descendant `AccountItem.Type` facts, checks a minimum count, membership
in `Sum | Number`, and equality of the ordered values. The evaluator contains no
AccountSelect branch.

- PASS: at least two rows, all using `Type=Sum` or all using `Type=Number`.
- FAIL A: mix `Sum` and `Number` rows.
- FAIL B: leave `Type=SwapMe` or use legacy `Type=❌ Number`.
- UNKNOWN: one visible row cannot resolve `component.properties.Type`.
- NOT APPLICABLE: the public list has no supported row collection.
- Expected focus: the list owner; the trace must contain the ordered projected
  values and exact row ids.

### P24 — viewport to responsive variant

Source:
`CardSwiperMobile [M]/rules.json#component:web-corp.card-swiper-mobile.screen-size-follows-viewport`.
The active source rule owns an `apollo.contour-definition.v1`
`breakpoint-map`: the compiler reads `page.context.viewportWidth` and compares
it with the published root `component.properties.Screen Size`. No visual-width
heuristic or CardSwiperMobile runtime branch is used.

- PASS A: selected root width `320–359`, `Screen Size=320-360`.
- PASS B: selected root width `>=360`, `Screen Size=360+`.
- FAIL: swap the Screen Size in either width range.
- UNKNOWN: multi-root selection or unavailable root bounds.
- NOT APPLICABLE: another component or non-mobile-web scope.
- Expected focus: CardSwiperMobile root. The trace must read
  `page.context.viewportWidth`; visual width inference is forbidden.

### P25 — sizing contract

Active source:
`Benefits/rules.json#component:web.benefits.fill-width-hug-height`. Its
`sizing` contour compares the published Benefits root facts
`layout.sizingHorizontal=FILL` and `layout.sizingVertical=HUG`. The same
generic contour can compile other component sizing contracts without adding
component branches to the evaluator.

- PASS A: published Benefits root with `Compact=False` and the required
  `FILL/HUG` pair; frame `12349:53338`, target `12349:53340`.
- PASS B: published Benefits root with `Compact=True` and the same required
  `FILL/HUG` pair; frame `12349:53404`, target `12349:53406`.
- FAIL A: horizontal sizing is `HUG` while vertical remains `HUG`; frame
  `12349:53600`, target `12349:53602`.
- FAIL B: horizontal and vertical sizing are both `FILL`; frame
  `12349:53666`, target `12349:53668`.
- UNKNOWN: one sizing axis is unavailable.
- NOT APPLICABLE: another component identity.
- Expected focus: the node whose sizing property is changed.

The four live fixtures are structurally validated in Figma: neither invalid
pair was normalized by the editor. Field audit
`apollo-1096330610570928879-1787652695411-lblas8wk` evaluated all four
published Benefits roots, returned exactly two findings for the two invalid
sizing pairs and passed the ten-run repeatability gate with stable result hash
`3db36f13f3724f397c841c1d3d16ade48a8db9dd3a90193f1ffbb30612dca62d`.
The Figma UI confirmed both violations. Field result: PASS.

### P26 — complete effective baseline

First active source:
`JSONS/web/components/web-corp/TitleView/rules.json#component:web-corp.title-view.root-style-and-clickability-prohibited`.
The generic `baseline` contour compares root `appearance.opacity` with
`baseline.effective.appearance.opacity`; the runtime contains no TitleView
branch. FileUpload, CardSwiperMobile and additional property families remain
later data migrations onto the same contour.

- PASS: untouched published TitleView root with opacity `1`.
- FAIL: published TitleView root with opacity changed from `1` to `0.5`.
- UNKNOWN: Apollo records the root opacity override but the exact WIP baseline
  diff is unavailable.
- NOT APPLICABLE: another platform or component identity.
- Expected focus: the exact TitleView root. The trace contains actual and
  baseline opacity from the same property path.
- Expected text: `Изменена прозрачность корня TitleView`; observed value
  `Прозрачность изменена с 1 на 0.5.`

The plugin now records observable opacity and radius on every evidence node.
The adapter may derive `baseline == actual` only when the nearest published
component has no matching direct Figma override. A matching override without
an exact WIP diff is always UNKNOWN and is never inferred from appearance.

Field audit
`apollo-1096330610570928879-1787658345884-jy0ojopf:predicates:2a09a859584980c93f26bfc209784e68929abaf66e54c03ac273b57c85dfeec6`
evaluated the published PASS root `12358:140797` as `1 == 1` and the FAIL root
`12358:140818` as `0.5 != 1`. It returned exactly one violation, focused the
changed TitleView root, rendered the authoritative presentation and passed the
ten-run repeatability gate with stable result hash
`61e8cc2cea6dd4da56e4ca01542197ec843b4701108be7ebbda6822cbbf98b23`.
Field result: PASS.

### P27 — page-wide filtered aggregation

Source:
`patterns/p_title-view.md#rule:components.title-view.single-xlarge`.

The authoritative Markdown rule carries an
`apollo-predicate-contour` JSON block. The release loader discovers these
blocks generically across active pattern documents; the runtime does not
contain a TitleView or pattern-file branch. The `query-count` contour selects
each chosen area as its owner and queries matching published instances below
it.

- PASS: one visible `TitleView View=xLarge` in the selected page root.
- FAIL: two visible xLarge TitleViews under the same selected page root.
- UNKNOWN: one candidate has unresolved component identity or View.
- NOT APPLICABLE: page scope without a TitleView candidate.
- Expected focus: the page/selection owner for the aggregate finding; the
  trace must list the exact matching TitleView ids.

### P28 — derived layout formula

Source:
`patterns/p_form-construction-rules.md#rule:forms.construction-rules.layout-8-4`.

- PASS: desktop form with main width + island width + 24 px gutter equal to
  the measured content width and the 8:4 ratio.
- FAIL: change one column width or the gutter while preserving the same outer
  content width.
- UNKNOWN: one zone, gutter or outer width cannot be measured unambiguously.
- NOT APPLICABLE: non-form page or no two-zone form layout.
- Expected focus: the horizontal layout owner. The trace must expose every
  arithmetic operand, result, expected width and tolerance.

### Field acceptance gate

For each P21–P28 group:

1. one and only one terminal classification per expected evaluation;
2. FAIL focuses the property owner or relation owner, not section `12161:122197`;
3. UNKNOWN never becomes a violation;
4. NOT APPLICABLE creates no user-facing finding;
5. ten unchanged runs have the same normalized result hash;
6. no Codex process is started by `/v1/validate/predicates`.

## Cutover source-compiler cases

### CUTOVER C01 — ButtonsGroup composition source contract

- Existing PASS control: `12164:14354` (`Primary`, then `Secondary`).
- FAIL: `12371:11237`; ButtonsGroup `12371:11239` contains `Secondary`, then
  `Primary`.
- Expected result: one
  `component:web-corp.buttons-group.primary-position` violation, focused on
  nested button `I12371:11239;62786:48896`.
- Purpose: prove that the previously unregistered Primary-position constraint
  is compiled from `composition-contract.json`, not recreated in proxy code.

Field result: PASS on 2026-08-25. Audit
`apollo-1096330610570928879-1787685188868-06db0cc5` selected the existing PASS
control `12164:14354` together with FAIL `12371:11237`. The compiled rule
classified the first ordered sequence
`Primary, Secondary, Secondary, Secondary` as compliant and the second
`Secondary, Primary, Secondary, Secondary` as a violation. The only UI finding
focused exact nested button `I12371:11239;62786:48896`, cited the pinned
`ButtonGroup [D]/composition-contract.json` checksum, produced zero
unclassified or duplicate evaluations and passed the ten-run repeatability
gate.

### CUTOVER C02 — one generic sizing contour, two component packages

Purpose: prove that `kind=sizing` is a reusable source compiler rather than a
Benefits-specific predicate. Both component rules use the same
`sizingRule` implementation; component identity, expected axes, UI copy,
scope, authority and source checksum come only from the requested package's
`rules.json`.

ButtonsGroup source:
`ButtonGroup [D]/rules.json#component:web-corp.buttons-group.root-sizing-is-hug-hug`.

- PASS frame `12384:53951`, target `12384:53953`: `HUG/HUG`.
- FAIL frame `12384:54001`, target `12384:54003`: `FILL/HUG`.
- Both fixtures use the valid ordered sequence
  `Primary, Secondary, Secondary, Secondary`, so C01 cannot contaminate the
  sizing result.
- Expected finding: exactly one ButtonsGroup sizing violation focused on
  `12384:54003`.

BackgroundPlateSlot source:
`BackgroundPlate/rules.json#component:web-corp.background-plate.slot-sizing-fill-width-hug-height`.

- PASS frame `12384:54028`, target `12384:54030`: `FILL/HUG`.
- FAIL frame `12384:54032`, target `12384:54034`: `HUG/HUG`.
- Both fixtures are clones of the token-correct P05 PASS control, so padding
  binding checks cannot contaminate the sizing result.
- Expected finding: exactly one BackgroundPlateSlot sizing violation focused
  on `12384:54034`.

Field gate:

1. select suite `12386:54001`, containing all four C02 frames, and run
   `Паттерны` with no page type;
2. expect exactly two rows in `База` and none in `Раздел`;
3. row focus must resolve to the two FAIL component roots, never their wrapper
   frames or section `12161:122197`;
4. PASS controls must be classified compliant;
5. coverage has zero unclassified and duplicate evaluations;
6. ten identical runs have one stable result hash;
7. `/v1/validate/predicates` must not start a Codex process.

Field result: PASS on 2026-08-25. Audit
`apollo-1096330610570928879-1787686579157-cdcmesp1` evaluated the four
published roots from suite `12386:54001`:

- ButtonsGroup PASS `12384:53953` was compliant for `HUG/HUG`;
- ButtonsGroup FAIL `12384:54003` was the only ButtonsGroup sizing violation
  for `FILL/HUG` and received exact root focus;
- BackgroundPlateSlot PASS `12384:54030` was compliant for `FILL/HUG`;
- BackgroundPlateSlot FAIL `12384:54034` was the only BackgroundPlateSlot
  sizing violation for `HUG/HUG` and received exact root focus.

The UI rendered exactly two confirmed errors in `База`, cited the two package
`rules.json` sources and rendered no page-specific findings. All 48
evaluations reached a terminal classification (`30` compliant, `2`
violations, `16` not applicable), with zero unclassified or duplicate
evaluations. The ten-run gate was stable with result hash
`05ff628c50ce230edd3426a80bb99c441737f4213e46da300672e3e877c94d83`.
This proves that one generic `sizing` compiler applies independent contracts
from two component packages without component-specific evaluator code.

### CUTOVER C03 — one generic baseline contour, second component package

Purpose: prove that `kind=baseline` is not a TitleView-specific opacity check.
The existing generic compiler compares arbitrary declared fact pairs; this
case supplies BackgroundPlate radius and its effective baseline exclusively
from the active component `rules.json`.

Source:
`BackgroundPlate/rules.json#component:web-corp.background-plate.radius-is-fixed-by-component-baseline`.

- Suite `12389:54001`.
- PASS frame `12389:54002`, target `12389:54004`: radius `16`, no radius
  override, effective baseline derived as `16`.
- FAIL frame `12389:54005`, target `12389:54007`: exact radius override
  `16 → 24`; the host WIP diff must supply both values.
- Both fixtures retain canonical `FILL/HUG` sizing, all four Spacing-bound
  paddings and the canonical fill, so C02 and P05 cannot contaminate C03.
- Expected finding: exactly one
  `component:web-corp.background-plate.radius-is-fixed-by-component-baseline`
  violation titled `Изменено скругление BackgroundPlate`, focused on
  `12389:54007` and rendered as `16 → 24`.

Field gate:

1. select suite `12389:54001` and run `Паттерны` with no page type;
2. expect exactly one row in `База` and none in `Раздел`;
3. PASS is compliant; FAIL is the only violation and focuses its instance
   root, never the wrapper frame or section `12161:122197`;
4. coverage has zero unclassified and duplicate evaluations;
5. ten identical runs have one stable result hash;
6. `/v1/validate/predicates` must not start a Codex process.

Field result: PASS on 2026-08-25. Audit
`apollo-1096330610570928879-1787687577018-fbnxs238` selected suite
`12389:54001` and evaluated the two published BackgroundPlateSlot roots:

- PASS `12389:54004` was compliant for radius `16 == 16`;
- FAIL `12389:54007` was the only violation for radius `24 != 16` and
  received exact instance-root focus.

The UI rendered exactly one confirmed error in `База`, preserved the
authoritative `16 → 24` evidence and cited the pinned revision-2
`BackgroundPlate/rules.json` source. All 32 evaluations reached a terminal
classification (`11` compliant, `1` violation, `20` not applicable), with
zero unclassified or duplicate evaluations. The ten-run gate was stable with
result hash
`08f3fce7c0bc77663e41e5b61458285fc438a94ba8287d72d9a5a65a5bf001b2`.
This proves that the generic `baseline` compiler applies a second fact type
from a second component package without component-specific evaluator code.

### CUTOVER C04 — generic binding-set on CorporateContent Section

Purpose: prove that `kind=binding-set` is not specific to BackgroundPlate
padding. The same compiler now checks a non-padding property in another
component package: `[D] Section.itemSpacing` must be bound to the `Grid/Gutter`
variable. The numeric value alone is deliberately insufficient.

Source:
`CorporateContent/rules.json#component:web-corp.corporate-content.section-gutter-required`.

- PASS: published `[D] Section` with `itemSpacing=24` bound to `Grid/Gutter`.
- FAIL: a clone with the same `itemSpacing=24`, but without a variable binding.
- UNKNOWN: `itemSpacing` carries a variable id whose variable metadata cannot
  be resolved.
- NOT APPLICABLE: the same evidence outside desktop scope or a different
  component from the CorporateContent package.
- Expected finding: exactly one
  `component:web-corp.corporate-content.section-gutter-required.gutter`
  violation, focused on the FAIL `[D] Section` instance root.

Field gate:

1. select the C04 PASS/FAIL suite and run `Паттерны` with no page type;
2. expect exactly one row in `База` and none in `Раздел`;
3. both fixtures must preserve the same numeric `itemSpacing`; only the FAIL
   binding differs;
4. PASS is compliant; FAIL focuses its exact `[D] Section` root;
5. coverage has zero unclassified and duplicate evaluations;
6. ten identical runs have one stable result hash;
7. `/v1/validate/predicates` must not start a Codex process.

Field result (2026-08-25): passed on suite `12393:54003`. The engine returned
one violation focused on FAIL root `12394:54011`; PASS root `12393:54006` was
classified as compliant. Both roots preserved `itemSpacing=24`, while only
PASS resolved the `[D] Grid & Cols / Grid/Gutter` variable binding. The result
contained 21 evaluations (`19` not applicable, `1` compliant, `1` violation),
zero unclassified or duplicate evaluations, and a stable ten-run result hash
`6691506c0c7b3ed69bab0fc8b7eeb166fc97dbd3e35c4471e269bb9c20ecab88`.

### CUTOVER C05 — source-driven distance for form first-level blocks

Purpose: prove that the generic `distance` contour can replace the former
hand-written form-spacing runtime rule. The active pattern document owns the
selector, both fact references, expected distance, axis, tolerance, page scope
and UI presentation. Snapshot v2 only prepares the two measured bounds.

Source:
`patterns/p_form-construction-rules.md#rule:forms.construction-rules.block-spacing.first-level`,
revision `4`, `kind=distance`.

- Suite `12395:54015`.
- PASS frame `12395:54016`: two adjacent first-level BackgroundPlate blocks
  with a measured vertical gap of `24 px`.
- FAIL frame `12395:54021`: the same structure with a measured vertical gap of
  `12 px`.
- Exact FAIL focus `12395:54025`: the second BackgroundPlate block, never the
  fixture frame, suite or section.
- UNKNOWN unit case: one required bounds fact is absent or malformed.
- NOT APPLICABLE unit case: channel/page type is outside `desktop|mobile-web`
  plus `pageType=form`, or the selected node has no
  `composition.previousFormFirstLevelBlock.bounds` relation.
- Expected finding: exactly one
  `rule:forms.construction-rules.block-spacing.first-level` violation with
  observed text `Вертикальный отступ между соседними подложками: 12 px.`

Field gate:

1. select suite `12395:54015`, choose page type `Форма` and run `Паттерны`;
2. expect exactly one C05 row in `Раздел` and no C05 row in `База`;
3. PASS is compliant; FAIL is the only violation and focuses
   `12395:54025`;
4. the finding source is the published pattern rule at revision `4`, not a
   legacy runtime registration;
5. coverage has zero unclassified and duplicate evaluations;
6. ten identical runs have one stable result hash;
7. `/v1/validate/predicates` must not start a Codex process.

Field result: PASS on 2026-08-25. Audit
`apollo-1096330610570928879-1787691138010-qt4fmio4` selected suite
`12395:54015` with page type `form`. PASS target `12395:54020` was compliant
for a measured vertical distance of `24 px`; FAIL target `12395:54025` was the
only violation for a measured distance of `12 px` and received exact target
focus. The UI rendered the finding only in the page-specific `Раздел` table as
`Вертикальный отступ между соседними подложками: 12 px.` and contained no
unresolved `{{measured}}` placeholder.

The published revision-4 pattern rule and checksum
`ebff5cb1318c4afb87bb80dcbcf90ed6888db59522a0458f0e62c713e7d1cfc0` were
used. All 34 evaluations reached a terminal classification (`24` not
applicable, `9` compliant, `1` violation), with zero unclassified or duplicate
evaluations. The ten-run gate was stable with result hash
`0a4e1fa99f67a33ae404eed78a4f9f1292056e6e8318be003bfc2c5ee79eb138`.

### CUTOVER C06 — source-driven inner geometry for form blocks

Purpose: replace both hand-written RuleIR projections of form Rule 5 with two
source-owned universal contours while preserving the already field-proven P17
and P18 geometry facts.

Source:
`patterns/p_form-construction-rules.md#rule:forms.construction-rules.inner-padding-standard`.

Title-to-content contour:

- rule id
  `rule:forms.construction-rules.inner-padding-standard.title-to-content`;
- generic kind `distance`, vertical expected gap `24 px`;
- PASS fixture `12256:11380`, content `I12256:11382;136846:8891;12256:11386`;
- FAIL fixture `12256:11481`, exact focus
  `I12256:11483;136846:8891;12256:11487`, measured gap `40 px`.

Content-insets contour:

- rule id
  `rule:forms.construction-rules.inner-padding-standard.content-insets`;
- generic kind `derived-geometry`, four atomic expectations of `32 px`;
- PASS fixture `12268:11163`, root `12268:11165`, measured
  `{top:32,right:32,bottom:32,left:32}`;
- FAIL fixture `12268:11279`, exact focus `12268:11281`, measured
  `{top:32,right:48,bottom:32,left:32}`.

Field gate:

1. run both existing P17 and P18 PASS/FAIL pairs with page type `Форма`;
2. expect exactly one violation per rule, both only in `Раздел`;
3. P17 focuses its first content node and renders measured `40 px`;
4. P18 focuses its BackgroundPlateSlot root and retains all four measured
   inset facts in the predicate trace;
5. PASS controls remain compliant; coverage has zero unclassified and
   duplicate evaluations;
6. ten identical runs have one stable result hash per request;
7. both manifest entries cite the pinned pattern checksum and no Codex process
   is started.

Field result: PASS on 26 August 2026.

P17 was field-proved by source report
`apollo-1096330610570928879-1787726374111-a8xrctz0`. The PASS fixture measured
`24 px` and remained compliant; the FAIL fixture measured `40 px`, produced one
page-specific violation in `Раздел`, and focused the exact content node
`I12256:11483;136846:8891;12256:11487`. The ten-run gate was stable with result
hash `bd731b10f1c12456d5fb7b32fd1ad29ead8a8906d9c09ea4b3c1925698e68d25`.

P18 was field-proved by source report
`apollo-1096330610570928879-1787726398221-3mzkjztg`. The PASS fixture measured
`{top:32,right:32,bottom:32,left:32}` and remained compliant; the FAIL fixture
measured `{top:32,right:48,bottom:32,left:32}`, produced one page-specific
violation in `Раздел`, and focused the exact root `12268:11281`. The atomic
right-inset trace recorded expected `32`, actual `48`, difference `16`. The
ten-run gate was stable with result hash
`a9e556830c91329216230f007ec449e776dee7ac36bded6ac6dc4ea8f0be8e44`.

Both reports resolved the rules from
`design-system_ab/patterns/p_form-construction-rules.md` with source checksum
`1b8afbc937eae8e48a5e99216c5946d675bbf7f0d10083e09c2438cf2f1b10a8`.
There were zero unclassified and zero duplicate evaluations in both requests.
The fixtures still contain unrelated `База` findings from deliberately raw
BackgroundPlateSlot token bindings and sizing, so fixture cleanup remains a
separate hygiene task and does not affect the C06 verdict.

### CUTOVER C07 — source-driven fact domain for TitleView Medium

Purpose: replace the hand-written RuleIR factory for form Rule 9 without
changing the field-proven P16 snapshot fact or exact focus behavior.

Source:
`patterns/p_form-construction-rules.md#rule:forms.construction-rules.title-medium-one-per-plate`.

- generic kind `fact-domain`;
- source-declared actual fact
  `composition.formFirstLevelSurface.mediumTitlePosition`;
- source-declared allowed values `single` and `first`;
- PASS fixture `12252:11338`, exact title
  `I12252:11343;136846:8891;12252:11346`;
- FAIL fixture `12252:11442`, exact offending second title
  `I12252:11447;136846:8891;12252:11453`.

Acceptance gate:

1. PASS remains `compliant` with actual `single`;
2. the first FAIL-fixture title remains `compliant` with actual `first`;
3. only the second FAIL-fixture title is `violation` with actual `last`;
4. the rendered row is page-specific and appears only in `Раздел`;
5. source path, checksum, revision `2` and presentation come from the pattern;
6. coverage has zero unclassified and duplicate evaluations;
7. ten identical runs have one stable result hash and no Codex process starts.

Field result: PASS on 26 August 2026. Source report
`apollo-1096330610570928879-1787729676526-7ar4em6z` selected both canonical
fixtures. PASS title `I12252:11343;136846:8891;12252:11346` was `compliant`
with actual `single`. In the FAIL fixture, the first title
`I12252:11447;136846:8891;12252:11451` remained `compliant` with actual
`first`; only the second title `I12252:11447;136846:8891;12252:11453` was a
`violation` with actual `last`, and its subject, focus and rendered finding all
resolved to that exact TitleView. The row was page-specific and rendered only
under `Паттерны страницы` / `Раздел` with the source-owned presentation.

The report used revision `2`, source path
`design-system_ab/patterns/p_form-construction-rules.md` and checksum
`68fe2b11cbaf3c5c480d8c3c65446866aa161f011bd91a2b56f39fdb3f39b827`,
which matches the published file. Coverage had zero unclassified and duplicate
evaluations. The ten-run gate was stable with result hash
`a198c78d991dfe433f7ee43f29334b11b38d9724d5d5259a741349b8a9f37a75`.
The fixture also exposes unrelated component and C06 findings; they do not
change the C07 verdict and remain part of fixture-hygiene cleanup.

### CUTOVER C08 — source-driven distance before primary actions

Purpose: replace the hand-written P20 RuleIR factory with the generic
source-owned `distance` contour while preserving the already proven semantic
relation to the previous second-level form content.

Source:
`patterns/p_form-construction-rules.md#rule:forms.construction-rules.block-spacing.second-level-actions`.

- generic kind `distance`;
- source-declared target `composition.previousFormContent.bounds`;
- source-declared second-level gate
  `composition.previousFormContent.hierarchyLevel=second-level`;
- source-declared expected distance `32 px` on the vertical axis;
- existing real FAIL page `10560:28609`, exact primary-action focus
  `10560:28637`, previously measured `48 px`.

Acceptance gate:

1. a canonical `32 px` boundary remains `compliant`;
2. the existing `48 px` boundary remains a single `violation`;
3. subject, focus and rendered row resolve to the exact primary action/group;
4. the rendered row is page-specific and appears only in `Раздел`;
5. source path, checksum, revision `3` and presentation come from the pattern;
6. coverage has zero unclassified and duplicate evaluations;
7. ten identical runs have one stable result hash and no Codex process starts.

Field result: PASS on 26 August 2026. Source report
`apollo-1096330610570928879-1787731738791-j9veqf7n` proved the negative
control on selection `10560:28609`. The source-driven revision `3` measured
`48 px` against expected `32 px`, emitted exactly one P20 violation and focused
the exact primary-action node `10560:28637`. The rendered row used the
source-owned presentation and appeared only under `Паттерны страницы` /
`Раздел`.

The report cited source checksum
`163809ade36747bf1d8b1b3cdf694f20958304d9aecad4c1e9e006d61727c2b0`,
which matches the published file. Coverage had zero unclassified and duplicate
evaluations. The ten-run gate was stable with result hash
`38d6681e971de220fb626f1fcc249594d8d82ad66ff56774af5f8cc5b1d56292`.
The canonical control was field-proved by source report
`apollo-1096330610570928879-1787732098905-tyvx5xg6`. It measured exactly
`32 px` on the same action node `10560:28637`, classified P20 as `compliant`
and emitted no P20 finding. The report retained revision `3`, the same
published checksum, zero unclassified/duplicate evaluations and a stable
ten-run result hash
`1e85718eaaa38c7e1f026da1c254c7ce59c534295f71544e6a494ef74e7fb897`.

### CUTOVER C14 — source-driven unique labels per tab level

Purpose: prove that a component package can project arbitrary graph facts into
the existing `unique` collection predicate without a component-specific
runtime evaluator.

Source:
`JSONS/web/components/web-corp/TabsView/rules.json#rules/component:web-corp.tabs-view.labels-are-unique-within-level`,
revision `2`, `kind=query-unique`.

- the source selector targets published TabsPrimary and TabsSecondary level
  owners by stable keys;
- the source query reads visible descendant `TEXT` nodes named `Label` and
  projects `text.characters`;
- the predicate engine evaluates each level owner independently;
- PASS values such as `["Обзор", "История"]` are compliant;
- FAIL values such as `["Обзор", "Обзор"]` produce one violation focused on
  the exact TabsPrimary or TabsSecondary owner;
- UNKNOWN occurs when a selected Label exists but `text.characters` is
  unavailable; outside the declared platform scope the rule is NOT APPLICABLE.

Field fixture:

1. use the existing TabsView pair in section `12422:83764`;
2. keep every visible label unique in the first TabsView;
3. in the second TabsView, set two labels on the same Primary or Secondary
   level to the same text, for example `Обзор`;
4. select only section `12422:83764` and run `Паттерны`;
5. expect exactly one C14 error in `База`, focused on the failing level owner;
6. the PASS level remains compliant; coverage has zero unclassified or
   duplicate evaluations; the ten-run result hash is stable;
7. `/v1/validate/predicates` must not start Codex.

Field result: PASS on 26 August 2026. The PASS report
`Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_15-54-38_predicates.json`
evaluated the published Primary/Secondary owners in selected section
`12422:83764` and classified all label collections as `compliant`. The FAIL
report `Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_15-55-42_predicates.json`
classified only TabsSecondary owner `I12425:91133;57470:17494` as a C14
violation for values `["TabSecondary 1", "TabSecondary 2", "Обзор", "Обзор"]`.
The finding stayed in `База`, focused that owner, used revision `2` and source
checksum `0ba15eaae89e9158f7fc31126aea4b43671cff7f7a5a7a7eb4245560a3bc968d`,
reported zero unclassified/duplicate evaluations, and passed ten-repeat
stability with result hash
`ba3c9d88601a12813df03e89e966b6a1b855d048832f9d6fbde70070f21993b1`.
The independent `SingleIcon=True` violation in the same selected section is a
pre-existing C13 fixture and is not part of C14.

Presentation follow-up: revision `3` is published with checksum
`9b7ea79b7aae5ccd8c5ec2dbd533e802e1c741dc8c8a61d0ae4d991b474e0de0`.
The generic UI template token `{{duplicates}}` renders only repeated entries
while the predicate trace retains the complete `actual` collection for debug.
For the field FAIL above the expected observed copy is now
`На одном уровне повторяются названия табов: Обзор, Обзор.` UI smoke report
`Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_16-18-11_predicates.json`
confirmed that exact copy, exact focus on TabsSecondary owner
`I12425:91133;57470:17494`, zero unclassified/duplicate evaluations, source
revision `3` with the checksum above and ten-repeat stability with result hash
`621a4d6bac768ae76ad20639c03635569e6fcace6c0bae7211b620b6e4382699`.

### CUTOVER C15 — conditional component-property domain

Purpose: prove that a component package can declare a dependency between two
ordinary public component properties without a component-specific evaluator.

Source:
`JSONS/web/components/web-corp/CardImage/rules.json#rules/component:web-corp.card-image.xs-active-only`,
revision `2`, `kind=fact-domain`.

- selector: visible public `web-corp.card-image` instance roots with
  `component.properties.Size=24x16`;
- actual fact: `component.properties.State`;
- allowed values: `Active`;
- scope: desktop and mobile-web;
- source-owned action: set `State=Active` or select a size that supports the
  intended state;
- the shared compiler and snapshot adapter contain no CardImage branch.

Service contour:

1. PASS — `Size=24x16, State=Active` is compliant;
2. FAIL — `Size=24x16, State=Inactive` is a violation with exact CardImage-root
   focus and observed value `Inactive`;
3. NOT APPLICABLE — `Size=44x28, State=Inactive` is outside the rule selector;
4. UNKNOWN — already covered by the generic `fact-domain` four-state fixture
   when the declared actual fact is unavailable.

Figma field contour:

1. place a published CardImage `Size=24x16, State=Active` as PASS;
2. place a published CardImage `Size=24x16, State=Inactive` as FAIL;
3. place a published CardImage `Size=44x28, State=Inactive` as the control;
4. select only their test section and run `Паттерны`;
5. expect exactly one C15 error in `База`, focused on the FAIL CardImage;
6. require zero unclassified/duplicate evaluations and a stable ten-run hash;
7. `/v1/validate/predicates` must not start Codex.

Field result: passed on section `12429:92462`. Report
`Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_16-43-14_predicates.json` contains
exactly one confirmed error on FAIL node `12429:92281`, with observed
`State=Inactive`, expected `State=Active` and exact root focus. PASS node
`12429:92261` is compliant. Control node `12429:92433`
(`Size=44x28, State=Inactive`) is outside the conditional selector and creates
no finding. Coverage has zero unclassified and duplicate evaluations. Ten
repeated evaluations are stable with result hash
`f34110361a87a7cac238c30299635e6da99956319ca87ecf96219f9cabd756e2`.

### CUTOVER C16 — generic paint baseline

Purpose: prove that the shared `baseline` contour compares canonical fill
identity against the effective baseline of a published component without a
component-specific evaluator.

Source:
`JSONS/web/components/web-corp/Onboarding Tooltip [D]/rules.json#rules/component:web-corp.onboarding-tooltip.visuals-follow-effective-baseline`,
revision `2`, `kind=baseline`.

- actual fact: `appearance.fill.value`;
- expected fact: `baseline.effective.appearance.fill.value`;
- the snapshot preserves token/style/raw-paint identity, binding collection,
  owner, selected variant and baseline-reference origin;
- scope: desktop;
- PASS copies the observed fill into baseline only when Figma reports no direct
  fill override;
- FAIL uses an exact Apollo effective-baseline diff;
- UNKNOWN is emitted when Figma reports a direct fill override but Apollo has no
  exact baseline diff.

Figma field contour:

1. place a published Onboarding Tooltip as PASS and leave its visible internal
   fills unchanged;
2. duplicate it as FAIL and change the token of one visible internal filled
   layer to a different token;
3. select only the fixture section and run `Паттерны` on desktop;
4. expect exactly one C16 error in `База`, focused on the modified internal
   layer and showing canonical baseline token -> actual token;
5. require zero unclassified/duplicate evaluations and a stable ten-run hash;
6. `/v1/validate/predicates` must not start Codex.

Field result: PASS on 26 August 2026. Report
`Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_17-19-43_predicates.json` evaluated
ten visible filled layers on the unchanged Onboarding Tooltip as `compliant`.
The FAIL instance contained two intentional fill overrides and produced exactly
two violations: Content changed from `base-bg/primary` to
`base-bg/secondary`, and Title changed from `text/primary` to
`text/positive`. Subject, focus and rendered finding resolve to the exact
Content and Title layers. Both rows remain general component findings in
`База`.

The report used source revision `2`, path
`design-system_ab/JSONS/web/components/web-corp/Onboarding Tooltip [D]/rules.json`
and checksum
`f587137f3b1b7d131cb3bd1f20ef676552712b7f7511f50917de8f70f5fc9ae5`.
Coverage has zero unclassified and duplicate evaluations. The ten-run gate is
stable with result hash
`24ac1290f9a57eccaa55786885f5aceab6dd9762e06385d913874e4d486e0835`.

### CUTOVER C20 — complete BackgroundPlate package

Purpose: field-prove the complete execution closure of the BackgroundPlate
package without component-specific runtime checks.

Source:
`JSONS/web/components/web-corp/BackgroundPlate/rules.json`, 27/27 source rules
classified exactly once. The field wave targets the newly executable branches;
the previously proven radius and Level-2 underlay contours remain regression
controls. BackgroundPlateSlot padding and sizing are deliberately absent from
the executable package.

Build isolated PASS/FAIL pairs:

1. Level 2 Type: PASS `Primary`; FAIL `Secondary`.
2. Colored token: PASS tokenized fill; FAIL raw fill with no binding.
3. Colored paint state: PASS fill without stroke; FAIL the same Colored plate
   with a visible stroke.
4. Border paint state: PASS tokenized stroke without fill; FAIL the same
   Border plate with any visible fill.
5. Primary paint baseline: PASS unchanged fill/stroke; FAIL a manual fill or
   stroke override with an exact effective-baseline diff.
6. Opacity baseline: PASS unchanged opacity; FAIL a manual opacity override.
7. Slot levels: PASS ordinary content or Level 2 inside BackgroundPlateSlot;
   FAIL nested Level 0 or Level 1.

Run `Паттерны` on each pair independently. Each FAIL must create one source-
owned row in `База`, focus the exact invalid component/layer, leave PASS
compliant, produce zero unclassified/duplicate evaluations and keep one stable
ten-run hash. `/v1/validate/predicates` must not start Codex.

Desktop field result: PASS on 27 August 2026. Report
`Alexey-Kukhta-CORP-Lead-Designer_27-08-2026_14-10-24_predicates.json` evaluated
38 compiled rules over 84 evaluations: 48 compliant, 29 not applicable,
6 violations and 1 not evaluable. The six violations were the intended raw
Colored fill, visible Colored stroke, visible Border fill, Primary fill
override, opacity override and nested Level 1. The Level-2 fixture did not
publish `component.properties.Type`, so the engine correctly returned
`not-evaluable` instead of inventing a verdict. Coverage had zero unclassified
or duplicate evaluations. The ten-run result was stable with hash
`73bb1802999cef9959817900adc09e24efaee4329e7d8b17e4d4fc4bdbaedd72`.

### CUTOVER C21 — FilterCompanySelect_Single

Purpose: field-prove that a larger component package can combine root identity,
page context, variant policy and effective-baseline checks without adding a
component-specific predicate implementation.

Source:
`JSONS/web/components/web-corp/FilterCompanySelect/rules.json`, 32/32 source
rules classified exactly once: 4 predicates, 5 delegations, 4 policies and
19 context-only routes.

Build isolated fixtures:

1. Public root: PASS `[D] FilterCompanySelect_Single`; FAIL a service component
   such as `[D] CompactTag` placed as the selection root.
2. Platform: PASS the public root on desktop; FAIL the same public root in a
   mobile-web snapshot.
3. Legacy property: PASS `ShowFirstCompany=False`; FAIL
   `ShowFirstCompany=True`.
4. Root baseline: PASS the unchanged root; FAIL one manual root radius change
   with an exact effective-baseline diff. Width must remain allowed.

Desktop fixture section:
`https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=12485-55876`.
It contains the canonical Single root, the allowed 480 px width control,
`ShowFirstCompany=True`, a 50% root opacity override, the internal CompactTag
used as a standalone root and a 20 px root-radius override. The exact new fail
targets are `12516:55051` (CompactTag) and `12516:55063` (radius). The
mobile-web case remains a separate context run because it cannot be represented
truthfully inside the desktop fixture section.

Run `Паттерны` on every fixture independently. Each FAIL must produce one row
in `База`, focus the exact root, preserve zero duplicate/unclassified
evaluations and pass the ten-run repeatability gate. The test must also confirm
that `/v1/validate/predicates` does not start Codex.

Field result: PASS on 27 August 2026. Report
`Alexey-Kukhta-CORP-Lead-Designer_27-08-2026_15-33-40_predicates.json` evaluated
40 compiled rules over 61 evaluations and returned exactly four findings:
`ShowFirstCompany=True` on `12485:55683`, opacity `0.5` on `12485:55791`, the
standalone internal CompactTag on `12516:55051` and radius `20` on
`12516:55063`. Every finding focused the exact invalid instance. Canonical and
480 px width controls remained compliant. Coverage had zero unclassified or
duplicate evaluations; the ten-run result was stable with hash
`2c5ebd196e236060c3613954a080a48bad08a1430524ce30aaa73848de31ea1e`.

Eight untested members of the root baseline set were represented as diagnostic
`not-evaluable` entries on the selected Section because this fixture only
published exact baseline evidence for opacity and radius. They produced no UI
finding and do not invalidate the C21 contour gate, but the selection-root
fallback should eventually report `not-applicable` when no component target is
matched instead of attaching unknown evidence to a Section.

Mobile-web field result: PASS on 27 August 2026. Report
`Alexey-Kukhta-CORP-Lead-Designer_27-08-2026_15-40-06_predicates.json` selected
the complete cases frame in `MobileWeb` context. It contained five public
FilterCompanySelect roots, so the engine correctly produced five independent
`desktop-only` violations focused on `12485:55330`, `12485:55606`,
`12485:55683`, `12485:55791` and `12516:55063`. The internal CompactTag did not
receive this public-root platform rule. Coverage had zero unclassified or
duplicate evaluations; the ten-run result was stable with hash
`cd3f7c2e99b4fffbb48e721eab21080af08e04d87286d299c990d892a7b2eeea`.
C21 is closed.

### CUTOVER C22 — AccountSelect

Purpose: prove that a large component package can reuse public ownership,
collection invariants and effective-baseline predicates while keeping every
remaining source rule explicitly delegated, classified as policy, or blocked
by named missing facts.

Source: `JSONS/web/components/web-corp/AccountSelect/rules.json`, 41/41 rules
closed exactly once: 4 predicates, 5 delegations, 9 policy rules and 23
context-only routes. The package adds no AccountSelect branch to the runtime.

Fixture section:
`https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=12523-55057`.

Cases:

1. `C22-01` — canonical public AccountOptionListContent, PASS.
2. `C22-02` — standalone internal AccountItem, one public-root FAIL.
3. `C22-03` — all visible AccountItem rows use `Type=Sum`, PASS.
4. `C22-04` — one row uses `Type=Number` while peers use `Sum`, one uniformity
   FAIL focused on the public owner.
5. `C22-05` — one exact AccountItem radius override `0 → 20`, one baseline FAIL
   focused on that row.
6. `C22-06` — one row uses forbidden `Type=SwapMe`, one collection-domain FAIL;
   the delegated source rule must not create a duplicate.

The package now owns a generic `platform-match` contour. The release loader
reads `platform` from each concrete `contract.generated.json` entry, the
snapshot exposes it as `component.platform`, and the contour compares that fact
with `page.context.platform`. The runtime contains no AccountSelect key or
identity branch. `publicRootOnly=true` keeps one finding on the published root
instead of repeating it for nested mobile components.

Run the complete section with both platform contexts and prove the full matrix:

1. `[D]` + Desktop: PASS;
2. `[M]` + MobileWeb: PASS;
3. `[M]` + Desktop: one platform FAIL on the `[M]` public root;
4. `[D]` + MobileWeb: one platform FAIL on the `[D]` public root.

Missing or unsupported platform evidence must remain `not-evaluable` or
`not-applicable`; it must never be guessed from a component name. The complete
section result must preserve exact focus, zero duplicate and unclassified
evaluations, a stable ten-run hash and no Codex process.

Fixture discovery also exposed an authority mismatch worth preserving: the
contract lists desktop key `86748eec7d81787f8306d2e57afac9f4328128cf`, but
Figma cannot import that key. The currently available public root uses key
`1043a9208a949b1af3f708637de5fd13721a4519`. Platform-specific public keys must
therefore be resolved from current published availability rather than inferred
from identity alone; the mismatch belongs in the design-system review queue.
The fixture section and run configuration must always state the resolved
platform explicitly; a test label is not evidence of platform identity. The
contract platform attached to the concrete published key is the normative
machine-readable fact.

Field result: PASS on 27 August 2026. The Desktop mismatch run
`Alexey-Kukhta-CORP-Lead-Designer_27-08-2026_17-40-10_predicates.json`
classified all five published mobile roots as platform violations with exact
root focus, zero duplicate/unclassified evaluations and stable ten-run hash
`c1ae196dd92f8a2392c7aa5e4cabbde749df9753f9a894a6925da9cd0811e8e2`.
The MobileWeb control run
`Alexey-Kukhta-CORP-Lead-Designer_27-08-2026_17-44-38_predicates.json`
classified the same five platform evaluations as compliant (`mobile-web ==
mobile-web`). It preserved the intended internal-root and two collection
violations and exposed the exact AccountItem radius override `0 → 20` once the
wrong-channel conflict was removed. Coverage again had zero unclassified or
duplicate evaluations; the ten-run result was stable with hash
`f7a0405560074c4f52fff1a649c738e41ae821fcb7323cd94d8be670f9b45bcc`.
C22 is closed.

### CUTOVER C23 — Core IconView boundary

Purpose: field-prove the first reusable Core boundary package. `IconView`
defines stable public/internal component families and owns its effective
visual/layout baseline; a containing component owns contextual permissions for
the `Content` slot. The runtime must not contain an `IconView` name or key
branch.

Source: `JSONS/web/components/web-core/core/IconView/rules.json`, 5/5 manual
rules closed exactly once: 2 predicates, 2 classification/allow policies and 1
context-only route. The two predicates compile into one public-root assertion
and 9 atomic effective-baseline assertions.

Build isolated PASS/FAIL/UNKNOWN fixtures:

1. Public root: PASS a published `IconView`; FAIL `Content`, `Border` or
   `Shape` placed as the selection root.
2. Component property: change public `Size`; it remains a component-setting
   classification and must not expand into derived layer findings.
3. Effective baseline: PASS an unchanged IconView; FAIL exactly one manual
   root or nested-layer change for radius, opacity or a supported layout fact.
   Focus the exact changed node.
4. Missing evidence: keep the direct override but omit the exact baseline;
   classification must be `not-evaluable`, never a violation.
5. Content replacement: retain the fact for a host rule, but do not declare it
   allowed or forbidden from the Core package alone.
6. Public paint: change the token/color of `Border.stroke`,
   `Shape/BgColor.fill` and `Content/PaintMe.fill`. None of these changes may
   become a Core baseline violation. A host may reject one only through its own
   active contextual rule.

The first Figma pair should use a standalone `IconView Size=48` control and a
copy with one radius change `4 → 8`. Add one separately placed `Content`
instance if the library permits importing its published key. Run `Паттерны`
with Desktop context. Expected UI: two rows only in FAIL — the exact radius
override and the standalone internal part. The `Size`, public paint changes and
unchanged controls must stay clean. Require zero unclassified/duplicate
evaluations, a stable ten-run hash and no Codex process.

C23 field result: PASS on 27 August 2026. The final run
`Alexey-Kukhta-CORP-Lead-Designer_27-08-2026_18-32-24_predicates.json`
produced exactly six intended baseline violations: four root paddings, the
internal `Shape` radius `6 → 10` and `Content` opacity `1 → 0.2`. The radius
finding retained the exact Figma focus
`I12536:143140;448:17287`. Public paint changes to the border, surface and icon
remained allowed. Coverage had zero unclassified and zero duplicate
evaluations; ten repeated evaluations were stable with hash
`6838ec9fbf61082a211fd497269eb2acc8c02ce0a628c43e1c695e486bef1929`.
C23 is closed.

Field follow-up on 27 August 2026 exposed a general evidence-boundary defect:
Figma reports the internal `Shape` mask as `BOOLEAN_OPERATION`. The evidence
collector used to drop every boolean/vector/shape node as decorative before
the predicate snapshot was built. The WIP baseline report still contained the
exact `Shape radius 6 → 10` change, but the semantic graph did not contain its
node id, so the executable baseline rule had no subject to evaluate.

The collector invariant is now: a visible decorative node remains excluded
only while it has no exact baseline change. Every node id referenced by the
baseline change set is force-included with its real Figma type, exact id,
component owner and relative path. Unchanged decorative siblings remain
excluded. This is intentionally independent of `IconView`, layer names and
component keys; it applies to changed boolean masks, vectors and other
decorative primitives in every component. Regression coverage proves that a
changed `BOOLEAN_OPERATION/Shape` is present while an unchanged `VECTOR`
sibling is absent.

### Field follow-up — nested Status fill under preset

Purpose: verify a host-dependent baseline rule on a non-instance descendant.
The changed `Label` belongs to the `web-core.status` contour, while the
allow/deny context belongs to its outer StatusPreset or PropertyPreset host.

Source:
`JSONS/web/components/web-corp/Status & Property/rules.json#rules/component:web-corp.status-property.fill-follows-effective-baseline`,
revision `2`, `kind=baseline-set`.

Required field contour:

1. unchanged StatusPreset is the PASS control;
2. recolor the nested Status `Label` from `text/info` to another token;
3. expect one error focused on the exact changed Label, with the canonical
   baseline and actual token names;
4. verify that `PropertyPreset Color=Custom` does not receive the same error;
5. require zero duplicate evaluations and ten-run hash stability;
6. `/v1/validate/predicates` must not start Codex.

Field debugging on 27 August 2026 showed that the original WIP fact was
inverted, not valid collection evidence. The StatusPreset catalog correctly
published `static_text_inverted/primary`, but the authored host path used the
technical instance name `🔩 Label` while Figma exposed `Label`. Recursive
materialization therefore appended the standalone Label baseline under a
second path and compared the actual node with `text/info`.

The general runtime invariant is now: align the complete authored host
reference to actual nested-instance identities before any recursive expansion.
Every later baseline must reuse that canonical occurrence key, then merge
properties through `referencePropertyOwners`. A technical/display-name change
must never create two effective-baseline leaves. Regression coverage uses the
real StatusPreset and Core Status catalogs and proves both directions:

- canonical Approved/Contrast `static_text_inverted/primary` produces no fill
  diff;
- a real change to `text/info` produces exactly one diff whose reference value
  remains `static_text_inverted/primary`.

The field rerun passed and is the canonical UI/report evidence for this
invariant.
