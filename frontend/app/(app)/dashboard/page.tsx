import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, Gauge, ListChecks, NotebookPen, Target } from "lucide-react";
import { AiTrialCard } from "@/components/app/AiTrialCard";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { OnboardingPrompt } from "@/components/app/OnboardingPrompt";
import { StatCards } from "@/components/app/StatCards";
import { Button } from "@/components/shadcn/button";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Dashboard — PrepSuccess" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Where you stand"
        description="Your readiness score, mastered topics and next steps appear here after your first skill check."
        actions={
          <Button asChild>
            <Link href="/assessment">
              <ListChecks />
              Start a skill check
            </Link>
          </Button>
        }
      />

      <OnboardingPrompt className="mb-4" />

      {/* No skill checks exist yet (the assessment API is next), so values are null.
          They will come from GET /api/v1/dashboard. */}
      <StatCards
        stats={[
          {
            label: "Readiness",
            icon: Gauge,
            value: null,
            note: "Out of 100, across every skill you've checked",
          },
          {
            label: "Topics mastered",
            icon: CircleCheck,
            value: null,
            note: "At or above the pass mark of 40",
          },
          {
            label: "Need revision",
            icon: NotebookPen,
            value: null,
            note: "Below the pass mark, with study material",
          },
        ]}
      />

      <AiTrialCard className="mt-4" />

      <EmptyPanel
        className="mt-4"
        icon={Target}
        title="No results yet"
        description="Take a skill check for anything you claim to know. Each topic is scored against a pass mark of 40."
        action={
          <Button asChild variant="outline">
            <Link href="/assessment">Take your first check</Link>
          </Button>
        }
      />
    </>
  );
}
