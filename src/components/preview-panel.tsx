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
            <CardHeader className="pb-0">
              <CardTitle>Single Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[calc(100%-4rem)]">
              <div className="relative flex items-center justify-center">
                <SkinCanvasView feature={selectedElement} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="full" className="h-[calc(100%-3rem)]">
          <Card className="h-full">
            <ScrollArea className="overflow-y-auto">
              <CardHeader className="pb-6 sticky top-0 w-full bg-card flex justify-between">
                <CardTitle>Full Preview</CardTitle>

                <div className="gap-2 flex items-center">
                  <label
                    htmlFor="highlight-selected"
                    className="select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Highlight Selected
                  </label>

                  <Switch
                    id="highlight-selected"
                    checked={highlightSelected}
                    onCheckedChange={setHighlightSelected}
                  />
                </div>
              </CardHeader>

              <CardContent className="flex justify-center h-[calc(100%-4rem)]">
                <div className="flex flex-wrap gap-8">
                  {Object.entries(features).map(([key, i_feature]) => (
                    <div
                      key={key}
                      className="flex flex-col gap-3 justify-center items-center"
                    >
                      <div className="text-xl font-bold">
                        {i_feature.feature}
                      </div>

                      <SkinCanvasView
                        feature={i_feature}
                        focused={highlightSelected && key === feature}
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
}: {
  feature: SkinElementFeature;
  focused?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const element = feature.element;
  const scale = 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = element.width * scale;
    canvas.height = element.height * scale;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
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
    <canvas
      ref={canvasRef}
      className={cn(
        "border rounded-md p-4 transition-colors",
        focused && "bg-muted/50"
      )}
      style={{
        width: element.width * 4,
        height: element.height * 4,
      }}
    />
  );
}
