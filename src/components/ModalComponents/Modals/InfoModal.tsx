import { motion } from "framer-motion";
import { useEffect } from "react";

export default function InfoModal({
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm backdrop-brightness-75"
        onClick={() => setModal(null)}
      />

      <motion.div
        role={"dialog"}
        aria-modal={"true"}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-[#0F1123] border border-[#2B2E50] p-6 md:p-10 rounded-2xl shadow-2xl w-full max-w-lg md:max-w-2xl z-50 flex flex-col gap-4"
      >
        {/* Close Button - Larger tap target for mobile */}
        <button
          onClick={() => setModal(null)}
          className="absolute cursor-pointer top-4 right-4 text-3xl text-gray-400 hover:text-white transition p-2"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Text Section */}
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-cyan-400 drop-shadow-[0_0_8px_#0ff] mb-6">
            Info
          </h2>

          <div className="space-y-4 text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
            <p>
              👋 Hello, my name is <strong>Shashish</strong> and I am a 15
              year old programmer for fun.
            </p>
            <p>
              📍 I live in the United Kingdom.
            </p>
            <p>
              🎓 I am currently learning how to use <strong>Next.js</strong> and <strong>Tailwind CSS</strong> to build websites.
            </p>
            <p>
              🏓 My hobbies include gaming, tennis, and programming.
            </p>
            <p>
              🛠️ I am currently working on a <strong>Student Productivity App</strong> which will help me study more efficiently.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}