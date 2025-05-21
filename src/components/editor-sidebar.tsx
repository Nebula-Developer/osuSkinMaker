import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ColorPicker } from "@/components/color-picker"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SkinElementPropertyValues, SkinElementPropertyType, SkinElementFeature } from "@/lib/types"

interface EditorSidebarProps {
  feature: SkinElementFeature,
  features: string[],
  updateValues: (values: SkinElementPropertyValues) => void,
}

export function EditorSidebar({
  feature,
  // setFeature,
  // features,
  updateValues,
}: EditorSidebarProps) {
  const { element: selectedElement, values: currentValues } = feature

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Element Settings</CardTitle>
            <CardDescription>Customize properties of the selected element</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(selectedElement.properties).map(([key, prop]) => {
              const value = currentValues[key]

              switch (prop.type as SkinElementPropertyType) {
                case "color":
                  return (
                    <div key={key} className="space-y-2">
                      <Label>{key}</Label>
                      <ColorPicker
                        color={value}
                        onChange={(color) => updateValues({ ...currentValues, [key]: color })}
                      />
                    </div>
                  )

                case "boolean":
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <Label>{key}</Label>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => updateValues({ ...currentValues, [key]: checked })}
                      />
                    </div>
                  )

                case "number":
                  return (
                    <div key={key} className="space-y-2">
                      <Label>{key}: {value}</Label>
                      <Slider
                        min={prop.options?.min ?? 0}
                        max={prop.options?.max ?? 100}
                        step={prop.options?.step ?? 1}
                        value={[value]}
                        onValueChange={(val) => updateValues({ ...currentValues, [key]: val[0] })}
                      />
                    </div>
                  )

                case "string":
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{key}</Label>
                      <input
                        id={key}
                        type="text"
                        className="w-full border rounded p-2"
                        value={value}
                        onChange={(e) => updateValues({ ...currentValues, [key]: e.target.value })}
                      />
                    </div>
                  )

                default:
                  return null
              }
            })}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
