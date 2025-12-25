import Image from "next/image";

export default function GithubPfp() {
  return (
    <div className="flex flex-row items-center justify-center flex-shrink-0">
      {/* Defined base w-20 h-20 for mobile, scaling up to w-24 h-24 on desktop */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
        <Image
          src="https://github.com/Pandalfer.png"
          alt="Pandalfer's GitHub profile picture"
          fill
          priority // Added priority so it loads instantly
          className="rounded-full object-cover"
        />
      </div>
    </div>
  );
}