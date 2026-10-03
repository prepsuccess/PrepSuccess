import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import { privacy } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy — PrepSuccess",
  description: "What PrepSuccess collects, why, who processes it, and your rights.",
};

export default function PrivacyPage() {
  return <LegalPage doc={privacy} />;
}
