# Executable rule package migration playbook

## Purpose

This document is the production checklist for moving a real component or
pattern into Apollo's executable predicate engine. It records the lessons from
the first complete package migration: `TitleView`, published in
`design-system_ab` commit `61f32718` on 2026-08-27.

The goal is not to turn every sentence into a hard-coded check. The goal is to
give every source rule exactly one explicit execution route and to make missing
evidence visible. A package is closed only when a new rule cannot silently
bypass the compiler, evaluator or coverage report.

## Canonical package layers

### Generated evidence

Athena and Athena CLI own reproducible factual artifacts derived from Figma and
raw catalogs. This layer may describe component identity, keys, variants,
properties, anatomy, effective baselines and other observable evidence. It must
not infer product policy from prose.

Generated files may be replaced during catalog rebuilds. Their output must be
deterministic for identical source inputs.

### Manual policy

Design-system authors own reviewed policy that cannot be inferred safely from
the raw Figma catalog. The manual layer includes:

- active rules, authority and severity;
- predicate contours and their presentations;
- composition contracts;
- delegation to another component or pattern rule;
- policy-only guidance;
- context-only rules and their exact missing facts;
- explicit coverage gaps.

Athena must merge and validate this layer, but must never overwrite it during a
catalog rebuild.

### Compiled release

Apollo consumes trusted declarative data and compiles it to RuleIR. Component
packages provide data, not executable JavaScript. The runtime must not contain
branches keyed by `TitleView`, another component name or a rule-id substring.

## Mandatory execution closure

Every source rule must appear exactly once in one of these groups:

1. `predicateRules` — directly compiled by a registered universal contour.
2. `compositionRules` — compiled from a versioned composition contract.
3. `delegatedRules` — executed by another canonical component or pattern rule.
4. `policyRules` — authoritative guidance without an automatic verdict.
5. `contextOnlyRules` — evaluable only after explicitly listed facts exist.

Publication must fail on missing, extra or duplicate rule ids. It must also
fail when a predicate rule lacks active `design-rule` authority, references an
unknown contour, or a composition rule references an absent contract
constraint.

For TitleView the closure is 42/42:

- 11 direct predicate rules;
- 4 composition-routed source rules;
- 5 delegated rules;
- 6 policy rules;
- 16 context-only rules.

This is architectural completeness, not a claim that all 42 rules currently
produce deterministic verdicts.

## Source-to-runtime pipeline

```text
Figma/raw catalog
  -> Athena generated evidence
  -> preserved manual policy merge
  -> schema + authority + closure validation
  -> universal contour/composition compiler
  -> checksum-pinned RuleIR release
  -> immutable Snapshot v2 facts
  -> four-state predicate evaluation
  -> coverage ledger + exact focus + UI presentation
```

The agent may interpret rules that genuinely require semantics or user context,
but it must not repair missing deterministic compilation or replace missing
snapshot facts with guesses.

## Technical lessons from TitleView

### Keep identities in source data

Desktop and mobile variants must be declared as identity arrays in selectors
and ownership contracts. Do not duplicate runtime functions for `[D]` and `[M]`
components and do not match only by display name.

### Separate atomic findings

A rule covering several independent properties must compile to stable atomic
rule ids. `baseline-set`, for example, expands one source rule into suffixes
such as `.fill`, `.stroke`, `.radius` and `.opacity`. This preserves exact
focus, deduplication and remediation without duplicating source prose.

### Missing evidence is UNKNOWN

An absent value is not automatically an invalid value. If Figma or the adapter
did not provide a contract-required component property, text length or another
fact, the adapter must mark that fact in `unknownFacts`. The evaluator then
returns `UNKNOWN`/`not-evaluable` instead of a false violation.

Composition declarations must therefore enumerate the properties they read.
The generic adapter marks a missing declared property as unknown. Text nodes
must similarly mark unavailable `text.length` as unknown.

### Baseline rules require provenance

Never compare a changed value against a guessed default. A baseline predicate
requires an exact effective baseline fact and its origin. If a direct override
exists but the corresponding baseline diff is unavailable, the verdict is
UNKNOWN. Unchanged observable facts may receive a derived baseline only when no
matching direct override exists.

### Do not execute the same policy twice

One relation must have one canonical executable source. TitleStatus/Status
equality, for example, must not be compiled both from a direct contour and a
composition contract. Duplicate execution produces duplicate rows and
conflicting focus.

The same rule may also appear in a component package as a link to a canonical
pattern rule. In that case the component source rule belongs in
`delegatedRules`; the executable contour lives only in the pattern document.
Do not copy the contour into both files.

### Prefer the stricter owner contract over a broader pattern

A nested component may satisfy two selectors at once. For example, a desktop
Button with `View=Accent` is forbidden by the global button pattern, while the
same Button inside ButtonsGroup also violates the group's stricter allowed-view
contract. Emitting both findings creates a duplicate for one fact.

When a composition contract fully covers that fact, the broader pattern must
exclude the owned context and the owner contract becomes the canonical
executable source there. The pattern still applies to standalone instances and
other contexts. This boundary belongs in declarative selectors and execution
policy, not in a runtime branch keyed by the component name.

### Separate overlapping atomic surfaces

A broad appearance contour and a specialized nested-layer contour must not
classify the same property on the same node. For Button, the general fill
baseline excludes `Label` and `Hint`; their color is owned by the dedicated
text-color rule. Add selector exclusions deliberately and cover them with a
no-duplicate integration test.

### Presentation is part of the contract

UI text must use neutral templates when an atomic rule substitutes different
property labels. Do not use placeholders such as `{{context}}` unless the rule
declares the corresponding `contextFact`. Validate rendered Russian copy, not
only predicate truth.

### Exact focus is a release gate

Owner-level aggregates focus the owner. Property and nested-component failures
focus the exact changed or invalid member. A section/root fallback is not an
acceptable success state when the evidence identifies a narrower node.

### Authority and applicability fail closed

Only active authoritative `design-rule` sources may confirm a violation.
Unknown selectors, operators, facts, capability versions and incomplete
composition contracts must stop compilation or produce diagnostics; they must
never broaden applicability.

## Required test gates for every migrated package

1. JSON and shared-schema validation.
2. Exact source-rule closure with no missing, extra or duplicate ids.
3. Compiler rejection fixtures for unsupported operations and incomplete
   authority.
4. PASS, FAIL, UNKNOWN and NOT-APPLICABLE fixtures for every new contour or
   operator family.
5. Integrated package fixtures for boundaries, composition and baseline facts.
6. Exact focus assertions for every FAIL fixture.
7. Zero unclassified and duplicate evaluations.
8. Stable ordering and identical normalized result hash over ten runs.
9. Pinned source path, anchor, checksum and revision.
10. Figma PASS/FAIL field fixtures and UI-copy review before enforcement.

## Mandatory proxy knowledge-bundle preflight

Every Figma field test that depends on a new, changed or removed executable
rule must use a freshly embedded proxy knowledge bundle. A source change in
`design-system_ab` is not available to Apollo merely because the source file
was edited, validated or pushed: ApolloProxyControl runs against the knowledge
snapshot packaged into the application.

Before starting the Figma test, always perform this sequence:

1. Finish and validate the rule package in its source repository.
2. Synchronize the updated `design-system_ab` and/or `ds-ai-hub` artifacts into
   the Apollo proxy knowledge inputs.
3. Rebuild ApolloProxyControl so the current artifacts are embedded into the
   application bundle.
4. Compare the checksum of every changed normative artifact in the source tree
   with the corresponding file inside the built application. The checksums
   must match.
5. Verify through the release loader or manifest inspection that the expected
   rule ids and predicate contours are present in the embedded release.
6. Restart the rebuilt ApolloProxyControl, start the proxy and reload the
   rebuilt Apollo plugin when plugin runtime code also changed.
7. Only then run PASS/FAIL/UNKNOWN/NOT-APPLICABLE fixtures in Figma.

If any of these checks fails, stop the field test. A report produced from a
stale embedded bundle is not evidence about the new rules and must not be used
to accept, reject or debug the migration. Record the proxy build identity and
source checksums together with the field report so the tested rule revision is
reproducible.

The complete proxy regression suite must remain green. A field run is required
when a new snapshot fact, Figma ownership interpretation or UI remediation is
introduced.

## TitleView remaining evidence gaps

The first migration deliberately leaves these facts explicit rather than
guessing them:

- effects and blend mode for root/nested appearance baselines;
- prototype reactions and clickability;
- external neighbour relations;
- semantic roles and action intent;
- loading scope;
- company/product context;
- page semantics;
- interaction and edit-mode state.

These gaps define future Snapshot v2 work. They must not become component-name
heuristics in Apollo.

## Core Button migration notes

Core Button establishes the dependency boundary for ButtonsGroup:

- Button owns the legality of its public variants, its effective-baseline
  appearance, Label/Hint typography and color, and platform restrictions;
- ButtonsGroup owns member count, order, host/member equality, Primary and
  SingleIcon placement, Overflow behaviour and container geometry;
- editorial Label wording remains delegated to the button pattern;
- a property such as `Size` may therefore participate in two different checks:
  legal Button domain and equality with the ButtonsGroup host.

The release loader validates `executionPolicy` for every requested package that
declares one. Core Button is not selected by a special runtime branch. The old
hard-coded desktop Button JS rule was removed after its canonical contour was
published in `p_buttons-and-buttons-group.md`.

## Nested component contours and semantic hosts

A visual override may occur below a nested component root while the exception
belongs to its outer host. The StatusPreset field case is the canonical
example: the changed TEXT layer is owned by `web-core.status`, while
`PropertyPreset Color=Custom` is declared by the outer
`web-corp.status-property` instance.

Core IconView establishes the reusable slot boundary:

- the Core package owns public versus internal component families, public
  component properties and effective-baseline visual/layout evidence;
- paint ownership is explicit rather than inferred from the baseline: IconView
  itself allows overrides of `Border.stroke`, `Shape/BgColor.fill` and
  `Content/PaintMe.fill`; those changes are public settings and remain allowed
  unless an active host rule narrows them;
- the Core package does not decide whether a replacement in `Content` is valid;
- the containing component or pattern owns the contextual allow-list and must
  target the semantic nested slot rather than a Figma display path;
- a missing host rule remains context-only/unknown and must not become a broad
  Core error;
- generated anatomy and contract keys remain evidence, while the reviewed
  manual layer supplies authority and exact execution closure.

This separation prevents two opposite regressions: permitting every icon swap
because one host allows it, and rejecting every icon swap because another host
locks it. It is the template for later Core components with instance-swap or
slot boundaries.

The same principle applies inside a single package: do not place every visual
fact into a broad `baseline-set`. First separate component-owned public paint
surfaces from immutable layout/geometry. Otherwise a valid color choice becomes
a deterministic false positive before a host rule has a chance to participate.

Evidence compaction must also preserve every exact changed subject. Figma
boolean/vector primitives may be excluded as decorative only when they have no
entry in the effective-baseline change set. If `changes` contains the node id,
the graph must retain its real type, id, owner and relative path. This prevents
valid executable rules from silently losing radius, opacity, paint or layout
overrides on internal masks without introducing component-specific selectors.

Snapshot v2 therefore propagates the nearest component contour to non-instance
descendants and exposes the first component outside that contour as
`ownership.contour.host`. Rules must use these semantic facts instead of layer
names or a fixed tree depth. The Status fill contour selects the
`web-core.status` contour, constrains its host to StatusPreset or PropertyPreset,
compares each changed fill to its exact effective baseline and excludes only
`PropertyPreset Color=Custom`.

Release gates for this shape require:

- exact focus on the changed descendant layer, not the Status or preset root;
- a PASS/FAIL test for the nested baseline comparison;
- a NOT-APPLICABLE test for the host-owned Custom exception;
- no component-name branch in the snapshot adapter or predicate engine;
- Athena and Athena CLI preservation and validation of both the manual contour
  and its execution-policy route.

## ButtonsGroup migration notes

ButtonsGroup is a wrapper contract over Core Button, not a second copy of the
Button contract:

- visual, typography, color, addon and loading rules of each nested Button are
  delegated to `web-core.button`;
- the group executes only wrapper-owned facts: visible count, allowed View
  subset, Size equality with the host, Primary/SingleIcon position, root
  direction, sizing, spacing and root appearance;
- the stricter `Primary | Secondary` View domain is an explicit source rule in
  `rules.json`; a runtime constraint without a source rule is package drift;
- desktop and mobile-web composition contracts are separate because their
  visible-button limits differ (`2..4` versus exactly `2`); platform differences
  must not be hidden in prose beside a shared `max=4` constraint;
- stable desktop rule ids were preserved while mobile rules use a `.mobile`
  suffix, so existing reports and tests remain traceable without conflating the
  platform contracts;
- baseline contours that are not meaningful without an effective baseline use
  a selector guarded by baseline existence (`baseline-set`); an absent baseline
  must not become a false violation;
- interaction and overflow semantics remain `context-only` until the snapshot
  carries action identity, source/target content, interaction target and
  post-action state.

Field fixtures must separately cover desktop and mobile limits, exact focus on
the invalid nested Button, and the absence of duplicate findings between the
global Button pattern and the stricter ButtonsGroup contract.

## Athena and Athena CLI revision requirements

Before migrating packages at scale, re-audit both generators end to end.
Athena and Athena CLI must:

1. Publish a versioned package schema shared with Apollo.
2. Separate generated evidence from authored manual policy structurally.
3. Preserve manual blocks byte-for-byte or through a deterministic semantic
   merge when raw catalogs are regenerated.
4. Validate predicate contours, composition contracts, identities, fact paths,
   authority, severity, revisions and source-rule closure.
5. Generate a per-package coverage artifact with
   `executable | delegated | policy | context-only | unsupported` status.
6. Reject a deterministic source rule that has no executable route or explicit
   non-executable classification.
7. Compile and test packages without depending on component names or rule-id
   substrings.
8. Publish package artifacts, coverage, component indexes, manifests,
   capability versions and checksums atomically.
9. Detect source/generated/manual drift and prevent stale partial publication.
10. Preserve split-repository compatibility for `design-system_ab`,
    `ds-ai-hub` and future design-system sources.

Until this revision is complete, manual policy remains authored in the package
and Apollo validates closure at release load. Catalog regeneration must be
followed by a diff proving that no manual rule or execution route was lost.

## BackgroundPlate migration notes

BackgroundPlate proves that one authored rule may contain several atomic
property checks with different applicability. The Colored/Border token rule is
one policy statement, but its fill branch applies only to `Type=Colored` and
its stroke branch only to `Type=Border`. The universal `binding-set` contour
therefore supports a selector extension on each path and emits stable `.fill`
and `.stroke` RuleIR ids. Do not split the authored rule or add a runtime
component branch to achieve this.

The package currently closes 29/29 source rules across 11 predicates, one
delegation, eight policy rules and nine context-only rules. Context-only is an
explicit evidence boundary, not deferred prose: surface variable modes,
surface semantic context, effects, blend mode, reactions, loading origin and
responsive source/target composition are named as missing facts.

Paint responsibilities are intentionally non-overlapping:

- `Colored` requires a tokenized fill and no visible stroke;
- `Border` requires a tokenized stroke and no visible fill;
- `Primary` and `Secondary` compare fill/stroke to effective baseline;
- padding values remain designer-controlled, while only public
  BackgroundPlateSlot padding requires Spacing bindings.

Field fixtures must isolate these branches so one deliberate defect cannot
produce several causal duplicates. A rule that lacks exact baseline provenance
or a declared context fact must return UNKNOWN rather than infer a default.

## Migration sequence for the next component or pattern

1. Inventory every real source rule without filtering by current engine
   capability.
2. Classify every rule into the five execution routes.
3. Reuse an existing universal contour by semantic shape whenever possible.
4. Specify a new capability only when no existing contour represents the rule.
5. Add only the missing generic snapshot facts required by that capability.
6. Add closure, compiler, four-state, focus and repeatability tests.
7. Publish source data and complete the mandatory proxy knowledge-bundle
   preflight before a Figma field run.
8. Review the report for truth, copy, routing, focus, duplicates and coverage.
9. Record the field fixture, proxy build identity and source checksum in the
   architecture backlog.
