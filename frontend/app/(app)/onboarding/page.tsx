import type { Metadata } from "next";
import { OnboardingChat } from "@/components/app/OnboardingChat";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Get started — PrepSuccess" };

export default function OnboardingPage() {
  return (
    <>
      <PageHeader
        title="Let's get to know you"
        description="A two-minute chat with your AI coach. It picks the right skill checks from what you tell it."
      />
      <OnboardingChat />
    </>
  );
}
