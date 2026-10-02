"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Copy, MoreHorizontal, Users } from "lucide-react";
import { toast } from "sonner";
import { DataTable, SortableHeader } from "@/components/app/data-table";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import type { AuthUser } from "@/lib/api/types";

export type AdminUserRow = Pick<
  AuthUser,
  "id" | "first_name" | "last_name" | "email" | "role" | "created_at"
> & { is_active: boolean };

const fullName = (u: AdminUserRow) => [u.first_name, u.last_name].filter(Boolean).join(" ");

export const userColumns: ColumnDef<AdminUserRow>[] = [
  {
    id: "name",
    accessorFn: fullName,
    header: ({ column }) => <SortableHeader column={column} title="Name" />,
    cell: ({ row }) => <span className="font-medium">{fullName(row.original)}</span>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader column={column} title="Email" />,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge
        variant={row.original.role === "admin" ? "default" : "secondary"}
        className="capitalize"
      >
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    // Word + style, never colour alone.
    cell: ({ row }) =>
      row.original.is_active ? (
        <Badge variant="outline">Active</Badge>
      ) : (
        <Badge variant="destructive">Deactivated</Badge>
      ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <SortableHeader column={column} title="Joined" />,
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" }),
  },
  {
    id: "actions",
    enableSorting: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${fullName(row.original)}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={async () => {
              await navigator.clipboard.writeText(row.original.email);
              toast.success("Email copied");
            }}
          >
            <Copy />
            Copy email
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

/** Admin users list. Rows arrive once GET /api/v1/admin/users exists (PRD-04 §3.1). */
export function UsersTable({
  users,
  loading = false,
}: {
  users: AdminUserRow[];
  loading?: boolean;
}) {
  return (
    <DataTable
      columns={userColumns}
      data={users}
      loading={loading}
      caption="Students and mentors on PrepSuccess"
      searchPlaceholder="Search name or email…"
      empty={
        <span className="text-muted-foreground inline-flex flex-col items-center gap-2 text-sm">
          <Users className="size-5" aria-hidden />
          No users to show yet. The admin users endpoint is next on the backend.
        </span>
      }
    />
  );
}
