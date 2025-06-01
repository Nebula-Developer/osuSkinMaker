import { drawElement } from "@/lib/elements";
import type { Element } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export function SkinCanvasView({
  element,
  scale,
}: {
  element: Element;
  scale: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function render() {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    canvas.width = element.size.width * scale;
    canvas.height = element.size.height * scale;
  
    drawElement(element, ctx, { width: canvas.width, height: canvas.height });
  }

  useEffect(() => {
    render();
  }, [canvasRef, element, scale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      render();
    });

    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        aspectRatio: `${element.size.width} / ${element.size.height}`,
      }}
      className="max-h-full max-w-full"
    />
  );
}
