import type { Metadata } from "next";
import { ContentTabs } from "@/components/admin/ContentTabs";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Skills & content" };

export default function AdminContentPage() {
  return (
    <>
      <PageHeader
        title="Skills & content"
        description="Skills and their pass marks, the learning resources and practical tasks behind them, the interview question bank and prep guides. Only admins can change these."
      />
      <ContentTabs />
    </>
  );
}
