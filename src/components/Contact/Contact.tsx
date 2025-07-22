"use client";
import ContactForm from "@/components/Contact/ContactForm";
import GitHubSatellite from "@/components/Contact/githubSatelite";

export default function Contact() {
  return (
    <div className={"flex flex-row gap-[25%]"}>
      <ContactForm />
      <GitHubSatellite />
    </div>
  );
}
