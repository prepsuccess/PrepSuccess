import type { Metadata } from "next";
import { LearnHub } from "@/components/app/learning/LearnHub";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Learn — PrepSuccess" };

export default function LearnPage() {
  return (
    <>
      <PageHeader
        title="Learn"
        description="Study material and practical tasks for every skill. Start with whatever you scored below the pass mark on."
      />
      <LearnHub />
    </>
  );
}
