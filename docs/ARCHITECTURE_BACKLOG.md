# Apollo Architecture Backlog

## 1. Supporting package field verification (2026-08-29)

- [x] Complete the Apollo v3 field checks for the three supporting packages:
  - `Amount`, section `12606:59315` — exactly two deterministic violations;
  - `TagGroup`, report `22-03-52_predicates.json` — exactly one nested Tag
    `Size 40 != 56` violation; the `RightAddon` icon replacement remains
    allowed;
  - `PaymentMaskedNumber`, report `22-03-31_predicates.json` — exactly two
    text-fill violations on `Major` and `Minor`.
- All three report sets have complete classifications, no unexpected findings
  and stable deterministic output. The supporting-package field gate is closed.

## Architecture reset: deterministic Predicate Engine MVP (2026-08-22)

The current Semantic Fact Model / faceted-agent verdict path is frozen as a
comparison baseline. New component and pattern verdict behavior is implemented
only in the replacement predicate engine described in
`docs/PREDICATE_ENGINE_MVP.md`. The old path is removed after the replacement
passes deterministic cutover gates; do not add more component-specific proxy
normalizers or agent prompt rules.

### P0: closed contract

- [x] Define the MVP boundary, stable truth/applicability semantics and cutover gates.
- [x] Publish a machine-readable closed registry of selectors, fact families, predicates and authority gates.
- [x] Draft JSON Schemas for snapshot v2, RuleIR v1, predicate trace, coverage ledger and final result.
- [x] Ratify the drafted schemas after the plugin-to-engine field contour and
  ten-run repeatability gate passed in Figma on 2026-08-24.
- [ ] Publish a source-field-to-RuleIR mapping for every structured field used by the pilot component and form rules. Four production waves are published in `docs/PREDICATE_SOURCE_TO_RULE_IR.md`: ButtonsGroup composition, TitleView slot order, required effective baseline and generic token-binding sets now compile without component-specific runtime rule construction; the remaining component and form source shapes are still pending.
- [ ] Reject unknown predicates, unknown fact readers, ambiguous identities and incomplete active rules at compile time.

### P0: pure predicate engine

- [x] Create the isolated engine module with ordered initial selectors and typed literal/fact resolution without Figma or agent dependencies.
- [x] Implement three-valued predicate logic and applicability independently for the first vertical slice.
- [x] Implement `exists`, `equals` and `one-of` with all four test outcomes and stable traces.
- [x] Implement every predicate in `apollo-predicate-capabilities.v1.json` with PASS, FAIL, UNKNOWN and NOT-APPLICABLE fixtures.
- [x] Add the universal P21–P28 contour compiler, graph queries, closed
  arithmetic derivations and approximate numeric comparison; keep all
  component identities in rule data rather than runtime branches.
- [x] Discover active component contours from package `rules.json` and active
  pattern contours from fenced machine-readable blocks in Markdown patterns;
  pin both to their exact source checksums before compilation.
- [x] Generate stable evaluation ids, deterministic ordering, exact focus targets and a complete predicate trace.
- [x] Require exactly one terminal coverage classification per evaluation target.

### P0: canonical snapshot v2

- [x] Audit the current plugin snapshot against the fact-family requirements and add only missing evidence. See `docs/SNAPSHOT_V2_GAP_AUDIT.md`.
- [x] Exclude hidden layers from selection and aggregates.
- [ ] Preserve exact effective-baseline value, origin, selected variant and release revision per auditable property. P04 proves `styles.text`; P26 adds observable `appearance.opacity` and `appearance.radius`, uses exact WIP baseline/actual pairs for changed properties, and derives an unchanged baseline only when no matching direct Figma override exists. Paint, layout, effects and complete release-origin metadata remain.
- [x] Materialize nested effective baseline with property-level ownership. The
  runtime now merges canonical host and selected nested baselines per property,
  records `referencePropertyOwners`, prefers exact variant-patch provenance and
  does not infer ownership from component names or decorated layer paths.
- [x] Preserve the selected root width as `context.viewportWidth`; ambiguous
  multi-root selection and missing bounds are explicit `unknown` evidence.
- [ ] Preserve component/slot ownership, ordered structure, bounds, auto-layout, styles, bindings and explicit overrides. Nearest component owner properties, Figma file/page identity and normalized platform are now preserved; P05 adds resolved padding binding metadata, while slot identity and remaining binding families remain.
- [x] Validate and hash the immutable snapshot before proxy evaluation; unresolved component metadata becomes `unknown` instead of a guessed identity. Per-node collection error production remains part of the next evidence wave.

### P0: predicate-by-predicate Figma contour

- [x] Prepare `12161:122197` as the canonical predicate test section; P01/P02 PASS/FAIL use published components, while UNKNOWN/NOT-APPLICABLE remain sanitized fixtures where a broken live component would be unstable.
- [x] Test the first value predicates on component properties and variants (`one-of`, `equals`).
- [x] Test `matches-effective-baseline` for TitleView fixed typography with published PASS/FAIL cases, exact nested focus and fail-closed unknown evidence.
- [x] Test the first token binding predicate on BackgroundPlate padding.
- [x] Test collection predicates on ButtonsGroup. P03 covers `value-position`; P09 compiles the active `button-count` constraint to `count-between`, focuses the ButtonsGroup owner and has PASS/FAIL/UNKNOWN/NOT-APPLICABLE fixtures.
- [x] Prove the first cross-component contour beyond the original pilot:
  P10 validates Benefits Capacity, P11 validates the Horizontal TableView
  Header, and P12 validates every direct Row against root Compact plus the
  canonical nested SpacingVertical instances. The 2026-08-23 P12 field run
  produced 24 evaluations, one exact violation and exact nested Row focus.
- [x] Field-prove P13 `Benefits` nested-card setting uniformity. The compiled
  rule checks `Background`, `CardAxis`, `Compact` and `GraphicPosition` in one
  owner-level evaluation; published PASS `12238:47999` and FAIL `12238:48065`
  fixtures are ready.
- [x] Field-prove P14 `Horizontal TableView / Compact=True` one-column usage.
  Published PASS `12242:17323` resolves every Body Row to one data Column;
  FAIL `12242:17647` exposes two Columns in the exact overridden Body Row
  `I12242:17647;60668:82232`. The 2026-08-23 field report records `actual=1`
  for PASS, `actual=2` for FAIL and focuses that Row rather than the TableView
  owner or test section.
- [x] Test parent/ancestor/slot/order predicates on BackgroundPlate and TitleView. P06 compiles the generic `co-located-underlay` contour from BackgroundPlate `rules.json`; its adapter and runtime contain no BackgroundPlate-specific facts or rule registration, and the 2026-08-25 field run proved one exact PASS plus one exact FAIL with stable ten-run output. P07 compiles the generic `owned-peer-property-equality` contour from TitleView `rules.json`, has no TitleView-specific runtime facts or rule registration, and passes the complete four-state matrix; P08 compiles TitleView `slotOrderPolicy` into exact slot ownership plus `after`, and its pure PASS/FAIL/UNKNOWN/NOT-APPLICABLE contour passes. A live P08 FAIL is intentionally unavailable because published instance children cannot be reordered without detaching the component.
- [x] Test geometry predicates on form paddings, block gaps, alignment and 8/4
  layout through P15–P19 with exact field focus.
- [x] Field-test universal contours P21–P28 using the canonical fixtures. P21
  `public-root`, P22 `context-map`, P23 `uniform-allowed-collection`, P24
  `breakpoint-map`, P25 `sizing` and P26 `baseline` are field-proven. P25 evaluated two live
  PASS plus two live FAIL Benefits roots in one stable ten-run audit and
  returned exactly two violations. P26 evaluated published TitleView opacity
  roots as `1 == 1` and `0.5 != 1`, returned one exact-root violation and
  passed the ten-run repeatability gate. P27 is active from
  `p_title-view.md`, passes the complete pure tri-state matrix and is field-proven
  with exact resolved-root counting. P28 is compiled from the active form
  pattern as one atomic multi-formula `derived-geometry` evaluation and is
  field-proven on PASS `12276:48914` and FAIL `12276:51033`. The 2026-08-25
  report classified PASS as compliant, produced one page-specific violation
  for FAIL, focused the exact grid owner and passed the ten-run repeatability
  gate. The complete fixture matrix is specified in
  `docs/PREDICATE_FIELD_CASES.md`.
- [x] Repeat each real predicate request ten times over the same Snapshot v2 and
  rule release; fail closed unless all normalized result hashes are identical.

### P1: pilot cutover

- [ ] Compile all observable active deterministic BackgroundPlate, TitleView and ButtonsGroup rules to RuleIR.
  - [x] Complete the first production package migration on TitleView. All 42
    source rules are closed exactly once across direct predicates, composition,
    delegation, policy and context-only routes. The release loader rejects a
    missing/duplicate route, incomplete authority or an absent composition
    constraint. Generic `baseline-set`, `fact-assertion` and declared
    composition facts cover the new executable rules without TitleView runtime
    branches. PASS/FAIL/UNKNOWN and exact-focus integration tests are included;
    `design-system_ab` commit `61f32718` is the published source. Reuse
    `docs/EXECUTABLE_RULE_PACKAGE_MIGRATION.md` for every next package.
  - [x] Compile the complete ButtonsGroup composition contract (`countBetween`, `propertyDomain`, `propertyEqualsHost`, `valuePosition` and typed host conditions) from source data. Unknown operations and inactive/incomplete authority fail closed before evaluation; the legacy hardcoded runtime registration is removed.
  - [x] Compile TitleView slot order from a generic `apollo.slot-order-policy.v1` source contract. Owner identity, content container and ordered roles now enter the snapshot adapter as policy data; both the former TitleView-specific fact builder and hand-written RuleIR rule are removed.
  - [x] Compile TitleView fixed typography through the generic `baseline` contour with required-value semantics. The source `rules.json` owns selector, fact pairs, authority, presentation and scope; the former hand-written P04 runtime rule is removed.
  - [x] Compile BackgroundPlateSlot padding token requirements through the generic `binding-set` contour. The source `rules.json` emits four independent RuleIR rules, restricts applicability to public BackgroundPlateSlot roots and owns the UI copy; the former hand-written P05 runtime rules are removed.
  - [x] Close the complete BackgroundPlate source package. All 27 source rules
    now have exactly one execution route: 9 direct predicates, 1 delegated
    rule, 8 explicit policy rules and 9 context-only rules. The direct release
    adds source-owned contours for nested level legality, the Level-2 Type
    domain, conditional Colored/Border paint bindings, Border/Colored paint
    state, Primary/Secondary paint baseline and opacity baseline. The generic
    `binding-set` compiler now supports independent per-path selectors, so one
    source rule can atomically route Colored fill and Border stroke without a
    BackgroundPlate runtime branch.
  - [x] Field-prove the complete BackgroundPlate package. The 27 August 2026
    run produced the six intended violations, one honest `not-evaluable` for a
    Level-2 instance whose `Type` fact was absent, zero duplicate/unclassified
    evaluations and stable ten-run hash
    `73bb1802999cef9959817900adc09e24efaee4329e7d8b17e4d4fc4bdbaedd72`.
    Removed BackgroundPlateSlot padding/sizing policies did not reappear.
  - [x] Close FilterCompanySelect as the next source package. All 32 rules are
    routed exactly once: 4 direct predicates, 5 delegated rules, 4 policies
    and 19 context-only rules. Contract tests cover public roots, desktop-only
    use, legacy `ShowFirstCompany=False` and effective-baseline visuals without
    FilterCompanySelect-specific runtime branches.
  - [x] Field-prove FilterCompanySelect_Single with isolated PASS/FAIL fixtures
    for the four executable contours and exact focus. The 27 August 2026
    desktop run passed the root, legacy-property and baseline gates: it produced
    exactly the intended `ShowFirstCompany`, opacity, internal-root and radius
    violations; canonical and width controls remained compliant. Coverage had
    zero duplicate/unclassified evaluations and the ten-run hash was stable at
    `2c5ebd196e236060c3613954a080a48bad08a1430524ce30aaa73848de31ea1e`.
    The separate mobile-web run produced one exact `desktop-only` violation for
    each of the five public FilterCompanySelect roots in the selected fixture
    frame, zero duplicate/unclassified evaluations and stable ten-run hash
    `cd3f7c2e99b4fffbb48e721eab21080af08e04d87286d299c990d892a7b2eeea`.
    C21 is closed.
  - [x] Close AccountSelect as CUTOVER C22. All 41 source rules are now routed
    exactly once: 4 direct predicates, 5 delegations, 9 policy effects and 23
    context-only rules. Existing generic `public-root` and
    `uniform-allowed-collection` contours cover public ownership and AccountItem
    Type uniformity; generic `baseline-set` and `platform-match` contours cover
    row overrides and the concrete published variant's platform. The release
    loader transports `contract.platform` into `component.platform`; the engine
    contains no AccountSelect identity/key branch. Unit coverage proves the
    four-case D/M × Desktop/MobileWeb matrix. Field runs confirmed five exact
    mobile-root violations under Desktop and five compliant evaluations under
    MobileWeb, with no nested duplicates, complete classification and stable
    ten-run hashes. Removing the wrong-channel conflict also restored the exact
    AccountItem radius `0 → 20` baseline finding. C22 is closed.
  - [x] Field-prove CUTOVER C02: compile ButtonsGroup `HUG/HUG` and
    BackgroundPlateSlot `FILL/HUG` from their own `rules.json` files through
    the same generic `sizing` contour. The four live fixtures produced exactly
    two violations on the two FAIL roots, exact focus, zero unclassified or
    duplicate evaluations and a stable ten-run result.
  - [x] Field-prove CUTOVER C03: compile BackgroundPlate radius through the
    same generic `baseline` contour already used for TitleView opacity. Suite
    `12389:54001` produced one exact `16 → 24` FAIL-root finding, PASS remained
    compliant, all 32 evaluations were classified and the ten-run result hash
    was stable.
  - [x] Field-prove CUTOVER C04: apply the generic `binding-set` compiler to
    `[D] Section.itemSpacing → Grid/Gutter` from CorporateContent
    `rules.json`. The live PASS/FAIL suite produced one exact FAIL-root
    violation, PASS remained compliant, all 21 evaluations were classified,
    there were no duplicates and the ten-run result hash was stable.
  - [x] Compile form rule 4 through the generic `distance` contour published
    by `p_form-construction-rules.md`. The source owns applicability, selector,
    fact references, expected distance, axis, tolerance and presentation; the
    former hand-written runtime registration is removed.
  - [x] Field-prove CUTOVER C05 on suite `12395:54015`: PASS gap `24 px`, FAIL
    gap `12 px`, exactly one page-specific finding focused on the second FAIL
    BackgroundPlate `12395:54025`, zero duplicate/unclassified evaluations and
    one stable ten-run result hash. The UI now resolves the source presentation
    placeholder to `12 px` and routes the row only to `Раздел`.
  - [x] Compile form Rule 5 through source-owned `distance` and
    `derived-geometry` contours. The former hand-written title/content and
    content-insets RuleIR factories are removed; the normalized snapshot keeps
    only measured geometry and ownership.
  - [x] Field-prove CUTOVER C06 on the existing P17 and P18 PASS/FAIL fixtures:
    exact content/root focus, page-specific routing, source presentation,
    complete coverage and stable ten-run hashes. P17 preserved `24 px` as
    compliant and classified `40 px` as a violation; P18 preserved four
    `32 px` insets as compliant and classified the `48 px` right inset as a
    violation. Both reports had zero unclassified/duplicate evaluations and
    stable ten-run hashes.
  - [ ] Clean the P17/P18 fixture roots so the C06 golden reports contain no
    unrelated `База` findings from raw Spacing bindings or non-canonical
    BackgroundPlateSlot sizing.
  - [x] Compile form Rule 9 through the generic source-owned `fact-domain`
    contour. The pattern owns the exact selector, position fact, allowed
    values, authority and UI copy; the former hand-written RuleIR factory and
    runtime registration are removed without changing Snapshot v2.
  - [x] Field-prove CUTOVER C07 on the existing P16 PASS/FAIL fixtures. The
    source-driven rule preserved `single` and `first` as compliant, classified
    only the second TitleView with position `last`, focused that exact node,
    routed the row to `Раздел`, matched the published source checksum/revision,
    had zero unclassified/duplicate evaluations and passed the ten-run gate.
  - [x] Compile P20 through the generic source-owned `distance` contour. Form
    Rule 4 now owns the second-level relation, expected `32 px`, axis,
    tolerance, authority and UI copy; the hand-written RuleIR factory, export
    and runtime registration are removed without changing Snapshot v2.
  - [x] Field-prove CUTOVER C08 on canonical `32 px` and existing `48 px`
    primary-action boundaries with exact action focus, `Раздел` routing,
    published checksum/revision, complete coverage and stable ten-run hashes.
    The FAIL control emitted exactly one P20 row at `48 px`; the PASS control
    measured `32 px` and emitted none while preserving the same action focus.
  - [x] Compile P10 through the generic source-owned `context-map` contour.
    Benefits now owns the typed `3 -> 3` and `4 -> 4` Capacity mappings,
    authority and UI copy; the hand-written `benefitsCapacityRule` factory and
    runtime registration are removed without changing Snapshot v2.
  - [x] Field-prove CUTOVER C09 on the existing Benefits PASS/FAIL fixtures:
    exact Benefits-root focus, `База` routing, published checksum/revision,
    complete coverage and stable ten-run hashes. The PASS root preserved the
    typed `3 -> 3` mapping, the FAIL root exposed `4 -> 3`, coverage had zero
    gaps or duplicates, and the ten-run result hash was stable. The fixtures'
    unrelated sizing findings remain cleanup work.
  - [x] Compile P13 through the generic source-owned
    `uniform-collection-properties` contour. The Benefits rule now owns the
    member identity, direct-child collection boundary and four uniform
    property paths; the shared graph query and `all-equal` predicates contain
    no Benefits-specific branch. The composition boundary includes renamed
    members without traversing unrelated unresolved deep content. The former
    manual factory and runtime registration are removed.
  - [x] Field-prove CUTOVER C10 on the existing P13 PASS/FAIL fixtures. The
    direct-child boundary preserved the renamed failing BenefitCard, emitted
    one owner-level violation for `Vertical / Horizontal / Vertical`, focused
    the exact Benefits root, stayed in `База`, used published revision `4`,
    kept coverage complete and produced one stable ten-run result hash. The
    fixtures' unrelated Benefits sizing findings remain cleanup work.
  - [x] Compile P11 through the generic source-owned `fact-domain` contour.
    TableView now owns the Horizontal/Compact selector, the exact allowed
    Header count, platform scope and UI copy; the snapshot adapter keeps only
    direct Header-row collection, and the former manual factory/runtime
    registration are removed.
  - [x] Field-prove CUTOVER C11 on the existing P11 PASS/FAIL TableView roots.
    Report `Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_13-05-07_predicates.json`
    confirms exact owner focus, `База` routing, revision `2`, complete coverage
    and stable ten-run hash.
  - [x] Compile CUTOVER C12 through generic `fact-domain`: source-owned
    `TitleStatus=true -> Status=true` dependency for public TitleView roots,
    with the contradictory standalone allowance removed from all mirrors.
  - [x] Field-prove CUTOVER C12 with PASS/FAIL TitleView roots. Report
    `Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_13-25-01_predicates.json`
    confirms the boolean dependency, exact TitleView-root focus, `База`
    routing, published revision `1`, complete coverage and a stable ten-run
    hash.
  - [x] Compile CUTOVER C13 through generic `fact-domain`: source-owned
    Horizontal Compact TableView Body Row selector and exact one-column domain,
    with the former P14 manual factory/runtime registration removed.
  - [ ] Field-prove CUTOVER C13 on the existing P14 PASS/FAIL TableView roots:
    exact failing Row focus, `База` routing, published revision `2`, complete
    coverage and a stable ten-run hash.
  - [x] Field-prove generic `fact-domain` portability beyond TableView with
    independent PASS/FAIL fixtures for `TabsSecondary.SingleIcon` inside
    TabsView and `TitleStatus -> Status` on TitleView. Report
    `Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_15-28-34_predicates.json`
    loaded the corrected TabsView source revision `2`, evaluated all eight
    nested Tag instances, classified the sole `SingleIcon=True` Tag as a
    violation with exact nested focus, and preserved the independent
    TitleStatus FAIL verdict. The shared engine contains no TabsView- or
    TitleView-specific runtime registration.
  - [x] Compile CUTOVER C14 through generic `query-unique`: the active TabsView
    rule owns the Primary/Secondary level selectors, visible Label query,
    projected `text.characters`, authority and presentation. The runtime adds
    only a reusable query-to-`unique` contour and contains no TabsView branch.
  - [x] Field-prove CUTOVER C14 on one TabsView PASS/FAIL pair. Report
    `Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_15-54-38_predicates.json`
    classified every unique Primary/Secondary level as compliant. Report
    `Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_15-55-42_predicates.json`
    produced exactly one C14 owner-level violation for duplicate Secondary
    labels `Обзор`, routed it to `База`, focused the exact TabsSecondary owner,
    loaded source revision `2` with checksum
    `0ba15eaae89e9158f7fc31126aea4b43671cff7f7a5a7a7eb4245560a3bc968d`,
    retained zero unclassified/duplicate evaluations and passed the ten-run
    repeatability gate with result hash
    `ba3c9d88601a12813df03e89e966b6a1b855d048832f9d6fbde70070f21993b1`.
    Presentation follow-up revision `3` replaces the full `{{actual}}`
    collection in the observed message with the generic `{{duplicates}}`
    projection. Source checksum
    `9b7ea79b7aae5ccd8c5ec2dbd533e802e1c741dc8c8a61d0ae4d991b474e0de0`
    is published. UI smoke report
    `Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_16-18-11_predicates.json`
    rendered exactly `На одном уровне повторяются названия табов: Обзор,
    Обзор.`, focused the exact TabsSecondary owner, retained zero
    unclassified/duplicate evaluations and passed the ten-run gate with result
    hash `621a4d6bac768ae76ad20639c03635569e6fcace6c0bae7211b620b6e4382699`.
  - [x] Compile CUTOVER C15 — generic component-property validation. Compile allowed
    public component-property domains and conditional property relations from
    authoritative component data into existing `fact-domain`/`context-map`
    predicates. The first source-driven portability case is CardImage:
    `Size=24x16 -> State=Active` compiles from the active CardImage `rules.json`
    through generic `fact-domain`; PASS, FAIL and not-applicable service fixtures
    pass without CardImage-specific runtime code.
  - [x] Field-prove CUTOVER C15 on published CardImage instances: PASS
    `Size=24x16, State=Active`, FAIL `Size=24x16, State=Inactive` and control
    `Size=44x28, State=Inactive`. Expect exactly one C15 violation on the FAIL
    root, exact root focus, `База` routing, complete coverage and stable ten-run
    output. Field report
    `Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_16-43-14_predicates.json`
    produced one violation on FAIL node `12429:92281`, one compliant evaluation
    on PASS node `12429:92261`, excluded control node `12429:92433` from the
    conditional selector, retained zero unclassified/duplicate evaluations and
    passed the ten-run gate with result hash
    `f34110361a87a7cac238c30299635e6da99956319ca87ecf96219f9cabd756e2`.
  - [x] Compile CUTOVER C16 — generic paint baseline. Snapshot v2 now preserves
    canonical fill actual/baseline pairs, token/style identity, owner and variant
    origin. The active Onboarding Tooltip rule compiles through the existing
    generic `baseline` contour; PASS, FAIL and UNKNOWN service fixtures pass
    without Onboarding Tooltip-specific runtime code.
  - [x] Field-prove CUTOVER C16 on published Onboarding Tooltip instances:
    unchanged PASS plus one exact nested fill override as FAIL. Expect one error
    on the modified layer, exact focus, `База` routing, complete coverage and a
    stable ten-run output. Field report
    `Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_17-19-43_predicates.json`
    produced ten compliant fill evaluations on the unchanged instance and two
    exact violations for the two intentionally changed FAIL layers: Content
    `base-bg/primary -> base-bg/secondary` and Title
    `text/primary -> text/positive`. Both findings focus their exact layers,
    stay in `База`, retain revision `2`, have zero unclassified/duplicates and
    pass the ten-run gate with result hash
    `24ac1290f9a57eccaa55786885f5aceab6dd9762e06385d913874e4d486e0835`.
  - [x] CUTOVER C17 — generic stroke baseline and binding. Snapshot v2 now
    preserves visible uniform and per-side stroke geometry, including Figma's
    `MIXED` aggregate weight, paint value and token/style binding. Field report
    `Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_21-02-23_predicates.json`
    produced exactly two violations: the TabsView FAIL stroke differed from
    its effective baseline and the BackgroundPlate Border FAIL stroke was raw
    and unbound. Both PASS controls remained compliant, focus targets were
    exact, coverage had zero unclassified/duplicate evaluations and the
    ten-run result hash was stable at
    `c39e70d4d8521512b1d34e68de209bd0f3266efa8cbeb0e7b49638097d541aa1`.
  - [x] CUTOVER C18 — radius portability. The generic `baseline` contour was
    reused on Onboarding Tooltip without a radius-specific runtime branch.
    The moved Figma suite `12449:95182` contains PASS radius `12` and FAIL
    radius `20`. Field report
    `Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_22-48-38_predicates.json`
    produced one exact violation on `I12449:95188;31961:32482`; the PASS layer
    remained compliant, coverage had zero unclassified/duplicate evaluations
    and the ten-run output was stable at
    `a9f2827cebe710f614608d10efb6d4effc659a2545cc737a155c164ccdcabba8`.
  - [x] CUTOVER C19 — typography baseline and binding. Keep the already proven
    TitleView text-style baseline as the control, then prove the same contour on
    another component and add a separate binding check for missing/wrong
    typography style or token identity. Raw typography and wrong canonical
    style are distinct failure facts. The generic Snapshot v2 and `binding-set`
    implementation now expose Figma Text Style binding independently of the
    scalar style value, and active Onboarding Tooltip contours cover both
    checks. The moved Figma suite `12449:105503` contains canonical PASS,
    wrong-style FAIL and raw-typography FAIL. Field report
    `Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_23-12-51_predicates.json`
    produced exactly two violations on two different text nodes: the assigned
    wrong style failed the effective baseline and the raw text failed the
    binding requirement. The PASS control remained compliant, coverage had
    zero unclassified/duplicate evaluations and the ten-run output was stable.
  - [x] Add a source-rule balancer before release compilation. It must compare
    rule contours by collection boundary, member selector, property paths and
    predicate semantics rather than component name, then propose reuse of an
    existing generic contour when a new rule has the same shape. First
    acceptance case: TabsView must be able to declare the same
    `uniform-collection-properties` invariant already used by Benefits, so one
    Tag with a different `SingleIcon` value is detected as collection
    non-uniformity without a TabsView-specific evaluator. The source
    `rules.json` remains authoritative: the balancer may propose or compile a
    contour, but must not invent a normative rule or verdict. Persist the
    selected contour id, matched precedent rule ids and compatibility trace in
    the predicate release for debugging.
    - [x] Implement the pure compatibility pass and persist
      `apollo.source-rule-compatibility.v1` traces separately from RuleIR. The
      pass compares collection boundary shape, member selector shape, property
      fact families and predicate semantics while preserving exact source
      configuration. The first compiler acceptance maps TabsView
      `SingleIcon` uniformity to the existing Benefits
      `uniform-collection-properties` precedent without component-specific
      evaluator code. Field report
      `Alexey-Kukhta-CORP-Lead-Designer_26-08-2026_23-46-34_predicates.json`
      passed the live gate: the mismatched collection and the exact
      `SingleIcon=True` Tag are separate violations, the compatibility trace
      records `reuse` with the Benefits precedent, coverage has no unclassified
      or duplicate evaluations, and the ten-run result hash is stable.
    - [x] Close the release-compilation gate. `loadPredicateRelease` runs the
      balancer before `compileContourRule`, preserves each authoritative source
      definition, and publishes the selected contour id, compatibility
      signature, matched precedent rule ids and exact configured selector in
      `sourceRuleBalance.traces`. The focused release, balancer and pilot suite
      passes 71/71, including the Benefits -> TabsView cross-family acceptance
      case.
  - [ ] Add causal finding prioritization after deterministic evaluation and
    before UI sorting. Preserve every predicate verdict in the debug report,
    but group findings with the same failing object when one violated rule
    explains another observed violation. Render the root cause first and mark
    downstream findings as consequences; never suppress an independent
    violation. Store `rootFindingId`, `derivedFindingIds` and the deterministic
    grouping reason. An agent may explain or rank the group, but must not create,
    remove or change predicate verdicts.
    - [x] Add the generic RuleIR/result capability. An authoritative source rule
      may declare explicit `same-subject`, `same-focus` or
      `descendant-subject` causal edges. The engine preserves both verdicts,
      adds `rootFindingId`, `derivedFindingIds` and
      `causalGroupingReason`, and the Apollo UI orders the root first while
      marking downstream rows as consequences. Invalid or implicit relations
      fail closed. Proxy tests pass 255/255 and Apollo validation passes all 80
      regression suites.
    - [ ] Add the first real source-authored causal edge and field-prove it on a
      component where an invalid nested identity deterministically causes a
      downstream structural violation. Confirm exact focus, unchanged coverage,
      stable ten-run output and visible root-before-consequence ordering.
    - [ ] Add universal applicability suppression for dependent slot predicates.
      When a public-root / ownership predicate proves that an internal component
      is used standalone, predicates that require its valid owner or slot
      context must be classified `not-applicable` and omitted from the UI. Keep
      their raw traces for debugging with `suppressedBy`, `suppressionReason`
      and the root finding id. Do not hide independent violations. First field
      proof: standalone `PaymentMaskedNumber.RightAddon` must render only
      `public-root-only`, while `addon-uses-final-component` and both
      `addon-geometry` checks are suppressed. This is a generic dependency /
      applicability capability, not a PaymentMaskedNumber-specific exception.
- [ ] Compile deterministic form rules 1, 4, 5, 6, 7, 9, 12, 13 and 18 to RuleIR.
- [x] Pass the P01–P19 mixed canonical-section regression. Public-instance-root
  ownership gates removed 239 inherited implementation evaluations while all
  five page-specific findings and exact report routing remained stable.
- [ ] Run a curated real-screen regression corpus covering clean, component-error,
  form-pattern-error and mixed pages; record expected finding ids and focus nodes.
- [ ] Keep prose-only, interaction, red-policy and business-context rules outside the MVP as explicit `not-evaluable` coverage.
- [ ] Route agent usage to optional explanation only; forbid agent-created or agent-modified verdicts.
- [ ] Remove the old SFM/faceted-agent verdict path after all cutover gates pass.

## Current execution order

The Predicate model is the target architecture. Engine readiness and migrated
knowledge coverage are tracked separately. The detailed ratification plan,
package Definition of Done and current inventory baseline are in
`docs/PREDICATE_SCALE_PLAN.md`.

Current order:

1. S0 — merge useful Contract v2 packaging/compiler behaviour into the one
   canonical Predicate release and prove Benefits, BackgroundPlate and
   ButtonStack parity without an experimental toggle.
2. S1 — migrate the 215 currently executable rules in dependency-aware
   batches, starting with reusable Core boundaries.
3. S2 — obtain reviewed typed authoring for 126 deterministic source gaps.
4. S3 — review seven genuine capability gaps as versioned, portable engine
   proposals rather than component-specific branches.
5. S4 — route the 138 agent-required, 202 human-review and 162 unresolved
   rules explicitly without allowing either route to alter deterministic
   verdicts.
6. S5 — pass the curated real-screen regression corpus and only then remove
   duplicate legacy, experimental and faceted-agent verdict paths.

Do not expand the experimental Contract v2 verdict runtime as a second product
architecture. It remains a shadow/parity workbench until its package compiler
and fixtures are represented in the canonical Predicate pipeline.

## P0: runtime integrity

- [x] Run every `scripts/test-*.js` regression from one `npm test` command and from CI.
- [x] Fail closed when the reference manifest, required token/style catalogs or component indexes are incomplete.
- [x] Require `componentContractIndex.json` schema v2 with explicit `required | optional | none` coverage.
- [x] Resolve contract packages deterministically by Figma key, source catalog path and then unique alias.
- [x] Reject duplicate catalog paths, component keys, Figma keys and source catalog paths before publication.
- [x] Publish component indexes before the bootstrap manifest and validate the complete release snapshot.
- [x] Preserve contextual reference labels when suppression evidence explains a diff.
- [x] Reconcile source-library updates atomically and assert that `Пора обновить` and `Актуальные компоненты` are mutually exclusive.
- [x] Preserve every source dependency occurrence as a separate update finding with its own navigable focus target.
- [x] Cover detached/local-instance parity with a sanitized fixture: both paths return 8 updates and 24 current components.
- [x] Keep detailed customization diagnostics behind the opt-in `apollo.debug.audit` trace flag.
- [ ] Isolate broken Figma component sets during snapshot collection: guard every `InstanceNode.variantProperties` read, continue the audit with variant evidence marked unknown, emit one deduplicated technical finding with node/component identity, and prove that one `Component set for node has existing errors` instance cannot abort a multi-frame audit.
- [ ] Field-verify the same local component as detached content and as an instance: 8 updates, 24 current components and valid focus for every update card.

## P0: finding remediation actions

- [x] Introduce a per-audit action registry so the UI executes opaque action ids instead of supplying mutation targets.
- [x] Revalidate source component/style identity immediately before every mutation and rerun the audit after success.
- [x] Apply native Figma library updates through import-by-stable-key plus override-preserving instance swap.
- [x] Generate unambiguous same-catalog Desktop/MobileWeb counterpart metadata in Athena component indexes.
- [x] Load explicit deprecated component/style replacement mappings from remote `apollo/remediations.json`.
- [x] Offer every exact custom solid fill/stroke match as an explicit user choice with its library; reject the selected action if either the node paint or imported library style changed after the audit.
- [x] Bind an unbound custom solid paint to the unique COLOR variable required by its component reference diff instead of offering a deprecated paint style with the same RGBA.
- [ ] Populate reviewed deprecated component/style mappings in `apollo/remediations.json`.
- [ ] Republish component catalogs with Athena so existing indexes receive Desktop/MobileWeb counterpart metadata.
- [ ] Extend exact custom style binding to effect styles and mixed text ranges after canonical multi-value style serialization is published.
- [x] Add typography style remediation MVP: emit one finding for a uniform unbound text layer, resolve published text styles by `fontSize + fontName.style + lineHeight + numbers style`, show an explicit candidate picker, revalidate the fingerprint, assign the style through the full text range, preserve explicit non-default `textCase`/`textDecoration` overrides and then rerun the audit.
- [x] Load scoped raw-typography exceptions from remote `apollo/auditPolicies.json`; cover canonical Web Core `Status` by stable component keys and a strict collapsed-sublayer ancestry path.
- [ ] Field-verify that `Status / 🔩 Label / Label` is absent from custom typography findings after remote policy publication.
- [ ] Extend typography remediation with component-reference priority and deliberate mixed rich-text range selection; keep non-uniform rich text fail-closed.
- [ ] Field-verify override preservation, local-owner dependency updates and stale-action rejection in Figma.

## P0: Contract v2 schema and authoring closure

- [ ] Ratify one versioned Contract v2 schema shared by package authors, Athena and Apollo: package identity, selectors, facts, `when`, assertions, evidence requirements, verdict policy and remediation metadata.
- [ ] Stabilize capability identifiers and unknown-evidence semantics for the 25-package Ready experiment: 9 selectors, 47 facts, 37 operators and 5 remediations; candidate capabilities are not executable until their exact inputs and outputs are specified.
- [ ] Normalize the observed 129 structured assertion fields into a compact versioned vocabulary instead of implementing one runtime branch per source field; record aliases and reject ambiguous mappings.
- [ ] Triage all 315 unsupported deterministic rules across the 25 Ready packages: re-author recurring rule families as typed assertions or explicitly downgrade them to `manual`/`llm`; never infer runtime behavior from `ruleText`.
- [x] Re-audit the original 315 unsupported rules by source shape: 124 already contained structured assertion fields that the compiler did not normalize, while 191 were prose-only. Do not classify runtime gaps from rule-id substrings: the original discovery heuristic confused `border` with `order` and generic `*-required` rules with `requiredChild`.
- [x] Normalize the first evidence-safe field wave in the isolated compiler: `requiredVariant`, direct variant-only `requiredState`, direct `requiredLayout`, `requiredOrder`, `forbiddenWidthOverride` and `*-component-property`. This promotes 14 deterministic rules without new runtime operators, raising coverage from 161/476 (33.82%) to 175/476 (36.76%) and reducing unsupported rules from 315 to 301.
- [x] Replace the proposed bulk normalization step with a source-authority
  classification pass. The current Ready inventory contains 839 rules: 337
  are confirmed deterministic, 138 explicitly require an agent, 201 require
  human review, 1 is policy-only and 162 remain unresolved. Of the deterministic
  rules, 204 compile now, 126 require typed authoring and 7 require a
  versioned capability. See `docs/CONTRACT_V2_READY_RULE_CLASSIFICATION.md`;
  no prose-only rule was promoted from its text and `authority` metadata alone
  is not treated as an executable assertion.
- [ ] Re-author the 20 prose-only rules that conservatively map to existing operators; require explicit selectors, facts, assertion parameters, unknown-evidence behavior and source-rule traceability.
- [ ] Specify the 15 currently identifiable runtime-operator gaps as versioned contracts and fixtures before implementation: 7 already have structured fields and 8 remain prose-only. Define exact inputs, pass/fail/unknown semantics, evidence requirements and remediation boundaries for `statePolicy`, `numericFormat` and `visibilityPolicy`.
- [ ] Add generic conditional RuleIR composition (`when -> assert`) rather than component-specific state branches; conditions must support fact-to-value and fact-to-fact comparison with three-valued unknown propagation.
- [ ] Extend selectors with typed `where` predicates and ancestry constraints, then add filtered aggregates such as `countWhere`; use them for rules including one active sorting column and at least one visible table column.
- [ ] Classify the remaining 160 unclassified prose-only deterministic rules as `typed-authoring`, `missing-capability`, `manual` or `llm`; prohibit `checkType=deterministic` when no executable assertion can be authored.
- [ ] Use `ready-package-rule-profile.json` saturation data to define operator fixtures; require explicit coverage for state, structure/order, content, responsive context, token/paint, numeric formatting and interaction families before schema ratification.
- [ ] Require every `checkType=deterministic` rule to compile as `executable` or publish as `unsupported`; unknown selector, condition, assertion or remediation fields must fail closed instead of broadening a match.
- [ ] Prevent unsupported component rules from promoting an atomic customization diff to `violation`.
- [ ] Add schema fixtures for conditional variants, structure/count/order, token binding, paint state, layout/baseline, text/numeric formatting and unsupported-rule behavior.

## P0: Athena and Athena CLI executable package generation

- [ ] Re-audit the complete Athena CLI and Athena pipeline from raw Figma
  catalog to published component package. Document which fields are generated,
  copied, merged, validated and indexed; remove any implicit policy inference
  from display names, prose or rule-id substrings.
- [ ] Ratify a structural boundary between generated evidence and authored
  `manual` policy. Catalog rebuilds may replace generated anatomy and baseline
  data, but must preserve manual rules, predicate contours, composition
  contracts, execution routing, authority, presentation and explicit evidence
  gaps.
- [ ] Implement a deterministic manual-layer merge in Athena CLI and Athena.
  Fail the build on an orphaned manual rule, duplicate rule id, stale source
  anchor, unknown component identity, unsupported contour/operator or manual
  content loss; never silently drop or rewrite authored policy.
- [ ] Generate and validate `manual.executionPolicy` closure for every migrated
  package. Every source rule must be exactly one of `predicate`, `composition`,
  `delegated`, `policy` or `context-only`; deterministic rules without an
  executable route or explicit non-executable classification block
  publication.
- [ ] Generate a per-package coverage artifact containing source-rule totals,
  execution route, required facts, missing capabilities, authority revision and
  compiled RuleIR ids. Use the TitleView 42/42 closure as the reference fixture.
- [ ] Publish generated artifacts, preserved manual layer, compiled coverage,
  component indexes, manifests, capability versions and checksums atomically.
  A partial or stale package must not become visible to Apollo.
- [ ] Add regeneration fixtures proving that repeated Athena/Athena CLI runs are
  byte-stable for generated output and do not modify manual policy. Include
  source/generated/manual drift detection and a reviewable diff gate.
- [ ] Revisit existing raw-package enrichment so stable identities, desktop/
  mobile counterparts, effective baseline provenance, semantic anatomy,
  declared component properties and ownership boundaries are available before
  Apollo compilation. Missing evidence must be published explicitly as unknown,
  not synthesized from names.
- [ ] Preserve compatible package semantics across `design-system_ab`,
  `ds-ai-hub` and split repositories; source routing may differ, predicate
  meaning and capability versions may not.
- [ ] Introduce stable descendant identity for the `ds-ai-hub -> Athena ->
  Apollo` conversion pipeline. This is the canonical solution for renamed
  Figma layers; do not accumulate component-specific name aliases in runtime:
  - Athena must publish an authored `semanticRole` or generated
    `contractNodeKey` for every descendant that can be selected by an
    executable rule. The identifier must be independent of the visible Figma
    layer name, emoji/decorated prefixes and localization;
  - the generated release mapping binds that stable identity to the current
    Figma evidence (`componentKey`, owner/ancestry, relative node path and
    property reference). Display names remain diagnostics only;
  - Ready RuleIR selectors use component identity plus stable descendant
    identity and explicit ownership/ancestry. A literal layer name must never
    be the sole selector for an enforcing rule;
  - the converter rejects name-only deterministic rules or publishes the
    package as `unsupported`/Draft. Temporary rename aliases belong to a
    versioned generated migration map, not to authored rule predicates;
  - an active required selector resolving zero targets is an explicit coverage
    failure (`not_evaluable` during audit and a blocking error in release
    checks), never silent `not_applicable` or success;
  - preserve source traceability from human-readable `ds-ai-hub` guidance to
    the stable role, compiled RuleIR id and exact executable source revision;
  - add rename regressions using `PaymentMaskedNumber` and `TagGroup`: changing
    only the visible layer name must not change the verdict; removing the role
    mapping must fail compilation/publication rather than suppress a finding.

## P0: Contract v2 compiler and publication

- [ ] Promote the isolated Contract v2 experiment into one production compiler; generated output must consume the complete component package while keeping raw/generated anatomy as evidence rather than implicit policy.
- [ ] Compile `contract.generated.json`, structured `rules.json`, `composition-contract.json` and enforceable ownership from `contract.overrides.json` into one deterministic RuleIR artifact with source-rule traceability.
- [ ] Generate a per-package coverage report with `executable | unsupported | manual | llm` status and block publication when an executable rule is invalid, ambiguous or references an undeclared capability.
- [ ] Make Athena publish Contract v2 artifacts, schemas, coverage, capability versions and checksums atomically with `componentContractIndex.json` and the catalog manifest.
- [ ] Add CI gates for deterministic output, source-copy integrity, source/compiled drift, duplicate identities, unsupported-capability regressions and release-snapshot completeness.
- [ ] Preserve split-repository routing so `design-system_ab` and `desing-system_abm` can publish compatible Contract v2 packages without changing Apollo semantics.

## P0: Apollo Contract v2 runtime and parity

- [x] Add a default-off, non-persistent Contract v2 test-contour toggle and lazy-load only experimental packages required by the selected component keys.
- [x] Implement the first fail-closed generic selector/fact/operator evaluator driven only by trusted versioned capabilities; component packages provide data, never executable code.
- [x] Exclude legacy component-contract verdicts from customization output while the test contour is enabled; keep the default production path unchanged while the toggle is off.
- [x] Classify non-executable, unsupported and evidence-incomplete rules as diagnostic `unknown`; never promote them to violations or infer semantics from prose.
- [ ] Stop computing discarded schema-v1 customization decisions inside the v2 contour after parity instrumentation no longer needs them.
- [ ] Complete runtime support for the ratified selector/fact/operator vocabulary; each added capability requires pass/fail/unknown fixtures before activation.
- [ ] Extend the audit snapshot only with facts required by ratified contracts, including non-variant component properties, ancestry/order, token bindings, prototype reactions and explicit page/frame/viewport context.
- [ ] Emit every result through `CustomizationAssessment` as `expected | allowed | violation | unknown`, with evidence-complete messages and stale-safe remediation actions.
- [ ] Store machine-comparable Contract v2 versus schema-v1 verdict, evidence and remediation deltas without exposing discarded legacy findings in the test-contour UI.
- [ ] Require release fixtures and field reports to reach category, verdict, baseline-label and reset-action parity before enabling Contract v2 enforcement package by package.
- [ ] Separate Contract v2 runtime into explicit raw baseline, variant baseline, effective host baseline, user mutation and UI presentation/remediation stages. Every violation must retain typed source evidence and its baseline origin; relational operators must not replace paint/style bindings with display-only values, exact component assertions must override raw baseline defaults, and reset actions must restore the contract target rather than a visually equivalent RGBA or stale catalog value. Cover this boundary with real report fixtures for BodyCell padding, Amount token reset/alignment and nested PaintMe overrides.
- [x] Fix the `Benefits` aggregate parity regression: evaluate `GraphicPosition` independently from root sizing and nested `Title`, compare every visible direct `BenefitCard`, and report the exact outlier card when values differ. Acceptance fixture: `[Right, Left, Right, Right]` produces one `GraphicPosition` violation for the second card while the existing `FILL -> FIXED` and `Title Secondary -> Primary` findings remain unchanged in UI, full statistics and agent report.
- [ ] Reject unknown capability versions and incomplete required packages without falling back to component-specific or prose-derived behavior.

## P1: module boundaries

- [x] Split audit orchestration, Figma traversal and action handlers out of `src/code.ts`.
- [x] Move the UI/plugin message protocol into a Figma-independent router with exhaustive regression coverage.
- [x] Move `focus-node` page resolution and viewport navigation into a dedicated action module.
- [x] Move page Theme-mode mutation into a dedicated action and queue its audit rerun until the current audit is idle.
- [x] Move corporate-component replacement, variant resolution and compatible property restoration into a dedicated action module.
- [x] Move customization reset orchestration and mutations into dedicated action modules with stale-node regression coverage.
- [x] Move audit run/cancel/idle-wait lifecycle into an explicit state machine with parallel-start and cancellation coverage.
- [x] Move per-run traversal cache and service construction into an isolated `AuditTraversalContext`.
- [x] Move UI/stats view construction and full/agent report preparation into one result orchestration service.
- [x] Move depth-first tree walking, subtree pruning and cancellation checks into a Figma-independent traversal engine.
- [x] Move local-component source traversal, dependency classification, reconciliation and metrics out of `src/code.ts`.
- [x] Move primary component classification and nested-reference diff preparation out of `src/code.ts`.
- [x] Move category aggregation and the remaining Figma node visitor out of `src/code.ts`.
- [x] Split contract transport, index resolution and artifact compilation out of `runtimeContractRegistry.ts`.
- [x] Introduce one explicit lifecycle state machine for reference and contract caches.
- [x] Add release-fixture integration tests covering manifest, indexes and contract packages as one snapshot.

## P1: Contract v2 component migration

- [x] Load package `contract.generated.json` as the target Component API, validate all published packages and emit deterministic violations for unknown variant properties, invalid values and invalid allowed combinations through the standard assessment/report pipeline.
- [x] Move all executable composition rules to package-level `manual.contracts`, migrate ButtonsGroup, and remove the global `compositionContracts.json` bootstrap/runtime fallback.
- [x] Add a trusted composition contract engine with remote declarative config and a pure function registry instead of component-specific runtime branches. Schema v1 covers count, property domain, value position, member-to-host equality, first-member equality and subtree paint policies; additional operators remain explicit code changes.
- [x] Add the first evidence-safe relational predicates: ButtonsGroup member Size follows host Size and TitleStatus Type follows visible StatusPreset Type. Missing source evidence remains non-enforcing.
- [x] Migrate and regression-test the schema-v1-safe packages: ButtonsGroup, BackgroundPlate and TitleView.
- [ ] Complete the Contract v2 pilot wave for TitleView, BackgroundPlate, ButtonsGroup and AmountStyles after the P0 parity gate; preserve their existing Figma-visible behavior and agent-report evidence.
- [x] Select the first migration wave by computed capability coverage, not
  component popularity. `migration-wave-1.json` contains Ready packages with
  100% deterministic compilation and zero unsupported rules: Benefits,
  BackgroundPlate and ButtonStack. Core Amount, TagGroup and
  PaymentMaskedNumber are tracked separately as supporting packages. The wave
  remains default-off and `ready-for-shadow-parity`, not production-enforcing.
- [ ] Migrate Button, CardImage, FAQ and TableBulkActions only when their host-dependent selectors and evidence are represented exactly; advisory guidance must not become a hard violation.
- [ ] Publish a migration dashboard with package schema version, deterministic coverage, unsupported rules, last parity result and legacy dependency count.
- [ ] Forbid new component-name conditionals in Apollo runtime; a missing capability becomes an explicit engine task or leaves the rule `unsupported`.

## P1: reusable Core boundary contracts

- [ ] Publish Contract v2 packages for reusable Core component boundaries before encoding more host-specific nested-component heuristics. Prioritize `IconView`, `Button`, `Text`, `StatusPreset`/`Status`, then inventory the remaining Core components that expose Slot, instance-swap or nested component properties.
  - [x] Core `Button`: source-rule closure and field parity published.
  - [x] Core `IconView`: package, release compilation, synthetic
    PASS/FAIL/UNKNOWN and Figma field parity are complete as C23. The final
    field run preserved public paint permissions, detected root layout,
    internal Shape radius and Content opacity overrides with exact focus, and
    passed zero-duplicate/unclassified plus ten-run repeatability gates.
  - [ ] Core `Text`.
  - [ ] `StatusPreset`/`Status` boundary extraction from the proven host-baseline implementation.
- [ ] Require every Core boundary contract to describe stable component families and keys, semantic slot anatomy, public variant/component properties, effective baseline by selected variant, allowed instance replacements and ownership of nested visual/text/layout evidence.
- [ ] Let host contracts express contextual policy against nested semantic facts instead of Figma storage details. Example: `CorporateSystemMessage` owns the rule “`Graphic.icon` may be replaced only when `View=Base`”, while `IconView` owns how the icon slot and its `component.identity` are resolved.
- [ ] Keep native `directOverrides`/`componentProperties` interpretation as a fail-closed transitional fallback for a nested component without a contract. Once its Core contract is published and parity-proven, route evaluation through that contract and remove the corresponding heuristic path.
- [ ] Add cross-boundary parity fixtures. Minimum acceptance: TC-11 reports an icon replacement in `CorporateSystemMessage View=Error`, permits the same replacement in `View=Base`, invalid Button views are evaluated through the Button contract, parent-authored variant propagation remains clean, and every finding retains the nested contract, host rule and native override evidence without component-name runtime branches.

## P1: reference index performance

- [ ] Replace startup loading of every per-catalog component index with one versioned aggregate routing index per catalog manifest; keep individual indexes as publication/debug artifacts rather than mandatory runtime requests.
- [ ] Make Athena publish the aggregate index atomically with catalog indexes and the manifest, including component key, catalog path, source repository/base URL and release checksum coverage.
- [ ] Make Apollo load the main and nested aggregate indexes first, resolve selected component keys from them, and fetch only the required component catalogs; fail closed on duplicate keys or a release/checksum mismatch.
- [ ] Add release-snapshot and split-repository regression coverage for aggregate index routing, duplicate detection, cache invalidation and a temporary backward-compatible migration path.
- [ ] Acceptance baseline: reduce the observed index phase from 770 requests and 28.3 seconds within a 42.4-second audit to O(number of manifests) index requests, without increasing loaded component catalogs or changing audit categories.

## P2: maintenance

- [ ] Introduce a cross-repository knowledge-link contract for every
  authoritative rule: stable `ruleId` -> executable `rules.json` source ->
  human-readable instructions -> cookbook/recipe -> PASS/FAIL fixtures.
  Store links as typed references with repository, path, anchor, revision and
  checksum; validate reciprocal links and semantic drift in CI. Apollo must
  use the executable source for verdicts, while agents and documentation UIs
  may follow the same identity to explanations and examples. First acceptance
  package: `web-corp.title-view`, including the TitleStatus/Status rule whose
  current human-readable mirrors have already demonstrated drift from the
  executable contract.

- [ ] Generate runtime/publisher schema fixtures from the shared executable-rule definition and verify backward-compatible migrations.
- [ ] Add bundle-size and module-size budgets to CI.
- [ ] Remove schema-v1 composition compilation, compatibility fields and obsolete registries after all required packages publish Contract v2 and the migration dashboard reports zero legacy dependencies.
- [ ] Remove overlapping `patternRules.json`/package-rule runtime paths once every enforced rule has one canonical source and source-rule traceability.
- [ ] Archive experimental Contract v2 packages after their fixtures and compiler behavior are represented in production tests.

Existing schema-v1 integrity gates remain active during migration. Contract v2 is not production-enforcing
until authoring coverage, compiler publication and shadow-parity P0 gates are complete. Runtime rollout of
library-update parity remains gated by field verification in Figma; catalog rollout remains owned by
Athena's atomic publication process.

## Frozen history: Pattern and agent audit roadmap

Superseded by `PREDICATE_ENGINE_MVP.md`. Keep for migration evidence only; do
not start new runtime work from the unchecked items below.

### P0: evidence-complete pattern decisions

- [x] Preserve the explicit UI page type through audit runtime, reruns, full statistics, WIP statistics and the agent payload. Unknown or unselected values serialize as `null`; specialized page patterns must not infer a page type from the layout.
- [ ] Normalize rule-level authority for component rules: `status`, `ruleKind`, approval provenance and revision. Document-level readiness alone must not promote a rule.
  - [x] Athena schema, validator and safe component-rule migration revision 1.
  - [x] Apollo/proxy consumer gate: only active `design-rule` may confirm a verdict.
- [ ] Add a versioned structured applicability contract covering `scope`, `when`, `target` and required evidence. Prose must not be interpreted as an executable predicate.
  - [x] Pilot revision 1 for `rule:forms.construction-rules.title-medium-one-per-plate`: explicit page type/channel applicability, container scope, target component/variant, aggregate assertion and required evidence.
  - [ ] Migrate the remaining form rules only after their required facts and pass/fail/unknown semantics are specified.
- [ ] Send a compact pattern-audit structure with component hierarchy, semantic roles, document order, cardinality, viewport and relevant layout facts; do not send an unrestricted raw snapshot.
  - [x] Pilot component hierarchy and structured variant facts for the first form rule; hidden nodes are excluded and no screenshot/raw snapshot is sent.
  - [ ] Add semantic roles, true sibling/document order, viewport and relevant layout facts as independently versioned fields.
- [ ] Add the explicit `not_evaluable` result for missing required facts. Follow it with clarification when user context can resolve the gap, then human review if it cannot.
- [ ] Encode exceptions and conflict handling. A conflict between active sources must require design-system review until a source-precedence policy is ratified.

### P1: actionable and debuggable pattern findings

- [ ] Normalize remediation kinds and parameters: reset to baseline, bind variable, set variant, replace/remove component, move node, change page type, open source, human review or no action.
- [ ] Publish semantic roles, sibling order and cardinality as stable evidence fields for composition and screen patterns.
- [ ] Add stable source anchors per rule so Apollo can open the exact normative section instead of only the containing file.
- [ ] Return coverage for every requested pattern audit: evaluated, skipped, not evaluable and the exact reason.

### P2: governance and evaluation

- [ ] Promote reviewed examples and anti-examples into regression fixtures for each page type and platform.
- [ ] Record the effective-baseline revision and artifact checksums used by every audit.
- [ ] Add rule ownership and the escalation route used by `Нужна помощь дизайн-системы`.
- [ ] Maintain separate evaluation sets for form, landing, data-list, details, dashboard and overlay scenarios.

## Frozen history: Semantic Fact Model v1 roadmap

Superseded by canonical snapshot v2 plus the deterministic predicate coverage
ledger. Keep for migration evidence only.

Semantic Fact Model is the canonical evidence layer between Figma collection,
design-system knowledge and the agent decision. It must describe facts and their
provenance without silently turning measurements into verdicts. Existing
`generalAudit`, `architectureAudit` and legacy `resolution` fields remain
compatibility projections only until parity is proven.

### P0: contract and identity

- [ ] Ratify the v1 fact identity as `kind + subject.nodeId + factPath + target.nodeId + context`; preserve stable ids across equivalent reruns and do not collapse facts from different slots, owners or relation targets.
- [ ] Ratify the five fact kinds: `property_state`, `role_assignment`, `relation`, `text_content` and `interaction`.
- [ ] Keep rule authority, exceptions and agent decisions outside snapshot facts. A Figma fact may reference candidate rule ids but must not declare itself valid or invalid.
- [ ] Validate every emitted semantic model against the published JSON Schema and fail closed on duplicate identities, missing subjects, unsafe targets or unbounded collections.
- [ ] Introduce a coverage ledger for every in-scope atomic fact: `evaluated_violation`, `evaluated_allowed`, `human_review`, `not_applicable`, `missing_rule` or `not_evaluable`, with exactly one terminal classification per fact.

### P0: source parity and normalized rules

- [ ] Normalize `design-system_ab` and `ds-ai-hub` documents into one rule envelope: `ruleId`, `ruleKind`, `effect`, `scope`, `applicability`, `conditions`, `assertion`, `severity`, `authority` and `source`.
- [ ] Preserve one canonical rule identity across repositories. A mirrored `ds-ai-hub` rule must carry the exact canonical component/pattern `ruleId` or an explicit checked alias mapping; document similarity and rewritten ids must not authorize a verdict.
- [ ] Publish rule-level authority in `ds-ai-hub` (`status`, `provenance`, integer `revision`) and normalize verified documents into `semanticModel.rules`. Document-level `status: verified` alone must not promote all contained guidance.
- [ ] Require an exact Figma key mapping before component evidence can become authoritative. A report-name alias may discover candidate documents for review, but it must not confirm component identity or an error.
- [ ] Add a dual-source parity evaluation for the same Apollo report. Compare fact identities, semantic roles and relations, rule coverage, authority, final statuses, prompt size and latency.
- [ ] Record source revisions, effective-baseline revision and checksums in every resolved packet and final audit trace.
- [ ] Treat conflicting equally authoritative rules as `human_review`; do not encode an implicit repository precedence before governance is ratified.

### P1: relation and interaction coverage

- [ ] Extend `relation` beyond measured sibling gaps with typed containment, alignment, width, order, ownership and visibility/state relations. Proxy may derive and measure structure but must not supply the normative expectation or verdict.
- [ ] Emit `interaction` facts from Figma prototype/reaction evidence: trigger, action, source state, destination or target, transition and missing-target quality. Unknown interaction evidence remains `not_evaluable`.
- [ ] Preserve derivation provenance for semantic roles and relations: exact Figma evidence, derived signals, source node ids and confidence.
- [ ] Add fixtures for component slots, form sections, page columns, overlays, repeated groups, responsive variants and hidden-node exclusion.

### P1: agent cutover

- [ ] Make `semanticModel` the sole fact input for component, pattern and text agent audits after parity gates pass.
- [ ] Remove duplicate `generalAudit`, `architectureAudit` and compatible `resolution` projections from the agent packet without moving verdict logic into proxy.
- [ ] Require every finding and allowed assessment to reference one canonical semantic fact id and one verified normative rule or an explicit review reason.
- [ ] Add prompt and transport budgets for fact count, rule count, semantic-model size and total request size.

### P2: evaluation and observability

- [ ] Maintain sanitized golden cases for baseline, relative fact, token binding, slot, exception, composition, text, page relation, interaction and authority.
- [ ] Publish per-run semantic diagnostics for local debugging: fact counts by kind, rule counts by authority, classification coverage, unused rules, missing-rule facts and source parity deltas.
- [ ] Track precision, recall, human-review rate, duplicate rate, missing-classification rate, prompt size and end-to-end latency separately for components, patterns and texts.
