"use client"

import { useState } from "react";

export default function Technology({
                                     src,
                                     alt,
                                     speed = 10,
                                   }: {
  src: string;
  alt: string;
  speed?: number;
}) {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <div
      className="group relative flex justify-center items-center w-12 h-12 md:w-10 md:h-10 cursor-pointer"
      onClick={() => setIsSelected(!isSelected)}
    >
      <img
        src={src}
        alt={alt}
        className={`w-10 h-12 md:w-10 md:h-10 aspect-square block align-middle select-none transition-transform duration-300 ${
          isSelected ? "scale-125 brightness-125" : ""
        }`}
        style={{
          animation: `spin-reverse-slow ${speed}s linear infinite`,
        }}
      />

      {/* Tooltip: Shows on Hover (Desktop) OR on Click (Mobile) */}
      <span
        style={{
          animation: `spin-reverse-slow ${speed}s linear infinite`,
        }}
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-1.5 rounded bg-gray-800 text-white text-[14px] md:text-xs whitespace-nowrap transition-all origin-bottom z-50 pointer-events-none shadow-[0_0_10px_rgba(6,182,212,0.3)] ${
          isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
        }`}
      >
        {alt}
      </span>
    </div>
  );
}