import {
  type ApolloGenerationComponentNode,
  type ApolloGenerationFrameNode,
  type ApolloGenerationNode,
  type ApolloGenerationPlan,
  type ApolloGenerationTextOverride,
} from './contracts';

export type ApolloGenerationExecutionResult = {
  rootNodeId: string;
  rootNodeName: string;
  componentCount: number;
};

type ApolloGeneratedNode = FrameNode | InstanceNode;

async function applyFrameProperties(
  frame: FrameNode,
  definition: ApolloGenerationFrameNode,
  api: PluginAPI,
): Promise<void> {
  const width = definition.width === 'fill' ? 320 : definition.width;
  frame.resize(width, Math.max(definition.minHeight || 100, 100));
  frame.layoutMode = definition.layout === 'horizontal' ? 'HORIZONTAL' : 'VERTICAL';
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'FIXED';
  frame.itemSpacing = definition.gap;
  frame.paddingTop = definition.padding;
  frame.paddingRight = definition.padding;
  frame.paddingBottom = definition.padding;
  frame.paddingLeft = definition.padding;
  frame.cornerRadius = definition.cornerRadius;
  frame.clipsContent = false;
  frame.fills = [];
  if (definition.fillVariableKey) {
    const variable = await api.variables.importVariableByKeyAsync(
      definition.fillVariableKey,
    );
    const paint: SolidPaint = {
      type: 'SOLID',
      color: { r: 1, g: 1, b: 1 },
    };
    frame.fills = [
      api.variables.setBoundVariableForPaint(paint, 'color', variable),
    ];
  }
  if (definition.minHeight) {
    frame.minHeight = definition.minHeight;
  }
}

function buildInstanceProperties(
  properties: Array<{ name: string; value: string | boolean }>,
): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {};
  for (const property of properties) result[property.name] = property.value;
  return result;
}

function normalizedNodeName(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[🔩🔄🔒💊🚧]/gu, '')
    .replace(/\[\s*[dm]\s*\]/giu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('ru-RU');
}

function findDescendantByPath(
  root: SceneNode & ChildrenMixin,
  value: string,
  acceptedTypes: string[],
  occurrence: number | null = null,
): SceneNode | null {
  const requested = value
    .split('/')
    .map((segment) => normalizedNodeName(segment))
    .filter(Boolean);
  if (!requested.length) return null;

  const matches: SceneNode[] = [];
  const visit = (parent: SceneNode & ChildrenMixin, ancestorNames: string[]) => {
    for (const child of parent.children) {
      const childPath = ancestorNames.concat(normalizedNodeName(child.name));
      const suffixMatches = childPath.length >= requested.length && requested.every(
        (segment, index) => childPath[childPath.length - requested.length + index] === segment,
      );
      if (suffixMatches && acceptedTypes.includes(String(child.type))) matches.push(child);
      if ('children' in child) visit(child as SceneNode & ChildrenMixin, childPath);
    }
  };
  visit(root, []);
  if (occurrence === null) return matches.length === 1 ? matches[0] : null;
  return matches[occurrence] || null;
}

function findTextNodeByPath(
  instance: InstanceNode,
  value: string,
  occurrence: number | null,
): TextNode | null {
  const node = findDescendantByPath(instance, value, ['TEXT'], occurrence);
  return node?.type === 'TEXT' ? node : null;
}

async function loadTextNodeFonts(textNode: TextNode, api: PluginAPI): Promise<void> {
  const fonts = textNode.characters.length > 0
    ? textNode.getRangeAllFontNames(0, textNode.characters.length)
    : textNode.fontName === api.mixed
      ? []
      : [textNode.fontName];
  const seen = new Set<string>();
  for (const font of fonts) {
    const key = `${font.family}:${font.style}`;
    if (seen.has(key)) continue;
    seen.add(key);
    await api.loadFontAsync(font);
  }
}

async function applyTextOverrides(
  instance: InstanceNode,
  overrides: ApolloGenerationTextOverride[],
  api: PluginAPI,
): Promise<void> {
  for (const override of overrides) {
    const occurrence = override.occurrence === undefined ? null : override.occurrence;
    const textNode = findTextNodeByPath(instance, override.path, occurrence);
    if (!textNode) {
      throw new Error(`Не найден текстовый слой ${override.path} в ${instance.name}.`);
    }
    await loadTextNodeFonts(textNode, api);
    textNode.characters = override.value;
  }
}

function applyNodeOverrides(
  instance: InstanceNode,
  overrides: ApolloGenerationComponentNode['nodeOverrides'],
): void {
  for (const override of overrides) {
    const target = findDescendantByPath(
      instance,
      override.path,
      override.nodeTypes,
      override.occurrence,
    );
    if (!target) {
      throw new Error(`Не найден узел ${override.path} в ${instance.name}.`);
    }
    target.visible = override.visible;
  }
}

function applyInstancePropertyOverrides(
  instance: InstanceNode,
  overrides: ApolloGenerationComponentNode['instancePropertyOverrides'],
): void {
  for (const override of overrides) {
    const target = findDescendantByPath(
      instance,
      override.path,
      ['INSTANCE'],
      override.occurrence,
    );
    if (!target || target.type !== 'INSTANCE') {
      throw new Error(`Не найден вложенный instance ${override.path} в ${instance.name}.`);
    }
    target.setProperties(buildInstanceProperties(override.properties));
  }
}

async function applyComponentOverrides(
  instance: InstanceNode,
  definition: ApolloGenerationComponentNode,
  api: PluginAPI,
): Promise<void> {
  if (definition.variantProperties.length) {
    instance.setProperties(buildInstanceProperties(definition.variantProperties));
  }
  applyInstancePropertyOverrides(instance, definition.preconditionOverrides);
  await applyTextOverrides(instance, definition.textOverrides, api);
  applyInstancePropertyOverrides(instance, definition.instancePropertyOverrides);
  applyNodeOverrides(instance, definition.nodeOverrides);
}

function applyChildWidth(
  node: ApolloGeneratedNode,
  definition: ApolloGenerationNode,
): void {
  if (definition.width === 'fill') {
    node.layoutSizingHorizontal = 'FILL';
    return;
  }
  node.resize(definition.width, node.height);
  node.layoutSizingHorizontal = 'FIXED';
}

function removeSlotChildren(slot: SceneNode & ChildrenMixin): void {
  for (const child of [...slot.children]) child.remove();
}

export async function executeApolloGenerationPlan(
  plan: ApolloGenerationPlan,
  api: PluginAPI = figma,
  shouldContinue: () => boolean = () => true,
): Promise<ApolloGenerationExecutionResult> {
  const createdNodes = new Map<string, ApolloGeneratedNode>();
  let root: FrameNode | null = null;
  let componentCount = 0;

  try {
    for (const definition of plan.nodes) {
      if (!shouldContinue()) {
        throw new Error('Генерация остановлена.');
      }

      let node: ApolloGeneratedNode;
      if (definition.type === 'frame') {
        const frame = api.createFrame();
        frame.name = definition.name;
        await applyFrameProperties(frame, definition, api);
        node = frame;
      } else {
        const component = await api.importComponentByKeyAsync(definition.componentKey);
        if (!shouldContinue()) {
          throw new Error('Генерация остановлена.');
        }
        if (definition.placement === 'swap-instance') {
          const parent = createdNodes.get(definition.parentId);
          if (!parent || parent.type !== 'INSTANCE' || !definition.parentPath) {
            throw new Error(`Не найден instance-родитель ${definition.parentId}.`);
          }
          const target = findDescendantByPath(
            parent,
            definition.parentPath,
            ['INSTANCE'],
            definition.parentOccurrence === undefined
              ? null
              : definition.parentOccurrence,
          );
          if (!target || target.type !== 'INSTANCE') {
            throw new Error(`Не найден вложенный instance ${definition.parentPath} в ${parent.name}.`);
          }
          target.swapComponent(component);
          target.name = definition.name;
          await applyComponentOverrides(target, definition, api);
          node = target;
        } else {
          const instance = component.createInstance();
          instance.name = definition.name;
          await applyComponentOverrides(instance, definition, api);
          node = instance;
        }
        componentCount += 1;
      }

      if (definition.parentId === null) {
        if (node.type !== 'FRAME') {
          throw new Error('Корневой узел генерации должен быть фреймом.');
        }
        root = node;
      } else if (definition.placement === 'replace-slot') {
        const parent = createdNodes.get(definition.parentId);
        if (!parent || parent.type !== 'INSTANCE' || !definition.parentPath) {
          throw new Error(`Не найден instance-родитель ${definition.parentId}.`);
        }
        const slot = findDescendantByPath(
          parent,
          definition.parentPath,
          ['SLOT'],
          definition.parentOccurrence === undefined
            ? null
            : definition.parentOccurrence,
        );
        if (!slot || String(slot.type) !== 'SLOT' || !('children' in slot)) {
          throw new Error(`Не найден SLOT ${definition.parentPath} в ${parent.name}.`);
        }
        const slotWithChildren = slot as SceneNode & ChildrenMixin;
        removeSlotChildren(slotWithChildren);
        slotWithChildren.appendChild(node);
        applyChildWidth(node, definition);
      } else if (definition.placement === 'append') {
        const parent = createdNodes.get(definition.parentId);
        if (!parent || parent.type !== 'FRAME') {
          throw new Error(`Не найден frame-родитель ${definition.parentId}.`);
        }
        parent.appendChild(node);
        applyChildWidth(node, definition);
      }
      createdNodes.set(definition.id, node);
    }

    if (!root) {
      throw new Error('Apollo Proxy не вернул корневой фрейм.');
    }
    const center = api.viewport.center;
    root.x = Math.round(center.x - root.width / 2);
    root.y = Math.round(center.y - root.height / 2);
    api.currentPage.selection = [root];
    api.viewport.scrollAndZoomIntoView([root]);

    return {
      rootNodeId: root.id,
      rootNodeName: root.name,
      componentCount,
    };
  } catch (error) {
    if (root && !root.removed) {
      root.remove();
    } else {
      for (const node of createdNodes.values()) {
        if (!node.removed) node.remove();
      }
    }
    throw error;
  }
}
