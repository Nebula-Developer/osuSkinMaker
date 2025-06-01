import { useRef, useEffect } from "react";
import { cn } from "../lib/utils";


export function PanScrollArea({
  children, className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scrollStart = useRef({ left: 0, top: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      start.current = { x: e.clientX, y: e.clientY };
      scrollStart.current = {
        left: container.scrollLeft,
        top: container.scrollTop,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;

      container.scrollLeft = scrollStart.current.left - dx;
      container.scrollTop = scrollStart.current.top - dy;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      isDragging.current = true;
      start.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      scrollStart.current = {
        left: container.scrollLeft,
        top: container.scrollTop,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;

      const dx = e.touches[0].clientX - start.current.x;
      const dy = e.touches[0].clientY - start.current.y;

      container.scrollLeft = scrollStart.current.left - dx;
      container.scrollTop = scrollStart.current.top - dy;
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none",
        className
      )}
      style={{ touchAction: "none" }}
    >
      {children}
    </div>
  );
}
