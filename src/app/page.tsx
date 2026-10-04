"use client";

import BlackHoleScroll from "@/components/BlackHoleScroll";
import SpaceObjects from "@/components/ObjectSpawn";
import Contact from "@/components/Contact";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import GraphicsGate from "@/components/GraphicsGate";
import { useEffect, useState } from "react";
import About from "@/components/About";
import Projects from "@/components/Projects";

/*
 * pending: haven't checked yet (shows plain black, no flash)
 * ask:     show the gate
 * full / low: visitor has chosen, the black hole starts
 */
type Gfx = "pending" | "ask" | "full" | "low";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [gfx, setGfx] = useState<Gfx>("pending");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    // Phones already get the reduced-effects path, so skip the prompt there.
    const isPhone = window.matchMedia("(max-width: 768px)").matches;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGfx(isPhone ? "full" : "ask");
  }, []);

  const handleEnter = (low: boolean) => {
    setGfx(low ? "low" : "full");
  };

  const entered = gfx === "full" || gfx === "low";

  return (
    <div
      className="page"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#000",
      }}
    >
      {/* GPU-heavy parts only start once the visitor has chosen */}
      {entered && (
        <>
          <BlackHoleScroll
            lowGraphics={gfx === "low"}
            blackHolePositionXPercent={isMobile ? 50 : 40}
            blackHoleTravel={20}
            blackHoleRotation={160}
            blackHoleSizeMultiplier={isMobile ? 0.8 : 1}
          />

          <SpaceObjects />
        </>
      )}

      {/* inert = unreachable by keyboard/screen reader while the gate is up */}
      <div inert={!entered}>
        <Contact bottomThreshold={50} />

        <Header />
        <About />
        <Projects />
        <div aria-hidden style={{ height: "120vh" }} />

        <Navbar />
      </div>

      {gfx !== "pending" && (
        <GraphicsGate open={gfx === "ask"} onEnter={handleEnter} />
      )}
    </div>
  );
}