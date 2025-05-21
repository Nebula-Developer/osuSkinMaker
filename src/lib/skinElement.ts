import type {
  SkinElementPropertyMap,
  SkinElementPropertyValues,
} from "./types";

export class SkinElement<T extends SkinElementPropertyMap = {}> {
  name: string;
  width: number;
  height: number;
  properties: SkinElementPropertyMap;
  render: (
    ctx: CanvasRenderingContext2D,
    values: SkinElementPropertyValues
  ) => void;

  constructor(
    name: string,
    width: number,
    height: number,
    properties: T,
    render: (
      ctx: CanvasRenderingContext2D,
      values: SkinElementPropertyValues
    ) => void
  ) {
    this.name = name;
    this.width = width;
    this.height = height;
    this.properties = properties;
    this.render = render;
  }
}
