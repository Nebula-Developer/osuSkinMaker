import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { EditorSidebar } from "@/components/editor-sidebar";
import { PreviewPanel } from "@/components/preview-panel";
import { Navbar } from "@/components/navbar";
import type { SkinElement } from "@/lib/skinElement";
import type { SkinElementFeature } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

const circleElement: SkinElement = {
  name: "Circle",
  height: 100,
  width: 100,
  render(ctx, values) {
    ctx.fillStyle = values.color;
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, Math.PI * 2);
    ctx.fill();
  },
  properties: {
    color: {
      type: "color",
      default: "#ff0000",
      parser: (input) => input,
    },
  },
};

const coolElement: SkinElement = {
  name: "PlasmaGrid",
  height: 100,
  width: 100,
  render(ctx, values) {
    const { color, gridSize, pulseSpeed, intensity } = values;
    const size = 100;

    ctx.clearRect(0, 0, size, size);
    ctx.save();

    const spacing = size / gridSize;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = intensity * 5;

    const gridPixelSize = spacing * gridSize;
    const offsetX = (size - gridPixelSize) / 2;
    const offsetY = (size - gridPixelSize) / 2;

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const dx = x - (gridSize - 1) / 2;
        const dy = y - (gridSize - 1) / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const pulse = Math.sin(distance * 0.5 - pulseSpeed);

        const radius = 1 + (pulse + 1) * intensity;

        ctx.beginPath();
        ctx.arc(
          offsetX + x * spacing + spacing / 2,
          offsetY + y * spacing + spacing / 2,
          radius,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    ctx.restore();
  },
  properties: {
    color: {
      type: "color",
      default: "#00ffff",
      parser: (input) => input,
    },
    gridSize: {
      type: "number",
      default: 6,
      parser: (input) => parseInt(input),
      options: {
        min: 2,
        max: 20,
        step: 1,
      },
    },
    pulseSpeed: {
      type: "number",
      default: 2,
      parser: (input) => parseFloat(input),
      options: {
        min: 0.1,
        max: 10,
        step: 0.1,
      },
    },
    intensity: {
      type: "number",
      default: 2,
      parser: (input) => parseFloat(input),
      options: {
        min: 0.5,
        max: 10,
        step: 0.1,
      },
    },
  },
};

const boxElement: SkinElement = {
  name: "Box",
  height: 30,
  width: 100,
  render(ctx, values) {
    ctx.fillStyle = values.color;
    ctx.fillRect(0, 0, 100, 100);
  },
  properties: {
    color: {
      type: "color",
      default: "#00ff00",
      parser: (input) => input,
    },
  },
};

function createDefaultValues(element: SkinElement): Record<string, any> {
  return Object.entries(element.properties).reduce((acc, [key, prop]) => {
    acc[key] = prop.default;
    return acc;
  }, {} as Record<string, any>);
}

function createFeature(
  feature: string,
  element: SkinElement,
  oldValues?: Record<string, any>
): SkinElementFeature {
  const newValues: Record<string, any> = {};

  for (const [key, prop] of Object.entries(element.properties)) {
    if (
      oldValues &&
      key in oldValues &&
      typeof oldValues[key] === typeof prop.default
    ) {
      newValues[key] = oldValues[key];
    } else {
      newValues[key] = prop.default;
    }
  }

  return {
    element,
    values: newValues,
    feature,
  };
}

export default function SkinEditor() {
  const elements: SkinElement[] = [circleElement, coolElement, boxElement];

  const initialFeatures = {
    Note: createFeature("Note", coolElement),
    Explosion: createFeature("Explosion", circleElement),
    Circle: createFeature("Circle", circleElement),
    Square: createFeature("Square", boxElement),
    Triangle: createFeature("Triangle", circleElement),
  };

  const [features, setFeatures] = useState<Record<string, SkinElementFeature>>(
    initialFeatures
  );

  const [storedValues, setStoredValues] = useState<
    Record<string, Record<string, Record<string, any>>>
  >(() => {
    const initial: Record<string, Record<string, Record<string, any>>> = {};
    for (const [feature, data] of Object.entries(initialFeatures)) {
      initial[feature] = {
        [data.element.name]: data.values,
      };
    }
    return initial;
  });

  const [selectedFeature, setSelectedFeature] = useState<string>("Note");

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel
          defaultSize={30}
          minSize={20}
          maxSize={50}
          className="bg-background p-4 space-y-4"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Element Selection</CardTitle>
              <CardDescription>
                Choose the skin element to customize
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedFeature}
                onValueChange={(value) => setSelectedFeature(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select element" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(features).map((feature) => (
                    <SelectItem key={feature} value={feature}>
                      {feature}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Feature Properties</CardTitle>
              <CardDescription>
                Customize the properties of the selected feature
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={features[selectedFeature].element.name}
                onValueChange={(value) => {
                  const newElement = elements.find((el) => el.name === value);
                  if (!newElement) return;

                  setStoredValues((prev) => {
                    const prevElement = features[selectedFeature].element;
                    const prevValues = features[selectedFeature].values;

                    return {
                      ...prev,
                      [selectedFeature]: {
                        ...prev[selectedFeature],
                        [prevElement.name]: prevValues,
                      },
                    };
                  });

                  setFeatures((prev) => {
                    const existingStored =
                      storedValues[selectedFeature]?.[value];
                    const prevValues = prev[selectedFeature].values;

                    return {
                      ...prev,
                      [selectedFeature]: createFeature(
                        selectedFeature,
                        newElement,
                        existingStored || prevValues
                      ),
                    };
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select element" />
                </SelectTrigger>
                <SelectContent>
                  {elements.map((element) => (
                    <SelectItem key={element.name} value={element.name}>
                      {element.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <EditorSidebar
            features={[]}
            feature={features[selectedFeature]}
            updateValues={(values) => {
              setFeatures((prev) => {
                const updatedFeature = {
                  ...prev[selectedFeature],
                  values: {
                    ...prev[selectedFeature].values,
                    ...values,
                  },
                };

                setStoredValues((stored) => ({
                  ...stored,
                  [selectedFeature]: {
                    ...(stored[selectedFeature] || {}),
                    [updatedFeature.element.name]: updatedFeature.values,
                  },
                }));

                return {
                  ...prev,
                  [selectedFeature]: updatedFeature,
                };
              });
            }}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          <PreviewPanel feature={selectedFeature} features={features} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
