import React, { useEffect, useState, useRef } from "react";
import { RefObject } from "react";

export default function Line({
  startRef,
  endRef,
}: {
  startRef: RefObject<HTMLElement | null>;
  endRef: RefObject<HTMLElement | null>;
}) {
  const containerRef = useRef<SVGSVGElement>(null);
  const [line, setLine] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  useEffect(() => {
    function updateLine() {
      if (startRef.current && endRef.current && containerRef.current) {
        const startBox = startRef.current.getBoundingClientRect();
        const endBox = endRef.current.getBoundingClientRect();
        const containerBox = containerRef.current.getBoundingClientRect();

        setLine({
          x1: startBox.left + startBox.width / 2 - containerBox.left,
          y1: startBox.top + startBox.height / 2 - containerBox.top,
          x2: endBox.left + endBox.width / 2 - containerBox.left,
          y2: endBox.top + endBox.height / 2 - containerBox.top,
        });
      }
    }

    updateLine();
    window.addEventListener("resize", updateLine);
    window.addEventListener("scroll", updateLine);
    return () => {
      window.removeEventListener("resize", updateLine);
      window.removeEventListener("scroll", updateLine);
    };
  }, [startRef, endRef]);

  return (
    <svg
      ref={containerRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    >
      <line
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
}
