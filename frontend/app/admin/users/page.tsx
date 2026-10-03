import type { Metadata } from "next";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader
        title="Users"
        description="Every account on PrepSuccess. Deactivate accounts or change roles — account details only, never anyone's results."
      />
      <AdminUsers />
    </>
  );
}
