import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Feedback" };

export default function AdminFeedbackPage() {
  return (
    <>
      <PageHeader
        title="Feedback"
        description="Bugs, ideas and content issues from students. Set a status and reply; the student is told when you save."
      />
      {/* The open item lives in the URL (?id=…), which needs a Suspense boundary. */}
      <Suspense>
        <AdminFeedback />
      </Suspense>
    </>
  );
}
