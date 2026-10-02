import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { EmptyPanel } from "@/components/app/EmptyPanel";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Mentor approvals" };

export default function AdminMentorsPage() {
  return (
    <>
      <PageHeader
        title="Mentor approvals"
        description="Every mentor is reviewed here before students can book them."
      />
      <EmptyPanel
        icon={ShieldCheck}
        title="Nobody waiting"
        description="Mentor applications will queue here for approval."
      />
    </>
  );
}
