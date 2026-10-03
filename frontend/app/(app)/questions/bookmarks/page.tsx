import type { Metadata } from "next";
import { Bookmarks } from "@/components/app/questions/Bookmarks";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "My bookmarks — PrepSuccess" };

export default function BookmarksPage() {
  return (
    <>
      <PageHeader title="My bookmarks" description="Questions you saved to come back to." />
      <Bookmarks />
    </>
  );
}
