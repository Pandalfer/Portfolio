"use client";

import Star from "./Star";
import ModalProvider from "@/components/ModalComponents/providers";
import Line from "@/components/Projects/Line";
import { useRef } from "react";

export default function Projects() {
  const starA = useRef<HTMLElement>(null);
  const starB = useRef<HTMLElement>(null);
  const starC = useRef<HTMLElement>(null);
  const starD = useRef<HTMLElement>(null);

  return (
    <div
      className={"relative flex items-center justify-center w-screen [500px]"}
    >
      <div className="relative w-[300px] h-[300px]">
        <img
          src="https://cdn.simpleicons.org/foodpanda/28345A"
          alt="Pandas Logo"
          className="w-full h-full"
        />

        <ModalProvider>
          <Star
            ref={starA}
            className="top-[6%] left-[7%]"
            text={"Textana"}
            modalType={"textana"}
          />{" "}
          <Star
            ref={starB}
            className="top-[6%] right-[0%]"
            text={"Space Attack"}
            modalType={"spaceAttack"}
          />{" "}
          <Star
            ref={starC}
            className="top-[33%] right-[19%]"
            text={"Studanova"}
            modalType={"studanova"}
          />{" "}
        </ModalProvider>

        <Line startRef={starA} endRef={starC} />
        <Line startRef={starC} endRef={starB} />
        <Line startRef={starD} endRef={starB} />
      </div>
    </div>
  );
}
