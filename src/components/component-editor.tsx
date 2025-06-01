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

import type { ElementComponentData, Point, PropertyTypeSettings } from "@/lib/types";
import { useEffect, useState } from "react";
import { useThrottledCallback } from "use-debounce";
import { DraggablePointInput } from "./draggable-point";

interface EditorSidebarProps {
  component: ElementComponentData;
  updateValues: (values: Record<string, any>) => void;
}

export function EditorSidebar({
  component: data,
  updateValues,
}: EditorSidebarProps) {
  let realValues = data.properties;

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
      <div className="p-5 flex flex-col gap-5">
        {Object.entries(data.component.properties).map(([key, prop]) => {
          const { type, label, description, settings } = prop;
          const value = values[key];
          const defaultValue = settings.default;

          const resetButton =
            JSON.stringify(value) === JSON.stringify(defaultValue) ? null : (
              <Button
                type="button"
                variant="outline"
                className="float-right"
                onClick={() =>
                  throttledUpdateValues({ ...values, [key]: defaultValue })
                }
              >
                <HiRefresh className="h-4 w-4" />
              </Button>
            );

          const input = () => {
            switch (type) {
              case "color":
                return (
                  <div key={key} className="space-y-2">
                    <Label>
                      {label} {resetButton}
                    </Label>

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
                    <Label>
                      {label} {resetButton}
                    </Label>
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
                    <Label>
                      {label}:
                      <Input
                        type="number"
                        className="w-16 ml-2 border rounded p-1"
                        value={value}
                        onChange={(e) => {
                          let num = Number(e.target.value);
                          if (isNaN(num)) return;

                          num = Math.max(settings.min ?? 0, num);
                          num = Math.min(settings.max ?? 1, num);

                          throttledUpdateValues({ ...values, [key]: num });
                        }}
                      />
                      {resetButton}
                    </Label>
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
                    <Label htmlFor={key}>
                      {label} {resetButton}
                    </Label>
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
                    <Label>
                      {label} {resetButton}
                    </Label>
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
                    <Label>
                      {label} {resetButton}
                    </Label>
                    <Input
                      type="text"
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

              case "point":
                return (
                  <div key={key} className="space-y-2">
                    <Label>
                      {label} {resetButton}
                    </Label>
                    <DraggablePointInput
                      value={value}
                      min={settings.min}
                      max={settings.max}
                      onChange={(newValue) =>
                        throttledUpdateValues({
                          ...values,
                          [key]: clampPoint(
                            newValue,
                            settings.min,
                            settings.max
                          ),
                        })
                      }
                    />
                  </div>
                );

              default:
                return (
                  <div key={key} className="text-red-500">
                    Unsupported property type: {type}
                  </div>
                );
            }
          };

          return (
            <Card key={key} className="w-full">
              <CardHeader>
                <CardTitle>{label}</CardTitle>
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



