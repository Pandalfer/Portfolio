import Image from "next/image";

export default function GithubPfp() {
  return (
    <Image
      src="https://github.com/Pandalfer.png"
      alt="Pandalfer's GitHub profile picture"
      width={96}
      height={96}
      quality={100}
      className="rounded-full w-24 aspect-square"
    />
  );
}
