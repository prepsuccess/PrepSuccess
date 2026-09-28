import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Analytics" };

export default function AdminAnalyticsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin · Analytics"
        title="Analytics"
        description="Signups, skill checks, average readiness and session volume over time — totals only."
      />
      <EmptyState
        sketch="target"
        title="No data yet"
        description="Charts appear here once the analytics endpoint is live."
      />
    </>
  );
}
