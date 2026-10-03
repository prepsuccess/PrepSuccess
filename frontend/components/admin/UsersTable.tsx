"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Copy, MoreHorizontal, ShieldCheck, UserCheck, UserX, Users } from "lucide-react";
import toast from "react-hot-toast";
import { DataTable, SortableHeader } from "@/components/app/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn/alert-dialog";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import type { AdminUser } from "@/lib/api/types";

export type AdminUserRow = AdminUser;
type Role = AdminUser["role"];

/** A change waiting for the admin to confirm it. */
export type UserChange =
  | { user: AdminUserRow; kind: "active"; value: boolean }
  | { user: AdminUserRow; kind: "role"; value: Role };

const fullName = (u: AdminUserRow) => [u.first_name, u.last_name].filter(Boolean).join(" ");
const ROLES: Role[] = ["student", "mentor", "admin"];

function RowActions({
  user,
  isSelf,
  onRequest,
}: {
  user: AdminUserRow;
  isSelf: boolean;
  onRequest?: (change: UserChange) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${fullName(user)}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={async () => {
            await navigator.clipboard.writeText(user.email);
            toast.success("Email copied");
          }}
        >
          <Copy />
          Copy email
        </DropdownMenuItem>
        {onRequest && !isSelf ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ShieldCheck />
                Change role
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={user.role}
                  onValueChange={(value) => {
                    if (value !== user.role)
                      onRequest({ user, kind: "role", value: value as Role });
                  }}
                >
                  {ROLES.map((role) => (
                    <DropdownMenuRadioItem key={role} value={role} className="capitalize">
                      {role}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem
              variant={user.is_active ? "destructive" : "default"}
              onSelect={() => onRequest({ user, kind: "active", value: !user.is_active })}
            >
              {user.is_active ? <UserX /> : <UserCheck />}
              {user.is_active ? "Deactivate" : "Reactivate"}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function columnsFor(
  currentUserId: string | undefined,
  onRequest?: (change: UserChange) => void,
): ColumnDef<AdminUserRow>[] {
  return [
    {
      id: "name",
      accessorFn: fullName,
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <span className="font-medium">
          {fullName(row.original)}
          {row.original.id === currentUserId ? (
            <span className="text-muted-foreground font-normal"> (you)</span>
          ) : null}
        </span>
      ),
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
      accessorKey: "onboarding_completed",
      header: "Onboarded",
      cell: ({ row }) => (row.original.onboarding_completed ? "Yes" : "Not yet"),
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
        <RowActions
          user={row.original}
          isSelf={row.original.id === currentUserId}
          onRequest={onRequest}
        />
      ),
    },
  ];
}

function describe(change: UserChange) {
  const name = fullName(change.user);
  if (change.kind === "active") {
    return change.value
      ? {
          title: `Reactivate ${name}?`,
          body: "They'll be able to log in again.",
          action: "Reactivate",
        }
      : {
          title: `Deactivate ${name}?`,
          body: "They're signed out everywhere and can't log in until reactivated. Their data is kept.",
          action: "Deactivate",
        };
  }
  return {
    title: `Make ${name} ${change.value === "admin" ? "an" : "a"} ${change.value}?`,
    body:
      change.value === "admin"
        ? "Admins can manage every account and all content. They'll be signed out and get the new role when they log in again."
        : "They'll be signed out and get the new role when they log in again.",
    action: "Change role",
  };
}

/** Admin users list: search and sort within the page, plus account actions with a confirm step. */
export function UsersTable({
  users,
  loading = false,
  currentUserId,
  onChange,
}: {
  users: AdminUserRow[];
  loading?: boolean;
  /** The signed-in admin, who can't change their own account here. */
  currentUserId?: string;
  /** Applies a confirmed change; without it the table is read-only. */
  onChange?: (change: UserChange) => Promise<void>;
}) {
  const [pending, setPending] = useState<UserChange | null>(null);
  const [saving, setSaving] = useState(false);
  const copy = pending ? describe(pending) : null;
  const hasActions = Boolean(onChange);
  const columns = useMemo(
    () => columnsFor(currentUserId, hasActions ? setPending : undefined),
    [currentUserId, hasActions],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        caption="Students, mentors and admins on PrepSuccess"
        searchPlaceholder="Search name or email…"
        empty={
          <span className="text-muted-foreground inline-flex flex-col items-center gap-2 text-sm">
            <Users className="size-5" aria-hidden />
            No users match these filters.
          </span>
        }
      />
      <AlertDialog open={Boolean(pending)} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy?.title}</AlertDialogTitle>
            <AlertDialogDescription>{copy?.body}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={async (e) => {
                e.preventDefault();
                if (!pending || !onChange) return;
                setSaving(true);
                try {
                  await onChange(pending);
                  setPending(null);
                } finally {
                  setSaving(false);
                }
              }}
            >
              {copy?.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
