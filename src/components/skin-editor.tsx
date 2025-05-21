import { useEffect, useState } from "react";
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
import { ScrollArea } from "./ui/scroll-area";

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
  name: "Plasma Grid",
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

const fittedTextElement: SkinElement = {
  name: "Fitted Text",
  height: 100,
  width: 100,
  render(ctx, values) {
    const maxFontSize = 100;
    const minFontSize = 5;
    let fontSize = maxFontSize;
    let textWidth, textHeight;

    const estimateTextHeight = (fontSize: number) => fontSize * 1.2; // rough multiplier
    let font = values.font.length > 0 ? values.font : "Arial";

    while (fontSize > minFontSize) {
      ctx.font = `${fontSize}px ${font}`;
      textWidth = ctx.measureText(values.text).width;
      textHeight = estimateTextHeight(fontSize);

      if (textWidth <= this.width && textHeight <= this.height) {
        break;
      }

      fontSize -= 1;
    }

    ctx.font = `${fontSize}px ${font}`;
    ctx.fillStyle = values.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(values.text, this.width / 2, this.height / 2);
  },
  properties: {
    text: {
      type: "string",
      default: "Hello World",
      parser: (input) => input,
    },
    font: {
      type: "string",
      default: "Arial",
      parser: (input) => input,
    },
    color: {
      type: "color",
      default: "#000000",
      parser: (input) => input,
    },
  },
};

// function createDefaultValues(element: SkinElement): Record<string, any> {
//   return Object.entries(element.properties).reduce((acc, [key, prop]) => {
//     acc[key] = prop.default;
//     return acc;
//   }, {} as Record<string, any>);
// }

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

export function parseJSObjectLiteral(code: string): any {
  try {
    return new Function(`return (${code})`)();
  } catch (err) {
    console.error("Failed to parse JS object:", err);
    return null;
  }
}

export default function SkinEditor() {
  let elements: SkinElement[] = [
    circleElement,
    coolElement,
    boxElement,
    fittedTextElement,
  ];

  let stringParsedElement = `
  {
    name: "Cool Text Hello!",
    height: 100,
    width: 100,
    render(ctx, values) {
      ctx.fillStyle = values.color;
      ctx.font = \`\${values.fontSize}px \${values.font}\`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(values.text, 50 + values.x, 50 + values.y);
    },
    properties: {
      text: {
        type: "string",
        default: "Hello World",
        parser: (input) => input,
      },
      fontSize: {
        type: "number",
        default: 20,
        parser: (input) => parseInt(input),
        options: {
          min: 1,
          max: 200,
          step: 1,
        },
      },
      x: {
        type: "number",
        default: 0,
        parser: (input) => parseInt(input),
        options: {
          min: -100,
          max: 100,
          step: 1,
        },
      },
      y: {
        type: "number",
        default: 0,
        parser: (input) => parseInt(input),
        options: {
          min: -100,
          max: 100,
          step: 1,
        },
      },
      font: {
        type: "string",
        default: "Arial",
        parser: (input) => input,
      },
      color: {
        type: "color",
        default: "#000000",
        parser: (input) => input,
      },
    },
  }
  `;

  try {
    const parsedElement = parseJSObjectLiteral(stringParsedElement);
    elements.push(parsedElement);
  } catch (error) {
    console.error("Error parsing element:", error);
  }

  const initialFeatures = {
    Note: createFeature("Note", coolElement),
    Explosion: createFeature("Explosion", circleElement),
    Circle: createFeature("Circle", circleElement),
    Square: createFeature("Square", boxElement),
    Triangle: createFeature("Triangle", circleElement),
  };

  const [features, setFeatures] =
    useState<Record<string, SkinElementFeature>>(initialFeatures);

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

  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <ResizablePanelGroup direction={width < 800 ? "vertical" : "horizontal"} className="flex-1">
        <ResizablePanel
          defaultSize={30}
          minSize={20}
          maxSize={50}
          className="bg-background"
        >
          <ScrollArea scrollHideDelay={0} className="h-full">
            <div className="space-y-8 flex flex-col p-4 pl-2">
              <EditorOptionsHeader
                features={features}
                setFeatures={setFeatures}
                storedValues={storedValues}
                setStoredValues={setStoredValues}
                selectedFeature={selectedFeature}
                setSelectedFeature={setSelectedFeature}
                elements={elements}
              />
            </div>
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          <PreviewPanel feature={selectedFeature} features={features} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function EditorOptionsHeader({
  features,
  setFeatures,
  storedValues,
  setStoredValues,
  selectedFeature,
  setSelectedFeature,
  elements,
}: {
  features: Record<string, SkinElementFeature>;
  setFeatures: React.Dispatch<
    React.SetStateAction<Record<string, SkinElementFeature>>
  >;
  storedValues: Record<string, Record<string, Record<string, any>>>;
  setStoredValues: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, Record<string, any>>>>
  >;
  selectedFeature: string;
  setSelectedFeature: React.Dispatch<React.SetStateAction<string>>;
  elements: SkinElement[];
}) {
  return (
    <>
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
                const existingStored = storedValues[selectedFeature]?.[value];
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
    </>
  );
}
