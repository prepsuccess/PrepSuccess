"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Users } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { ErrorState } from "@/components/ui/ErrorState";
import { useGetAdminAnalyticsQuery } from "@/lib/api/endpoints/admin";
import { AnalyticsTiles } from "./AnalyticsView";

const LINKS = [
  {
    href: "/admin/users",
    icon: Users,
    title: "Users",
    body: "Deactivate accounts and change roles.",
  },
  {
    href: "/admin/content",
    icon: BookOpen,
    title: "Skills & content",
    body: "Pass marks, learning resources and practical tasks.",
  },
  {
    href: "/admin/analytics",
    icon: BarChart3,
    title: "Analytics",
    body: "Signups, checks and AI usage over time.",
  },
];

/** /admin — the headline numbers and where to go next. */
export function AdminOverview() {
  const query = useGetAdminAnalyticsQuery();
  return (
    <div className="space-y-6">
      {query.isError ? (
        <ErrorState
          error={query.error}
          title="Couldn't load the numbers"
          onRetry={() => void query.refetch()}
        />
      ) : (
        <AnalyticsTiles data={query.data} loading={query.isLoading} />
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {LINKS.map(({ href, icon: Icon, title, body }) => (
          <Link
            key={href}
            href={href}
            className="group focus-visible:ring-ring/50 rounded-xl outline-none focus-visible:ring-3"
          >
            <Card className="group-hover:bg-muted/40 h-full transition-colors">
              <CardHeader>
                <Icon className="text-muted-foreground size-5" aria-hidden />
                <CardTitle className="flex items-center justify-between gap-2">
                  {title}
                  <ArrowRight
                    aria-hidden
                    className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </CardTitle>
                <CardDescription>{body}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
