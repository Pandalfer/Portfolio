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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm backdrop-brightness-75"
        onClick={() => setModal(null)}
      />

      <motion.div
        role={"dialog"}
        aria-modal={"true"}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-[#0F1123] border border-[#2B2E50] p-6 rounded-2xl shadow-2xl w-[50%] max-w-6xl z-50 flex flex-col md:flex-row gap-6"
      >
        {/* Text Section */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-center text-cyan-400 drop-shadow-[0_0_8px_#0ff] mb-4">
            Info
          </h2>

          <p className="text-gray-300 mb-4 text-lg leading-relaxed">
            <br />
            👋 Hello, my name is <strong>Shashish Panda</strong> and I am a 14
            year old programmer for fun
            <br />
            💼 My current position is as a Junior Sensei at{" "}
            <a
              className={"underline hover:text-cyan-400"}
              href={"https://codeninjas.com"}
            >
              Code Ninjas
            </a>
            <br />
            📍 I live in Hertfordshire, United Kingdom
            <br />
            🎓 I am currently learning how to use <strong>
              Next.js
            </strong> and <strong>Tailwind CSS</strong> to build websites
            <br />
            🏓 My hobbies include gaming, tennis and programming
            <br />
            🛠️ I am currently working on a <strong>
              Universal Converter
            </strong>{" "}
            which will convert many things like files, currency etc
          </p>
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
