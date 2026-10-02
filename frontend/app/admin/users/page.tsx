import type { Metadata } from "next";
import { UsersTable } from "@/components/admin/UsersTable";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader
        title="Users"
        description="Students and mentors on PrepSuccess. Search, sort and manage accounts."
      />
      <UsersTable users={[]} />
    </>
  );
}
