import { motion } from "framer-motion";
import TechnologyPill from "@/components/ModalComponents/TechnologyPill";
import { useEffect } from "react";
import Image from "next/image";

export default function StudanovaModal({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm backdrop-brightness-75"
        onClick={() => setModal(null)}
      />

      {/* Modal Container */}
      <motion.div
        role={"dialog"}
        aria-modal={"true"}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-[#0F1123] border border-[#2B2E50] p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-6xl z-50 flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto md:overflow-hidden custom-scrollbar"
      >
        {/* Text Section */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-2xl md:text-3xl font-bold text-center md:text-center text-cyan-400 drop-shadow-[0_0_8px_#0ff] mb-4">
            Studanova
          </h2>

          <p className="text-gray-300 mb-4 leading-relaxed text-sm md:text-base">
            Studanova is a student productivity app to help people study better.
          </p>

          <p className="text-gray-300 mb-2 font-semibold">✨ Features:</p>
          <ul className="list-disc list-inside text-gray-400 mb-4 pl-2 text-sm md:text-base">
            <li>Folder and note organisation</li>
            <li>Custom hooks and functions</li>
            <li>Advanced concepts like Levenshtein distances</li>
          </ul>

          <p className="text-gray-300 mb-4 leading-relaxed text-sm md:text-base">
            <strong>Why?</strong> I often find it difficult to keep organised and have stuff in one central place, so Studanova solved that.
          </p>

          <p className="text-gray-300 mb-4 leading-relaxed text-sm md:text-base">
            This project helped me learn how to make APIs, custom hooks, and introduced me to advanced concepts such as 2D arrays.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <TechnologyPill technology={"Next JS"} />
            <TechnologyPill technology={"Typescript"} />
            <TechnologyPill technology={"Prisma"} />
            <TechnologyPill technology={"Supabase"} />
            <TechnologyPill technology={"Dnd Kit"} />
          </div>

          <a
            href="https://studanova.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-auto"
          >
            <button className="w-full duration-300 cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-3 rounded-2xl font-semibold shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-95">
              Visit Studanova
            </button>
          </a>
        </div>

        {/* Image Section - Hidden on mobile, Flex on desktop */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="rounded-xl overflow-hidden shadow-lg border border-cyan-900/50 w-full aspect-video bg-black/40">
            <Image
              src="/StudanovaScreenshot.png"
              alt="Screenshot of Studanova"
              width={800}
              height={500}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setModal(null)}
          className="absolute z-50 cursor-pointer top-3 right-3 text-3xl text-gray-400 hover:text-white transition p-2"
          aria-label="Close modal"
        >
          ×
        </button>
      </motion.div>
    </div>
  );
}