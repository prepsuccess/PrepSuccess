import { type ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1160px] px-4 sm:px-6 lg:px-10 xl:px-0 ${className}`}>
      {children}
    </div>
  );
}
