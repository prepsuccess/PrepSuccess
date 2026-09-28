import { type CSSProperties, type ReactNode } from "react";

/** Two identical tracks sliding -100% on a loop, as in LearnEdge's logo marquee. */
export function Marquee({
  children,
  duration = 20,
  className = "",
}: {
  children: ReactNode;
  duration?: number;
  className?: string;
}) {
  const style = { "--marquee-duration": `${duration}s` } as CSSProperties;

  return (
    <div
      className={`relative flex overflow-clip [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] ${className}`}
      style={style}
    >
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className="animate-marquee flex flex-none items-center"
        >
          {children}
        </div>
      ))}
    </div>
  );
}
