"use client";

import { Component, Dispatch, SetStateAction } from "react";
import { ModalType } from "./modal.types";
import TextanaModal from "@/components/ModalComponents/Modals/TextanaModal";
import SpaceAttackModal from "@/components/ModalComponents/Modals/SpaceAttackModal";
import InfoModal from "@/components/ModalComponents/Modals/InfoModal";
import JourneyModal from "@/components/ModalComponents/Modals/JourneyModal";
import StudanovaModal from "@/components/ModalComponents/Modals/StudanovaModal";

export class TextanaModalComponent extends Component<{
  setModal: Dispatch<SetStateAction<ModalType>>;
}> {
  render() {
    const { setModal } = this.props;
    return <TextanaModal setModal={setModal} />;
  }
}

export class SpaceAttackModalComponent extends Component<{
  setModal: Dispatch<SetStateAction<ModalType>>;
}> {
  render() {
    const { setModal } = this.props;
    return <SpaceAttackModal setModal={setModal} />;
  }
}

export class InfoModalComponent extends Component<{
  setModal: Dispatch<SetStateAction<ModalType>>;
}> {
  render() {
    const { setModal } = this.props;
    return <InfoModal setModal={setModal} />;
  }
}

export class JourneyModalComponent extends Component<{
  setModal: Dispatch<SetStateAction<ModalType>>;
}> {
  render() {
    const { setModal } = this.props;
    return <JourneyModal setModal={setModal} />;
  }
}

export class StudanovaModalComponent extends Component<{
  setModal: Dispatch<SetStateAction<ModalType>>;
}> {
  render() {
    const { setModal } = this.props;
    return <StudanovaModal setModal={setModal} />;
  }
}

export function Modal(
  modal: ModalType,
  setModal: Dispatch<SetStateAction<ModalType>>,
) {
  const ActiveModal = () => {
    switch (modal) {
      case "textana":
        return <TextanaModalComponent setModal={setModal} />;
      case "spaceAttack":
        return <SpaceAttackModalComponent setModal={setModal} />;
      case "info":
        return <InfoModalComponent setModal={setModal} />;
      case "journey":
        return <JourneyModalComponent setModal={setModal} />;
      case "studanova":
        return <StudanovaModalComponent setModal={setModal} />;
      default:
        return null;
    }
  };

  return {
    setModal,
    ActiveModal,
  };
}
