# DS Knowledge Contract: unified human and executable knowledge

Status: architecture discussion record  
Date: 2026-08-28  
Scope: Apollo v3, ApolloProxyControl, Athena/Athena CLI, `design-system_ab`, `ds-ai-hub/products/ab`

## Decision summary

The three existing systems must not be merged into one large document format.
They must share one canonical identity and lifecycle for every normative rule,
while publishing separate projections for humans, deterministic tools and
agents.

The target model is a federated source of truth:

- Athena and `design-system_ab` own generated Figma mechanics and effective
  baseline evidence;
- `ds-ai-hub` owns curated design intent, normative claims and human guidance;
- Apollo owns the closed predicate capability registry, compiler, RuleIR and
  deterministic evaluator;
- a knowledge compiler combines generated evidence and curated claims into a
  checksum-pinned runtime release;
- compiled runtime artifacts are not edited manually.

The canonical unit is an atomic normative claim with a stable `ruleId`, not a
Markdown file, component package or runtime JSON file.

## Why the current model drifts

The same design-system meaning is currently repeated in several places:

1. human instructions and cookbook in `ds-ai-hub`;
2. mirrored pattern Markdown in `design-system_ab/patterns`;
3. `rules.json`;
4. `composition-contract.json`;
5. `agent-context.json`;
6. occasionally `audit-mapping.json`, `README.md` and examples;
7. the executable interpretation compiled by Apollo.

TitleView provides a confirmed conflict. Human-readable documents say that
`TitleStatus` may be used without the upper `Status`, while the current active
component rule `component:web-corp.title-view.title-status-requires-status`
requires `Status=true` for `View=xLarge`. `agent-context.json` repeats the
machine-readable requirement. The human documents therefore no longer match
the behavior accepted during Apollo predicate testing.

Pattern mirrors have also diverged. The `design-system_ab` versions of the
TitleView, form-construction and button patterns contain executable
`apollo-predicate-contour` blocks that are absent from their `ds-ai-hub`
counterparts. Copying whole files in either direction would lose either the
human front matter/product packaging or the executable additions.

## Current Apollo deterministic runtime inputs

### Figma plugin component audit

The Apollo v3 plugin resolves remote packages through:

- `JSONS/referenceSourcesMVP.json` and the catalog manifests it references;
- raw component/token/style catalogs needed for the existing deterministic
  component categories;
- `JSONS/apollo/indexes/componentContractIndex.json`;
- package `contract.generated.json` for public component keys, platform,
  variants, allowed values and combinations;
- package `rules.json` for component rules and predicate contours;
- package `composition-contract.json` for ownership, nested effective baseline
  and composition constraints;
- package `contract.overrides.json` as manual public API/reset/ownership input;
- package `agent-context.json` for compact component semantics used by the
  legacy/agent-facing path;
- package `audit-mapping.json` for display names, grouping and reset
  presentation where mappings exist;
- package `examples.json` only through the optional/lazy example path, not as a
  normative verdict source.

The plugin currently fetches all listed package artifacts for matched required
packages. Therefore removing an indexed artifact before changing the plugin
loader can break strict-mode startup even when the Predicate Engine itself does
not need that artifact.

### Apollo proxy Predicate Engine

`POST /v1/validate/predicates` does not start Codex. Its deterministic release
uses:

- the evidence bundle received from Apollo;
- `componentContractIndex.json`;
- relevant `contract.generated.json` entries;
- active `rules.json` predicate contours;
- active `composition-contract.json` contracts/policies;
- executable `apollo-predicate-contour` blocks from selected pattern Markdown;
- Apollo-owned predicate capability, Snapshot v2, RuleIR and result schemas;
- source checksums, authority and execution-closure metadata.

`agent-context.json`, `audit-mapping.json`, `examples.json` and prose cookbook
are not required to calculate the Predicate Engine verdict.

### Codex dialogue in Apollo

The answer depends on how ApolloProxyControl is run:

- the built macOS application contains an embedded read-only snapshot of the
  complete `ds-ai-hub`, selected `design-system_ab` patterns/redpolicy/Apollo
  indexes and all contract artifacts referenced by
  `componentContractIndex.json`;
- by default a Codex chat launched from that app receives read-only access to
  the selected embedded root (`ds-ai-hub` or `design-system_ab`);
- `CODEX_DS_AI_HUB` and `CODEX_DESIGN_SYSTEM` can override the embedded roots
  with external local checkouts;
- when the proxy is started directly from the repository, its fallback paths
  resolve the neighbouring repository checkouts instead of the app snapshot.

Therefore the statement “Codex always reads data baked into the proxy” is true
for the distributed app with default settings, but is not universally true for
development or explicitly overridden configurations. Switching
`APOLLO_CODEX_KNOWLEDGE_SOURCE` changes which of the two roots Codex may read;
it does not download a fresh repository revision automatically.

## Are Athena packages excessive?

Yes, at the semantic-authoring level. No, not all of the files are immediately
deletable from the current runtime.

For every covered component Athena currently maintains seven neighbouring
documents in addition to the raw catalog and index. A representative TitleView
package is approximately 1.7 MB and repeats component meaning across several
manual/hybrid documents. The excess is primarily duplicated semantic
ownership, not merely file count.

### Keep as required runtime inputs for the current migration

| Artifact | Decision | Reason |
| --- | --- | --- |
| `componentContractIndex.json` | Keep | Package/key routing, coverage and artifact discovery. |
| `contract.generated.json` | Keep, then compact | Current plugin and Predicate Engine need public keys, variants, platform and Component API. Replace later with a smaller compiled mechanical contract, not with prose. |
| `rules.json` | Keep until claims compiler exists | Current canonical executable component rules and execution closure. |
| `composition-contract.json` | Keep until all composition claims compile to RuleIR | Current ownership, nested baseline and relational constraints depend on it. |

### Keep as authoring source, remove from runtime publication later

| Artifact | Target change |
| --- | --- |
| `contract.overrides.json` | Preserve as manual source for Athena/compiler. Do not make Apollo load it separately after its public API, ownership and reset semantics are compiled into the release. |

### Replace with generated projections

| Artifact | Target change |
| --- | --- |
| `agent-context.json` | Stop manual per-package authoring. Generate compact agent context from claims, component metadata and human guidance. Eventually omit it from deterministic packages. |
| `audit-mapping.json` | Move display name, group, severity, focus and remediation into the canonical claim/presentation schema. Generate one compact presentation projection. |

### Move out of runtime component packages

| Artifact | Target change |
| --- | --- |
| `examples.json` | Move normative PASS/FAIL/UNKNOWN/NOT_APPLICABLE cases into an eval/fixture tree. Publish only when a consumer explicitly requests examples. It must never authorize a verdict. |
| per-package generated `README.md` | Keep human onboarding in `ds-ai-hub`; replace repeated boilerplate README files with one package-format document plus generated links/coverage reports. Retain only genuinely component-specific authored README content until migrated. |

### Final target package

After migration a published component release should be reducible to:

1. `mechanics.compiled.json` — keys, lifecycle, public API, exact effective
   baselines and provenance;
2. `rules.compiled.json` — RuleIR/claims projection including composition,
   presentation and remediation;
3. `coverage.json` — source-rule closure, fact/capability requirements and
   checksums;
4. one registry entry pointing to those artifacts.

The authored sources remain in Athena/manual claims and `ds-ai-hub`; they do not
all need to be distributed to every Apollo user.

## Human-readable documents that require correction

### Confirmed immediate TitleView drift

The current executable decision is: for `View=xLarge`, visible/enabled
`TitleStatus` requires `Status=true`; for `Large`, `Medium` and `Small` the slot
is unavailable and a hidden stored property value is not evaluated.

The following human-readable sources currently contradict it and must be
updated together:

- `ds-ai-hub/products/ab/components/title-view/instructions.md`;
- `ds-ai-hub/products/ab/patterns/title-view.md` — overview, Rule 5, Rule 26 and
  the final agent/checklist guidance;
- `design-system_ab/patterns/p_title-view.md` — the same mirrored sections;
- `design-system_ab/JSONS/experiments/component-contract-v2/web-corp/TitleView/source/README.md`.

`ds-ai-hub/products/ab/components/title-view/cookbook/04-status-and-holding.md`
and `cookbook/07-verify.md` do not contain the direct contradictory sentence,
but should receive the positive `View=xLarge + Status=true` verification step
so the cookbook is complete.

Rule 26 must not merely be reworded under the old
`title-status-may-be-standalone` identity. The old claim should be deprecated or
replaced by an explicitly mapped canonical rule ID matching the active component
rule.

### Required broader drift audit

The following packages/patterns were modified or exercised during the new
Predicate Engine migration and must be compared claim-by-claim with their
human-readable `ds-ai-hub` instructions, cookbook and pattern documents:

- Button and ButtonsGroup;
- BackgroundPlate and BackgroundPlateSlot;
- TitleView, Status & Property, FilterCompanySelect;
- Benefits and BenefitCard;
- TableView;
- AccountSelect;
- TabsView;
- IconView;
- CardImage;
- Onboarding Tooltip;
- CorporateContent;
- form-construction, TitleView and buttons/button-group patterns.

This audit must compare stable rule IDs and assertions, not whole-file text or
similarity. Until the canonical claim registry exists, every change to an active
rule in these packages must include the corresponding human-document diff in
the same PR.

## Canonical claim model

An atomic normative claim should contain at least:

- stable `ruleId` and revision;
- subject, scope and semantic role;
- applicability by product, platform, channel, page type and variants;
- human title, expectation and rationale;
- authority, lifecycle and owner;
- required evidence/facts and provenance;
- severity and unknown policy;
- execution route: predicate, composition, delegated, policy, context-only or
  coverage-gap;
- executable contour when deterministic;
- generation constraint;
- presentation, focus and user-approved remediation;
- references to human guidance;
- PASS, FAIL, UNKNOWN and NOT_APPLICABLE eval cases.

Human Markdown remains curated but references canonical claim IDs. Generated
rule summaries may be embedded in rendered documentation, while executable JSON
blocks must not be independently edited copies.

## Target build pipeline

```text
Figma libraries
  -> Athena generated evidence
  -> preserved manual claims from ds-ai-hub
  -> schema + authority + conflict + execution-closure validation
  -> knowledge compiler
  -> mechanics.compiled + rules.compiled + coverage
  -> Apollo Snapshot v2 + Predicate Engine

Curated claims
  -> human Markdown references/rendered rule summaries
  -> generation constraints and compact agent context
  -> eval fixtures
```

LLM participation starts after deterministic facts and verdicts. The agent may
resolve ambiguous intent, ask clarification, group causal findings, prioritize
root causes and explain alternatives. It must not reinterpret a verified
predicate violation or invent a missing rule.

## Migration MVP

Use TitleView, Button, ButtonsGroup, BackgroundPlate and the form-construction
pattern as the first closed set:

1. inventory every existing human and executable claim;
2. resolve contradictions with the design-system owner;
3. publish `ds-knowledge-claim.v1` and stable canonical IDs;
4. import current predicate contours without behavior changes;
5. link/render human docs from the same IDs;
6. compile the current runtime artifacts;
7. keep exact Apollo focus, action and ten-run repeatability tests;
8. add generation PASS/FAIL evals;
9. update Athena and Athena CLI to preserve manual claims and publish the
   compiled release atomically;
10. prevent stale or partial publication through checksums and CI gates.

The MVP is complete when a normative change is authored once, both the human
document and Apollo expose the same expectation, and a conflict like the
TitleStatus case fails CI before publication.
