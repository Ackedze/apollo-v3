# Predicate source to RuleIR mapping

This document records the reviewed, fail-closed lowering from authoritative
design-system source fields to `apollo.rule-ir.v1`. A mapping is production
eligible only when identity, applicability, facts, assertion, authority and
source trace can all be compiled without interpreting prose.

## Wave 1: composition-contract.json

Pilot source:
`design-system_ab/JSONS/web/components/web-corp/ButtonGroup [D]/composition-contract.json`.

The proxy discovers this file through the release loader, pins its SHA-256
checksum, and passes the normalized contract to the generic composition
compiler. The compiler contains no ButtonsGroup identity or rule id.

| Source field | RuleIR target | Contract |
| --- | --- | --- |
| `schemaVersion` | compiler selection | Must equal `apollo.composition-predicate-contract.v1`. |
| `ruleKind` | authority gate | Must equal `design-rule`. |
| `authority.status` | `authority.status` | Must equal `active`. |
| `authority.provenance` | `authority.provenance` | Required non-empty string. |
| `authority.revision` | `revision` | Used unless a constraint supplies its own integer revision. |
| `scope` | `scope` | Copied as structured applicability; prose is ignored. |
| `match.hostComponentIdentities[]` | host selector and owner selector | Compiles to `component.identity one-of` and `ownership.owner.component.identity one-of`. Names are documentation only. |
| `select.nestedComponentIdentities[]` | nested selector | Compiles to `component.identity one-of`; only visible instance facts enter the snapshot collection. |
| `facts.visibleMemberNodeIds` | count fact | Supplies the actual collection for `countBetween`. |
| `facts.siblingPropertyValuesPrefix` | ordered sibling fact | Combined with the declared property for `valuePosition`. |
| `constraints[].ruleId` | `ruleId` | Required stable canonical identity. |
| `constraints[].severity` | `severity` | Defaults to `error`. |
| `constraints[].unknownPolicy` | `unknownPolicy` | Defaults to `not-evaluable`. |
| `constraints[].presentation` | `presentation` | Optional reviewed UI copy; never changes the verdict. |
| pinned source path and checksum | `source.path`, `source.checksum`, `source.anchor` | Every emitted rule points to the exact source constraint. |

### Supported operations

| Source operation | Required parameters | RuleIR assertion |
| --- | --- | --- |
| `countBetween` | `min`, `max`, `facts.visibleMemberNodeIds` | `count-between(actual, lower, upper, inclusive)` on the host. |
| `propertyDomain` | `property`, non-empty `values[]` | `one-of(component.properties.<property>, values)` on every selected nested instance. |
| `propertyEqualsHost` | `property`, optional `hostProperty` | `equals(component.properties.<property>, ownership.owner.component.properties.<hostProperty>)`. |
| `valuePosition` | `property`, `value`, non-empty `positions[]`, non-negative `maxCount` | `value-position(composition.siblingPropertyValues.<property>, value, positions, maxCount)` on matching nested instances. |
| `valuePosition.whenHostProperty` | `property`, typed `equals` literal | Adds a three-valued `when equals(owner property, literal)` condition. Unknown owner evidence cannot become a violation. |

Unknown operations, duplicate constraint ids, absent identities, absent fact
paths, malformed RuleIR or inactive/incomplete authority stop release loading.
They do not fall back to an agent or to a component-name heuristic.

## Verified ButtonsGroup lowering

The same generic source contract now emits five rules:

1. visible button count;
2. allowed Button `View` domain;
3. nested Button `Size` equals the group `Size`;
4. optional Primary is unique and first;
5. with `Overflow=true`, `SingleIcon=true` is unique and last.

Pure tests assert source checksum traceability, exact nested focus, four-state
predicate behavior, unknown-operation rejection and the source-defined Primary
position rule. The original hand-written ButtonsGroup rules are no longer
registered in the production predicate release.

## Wave 2: slot-order policy

Pilot source:
`design-system_ab/JSONS/web/components/web-corp/TitleView/composition-contract.json#manual.slotOrderPolicy`.

| Source field | Snapshot / RuleIR target |
| --- | --- |
| `schemaVersion=apollo.slot-order-policy.v1` | Selects the closed slot-order compiler. |
| `ruleId`, `ruleKind`, `authority` | Stable RuleIR identity and active-authority gate. |
| `scope` | Structured RuleIR applicability. |
| `ownerComponentIdentities[]` | Finds owners and compiles `slot.ownerComponentIdentity one-of`; no identity is embedded in adapter or compiler code. |
| `containerNames[]` | Finds the direct content container whose visible children represent ordered slots. |
| `order[]` | Maps normalized visible role names, derives each expected previous role/node, and supplies the `after` assertion. |
| `presentation` | Reviewed UI copy only; does not affect the verdict. |

The generic snapshot builder emits `slot.role`,
`composition.expectedPreviousSlotRole` and
`composition.expectedPreviousSlotNodeId`. Duplicate visible roles make the
fact unknown instead of guessing. The compiler asserts `after` plus existence
of both role facts. A unit fixture using `example.panel / Content /
Header-Body-Actions` proves that neither layer contains TitleView-specific
logic; the existing P08 four-state fixture proves behavioral parity.

## Wave 3: required effective baseline

Pilot source:
`design-system_ab/JSONS/web/components/web-corp/TitleView/rules.json#component:web-corp.title-view.title-and-subtitle-typography-is-fixed`.

The active component rule carries a generic `predicateContour.kind=baseline`.
Its explicit selector, actual/baseline fact pairs, applicability and presentation
are data. A pair with `required=true` compiles to `exists(actual)` plus
`matches-effective-baseline(actual, baseline)`; a non-required pair compiles
only the baseline comparison. This makes a removed mandatory value a violation
while an unavailable baseline remains `not-evaluable`.

P04 now resolves this contour only when TitleView is present in the request,
focuses the exact `Title` or `Subtitle` text node and has no hand-written
TitleView typography RuleIR registration. The same contour shape can describe
mandatory or optional baseline-controlled typography, paint, layout, radius,
opacity and effect facts for other components.

## Wave 4: token binding set

Pilot source:
`design-system_ab/JSONS/web/components/web-corp/BackgroundPlate/rules.json#component:web-corp.background-plate.padding-uses-spacing-tokens`.

The active rule now carries `predicateContour.kind=binding-set`. The contour
declares the component identity, public-root gate, optional structured selector,
the expected binding contract and a list of independent property paths. Each
path emits one RuleIR rule whose id is `<ruleId>.<suffix>` and whose assertion
is `binding-satisfies(bindingFact, expectedBinding)`. The associated
`valueFact` is required for applicability and becomes the presentation target,
so four sides can produce four independently focused rows without duplicating
the rule contract.

P05 is restricted by data to the public `background-plate-slot` family. Legacy
BackgroundPlate roots and internal descendants remain not selected. Missing
binding evidence is `not-evaluable`; an explicit raw binding is a violation.
The same contour can express token requirements for arbitrary padding, gap,
radius, paint or other binding facts without adding a component branch to the
runtime. The former hand-written BackgroundPlate padding rules are no longer
registered or exported.

## Wave 5: owned peer property equality

Pilot source:
`design-system_ab/JSONS/web/components/web-corp/TitleView/rules.json#component:web-corp.title-view.status-and-title-status-color-match`.

The active rule now carries
`predicateContour.kind=owned-peer-property-equality`. Data declares the owner
identity, the exact target identity and names, the member roles and names, the
property fact read from every member, and the required role set. The snapshot
adapter finds each target's nearest declared owner, collects only peers under
that ownership boundary, and emits
`composition.peerCollections.<collectionKey>.roles/values`. Duplicate members
or an unavailable property become unknown evidence; an absent required role
makes the rule not applicable.

The compiler selects the declared target, requires the full role set and
applies `all-equal` to the ordered values. P07 therefore still focuses the exact
TitleStatus mismatch, but neither the adapter nor RuleIR registration contains
TitleView, StatusPreset, TitleStatus or `Type`. An identity-agnostic
`demo.owner/demo.member` fixture proves the same contour's
PASS/FAIL/UNKNOWN/NOT-APPLICABLE behavior. The former hand-written P07 facts and
rule registration are removed.

## Wave 6: co-located underlay

Pilot source:
`design-system_ab/JSONS/web/components/web-corp/BackgroundPlate/rules.json#component:web-corp.background-plate.level-2-requires-level-1`.

The active rule now carries `predicateContour.kind=co-located-underlay`.
Source data declares the subject and underlay identities and properties, the
shared host layout modes, required positioning, sibling order, geometric
containment and the relation key used by the semantic snapshot. The adapter
resolves the nearest shared host and emits only generic facts under
`composition.underlayRelations.<relationKey>`; it contains no BackgroundPlate
or Level-specific branch.

The compiler validates those facts with standard RuleIR assertions. The same
contour can express a surface beneath a card, a media underlay beneath content
or another co-located stacking contract by changing source data only. Missing
graph scope and ambiguous underlays are `not-evaluable`; an explicit missing
or invalid underlay is a violation. The former hand-written P06 fact collector
and runtime rule registration are removed.

## Wave 7: form inner geometry

Pilot source:
`design-system_ab/patterns/p_form-construction-rules.md#rule:forms.construction-rules.inner-padding-standard`.

Rule 5 now publishes two independent `apollo-predicate-contour` blocks:

1. `inner-padding-standard.title-to-content` uses the generic `distance`
   contour. The source owns the selection relation, bounds facts, vertical
   axis, expected `24 px`, tolerance, page scope, authority and UI copy.
2. `inner-padding-standard.content-insets` uses the generic
   `derived-geometry` contour with four declared checks. Each side reads a
   normalized `composition.formFirstLevelSurface.contentInsets.*` fact and
   compares it with the source-owned `32 px` expectation.

The snapshot adapter only derives geometry and ownership. It does not contain
the normative `24/32 px` values or decide whether the measurements are valid.
Both former hand-written RuleIR factories are removed from `pilot-rules.js`;
unknown or malformed geometry remains `not-evaluable` through the shared
engine semantics.

## Wave 8: source-owned fact domains

Pilot source:
`design-system_ab/patterns/p_form-construction-rules.md#rule:forms.construction-rules.title-medium-one-per-plate`.

The new generic `fact-domain` contour compares one declared fact reference
with a source-owned set of allowed values through the closed `one-of`
predicate. It owns no component names, positions or allowed values in runtime.
Rule 9 uses it to select visible resolved `TitleView View=Medium` instances and
accept only `composition.formFirstLevelSurface.mediumTitlePosition` values
`single` and `first`. Therefore every extra title remains an independent
violation focused on that exact TitleView instead of collapsing the rule to a
surface-level count.

The already proven snapshot fact remains unchanged. The former hand-written
`formMediumTitleOnePerPlateRule` factory and runtime registration are removed.
Missing position or unresolved identity remains `not-evaluable`; a non-form
page remains `not-applicable` through shared engine semantics.

## Wave 9: source-owned action boundary distance

Pilot source:
`design-system_ab/patterns/p_form-construction-rules.md#rule:forms.construction-rules.block-spacing.second-level-actions`.

Form Rule 4 now publishes its second independent `distance` contour. Source
data owns the form/platform scope, the structural relation to the previous
second-level content block, both bounds facts, the vertical axis, expected
`32 px`, zero tolerance, authority and presentation. The snapshot adapter
continues to derive only
`composition.previousFormContent.bounds/hierarchyLevel` from the page graph.

The generic contour compiler lowers this declaration to the same RuleIR
`distance` assertion used by unrelated geometry rules. The former
`formSecondLevelActionSpacingRule` factory, export and runtime registration are
removed. Therefore changing the normative distance or reusing this relation
for another pattern is a source-data change, not a proxy-code branch.

## Wave 10: source-owned typed context mapping

Pilot source:
`design-system_ab/JSONS/web/components/web-corp-promo/Benefits/rules.json#component:web.benefits.capacity-matches-card-count`.

The generic `context-map` contour now accepts `mappingEntries` in addition to
the legacy JSON object form. Each entry carries independent typed `context`
and `target` values, so numeric variant values are not coerced into object-key
strings. The Benefits rule uses this form to declare `3 -> 3` and `4 -> 4`
between `composition.capacity` and
`composition.visibleBenefitCardCount`.

The snapshot adapter continues to derive only the selected Capacity and the
count of visible direct BenefitCard children owned by the published Benefits
root. The source owns the mapping, platform scope, authority and presentation.
The former `benefitsCapacityRule` factory, export and runtime registration are
removed. Missing facts remain `not-evaluable`, and unrelated components are
`not-applicable` through the shared engine semantics.

## Wave 11: source-owned uniform collection properties

Pilot source:
`design-system_ab/JSONS/web/components/web-corp-promo/Benefits/rules.json#component:web.benefits.nested-card-settings-are-uniform`.

The new generic `uniform-collection-properties` contour declares an owner
identity, a member identity, a source-owned graph traversal boundary and any
number of projected member fact paths. The compiler selects each owner,
queries matching graph members for every property and combines a
minimum-count assertion with one `all-equal` assertion per fact. When names
are supplied they can additionally delimit a collection before identity
resolution. For Benefits the source uses direct children, which includes
renamed BenefitCards without traversing unrelated unresolved deep content.
The implementation contains no Benefits identity, component name or property
name.

For P13 the source supplies `web.benefits`, `web.benefit-card` and the four
variant facts `Background`, `CardAxis`, `Compact` and `GraphicPosition`.
Fill/stroke are deliberately absent because the same source explicitly allows
their differences for Border and Colored surfaces. The former
`benefitsNestedCardSettingsUniformRule` factory, export and runtime
registration are removed. Unknown member identities or property values fail
closed as `not-evaluable`.

## Wave 12: source-owned finite fact domain for composition count

Pilot source:
`design-system_ab/JSONS/web/components/web-corp/TableView/rules.json#component:web-corp.table-view.horizontal-multi-column-header-required`.

The existing generic `fact-domain` contour is reused for a composition fact,
not a component-specific property. The source selector identifies published
Horizontal TableView roots with `Compact=False`, while the allowed domain
declares the only valid value of `composition.visibleHeaderRowCount`: `1`.
The snapshot adapter performs the mechanical work of resolving direct Row
instances, ownership, visibility and `Presets=Header`; it does not decide
whether the resulting count is valid.

The former `tableViewHorizontalHeaderRule` factory, export and runtime
registration are removed. Missing collection evidence remains
`not-evaluable`, unrelated variants remain `not-applicable`, and source
authority plus presentation survive unchanged in compiled RuleIR.

## Wave 13: source-owned finite fact domain for nested row cardinality

Pilot source:
`design-system_ab/JSONS/web/components/web-corp/TableView/rules.json#component:web-corp.table-view.horizontal-compact-one-column`.

The same generic `fact-domain` contour now selects every direct Body Row owned
by a Horizontal TableView with `Compact=True` and checks the mechanically
derived `composition.visibleDataColumnCount` against the source-owned domain
`[1]`. Component identity, owner variant, row preset, allowed count, platform
scope and UI copy all live in `TableView/rules.json`.

The snapshot adapter resolves visible Column descendants within the exact Row
ownership boundary and exposes both their ids and count. It does not decide
whether one or several columns are valid. The former
`tableViewHorizontalCompactOneColumnRule` factory, export, global runtime
registration and bespoke release-authority check are removed. Missing Column
identity remains `not-evaluable`; non-compact roots, Header rows and other
TableView families remain `not-applicable`.

## Remaining waves

The backlog remains open until the same table exists and the hardcoded runtime
registration is removed for:

- component `rules.json` predicate contours;
- remaining `composition-contract.json` shapes;
- remaining effective-baseline assertions and binding families;
- fenced form-pattern RuleIR blocks;
- ownership assertions from `contract.overrides.json`.

Each wave must retain source checksum traceability, compile-time rejection,
PASS/FAIL/UNKNOWN/NOT-APPLICABLE fixtures, exact focus, and the ten-run stable
result hash before cutover.
