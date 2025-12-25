"use client";

import { useContext } from "react";
import Astronaut from "@/components/About/Astronaut";
import { ModalContext } from "@/components/ModalComponents/providers";
import ModalProvider from "@/components/ModalComponents/providers";

export default function AboutMe() {
  return (
    <ModalProvider>
      <ModalConsumer />
    </ModalProvider>
  );
}

function ModalConsumer() {
  const { setModal } = useContext(ModalContext);

  return (
    <div className="flex flex-col items-center justify-start gap-4 p-4">
      <Astronaut />
      <div className="flex flex-row gap-4 mt-5">
        <button
          onClick={() => setModal("info")} // replace "info" with your ModalType value
          className="mt-4 bg-[#0F1123] text-main-dark cursor-pointer px-10 py-3 rounded-full border-2"
        >
          Info
        </button>
        <div className={"w-6"}></div>
        <button
          onClick={() => setModal("journey")} // replace "journey" with your ModalType value
          className="mt-4 bg-[#0F1123] text-main-dark border-2 px-7 cursor-pointer py-3 rounded-full"
        >
          Journey
        </button>
      </div>
    </div>
  );
}
