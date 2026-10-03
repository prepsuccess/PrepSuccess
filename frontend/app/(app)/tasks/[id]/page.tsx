import type { Metadata } from "next";
import { TaskView } from "@/components/app/learning/TaskView";

export const metadata: Metadata = { title: "Practical task — PrepSuccess" };

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskView id={id} />;
}
