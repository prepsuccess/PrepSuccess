import type { Metadata } from "next";
import { Suspense } from "react";
import { QuestionBank } from "@/components/app/questions/QuestionBank";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Interview prep — PrepSuccess" };

export default function QuestionsPage() {
  return (
    <>
      <PageHeader
        title="Interview prep"
        description="Real interview questions by skill, company and role. Practise, check the model answer, and track what you've solved."
      />
      {/* The filters read the URL, which needs a Suspense boundary in the App Router. */}
      <Suspense>
        <QuestionBank />
      </Suspense>
    </>
  );
}
