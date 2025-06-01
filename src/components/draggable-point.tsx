import type { Point } from "@/lib/types";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export type DraggablePointInputProps = {
  value: Point;
  min: Point;
  max: Point;
  step?: number | Point;
  onChange: (value: Point) => void;
};

export function DraggablePointInput({
  value,
  min,
  max,
  step = 0.01,
  onChange,
}: DraggablePointInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const range = {
    x: max.x - min.x,
    y: max.y - min.y,
  };

  const BOX_HEIGHT = 300;
  const BOX_WIDTH = BOX_HEIGHT * (range.x / range.y);

  const normalizedPosition = {
    x: ((value.x - min.x) / range.x) * BOX_WIDTH,
    y: ((value.y - min.y) / range.y) * BOX_HEIGHT,
  };

  const applyStepAndClamp = (input: Point): Point => {
    const stepped = { ...input };

    if (typeof step === "number") {
      stepped.x = Math.round(stepped.x / step) * step;
      stepped.y = Math.round(stepped.y / step) * step;
    } else {
      stepped.x = Math.round(stepped.x / step.x) * step.x;
      stepped.y = Math.round(stepped.y / step.y) * step.y;
    }

    return {
      x: Math.min(max.x, Math.max(min.x, stepped.x)),
      y: Math.min(max.y, Math.max(min.y, stepped.y)),
    };
  };

  const updateValueFromMouse = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const offsetX = Math.max(
      0,
      Math.min(clientX - rect.left, container.clientWidth)
    );
    const offsetY = Math.max(
      0,
      Math.min(clientY - rect.top, container.clientHeight)
    );

    const newPoint: Point = {
      x: (offsetX / container.clientWidth) * range.x + min.x,
      y: (offsetY / container.clientHeight) * range.y + min.y,
    };

    onChange(applyStepAndClamp(newPoint));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateValueFromMouse(e.clientX, e.clientY);
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    updateValueFromMouse(clientX, clientY);
  };

  useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      updateValueFromMouse(clientX, clientY);
    };

    const up = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
      window.addEventListener("touchmove", move);
      window.addEventListener("touchend", up);
    }

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [isDragging]);

  return (
    <div>
      {/* Interactive Drag Box */}
      <div
        ref={containerRef}
        style={{
          width: `calc(min(${BOX_WIDTH}px, 100%))`,
          aspectRatio: `${BOX_WIDTH} / ${BOX_HEIGHT}`,
          touchAction: "none",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handlePointerDown}
        className={cn(
          "relative bg-accent border rounded-md select-none mb-3",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        <div
          style={{
            left: `${(normalizedPosition.x / BOX_WIDTH) * 100}%`,
            top: `${(normalizedPosition.y / BOX_HEIGHT) * 100}%`,
          }}
          className={cn(
            "absolute w-5 h-5 rounded-full -translate-x-1/2 -translate-y-1/2",
            isDragging ? "bg-destructive" : "bg-primary"
          )}
        />
      </div>

      {/* Sliders */}
      
    </div>
  );
}
