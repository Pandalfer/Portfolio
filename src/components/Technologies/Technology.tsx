export default function Technology({
  src,
  alt,
  speed = 10,
}: {
  src: string;
  alt: string;
  speed?: number;
}) {
  return (
    <div className="group relative flex justify-center items-center w-10 h-10">
      <img
        src={src}
        alt={alt}
        className="w-10 aspect-square block align-middle"
        style={{
          animation: `spin-reverse-slow ${speed}s linear infinite`,
        }}
      />
      <span
        style={{
          animation: `spin-reverse-slow ${speed}s linear infinite`,
        }}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-gray-700 text-white text-xs whitespace-nowrap scale-0 group-hover:scale-100 transition-transform origin-bottom z-50"
      >
        {alt}
      </span>
    </div>
  );
}
