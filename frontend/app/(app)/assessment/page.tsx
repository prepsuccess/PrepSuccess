import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Skill checks — PrepSuccess" };

export default function AssessmentPage() {
  return (
    <>
      <PageHeader
        eyebrow="Skill checks"
        title="Prove what you know"
        description="Technical, aptitude and soft-skill checks, one topic at a time."
      />
      <EmptyState
        sketch="chat"
        title="Skill checks are on the way"
        description="Once your onboarding chat is done, the AI will set a quick question or small task for each skill you claim."
      />
    </>
  );
}
