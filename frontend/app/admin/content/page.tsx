import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Skills & questions" };

export default function AdminContentPage() {
  return (
    <>
      <PageHeader
        title="Skills & questions"
        description="The skills students can claim, their topics, and the question bank behind each check. Only admins can change these."
      />
      <EmptyPanel
        icon={BookOpen}
        title="No skills yet"
        description="Skills, topics and questions will be managed here."
      />
    </>
  );
}
