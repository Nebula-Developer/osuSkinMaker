/** Available theme options */
export type Theme = "dark" | "light";

/** Types of properties a component can have */
export type PropertyType =
  | "text"
  | "number"
  | "boolean"
  | "color"
  | "select"
  | "image"
  | "point";

/** A 2D point */
export type Point = {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
};

/** Type-safe mapping of possible property types */
export type RealPropertyType = string | number | boolean | Point;

/** Base settings with a default value */
type PropertyTypeBase<T> = {
  /** Default value for the property */
  default?: T;
};

/** Mapping of property types to their specific settings */
type PropertyTypeSettingsMap = {
  text: {
    /** Maximum length allowed for the text */
    maxLength?: number;
    /** Placeholder text for input fields */
    placeholder?: string;
  } & PropertyTypeBase<string>;

  number: {
    /** Minimum allowed number */
    min?: number;
    /** Maximum allowed number */
    max?: number;
    /** Step increment */
    step?: number;
    /** Whether to allow custom stepping */
    customStep?: boolean;
  } & PropertyTypeBase<number>;

  boolean: PropertyTypeBase<boolean>;

  color: PropertyTypeBase<string>;

  select: {
    /** List of options available for selection */
    options: string[];
  } & PropertyTypeBase<string>;

  image: PropertyTypeBase<HTMLImageElement | string>;

  point: {
    /** Default point as an object with x and y coordinates */
    default: Point;
    /** Minimum value for x and y coordinates */
    min?: Point;
    /** Maximum value for x and y coordinates */
    max?: Point;
    /** Default step increment for x and y coordinates */
    step?: number | Point;
    /** Whether to enable a drag-pane for the point */
    dragPane?: boolean;
    /** Whether to allow custom stepping for x and y coordinates */
    customStep?: boolean;
  } & PropertyTypeBase<Point>;

  /** Fallback type for any additional property types */
  [key: string]: PropertyTypeBase<any> & Record<string, any>;
};

/** Type-safe settings for each property type */
export type PropertyTypeSettings = {
  [K in keyof PropertyTypeSettingsMap]: {
    /** Display label for the property */
    label: string;
    /** Optional description for the property */
    description?: string;
    /** The type of the property */
    type: K;
    /** Settings specific to the property type */
    settings: PropertyTypeSettingsMap[K];
  };
}[PropertyType];

/** A contextual object passed to a {@link Component}'s rendering method */
export type ComponentRenderingContext = {
  /** The canvas rendering context */
  ctx: CanvasRenderingContext2D;
  /** The size of the canvas */
  size: Size;
  /** A **non-type-safe** object containing the component's property values */
  properties: Record<string, any>;
};

/** Base type for a component, which includes its properties and rendering method */
export type Component = {
  /** The display name of the component */
  name: string;
  /** Optional description of the component */
  description?: string;
  /** The properties of the component, including their types and settings */
  properties: Record<string, PropertyTypeSettings>;
  /** The stringified method that renders the component. **The context is not restored after rendering, so you must do it manually if needed.** */
  render: string;
  /** The parsed rendering method, which is a function that intakes a {@link ComponentRenderingContext} */
  parsedRender?: (context: ComponentRenderingContext) => void;
};

/** Scale variant for an element (e.g., @2x) */
export type ElementScale = {
  /** Scale multiplier for resolution */
  scale: number;
  /** Suffix added to the filename to indicate the scale */
  suffix: string;
};

/** Width and height size */
export type Size = {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
};

/** Represents a skin element */
export type Element = {
  /** Size of the element in pixels. All scales are relative to this size. */
  size: Size;
  /** Display name for the element */
  displayName: string;
  /** File name of the element, used when exporting to a skin */
  fileName: string;
  /** Different scale variants available */
  scales: ElementScale[];
  /** The components that make up the element */
  components: ElementComponentArray;
};

/** Represents a component paired with its properties */
export type ElementComponentData = {
  /** The component itself */
  component: Component;
  /** The property values for the component */
  properties: Record<string, RealPropertyType>;
  /** Optional position of the component within the element */
  disabled?: boolean;
  /** Optional custom name for identification */
  customName?: string;
}

/** Array of components that make up an element */
export type ElementComponentArray = ElementComponentData[];

/** The base type defining features of an osu! skin */
export type Skin = {
  /** The name of the skin */
  name: string;
  /** The author of the skin */
  author: string;
  /** The version of the skin */
  version: string;

  /** The elements that make up the skin. This is a constant array of element definitions. */
  elements: Element[];
};
