import type { Metadata } from "next";
import { Info, ListChecks, Gauge, ShieldCheck, UserPlus } from "lucide-react";
import { StatCards } from "@/components/app/StatCards";
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn/alert";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Overview" };

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="Platform-wide numbers. Aggregates only — never an individual student's results."
      />
      <StatCards
        stats={[
          { label: "Signups", icon: UserPlus, value: null },
          { label: "Skill checks taken", icon: ListChecks, value: null },
          { label: "Average readiness", icon: Gauge, value: null },
          { label: "Mentors pending", icon: ShieldCheck, value: null },
        ]}
      />
      <Alert className="mt-4">
        <Info />
        <AlertTitle>Waiting on the analytics endpoint</AlertTitle>
        <AlertDescription>
          These fill in once GET /api/v1/admin/analytics is built.
        </AlertDescription>
      </Alert>
    </>
  );
}
