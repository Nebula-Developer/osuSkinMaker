import { drawElement } from "@/lib/elements";
import type { Element } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/themeStore";
import { useEffect, useRef } from "react";

function colorOpacity(color: string, opacity: number): string {
  if (color.startsWith("oklch")) {
    return color.replace(")", ` / ${opacity})`);
  } else if (color.startsWith("rgb")) {
    return color.replace(")", `, ${opacity})`);
  } else if (color.startsWith("hsl")) {
    return color.replace(")", `, ${opacity})`);
  } else if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
}

export function SkinCanvasView({
  element,
  scale,
  fit = true,
  grid = 10,
  gridAccent = 3
}: {
  element: Element;
  scale: number;
  fit?: boolean;
  grid?: number;
  gridAccent?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useThemeStore((c) => c.theme);

  function render() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = element.size.width * Math.min(scale, 10);
    canvas.height = element.size.height * Math.min(scale, 10);

    drawElement(element, ctx, { width: canvas.width, height: canvas.height });

    if (grid) {
      const divisions = grid;
      const accentDivisor = gridAccent ?? 0;

      const spacingX = canvas.width / divisions;
      const spacingY = canvas.height / divisions;

      const centerX = divisions / 2;
      const centerY = divisions / 2;

      ctx.globalCompositeOperation = "difference";

      let accentColor = theme === "dark" ? "#44444490" : "#77777760";
      let normalColor = theme === "dark" ? "#44444463" : "#77777740";

      for (let i = 0; i <= divisions; i++) {
        ctx.beginPath();

        const isAccent = (i - centerX) % accentDivisor === 0;
        ctx.strokeStyle = isAccent ? accentColor : normalColor;
        ctx.lineWidth = isAccent ? 2 : 1;

        const x = i * spacingX;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let j = 0; j <= divisions; j++) {
        ctx.beginPath();

        const isAccent = (j - centerY) % accentDivisor === 0;
        ctx.strokeStyle = isAccent ? accentColor : normalColor;
        ctx.lineWidth = isAccent ? 2 : 1;

        const y = j * spacingY;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over";
    }
  }

  useEffect(() => {
    render();
  }, [canvasRef, element, scale, theme]);

  var widthOverHeight = element.size.width > element.size.height;

  return (
    <div
      className={cn(
        "border rounded-md shadow-md bg-card overflow-hidden",
        widthOverHeight ? "w-full" : fit ? "h-full" : "h-full w-full"
      )}
      style={{
        aspectRatio: `${element.size.width} / ${element.size.height}`,
        width: fit ? "" : element.size.width * scale + "px",
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
