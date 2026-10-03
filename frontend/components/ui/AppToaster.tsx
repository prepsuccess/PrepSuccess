"use client";

import toast, { Toaster } from "react-hot-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * The app's toasts (react-hot-toast), styled with the theme tokens so they
 * follow light and dark mode. Simple messages use `toast.success()` /
 * `toast.error()` from "react-hot-toast"; notifications use `showNotice()`.
 */
export function AppToaster({ aboveCoach = false }: { aboveCoach?: boolean }) {
  return (
    <Toaster
      position="bottom-right"
      // Clear of the coach button in the student app.
      containerStyle={aboveCoach ? { bottom: 88, right: 20 } : undefined}
      toastOptions={{
        duration: 5000,
        className:
          "!bg-popover !text-popover-foreground !border !border-border !shadow-lg !rounded-xl !text-sm !max-w-sm",
        success: { iconTheme: { primary: "var(--color-success)", secondary: "white" } },
      }}
    />
  );
}

interface Notice {
  title: string;
  body?: string | null;
  /** A button inside the toast, e.g. "Open chat". */
  action?: { label: string; onClick: () => void };
  duration?: number;
}

/** A notification toast: title, optional text and action, and a close button. */
export function showNotice({ title, body, action, duration = 8000 }: Notice) {
  return toast.custom(
    (t) => (
      <div
        role="status"
        className={cn(
          "bg-popover text-popover-foreground pointer-events-auto flex w-[22rem] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border p-4 shadow-lg transition-all",
          t.visible ? "animate-in fade-in slide-in-from-bottom-2" : "animate-out fade-out",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          {body ? <p className="text-muted-foreground mt-1 text-sm">{body}</p> : null}
          {action ? (
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                action.onClick();
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-3 inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium pointer-coarse:h-11"
            >
              {action.label}
            </button>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => toast.dismiss(t.id)}
          className="text-muted-foreground hover:text-foreground -mt-1 -mr-1 flex size-7 items-center justify-center rounded-md"
        >
          <X className="size-4" />
        </button>
      </div>
    ),
    { duration },
  );
}
