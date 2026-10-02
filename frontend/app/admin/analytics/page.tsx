import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Analytics" };

export default function AdminAnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Signups, skill checks, average readiness and session volume over time — totals only."
      />
      <EmptyPanel
        icon={BarChart3}
        title="No data yet"
        description="Charts appear here once the analytics endpoint is live."
      />
    </>
  );
}
