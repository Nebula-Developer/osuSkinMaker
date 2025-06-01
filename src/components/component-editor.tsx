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

import type { ElementComponentData, Point } from "@/lib/types";
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

  const [customSteps, setCustomSteps] = useState<Record<string, number>>({});

  function setCustomStep(key: string, step: number) {
    setCustomSteps((prev) => ({
      ...prev,
      [key]: step,
    }));
  }

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
                    <div className="flex gap-4 items-end">
                      <div className="flex flex-col">
                        <Label className="text-sm flex items-end">
                          Value
                          <span className="text-xs text-muted-foreground">
                            {settings.min ?? 0} - {settings.max ?? 1}
                          </span>
                        </Label>

                        <Input
                          type="number"
                          className="w-20 border rounded p-1"
                          value={value}
                          step={customSteps[key] ?? settings.step ?? 0.1}
                          onChange={(e) => {
                            let num = Number(e.target.value);
                            if (isNaN(num)) return;

                            num = Math.max(settings.min ?? 0, num);
                            num = Math.min(settings.max ?? 1, num);

                            if (!settings.customStep)
                              num =
                                Math.round(num / (settings.step ?? 1)) *
                                (settings.step ?? 1);

                            throttledUpdateValues({ ...values, [key]: num });
                          }}
                        />
                      </div>

                      {settings.customStep && (
                        <div className="flex flex-col">
                          <Label className="text-sm flex items-end">
                            Step
                            <span className="text-xs text-muted-foreground">
                              (default: {settings.step ?? 0})
                            </span>
                          </Label>
                          <Input
                            type="number"
                            className="w-20 border rounded p-1"
                            value={customSteps[key] ?? settings.step ?? 0}
                            step={settings.step ?? 0.1}
                            onChange={(e) => {
                              let step = Number(e.target.value);
                              if (isNaN(step) || step < 0) step = 0;
                              setCustomStep(key, step);
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <Slider
                      min={settings.min ?? 0}
                      max={settings.max ?? 1}
                      step={Math.max(
                        customSteps[key] ?? settings.step ?? 0,
                        Number.EPSILON
                      )}
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
                let step = Math.max(customSteps[key] ?? settings.step ?? 0.1, Number.EPSILON);

                function setValue(newValue: Point) {
                  throttledUpdateValues({
                    ...values,
                    [key]: clampPoint(newValue, min, max),
                  });
                }
                
                let stringStep = "0";
                if (settings.step)
                  stringStep = typeof settings.step === "number" ? settings.step.toFixed(2) : `${settings.step.x.toFixed(2)}, ${settings.step.y.toFixed(2)}`;

                return (
                  <div key={key} className="space-y-2">
                    {settings.dragPane && (
                      <DraggablePointInput
                        value={value}
                        min={min}
                        max={max}
                        step={step}
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
                          step={step}
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
                          step={step}
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
                      <div className="flex-col">
                        <Label className="flex items-start mb-1">
                          X
                          <span className="text-xs text-muted-foreground">
                            ({min.x} - {max.x})
                          </span>
                        </Label>

                        <Input
                          type="number"
                          className="w-20 border rounded px-2 py-1"
                          value={value.x}
                          min={min.x}
                          max={max.x}
                          step={step}
                          onChange={(e) => {
                            if (isNaN(Number(e.target.value))) return;
                            let num = Number(e.target.value);

                            if (!settings.customStep)
                              num = Math.round(num / step) * step;

                            setValue({
                              x: num,
                              y: value.y,
                            });
                          }}
                        />
                      </div>
                      <div className="flex-col">
                        <Label className="flex items-start mb-1">
                          Y
                          <span className="text-xs text-muted-foreground">
                            ({min.y} - {max.y})
                          </span>
                        </Label>
                        <Input
                          type="number"
                          className="w-20 border rounded px-2 py-1"
                          value={value.y}
                          min={min.y}
                          max={max.y}
                          step={step}
                          onChange={(e) => {
                            if (isNaN(Number(e.target.value))) return;
                            let num = Number(e.target.value);

                            if (!settings.customStep)
                              num = Math.round(num / step) * step;

                            setValue({
                              x: value.x,
                              y: num,
                            });
                          }}
                        />
                      </div>

                      {settings.customStep && (
                        <div className="flex-col">
                          <Label className="flex items-start mb-1">
                            Step
                            <span className="text-xs text-muted-foreground">
                              (default: {stringStep})
                            </span>
                          </Label>
                          <Input
                            type="number"
                            className="w-20 border rounded px-2 py-1"
                            value={customSteps[key] ?? step}
                            step={step}
                            onChange={(e) => {
                              let newStep = Number(e.target.value);
                              if (isNaN(newStep) || newStep < 0)
                                newStep = 0;
                              setCustomStep(key, newStep);
                            }}
                          />
                        </div>
                      )}
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
