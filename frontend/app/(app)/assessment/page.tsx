import type { Metadata } from "next";
import { SkillChecks } from "@/components/app/skill-checks/SkillChecks";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Skill checks — PrepSuccess" };

export default function AssessmentPage() {
  return (
    <>
      <PageHeader
        title="Skill checks"
        description="Pick 10 to 30 questions per check. They get harder when you're right and easier when you're not. Score 40% or more to count it as mastered."
      />
      <SkillChecks />
    </>
  );
}
