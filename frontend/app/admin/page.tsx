import type { Metadata } from "next";
import { Alert } from "@/components/ui/Alert";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Overview" };

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Platform overview"
        description="Aggregate numbers only. Individual students' results are never browsable from here."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Signups" value={null} icon="person" />
        <StatCard label="Skill checks taken" value={null} icon="checklist" />
        <StatCard label="Avg readiness" value={null} icon="gauge" />
        <StatCard label="Mentors pending" value={null} icon="shield" />
      </div>
      <Alert className="mt-6">
        These fill in once{" "}
        <code className="font-mono text-[13px] break-all">GET /api/v1/admin/analytics</code> is
        available.
      </Alert>
    </>
  );
}
