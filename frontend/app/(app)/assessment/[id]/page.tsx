import type { Metadata } from "next";
import { SkillCheck } from "@/components/app/skill-checks/SkillCheck";

export const metadata: Metadata = { title: "Skill check — PrepSuccess" };

export default async function SkillCheckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl">
      <SkillCheck id={id} />
    </div>
  );
}
