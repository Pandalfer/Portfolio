import Center from "@/components/Technologies/Center";
import Ring from "@/components/Technologies/Ring";
import Technology from "@/components/Technologies/Technology";

export default function TechnologiesBlackHole() {
  return (
    <div className="relative flex items-center justify-center w-screen [500px]">
      <Center />

      <Ring width={400} offset={25} speed={15}>
        <Technology
          src="https://cdn.simpleicons.org/react/8A2BE2"
          alt="React"
        />
        <Technology
          src="https://cdn.simpleicons.org/next.js/8A2BE2"
          alt="Next Js"
        />
        <Technology
          src="https://cdn.simpleicons.org/typescript/8A2BE2"
          alt="TypeScript"
        />
        <Technology
          src="https://cdn.simpleicons.org/tailwindcss/8A2BE2"
          alt="TailwindCSS"
        />
      </Ring>

      <Ring width={250} offset={0} speed={7}>
        <Technology
          src="https://cdn.simpleicons.org/unity/8A2BE2"
          alt="Unity"
        />
        <Technology src="https://cdn.simpleicons.org/npm/8A2BE2" alt="NPM" />
        <Technology
          src="https://cdn.simpleicons.org/python/8A2BE2"
          alt="Python"
        />
        <Technology
          src="https://cdn.simpleicons.org/flask/8A2BE2"
          alt="Flask"
        />
        <Technology
          src="https://cdn.simpleicons.org/jinja/8A2BE2"
          alt="Jinja"
        />
      </Ring>
    </div>
  );
}
