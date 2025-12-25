// Star.tsx
"use client";

import { ModalContext } from "@/components/ModalComponents/providers";
import { useContext, forwardRef, useImperativeHandle, useRef } from "react";
import { ModalType } from "@/components/ModalComponents/modal.types";

const Star = forwardRef(function Star(
  {
    className,
    text,
    modalType,
  }: { className?: string; text: string; modalType: ModalType },
  ref: React.Ref<HTMLElement>,
) {
  const { setModal } = useContext(ModalContext);
  const starIconRef = useRef<HTMLDivElement>(null);

  // This makes the parent receive the internal ref to just the SVG area
  useImperativeHandle(ref, () => starIconRef.current as HTMLElement);

  return (
    <div
      className={`absolute flex flex-col items-center cursor ${className ?? ""}`}
    >
      <div
        ref={starIconRef}
        onClick={() => setModal(modalType)}
        className="cursor-pointer"
      >
        <svg
          className="w-6 h-6 transition-transform duration-300 hover:-rotate-[120deg] hover:scale-350"
          viewBox="0 0 24 24"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2L14.8 8.7L22 9.2L16.5 13.9L18.2 21L12 17.3L5.8 21L7.5 13.9L2 9.2L9.2 8.7L12 2Z" />
        </svg>
      </div>
      <p className="text-white text-sm mt-7">{text}</p>
    </div>
  );
});

export default Star;
