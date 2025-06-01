import { toast } from "sonner";
import type {
  PropertyTypeSettings,
  Component,
  Size,
  Element,
  Skin,
} from "./types";

export const RadiusProperty: PropertyTypeSettings = {
  label: "Radius",
  description:
    "The radius of the circle, where 1 unit will fill the entire canvas",
  type: "number",
  settings: {
    default: 0.5,
    // min: 0,
    // max: 5,
    customStep: true
  },
};

export const PositionProperty: PropertyTypeSettings = {
  label: "Position",
  description:
    "Position relative from the top-left corner of the canvas (0,0) to the bottom-right corner (1,1)",
  type: "point",
  settings: {
    default: { x: 0.5, y: 0.5 },
    min: { x: -0.5, y: -0.5 },
    max: { x: 1.5, y: 1.5 },
    step: 0.25,
    dragPane: true,
    customStep: true,
  },
};

export const CircleClipComponent: Component = {
  name: "Circle Clip",
  description: "A component that clips the canvas to a circle shape",
  properties: {
    radius: RadiusProperty,
    position: {
      ...PositionProperty,
      description:
        "The origin point of the circle, relative to the canvas size",
    },
    inverse: {
      label: "Inverse Clip",
      description:
        "If true, the circle will clip everything outside of it instead of inside",
      type: "boolean",
      settings: { default: false },
    },
  },
  render: (context) => {
    const { ctx, size, properties } = context;
    const { radius, position, inverse } = properties;
    const x = position.x * size.width;
    const y = position.y * size.height;
    const r = (radius * Math.min(size.width, size.height)) / 2;
    ctx.save();
    ctx.beginPath();

    if (inverse) {
      ctx.rect(0, 0, size.width, size.height);
      ctx.arc(x, y, r, 0, Math.PI * 2, true);
      ctx.clip("evenodd");
    } else {
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();
    }
  },
};

export const CircleComponent: Component = {
  name: "Circle",
  description: "A simple circle component that fills the canvas",
  properties: {
    color: {
      label: "Color",
      description: "The color of the circle",
      type: "color",
      settings: { default: "#FF0000" },
    },
    opacity: {
      label: "Opacity",
      description:
        "The opacity of the circle, where 1 is fully opaque and 0 is fully transparent",
      type: "number",
      settings: { default: 1, min: 0, max: 1, step: 0.01 },
    },
    radius: RadiusProperty,
    position: {
      ...PositionProperty,
      description:
        "The origin point of the circle, relative to the canvas size",
    },
  },
  render: (context) => {
    const { ctx, size, properties } = context;
    const { color, opacity, radius, position } = properties;
    const x = position.x * size.width;
    const y = position.y * size.height;
    const r = (radius * Math.min(size.width, size.height)) / 2;
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};

export const RestoreMaskComponent: Component = {
  name: "Restore Mask",
  description: "Restores the canvas state, removing any clipping masks applied",
  properties: {
    depth: {
      type: "number",
      label: "Restore Depth",
      description: "Number of times to restore the canvas state",
      settings: { default: 1, min: 1, max: 10, step: 1 },
    },
  },
  render: (context) => {
    const { ctx } = context;
    const { depth } = context.properties;
    for (let i = 0; i < depth; i++) {
      ctx.restore();
    }
  },
};

export const BoxComponent: Component = {
  name: "Box",
  description: "A simple box component that fills the canvas",
  properties: {
    color: {
      label: "Color",
      description: "The color of the box",
      type: "color",
      settings: { default: "#FF0000" },
    },
    opacity: {
      label: "Opacity",
      description:
        "The opacity of the box, where 1 is fully opaque and 0 is fully transparent",
      type: "number",
      settings: { default: 1, min: 0, max: 1, step: 0.01 },
    },
    size: {
      label: "Size",
      description: "The size of the box, relative to the canvas",
      type: "point",
      settings: {
        default: { x: 1, y: 1 },
        min: { x: 0, y: 0 },
        max: { x: 2, y: 2 },
        step: 0.01,
        dragPane: true,
      },
    },
    origin: {
      label: "Origin",
      description: "The origin point of the box, relative to the canvas size",
      type: "point",
      settings: {
        default: { x: 0.5, y: 0.5 },
        min: { x: -0.5, y: -0.5 },
        max: { x: 1.5, y: 1.5 },
        step: 0.01,
        dragPane: true,
        customStep: true,
      },
    },
  },
  render: (context) => {
    const { ctx, size, properties } = context;
    const { color, opacity } = properties;
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    const boxSize = properties.size;
    const origin = properties.origin;
    const x = origin.x * size.width - (boxSize.x * size.width) / 2;
    const y = origin.y * size.height - (boxSize.y * size.height) / 2;
    ctx.fillRect(x, y, boxSize.x * size.width, boxSize.y * size.height);
    ctx.restore();
  },
};

/** Renders all enabled components of an element to the canvas context */
export function drawElement(
  element: Element,
  ctx: CanvasRenderingContext2D,
  size: Size
): void {
  ctx.save();

  const widthScale = size.width / element.size.width;
  const heightScale = size.height / element.size.height;
  ctx.scale(widthScale, heightScale);

  element.components.forEach((component) => {
    if (component.disabled) return;

    try {
      component.component.render({
        ctx,
        size: element.size,
        properties: component.properties,
      });
    } catch (error) {
      toast.error(
        `Error rendering component. See console for details.`,
      );
      console.error(
        `Error rendering component "${component.component.name}" in element "${element.displayName}":`,
        error,
      );
    }
  });

  ctx.restore();
}

const keySize: Size = { width: 50, height: 107 };
const baseKey = {
  size: keySize,
  scales: [
    { scale: 1, suffix: "" },
    { scale: 2, suffix: "@2x" },
  ],
  components: [],
};

/** Skin elements for osu!mania keys */
export const ManiaSkinElements: Element[] = [
  {
    displayName: "Key 1",
    fileName: "mania-key1",
    ...baseKey,
  },
  {
    displayName: "Key 1 (Down)",
    fileName: "mania-key1D",
    ...baseKey,
  },
  {
    displayName: "Key 2",
    fileName: "mania-key2",
    ...baseKey,
  },
  {
    displayName: "Key 2 (Down)",
    fileName: "mania-key2D",
    ...baseKey,
  },
  {
    displayName: "Key S",
    fileName: "mania-keyS",
    ...baseKey,
  },
  {
    displayName: "Key S (Down)",
    fileName: "mania-keySD",
    ...baseKey,
  },
];

/** The empty skin with no elements, used as a placeholder or default skin */
export const EmptySkin: Skin = {
  name: "Empty Skin",
  author: "Unknown",
  version: "1.0",
  elements: ManiaSkinElements,
};

/** Returns the default property values for a given component */
export function getDefaultProperties(component: Component) {
  const defaults: Record<string, any> = {};
  for (const key in component.properties) {
    const prop = component.properties[key];
    defaults[key] = prop.settings.default;
  }
  return defaults;
}
