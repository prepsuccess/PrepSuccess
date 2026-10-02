import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Chip } from "@/components/ui/MiniUI";
import { PageHeader } from "@/components/shell/PageHeader";
import type { AuthUser } from "@/lib/api/types";

export const metadata: Metadata = { title: "Users" };

type UserRow = Pick<
  AuthUser,
  "id" | "first_name" | "last_name" | "email" | "role" | "created_at"
> & {
  is_active: boolean;
};

const columns: Column<UserRow>[] = [
  {
    key: "name",
    header: "Name",
    render: (u) => [u.first_name, u.last_name].filter(Boolean).join(" "),
  },
  { key: "email", header: "Email", render: (u) => u.email },
  { key: "role", header: "Role", render: (u) => <Chip>{u.role}</Chip> },
  {
    key: "status",
    header: "Status",
    render: (u) => (
      <Chip status={u.is_active ? "mastered" : "revision"}>
        {u.is_active ? "Active" : "Deactivated"}
      </Chip>
    ),
  },
  {
    key: "joined",
    header: "Joined",
    align: "right",
    render: (u) => new Date(u.created_at).toLocaleDateString("en-IN"),
  },
];

export default function AdminUsersPage() {
  const rows: UserRow[] = [];

  return (
    <>
      <PageHeader
        eyebrow="Admin · Users"
        title="Users"
        description="Search, filter and deactivate accounts."
      />
      <DataTable
        caption="All users"
        columns={columns}
        rows={rows}
        rowKey={(u) => u.id}
        empty={
          <EmptyState
            className="shadow-none"
            sketch="question"
            title="No users to show"
            description="Accounts appear here once the admin users endpoint ships."
          />
        }
      />
    </>
  );
}
