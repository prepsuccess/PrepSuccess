import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/PageHeader";
import { ProfileDetails } from "@/components/app/ProfileDetails";

export const metadata: Metadata = { title: "Profile — PrepSuccess" };

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title="Your details"
        description="What PrepSuccess knows about you. The onboarding chat fills most of this in; you can edit it any time."
      />
      <ProfileDetails />
    </>
  );
}
