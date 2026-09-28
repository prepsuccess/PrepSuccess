import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Dashboard — PrepSuccess" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Where you stand"
        description="Your readiness score, mastered topics and next steps appear here after your first skill check."
        actions={<Button href="/assessment" label="Start a skill check" size="sm" />}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Readiness" value={null} icon="gauge" note="Out of 100" />
        <StatCard label="Topics mastered" value={null} icon="check" />
        <StatCard label="Need revision" value={null} icon="resume" />
      </div>
      <EmptyState
        className="mt-6"
        sketch="target"
        title="No results yet"
        description="Take a skill check for anything you claim to know. Each topic is scored against a pass mark of 40."
        action={<Button href="/assessment" label="Take your first check" />}
      />
    </>
  );
}
