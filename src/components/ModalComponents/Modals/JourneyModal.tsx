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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm backdrop-brightness-75"
        onClick={() => setModal(null)}
      />

      {/* Modal Container */}
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-[#0F1123] border border-[#2B2E50] p-6 rounded-2xl shadow-2xl w-[90%] max-w-6xl z-50 flex flex-col gap-6"
      >
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-cyan-400 drop-shadow-[0_0_8px_#0ff] mb-2">
          Journey
        </h2>

        {/* Content: Text and Image */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Text Section */}
          <div className="flex flex-1 flex-col gap-5">
            <YearInfo
              src={"https://cdn.simpleicons.org/planetScale/00C2CB"}
              alt={"Planet Icon"}
              year={2020}
              content={
                <p className="text-gray-300 leading-relaxed">
                  Started programming in Scratch and made{" "}
                  <a
                    className="underline hover:text-cyan-400"
                    href="https://scratch.mit.edu/users/Pandaluf/"
                  >
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
                <p className="text-gray-300 leading-relaxed">
                  Started learning python and made some basic text games
                </p>
              }
            />
            <YearInfo
              src={"https://cdn.simpleicons.org/poleStar/00C2CB"}
              alt={"PoleStar Icon"}
              year={2024}
              content={
                <p className="text-gray-300 leading-relaxed">
                  Made my first programs using HTML CSS and JS as well as my{" "}
                  <a
                    className={"underline hover:text-cyan-400"}
                    href={"https://pandalfer.github.io/SpaceAttack/"}
                  >
                    black belt submission
                  </a>{" "}
                  for{" "}
                  <a
                    className={"underline hover:text-cyan-400"}
                    href={"https://codeninjas.com"}
                  >
                    Code Ninjas
                  </a>
                </p>
              }
            />
            <YearInfo
              src={"https://cdn.simpleicons.org/thePlanetarySociety/00C2CB"}
              alt={"The Planetary Society Icon"}
              year={2025}
              content={
                <p className="text-gray-300 leading-relaxed">
                  Learned React, typescript and tailwind css and made my a{" "}
                  <a
                    className={"underline hover:text-cyan-400"}
                    href={"https://textana.vercel.app"}
                  >
                    screenshot to text tool
                  </a>
                </p>
              }
            />
          </div>

          {/* Image Section */}
          <div className=" hidden md:flex flex-col items-center justify-center flex-[0.2]">
            {/* Trail (on top) */}
            <div className="w-2 h-40 bg-gradient-to-b from-[#006165] to-[#00C2CB] rounded-full" />

            {/* Rocket (on bottom), pull it up to connect with the trail */}
            <img
              src="https://cdn.simpleicons.org/rocket/00C2CB"
              alt="Rocket"
              className="w-24 h-24 object-contain -mt-2 ml-1"
              style={{ transform: "rotate(135deg)" }}
            />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setModal(null)}
          className="absolute cursor-pointer top-3 right-3 text-2xl text-gray-400 hover:text-white transition"
        >
          ×
        </button>
      </motion.div>
    </div>
  );
}
