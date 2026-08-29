# Contract v2: Ready Corp rule classification

## Outcome

The Contract v2 experiment now profiles every package marked Ready in the
`Corp components` inventory and closes every source rule to one explicit
execution decision. This is an authoring and migration artifact; it does not
enable Contract v2 enforcement in production Apollo.

Canonical generated artifacts live in `design-system_ab`:

- `JSONS/experiments/component-contract-v2/ready-package-rule-profile.json` —
  source-field and capability inventory for all 25 Ready Corp packages;
- `JSONS/experiments/component-contract-v2/rule-execution-classification.json`
  — rule-by-rule decision map;
- `JSONS/experiments/component-contract-v2/rule-execution-classification.md` —
  review projection;
- `JSONS/experiments/component-contract-v2/migration-wave-1.json` — packages
  requiring no new runtime operators;
- `<package>/execution-policy.json` — complete source-rule closure for every
  experimental package.

## Decision boundary

The classifier does not normalize source fields and never treats `ruleText` as
executable authority.

| Decision | Meaning |
| --- | --- |
| `deterministic` | The rule compiles now, or its explicit structured assertion fields make a deterministic implementation unambiguous. |
| `agent-required` | The source explicitly declares `checkType=llm` or `contextual`; semantic interpretation is required. |
| `human-review` | The source explicitly declares `checkType=manual`. |
| `policy-only` | Dictionary/classification material that does not produce a verdict. |
| `unresolved` | Prose-only or insufficiently typed source. An owner must choose typed deterministic authoring, an agent route or human review. |

This boundary deliberately leaves prose-only `checkType=deterministic` rules
unresolved. A deterministic label is not proof that selectors, facts,
assertion parameters and unknown-evidence semantics are complete.

## Ready inventory result

- packages: 25;
- source rules: 839;
- deterministic: 337;
- agent-required: 138;
- human-review: 201;
- policy-only: 1;
- unresolved: 162.

Within the deterministic set:

- 204 rules compile now;
- 126 require typed authoring using the existing capability vocabulary;
- 7 require a versioned capability/operator contract before implementation.

The remaining 162 rules are deliberately not assigned to an agent merely
because they are not executable. They need owner triage: some must receive a
typed predicate, some may be explicitly routed to an agent, and some may
require human review. `authority` metadata proves the status of a source but
does not by itself describe an executable assertion.

## First migration wave

The first Ready wave is derived by the compiler: deterministic coverage must
be 100% and `unsupported=0`.

- `web-corp-promo.benefits`;
- `web-corp.background-plate`;
- `web-corp.button-stack`.

Supporting packages with the same property are kept separate because they are
not members of the Ready Corp inventory:

- `web-core.amount`;
- `web-core.tag-group`;
- `web-corp.payment-masked-number`.

The wave status is `ready-for-shadow-parity`, not production cutover. Each
package must still pass runtime parity, evidence completeness and field-report
gates before enforcement can be enabled.

## Build and validation

Rebuild:

```bash
node scripts/build_component_contract_v2_capability_experiments.js
```

Validate:

```bash
node scripts/validate_component_contract_v2_experiments.js
```

The validation gate rejects missing package policies, duplicate or omitted
source rules, an agent decision without source authority, prose promoted to a
deterministic decision, and drift between the computed Ready wave and the
migration manifest.

## Drift found during the run

The full rebuild exposed a stale TitleView experiment rule ID:
`title-status-may-be-standalone` had already been replaced by
`title-status-requires-status` in the authoritative source. The special
TitleView builder was updated to the active rule and its conditional
`View=xLarge + TitleStatus=True -> Status=True` semantics.

TitleView and Status & Property are not in wave 1 after the current-source
rebuild. Each has one remaining typed Contract v2 authoring gap. They remain
deterministic candidates, but are correctly blocked from a zero-gap migration
wave until those rules compile.
