import type { Point } from "@/lib/types";
import { useRef, useState, useEffect } from "react";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";

export type DraggablePointInputProps = {
  value: Point;
  min: Point;
  max: Point;
  onChange: (value: Point) => void;
};

export function DraggablePointInput({
  value,
  max,
  min,
  onChange,
}: DraggablePointInputProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const aspectRatio = max.x / max.y;

  const rangeX = max.x - min.x;
  const rangeY = max.y - min.y;

  const BOX_HEIGHT = 150;
  const BOX_WIDTH = BOX_HEIGHT * (rangeX / rangeY);

  const posX = ((value.x - min.x) / rangeX) * BOX_WIDTH;
  const posY = ((value.y - min.y) / rangeY) * BOX_HEIGHT;

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onMouseUp = (_: MouseEvent) => {
    setDragging(false);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging || !boxRef.current) return;

    const rect = boxRef.current.getBoundingClientRect();

    let newX = e.clientX - rect.left;
    let newY = e.clientY - rect.top;

    newX = Math.max(0, Math.min(newX, BOX_WIDTH));
    newY = Math.max(0, Math.min(newY, BOX_HEIGHT));

    const newValue = {
      x: (newX / BOX_WIDTH) * rangeX + min.x,
      y: (newY / BOX_HEIGHT) * rangeY + min.y,
    };
    onChange(newValue);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("mousemove", onMouseMove);
    } else {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    }
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [dragging]);

  return (
    <div>
      {/* Draggable box */}
      <div
        ref={boxRef}
        style={{
          position: "relative",
          width: BOX_WIDTH,
          height: BOX_HEIGHT,
          background: "#eee",
          border: "1px solid #ccc",
          borderRadius: 4,
          userSelect: "none",
          marginBottom: 12,
        }}
      >
        <div
          onMouseDown={onMouseDown}
          style={{
            position: "absolute",
            width: 20,
            height: 20,
            background: "#007bff",
            borderRadius: "50%",
            cursor: "grab",
            left: posX - 10,
            top: posY - 10,
            touchAction: "none",
          }}
        />
      </div>

      {/* Sliders */}
      <div className="space-y-2">
        <label className="block">
          X: {value.x.toFixed(2)}
          <Slider
            min={min.x}
            max={max.x}
            step={0.01}
            value={[value.x]}
            onValueChange={([x]) => onChange({ x, y: value.y })}
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
            onValueChange={([y]) => onChange({ x: value.x, y })}
            className="w-full"
          />
        </label>
      </div>

      {/* Number inputs */}
      <div className="flex space-x-2 mt-2">
        <Input
          type="number"
          className="w-20 border rounded px-2 py-1"
          value={value.x}
          min={min.x}
          max={max.x}
          step={0.01}
          onChange={(e) => onChange({ x: Number(e.target.value), y: value.y })}
        />
        <Input
          type="number"
          className="w-20 border rounded px-2 py-1"
          value={value.y}
          min={min.y}
          max={max.y}
          step={0.01}
          onChange={(e) => onChange({ x: value.x, y: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
