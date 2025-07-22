export default function YearInfo({
  src,
  alt,
  year,
  content,
}: {
  src: string;
  alt: string;
  year: number;
  content: React.ReactNode;
}) {
  return (
    <div className={"flex flex-row items-center gap-4 text-lg"}>
      <img alt={alt} className={"w-15"} src={src} />
      <div className={"flex flex-col"}>
        <p className="text-gray-300 leading-relaxed ">
          <strong>{year}</strong>
        </p>
        {content}
      </div>
    </div>
  );
}
