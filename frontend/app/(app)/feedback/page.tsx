import type { Metadata } from "next";
import { MyFeedback } from "@/components/app/feedback/MyFeedback";
import { SendFeedbackButton } from "@/components/app/feedback/FeedbackDialog";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Your feedback — PrepSuccess" };

export default function FeedbackPage() {
  return (
    <>
      <PageHeader
        title="Your feedback"
        description="Bugs, ideas and anything else you've sent us, with where each one stands and our replies."
        actions={<SendFeedbackButton />}
      />
      <MyFeedback />
    </>
  );
}
