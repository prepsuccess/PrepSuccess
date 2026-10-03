import { cn } from "@/lib/utils/cn";
import { topicStyle } from "./topicStyle";

/** A topic's colour and icon as a small rounded chip. Size it with `className` (e.g. size-10). */
export function TopicIcon({ topic, className }: { topic: string | null; className?: string }) {
  const style = topicStyle(topic);
  const Icon = style.icon;
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg",
        style.tint,
        style.ink,
        className,
      )}
    >
      <Icon className="size-1/2" />
    </span>
  );
}
