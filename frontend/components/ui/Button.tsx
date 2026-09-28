import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/ui/Spinner";

export type ButtonVariant = "primary" | "secondary" | "inverse";
export type ButtonSize = "md" | "sm";

const EASE = "duration-[650ms] ease-[var(--ease-out-cubic)]";

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`h-4 w-4 ${className}`}>
      <path
        d="M3.5 12.5 12.5 3.5m0 0H5.5m7 0v7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="square"
      />
    </svg>
  );
}

/** Arrow leaves top-right and a fresh one arrives from bottom-left, inside its own clip box. */
function SwapArrow({ incoming }: { incoming: string }) {
  return (
    <span className="relative block h-4 w-4 overflow-clip">
      <ArrowIcon
        className={`transition-transform group-hover:translate-x-full group-hover:-translate-y-full ${EASE}`}
      />
      <ArrowIcon
        className={`absolute inset-0 -translate-x-full translate-y-full transition-transform group-hover:translate-x-0 group-hover:translate-y-0 ${EASE} ${incoming}`}
      />
    </span>
  );
}

function RollingLabel({ label, incoming }: { label: string; incoming: string }) {
  return (
    <span className="relative block overflow-clip">
      <span className={`block transition-transform group-hover:-translate-y-full ${EASE}`}>
        {label}
      </span>
      <span
        aria-hidden
        className={`absolute inset-x-0 top-full block transition-transform group-hover:-translate-y-full ${EASE} ${incoming}`}
      >
        {label}
      </span>
    </span>
  );
}

// The base takes on the sweep colour too, so no sliver of the old fill shows at the rounded edges.
// Deep accent ink keeps white text readable across every accent theme.
const variantClasses: Record<ButtonVariant, { base: string; sweep: string; incoming: string }> = {
  primary: {
    base: "bg-heading text-white hover:bg-accent-ink",
    sweep: "bg-accent-ink",
    incoming: "text-white",
  },
  inverse: {
    base: "bg-white text-heading hover:bg-marker",
    sweep: "bg-marker",
    incoming: "text-heading",
  },
  secondary: {
    base: "border border-border-strong bg-surface text-heading hover:border-heading hover:bg-surface-3",
    sweep: "bg-surface-3",
    incoming: "",
  },
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "gap-3 px-6 py-3.5 text-[15px]",
  sm: "gap-2.5 px-5 py-2.5 text-sm",
};

type CommonProps = {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Hide the arrow (e.g. on form buttons). Secondary buttons never show one. */
  noArrow?: boolean;
  fullWidth?: boolean;
  className?: string;
};

type LinkButtonProps = CommonProps & { href: string };

type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
    loading?: boolean;
  };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

/**
 * One solid block: a highlighter fill sweeps across on hover while the label rolls and the arrow swaps.
 * Renders a `Link` when given `href`, otherwise a native `<button>` (defaults to `type="button"`).
 */
export function Button({
  label,
  variant = "primary",
  size = "md",
  noArrow = false,
  fullWidth = false,
  className: extraClassName,
  ...rest
}: ButtonProps) {
  const { base, sweep, incoming } = variantClasses[variant];
  const loading = rest.href === undefined && rest.loading;

  const className = cn(
    "group relative isolate inline-flex items-center overflow-clip rounded-full font-medium whitespace-nowrap outline-offset-4 transition-[border-color,background-color,scale,opacity] duration-500 focus-visible:outline-2 focus-visible:outline-heading active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-60",
    fullWidth && "w-full justify-center",
    base,
    sizeClasses[size],
    extraClassName,
  );

  const content = (
    <>
      <span
        aria-hidden
        className={`absolute inset-0 -z-10 origin-left scale-x-0 transition-transform group-hover:scale-x-100 ${EASE} ${sweep}`}
      />
      <RollingLabel label={label} incoming={incoming} />
      {loading ? (
        <Spinner className="h-4 w-4" />
      ) : variant !== "secondary" && !noArrow ? (
        <SwapArrow incoming={incoming} />
      ) : null}
    </>
  );

  if (rest.href !== undefined) {
    return (
      <Link href={rest.href} className={className}>
        {content}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- stripped so they don't reach the DOM
  const { loading: _loading, href: _href, type = "button", disabled, ...attrs } = rest;

  return (
    <button
      {...attrs}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={className}
    >
      {content}
    </button>
  );
}
