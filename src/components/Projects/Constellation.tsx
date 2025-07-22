"use client";

import Star from "./Star";
import ModalProvider from "@/components/ModalComponents/providers";
import { useRef } from "react";
import Line from "@/components/Projects/Line";

export default function Constellation() {
  const starA = useRef<HTMLElement>(null);
  const starB = useRef<HTMLElement>(null);
  const starC = useRef<HTMLElement>(null);
  const starD = useRef<HTMLElement>(null);

  return (
    <div
      className={"relative flex items-center justify-center w-screen [500px]"}
    >
      <div className="relative w-[70%] aspect-[1/0.5]">
        <ModalProvider>
          <Star
            ref={starA}
            className="top-[10%] left-[15%]"
            text={"Textana"}
            modalType={"textana"}
          />
          <Star
            ref={starB}
            className="top-[30%] left-[35%]"
            text={"Space Attack"}
            modalType={"spaceAttack"}
          />
          <Star
            ref={starC}
            className="top-[20%] right-[20%]"
            text={"Scientifica"}
            modalType={"textana"}
          />
          <Star
            ref={starD}
            className="top-[60%] left-[25%]"
            text={"Void"}
            modalType={"spaceAttack"}
          />
        </ModalProvider>

        <Line startRef={starA} endRef={starB} />
        <Line startRef={starC} endRef={starD} />
        <Line startRef={starD} endRef={starB} />
      </div>
    </div>
  );
}
