"use client";
import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const formspreeURL =
      "https://formspree.io/f/" + process.env.NEXT_PUBLIC_FORMSPREE_API; // Replace with your Formspree endpoint

    try {
      const response = await fetch(formspreeURL, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setStatus("success");
        form.reset(); // clear form
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center w-1/3 bg-[#0B1C2C] p-8 rounded-lg shadow-lg ml-[10%]"
    >
      <h1 className="text-2xl mb-4 text-main-dark">Send a Signal!</h1>
      <div className={"mt-10"}></div>
      <input
        type="text"
        name="name"
        placeholder="Your Name"
        required
        className="mb-4 p-2 rounded bg-gray-800 text-white w-3/4"
      />
      <div className={"mt-2"}></div>
      <input
        type="email"
        name="email"
        placeholder="Your Email"
        required
        className="mb-4 p-2 rounded bg-gray-800 text-white w-3/4"
      />
      <div className={"mt-2"}></div>
      <textarea
        name="message"
        placeholder="Your Message"
        required
        className="mb-4 p-2 rounded bg-gray-800 text-white w-3/4 h-32"
      />
      <div className={"mt-10"}></div>
      <button
        type="submit"
        className="p-2 mt-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>

      {status === "success" && (
        <p className="text-green-400 mt-4">Message sent successfully!</p>
      )}
      {status === "error" && (
        <p className="text-red-400 mt-4">Something went wrong. Try again.</p>
      )}
    </form>
  );
}
