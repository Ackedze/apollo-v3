# From ds-ai-hub prose to Apollo executable rules

Status: evolving pilot playbook.  
Pilot package: `BenefitCard`.  
Audience: design-system authors, Athena/Athena CLI maintainers and Apollo
runtime maintainers.

## Purpose

This document describes the complete repeatable route from human-readable
component knowledge in `ds-ai-hub` to an authoritative executable package for
Apollo's predicate engine. It records every material step and correction made
during the BenefitCard pilot. The procedure is intentionally stricter than
"copy prose into JSON": it closes source coverage, evidence, execution,
presentation and field-testability as one contract.

The document is a candidate source for a future Codex skill. It may be refined
while more components are migrated, but a refinement must not weaken the
fail-closed gates below.

## Result of a successful migration

A migrated component has all of the following:

1. reviewed human-readable rules with stable semantic meaning;
2. a generated evidence layer derived from Figma/raw catalogs;
3. a preserved manual policy layer with stable RuleIDs and active authority;
4. exact execution closure: every source rule has one route;
5. only universal declarative predicate contours, with no component-name
   branch in Apollo runtime;
6. checksum-pinned RuleIR compiled from the package;
7. Snapshot facts sufficient for every deterministic verdict;
8. explicit `UNKNOWN` for unavailable evidence instead of guessed failures;
9. PASS, FAIL, ALLOW and UNKNOWN field fixtures with exact focus;
10. zero duplicate/unclassified evaluations and a stable result hash over ten
    identical runs;
11. synchronized human documentation when a reviewed policy decision changes.

## Canonical inputs and outputs

### Human-readable input

For BenefitCard the primary source directory is:

```text
ds-ai-hub/products/ab/components/benefit-card/
├── instructions.md
├── adapter.figma.md
├── adapter.code.md
├── bridge.md
├── figma-keys.json
├── meta.json
└── cookbook/
    ├── 01-overview.md
    ├── 02-anatomy.md
    ├── 03-properties.md
    ├── 04-compose.md
    ├── 05-content.md
    └── 06-verify.md
```

Related cross-component prose must also be included, for example:

```text
ds-ai-hub/products/ab/patterns/benefit-card.md
```

Human prose explains intent, use cases, composition and exceptions. It is not
automatically authoritative for a deterministic error until it has a stable
RuleID, exact applicability and reviewed authority.

### Generated evidence input

Athena/Athena CLI own reproducible evidence derived from the Figma catalog:

```text
design-system_ab/JSONS/web/components/web-corp-promo/
  Web _ Сorp Promo Components -- BenefitCard.json
design-system_ab/JSONS/indexes/web/components/web-corp-promo/
  Web _ Сorp Promo Components -- BenefitCard.index.json
design-system_ab/JSONS/web/components/web-corp-promo/BenefitCard/
  contract.generated.json
```

This layer supplies identity, public variants, properties, anatomy and
effective baselines. It must not invent product policy from layer names or
prose and may be regenerated.

### Manual policy output

Reviewed component policy lives in the package:

```text
design-system_ab/JSONS/web/components/web-corp-promo/BenefitCard/
├── contract.overrides.json
├── composition-contract.json
├── rules.json
├── agent-context.json
├── audit-mapping.json
├── examples.json
└── README.md
```

The manual layer is owned by design-system authors. Athena may merge and
validate it but must never overwrite it during a catalog rebuild.

### Compiled release

The experimental compiled package is currently represented by:

```text
design-system_ab/JSONS/experiments/component-contract-v2/
  web-corp-promo/BenefitCard/
  ├── compiled/component-contract.v2.json
  ├── execution-policy.json
  ├── coverage.json
  └── README.md
```

Apollo Proxy consumes declarative source data through the generic predicate
runtime under:

```text
services/apollo-proxy/src/predicate-engine/
├── release-loader.js
├── composition-compiler.js
├── contour-rules.js
├── snapshot-adapter.js
├── source-rule-balancer.js
└── schemas/
```

Component packages provide data. The runtime must not contain BenefitCard,
TitleView or other component-specific branches.

## Source precedence and conflict policy

Use the following order when facts or rules differ:

1. published Figma/raw catalog and generated contract for observable facts;
2. active reviewed manual design rule for policy;
3. approved cross-component pattern when the component delegates to it;
4. human-readable instructions and cookbook as the source for clarification
   and future policy migration;
5. drafts and examples only as context.

Do not silently choose between conflicting sources. Record the conflict, keep
the rule non-enforcing, and request an owner decision. After that decision,
update both the executable rule and the affected human-readable documents.

## End-to-end migration procedure

### Step 1. Freeze the source set

Record every human, generated and manual file used in the migration. Pin the
repository revision or checksum. Do not begin by editing `rules.json`; first
make the source boundary visible.

BenefitCard source set included `instructions.md`, the whole cookbook, the
component pattern, Figma keys and the raw catalog/contract package.

### Step 2. Resolve identity, channel and package ownership

Establish:

- canonical component identity;
- Figma component keys;
- public root families;
- internal/service families;
- supported platforms and channels;
- nested owners and delegated components.

BenefitCard resolution:

- identity: `web.benefit-card`;
- public roots: `[D] BenefitCard`, `[M] BenefitCard`;
- service parts: `BottomContent`, `ContentWrapper`, `Graphic`;
- platforms: `desktop`, `mobile-web`;
- package: `web-corp-promo/BenefitCard`.

Identity must come from stable keys/families, not a mutable visible layer name.

### Step 3. Build a source-rule inventory

Split the prose into atomic semantic rules. For every item record:

- stable RuleID;
- verbatim human rule;
- source file and anchor;
- owner and revision;
- severity or guidance policy;
- applicability;
- required facts;
- expected verdict class;
- dependencies/delegation;
- unresolved ambiguity.

Do not merge independent properties merely because they share a paragraph.
Conversely, do not duplicate the same policy across a component rule and a
pattern rule.

### Step 4. Resolve policy drift before coding

Compare human prose, generated contracts and existing machine rules. Ask the
design-system owner to resolve contradictions.

BenefitCard exposed one important policy correction: `Type=Secondary` is
allowed but not recommended. It must not create an Apollo violation. The final
route is `allow-with-guidance`, not `error` and not a confirmed warning row.

### Step 5. Classify every rule by execution route

Every source RuleID must appear exactly once in one group:

1. `predicateRules` — deterministic now;
2. `compositionRules` — deterministic through a versioned composition
   contract;
3. `delegatedRules` — another canonical component or pattern executes it;
4. `policyRules` — authoritative guidance without an automatic verdict;
5. `contextOnlyRules` — requires explicitly listed missing facts;
6. `contractGuaranteedRules` — invariant guaranteed by the published public
   API and not usefully testable as a user override.

Publication must fail on missing, extra or duplicate RuleIDs. "The agent will
understand it" is not an execution route.

### Step 6. Decide deterministic sufficiency

A rule is deterministic only when all of these are explicit:

- stable target identity;
- applicability predicate;
- actual fact path;
- expected literal, domain, relation or effective baseline;
- authority;
- unknown policy;
- exact focus node;
- remediation/presentation.

If one is absent, classify the rule as context-only or policy-only. Never turn
missing evidence into a default value.

### Step 7. Define Snapshot facts and provenance

Map every deterministic rule to immutable Snapshot v2 facts. Evidence must
include provenance for effective baselines and ownership. Typical facts are:

- `component.identity`, `component.family`, `component.platform`;
- `component.properties.*`;
- `page.context.viewportWidth` and selected channel;
- ownership and public-root state;
- nested component role and owner;
- actual/baseline pairs for fill, stroke, typography, radius, opacity, effects
  and layout;
- token binding facts;
- visible composition collections and relations.

An unavailable fact is added to `unknownFacts`. The result is `UNKNOWN`, not a
violation and not a guessed pass.

### Step 8. Author the manual rule layer

An enforcing rule in `rules.json` must carry at least:

- stable `ruleId`;
- complete `ruleText`;
- `ruleKind: design-rule`;
- `authority.status: active`;
- provenance and integer revision;
- severity/policy;
- structured applicability;
- `predicateContour` or a declared non-predicate route;
- `unknownPolicy: not-evaluable` unless another reviewed policy is explicit;
- reviewed presentation text.

Generated rules remain in `generated.rules`; reviewed rules remain in
`manual.rules`. Do not patch generated output by hand.

### Step 9. Select a universal contour

Reuse a registered contour such as:

- `public-root`;
- `platform-match`;
- `fact-domain`;
- `baseline` / `baseline-set`;
- `binding-set`;
- `owned-peer-property-equality`;
- `co-located-underlay`;
- `distance` / `derived-geometry`;
- versioned composition constraints.

If no contour expresses the semantic rule, first add an identity-agnostic
operator/contour with synthetic fixtures. Do not add a BenefitCard-specific
runtime `if`.

Cross-component-property dependencies do not require a new operator when the
Snapshot already exposes owner facts. Select the affected nested instance with
`fact-assertion`, constrain it by stable component identity and property value,
then assert the required owner fact through
`ownership.owner.component.properties.*`. Keep independent semantics atomic:
for ButtonsGroup the composition contract proves that SingleIcon is unique and
last, while a separate source contour proves `SingleIcon=True -> Overflow=true`.
Do not hide this dependency inside `when`: a conditional position rule becomes
not-applicable when the prerequisite is false and therefore cannot report the
missing prerequisite itself.

### Step 10. Keep predicates atomic

One source rule may compile into several atomic RuleIR rules. For example,
`baseline-set` expands into property-specific suffixes. This enables exact
focus, deduplication and action text while preserving one human policy source.

### Step 11. Define exceptions and ownership boundaries

Broad baseline checks must exclude properties owned by a more specific public
setting or nested contract.

BenefitCard's visual baseline rule permits only these reviewed exceptions:

- Type of nested `[Promo] BackgroundPlate`;
- fill color when `Type=Colored`;
- stroke color when `Type=Border`.

The exception belongs in declarative data. It must not be inferred from a
particular current layer path.

### Step 12. Compile fail closed

The release loader validates schema, identity, authority, contour capability,
fact paths and execution closure. Unsupported operators, inactive authority,
unknown contours and incomplete constraints stop the release. They do not
fall back to component-name heuristics or an optimistic agent verdict.

### Step 13. Add pure and integrated tests

For every new contour/operator family add:

- PASS;
- FAIL;
- UNKNOWN;
- NOT-APPLICABLE;
- unsupported-input rejection;
- exact-focus assertion;
- duplicate/unclassified assertion.

Also run package-level tests through the same loader used in production.

### Step 14. Build a Figma field matrix

Every canvas case must visibly contain:

```text
<CaseID> · <PASS|FAIL|ALLOW|UNKNOWN> · <short name>
Кейс: <what was changed or intentionally left valid>
RuleID: <stable RuleID>
Правило: <complete human-readable rule>
```

Required matrix:

- PASS for each enforced family;
- FAIL for each deterministic rule;
- ALLOW for explicit exceptions/guidance;
- UNKNOWN for missing evidence;
- boundary cases for platform, ownership and nesting.

The case is not ready when the visible canvas cannot be mapped unambiguously
to one RuleID.

### Step 15. Validate result semantics

For each field run verify:

- expected finding count;
- no findings in PASS/ALLOW fixtures;
- UNKNOWN is not promoted to an error;
- exact changed node receives focus;
- rule source and presentation are correct;
- no duplicate rows;
- zero unclassified evaluations;
- normalized result hash is identical over ten runs.

### Step 16. Publish in dependency order

When a plugin test depends on updated `design-system_ab`, publish those data
before running the remote test. Rebuild/restart Apollo Proxy when runtime or
bundled knowledge changed. Rebuild Apollo v3 when plugin source changed.

### Step 17. Update ledgers and human docs

Mark a component `Ready` only after all gates pass. Synchronize coverage and
component-status tables. If migration clarified policy, update
`instructions.md`, the cookbook and the human pattern in the same change set
or link a tracked follow-up.

### Step 18. Preserve the audit trail

Record:

- source revisions/checksums;
- owner decisions;
- rules left policy/context-only and why;
- Snapshot evidence gaps;
- field report paths;
- regressions and the fix that closed each one.

## BenefitCard pilot: final execution map

The final package uses six directly executable source contours. A
`baseline-set` may expand into several atomic runtime checks.

| RuleID | Route | Contour | Field expectation |
| --- | --- | --- | --- |
| `component:web.benefit-card.public-roots-only` | predicate | `public-root` | service part as root -> FAIL |
| `component:web.benefit-card.compact-required-at-1024` | predicate | `fact-domain` | desktop 1024 + Compact=False -> FAIL |
| `component:web.benefit-card-platform-version-must-match` | predicate | `platform-match` | mobile root on desktop -> FAIL |
| `component:web.benefit-card.compact-uses-secondary-title` | predicate | `fact-domain` | Compact=True + Title=Primary -> FAIL |
| `component:web.benefit-card-bottom-content-link-only` | predicate | `fact-domain` | BottomContent SwapMe -> FAIL |
| `component:web.benefit-card.visuals-follow-effective-baseline` | predicate | `baseline-set` | manual visual override -> atomic FAIL |

Important non-error routes:

| RuleID | Route | Meaning |
| --- | --- | --- |
| `component:web.benefit-card-secondary-surface-not-recommended` | policy / allow-with-guidance | Secondary is allowed and creates no violation |
| `component:web.benefit-card.axis-and-graphic-position-are-contextual` | policy / allowed domain | all published axis/position combinations are allowed |
| `component:web.benefit-card-image-view-segment-only` | context-only until exact baseline evidence | fixed Crop/Size must not be guessed when effective baseline facts are absent |
| `component:web.benefit-card.title-and-graphic-required` | contract-guaranteed public anatomy | do not target renameable internals with a brittle selector |

## BenefitCard pilot: corrections and lessons

### The first package was over-authored

The initial draft attempted to make too many prose statements executable at
once. The package was reduced to rules whose applicability and evidence were
actually closed. This is safer than publishing a large nominal coverage number
with unstable selectors.

### Skeleton was not forced into an impossible public fixture

The published component API did not expose every hypothetical invalid
Skeleton state as a user-creatable override. The invariant was retained as
contract/policy knowledge instead of inventing a false test through internal
layer mutation.

### ImageView fixed values require baseline evidence

Although prose names Crop and Size values, a reliable Apollo verdict requires
the selected variant's effective baseline with provenance. Without that fact,
the field case remains `UNKNOWN`. The runtime must not treat a prose literal as
an observed Figma baseline.

### Applicability was narrowed to owned public families

Early selectors were broad enough to classify unrelated or internal nodes.
The final selectors use canonical identity, family, platform, public-root and
ownership facts. Visible names remain presentation only.

### Secondary was reclassified from finding to allowed guidance

The human rule says Secondary is allowed. A finding that told the designer to
replace it contradicted the policy. The executable predicate was removed and
the policy became `allow-with-guidance`; the Figma fixture is now `ALLOW`.

### Baseline checks became atomic

The broad visual rule compiles to independent property checks. A changed Title
fill focuses the Title layer and does not produce a generic BenefitCard row or
duplicates for derived values.

### Test documentation is part of the release

The first canvas labels did not consistently contain RuleID and full human
text, and the Secondary case still said WARNING. The field sections were
rewritten so every case is traceable directly from Figma to source rule and
runtime result.

## BenefitCard field fixtures

Current sections in the pilot Figma file:

- BASE 1440: `12623:156421`;
- COMPACT 1024: `12623:156456`;
- PUBLIC ROOT: `12623:156471`.

Expected final matrix:

- BASE: three errors; PASS, ALLOW and UNKNOWN produce no false findings;
- COMPACT: two errors and one clean PASS;
- PUBLIC ROOT: one error;
- all results stable over ten identical runs.

## AmountStyles pilot: nested host package and value semantics

AmountStyles adds a second migration archetype. Unlike BenefitCard, the public
Corp component owns a subtree built from the supporting Core Amount package.
The migration therefore begins with an explicit ownership decision:

- `web-corp.amount-styles` owns the effective typography, color, opacity and
  layout baseline while Core Amount is nested under AmountHeadline or
  AmountParagraph;
- `web-core.amount` owns the same invariants when it is audited outside that
  host;
- Apollo must not execute both packages against the same owned subtree and
  produce duplicate rows.

This host/supporting-package distinction must be recorded in
`composition-contract.json`, tested through ownership facts, and reflected in
the execution policy. A matching rule text in two packages does not by itself
mean that one of the files is redundant.

### AmountStyles source decomposition

The human-readable rules split into four fact domains:

| Domain | Examples | Execution decision |
| --- | --- | --- |
| public component boundary | public roots, internal Operation, desktop/mobile preset | deterministic identity/platform predicates |
| visible value structure | required Major, mathematical minus, Minor length, Major digit limit | deterministic text and query predicates |
| owned visual baseline | geometry, opacity, text style, common text color | deterministic baseline/binding predicates |
| product usage semantics | table role, top-up meaning, source value rounding, Addon action | context-only until the Snapshot contains the required usage facts |

The division is essential: visible formatted text can prove how a value is
displayed, but it cannot prove the original numeric value or rounding mode.
`round-to-two-minor-digits` therefore remains context-only even though the
result usually contains two digits.

### Candidate executable map

The first AmountStyles draft compiles the following candidate rules with only
universal contours:

| RuleID suffix | Contour | Primary evidence |
| --- | --- | --- |
| `operation-is-internal` | `fact-domain` | canonical root family and ownership |
| `major-is-required` | `query-count` | visible non-empty `Major` text |
| `math-minus-is-required` | `fact-assertion` | `text.characters` on the owned Minus leaf |
| `parts-share-color` | `fact-assertion` | visible text fills plus common token binding |
| `opacity-is-forbidden` | `baseline-set` | leaf opacity versus effective baseline |
| `opacity-property-is-forbidden` | `fact-assertion` | Core Amount `Opacity` property under the Corp host |
| `geometry-follows-effective-baseline` | `baseline-set` | spacing, sizing, height and wrap baseline |
| `platform-preset-matches-channel` | `platform-match` | selected page channel and public preset platform |
| `minor-has-one-or-two-digits` | `fact-assertion` | visible Minor text |
| `major-max-13-digits` | `fact-assertion` | visible Major digit count |
| `manual-text-style-is-layer-property` | `baseline-set` | exact text leaf style versus effective baseline |

Candidate means schema-valid and covered by pure fixtures. It does not mean
`Ready`. The component remains `Draft` until each contour has PASS and FAIL
Figma evidence, exact focus, no duplicate rows and ten-run repeatability.
Coverage gaps must not be deleted merely because a contour compiles.

Text-leaf selectors require an additional rename-safety gate. The first
AmountStyles candidates combine the catalog-observed leaf names (`Minus`,
`Major`, `Minor`, `Currency`) with ownership facts. Replacing those names with
ownership/family-only selectors is desirable only after a real Predicate
Snapshot proves that the required ownership chain is emitted for every public
preset. Until then such a change is a reviewed migration, not a mechanical
cleanup. The field matrix must include a renamed-leaf fixture or a frozen
snapshot regression before a name constraint is removed.

### Policy, delegation and context-only routes

Statements that describe allowed behavior belong to policy rather than to a
finding. For AmountStyles these include a shared contextual recolor, independent
Addon colors, optional-part coexistence and context-controlled Style. The
one-line rule can delegate to the geometry/wrap predicate; the same-text-style
rule can delegate to the atomic manual text-style baseline predicate.

Rules requiring table semantics, a raw numeric value, locale, a linked source
amount or an interaction action remain context-only with exact `missingFacts`.
Do not use `llm` as a substitute for an absent fact: the agent receives these
rules only after the deterministic layer exposes the uncertainty explicitly.

### Unicode literals are normative data

The AmountStyles sources currently disagree about the group separator:

- cookbook code uses thin space `U+2009`;
- pattern examples use mathematical medium space `U+205F`;
- generated baselines contain both values.

Consequently `math-space-is-required` cannot be promoted to a hard predicate
until the owner chooses one canonical code point or explicitly allows a set.
Migration tooling must print invisible literals as code points during source
inventory and log any disagreement in the ledger. Copying a visually identical
space from Markdown into a regular expression is not sufficient evidence.

### Required field matrix for AmountStyles

Every test label must contain CaseID, state, complete human rule and RuleID.
The minimum matrix is:

- public AmountHeadline and AmountParagraph PASS roots;
- standalone internal Operation FAIL;
- desktop/mobile channel PASS and cross-channel FAIL for each platform-specific preset;
- missing/hidden Major FAIL;
- hyphen or dash instead of U+2212 FAIL;
- Minor with one/two digits PASS and three digits FAIL;
- Major with 13 digits PASS and 14 digits FAIL;
- one text part recolored FAIL and all text parts recolored to one token ALLOW;
- Opacity property/layer override FAIL;
- manual text style, spacing, sizing or wrap override FAIL;
- context-only table, rounding and Addon-action cases labelled UNKNOWN rather
  than manufactured as deterministic failures.

The report must focus the exact failing leaf for text, opacity and baseline
rules, while root-level structure and channel rules focus the public
AmountStyles instance.

## Release checklist

- [ ] Source file list and revisions are recorded.
- [ ] Canonical identity, public roots, internal parts and platforms are known.
- [ ] Every human rule has a stable RuleID and source anchor.
- [ ] Source conflicts have an owner decision.
- [ ] Exact execution closure has no missing, extra or duplicate RuleIDs.
- [ ] Every enforcing rule has active authority.
- [ ] Every deterministic rule has sufficient Snapshot facts and provenance.
- [ ] Missing facts produce UNKNOWN.
- [ ] Runtime contains no component-name or RuleID-substring branch.
- [ ] Universal contour/operator tests cover four-state semantics.
- [ ] Package integration tests assert exact focus and no duplicates.
- [ ] Figma cases display CaseID, state, RuleID and complete human rule.
- [ ] PASS/FAIL/ALLOW/UNKNOWN field expectations are confirmed.
- [ ] Ten identical runs produce the same normalized hash.
- [ ] Human documentation is synchronized with reviewed policy changes.
- [ ] Coverage/status registries are updated only after the gates pass.

## Future skill shape

When this playbook is converted into a Codex skill, keep `SKILL.md` concise and
move detail into references. A recommended package is:

```text
apollo-rule-migrator/
├── SKILL.md
├── references/
│   ├── workflow.md
│   ├── source-precedence.md
│   ├── contour-catalog.md
│   ├── figma-test-matrix.md
│   └── benefit-card-example.md
└── scripts/
    ├── inventory-source-rules.*
    ├── check-execution-closure.*
    └── validate-field-manifest.*
```

The skill should automate inventory, closure and validation, but it must not
silently resolve policy conflicts or grant rule authority. Those remain
reviewed design-system decisions.
