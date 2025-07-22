import { motion } from "framer-motion";
import TechnologyPill from "@/components/ModalComponents/TechnologyPill";
import { useEffect } from "react";
import Image from "next/image";

export default function TextanaModal({
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
        role={"dialog"}
        aria-modal={"true"}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-[#0F1123] border border-[#2B2E50] p-6 rounded-2xl shadow-2xl w-[90%] max-w-6xl z-50 flex flex-col md:flex-row gap-6"
      >
        {/* Text Section */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-center text-cyan-400 drop-shadow-[0_0_8px_#0ff] mb-4">
            Textana 🚀
          </h2>

          <p className="text-gray-300 mb-4 leading-relaxed">
            Textana is a screenshot-to-text tool built for those who often need
            to extract text from images.
          </p>

          <p className="text-gray-300 mb-2 font-semibold">✨ Features:</p>
          <ul className="list-disc list-inside text-gray-400 mb-4 pl-2">
            <li>Live OCR backend deployed on Render</li>
            <li>Copy to clipboard and download options</li>
            <li>Responsive design</li>
          </ul>

          <p className="text-gray-300 mb-4 leading-relaxed">
            <strong>Why?</strong> I needed a better tool for extracting text
            from screenshots. Existing tools felt slow, cluttered, or
            inconsistent.
          </p>

          <p className="text-gray-300 mb-4 leading-relaxed">
            This project helped me solidify my understanding of React and
            Tailwind fundamentals.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <TechnologyPill technology={"React"} />
            <TechnologyPill technology={"Typescript"} />
            <TechnologyPill technology={"Tailwind"} />
            <TechnologyPill technology={"Python"} />
            <TechnologyPill technology={"Tesseract"} />
          </div>

          <a
            href="https://textana.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="w-full duration-300 cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-2xl font-semibold shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-colors">
              🪐 Visit Textana
            </button>
          </a>
        </div>

        {/* Image Section */}
        <div className="flex-1 hidden md:flex items-center justify-center relative">
          <div className="rounded-xl overflow-hidden shadow-lg border border-cyan-600 w-full aspect-[16/10] bg-black">
            <Image
              src="/TextanaScreenshot.webp"
              alt="Screenshot of Textana"
              width={800}
              height={500}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

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
