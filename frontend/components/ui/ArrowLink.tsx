import Link from "next/link";

/** Quiet text link whose arrow slides on hover of the nearest `.group`. */
export function ArrowLink({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`text-heading inline-flex items-center gap-2 text-[15px] font-medium ${className}`}
    >
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
        {label}
      </span>
      <svg
        viewBox="0 0 16 16"
        className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-out-cubic)] group-hover:translate-x-1"
        fill="none"
        aria-hidden
      >
        <path
          d="M2 8h11m0 0L8.5 3.5M13 8l-4.5 4.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="square"
        />
      </svg>
    </Link>
  );
}
