"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/lib/api/endpoints/notifications";
import type { AppNotification } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { useCoach } from "@/components/app/coach/CoachProvider";

const POLL_MS = 60_000;

const timeAgo = (iso: string, now = Date.now()) => {
  const minutes = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

/**
 * The bell in the top bar: unread count, the latest notifications, and a toast
 * when a new one arrives. Polls once a minute while the tab is focused.
 */
export function NotificationBell() {
  const router = useRouter();
  const coach = useCoach();
  const { data } = useGetNotificationsQuery(undefined, {
    pollingInterval: POLL_MS,
    skipPollingIfUnfocused: true,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: clearing }] = useMarkAllNotificationsReadMutation();
  const unread = data?.unread_count ?? 0;

  // Toast notifications that arrive after the first load, once each.
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!data) return;
    const ids = data.notifications.map((n) => n.id);
    if (seen.current) {
      for (const n of data.notifications) {
        if (seen.current.has(n.id) || n.read) continue;
        if (n.type === "COACH_NUDGE" && coach) {
          // The coach's check-in: one tap opens the chat, where the tip is waiting.
          toast(n.title, {
            description: n.body ?? undefined,
            duration: 15_000,
            action: {
              label: "Open chat",
              onClick: () => {
                void markRead(n.id);
                coach.openCoach();
              },
            },
          });
        } else {
          toast(n.title, { description: n.body ?? undefined });
        }
      }
    }
    seen.current = new Set(ids);
  }, [data, coach, markRead]);

  function open(n: AppNotification) {
    if (!n.read) void markRead(n.id);
    if (n.type === "COACH_NUDGE" && coach) coach.openCoach();
    else if (n.href) router.push(n.href);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Bell />
          {unread ? (
            <span
              aria-hidden
              className="bg-destructive absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-semibold text-white tabular-nums"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-80">
        <div className="flex items-center justify-between gap-2 pr-1">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {unread ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              disabled={clearing}
              onClick={(e) => {
                e.preventDefault();
                void markAllRead();
              }}
            >
              <CheckCheck />
              Mark all read
            </Button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        {data?.notifications.length ? (
          <div className="max-h-96 overflow-y-auto">
            {data.notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onSelect={() => open(n)}
                className="flex items-start gap-2.5 py-2.5"
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    n.read ? "bg-transparent" : "bg-primary",
                  )}
                />
                <span className="min-w-0 flex-1 space-y-0.5">
                  <span
                    className={cn(
                      "block text-sm",
                      n.read ? "text-muted-foreground" : "font-medium",
                    )}
                  >
                    {n.title}
                    {n.read ? null : <span className="sr-only"> (unread)</span>}
                  </span>
                  {n.body ? (
                    <span className="text-muted-foreground line-clamp-2 block text-xs">
                      {n.body}
                    </span>
                  ) : null}
                  <span className="text-muted-foreground block text-[11px]">
                    {timeAgo(n.created_at)}
                  </span>
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground px-2 py-6 text-center text-sm">
            You&apos;re all caught up.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
