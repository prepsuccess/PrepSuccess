import type { Metadata } from "next";
import { PrepGuides } from "@/components/app/questions/PrepGuides";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Prep guides — PrepSuccess" };

export default function PrepGuidesPage() {
  return (
    <>
      <PageHeader
        title="Prep guides"
        description="Downloadable interview guides, put together by the PrepSuccess team."
      />
      <PrepGuides />
    </>
  );
}
