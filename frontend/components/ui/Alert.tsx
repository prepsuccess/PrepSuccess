import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type AlertTone = "error" | "success" | "info";

const tones: Record<AlertTone, string> = {
  error: "border-danger/40 bg-danger/5 text-danger",
  success: "border-success/40 bg-success/5 text-success",
  info: "border-border-strong bg-surface-3 text-heading",
};

/** Form- or page-level message. Errors are announced immediately to screen readers. */
export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: AlertTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-[10px] border px-4 py-3 text-[14px]", tones[tone], className)}
    >
      {children}
    </div>
  );
}
