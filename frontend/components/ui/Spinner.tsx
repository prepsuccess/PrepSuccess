import { cn } from "@/lib/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={cn("animate-spin", className)}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.8" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
