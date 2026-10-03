import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import { terms } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Service — PrepSuccess",
  description: "The rules for using PrepSuccess, in plain words.",
};

export default function TermsPage() {
  return <LegalPage doc={terms} />;
}
