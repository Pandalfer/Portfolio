import React from "react";

type SpeedyChild = React.ReactElement<{ speed?: number }>;

export default function Ring({
                               width,
                               children,
                               offset,
                               speed = 10,
                             }: {
  width: number;
  children?: SpeedyChild[] | SpeedyChild;
  offset: number;
  speed?: number;
}) {
  const radius = width / 2;
  const childArray = React.Children.toArray(children) as SpeedyChild[];
  const count = childArray.length;

  return (
    <div
      className="absolute flex items-center justify-center pointer-events-none" // Prevents invisible boxes from blocking clicks
      style={{
        width: `${width}px`,
        height: `${width}px`,
      }}
    >
      <div
        className="relative w-full h-full overflow-visible pointer-events-auto"
        style={{
          animation: `spin-slow ${speed}s linear infinite`,
        }}
      >
        {childArray.map((child, index) => {
          const angle = (360 / count) * index;
          return (
            <div
              key={index}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `
                  rotate(${angle + offset}deg)
                  translateX(${radius}px)
                  rotate(-${angle + offset}deg)
                  translate(-50%, -50%)
                `,
              }}
            >
              {React.cloneElement(child, { speed })}
            </div>
          );
        })}
      </div>
    </div>
  );
}