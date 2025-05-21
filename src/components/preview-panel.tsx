import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SkinElementFeature } from "@/lib/types";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

export function PreviewPanel({
  feature,
  features,
}: {
  feature: string;
  features: Record<string, SkinElementFeature>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const selectedElement = features[feature];

  if (!feature)
    return <div className="h-full bg-muted/30 p-6">No element selected</div>;

  const element = selectedElement.element;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = element.width;
    canvas.height = element.height;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      element.render(ctx, selectedElement.values);
    };

    draw();

    // if (element.name === "Explosion") {
    //   let frame = 0;
    //   const animate = () => {
    //     frame++;
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     selectedElement.render(ctx, {
    //       ...settings,
    //       frame,
    //     });
    //     animationRef.current = requestAnimationFrame(animate);
    //   };
    //   animate();
    // }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [canvasRef, element, selectedElement.values]);

  return (
    <div className="h-full bg-background p-6">
      <Tabs defaultValue="preview" className="h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{element.name} Preview</h2>
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="full">Full</TabsTrigger>
          </TabsList>
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
              <CardHeader className="pb-4 sticky top-0">
                <CardTitle>Full Preview</CardTitle>
              </CardHeader>
              
              <CardContent className="flex justify-center h-[calc(100%-4rem)]">
                <div className="grid grid-cols-2 gap-8">
                  {Object.entries(features).map(([key, i_feature]) => (
                    <div key={key}>
                      <SkinCanvasView feature={i_feature} focused={key === feature} />
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

function SkinCanvasView({ feature, focused }: { feature: SkinElementFeature, focused?: boolean }) {
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
      className={
        cn(
          "border rounded-md p-4 rounded-md",
          focused ? "bg-muted/90" : "bg-muted/10"
        )
      }
      style={{
        width: element.width * 4,
        height: element.height * 4,
      }}
    />
  );
}
