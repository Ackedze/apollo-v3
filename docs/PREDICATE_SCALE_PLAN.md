# Apollo Predicate contour: consolidation and scale plan

Status: ratification candidate  
Date: 2026-08-29

## Decision

The Predicate model is Apollo's target validation architecture. It is not a
temporary pilot and is not replaced by Component Contract v2.

Apollo converges on one execution path:

```text
authoritative component and pattern sources
  -> generated evidence + preserved manual policy
  -> source-rule closure and execution classification
  -> canonical compiler
  -> one checksum-pinned RuleIR release
  -> immutable Snapshot v2 / typed facts
  -> one universal Predicate evaluator
  -> coverage ledger, exact focus, remediation and report
```

`Component Contract v2` is the current experimental authoring, packaging and
classification workbench. Useful schema/compiler behaviour from that
experiment must be promoted into the canonical Predicate compilation path.
It must not remain a second user-visible verdict engine or require a permanent
feature toggle.

## Current readiness: what is complete and what is not

Two independent kinds of readiness must never be collapsed into one status.

### Engine readiness

The engine is mature enough to begin systematic scaling across components and
patterns:

- the capability registry is closed and versioned;
- 36 primitive predicates and the reusable P21-P28 contours are implemented;
- selectors, graph queries, derived geometry and typed fact resolution are
  component-independent;
- applicability and predicate truth fail closed through `unknown` rather than
  guessed verdicts;
- every evaluation receives one terminal coverage classification;
- findings retain stable ids, exact subject/focus nodes, source evidence and
  predicate traces;
- field cases have proved value domains, conditional mappings, effective
  baselines, bindings, ownership, nested collections, counts, order,
  geometry, page scope and platform scope;
- unchanged snapshots pass the ten-run repeatability gate.

This means the known capability vocabulary is sufficient for migration work.
It does **not** mean that no future rule can expose a genuinely new generic
capability. A new operator is accepted only after it is versioned, fail-closed,
proved in all four states and shown to be portable beyond one component.

### Knowledge coverage readiness

Coverage of all component knowledge is not complete. The current classified
inventory contains:

| Measure | Count |
| --- | ---: |
| packages | 28 |
| source rules | 851 |
| deterministic candidates | 348 |
| deterministic and executable now | 215 |
| deterministic, requiring typed authoring | 126 |
| deterministic, requiring a versioned capability | 7 |
| agent-required | 138 |
| human-review | 202 |
| policy-only | 1 |
| unresolved owner triage | 162 |

The Predicate contour therefore has enough proven machinery to scale, but it
does not yet contain enough compiled and field-proven rules to claim complete
Apollo coverage. The next programme is primarily knowledge migration and
evidence verification, not invention of another runtime.

## Terminology and status model

### Rule execution decision

Every authoritative source rule receives exactly one decision:

1. `deterministic / executable-now` — compiles with the current vocabulary;
2. `deterministic / typed-authoring` — semantics are deterministic, but the
   source still lacks a complete selector, fact, assertion or unknown policy;
3. `deterministic / new-capability` — evidence and semantics are exact, but a
   reusable versioned capability is absent;
4. `agent-required` — semantic interpretation or product context is genuinely
   required;
5. `human-review` — authority conflict, missing normative decision or an
   explicit manual gate prevents a machine verdict;
6. `policy-only` — useful guidance that does not produce a verdict;
7. `unresolved` — the owner has not yet chosen one of the routes above.

`deterministic` in prose is not enough to activate a rule. No compiler may
infer missing predicates from `ruleText`.

### Package maturity

A component or pattern moves through these states:

```text
Inventoried
  -> Classified
  -> Typed
  -> Compiled
  -> Unit-proven
  -> Figma-proven
  -> Regression-proven
  -> Ready
```

`Ready` is reserved for the canonical production Predicate release. An
experimental package that merely compiles is `ready-for-shadow-parity`, not
production-ready.

## Immediate consolidation gate: S0

Scaling the inventory has started, but production migration must pause at one
short consolidation gate so two execution paths do not diverge.

### Work

1. Promote the reusable Contract v2 package schema, execution closure and
   compiler output into the canonical Predicate compilation pipeline.
2. Make the main Predicate release consume the compiled first-wave packages:
   `Benefits`, `BackgroundPlate` and `ButtonStack`.
3. Keep one canonical executable source for every rule id; reject duplicate
   direct, composition, pattern and legacy registrations.
4. Preserve authority, revision, source checksum, applicability, unknown
   policy and presentation in the compiled RuleIR.
5. Record the loaded package and RuleIR release checksums in every predicate
   report.
6. Remove the need to enable the experimental Contract v2 toggle for target
   validation. Retain shadow comparison only as internal diagnostics until
   parity is closed.
7. Prove that previously closed packages, especially `BackgroundPlate`, do not
   regress when the compiler path changes.

### Acceptance

- the default Apollo path, without an experimental toggle, loads the new
  compiled rules;
- a source rule is executed at most once;
- the first-wave PASS/FAIL/UNKNOWN/NOT-APPLICABLE fixtures are classified
  completely;
- BackgroundPlate reproduces its previously approved results;
- Benefits and ButtonStack produce their intended findings with exact focus;
- ten unchanged runs are byte-stable after timestamp removal;
- the report contains zero unclassified targets and zero duplicate identities.

No new field rerun should be requested before this gate is complete.

### S0 preflight result — 2026-08-29

The proxy now contains a non-enforcing migration-wave audit:

```bash
cd services/apollo-proxy
npm run predicate:migration-audit
```

It verifies the Contract v2 package checksum against the current authoritative
`rules.json`, detects duplicate source ids, and reports whether every source
rule has exactly one production execution route. It deliberately does not load
experimental RuleIR into the verdict runtime.

Current result:

This table is the **Contract v2 migration wave only**. It is not the complete
inventory of canonical production Predicate packages. The already field-proven
production baseline remains active and is used as the regression oracle during
promotion:

| Existing production package | Source rules closed | Predicate contours | Composition routes | Other explicit routes |
| --- | ---: | ---: | ---: | ---: |
| `web-corp.title-view` | 42/42 | 11 | 4 | 27 |
| `web-corp.buttons-group` | 32/32 | 4 | 7 | 21 |
| `web-corp.status-property` | 25/25 | 8 | 0 | 17 |

Here, “closed” means that every source rule has exactly one declared execution
decision. It does not mean that every source rule is deterministic: the other
routes explicitly contain delegated, policy-only and context-only rules.
BackgroundPlate appears in the migration-wave table because it is deliberately
used as a no-regression control for the new package/compiler path.

| Package | Contract fresh | Production route closure | Runtime status |
| --- | --- | --- | --- |
| `web-corp.background-plate` | yes | 27/27 | `production-closed` |
| `web-corp-promo.benefits` | yes | 0/19 | `shadow-only` |
| `web-corp.button-stack` | yes | 0/15 | `shadow-only` |
| `web-core.amount` | yes | 0/2 | `shadow-only` |
| `web-core.tag-group` | yes | 0/2 | `shadow-only` |
| `web-corp.payment-masked-number` | yes | 0/2 | `shadow-only` |

Therefore the wave is fresh but is **not safe to promote**. The next change to
authoritative component knowledge must assign one reviewed production route to
every Benefits and ButtonStack source rule, add the missing typed contours and
facts, update the rule ledger, rebuild the Contract v2 artifacts, and only then
promote this audit to a blocking release gate. BackgroundPlate remains on its
existing canonical production path during that work.

## Scale programme

### S1 — migrate the 215 executable-now rules

Process packages in dependency-aware batches. Reusable Core boundary packages
come before host components that embed them. A batch should normally contain
five to ten related components and must not introduce component-name branches
in the runtime.

For every batch:

1. inventory all authoritative component and pattern sources;
2. assign stable rule ids and rule-level authority;
3. close every source rule to exactly one execution route;
4. compile executable rules to the canonical RuleIR release;
5. declare every required Snapshot v2 fact and its provenance;
6. run schema, closure, compiler and four-state unit fixtures;
7. create isolated Figma PASS/FAIL controls with exact expected focus;
8. run a mixed fixture to reveal selector overlap and duplicate findings;
9. run desktop/mobile-web and page-type applicability controls where relevant;
10. run the ten-repeat stability gate;
11. run regression tests for already Ready packages;
12. synchronize the rule ledger, component Predicate status and human-readable
    knowledge drift before marking the package Ready.

Suggested ordering:

1. reusable boundaries: Button, Status/StatusPreset, IconView, TagGroup and
   other common nested components;
2. host components whose deterministic rules compile without new capability;
3. page patterns using facts already proved by component packages;
4. remaining standalone components.

### S2 — author the 126 deterministic typed gaps

These are not engine tasks by default. A design-system owner supplies or
approves the missing structured selector, applicability, expected value,
exception or unknown policy. Apollo then compiles them through the existing
capability vocabulary.

Acceptance for each rule:

- no executable meaning is taken from prose;
- the typed assertion is sufficient to generate all atomic evaluations;
- PASS, FAIL, UNKNOWN and NOT-APPLICABLE are independently reproducible;
- the human-readable instruction remains semantically linked but is not the
  executable payload.

### S3 — review the seven capability gaps

Treat each gap as an architecture proposal, not a component-specific fix.

A new capability is accepted only when:

- the existing vocabulary cannot express the rule without losing semantics;
- its inputs and unknown behaviour can be typed and versioned;
- it works for at least two independent components or one component plus one
  pattern family, unless the domain is inherently unique;
- the registry rejects unsupported versions;
- pure four-state tests and real Figma evidence pass before activation.

### S4 — route non-deterministic knowledge

The 138 `agent-required` rules are evaluated only after deterministic facts
and applicable rules have been selected. The agent receives a compact packet,
not the unrestricted snapshot, and may return explanation, recommendation,
clarification or prioritisation. It may not add, remove, promote or downgrade
a deterministic finding.

The 202 `human-review` rules route to the design-system review flow with exact
Figma focus, source, missing decision and designer identity. The 162
`unresolved` rules require owner triage; they must not be assigned to an agent
merely because they are not currently executable.

### S5 — real-screen cutover

After package migration, run a curated corpus of real product screens rather
than only synthetic defects. Track precision, recall, duplicate rate,
not-evaluable rate, exact-focus rate and stability separately for components,
base patterns and page-specific patterns.

Only after the corpus gate passes:

- remove overlapping legacy registrations and old faceted-agent verdict code;
- remove the experimental Contract v2 UI toggle and duplicate runtime;
- make the canonical Predicate release the sole source of deterministic
  verdicts.

## Definition of Done for one component or pattern

A package is complete only when all of the following are true:

- every source rule has one stable id and one execution decision;
- authority, platform, page type, lifecycle and applicability are explicit;
- every deterministic rule compiles through a registered universal contour;
- no component identity appears in evaluator control flow;
- all required actual, baseline, binding, ownership and relation facts have
  provenance or resolve to `unknown`;
- exact source-rule closure has no missing, extra or duplicate ids;
- atomic unit tests cover four-state semantics;
- Figma PASS/FAIL cases produce the intended exact focus and Russian copy;
- unrelated canonical controls remain clean;
- cross-component ownership does not emit broader and stricter duplicates;
- ten repeated runs have one normalized result hash;
- existing Ready packages pass regression;
- machine-readable sources, human-readable mirrors and the cross-repository
  ledger are synchronized or their drift is explicitly recorded;
- the package Predicate status is changed from `Draft` to `Ready` only after
  all gates above pass.

## Progress reporting

The migration dashboard must report both engine and knowledge status. Minimum
fields per package:

- package id and component keys;
- source rule count;
- counts by execution decision;
- typed/compiled RuleIR count;
- unsupported capability count;
- missing Snapshot evidence count;
- unit, Figma, regression and repeatability status;
- production release checksum;
- legacy dependency count;
- human-readable parity/drift status;
- Predicate owner, status and last verified date.

Programme-level completion is not “all documents were converted”. It is:

1. every in-scope rule has an explicit route;
2. every deterministic route is compiled and evidenced;
3. every non-deterministic route is honestly delegated;
4. no rule is silently skipped, guessed from prose or executed twice.
