import { create } from "zustand";
import { EmptySkin, getDefaultProperties } from "@/lib/elements";
import type { Skin, Component, ComponentRenderingContext } from "@/lib/types";
import { useCallback } from "react";

type SkinStore = {
  skin: Skin;
  updateSkin: (skin: Skin) => void;
  updateComponent: (
    elementIndex: number,
    componentIndex: number,
    updates: {
      props?: Record<string, any>;
      disabled?: boolean;
      customName?: string;
    }
  ) => void;
  updateRenderMethod: (
    elementIndex: number,
    componentIndex: number,
    method: string
  ) => void;
  moveComponent: (elementIndex: number, from: number, to: number) => void;
  addComponent: (
    elementIndex: number,
    component: Component,
    customName?: string
  ) => void;
  removeComponent: (elementIndex: number, componentIndex: number) => void;
};

export const useSkinStore = create<SkinStore>((set) => ({
  skin: EmptySkin,

  updateSkin: (skin) => set({ skin }),

  updateComponent: (elementIndex, componentIndex, updates) => {
    set((state) => {
      const elements = [...state.skin.elements];
      const element = { ...elements[elementIndex] };
      const components = [...element.components];

      components[componentIndex] = {
        ...components[componentIndex],
        properties: updates.props || components[componentIndex].properties,
        disabled:
          updates.disabled !== undefined
            ? updates.disabled
            : components[componentIndex].disabled,
        customName:
          updates.customName !== undefined
            ? updates.customName
            : components[componentIndex].customName,
      };

      element.components = components;
      elements[elementIndex] = element;

      return {
        skin: {
          ...state.skin,
          elements,
        },
      };
    });
  },

  updateRenderMethod: (elementIndex, componentIndex, method) => {
    set((state) => {
      const elements = [...state.skin.elements];
      const element = { ...elements[elementIndex] };
      const components = [...element.components];

      components[componentIndex] = {
        ...components[componentIndex],
        component: {
          ...components[componentIndex].component,
          render: method,
          parsedRender: undefined
        },
      };

      element.components = components;
      elements[elementIndex] = element;

      return {
        skin: {
          ...state.skin,
          elements,
        },
      };
    });
  },

  moveComponent: (elementIndex, from, to) => {
    set((state) => {
      const elements = [...state.skin.elements];
      const element = { ...elements[elementIndex] };
      const components = [...element.components];

      const [moved] = components.splice(from, 1);
      components.splice(to, 0, moved);

      element.components = components;
      elements[elementIndex] = element;

      return {
        skin: {
          ...state.skin,
          elements,
        },
      };
    });
  },

  addComponent: (elementIndex, component, customName) => {
    set((state) => {
      const elements = [...state.skin.elements];
      const element = { ...elements[elementIndex] };
      const components = [...element.components];

      components.push({
        component,
        properties: getDefaultProperties(component),
        customName,
      });

      element.components = components;
      elements[elementIndex] = element;

      return {
        skin: {
          ...state.skin,
          elements,
        },
      };
    });
  },
  removeComponent: (elementIndex, componentIndex) => {
    set((state) => {
      const elements = [...state.skin.elements];
      const element = { ...elements[elementIndex] };
      const components = [...element.components];

      components.splice(componentIndex, 1);

      element.components = components;
      elements[elementIndex] = element;

      return {
        skin: {
          ...state.skin,
          elements,
        },
      };
    });
  },
}));

export function useElement(index: number) {
  const element = useSkinStore((s) => s.skin.elements[index]);
  const addComponent = useSkinStore((s) => s.addComponent);
  const updateComponent = useSkinStore((s) => s.updateComponent);
  const moveComponent = useSkinStore((s) => s.moveComponent);
  const removeComponent = useSkinStore((s) => s.removeComponent);

  const handleAddComponent = useCallback(
    (component: Component, customName?: string) =>
      addComponent(index, component, customName),
    [addComponent, index]
  );

  const handleUpdateComponent = useCallback(
    (
      componentIndex: number,
      updates: {
        props?: Record<string, any>;
        disabled?: boolean;
        customName?: string;
      }
    ) => updateComponent(index, componentIndex, updates),
    [updateComponent, index]
  );

  const handleMoveComponent = useCallback(
    (from: number, to: number) => moveComponent(index, from, to),
    [moveComponent, index]
  );

  const handleRemoveComponent = useCallback(
    (componentIndex: number) => removeComponent(index, componentIndex),
    [removeComponent, index]
  );

  return {
    element,
    components: element.components,
    addComponent: handleAddComponent,
    updateComponent: handleUpdateComponent,
    moveComponent: handleMoveComponent,
    removeComponent: handleRemoveComponent,
  };
}

export function useComponent(elementIndex: number, componentIndex: number) {
  const updateComponent = useSkinStore((s) => s.updateComponent);
  const moveComponent = useSkinStore((s) => s.moveComponent);
  const updateRenderMethod = useSkinStore((s) => s.updateRenderMethod);

  const handleUpdate = (updates: {
    props?: Record<string, any>;
    disabled?: boolean;
    customName?: string;
  }) => {
    updateComponent(elementIndex, componentIndex, updates);
  };

  const handleMoveUp = () => {
    if (componentIndex > 0) {
      moveComponent(elementIndex, componentIndex, componentIndex - 1);
    }
  };

  const handleMoveDown = () => {
    moveComponent(elementIndex, componentIndex, componentIndex + 1);
  };

  const handleUpdateRenderMethod = (
    method: string
  ) => {
    updateRenderMethod(elementIndex, componentIndex, method);
  };

  return {
    handleUpdate,
    handleMoveUp,
    handleMoveDown,
    handleUpdateRenderMethod,
  };
}
