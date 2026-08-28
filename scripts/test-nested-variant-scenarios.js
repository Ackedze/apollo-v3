const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');

function bundleModule(entryPoint) {
  const outfile = path.join(
    os.tmpdir(),
    `apollo-${path.basename(entryPoint, path.extname(entryPoint))}-${process.pid}-${Date.now()}.cjs`,
  );

  esbuild.buildSync({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: ['node18'],
    logLevel: 'silent',
  });

  try {
    return require(outfile);
  } finally {
    fs.rmSync(outfile, { force: true });
  }
}

function makeComponent() {
  return {
    key: 'main-component',
    name: 'Radio_24',
    displayName: 'Radio_24',
    status: 'current',
    platform: 'Desktop',
    structure: [{ path: 'Default', id: 1, parentId: null, type: 'INSTANCE', name: 'Default', visible: true, radius: null }],
    variants: [
      {
        key: 'radio-default',
        id: '1',
        name: 'SelectedState=False, Type=Radio, View=Desktop, Preset=Default',
        properties: {
          SelectedState: 'False',
          Type: 'Radio',
          View: 'Desktop',
          Preset: 'Default',
        },
      },
      {
        key: 'radio-selected',
        id: '2',
        name: 'SelectedState=True, Type=Radio, View=Desktop, Preset=Default',
        properties: {
          SelectedState: 'True',
          Type: 'Radio',
          View: 'Desktop',
          Preset: 'Default',
        },
      },
      {
        key: 'radio-card',
        id: '3',
        name: 'SelectedState=True, Type=Card, View=Desktop, Preset=Promo',
        properties: {
          SelectedState: 'True',
          Type: 'Card',
          View: 'Desktop',
          Preset: 'Promo',
        },
      },
    ],
    variantStructures: {
      'radio-default': [{ op: 'update', id: 1, value: { path: 'SelectedState=False, Type=Radio, View=Desktop, Preset=Default' } }],
      'radio-selected': [{ op: 'update', id: 1, value: { path: 'SelectedState=True, Type=Radio, View=Desktop, Preset=Default' } }],
      'radio-card': [{ op: 'update', id: 1, value: { path: 'SelectedState=True, Type=Card, View=Desktop, Preset=Promo' } }],
    },
  };
}

function main() {
  const library = bundleModule(path.resolve(__dirname, '../src/reference/library.ts'));
  const diff = bundleModule(path.resolve(__dirname, '../src/structure/diff.ts'));
  const nestedReferenceMerge = bundleModule(
    path.resolve(__dirname, '../src/reference/nestedReferenceMerge.ts'),
  );
  const nestedReferencePreparation = bundleModule(
    path.resolve(__dirname, '../src/services/nestedReferencePreparation.ts'),
  );
  const occurrenceKeys = bundleModule(
    path.resolve(__dirname, '../src/structure/occurrenceKeys.ts'),
  );
  const suppressionPolicy = bundleModule(
    path.resolve(__dirname, '../src/filters/suppressionPolicy.ts'),
  );

  const component = makeComponent();

  const lazyHostComponent = {
    key: 'lazy-host-key',
    name: 'LazyHost',
    structure: [
      {
        id: 1,
        parentId: null,
        path: 'LazyHost',
        type: 'COMPONENT',
        name: 'LazyHost',
        visible: true,
        radius: null,
      },
      {
        id: 2,
        parentId: 1,
        path: 'LazyHost / 🔩 Label',
        type: 'INSTANCE',
        name: '🔩 Label',
        visible: true,
        radius: null,
        componentInstance: {
          variantProperties: { Uppercase: 'True' },
        },
      },
      {
        id: 3,
        parentId: 1,
        path: 'LazyHost / Explicit Icon',
        type: 'INSTANCE',
        name: 'Explicit Icon',
        visible: true,
        radius: null,
        componentInstance: {
          componentKey: 'explicit-icon-key',
          variantProperties: {},
        },
      },
    ],
  };
  const lazyLabelComponent = {
    key: 'label-key',
    name: '🔩 Label',
  };
  const duplicateLabelComponent = {
    key: 'duplicate-label-key',
    name: '🔩 Label',
  };
  library.__test_rehydrateNestedInstanceComponentKeys([
    lazyHostComponent,
    lazyLabelComponent,
  ]);
  assert.equal(
    lazyHostComponent.structure[1].componentInstance.componentKey,
    'label-key',
    'A unique nested component loaded after its host must hydrate the host key',
  );
  library.__test_rehydrateNestedInstanceComponentKeys([
    lazyHostComponent,
    lazyLabelComponent,
    duplicateLabelComponent,
  ]);
  assert.equal(
    lazyHostComponent.structure[1].componentInstance.componentKey,
    '',
    'A later ambiguous name must clear a previously inferred component key',
  );
  assert.equal(
    lazyHostComponent.structure[2].componentInstance.componentKey,
    'explicit-icon-key',
    'Catalog-authored component keys must survive inferred-key refreshes',
  );
  library.__test_rehydrateNestedInstanceComponentKeys([
    lazyHostComponent,
    lazyLabelComponent,
  ]);
  assert.equal(
    lazyHostComponent.structure[1].componentInstance.componentKey,
    'label-key',
    'The same final catalog set must restore the same inferred key',
  );

  const inferredHostControlledAliases =
    library.__test_getHostControlledComponentAliases(
      'icon-view-family',
      'icon-view-size-24',
      'icon-view-family',
    );
  assert.deepEqual(
    inferredHostControlledAliases,
    ['icon-view-family', 'icon-view-size-24'],
    'Host-controlled nested paths inferred from a family name must also be registered under the resolved variant key used by materialized references',
  );
  library.__test_resetHostControlledNestedPathPolicies();
  library.__test_registerHostControlledNestedPath(
    'paint',
    inferredHostControlledAliases,
    'Content / ShapeContent / BgColor',
  );
  library.__test_registerHostControlledNestedPath(
    'layout',
    inferredHostControlledAliases,
    'Content / Shape',
  );
  assert.equal(
    library.isNestedComponentPaintPathHostControlled(
      'icon-view-size-24',
      'Content / ShapeContent / BgColor',
    ),
    true,
    'A host paint override must be addressable by the materialized nested variant key',
  );
  assert.equal(
    library.isNestedComponentLayoutPathHostControlled(
      'icon-view-size-24',
      'Content / Shape',
    ),
    true,
    'A host radius/layout override must be addressable by the materialized nested variant key',
  );
  library.__test_resetHostControlledNestedPathPolicies();

  assert.equal(
    library.resolveVariantKeyForInstance(component, 'radio-selected', null),
    'radio-selected',
    'Direct variant key must remain the highest-priority match when no variantProperties are available',
  );

  assert.equal(
    library.resolveVariantKeyForInstance(component, 'radio-default', {
      SelectedState: 'True',
      Type: 'Radio',
      View: 'Desktop',
      Preset: 'Default',
    }),
    'radio-selected',
    'Variant properties must override stale direct variant keys from slot instances',
  );

  assert.equal(
    library.resolveVariantKeyForInstance(component, 'main-component', {
      SelectedState: 'True',
      Type: 'Radio',
      View: 'Desktop',
      Preset: 'Default',
    }),
    'radio-selected',
    'Variant properties must resolve SelectedState-based nested references',
  );

  assert.equal(
    library.resolveVariantKeyForInstance(component, 'main-component', {
      SelectedState: 'True',
      Type: 'Card',
      View: 'Desktop',
      Preset: 'Promo',
    }),
    'radio-card',
    'Variant properties must resolve Type/View/Preset combinations',
  );

  const resolvedStructure = library.resolveStructureForInstance(component, {
    componentKey: 'main-component',
    variantProperties: {
      SelectedState: 'True',
      Type: 'Card',
      View: 'Desktop',
      Preset: 'Promo',
    },
  });

  assert.equal(
    resolvedStructure[0].path,
    'SelectedState=True, Type=Card, View=Desktop, Preset=Promo',
    'Resolved nested structure must follow variantProperties instead of only componentKey',
  );

  assert.equal(
    nestedReferenceMerge.shouldPreferMaterializedInstanceReference(
      {
        path: 'State=Active / LeftSlot / Radio_24 / Content / Bg',
        type: 'VECTOR',
        name: 'Bg',
        visible: true,
        id: 8,
        parentId: 7,
        referenceOrigin: 'nested-component',
        referenceOwnerPath: 'State=Active / LeftSlot',
      },
      {
        path: 'State=Active / LeftSlot / Radio_24 / Content / Bg',
        type: 'VECTOR',
        name: 'Bg',
        visible: true,
        id: 18,
        parentId: 17,
        referenceOrigin: 'nested-component',
        referenceOwnerPath: 'State=Active / LeftSlot / Radio_24',
      },
      'State=Active / LeftSlot / Radio_24',
    ),
    true,
    'Deeper materialized nested instance must replace conflicting subtree nodes from the parent nested owner',
  );

  assert.equal(
    nestedReferenceMerge.shouldPreferMaterializedInstanceReference(
      {
        path: 'Size=56, Overflow=true / [D] Button / LeftAddon / LeftAddon / Fixer / PaintMe',
        type: 'BOOLEAN_OPERATION',
        name: 'PaintMe',
        visible: true,
        id: 54,
        parentId: 50,
        referenceOrigin: 'host',
      },
      {
        path: 'Size=56, Overflow=true / [D] Button / LeftAddon / LeftAddon / Fixer / PaintMe',
        type: 'BOOLEAN_OPERATION',
        name: 'PaintMe',
        visible: true,
        id: 154,
        parentId: 150,
        referenceOrigin: 'nested-component',
        referenceOwnerComponentKey: 'button-secondary',
        referenceOwnerPath: 'Size=56, Overflow=true / [D] Button',
        referenceOwnerRelativePath: 'LeftAddon / LeftAddon / Fixer / PaintMe',
      },
      'Size=56, Overflow=true / [D] Button',
      () => false,
    ),
    true,
    'Materialized nested descendants must replace host descendants when the path is not host-controlled',
  );

  const mergedInstanceRoot = nestedReferenceMerge.mergeMaterializedInstanceReferenceNode(
    {
      path: 'Size=56, Overflow=false / [D] Button',
      type: 'INSTANCE',
      name: '[D] Button',
      visible: true,
      id: 50,
      parentId: 1,
      referenceOrigin: 'host',
      componentInstance: {
        variantProperties: {
          DisabledState: 'False',
          Shape: 'Rectangular',
          SingleIcon: 'False',
          Size: '56',
          View: 'Secondary',
        },
      },
    },
    {
      path: 'Size=56, Overflow=false / [D] Button',
      type: 'INSTANCE',
      name: '[D] Button',
      visible: true,
      id: 150,
      parentId: 100,
      referenceOrigin: 'nested-component',
      referenceOwnerComponentKey: 'button-secondary',
      referenceOwnerPath: 'Size=56, Overflow=false / [D] Button',
      referenceOwnerRelativePath: '',
      componentInstance: {
        componentKey: 'button-secondary',
      },
    },
    {
      preferCandidate: true,
      reason: 'replace-instance-root',
      existingOrigin: 'host',
      candidateOrigin: 'nested-component',
      ownerComponentKey: 'button-secondary',
      relativePath: '',
      withinMaterializedSubtree: true,
    },
  );
  assert.deepEqual(
    mergedInstanceRoot.componentInstance.variantProperties,
    {
      DisabledState: 'False',
      Shape: 'Rectangular',
      SingleIcon: 'False',
      Size: '56',
      View: 'Secondary',
    },
    'Replacing a materialized host instance root must preserve host variantProperties as reference baseline',
  );
  assert.equal(
    mergedInstanceRoot.componentInstance.componentKey,
    'button-secondary',
    'Nested candidate component key must be preserved while host variantProperties become the expected state',
  );

  const hostControlledInstanceRootDecision =
    nestedReferenceMerge.getMaterializedInstanceReferenceDecision(
      {
        path: 'View=Primary / RightAddon / RightAddon',
        type: 'INSTANCE',
        name: 'RightAddon',
        visible: true,
        id: 60,
        parentId: 59,
        radius: 0,
        referenceOrigin: 'host',
        componentInstance: {
          variantProperties: { Type: 'Icon-24' },
        },
      },
      {
        path: 'View=Primary / RightAddon / RightAddon',
        type: 'INSTANCE',
        name: 'RightAddon',
        visible: true,
        id: 160,
        parentId: 159,
        radius: 4,
        referenceOrigin: 'nested-component',
        referenceOwnerComponentKey: 'addon-icon-24',
        referenceOwnerPath: 'View=Primary / RightAddon / RightAddon',
        referenceOwnerRelativePath: '',
        componentInstance: {
          componentKey: 'addon-icon-24',
          variantProperties: { Type: 'Icon-24' },
        },
      },
      'View=Primary / RightAddon / RightAddon',
      (ownerComponentKey, relativePath) =>
        ownerComponentKey === 'addon-icon-24' && relativePath === '',
    );
  assert.equal(
    hostControlledInstanceRootDecision.preferCandidate,
    true,
    'Standalone nested root must merge without overwriting a materialized host layout override',
  );
  assert.equal(
    hostControlledInstanceRootDecision.reason,
    'merge-parent-owned-descendant',
  );

  const mergedHostDescendantRoot = nestedReferenceMerge.mergeMaterializedInstanceReferenceNode(
    {
      path: 'Size=56, Overflow=false / [D] Button',
      type: 'INSTANCE',
      name: '[D] Button',
      visible: true,
      id: 51,
      parentId: 1,
      referenceOrigin: 'host',
      componentInstance: {
        variantProperties: {
          DisabledState: 'False',
          Shape: 'Rectangular',
          SingleIcon: 'False',
          Size: '56',
          View: 'Secondary',
        },
      },
    },
    {
      path: 'Size=56, Overflow=false / [D] Button',
      type: 'INSTANCE',
      name: '[D] Button',
      visible: true,
      id: 151,
      parentId: 100,
      referenceOrigin: 'nested-component',
      referenceOwnerComponentKey: 'button-secondary',
      referenceOwnerPath: 'Size=56, Overflow=false / [D] Button',
      referenceOwnerRelativePath: '',
      componentInstance: {
        componentKey: 'button-secondary',
        variantProperties: {
          DisabledState: 'False',
          Shape: 'Rectangular',
          SingleIcon: 'True',
          Size: '56',
          View: 'Secondary',
        },
      },
    },
    {
      preferCandidate: true,
      reason: 'replace-host-descendant',
      existingOrigin: 'host',
      candidateOrigin: 'nested-component',
      ownerComponentKey: 'button-secondary',
      relativePath: '',
      withinMaterializedSubtree: true,
    },
  );
  assert.deepEqual(
    mergedHostDescendantRoot.componentInstance.variantProperties,
    {
      DisabledState: 'False',
      Shape: 'Rectangular',
      SingleIcon: 'False',
      Size: '56',
      View: 'Secondary',
    },
    'Root-level replace-host-descendant must also preserve host variantProperties as the reference baseline',
  );

  const parentVariantOwnedInstanceRoot =
    nestedReferenceMerge.applyMaterializedHostVariantBaselineToNode(
      {
        path: 'Table / StatusPreset / Status / Label',
        type: 'INSTANCE',
        name: '🔩 Label',
        visible: true,
        id: 160,
        parentId: 150,
        referenceOrigin: 'nested-component',
        referenceVariantOwnedProperties: [
          'componentInstance.variantProperties.Uppercase',
        ],
        componentInstance: {
          componentKey: 'label-key',
          variantProperties: { Uppercase: 'True' },
        },
      },
      {
        path: 'Table / StatusPreset / Status / Label',
        type: 'INSTANCE',
        name: 'Label',
        visible: true,
        id: 60,
        parentId: 50,
        referenceOrigin: 'host',
        componentInstance: {
          componentKey: 'label-key',
          variantProperties: { Uppercase: 'False' },
        },
      },
    );
  assert.deepEqual(
    parentVariantOwnedInstanceRoot.componentInstance.variantProperties,
    { Uppercase: 'True' },
    'A selected parent variant must keep its owned nested variant property over a stale host descendant baseline',
  );

  const hostOwnedTextNode = {
    path: 'AmountHeadline / Operation / Minus',
    type: 'TEXT',
    name: 'Minus',
    visible: true,
    id: 161,
    parentId: 150,
    referenceOrigin: 'host',
    referenceVariantOwnedProperties: [
      'styles.text.styleKey',
      'text.fontName',
      'text.fontSize',
    ],
    styles: { text: { styleKey: 'headline-18-22' } },
    text: {
      fontName: 'Alfa Interface Sans Bold',
      fontSize: 18,
      lineHeight: 22,
    },
  };
  const nestedDefaultTextNode = {
    path: 'AmountHeadline / Operation / Minus',
    type: 'TEXT',
    name: 'Minus',
    visible: true,
    id: 261,
    parentId: 250,
    referenceOrigin: 'nested-component',
    referenceOwnerComponentKey: 'operation-key',
    referenceOwnerPath: 'AmountHeadline / Operation',
    referenceOwnerRelativePath: 'Minus',
    styles: { text: { styleKey: 'paragraph-16-20' } },
    text: {
      fontName: 'Alfa Interface Sans Medium',
      fontSize: 16,
      lineHeight: 20,
    },
  };
  const hostOwnedTextDecision =
    nestedReferenceMerge.getMaterializedInstanceReferenceDecision(
      hostOwnedTextNode,
      nestedDefaultTextNode,
      'AmountHeadline / Operation',
      () => false,
    );
  assert.equal(
    hostOwnedTextDecision.reason,
    'merge-parent-owned-descendant',
    'A host variant text override must survive nested component materialization',
  );
  const mergedHostOwnedText =
    nestedReferenceMerge.mergeMaterializedInstanceReferenceNode(
      hostOwnedTextNode,
      nestedDefaultTextNode,
      hostOwnedTextDecision,
    );
  assert.equal(mergedHostOwnedText.styles.text.styleKey, 'headline-18-22');
  assert.equal(mergedHostOwnedText.text.fontSize, 18);
  assert.equal(
    mergedHostOwnedText.text.lineHeight,
    22,
    'A canonical host baseline difference remains host-owned even when the selected variant patch owns sibling typography leaves',
  );

  const baselineApplied = nestedReferenceMerge.applyMaterializedHostVariantBaselines(
    [
      {
        path: 'Size=56, Overflow=false / [D] Button',
        type: 'INSTANCE',
        name: '[D] Button',
        visible: true,
        id: 150,
        parentId: 100,
        referenceOrigin: 'nested-component',
        componentInstance: {
          componentKey: 'button-primary',
        },
      },
      {
        path: 'Size=56, Overflow=false / [D] Button',
        type: 'INSTANCE',
        name: '[D] Button',
        visible: true,
        id: 151,
        parentId: 100,
        referenceOrigin: 'nested-component',
        componentInstance: {
          componentKey: 'button-secondary',
        },
      },
      {
        path: 'Size=56, Overflow=false / [D] Button',
        type: 'INSTANCE',
        name: '[D] Button',
        visible: true,
        id: 152,
        parentId: 100,
        referenceOrigin: 'nested-component',
        componentInstance: {
          componentKey: 'button-secondary',
        },
      },
    ],
    [
      {
        path: 'Size=56, Overflow=false / [D] Button',
        type: 'INSTANCE',
        name: '[D] Button',
        visible: true,
        id: 50,
        parentId: 1,
        referenceOrigin: 'host',
        componentInstance: {
          variantProperties: { SingleIcon: 'False', View: 'Primary' },
        },
      },
      {
        path: 'Size=56, Overflow=false / [D] Button',
        type: 'INSTANCE',
        name: '[D] Button',
        visible: true,
        id: 51,
        parentId: 1,
        referenceOrigin: 'host',
        componentInstance: {
          variantProperties: { SingleIcon: 'False', View: 'Secondary' },
        },
      },
      {
        path: 'Size=56, Overflow=false / [D] Button',
        type: 'INSTANCE',
        name: '[D] Button',
        visible: true,
        id: 52,
        parentId: 1,
        referenceOrigin: 'host',
        componentInstance: {
          variantProperties: { SingleIcon: 'False', View: 'Secondary' },
        },
      },
    ],
  );
  assert.deepEqual(
    baselineApplied[2].componentInstance.variantProperties,
    { SingleIcon: 'False', View: 'Secondary' },
    'Host variantProperties must be restored by occurrence even when root replacement did not merge them earlier',
  );
  assert.equal(
    baselineApplied[2].componentInstance.componentKey,
    'button-secondary',
    'Occurrence baseline restore must preserve nested candidate componentKey',
  );

  const ownedBaselineApplied =
    nestedReferenceMerge.applyMaterializedHostVariantBaselines(
      [
        {
          path: 'Table / StatusPreset / Status / Label',
          type: 'INSTANCE',
          name: '🔩 Label',
          visible: true,
          id: 170,
          parentId: null,
          referenceOrigin: 'nested-component',
          referenceVariantOwnedProperties: [
            'componentInstance.variantProperties.Uppercase',
          ],
          componentInstance: {
            componentKey: 'label-key',
            variantProperties: { Uppercase: 'True' },
          },
        },
      ],
      [
        {
          path: 'Table / StatusPreset / Status / Label',
          type: 'INSTANCE',
          name: 'Label',
          visible: true,
          id: 70,
          parentId: null,
          referenceOrigin: 'host',
          componentInstance: {
            componentKey: 'label-key',
            variantProperties: { Uppercase: 'False' },
          },
        },
      ],
    );
  assert.deepEqual(
    ownedBaselineApplied[0].componentInstance.variantProperties,
    { Uppercase: 'True' },
    'Final host baseline restoration must not erase parent-variant-owned nested state',
  );

  assert.equal(
    nestedReferenceMerge.shouldPreferMaterializedInstanceReference(
      {
        path: 'Size=56, Overflow=true / [D] Button / LeftAddon / LeftAddon / Fixer / PaintMe',
        type: 'BOOLEAN_OPERATION',
        name: 'PaintMe',
        visible: true,
        id: 54,
        parentId: 50,
        referenceOrigin: 'host',
      },
      {
        path: 'Size=56, Overflow=true / [D] Button / LeftAddon / LeftAddon / Fixer / PaintMe',
        type: 'BOOLEAN_OPERATION',
        name: 'PaintMe',
        visible: true,
        id: 154,
        parentId: 150,
        referenceOrigin: 'nested-component',
        referenceOwnerComponentKey: 'button-secondary',
        referenceOwnerPath: 'Size=56, Overflow=true / [D] Button',
        referenceOwnerRelativePath: 'LeftAddon / LeftAddon / Fixer / PaintMe',
      },
      'Size=56, Overflow=true / [D] Button',
      () => true,
    ),
    false,
    'Host-controlled descendant paths must keep the host reference instead of being overwritten by materialized nested descendants',
  );

  const hostPaintedDecision =
    nestedReferenceMerge.getMaterializedInstanceReferenceDecision(
      {
        path: 'View=Primary / LeftAddon / LeftAddon / Fixer / PaintMe',
        type: 'BOOLEAN_OPERATION',
        name: 'PaintMe',
        visible: true,
        id: 54,
        parentId: 50,
        referenceOrigin: 'host',
        fill: {
          token: 'Button/Desktop/Primary/text',
        },
      },
      {
        path: 'View=Primary / LeftAddon / LeftAddon / Fixer / PaintMe',
        type: 'BOOLEAN_OPERATION',
        name: 'PaintMe',
        visible: true,
        id: 154,
        parentId: 150,
        referenceOrigin: 'nested-component',
        referenceOwnerComponentKey: 'addon-icon-16',
        referenceOwnerPath: 'View=Primary / LeftAddon / LeftAddon',
        referenceOwnerRelativePath: 'Fixer / PaintMe',
        fill: {
          token: 'status/info',
        },
      },
      'View=Primary / LeftAddon / LeftAddon',
      () => false,
    );

  assert.equal(
    hostPaintedDecision.preferCandidate,
    true,
    'Host-painted descendants must merge the host token into the nested baseline',
  );
  assert.equal(
    hostPaintedDecision.reason,
    'merge-parent-owned-descendant',
    'Host-painted descendant merge must report property-level parent ownership',
  );

  for (const path of [
    'View=Filled / LeftAddon / LeftAddon / Fixer / PaintMe',
    'View=Filled / Icon / Fixer / PaintMe',
    'Size=56, View=Primary / Icon / Fixer / PaintMe',
    'View=Primary / Bg / Fixer / PaintMe',
    'SelectedState=false / Arrow / Fixer / PaintMe',
  ]) {
    const decision = nestedReferenceMerge.getMaterializedInstanceReferenceDecision(
      {
        path,
        type: 'BOOLEAN_OPERATION',
        name: 'PaintMe',
        visible: true,
        id: 54,
        parentId: 50,
        referenceOrigin: 'host',
        fill: {
          token: 'Host/View/text',
        },
      },
      {
        path,
        type: 'BOOLEAN_OPERATION',
        name: 'PaintMe',
        visible: true,
        id: 154,
        parentId: 150,
        referenceOrigin: 'nested-component',
        referenceOwnerComponentKey: 'paintable-part',
        referenceOwnerPath: path.split(' / ').slice(0, -2).join(' / '),
        referenceOwnerRelativePath: path.split(' / ').slice(-2).join(' / '),
        fill: {
          token: 'status/info',
        },
      },
      path.split(' / ').slice(0, -2).join(' / '),
      () => false,
    );

    assert.equal(
      decision.reason,
      'merge-parent-owned-descendant',
      `Host-painted descendant merge must keep host expected paint for ${path}`,
    );
  }

  const nestedHostControlledPaintDecision =
    nestedReferenceMerge.getMaterializedInstanceReferenceDecision(
      {
        path:
          'View=xLarge / [D] FilterCompanySelect_Single / [D] CompactTag / Arrow / Fixer / PaintMe',
        type: 'BOOLEAN_OPERATION',
        name: 'PaintMe',
        visible: true,
        id: 54,
        parentId: 50,
        referenceOrigin: 'nested-component',
        referenceOwnerComponentKey: 'filter-company-select',
        referenceOwnerPath: 'View=xLarge / [D] FilterCompanySelect_Single',
        referenceOwnerRelativePath: '[D] CompactTag / Arrow / Fixer / PaintMe',
        fill: {
          token: 'text/primary',
        },
      },
      {
        path:
          'View=xLarge / [D] FilterCompanySelect_Single / [D] CompactTag / Arrow / Fixer / PaintMe',
        type: 'BOOLEAN_OPERATION',
        name: 'PaintMe',
        visible: true,
        id: 154,
        parentId: 150,
        referenceOrigin: 'nested-component',
        referenceOwnerComponentKey: 'filter-tag-arrow-open-false',
        referenceOwnerPath:
          'View=xLarge / [D] FilterCompanySelect_Single / [D] CompactTag / Arrow',
        referenceOwnerRelativePath: 'Fixer / PaintMe',
        fill: {
          token: 'text/info',
        },
      },
      'View=xLarge / [D] FilterCompanySelect_Single / [D] CompactTag / Arrow',
      (ownerComponentKey, relativePath) =>
        ownerComponentKey === 'filter-tag-arrow-open-false' &&
        relativePath === 'Fixer / PaintMe',
    );

  assert.equal(
    nestedHostControlledPaintDecision.preferCandidate,
    true,
    'Deeper standalone materialization must merge without overwriting parent-owned paint',
  );
  assert.equal(
    nestedHostControlledPaintDecision.reason,
    'merge-parent-owned-descendant',
    'Nested host-controlled paint must report property-level parent ownership',
  );

  const componentQualifiedNestedPaintDecision =
    nestedReferenceMerge.getMaterializedInstanceReferenceDecision(
      {
        path:
          'View=xLarge / [D] FilterCompanySelect_Single / [D] CompactTag / Arrow / Fixer / PaintMe',
        type: 'BOOLEAN_OPERATION',
        name: 'PaintMe',
        visible: true,
        id: 254,
        parentId: 250,
        referenceOrigin: 'nested-component',
        referenceOwnerComponentKey: 'filter-company-select',
        referenceOwnerPath: 'View=xLarge / [D] FilterCompanySelect_Single',
        referenceOwnerRelativePath: '[D] CompactTag / Arrow / Fixer / PaintMe',
        fill: {
          token: 'text/primary',
        },
      },
      {
        path:
          'View=xLarge / [D] FilterCompanySelect_Single / [D] CompactTag / Arrow / Fixer / PaintMe',
        type: 'BOOLEAN_OPERATION',
        name: 'PaintMe',
        visible: true,
        id: 354,
        parentId: 350,
        referenceOrigin: 'nested-component',
        referenceOwnerComponentKey: 'filter-tag-arrow-open-false',
        referenceOwnerPath:
          'View=xLarge / [D] FilterCompanySelect_Single / [D] CompactTag / Arrow',
        referenceOwnerRelativePath: 'Fixer / PaintMe',
        fill: {
          token: 'text/info',
        },
      },
      'View=xLarge / [D] FilterCompanySelect_Single / [D] CompactTag / Arrow',
      () => false,
    );

  assert.equal(
    componentQualifiedNestedPaintDecision.preferCandidate,
    true,
    'Component-qualified parent nested paint must remain the expected value even without policy registry hit',
  );
  assert.equal(
    componentQualifiedNestedPaintDecision.reason,
    'merge-parent-owned-descendant',
  );

  const parentVariantComponent = {
    key: 'status-preset',
    name: '[D] StatusPreset',
    displayName: '[D] StatusPreset',
    status: 'current',
    platform: 'Desktop',
    defaultVariant: 'status-default',
    structure: [
      {
        id: 1,
        parentId: null,
        path: 'Type=Default',
        type: 'INSTANCE',
        name: 'Type=Default',
        visible: true,
        radius: null,
      },
      {
        id: 2,
        parentId: 1,
        path: 'Type=Default / Status / Label / Label',
        type: 'TEXT',
        name: 'Label',
        visible: true,
        radius: null,
        fill: { token: 'text/info' },
        layout: { itemSpacing: 0 },
      },
    ],
    variants: [
      {
        key: 'status-default',
        name: 'Type=Default',
        properties: { Type: 'Default' },
      },
      {
        key: 'status-approved',
        name: 'Type=Approved, Style=Muted, Size=20',
        properties: { Type: 'Approved', Style: 'Muted', Size: '20' },
      },
    ],
    variantStructures: {
      'status-approved': [
        {
          op: 'update',
          id: 1,
          value: { name: 'Type=Approved, Style=Muted, Size=20' },
        },
        {
          op: 'update',
          id: 2,
          value: { fill: { token: 'decorative-text/green' } },
        },
      ],
    },
  };
  const approvedReference = library.resolveStructureForInstance(
    parentVariantComponent,
    {
      componentKey: 'status-approved',
      variantProperties: { Type: 'Approved', Style: 'Muted', Size: '20' },
    },
  );
  const approvedLabel = approvedReference.find((node) => node.id === 2);

  assert.deepEqual(
    approvedLabel.referenceVariantOwnedProperties,
    ['fill.token'],
    'Resolved variant structure must retain property-level provenance for fields changed by its patch',
  );

  const renamedNestedInstanceReference =
    nestedReferenceMerge.alignMaterializedReferenceInstancePaths(
      [
        {
          id: 1,
          parentId: null,
          path: 'Table / StatusPreset',
          type: 'COMPONENT',
          name: 'Type=Approved, Style=Muted, Size=20',
          visible: true,
          radius: null,
        },
        {
          id: 2,
          parentId: 1,
          path: 'Table / StatusPreset / Status / 🔩 Label',
          type: 'INSTANCE',
          name: '🔩 Label',
          visible: true,
          radius: null,
          componentInstance: { variantProperties: { Uppercase: 'True' } },
        },
        {
          id: 3,
          parentId: 2,
          path: 'Table / StatusPreset / Status / 🔩 Label / Label',
          type: 'TEXT',
          name: 'Label',
          visible: true,
          radius: null,
          fill: { token: 'decorative-text/green' },
          referenceOwnerPath: 'Table / StatusPreset',
          referenceOwnerRelativePath: 'Status / 🔩 Label / Label',
        },
      ],
      [
        {
          id: 101,
          parentId: null,
          path: 'Table / StatusPreset',
          type: 'INSTANCE',
          name: 'StatusPreset',
          visible: true,
          radius: null,
          componentInstance: { componentKey: 'status-approved' },
        },
        {
          id: 102,
          parentId: 101,
          path: 'Table / StatusPreset / Status / Label',
          type: 'INSTANCE',
          name: 'Label',
          visible: true,
          radius: null,
          componentInstance: { componentKey: 'label-key' },
        },
        {
          id: 103,
          parentId: 102,
          path: 'Table / StatusPreset / Status / Label / Label',
          type: 'TEXT',
          name: 'Label',
          visible: true,
          radius: null,
          fill: { token: 'decorative-text/green' },
        },
      ],
      'Table / StatusPreset',
    );
  assert.equal(
    renamedNestedInstanceReference[2].path,
    'Table / StatusPreset / Status / Label / Label',
    'Nested reference paths must align by component identity when an instance display name differs from the catalog',
  );
  assert.equal(
    renamedNestedInstanceReference[2].referenceOwnerRelativePath,
    'Status / Label / Label',
    'Reference owner relative paths must follow component-key path alignment',
  );

  const parentOwnedPaintNode = Object.assign({}, approvedLabel, {
    path: 'Table / StatusPreset / Status / Label / Label',
    referenceOrigin: 'nested-component',
    referenceOwnerComponentKey: 'status-approved',
    referenceOwnerPath: 'Table / StatusPreset',
    referenceOwnerRelativePath: 'Status / Label / Label',
    referenceOwnerVariantProperties: {
      Type: 'Approved',
      Style: 'Muted',
      Size: '20',
    },
  });
  const standaloneLabelNode = {
    id: 202,
    parentId: 201,
    path: 'Table / StatusPreset / Status / Label / Label',
    type: 'TEXT',
    name: 'Label',
    visible: true,
    radius: null,
    fill: { token: 'text/info' },
    layout: { itemSpacing: 10 },
    referenceOrigin: 'nested-component',
    referenceOwnerComponentKey: 'label-default',
    referenceOwnerPath: 'Table / StatusPreset / Status / Label',
    referenceOwnerRelativePath: 'Label',
  };
  const defaultHostPaintNode = Object.assign({}, parentOwnedPaintNode, {
    referenceVariantOwnedProperties: undefined,
  });
  const defaultHostPaintDecision =
    nestedReferenceMerge.getMaterializedInstanceReferenceDecision(
      defaultHostPaintNode,
      standaloneLabelNode,
      'Table / StatusPreset / Status / Label',
      () => false,
    );

  assert.equal(
    defaultHostPaintDecision.preferCandidate,
    true,
    'A default host variant paint must merge into deeper standalone materialization even without a variant patch',
  );
  assert.equal(
    defaultHostPaintDecision.reason,
    'merge-parent-owned-descendant',
    'A canonical property difference must produce explicit parent property ownership',
  );
  const mergedDefaultHostPaint =
    nestedReferenceMerge.mergeMaterializedInstanceReferenceNode(
      defaultHostPaintNode,
      standaloneLabelNode,
      defaultHostPaintDecision,
    );
  assert.equal(
    mergedDefaultHostPaint.fill.token,
    'decorative-text/green',
    'Default host paint must remain the effective fill baseline',
  );
  assert.equal(
    mergedDefaultHostPaint.layout.itemSpacing,
    0,
    'Each differing property must retain its canonical host baseline independently',
  );
  assert.equal(
    mergedDefaultHostPaint.referencePropertyOwners.fill.componentKey,
    'status-approved',
    'Effective baseline must expose the component that owns fill',
  );
  const parentVariantDecision =
    nestedReferenceMerge.getMaterializedInstanceReferenceDecision(
      parentOwnedPaintNode,
      standaloneLabelNode,
      'Table / StatusPreset / Status / Label',
      () => false,
    );

  assert.equal(
    parentVariantDecision.preferCandidate,
    true,
    'Deeper standalone materialization must still contribute properties not owned by the parent variant',
  );
  assert.equal(
    parentVariantDecision.reason,
    'merge-parent-owned-descendant',
    'Property-level merge must explicitly report parent variant precedence',
  );

  const staleOriginalHostBaseline = Object.assign({}, parentOwnedPaintNode, {
    fill: { token: 'text/info' },
    referenceOrigin: 'host',
    referenceVariantOwnedProperties: undefined,
  });
  const selectedMergeSource =
    nestedReferenceMerge.selectMaterializedInstanceMergeSource(
      parentOwnedPaintNode,
      staleOriginalHostBaseline,
      parentVariantDecision,
    );
  assert.equal(
    selectedMergeSource,
    parentOwnedPaintNode,
    'Property-level merge must use the latest materialized parent node instead of a stale original host baseline',
  );

  const mergedApprovedLabel =
    nestedReferenceMerge.mergeMaterializedInstanceReferenceNode(
      selectedMergeSource,
      standaloneLabelNode,
      parentVariantDecision,
    );

  assert.equal(
    mergedApprovedLabel.fill.token,
    'decorative-text/green',
    'Parent StatusPreset variant paint must survive deeper standalone Label materialization',
  );
  assert.equal(
    mergedApprovedLabel.layout.itemSpacing,
    0,
    'Canonical host baseline differences remain host-owned independently from explicit variant-patch provenance',
  );
  assert.equal(
    mergedApprovedLabel.referenceOwnerComponentKey,
    'status-approved',
    'Merged baseline ownership must point to the parent variant that supplied the protected property',
  );

  const approvedWithoutManualRecolor = diff.diffStructures(
    [Object.assign({}, mergedApprovedLabel, { id: 302, parentId: null })],
    [Object.assign({}, mergedApprovedLabel, { id: 402, parentId: null })],
  );
  assert.equal(
    approvedWithoutManualRecolor.diffs.length,
    0,
    'Approved preset using its effective green token must not create a paint customization',
  );

  const approvedWithManualRecolor = diff.diffStructures(
    [
      Object.assign({}, mergedApprovedLabel, {
        id: 303,
        parentId: null,
        fill: { token: 'decorative-text/red' },
      }),
    ],
    [Object.assign({}, mergedApprovedLabel, { id: 403, parentId: null })],
  );
  assert.equal(
    approvedWithManualRecolor.diffs.length,
    1,
    'A real manual recolor must remain visible after parent variant precedence is applied',
  );
  assert.equal(
    approvedWithManualRecolor.diffs[0].message,
    'заливка: decorative-text/green → decorative-text/red',
    'Manual recolor must use the selected parent variant token as its reference baseline',
  );

  const statusPresetCatalog = JSON.parse(fs.readFileSync(
    path.resolve(
      __dirname,
      '../../../shared/design-system_ab/JSONS/web/components/web-corp/Web _ Corp Components -- Status & Property.json',
    ),
    'utf8',
  ));
  const coreStatusCatalog = JSON.parse(fs.readFileSync(
    path.resolve(
      __dirname,
      '../../../shared/design-system_ab/JSONS/web/components/web-core/core/Web _ Core -- Status.json',
    ),
    'utf8',
  ));
  library.__test_hydrateCatalogs([statusPresetCatalog, coreStatusCatalog]);
  const realStatusPreset = library.findComponent(
    '930878602bfd3100e2a3b210d9d88bf4208b6ef5',
  );
  const realStatusPresetReference = library.resolveStructureForInstance(
    realStatusPreset,
    {
      componentKey: '930878602bfd3100e2a3b210d9d88bf4208b6ef5',
      variantProperties: {
        Type: 'Approved',
        Style: 'Contrast',
        Size: '20',
      },
    },
  );
  const realStatusPresetActual = realStatusPresetReference.map((entry) => {
    const cloned = Object.assign({}, entry, {
      nodeId: `actual-status-preset-${entry.id}`,
      path: entry.path.replace(' / 🔩 Label', ' / Label'),
      name: entry.name === '🔩 Label' ? 'Label' : entry.name,
    });
    if (entry.componentInstance) {
      cloned.componentInstance = Object.assign({}, entry.componentInstance, {
        variantProperties: Object.assign(
          {},
          entry.componentInstance.variantProperties ?? {},
        ),
      });
    }
    return cloned;
  });
  const realStatusNode = realStatusPresetActual.find((entry) =>
    entry.path.endsWith(' / Status'),
  );
  const realLabelInstance = realStatusPresetActual.find((entry) =>
    entry.path.endsWith(' / Status / Label') && entry.type === 'INSTANCE',
  );
  realStatusNode.componentInstance.componentKey =
    '349af184bee87341370ef007d5e8189c51bd31ff';
  realLabelInstance.componentInstance.componentKey =
    '5979648b15fed7f52e8d9ae9ab6f4c27fe8fcc6e';

  const realExpandedStatusPreset =
    nestedReferencePreparation.__test_expandReferenceWithCatalogs(
      realStatusPresetReference,
      realStatusPresetActual,
      [statusPresetCatalog, coreStatusCatalog],
    );
  const expandedStatusPresetLabels = realExpandedStatusPreset.filter((entry) =>
    entry.path.endsWith(' / Status / Label / Label'),
  );
  assert.equal(
    expandedStatusPresetLabels.length,
    1,
    'A renamed nested instance must not create a duplicate effective-baseline leaf',
  );
  assert.equal(
    expandedStatusPresetLabels[0].fill.token,
    'VariableID:9d628b4143392a46dacd623e81b3de011d3cc6a1/1930:68',
    'The StatusPreset-owned Contrast label paint must survive Status and Label materialization',
  );
  assert.equal(
    diff.diffStructures(realStatusPresetActual, realExpandedStatusPreset).diffs
      .filter((entry) => entry.details?.property === 'fill').length,
    0,
    'A canonical Approved/Contrast label must not be reported as a paint customization',
  );
  const manuallyRecoloredStatusPreset = realStatusPresetActual.map((entry) =>
    Object.assign({}, entry),
  );
  const manuallyRecoloredStatusLabel = manuallyRecoloredStatusPreset.find((entry) =>
    entry.path.endsWith(' / Status / Label / Label'),
  );
  manuallyRecoloredStatusLabel.fill = {
    token: 'VariableID:373a7154059297e96c397d0055152b95685c34d5/3541:192',
    color: 'rgba(42,119,239,1)',
  };
  const realStatusPaintDiffs = diff
    .diffStructures(manuallyRecoloredStatusPreset, realExpandedStatusPreset)
    .diffs.filter((entry) => entry.details?.property === 'fill');
  assert.equal(
    realStatusPaintDiffs.length,
    1,
    'A real nested Status label recolor must remain detectable',
  );
  assert.equal(
    realStatusPaintDiffs[0].details.reference.value,
    'VariableID:9d628b4143392a46dacd623e81b3de011d3cc6a1/1930:68',
    'A real recolor must be evaluated against the parent-owned StatusPreset token',
  );

  for (let row = 1; row <= 4; row += 1) {
    const rowPath = `Table / Row ${row} / StatusPreset / Status / Label / Label`;
    const rowParent = Object.assign({}, parentOwnedPaintNode, { path: rowPath });
    const rowCandidate = Object.assign({}, standaloneLabelNode, { path: rowPath });
    const rowDecision =
      nestedReferenceMerge.getMaterializedInstanceReferenceDecision(
        rowParent,
        rowCandidate,
        `Table / Row ${row} / StatusPreset / Status / Label`,
        () => false,
      );
    const rowMerged = nestedReferenceMerge.mergeMaterializedInstanceReferenceNode(
      rowParent,
      rowCandidate,
      rowDecision,
    );
    assert.equal(
      rowMerged.fill.token,
      'decorative-text/green',
      `Repeated row ${row} must retain the same parent variant paint baseline`,
    );
  }

  const repeatedActualVariantNodes = [
    {
      id: 1,
      parentId: null,
      path: 'Table',
      type: 'FRAME',
      name: 'Table',
      visible: true,
      radius: null,
    },
  ];
  const repeatedRenamedHostNodes = [
    {
      id: 101,
      parentId: null,
      path: 'Table',
      type: 'FRAME',
      name: 'Table',
      visible: true,
      radius: null,
    },
  ];
  for (let row = 1; row <= 4; row += 1) {
    repeatedActualVariantNodes.push({
      id: row + 1,
      nodeId: `actual-label-${row}`,
      parentId: 1,
      path: `Table / Row ${row} / StatusPreset / Status / Label`,
      type: 'INSTANCE',
      name: 'Label',
      visible: true,
      radius: null,
      componentInstance: {
        componentKey: 'label-key',
        variantProperties: { Uppercase: 'False' },
      },
    });
    repeatedRenamedHostNodes.push({
      id: row + 101,
      parentId: 101,
      path: `Table / Row ${row} / StatusPreset / Status / 🔩 Label`,
      type: 'INSTANCE',
      name: '🔩 Label',
      visible: true,
      radius: null,
      referenceOrigin: 'host',
      componentInstance: {
        variantProperties: { Uppercase: 'True' },
      },
    });
  }
  const alreadyAlignedHostNodes = repeatedRenamedHostNodes.map((node) =>
    Object.assign({}, node, {
      path: node.path.replace(' / 🔩 Label', ' / Label'),
    }),
  );
  const completeExpandedVariantDiffs = diff.diffExplicitNestedVariantStates(
    repeatedActualVariantNodes,
    alreadyAlignedHostNodes,
  );
  assert.equal(
    completeExpandedVariantDiffs.length,
    4,
    'The aligned host fixture must expose all four Uppercase changes',
  );

  const actualBeforeRepeatedAudit = JSON.stringify(repeatedActualVariantNodes);
  const hostBeforeRepeatedAudit = JSON.stringify(repeatedRenamedHostNodes);
  for (const expandedCount of [4, 1, 0]) {
    const expandedDiffs = completeExpandedVariantDiffs.slice(0, expandedCount);
    const explicitHostDiffs = diff.diffExplicitNestedVariantStates(
      repeatedActualVariantNodes,
      repeatedRenamedHostNodes,
      expandedDiffs,
    );
    const signatures = expandedDiffs
      .concat(explicitHostDiffs)
      .map((entry) => `${entry.nodeId}|${entry.details.property}`)
      .sort();
    assert.deepEqual(
      signatures,
      [
        'actual-label-1|variant.Uppercase',
        'actual-label-2|variant.Uppercase',
        'actual-label-3|variant.Uppercase',
        'actual-label-4|variant.Uppercase',
      ],
      `Host variant fallback must make ${expandedCount} expanded diffs deterministic`,
    );
  }
  assert.equal(
    JSON.stringify(repeatedActualVariantNodes),
    actualBeforeRepeatedAudit,
    'Repeated explicit variant comparison must not mutate actual snapshots',
  );
  assert.equal(
    JSON.stringify(repeatedRenamedHostNodes),
    hostBeforeRepeatedAudit,
    'Repeated explicit variant comparison must not mutate cached host structures',
  );

  const duplicateNodes = [
    {
      id: 1,
      parentId: null,
      path: 'Root',
      type: 'FRAME',
      name: 'Root',
      visible: true,
      radius: null,
    },
    {
      id: 2,
      parentId: 1,
      path: 'Root / [D] Tag / Text / Label',
      type: 'TEXT',
      name: 'Label',
      visible: true,
      radius: null,
    },
    {
      id: 3,
      parentId: 1,
      path: 'Root / [D] Tag / Text / Label',
      type: 'TEXT',
      name: 'Label',
      visible: true,
      radius: null,
    },
  ];

  const duplicateKeyMap = occurrenceKeys.buildOccurrenceKeyMap(duplicateNodes);
  assert.equal(
    duplicateKeyMap.get(duplicateNodes[1]),
    'Root / [D] Tag / Text / Label',
    'First duplicate path must keep the base occurrence key',
  );
  assert.equal(
    duplicateKeyMap.get(duplicateNodes[2]),
    'Root / [D] Tag / Text / Label@@2',
    'Second duplicate path must get a stable occurrence suffix',
  );

  const hiddenDuplicateNodes = [
    {
      id: 1,
      parentId: null,
      path: 'Root',
      type: 'FRAME',
      name: 'Root',
      visible: true,
      radius: null,
    },
    {
      id: 2,
      parentId: 1,
      path: 'Root / Label',
      type: 'TEXT',
      name: 'Label',
      visible: true,
      radius: null,
    },
    {
      id: 3,
      parentId: 1,
      path: 'Root / Label',
      type: 'TEXT',
      name: 'Label',
      visible: false,
      radius: null,
    },
    {
      id: 4,
      parentId: 1,
      path: 'Root / Label',
      type: 'TEXT',
      name: 'Label',
      visible: true,
      radius: null,
    },
  ];

  const hiddenDuplicateKeyMap = occurrenceKeys.buildOccurrenceKeyMap(hiddenDuplicateNodes);
  assert.equal(
    hiddenDuplicateKeyMap.get(hiddenDuplicateNodes[1]),
    'Root / Label',
    'First visible duplicate must keep the base occurrence key',
  );
  assert.equal(
    hiddenDuplicateKeyMap.get(hiddenDuplicateNodes[2]),
    'Root / Label@@hidden1',
    'Hidden duplicate must not consume a visible occurrence index',
  );
  assert.equal(
    hiddenDuplicateKeyMap.get(hiddenDuplicateNodes[3]),
    'Root / Label@@2',
    'Second visible duplicate must ignore hidden siblings when receiving occurrence suffixes',
  );

  const duplicateDiff = diff.diffStructures(
    [
      duplicateNodes[0],
      Object.assign({}, duplicateNodes[1], {
        fill: { color: 'rgba(255,255,255,0.94)', token: 'token-inverted' },
      }),
      Object.assign({}, duplicateNodes[2], {
        fill: { color: 'rgba(33,33,36,1)', token: 'token-primary' },
      }),
    ],
    [
      duplicateNodes[0],
      Object.assign({}, duplicateNodes[1], {
        fill: { color: 'rgba(33,33,36,1)', token: 'token-primary' },
      }),
      Object.assign({}, duplicateNodes[2], {
        fill: { color: 'rgba(33,33,36,1)', token: 'token-primary' },
      }),
    ],
    {
      resolveTokenLabel: (token) =>
        token === 'token-primary'
          ? 'text/primary'
          : token === 'token-inverted'
            ? 'text_inverted/primary'
            : token,
    },
  );

  assert.equal(
    duplicateDiff.diffs.length,
    1,
    'Duplicate sibling paths must be diffed independently instead of collapsing into one map entry',
  );
  assert.equal(
    duplicateDiff.diffs[0].message,
    'заливка: text/primary → text_inverted/primary',
    'Only the actual differing duplicate instance should surface as customization',
  );

  const nonColorPaintTokenDiff = diff.diffStructures(
    [
      {
        id: 1,
        parentId: null,
        path: 'ChatBubbleView',
        type: 'FRAME',
        name: 'ChatBubbleView',
        visible: true,
        radius: null,
      },
      {
        id: 2,
        parentId: 1,
        path: 'ChatBubbleView / Message Text',
        type: 'TEXT',
        name: 'Message Text',
        visible: true,
        radius: null,
        fill: {
          color: 'rgba(3,3,6,0.88)',
          token: 'token-typography-float',
        },
      },
    ],
    [
      {
        id: 1,
        parentId: null,
        path: 'ChatBubbleView',
        type: 'FRAME',
        name: 'ChatBubbleView',
        visible: true,
        radius: null,
      },
      {
        id: 2,
        parentId: 1,
        path: 'ChatBubbleView / Message Text',
        type: 'TEXT',
        name: 'Message Text',
        visible: true,
        radius: null,
        styles: {
          fill: {
            styleKey: 'S:6313f5ef73de1fb787861cd6e0408c77214b7898,8790:1',
          },
        },
      },
    ],
    {
      resolveTokenLabel: (token) =>
        token === 'token-typography-float' ? 'regular_letter_spacing/16' : token,
      resolveStyleLabel: (styleKey) =>
        styleKey === 'S:6313f5ef73de1fb787861cd6e0408c77214b7898,8790:1'
          ? 'text/primary'
          : styleKey,
      isPaintToken: (token) => token !== 'token-typography-float',
    },
  );

  assert.equal(
    nonColorPaintTokenDiff.diffs.some(
      (diffEntry) =>
        diffEntry.message === 'Стиль заливка: text/primary → rgba(3,3,6,0.88)',
    ),
    true,
    'Missing paint style binding must reuse the actual paint value inside the style diff',
  );
  assert.equal(
    nonColorPaintTokenDiff.diffs.some(
      (diffEntry) =>
        diffEntry.message === 'заливка: text/primary → rgba(3,3,6,0.88)',
    ),
    false,
    'Paint diff must not duplicate the same style-binding loss',
  );
  assert.equal(
    nonColorPaintTokenDiff.diffs.some((diffEntry) =>
      diffEntry.message.includes('regular_letter_spacing/16'),
    ),
    false,
    'Typography FLOAT variables must never be rendered as paint token diffs',
  );
  assert.equal(
    nonColorPaintTokenDiff.diffs.length,
    1,
    'Style-binding loss must surface as a single customization entry',
  );

  const addedFillWithoutReferenceDiff = diff.diffStructures(
    [
      {
        id: 1,
        parentId: null,
        path: 'Position=Level 1 (outer)',
        type: 'INSTANCE',
        name: 'Position=Level 1 (outer)',
        visible: true,
        radius: null,
        fill: {
          color: 'rgba(255,0,0,1)',
        },
      },
    ],
    [
      {
        id: 1,
        parentId: null,
        path: 'Position=Level 1 (outer)',
        type: 'COMPONENT',
        name: 'Position=Level 1 (outer)',
        visible: true,
        radius: null,
      },
    ],
    {
      strict: true,
    },
  );

  assert.equal(
    addedFillWithoutReferenceDiff.diffs.length,
    1,
    'Added fill on a node without reference fill must still be treated as customization',
  );
  assert.equal(
    addedFillWithoutReferenceDiff.diffs[0].message,
    'заливка: — → #FF0000',
    'Added fill must be rendered as a paint addition diff',
  );

  const hostNestedOwnerDiff = diff.diffStructures(
    [
      {
        id: 1,
        parentId: null,
        path: 'Size=56, Overflow=true',
        type: 'FRAME',
        name: 'Size=56, Overflow=true',
        visible: true,
        radius: null,
      },
      {
        id: 2,
        parentId: 1,
        path: 'Size=56, Overflow=true / [D] Button',
        type: 'INSTANCE',
        name: '[D] Button',
        visible: true,
        radius: null,
        componentInstance: {
          componentKey: 'button-secondary',
          variantProperties: {
            View: 'Secondary',
            Size: '56',
            SingleIcon: 'True',
          },
        },
      },
      {
        id: 3,
        parentId: 2,
        path: 'Size=56, Overflow=true / [D] Button / LeftAddon / LeftAddon / Fixer / PaintMe',
        type: 'BOOLEAN_OPERATION',
        name: 'PaintMe',
        visible: true,
        radius: null,
        fill: {
          color: 'rgba(3,3,6,0.88)',
          token: 'text-primary',
        },
      },
    ],
    [
      {
        id: 1,
        parentId: null,
        path: 'Size=56, Overflow=true',
        type: 'FRAME',
        name: 'Size=56, Overflow=true',
        visible: true,
        radius: null,
      },
      {
        id: 2,
        parentId: 1,
        path: 'Size=56, Overflow=true / [D] Button',
        type: 'INSTANCE',
        name: '[D] Button',
        visible: true,
        radius: null,
        referenceOrigin: 'host',
        componentInstance: {
          componentKey: 'button-secondary',
          variantProperties: {
            View: 'Secondary',
            Size: '56',
            SingleIcon: 'True',
          },
        },
      },
      {
        id: 3,
        parentId: 2,
        path: 'Size=56, Overflow=true / [D] Button / LeftAddon / LeftAddon / Fixer / PaintMe',
        type: 'BOOLEAN_OPERATION',
        name: 'PaintMe',
        visible: true,
        radius: null,
        referenceOrigin: 'host',
        fill: {
          color: 'rgba(255,255,255,0.94)',
          token: 'button-primary-text',
        },
      },
    ],
    {
      resolveTokenLabel: (token) => token,
    },
  );

  assert.equal(
    hostNestedOwnerDiff.diffs.length,
    1,
    'Host descendant diff under a nested instance root must still be detected',
  );
  assert.equal(
    hostNestedOwnerDiff.diffs[0].context.nestedOwnerComponentKey,
    'button-secondary',
    'Host descendant diffs must inherit the nearest nested instance owner component key',
  );
  assert.equal(
    hostNestedOwnerDiff.diffs[0].context.nestedOwnerRelativePath,
    'LeftAddon / LeftAddon / Fixer / PaintMe',
    'Host descendant diffs must inherit the nearest nested instance owner relative path',
  );
  assert.equal(
    hostNestedOwnerDiff.diffs[0].context.actualNestedOwnerComponentKey,
    'button-secondary',
    'Host descendant diffs must also expose the nearest actual nested instance owner component key',
  );
  assert.equal(
    hostNestedOwnerDiff.diffs[0].context.actualNestedOwnerRelativePath,
    'LeftAddon / LeftAddon / Fixer / PaintMe',
    'Host descendant diffs must also expose the nearest actual nested instance owner relative path',
  );

  const directNestedTitleViewDiff = diff.diffStructures(
    [
      {
        id: 1,
        parentId: null,
        path: '[D] TitleView',
        type: 'INSTANCE',
        name: '[D] TitleView',
        visible: true,
        radius: null,
        componentInstance: {
          componentKey: 'title-view-key',
          variantProperties: { View: 'xLarge' },
        },
      },
      {
        id: 2,
        parentId: 1,
        path: '[D] TitleView / MainContent / Status / StatusPreset',
        type: 'INSTANCE',
        name: 'StatusPreset',
        visible: true,
        radius: null,
        componentInstance: {
          componentKey: 'status-preset-processing-key',
          variantProperties: { Style: 'Muted', Type: 'Processing' },
        },
      },
    ],
    [
      {
        id: 1,
        parentId: null,
        path: '[D] TitleView',
        type: 'INSTANCE',
        name: '[D] TitleView',
        visible: true,
        radius: null,
        componentInstance: {
          componentKey: 'title-view-key',
          variantProperties: { View: 'xLarge' },
        },
      },
      {
        id: 2,
        parentId: 1,
        path: '[D] TitleView / MainContent / Status / StatusPreset',
        type: 'INSTANCE',
        name: 'StatusPreset',
        visible: true,
        radius: null,
        componentInstance: {
          componentKey: 'status-preset-approved-key',
          variantProperties: { Style: 'Contrast', Type: 'Approved' },
        },
      },
    ],
  );
  const directStatusStyleDiff = directNestedTitleViewDiff.diffs.find(
    (entry) => entry.details?.property === 'variant.Style',
  );
  assert.equal(
    directStatusStyleDiff?.context.nestedOwnerComponentKey,
    'title-view-key',
    'A direct nested instance under an audited component root must retain the host contract owner',
  );
  assert.equal(
    directStatusStyleDiff?.context.actualNestedOwnerComponentKey,
    'title-view-key',
    'The actual direct nested instance must retain the same host contract owner',
  );
  assert.equal(
    directStatusStyleDiff?.context.nestedOwnerRelativePath,
    'MainContent / Status / StatusPreset',
    'Direct nested instance rules must receive a host-relative slot path',
  );

  const explicitDirectNestedTitleViewDiff = diff.diffExplicitNestedVariantStates(
    [
      {
        id: 1,
        parentId: null,
        path: '[D] TitleView',
        type: 'INSTANCE',
        name: '[D] TitleView',
        visible: true,
        radius: null,
        componentInstance: {
          componentKey: 'title-view-key',
          variantProperties: { View: 'xLarge' },
        },
      },
      {
        id: 2,
        parentId: 1,
        path: '[D] TitleView / MainContent / Status / StatusPreset',
        type: 'INSTANCE',
        name: 'StatusPreset',
        visible: true,
        radius: null,
        componentInstance: {
          componentKey: 'status-preset-processing-key',
          variantProperties: { Style: 'Muted', Type: 'Processing' },
        },
      },
    ],
    [
      {
        id: 1,
        parentId: null,
        path: '[D] TitleView',
        type: 'INSTANCE',
        name: '[D] TitleView',
        visible: true,
        radius: null,
        componentInstance: {
          componentKey: 'title-view-key',
          variantProperties: { View: 'xLarge' },
        },
      },
      {
        id: 2,
        parentId: 1,
        path: '[D] TitleView / MainContent / Status / StatusPreset',
        type: 'INSTANCE',
        name: 'StatusPreset',
        visible: true,
        radius: null,
        componentInstance: {
          componentKey: 'status-preset-approved-key',
          variantProperties: { Style: 'Contrast', Type: 'Approved' },
        },
      },
    ],
  );
  const explicitDirectStatusStyleDiff =
    explicitDirectNestedTitleViewDiff.find(
      (entry) => entry.details?.property === 'variant.Style',
    );
  assert.equal(
    explicitDirectStatusStyleDiff?.context.nestedOwnerComponentKey,
    'title-view-key',
    'Explicit nested variant diffs must retain the host contract owner',
  );
  assert.equal(
    explicitDirectStatusStyleDiff?.context.actualNestedOwnerComponentKey,
    'title-view-key',
    'Explicit actual variant state must retain the same host contract owner',
  );
  assert.equal(
    explicitDirectStatusStyleDiff?.context.nestedOwnerRelativePath,
    'MainContent / Status / StatusPreset',
    'Explicit nested variant rules must receive a host-relative slot path',
  );

  const deps = {
    isPaintPathHostControlled: (componentKey, relativePath) =>
      componentKey === 'nested-a' && relativePath === 'PaintMe',
    isTextPathHostControlled: (componentKey, relativePath) =>
      componentKey === 'nested-a' && relativePath === 'Caption',
    isLayoutPathHostControlled: (componentKey, relativePath) =>
      componentKey === 'nested-a' && relativePath === '',
    resolveComponent: (key) => {
      if (key === 'variant-a') {
        return { key: 'family-a', platform: 'Desktop' };
      }
      if (key === 'variant-b') {
        return { key: 'family-a', platform: 'Desktop' };
      }
      if (key === 'variant-c') {
        return { key: 'family-b', platform: 'Desktop' };
      }
      if (key === 'style-level-1') {
        return { key: 'style-level-1', platform: 'Desktop' };
      }
      if (key === 'style-secondary') {
        return { key: 'style-level-1', platform: 'Desktop' };
      }
      return null;
    },
  };

  assert.deepEqual(
    suppressionPolicy.evaluateDiffSuppression(
      {
        message: 'заливка: neutral/0 → accent/secondary',
        diffKind: 'paint',
        context: {
          actualComponentKey: null,
          referenceComponentKey: null,
          referenceOrigin: 'nested-component',
          nestedOwnerComponentKey: 'nested-a',
          nestedOwnerComponentRole: 'Part',
          nestedOwnerPath: 'Host / Nested',
          nestedOwnerRelativePath: 'PaintMe',
        },
      },
      deps,
    ),
    { suppressed: true, reason: 'host-controlled-paint' },
    'Host-controlled nested paint overrides must be suppressed',
  );

  assert.deepEqual(
    suppressionPolicy.evaluateDiffSuppression(
      {
        message: 'заливка: Button/Desktop/Primary/text → decorative/green',
        diffKind: 'paint',
        context: {
          actualComponentKey: null,
          referenceComponentKey: null,
          referenceOrigin: 'host',
          nestedOwnerComponentKey: 'nested-a',
          nestedOwnerComponentRole: 'Part',
          nestedOwnerPath: 'Host / Nested',
          nestedOwnerRelativePath: 'PaintMe',
        },
      },
      deps,
    ),
    { suppressed: false, reason: null },
    'Manual paint changes against host reference must remain visible',
  );

  assert.deepEqual(
    suppressionPolicy.evaluateDiffSuppression(
      {
        message: 'Стиль текст: body/m → body/s',
        diffKind: 'text-style',
        context: {
          actualComponentKey: null,
          referenceComponentKey: null,
          referenceOrigin: 'nested-component',
          nestedOwnerComponentKey: 'nested-a',
          nestedOwnerComponentRole: 'Part',
          nestedOwnerPath: 'Host / Nested',
          nestedOwnerRelativePath: 'Caption',
        },
      },
      deps,
    ),
    { suppressed: true, reason: 'host-controlled-text' },
    'Host-controlled nested typography overrides must be suppressed',
  );

  assert.deepEqual(
    suppressionPolicy.evaluateDiffSuppression(
      {
        message: 'Паддинг left: 8 → 16',
        diffKind: 'layout',
        context: {
          actualComponentKey: 'variant-a',
          referenceComponentKey: 'variant-b',
          referenceOrigin: 'host',
          nestedOwnerComponentKey: 'nested-a',
          nestedOwnerComponentRole: 'Main',
          nestedOwnerPath: 'Host / Nested',
          nestedOwnerRelativePath: '',
        },
      },
      deps,
    ),
    { suppressed: true, reason: 'host-controlled-layout' },
    'Host-controlled nested layout overrides must be suppressed at root path too',
  );

  assert.deepEqual(
    suppressionPolicy.evaluateDiffSuppression(
      {
        message: 'Паддинг left: 8 → 16',
        diffKind: 'layout',
        context: {
          actualComponentKey: 'variant-a',
          referenceComponentKey: 'variant-b',
          referenceOrigin: 'host',
          nestedOwnerComponentKey: 'nested-b',
          nestedOwnerComponentRole: 'Main',
          nestedOwnerPath: 'Host / Nested',
          nestedOwnerRelativePath: '',
        },
      },
      deps,
    ),
    { suppressed: true, reason: 'nested-variant-root-switch' },
    'Nested root variant switches inside one family must be suppressed',
  );

  assert.deepEqual(
    suppressionPolicy.evaluateDiffSuppression(
      {
        message: 'Паддинг left: 8 → 16',
        diffKind: 'layout',
        context: {
          actualComponentKey: 'variant-a',
          referenceComponentKey: 'variant-c',
          referenceOrigin: 'host',
          nestedOwnerComponentKey: 'nested-b',
          nestedOwnerComponentRole: 'Main',
          nestedOwnerPath: 'Host / Nested',
          nestedOwnerRelativePath: '',
        },
      },
      deps,
    ),
    { suppressed: false, reason: null },
    'Different nested families must remain visible as real customization',
  );

  library.__test_resetHostControlledNestedPathPolicies();
  library.__test_registerHostControlledNestedPath(
    'paint',
    ['addon-icon-24', 'addon-family'],
    'Fixer / PaintMe',
  );

  assert.equal(
    library.isNestedComponentPaintPathHostControlled(
      'addon-icon-24',
      'Fixer / PaintMe',
    ),
    true,
    'Host-controlled nested paint path must resolve by variant key',
  );

  assert.equal(
    library.isNestedComponentPaintPathHostControlled(
      'addon-family',
      'Fixer / PaintMe',
    ),
    true,
    'Host-controlled nested paint path must also resolve by family key alias',
  );

  const backgroundPlate = {
    key: 'background-plate',
    name: '[D] BackgroundPlate',
    structure: [
      {
        id: 1,
        parentId: null,
        path: 'Position=Level 1 (outer)',
        type: 'INSTANCE',
        name: 'Position=Level 1 (outer)',
        visible: true,
        radius: null,
      },
      {
        id: 2,
        parentId: 1,
        path: 'Position=Level 1 (outer) / [D] Style Level 1',
        type: 'INSTANCE',
        name: '[D] Style Level 1',
        visible: true,
        radius: null,
        componentInstance: {
          variantProperties: {
            BackgroundColor: 'base-bg-alt (gray)',
            Skeleton: 'False',
            Type: 'Primary',
          },
        },
        fill: { token: 'base-bg-alt-secondary' },
      },
    ],
  };
  const styleLevel = {
    key: 'style-level-1',
    name: '[D] Style Level 1',
    variants: [
      {
        key: 'style-primary',
        name: 'BackgroundColor=base-bg-alt (gray), Type=Primary, Skeleton=False',
        properties: {
          BackgroundColor: 'base-bg-alt (gray)',
          Skeleton: 'False',
          Type: 'Primary',
        },
      },
      {
        key: 'style-secondary',
        name: 'BackgroundColor=base-bg-alt (gray), Type=Secondary, Skeleton=False',
        properties: {
          BackgroundColor: 'base-bg-alt (gray)',
          Skeleton: 'False',
          Type: 'Secondary',
        },
      },
    ],
  };

  library.__test_hydrateNestedInstanceComponentKeys(backgroundPlate, [
    backgroundPlate,
    styleLevel,
  ]);

  assert.equal(
    backgroundPlate.structure[1].componentInstance.componentKey,
    'style-level-1',
    'Missing nested component keys must be restored from unique component names',
  );

  const nestedVariantDiff = diff.diffStructures(
    [
      Object.assign({}, backgroundPlate.structure[0], {
        nodeId: 'actual-root',
      }),
      Object.assign({}, backgroundPlate.structure[1], {
        nodeId: 'actual-style',
        componentInstance: {
          componentKey: 'style-secondary',
          variantProperties: {
            BackgroundColor: 'base-bg-alt (gray)',
            Skeleton: 'False',
            Type: 'Secondary',
          },
        },
        fill: { token: 'neutral-translucent-100' },
      }),
    ],
    backgroundPlate.structure,
    {
      resolveTokenLabel(token) {
        return {
          'base-bg-alt-secondary': 'base-bg-alt/secondary',
          'neutral-translucent-100': 'neutral-translucent/100',
        }[token] ?? token;
      },
    },
  ).diffs.find((entry) => entry.message.includes('заливка:'));

  assert.equal(
    nestedVariantDiff?.message,
    'заливка: base-bg-alt/secondary → neutral-translucent/100',
    'Nested Style Level variant switch reproduces the BackgroundPlate fill diff before suppression',
  );
  assert.deepEqual(
    suppressionPolicy.evaluateDiffSuppression(nestedVariantDiff, deps),
    { suppressed: true, reason: 'nested-variant-root-switch' },
    'Allowed nested Style Level variant switches inside BackgroundPlate must not surface as fill customizations',
  );

  const amountParentOwnedMinus = {
    id: 900,
    parentId: 899,
    path: 'AmountParagraph / Operation / Minus',
    type: 'TEXT',
    name: 'Minus',
    visible: true,
    radius: null,
    styles: { text: { styleKey: 'paragraph-14-20' } },
    referenceOrigin: 'host',
    referenceVariantOwnedProperties: ['styles.text'],
  };
  const standaloneOperationMinus = Object.assign({}, amountParentOwnedMinus, {
    styles: { text: { styleKey: 'paragraph-16-20-component' } },
    referenceOrigin: 'nested-component',
    referenceOwnerComponentKey: 'operation',
    referenceOwnerPath: 'AmountParagraph / Operation',
    referenceOwnerRelativePath: 'Minus',
    referenceVariantOwnedProperties: [],
  });
  const amountMergedMinus = nestedReferenceMerge.mergeMaterializedInstanceReferenceNode(
    amountParentOwnedMinus,
    standaloneOperationMinus,
    {
      preferCandidate: true,
      reason: 'replace-host-descendant',
      existingOrigin: 'host',
      candidateOrigin: 'nested-component',
      ownerComponentKey: 'operation',
      relativePath: 'Minus',
      withinMaterializedSubtree: true,
    },
  );
  assert.equal(
    amountMergedMinus.styles.text.styleKey,
    'paragraph-14-20',
    'Outer Amount Style must survive nested Operation materialization on deep descendants',
  );

  const amountTypographyDecision =
    nestedReferenceMerge.getMaterializedInstanceReferenceDecision(
      Object.assign({}, amountParentOwnedMinus, {
        referenceVariantOwnedProperties: [],
      }),
      standaloneOperationMinus,
      'AmountParagraph / Operation',
      () => false,
    );
  assert.equal(
    amountTypographyDecision.preferCandidate,
    true,
    'Explicit host typography must be merged into the standalone nested component baseline',
  );
  assert.equal(
    amountTypographyDecision.reason,
    'merge-parent-owned-descendant',
    'Typography ownership must remain observable in nested reference diagnostics',
  );

  const unboundStandaloneOperationMinus = Object.assign(
    {},
    standaloneOperationMinus,
    {
      styles: undefined,
      typographyToken: null,
      text: {
        fontName: { family: 'SF Pro Text', style: 'Bold' },
        fontSize: 16,
        lineHeight: { unit: 'PIXELS', value: 20 },
      },
    },
  );
  const unboundAmountTypographyDecision =
    nestedReferenceMerge.getMaterializedInstanceReferenceDecision(
      Object.assign({}, amountParentOwnedMinus, {
        referenceVariantOwnedProperties: [],
      }),
      unboundStandaloneOperationMinus,
      'AmountParagraph / Operation',
      () => false,
    );
  assert.equal(
    unboundAmountTypographyDecision.preferCandidate,
    true,
    'A nested physical font must merge without replacing an explicit host text-style baseline',
  );
  assert.equal(
    unboundAmountTypographyDecision.reason,
    'merge-parent-owned-descendant',
    'An unbound nested font must retain property-level host typography ownership',
  );

  const amountTextStyleDiff = diff.diffStructures(
    [
      Object.assign({}, amountParentOwnedMinus, {
        styles: { text: { styleKey: 'paragraph-16-20' } },
      }),
    ],
    [amountParentOwnedMinus],
    {
      resolveStyleLabel(styleKey) {
        return {
          'paragraph-14-20': 'Paragraph/14–20',
          'paragraph-16-20': 'Paragraph/16–20',
        }[styleKey] ?? styleKey;
      },
    },
  ).diffs.find((entry) => entry.details?.property === 'styles.text');
  assert.equal(
    amountTextStyleDiff?.message,
    'Стиль текст: Paragraph/14–20 → Paragraph/16–20',
    'Amount typography changes must be reported as text-style tokens, not resolved font names',
  );

  const genericParentOwnedNode = {
    id: 3001,
    parentId: 3000,
    path: 'Root / Wrapper / Child / Content',
    type: 'FRAME',
    name: 'Content',
    visible: true,
    referenceOrigin: 'nested-component',
    referenceOwnerComponentKey: 'wrapper-key',
    referenceOwnerPath: 'Root / Wrapper',
    referenceOwnerRelativePath: 'Child / Content',
    fill: { token: 'wrapper/fill' },
    stroke: { token: 'wrapper/stroke', weight: 1 },
    radius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
    styles: {
      text: { styleKey: 'wrapper/text' },
    },
    layout: {
      itemSpacing: 24,
      padding: { top: 16 },
    },
    componentInstance: {
      componentKey: 'child-key',
      variantProperties: { Size: '40', View: 'Primary' },
    },
  };
  const genericNestedBaselineNode = {
    id: 4001,
    parentId: 4000,
    path: 'Root / Wrapper / Child / Content',
    type: 'FRAME',
    name: 'Content',
    visible: true,
    referenceOrigin: 'nested-component',
    referenceOwnerComponentKey: 'child-key',
    referenceOwnerPath: 'Root / Wrapper / Child',
    referenceOwnerRelativePath: 'Content',
    fill: { token: 'child/fill' },
    stroke: { token: 'child/stroke', weight: 1 },
    radius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
    styles: {
      text: { styleKey: 'child/text' },
      fill: { styleKey: 'child/background-style' },
    },
    layout: {
      itemSpacing: 8,
      padding: { top: 16, right: 12 },
    },
    componentInstance: {
      componentKey: 'child-key',
      variantProperties: {
        Size: '32',
        View: 'Primary',
        Disabled: 'False',
      },
    },
  };
  const genericOwnershipDecision =
    nestedReferenceMerge.getMaterializedInstanceReferenceDecision(
      genericParentOwnedNode,
      genericNestedBaselineNode,
      'Root / Wrapper / Child',
      () => false,
    );
  assert.equal(genericOwnershipDecision.preferCandidate, true);
  assert.equal(
    genericOwnershipDecision.reason,
    'merge-parent-owned-descendant',
    'Any wrapper/nested pair must use the same property ownership merge',
  );
  const genericOwnershipMerged =
    nestedReferenceMerge.mergeMaterializedInstanceReferenceNode(
      genericParentOwnedNode,
      genericNestedBaselineNode,
      genericOwnershipDecision,
    );
  assert.equal(genericOwnershipMerged.fill.token, 'wrapper/fill');
  assert.equal(genericOwnershipMerged.stroke.token, 'wrapper/stroke');
  assert.equal(genericOwnershipMerged.radius.topLeft, 16);
  assert.equal(genericOwnershipMerged.styles.text.styleKey, 'wrapper/text');
  assert.equal(
    genericOwnershipMerged.styles.fill.styleKey,
    'child/background-style',
    'Nested properties absent from the wrapper baseline must remain nested-owned',
  );
  assert.equal(genericOwnershipMerged.layout.itemSpacing, 24);
  assert.equal(genericOwnershipMerged.layout.padding.top, 16);
  assert.equal(
    genericOwnershipMerged.layout.padding.right,
    12,
    'Nested-only layout leaves must survive a sibling host override',
  );
  assert.equal(
    genericOwnershipMerged.componentInstance.variantProperties.Size,
    '40',
  );
  assert.equal(
    genericOwnershipMerged.componentInstance.variantProperties.Disabled,
    'False',
  );
  assert.equal(
    genericOwnershipMerged.referencePropertyOwners.fill.componentKey,
    'wrapper-key',
  );
  assert.equal(
    genericOwnershipMerged.referencePropertyOwners['layout.padding.right'].componentKey,
    'child-key',
  );

  console.log('Nested variant and suppression policy regression checks passed');
}

main();
