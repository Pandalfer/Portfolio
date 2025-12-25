"use client";

import React, {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";
import { AnimatePresence } from "framer-motion";
import TextanaModal from "@/components/ModalComponents/Modals/TextanaModal";
import SpaceAttackModal from "@/components/ModalComponents/Modals/SpaceAttackModal";
import { ModalType } from "./modal.types";
import InfoModal from "@/components/ModalComponents/Modals/InfoModal";
import JourneyModal from "@/components/ModalComponents/Modals/JourneyModal";
import StudanovaModal from "@/components/ModalComponents/Modals/StudanovaModal";
export const ModalContext = createContext<{
  setModal: Dispatch<SetStateAction<ModalType>>;
}>({
  setModal: () => {},
});

export default function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <ModalContext.Provider value={{ setModal }}>
      <AnimatePresence mode="wait">
        {modal === "textana" && <TextanaModal setModal={setModal} />}
        {modal === "spaceAttack" && <SpaceAttackModal setModal={setModal} />}
        {modal === "info" && <InfoModal setModal={setModal} />}
        {modal === "journey" && <JourneyModal setModal={setModal} />}
        {modal === "studanova" && <StudanovaModal setModal={setModal} />}
        {/* Add more modals as needed */}
      </AnimatePresence>
      {children}
    </ModalContext.Provider>
  );
}
