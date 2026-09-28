import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Skills & questions" };

export default function AdminContentPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin · Content"
        title="Skills & questions"
        description="The skills students can claim, their topics, and the question bank behind each check. Only admins can change these."
      />
      <EmptyState
        sketch="book"
        title="No skills yet"
        description="Skills, topics and questions will be managed here."
      />
    </>
  );
}
