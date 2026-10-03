import type { Metadata } from "next";
import Link from "next/link";
import { ListChecks } from "lucide-react";
import { DashboardView } from "@/components/app/dashboard/DashboardView";
import { Button } from "@/components/shadcn/button";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Dashboard — PrepSuccess" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Where you stand"
        description="Your readiness for placements, worked out from your skill checks."
        actions={
          <Button asChild>
            <Link href="/assessment">
              <ListChecks />
              Skill checks
            </Link>
          </Button>
        }
      />
      <DashboardView />
    </>
  );
}
