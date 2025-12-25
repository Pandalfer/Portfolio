import { motion } from "framer-motion";
import { useEffect } from "react";
import YearInfo from "@/components/ModalComponents/YearInfo";

export default function JourneyModal({
                                       setModal,
                                     }: {
  setModal: (modal: null) => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setModal]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setModal(null)}
      />

      {/* Modal Container */}
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-[#0F1123] border border-[#2B2E50] p-5 md:p-8 rounded-2xl shadow-2xl w-full max-w-5xl z-50 flex flex-col max-h-[90vh]"
      >
        {/* Close Button - Larger touch target for mobile */}
        <button
          onClick={() => setModal(null)}
          className="absolute z-50 cursor-pointer top-3 right-3 text-3xl text-gray-400 hover:text-white transition p-2"
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-cyan-400 drop-shadow-[0_0_8px_#0ff] mb-6">
          Journey
        </h2>

        {/* Content Area: Scrollable on mobile if content is long */}
        <div className="flex flex-col md:flex-row gap-8 overflow-y-auto pr-2 custom-scrollbar">

          {/* Text Section */}
          <div className="flex flex-1 flex-col gap-6 md:gap-8">
            <YearInfo
              src={"https://cdn.simpleicons.org/planetScale/00C2CB"}
              alt={"Planet Icon"}
              year={2020}
              content={
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  Started programming in Scratch and made{" "}
                  <a className="underline hover:text-cyan-400" href="https://scratch.mit.edu/users/Pandaluf/">
                    basic games
                  </a>
                </p>
              }
            />
            <YearInfo
              src={"https://cdn.simpleicons.org/starDock/00C2CB"}
              alt={"Stardock Icon"}
              year={2021}
              content={
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  Started learning Python and made some basic text games.
                </p>
              }
            />
            <YearInfo
              src={"https://cdn.simpleicons.org/poleStar/00C2CB"}
              alt={"PoleStar Icon"}
              year={2024}
              content={
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  Made my first programs using HTML, CSS and JS as well as games in Unity.{" "}
                  <a className="underline hover:text-cyan-400" href="https://github.com/Pandalfer">
                    GitHub Link
                  </a>
                </p>
              }
            />
            <YearInfo
              src={"https://cdn.simpleicons.org/thePlanetarySociety/00C2CB"}
              alt={"The Planetary Society Icon"}
              year={2025}
              content={
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  Learned React, TypeScript and Tailwind CSS and built a{" "}
                  <a className="underline hover:text-cyan-400" href="https://textana.vercel.app">
                    screenshot to text tool.
                  </a>
                </p>
              }
            />
          </div>

          {/* Image Section - Visible on Tablet/Desktop, Hidden or simplified on Mobile */}
          <div className="hidden md:flex flex-col items-center justify-start flex-[0.2] sticky top-0 h-fit pt-10">
            <div className="w-1.5 h-32 bg-gradient-to-b from-[#006165] to-[#00C2CB] rounded-full opacity-50" />
            <img
              src="https://cdn.simpleicons.org/rocket/00C2CB"
              alt="Rocket"
              className="w-16 h-16 lg:w-20 lg:h-20 object-contain -mt-2"
              style={{ transform: "rotate(135deg)" }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}