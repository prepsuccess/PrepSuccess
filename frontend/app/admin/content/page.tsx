import type { Metadata } from "next";
import { ContentManager } from "@/components/admin/ContentManager";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Skills & content" };

export default function AdminContentPage() {
  return (
    <>
      <PageHeader
        title="Skills & content"
        description="Every skill students can check, its pass mark, and the learning resources and practical tasks behind it. Only admins can change these."
      />
      <ContentManager />
    </>
  );
}
