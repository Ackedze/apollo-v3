# Predicate Snapshot v2 gap audit

Status: implementation input  
Date: 2026-08-22

## Decision

The existing `ApolloAuditEvidenceBundle` is the raw Figma evidence source for
Predicate Snapshot v2. The replacement engine must not consume the old
Semantic Fact Model, architecture aggregates or agent classifications.

The plugin collects observable Figma facts once. A pure adapter converts that
immutable bundle to Snapshot v2. The proxy may join canonical release metadata
by stable ids, but it may not infer an expected value, owner, slot or verdict
from names or prose.

## Facts already available

| Snapshot v2 requirement | Existing source | Decision |
| --- | --- | --- |
| visible node id, parent, children and order | `evidenceBundle.graph.nodes` | reuse |
| path, name and node type | evidence node | reuse |
| absolute bounds | `node.bounds` | reuse |
| auto-layout, sizing, alignment, padding and gap | `node.layout` | reuse |
| component key and component properties | `node.component` | reuse |
| direct Figma overrides | `node.component.directOverrides` | reuse |
| nearest component owner | `node.componentOwner` | reuse after owner-property extension |
| text and style ids | `node.text`, `node.styles` | reuse |
| raw variable ids | `node.variableBindings` | reuse |
| direct-child, sibling-gap and container-padding relations | `graph.relations` | reuse |
| exact changed baseline/actual pairs | `changes` | reuse |
| hidden-layer exclusion counters | `coverage` | reuse |

Decorative primitives are normally excluded to keep the semantic packet
compact. There is one mandatory exception: if a visible primitive has an exact
entry in `changes`, the evidence graph must retain that exact node. Otherwise
the fact exists but no predicate subject exists, which silently loses valid
radius, opacity, paint or layout overrides on masks and vector/boolean layers.
The exception is driven only by changed node ids, never by component or layer
names.

## Missing evidence

### P0 for the first field packet

1. ~~Figma file/page id and normalized platform in report context.~~ Added to
   `ApolloAuditEvidenceBundle.context`.
2. ~~Component identity, family/library and lifecycle resolved from the exact
   component key and pinned release index.
   component key and pinned release index.~~ Implemented in the proxy release
   adapter for component keys present in the frozen bundle.
3. Owner component properties on every descendant. This is now collected in
   `componentOwner.componentProperties` and enables P02 without ancestry-name
   matching.
4. A normalized `unknownFacts` list per node plus collection errors. A missing
   Figma property must not be confused with a known absent value.
5. ~~Release identity: knowledge source, revision and checksum.~~ The first
   pilot pins the component-index checksum and each RuleIR pins its exact
   source-contract checksum.
6. ~~Snapshot hash calculated after normalization and before evaluation.~~
   Implemented by the pure Snapshot v2 adapter.

### P0 before baseline/binding field cases

1. Effective baseline values for every property requested by compiled rules,
   including origin, selected variant and reference revision. P04 now covers
   `styles.text`: an exact WIP change supplies readable baseline/actual values,
   while an unchanged published instance is proven by absence of the matching
   direct text-style override. An override without an exact diff is explicitly
   unknown. P26 extends this policy to root opacity and radius: actual values
   are collected from Figma, exact changed baselines come from the WIP diff,
   and an unchanged baseline is inferred only when no matching direct override
   exists. Paint, layout, effect and complete release-origin coverage remain.
2. Variable and style metadata: canonical name, collection, mode and stable
   published identity. P05 now carries variable key, readable token name,
   collection id/name and the raw Figma id for layout bindings. Variable mode
   context and the remaining style/paint families are still incomplete.
3. Paint state including visible paints, tokenization and explicit absence.
4. ~~Radius and opacity in the evidence graph rather than only in the legacy
   component snapshot.~~ Added for P26. Effects remain.
5. Explicit slot identity and allowed replacement boundary from a canonical
   component contract.

### Deferred

- prototype reactions and inferred interaction semantics;
- responsive counterpart inference;
- editorial interpretation;
- semantic roles inferred only from layer names.

## Ownership contract

For each visible node inside a component instance, the plugin records the
nearest observable component owner:

```json
{
  "nodeId": "owner figma id",
  "componentKey": "published key",
  "variantProperties": { "Size": "56" },
  "componentProperties": { "Size": "56", "Overflow": true },
  "relativePath": "Slot / Button"
}
```

The Snapshot v2 adapter exposes this as `ownership.owner`. Predicate rules read
facts such as `ownership.owner.component.properties.Size`; the predicate
engine never searches ancestors by a component name.

## Construction order

1. [x] extend owner evidence and prove it with a plugin regression;
2. [x] add file/page/platform and release context;
3. [x] implement a pure evidence-bundle-to-Snapshot-v2 adapter;
4. [x] validate and hash one frozen packet;
5. [x] compile P01 and P02 RuleIR only;
6. [x] connect the isolated proxy endpoint and create the first Figma contour;
7. [x] route the Patterns pilot directly to Predicate Engine without an agent;
8. run the field report and repeatability gate;
9. [x] add the first effective-baseline evidence for P04 TitleView typography;
10. [x] add the first resolved binding evidence for P05 BackgroundPlate padding;
11. [x] add the first generic appearance baseline family for P26 opacity and
    radius;
12. add remaining baseline/binding families only when their predicate cases begin.

No current agent/SFM field is accepted merely because it exists. Every field
must have an observable Figma source or a canonical pinned-release source.
