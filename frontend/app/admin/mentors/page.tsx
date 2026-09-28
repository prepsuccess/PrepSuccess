import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Mentor approvals" };

export default function AdminMentorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin · Mentors"
        title="Mentor approvals"
        description="Every mentor is reviewed here before students can book them."
      />
      <EmptyState
        sketch="tick"
        title="Nobody waiting"
        description="Mentor applications will queue here for approval."
      />
    </>
  );
}
