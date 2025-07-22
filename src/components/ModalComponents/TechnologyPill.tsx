export default function TechnologyPill({ technology }: { technology: string }) {
  return (
    <span className="bg-[#1e1f3a] hover:shadow-[0_0_8px_#0ff] cursor-default text-cyan-400 text-xs px-3 py-1 rounded-full">
      {technology}
    </span>
  );
}
