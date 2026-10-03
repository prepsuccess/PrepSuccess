import type { Metadata } from "next";
import { SkillLearn } from "@/components/app/learning/SkillLearn";

export const metadata: Metadata = { title: "Learn — PrepSuccess" };

export default async function SkillLearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-3xl">
      <SkillLearn slug={slug} />
    </div>
  );
}
