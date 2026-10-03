import { cn } from "@/lib/utils/cn";

const LEVEL = { easy: 1, medium: 2, hard: 3 } as const;

/** Difficulty as 1–3 filled bars plus the word, so it never relies on colour. */
export function DifficultyBars({ level }: { level: keyof typeof LEVEL }) {
  const filled = LEVEL[level];
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
      <span aria-hidden className="flex items-end gap-0.5">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn(
              "w-1 rounded-sm",
              n === 1 ? "h-1.5" : n === 2 ? "h-2.5" : "h-3.5",
              n <= filled ? "bg-foreground/70" : "bg-border",
            )}
          />
        ))}
      </span>
      <span className="capitalize">{level}</span>
    </span>
  );
}
