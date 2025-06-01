import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/color-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "./ui/input";
import { HiRefresh } from "react-icons/hi";
import { Button } from "./ui/button";

import type {
  ElementComponentData,
  Point,
} from "@/lib/types";
import { useEffect, useState } from "react";
import { useThrottledCallback } from "use-debounce";
import { DraggablePointInput } from "./draggable-point";

interface EditorSidebarProps {
  component: ElementComponentData;
  updateValues: (values: Record<string, any>) => void;
}

export function ComponentEditor({
  component: data,
  updateValues,
}: EditorSidebarProps) {
  let realValues = data.properties;

  const [imageURL, setImageURL] = useState<string | null>(null);

  const [values, setValues] = useState<Record<string, any>>(realValues);
  const callThrottledUpdateValues = useThrottledCallback(
    (newValues: Record<string, any>) => {
      updateValues(newValues);
    },
    10
  );
  const throttledUpdateValues = (newValues: Record<string, any>) => {
    setValues(newValues);
    callThrottledUpdateValues(newValues);
  };

  useEffect(() => {
    setValues(realValues);
  }, [realValues]);

  return (
    <ScrollArea className="h-full">
      <div className="py-5 flex flex-col gap-5">
        {Object.entries(data.component.properties).map(([key, prop]) => {
          const { type, label, description, settings } = prop;
          const value = values[key];
          const defaultValue = settings.default;

          const resetButton =
            JSON.stringify(value) === JSON.stringify(defaultValue) ? null : (
              <Button
                type="button"
                variant="outline"
                className="float-right h-8"
                onClick={() =>
                  throttledUpdateValues({ ...values, [key]: defaultValue })
                }
              >
                <HiRefresh className="h-4 w-4" />
              </Button>
            );

          const labelElement = (children?: React.ReactNode) => (
            <div className="flex gap-2 flex-wrap items-center h-8">
              <Label>{label}</Label>
              {children}
              <div className="w-fit">{resetButton}</div>
            </div>
          );

          const input = () => {
            switch (type) {
              case "color":
                return (
                  <div key={key} className="space-y-2">
                    <ColorPicker
                      color={value}
                      onChange={(color) =>
                        throttledUpdateValues({ ...values, [key]: color })
                      }
                    />
                  </div>
                );

              case "boolean":
                return (
                  <div key={key} className="flex items-center justify-between">
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        throttledUpdateValues({ ...values, [key]: checked })
                      }
                    />
                  </div>
                );

              case "number":
                return (
                  <div key={key} className="space-y-2">
                    <Input
                      type="number"
                      className="w-20 border rounded p-1"
                      value={value}
                      onChange={(e) => {
                        let num = Number(e.target.value);
                        if (isNaN(num)) return;

                        num = Math.max(settings.min ?? 0, num);
                        num = Math.min(settings.max ?? 1, num);

                        throttledUpdateValues({ ...values, [key]: num });
                      }}
                    />

                    <Slider
                      min={settings.min ?? 0}
                      max={settings.max ?? 1}
                      step={settings.step ?? Number.EPSILON}
                      value={[value]}
                      onValueChange={(val) =>
                        throttledUpdateValues({ ...values, [key]: val[0] })
                      }
                    />
                  </div>
                );

              case "text":
                return (
                  <div key={key} className="space-y-2">
                    <Input
                      id={key}
                      type="text"
                      placeholder={settings.placeholder}
                      maxLength={settings.maxLength}
                      className="w-full border rounded p-2"
                      value={value}
                      onChange={(e) =>
                        throttledUpdateValues({
                          ...values,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </div>
                );

              case "select":
                return (
                  <div key={key} className="space-y-2">
                    <select
                      className="w-full border rounded p-2"
                      value={value}
                      onChange={(e) =>
                        throttledUpdateValues({
                          ...values,
                          [key]: e.target.value,
                        })
                      }
                    >
                      {settings.options.map((option: string) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                );

              case "image":
                return (
                  <div key={key} className="space-y-2">
                    <Input
                      type="file"
                      itemType="image/*"
                      onChange={(event) => {
                        const input = event.target as HTMLInputElement;
                        if (!input.files || input.files.length === 0) return;

                        const file = input.files[0];
                        if (!file.type.startsWith("image/")) {
                          console.error("Selected file is not an image");
                          return;
                        }

                        const img = new Image();
                        img.src = URL.createObjectURL(file);
                        img.onload = () => {
                          throttledUpdateValues({
                            ...values,
                            [key]: img,
                          });
                        };

                        img.onerror = () => {
                          console.error("Failed to load image");
                        };
                      }}
                    />

                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Image URL"
                        className="w-full border rounded p-2"
                        value={imageURL || ""}
                        onChange={(e) => setImageURL(e.target.value)}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (!imageURL) return;

                          const img = new Image();
                          img.src = imageURL;
                          img.onload = () => {
                            throttledUpdateValues({
                              ...values,
                              [key]: img,
                            });
                          };
                          img.onerror = () => {
                            console.error("Failed to load image from URL");
                          };
                        }}
                      >
                        Load
                      </Button>
                    </div>

                    {value instanceof HTMLImageElement && (
                      <div className="flex flex-col items-center">
                        <img
                          src={value.src}
                          alt="Preview"
                          className="max-w-full h-auto rounded border max-h-64"
                        />

                        <div className="text-sm text-muted-foreground mt-1">
                          {value.naturalWidth} x {value.naturalHeight} pixels
                        </div>

                        <Button
                          type="button"
                          variant="destructive"
                          className="mt-2 w-full"
                          onClick={() => {
                            throttledUpdateValues({
                              ...values,
                              [key]: null,
                            });
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    )}
                  </div>
                );

              case "point":
                let min = settings.min ?? { x: 0, y: 0 };
                let max = settings.max ?? { x: 1, y: 1 };
                function setValue(newValue: Point) {
                  throttledUpdateValues({
                    ...values,
                    [key]: clampPoint(newValue, min, max),
                  });
                }

                return (
                  <div key={key} className="space-y-2">
                    {settings.dragPane && (
                      <DraggablePointInput
                        value={value}
                        min={min}
                        max={max}
                        step={settings.step}
                        onChange={(newValue) =>
                          throttledUpdateValues({
                            ...values,
                            [key]: clampPoint(newValue, min, max),
                          })
                        }
                      />
                    )}

                    <div className="space-y-2 mb-4">
                      <label className="block">
                        X: {value.x.toFixed(2)}
                        <Slider
                          min={min.x}
                          max={max.x}
                          step={0.01}
                          value={[value.x]}
                          onValueChange={([x]) =>
                            setValue({
                              x,
                              y: value.y,
                            })
                          }
                          className="w-full"
                        />
                      </label>

                      <label className="block">
                        Y: {value.y.toFixed(2)}
                        <Slider
                          min={min.y}
                          max={max.y}
                          step={0.01}
                          value={[value.y]}
                          onValueChange={([y]) =>
                            setValue({
                              x: value.x,
                              y,
                            })
                          }
                          className="w-full"
                        />
                      </label>
                    </div>

                    {/* Inputs */}
                    <div className="flex space-x-2 mt-2">
                      <Input
                        type="number"
                        className="w-20 border rounded px-2 py-1"
                        value={value.x}
                        min={min.x}
                        max={max.x}
                        step={0.01}
                        onChange={(e) =>
                          setValue({
                            x: Number(e.target.value),
                            y: value.y,
                          })
                        }
                      />
                      <Input
                        type="number"
                        className="w-20 border rounded px-2 py-1"
                        value={value.y}
                        min={min.y}
                        max={max.y}
                        step={0.01}
                        onChange={(e) =>
                          setValue({
                            x: value.x,
                            y: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                );

              default:
                return (
                  <div key={key} className="text-destructive">
                    Unsupported property type: {type}
                  </div>
                );
            }
          };

          return (
            <Card key={key} className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {labelElement()}
                </CardTitle>
                {description && (
                  <CardDescription>{description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>{input()}</CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}

const clampPoint = (point: Point, min: Point, max: Point): Point => {
  return {
    x: Math.max(min.x, Math.min(point.x, max.x)),
    y: Math.max(min.y, Math.min(point.y, max.y)),
  };
};
