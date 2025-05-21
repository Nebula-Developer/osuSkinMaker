import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SkinElementFeature } from "@/lib/types";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { Switch } from "./ui/switch";
import { HiOutlineArrowsExpand } from "react-icons/hi";
import { LiaCompressArrowsAltSolid } from "react-icons/lia";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";

export function PreviewPanel({
  feature,
  features,
}: {
  feature: string;
  features: Record<string, SkinElementFeature>;
}) {
  const selectedElement = features[feature];
  const [highlightSelected, setHighlightSelected] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [scale, setScale] = useState(2);

  if (!feature)
    return <div className="h-full bg-muted/30 p-6">No element selected</div>;

  return (
    <div
      className={cn(
        "h-full bg-background p-6 relative",
        fullscreen && "fixed top-0 left-0 w-screen h-screen z-50"
      )}
    >
      <Tabs defaultValue="preview" className="h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Preview</h2>
          <div className="flex items-center gap-3">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="full">Full</TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setFullscreen((prev) => !prev)}
            >
              {fullscreen ? (
                <LiaCompressArrowsAltSolid className="h-4 w-4" />
              ) : (
                <HiOutlineArrowsExpand className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <TabsContent value="preview" className="h-[calc(100%-3rem)]">
          <Card className="h-full">
            <ScrollArea className="overflow-y-auto">
              <CardHeader className="pb-6 sticky top-0 w-full bg-card flex justify-between">
                <CardTitle>Single Preview</CardTitle>

                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="scale"
                    className="select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Scale
                  </Label>

                  <Slider
                    id="scale"
                    value={[scale]}
                    onValueChange={(value) => setScale(value[0])}
                    min={1}
                    max={4}
                    step={0.1}
                    className="w-[100px]"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[calc(100%-4rem)]">
                <div className="relative flex items-center justify-center">
                  <SkinCanvasView feature={selectedElement} scale={scale} />
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="full" className="h-[calc(100%-3rem)]">
          <Card className="h-full">
            <ScrollArea className="overflow-y-auto">
              <CardHeader className="pb-6 sticky top-0 w-full bg-card flex justify-between">
                <CardTitle>Full Preview</CardTitle>

                <div className="gap-2 flex items-center">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="highlight-selected"
                      className="select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Highlight Selected
                    </Label>

                    <Switch
                      id="highlight-selected"
                      checked={highlightSelected}
                      onCheckedChange={setHighlightSelected}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="scale"
                      className="select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Scale
                    </Label>

                    <Slider
                      id="scale"
                      value={[scale]}
                      onValueChange={(value) => setScale(value[0])}
                      min={1}
                      max={4}
                      step={0.1}
                      className="w-[100px]"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex justify-center h-[calc(100%-4rem)]">
                <div className="flex flex-wrap gap-8">
                  {Object.entries(features).map(([key, i_feature]) => (
                    <div
                      key={key}
                      className="flex flex-col gap-0.5 justify-center items-center"
                    >
                      <div className="text-sm font-light text-muted-foreground">
                        {i_feature.feature}
                      </div>

                      <SkinCanvasView
                        feature={i_feature}
                        focused={highlightSelected && key === feature}
                        scale={scale}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SkinCanvasView({
  feature,
  focused,
  scale,
}: {
  feature: SkinElementFeature;
  focused?: boolean;
  scale: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const element = feature.element;
  const renderScale = 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = element.width * renderScale;
    canvas.height = element.height * renderScale;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(renderScale, renderScale);
      element.render(ctx, feature.values);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [canvasRef, element, feature.values]);

  return (
    <div
      className={cn(
        "border rounded-md transition-colors",
        "p-4 w-full h-full",
        "flex items-center justify-center",
        focused && "bg-muted/50"
      )}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: element.width * scale,
          height: element.height * scale,
        }}
      />
    </div>
  );
}
