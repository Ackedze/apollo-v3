# DS Knowledge Contract: unified human and executable knowledge

Status: architecture discussion record  
Date: 2026-08-28  
Scope: Apollo v3, ApolloProxyControl, Athena/Athena CLI, `design-system_ab`,
`ds-ai-hub/products/ab`, `arui-private-ai-hub`, Arui-Private React contracts

## Decision summary

The existing systems must not be merged into one large document format or one
repository. They must share canonical identities and lifecycle for every
normative rule, component representation and cross-platform mapping, while
publishing separate projections for humans, deterministic tools, code
generators and agents.

The target model is a federated source of truth:

- Athena and `design-system_ab` own generated Figma mechanics and effective
  baseline evidence;
- `ds-ai-hub` owns curated design intent, normative claims and human guidance;
- Arui-Private and Core Components source code own the observed React API,
  exports, implementation lifecycle and code-level defaults;
- `arui-private-ai-hub` owns integration delivery: Figma-to-React mappings,
  MCP access and model-specific operational projections. It does not own a
  second copy of design rules;
- Apollo owns the closed predicate capability registry, compiler, RuleIR and
  deterministic evaluator;
- a knowledge compiler combines generated evidence and curated claims into a
  checksum-pinned runtime release;
- compiled runtime artifacts are not edited manually.

The canonical units are an atomic normative claim with a stable `ruleId`, an
identified component representation and a versioned mapping between
representations. A Markdown file, component package, skill or runtime JSON file
is only a projection of those units.

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

## What `arui-private-ai-hub` adds

The repository is an integration prototype rather than a new normative
knowledge base. Its genuinely new assets are:

- an MCP server facade over `design-system_ab`;
- a `figma-props-map.json` schema and six initial Figma-to-React mappings;
- a generated token snapshot with 1,113 DTCG-like token values sourced from
  `@alfalab/core-components-vars`;
- an Arui-Private coding skill that captures codebase conventions;
- research and architecture documents for design-to-code and assistant use
  cases.

These assets extend the previous analysis from design validation and Figma
generation into code generation. They introduce a missing fourth knowledge
type: a cross-representation mapping between the same semantic component in
Figma and React.

### Current repository maturity

The repository must currently be treated as `experimental`, not as an
authoritative production service:

- `mcp-server` is version `0.1.0` and has no automated test command;
- only 6 of the 151 required component packages have Figma-to-React map files;
  `CorporateContent` and `TabsView` currently contain zero mappings;
- the component loader scans only three flat categories and does not use
  `componentContractIndex.json`, so it misses nested Core/navigation and other
  packages known to Apollo;
- the default `DS_AB_ROOT` expects a sibling `design-system_ab`; in the current
  DS-AB-Plugin workspace the real checkout is `shared/design-system_ab`, so an
  explicit environment override is required;
- lifecycle detection reads `audit-mapping.status` and a guessed deprecated
  directory instead of Athena lifecycle/index evidence; replacement lookup is
  still a TODO;
- `validate_composition` does not evaluate `composition-contract.json` or
  RuleIR. It extracts PascalCase JSX tags, checks catalog presence/deprecation
  and emits an informational reminder when a composition file exists;
- `get_tokens` returns a hardcoded preliminary dictionary even though
  `tokens/tokens.json` exists; the `ds://tokens` resource returns a TODO string
  with JSON MIME type;
- `listResourceDefinitions` is implemented but not connected to runtime
  discovery;
- `validate.js` uses CommonJS `require` inside a package declared as ESM and
  fails immediately under the current Node runtime;
- `zod` is imported directly but is not declared as a direct dependency;
- architecture documents still state 145 packages and 32 patterns, while the
  current `design-system_ab` contains 151 required packages and 34 pattern
  files;
- `docs/agentic-files.md` describes an older Apollo loader and incorrectly says
  that generated contracts and overrides are not read by the current runtime.

The MCP facade is therefore useful as an API sketch, but its current answers
must not authorize Apollo findings, lifecycle decisions, code generation or
migrations without further validation.

### Duplicated skills

`corp-component-authoring` and `redpol-md-format` are byte-identical copies of
the canonical skills in `design-system_ab`. `figma-b2b-interface` is a Russian
translation of the repository-owned skill while its own source gate says that
the canonical copy lives in `design-system_ab`.

These copies should not become separately edited sources. The target options
are:

1. publish them as generated, checksum-pinned distribution artifacts;
2. install them from a versioned knowledge release;
3. keep only an installation manifest and remove maintained copies.

`arui-private-coding` is different: it describes code authoring conventions
owned by the React repository and may remain a dedicated human/agent
projection. Its component facts should eventually be generated or verified
against TypeScript exports, props and tests rather than maintained only in
prose.

### Figma-to-React mapping is a first-class contract

The mapping files are valuable and should remain distinct from design rules.
A rule states what is allowed; a mapping states how the same supported state is
represented in two runtimes.

The current mapping schema uses component names and paths only. A production
mapping must additionally contain:

- stable semantic `componentId`;
- Figma component key/package revision and React package/export/version;
- mapping ID, revision, lifecycle, owner and authority;
- applicability by platform and variant;
- explicit direct/transform/structural mapping semantics;
- source checksums for both representations;
- coverage for mapped, Figma-only and React-only fields;
- round-trip fixtures and expected lossy transformations;
- a failure policy when either side changes.

This mapping should be compiled and tested against Athena's mechanical
contract and an extracted TypeScript contract. It must not be inferred from
names at request time by an LLM.

## Federated ownership by fact type

| Fact type | Authoritative source | Published projection |
| --- | --- | --- |
| Figma keys, variants, layers, baseline and token binding | Figma libraries through Athena | `mechanics.compiled.json` |
| Design intent, component and pattern constraints | Owner-approved canonical claims, curated through `ds-ai-hub`/manual layer | human Markdown plus `rules.compiled.json` |
| React props, exports, defaults and deprecation annotations | Arui-Private/Core Components source and tests | `code.compiled.json` |
| Figma-to-React correspondence | Joint designer/developer mapping review in `arui-private-ai-hub` | `mappings.compiled.json` |
| Predicate capability and deterministic evaluation | Apollo | RuleIR execution result and coverage |
| Agent workflow | Skills generated from the release plus consumer-specific instructions | installable skill package |
| Examples | Reviewed fixtures/evals | opt-in eval bundle, never authority |

No repository is the source of truth for all columns. In particular,
`design-system_ab` cannot authoritatively describe the current React API, and
the React source cannot determine design intent or Figma composition semantics.

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

### Current Arui MCP inputs

The prototype MCP server reads package folders directly from
`design-system_ab/JSONS/web/components`, pattern Markdown directly from
`design-system_ab/patterns`, six local Figma-to-React map files and a separate
token snapshot. `get_component_api` concatenates raw JSON sections into a large
Markdown response. It does not consume Apollo's compiled RuleIR release or use
the Predicate Engine.

The target MCP implementation should instead be a thin query layer over one
versioned knowledge release:

- resolve component identity through the same registry as Apollo;
- return consumer-shaped projections rather than entire neighbouring files;
- delegate validation to the shared deterministic evaluator;
- expose provenance, release ID and coverage with every response;
- provide human references by canonical claim ID;
- refuse a definitive answer when the requested release is incomplete or its
  Figma/code checksums no longer match.

Apollo Proxy and the MCP server should not contain separate implementations of
the same rule language. A second interpreter would recreate the drift that the
Predicate Engine migration is intended to remove.

## Are Athena packages excessive?

Yes, at the semantic-authoring level. No, not all of the files are immediately
deletable from the current runtime.

For every covered component Athena currently maintains seven neighbouring
documents in addition to the raw catalog and index. A representative TitleView
package is approximately 1.7 MB and repeats component meaning across several
manual/hybrid documents. The excess is primarily duplicated semantic
ownership, not merely file count.

`arui-private-ai-hub` currently consumes this excess by loading and returning
several neighbouring documents together. That is another reason to compile
consumer-specific projections: MCP/code generation should not require
`agent-context`, examples, raw composition and full rules JSON in one response.

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

The shared identity layer must additionally define:

- `componentId` independent of a Figma display name or React export;
- representation IDs for Figma, React and other platforms;
- stable token and pattern IDs;
- `mappingId` and revision for every cross-representation mapping;
- source revisions/checksums and compatibility ranges.

Human Markdown remains curated but references canonical claim IDs. Generated
rule summaries may be embedded in rendered documentation, while executable JSON
blocks must not be independently edited copies.

## Target build pipeline

```text
Figma libraries
  -> Athena generated evidence
  -> mechanics.compiled

Arui-Private + Core Components source/tests
  -> TypeScript/API extractor
  -> code.compiled

Owner-approved claims + ds-ai-hub guidance
  -> claims registry

Reviewed Figma-to-React maps
  -> mapping validator against mechanics.compiled + code.compiled
  -> mappings.compiled

mechanics.compiled + code.compiled + claims + mappings
  -> schema + authority + conflict + execution-closure validation
  -> knowledge compiler
  -> versioned knowledge release
       mechanics.compiled
       code.compiled
       rules.compiled
       mappings.compiled
       coverage.json
       human reference manifest
  -> Apollo Snapshot v2 + Predicate Engine
  -> Arui MCP query facade
  -> generation and code-review skills

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
pattern as the first closed set. Add BenefitCard as the first Figma-to-React
mapping proof because it already has a non-empty map and code-oriented skill
references:

1. inventory every existing human and executable claim;
2. resolve contradictions with the design-system owner;
3. publish `ds-knowledge-claim.v1` and stable canonical IDs;
4. import current predicate contours without behavior changes;
5. link/render human docs from the same IDs;
6. extract a versioned React contract for the mapped components;
7. migrate one reviewed Figma-to-React map to mapping schema v2 and verify both
   source checksums;
8. compile the current runtime artifacts and serve the same release through an
   MCP query without reinterpreting rules;
9. keep exact Apollo focus, action and ten-run repeatability tests;
10. add Figma generation, React generation and round-trip PASS/FAIL evals;
11. update Athena and Athena CLI to preserve manual claims and publish the
   compiled release atomically;
12. prevent stale or partial publication through checksums and CI gates.

The MVP is complete when a normative change is authored once, both the human
document and Apollo expose the same expectation, MCP returns that same claim,
the Figma-to-React mapping is verified against both representations, and a
conflict like the TitleStatus case fails CI before publication.

## `arui-private-ai-hub` integration backlog

### P0: make the facade truthful

1. Mark the MCP server and its validation tools as experimental in responses.
2. Fix `validate.js`, declare direct dependencies and add build/schema/tool
   tests in CI.
3. Replace directory guessing with `componentContractIndex.json` and support
   all package groups.
4. Read lifecycle and replacements from Athena's canonical indexes instead of
   `audit-mapping` and guessed directories.
5. Wire `get_tokens` and `ds://tokens` to the existing token artifact; remove
   the hardcoded dictionary and invalid TODO resource.
6. Rename or disable `validate_composition` until it delegates to the shared
   evaluator. It must not report a composition as validated when it only found
   JSX tag names.
7. Add a release ID, provenance and coverage to every MCP response.

### P1: integrate without duplication

1. Publish mapping schema v2 and migrate the six pilot mappings.
2. Extract React contracts from TypeScript and tests.
3. Validate maps bidirectionally and fail CI on stale Figma or React checksums.
4. Serve compact compiled projections instead of concatenating all component
   package files.
5. Replace duplicated canonical skills with generated, versioned packages or
   an installation manifest.
6. Update or archive `docs/agentic-files.md` and the numerical inventory in the
   integration plan so they do not contradict current Apollo behavior.

### P2: agent capabilities

After P0/P1, use an agent for intent clarification, component discovery,
explanation, root-cause prioritization and code-generation planning. The agent
may query MCP for exact claims and mappings, but deterministic validation must
remain in the shared evaluator.
