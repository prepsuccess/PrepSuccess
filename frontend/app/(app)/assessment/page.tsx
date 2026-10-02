import type { Metadata } from "next";
import { ListChecks } from "lucide-react";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Skill checks — PrepSuccess" };

export default function AssessmentPage() {
  return (
    <>
      <PageHeader
        title="Skill checks"
        description="Technical, aptitude and soft-skill checks, one topic at a time."
      />
      <EmptyPanel
        icon={ListChecks}
        title="Skill checks are on the way"
        description="Once your onboarding chat is done, the AI will set a quick question or small task for each skill you claim."
      />
    </>
  );
}
