import { useRef, useEffect } from "react";
import { cn } from "../lib/utils";

export function PanScrollArea({
  children,
  className,
  getScale = () => 1,
  setScale = () => {},
}: {
  children: React.ReactNode;
  className?: string;
  getScale?: () => number;
  setScale?: (scale: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scrollStart = useRef({ left: 0, top: 0 });

  const getScaleRef = useRef(getScale);

  // 🔄 Keep getScaleRef up-to-date
  useEffect(() => {
    getScaleRef.current = getScale;
  }, [getScale]);

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

    const handleScroll = (e: WheelEvent) => {
      if (isDragging.current) {
        e.preventDefault();
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        const container = containerRef.current;
        if (!container) return;

        e.preventDefault();

        const oldScale = getScaleRef.current();
        let newScale = oldScale + e.deltaY * -0.025;
        newScale = Math.max(0.1, Math.min(newScale, 1000));
        setScale(newScale);
      } else {
        container.scrollLeft += e.deltaX;
        container.scrollTop += e.deltaY;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("wheel", handleScroll, { passive: false });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("wheel", handleScroll);
    };
  }, [setScale]);

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

    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      container.scrollLeft += e.deltaX;
      container.scrollTop += e.deltaY;
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchcancel", handleTouchEnd);
    container.addEventListener("wheel", handleScroll, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
      container.removeEventListener("wheel", handleScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none",
        className,
        // isDragging ? "" : "scroll-smooth"
      )}
      // style={{ touchAction: "none" }}
    >
      {children}
    </div>
  );
}
