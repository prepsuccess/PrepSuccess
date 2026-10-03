import type { Metadata } from "next";
import { AnalyticsView } from "@/components/admin/AnalyticsView";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Analytics" };

export default function AdminAnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Signups, skill checks, practical tasks and AI usage — totals and rates only, never an individual student."
      />
      <AnalyticsView />
    </>
  );
}
