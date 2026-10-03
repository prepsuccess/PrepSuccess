import type { Metadata } from "next";
import { QuestionView } from "@/components/app/questions/QuestionView";

export const metadata: Metadata = { title: "Interview question — PrepSuccess" };

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuestionView id={id} />;
}
