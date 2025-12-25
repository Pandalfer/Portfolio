"use client";
import ContactForm from "@/components/Contact/ContactForm";

export default function Contact() {
  return (
    // Stack vertically on mobile, row on medium screens+
    <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-[10%] px-6 py-10">
      <ContactForm />
    </div>
  );
}