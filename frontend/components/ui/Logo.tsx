import Link from "next/link";

/** Ascending-steps mark: assess → revise → ready. The last step carries the highlighter. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden>
      <rect x="2" y="17" width="6.5" height="9" fill="var(--color-heading)" />
      <rect x="10.75" y="10" width="6.5" height="16" fill="var(--color-heading)" />
      <rect x="19.5" y="2" width="6.5" height="24" fill="var(--color-accent)" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="PrepSuccess home"
      className={`inline-flex items-end gap-2.5 ${className}`}
    >
      <LogoMark />
      <span className="text-heading text-[21px] leading-[0.95] font-semibold tracking-[-0.03em]">
        PrepSuccess
      </span>
    </Link>
  );
}
