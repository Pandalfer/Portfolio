"use client";

import React, { useEffect, useRef, useState } from "react";

type NeutronStarProps = {
  size?: number;
  radius?: number;
  spinSeconds?: number;
  axisTiltDeg?: number;
  viewTiltDeg?: number;
  obliquityDeg?: number;
  wobbleSeconds?: number;
};

type Spot = { x: number; y: number; z: number; size: number; bright: boolean };

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function NeutronStar({
                                      size = 520,
                                      radius = 42,
                                      spinSeconds = 7,
                                      axisTiltDeg = 25,
                                      viewTiltDeg = 18,
                                      obliquityDeg = 9,
                                      wobbleSeconds = 12,
                                    }: NeutronStarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const AXIS = (axisTiltDeg * Math.PI) / 180;
    const VIEW = (viewTiltDeg * Math.PI) / 180;
    const OBL = (obliquityDeg * Math.PI) / 180;
    const TAU = Math.PI * 2;
    const jetLength = size / 2;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const rand = mulberry32(7);
    const SPOT_COUNT = 240;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const spots: Spot[] = Array.from({ length: SPOT_COUNT }, (_, i) => {
      const y = 1 - (i / (SPOT_COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = i * golden;
      return {
        x: Math.cos(theta) * r,
        y,
        z: Math.sin(theta) * r,
        size: 1.5 + rand() * 4.5,
        bright: rand() > 0.45,
      };
    });
    let R = radius;
    const project = (x: number, y: number, z: number, phi: number) => {
      const x1 = x * Math.cos(phi) + z * Math.sin(phi);
      const z1 = -x * Math.sin(phi) + z * Math.cos(phi);
      const y2 = y * Math.cos(VIEW) - z1 * Math.sin(VIEW);
      const z2 = y * Math.sin(VIEW) + z1 * Math.cos(VIEW);
      const sx = x1 * Math.cos(AXIS) - y2 * Math.sin(AXIS);
      const sy = x1 * Math.sin(AXIS) + y2 * Math.cos(AXIS);
      return { x: cx + sx * R, y: cy - sy * R, z: z2 };
    };

    const drawJet = (vx: number, vy: number, vz: number, flicker: number) => {
      const y2 = vy * Math.cos(VIEW) - vz * Math.sin(VIEW);
      const sx = vx * Math.cos(AXIS) - y2 * Math.sin(AXIS);
      const sy = vx * Math.sin(AXIS) + y2 * Math.cos(AXIS);
      const angle = Math.atan2(sx, sy);
      const len = jetLength * (0.8 + 0.2 * Math.hypot(sx, sy));

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const layers = [
        { w0: 7, w1: 30, a: 0.16, c: "120,170,255" },
        { w0: 3, w1: 10, a: 0.4, c: "150,200,255" },
        { w0: 1, w1: 2.4, a: 0.95, c: "225,240,255" },
      ];

      for (const l of layers) {
        const end = -len;
        const g = ctx.createLinearGradient(0, 0, 0, end);
        g.addColorStop(0, `rgba(${l.c},${l.a * flicker})`);
        g.addColorStop(0.45, `rgba(${l.c},${l.a * 0.35 * flicker})`);
        g.addColorStop(1, `rgba(${l.c},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(-l.w0, 0);
        ctx.lineTo(l.w0, 0);
        ctx.lineTo(l.w1, end);
        ctx.lineTo(-l.w1, end);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };

    const drawGrid = (phi: number) => {
      ctx.lineWidth = 0.6;

      for (let lon = 0; lon < 8; lon++) {
        const lonRad = (lon / 8) * TAU;
        let prev: ReturnType<typeof project> | null = null;
        for (let lat = -90; lat <= 90; lat += 10) {
          const la = (lat * Math.PI) / 180;
          const p = project(
            Math.cos(la) * Math.sin(lonRad),
            Math.sin(la),
            Math.cos(la) * Math.cos(lonRad),
            phi
          );
          if (prev && p.z > 0 && prev.z > 0) {
            ctx.strokeStyle = `rgba(80,130,240,${0.28 * Math.min(p.z, prev.z)})`;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
          prev = p;
        }
      }

      for (const lat of [-60, -30, 0, 30, 60]) {
        const la = (lat * Math.PI) / 180;
        let prev: ReturnType<typeof project> | null = null;
        for (let lon = 0; lon <= 360; lon += 10) {
          const lonRad = (lon * Math.PI) / 180;
          const p = project(
            Math.cos(la) * Math.sin(lonRad),
            Math.sin(la),
            Math.cos(la) * Math.cos(lonRad),
            phi
          );
          if (prev && p.z > 0 && prev.z > 0) {
            ctx.strokeStyle = `rgba(80,130,240,${0.22 * Math.min(p.z, prev.z)})`;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
          prev = p;
        }
      }
    };

    let raf = 0;
    const start = performance.now();

    const render = (now: number) => {
      const t = (now - start) / 1000;
      const phi = reduced ? 0.6 : (t / spinSeconds) * TAU;
      const psi = reduced ? 0.8 : (t / wobbleSeconds) * TAU;
      const pulse = reduced ? 1 : 1 + 0.02 * Math.sin(t * 2.8);
      R = radius * pulse;

      ctx.clearRect(0, 0, size, size);
      ctx.globalCompositeOperation = "lighter";

      const halo = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 4.5);
      halo.addColorStop(0, "rgba(170,205,255,0.5)");
      halo.addColorStop(0.25, "rgba(90,150,255,0.2)");
      halo.addColorStop(1, "rgba(60,110,255,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 4.5, 0, TAU);
      ctx.fill();

      const mx = Math.sin(OBL) * Math.cos(psi);
      const my = Math.cos(OBL);
      const mz = Math.sin(OBL) * Math.sin(psi);

      const flicker = reduced ? 1 : 0.85 + 0.15 * Math.sin(t * 7.3);
      drawJet(mx, my, mz, flicker);
      drawJet(-mx, -my, -mz, reduced ? 1 : 0.85 + 0.15 * Math.sin(t * 6.1 + 1.7));

      ctx.globalCompositeOperation = "source-over";

      const body = ctx.createRadialGradient(
        cx - R * 0.25,
        cy - R * 0.25,
        0,
        cx,
        cy,
        R
      );
      body.addColorStop(0, "#ffffff");
      body.addColorStop(0.55, "#e4f0ff");
      body.addColorStop(1, "#8dbaff");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.clip();

      drawGrid(phi);

      for (const s of spots) {
        const p = project(s.x, s.y, s.z, phi);
        if (p.z <= 0) continue;
        const r = s.size * (0.35 + 0.65 * p.z);
        ctx.fillStyle = s.bright
          ? `rgba(255,255,255,${0.35 + 0.5 * p.z})`
          : `rgba(70,120,235,${0.12 + 0.28 * p.z})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, TAU);
        ctx.fill();
      }

      const limb = ctx.createRadialGradient(cx, cy, R * 0.45, cx, cy, R);
      limb.addColorStop(0, "rgba(50,100,230,0)");
      limb.addColorStop(1, "rgba(50,100,230,0.55)");
      ctx.fillStyle = limb;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.restore();

      ctx.globalCompositeOperation = "lighter";
      const bloom = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.7);
      bloom.addColorStop(0, "rgba(255,255,255,0.35)");
      bloom.addColorStop(1, "rgba(160,200,255,0)");
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.7, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      if (!reduced) raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [size, radius, spinSeconds, axisTiltDeg, viewTiltDeg, obliquityDeg, wobbleSeconds]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

type TechnologyProps = {
  src: string;
  alt: string;
};

type RingProps = {
  width: number;
  children?:
    | React.ReactElement<TechnologyProps>[]
    | React.ReactElement<TechnologyProps>;
  offset: number;
  speed?: number;
};

function Technology({ src, alt }: TechnologyProps) {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <div
      className="technology group relative flex items-center justify-center w-12 h-12 md:w-11 md:h-11 cursor-pointer"
      onClick={() => setIsSelected((prev) => !prev)}
    >
      <div
        className={`absolute inset-1 rounded-full blur-md transition-all duration-300 ${
          isSelected
            ? "bg-white/20 opacity-100 scale-125"
            : "bg-white/5 opacity-0 group-hover:opacity-100"
        }`}
      />

      <div
        className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ${
          isSelected
            ? "border-white/50 bg-white/10 scale-110 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            : "border-white/10 bg-black/50 group-hover:border-white/25 group-hover:bg-white/[0.06]"
        }`}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className={`w-6 h-6 md:w-7 md:h-7 aspect-square block select-none transition-all duration-300 ${
            isSelected
              ? "scale-110 brightness-150 grayscale-0"
              : "brightness-90 grayscale group-hover:grayscale-0 group-hover:brightness-125"
          }`}
        />
      </div>

      <span
        className={`absolute left-1/2 bottom-full mb-3 -translate-x-1/2 px-3 py-1.5 rounded-md border border-white/10 bg-[#111]/95 backdrop-blur-md text-white/90 text-[12px] whitespace-nowrap z-50 pointer-events-none transition-all duration-300 origin-bottom ${
          isSelected
            ? "scale-100 opacity-100"
            : "scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100"
        }`}
      >
        {alt}
      </span>
    </div>
  );
}

function Ring({ width, children, offset, speed = 10 }: RingProps) {
  const radius = width / 2;

  const childArray = React.Children.toArray(
    children
  ) as React.ReactElement<TechnologyProps>[];

  const count = childArray.length;

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (count === 0) return;

    let animationFrame = 0;
    let startTime: number | null = null;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const updatePositions = (time: number) => {
      if (startTime === null) {
        startTime = time;
      }

      const elapsed = time - startTime;

      const degreesPerMs = 360 / (speed * 1000);

      const rotation = prefersReducedMotion ? 0 : elapsed * degreesPerMs;

      itemRefs.current.forEach((element, index) => {
        if (!element) return;

        const baseAngle = (360 / count) * index;
        const angle = baseAngle + offset + rotation;
        const radians = (angle * Math.PI) / 180;

        const x = Math.cos(radians) * radius;
        const y = Math.sin(radians) * radius;

        element.style.transform = `
translate(-50%, -50%)
translate3d(${x}px, ${y}px, 0)
`;
      });

      if (!prefersReducedMotion) {
        animationFrame = requestAnimationFrame(updatePositions);
      }
    };

    animationFrame = requestAnimationFrame(updatePositions);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [count, offset, radius, speed]);

  if (count === 0) return null;

  return (
    <div
      className="absolute flex items-center justify-center pointer-events-none"
      style={{
        width: `${width}px`,
        height: `${width}px`,
      }}
    >
      <div className="absolute inset-0 rounded-full border border-white/[0.07]" />

      <div className="absolute inset-[5%] rounded-full border border-dashed border-white/[0.045]" />

      <div className="absolute inset-0 pointer-events-none">
        {childArray.map((child, index) => (
          <div
            key={index}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            className="absolute left-1/2 top-1/2 pointer-events-auto"
            style={{
              width: "48px",
              height: "48px",
              willChange: "transform",
              transform: "translate(-50%, -50%)",
            }}
          >
            {React.cloneElement(child)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Technologies() {
  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-0 overflow-visible">
      <div
        className="
          relative
          scale-[0.7]
          sm:scale-[0.8]
          md:scale-100
          flex
          items-center
          justify-center
          transition-transform
          duration-500
        "
      >
        <div
          className="absolute w-[420px] h-[420px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
          }}
        />

        <Ring width={400} offset={25} speed={18}>
          <Technology
            src="https://cdn.simpleicons.org/next.js/ffffff"
            alt="Next.js"
          />

          <Technology
            src="https://cdn.simpleicons.org/supabase/ffffff"
            alt="Supabase"
          />

          <Technology
            src="https://cdn.simpleicons.org/typescript/ffffff"
            alt="TypeScript"
          />

          <Technology
            src="https://cdn.simpleicons.org/tailwindcss/ffffff"
            alt="Tailwind CSS"
          />

          <Technology
            src="https://cdn.simpleicons.org/react/ffffff"
            alt="React"
          />
        </Ring>

        <Ring width={250} offset={0} speed={8}>
          <Technology
            src="https://cdn.simpleicons.org/unity/ffffff"
            alt="Unity"
          />

          <Technology
            src="https://cdn.simpleicons.org/prisma/ffffff"
            alt="Prisma ORM"
          />

          <Technology
            src="https://cdn.simpleicons.org/python/ffffff"
            alt="Python"
          />
        </Ring>

        <div className="absolute z-20 w-[520px] h-[520px] pointer-events-none">
          <svg
            viewBox="-260 -260 520 520"
            className="absolute inset-0 w-full h-full overflow-visible"
          >
            <defs>
              <filter
                id="magneticGlow"
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
              >
                <feGaussianBlur stdDeviation="2.5" />
              </filter>

              <filter
                id="magneticGlowStrong"
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
              >
                <feGaussianBlur stdDeviation="5" />
              </filter>


              <linearGradient
                id="fieldFade"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="50%" stopColor="white" stopOpacity="0.45" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>

            <ellipse
              cx="0"
              cy="0"
              rx="150"
              ry="46"
              fill="none"
              stroke="white"
              strokeOpacity="0.07"
              strokeWidth="1"
              transform="rotate(20)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="20 0 0"
                to="380 0 0"
                dur="16s"
                repeatCount="indefinite"
              />
            </ellipse>

            <ellipse
              cx="0"
              cy="0"
              rx="165"
              ry="50"
              fill="none"
              stroke="white"
              strokeOpacity="0.045"
              strokeWidth="1"
              transform="rotate(-25)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="-25 0 0"
                to="-385 0 0"
                dur="21s"
                repeatCount="indefinite"
              />
            </ellipse>
          </svg>
        </div>

        <div className="absolute z-30 w-[520px] h-[520px] pointer-events-none">
          <NeutronStar />
        </div>
      </div>
    </div>
  );
}
