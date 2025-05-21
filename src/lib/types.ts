import type { SkinElement } from "./skinElement"

export type SkinElementPropertyType = "number" | "string" | "boolean" | "color"

export interface SkinElementProperty<T = any> {
  type: SkinElementPropertyType
  default: T
  parser?: (input: any) => T
  options?: {
    min?: number
    max?: number
    step?: number
  }
}

export type SkinElementPropertyMap = {
  [key: string]: SkinElementProperty
}

export type SkinElementPropertyValues = Record<string, any>;

export type SkinElementFeature = {
  feature: string,
  element: SkinElement,
  values: SkinElementPropertyValues,
}
