import Image from "next/image";

export default function Astronaut() {
  return (
    <div className="relative flex items-center justify-center w-screen h-[300px] overflow-hidden">
      <div className="relative w-[300px] h-[300px]">
        {/* Helmet image on top */}
        <img
          src="/AstronautHelmet.png"
          alt="Pandas Logo"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />

        {/* Bigger GitHub profile pic behind */}
        <div
          className="absolute inset-0 z-0 rounded-full overflow-hidden translate-x-2.5 translate-y-3"
          style={{ width: 300, height: 300 }}
        >
          <Image
            src="https://github.com/Pandalfer.png?size=300"
            alt="Pandalfer's GitHub profile picture"
            width={275}
            height={275}
            quality={100}
            className="rounded-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
