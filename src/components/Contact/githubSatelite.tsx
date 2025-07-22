"use client";

export default function GitHubSatellite() {
  return (
    <div className="relative inline-block w-full max-w-[200px]">
      {" "}
      {/* Limit width if needed */}
      <img
        src="/Satelite.png"
        alt="Satellite Image"
        className="w-full h-auto"
      />
      <a
        href="https://github.com/Pandalfer"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://cdn.simpleicons.org/github/fff"
          alt="GitHub Icon"
          className="absolute w-8 h-8"
          style={{
            top: "24%",
            right: "98%", // position the icon over the satellite "tip"
            transform: "translate(50%, -50%)",
          }}
        />
      </a>
    </div>
  );
}
