import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Overview" };

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="Platform-wide numbers. Aggregates only — never an individual student's results."
      />
      <AdminOverview />
    </>
  );
}
