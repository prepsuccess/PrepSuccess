"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/shadcn/button";
import { NativeSelect, NativeSelectOption } from "@/components/shadcn/native-select";
import { ErrorState } from "@/components/ui/ErrorState";
import { errorMessage } from "@/lib/api/errors";
import {
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
  type AdminUsersQuery,
} from "@/lib/api/endpoints/admin";
import { useSession } from "@/lib/auth/useSession";
import { UsersTable, type UserChange } from "./UsersTable";

// The table searches and sorts within a page; filters and paging go to the server.
const PAGE_SIZE = 100;

/** /admin/users — every account, filtered on the server, managed with a confirm step. */
export function AdminUsers() {
  const session = useSession();
  const [filters, setFilters] = useState<Omit<AdminUsersQuery, "limit">>({ page: 1 });
  const query = useGetAdminUsersQuery({ ...filters, limit: PAGE_SIZE });
  const [update] = useUpdateAdminUserMutation();

  const total = query.data?.meta.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const setFilter = (patch: Partial<AdminUsersQuery>) =>
    setFilters((f) => ({ ...f, ...patch, page: 1 }));

  async function apply(change: UserChange) {
    try {
      await update(
        change.kind === "active"
          ? { id: change.user.id, is_active: change.value }
          : { id: change.user.id, role: change.value },
      ).unwrap();
      toast.success("Saved. They've been signed out so the change applies.");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground block">Role</span>
          <NativeSelect
            value={filters.role ?? ""}
            onChange={(e) =>
              setFilter({ role: (e.target.value || undefined) as AdminUsersQuery["role"] })
            }
          >
            <NativeSelectOption value="">All roles</NativeSelectOption>
            <NativeSelectOption value="student">Students</NativeSelectOption>
            <NativeSelectOption value="mentor">Mentors</NativeSelectOption>
            <NativeSelectOption value="admin">Admins</NativeSelectOption>
          </NativeSelect>
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground block">Status</span>
          <NativeSelect
            value={filters.status ?? ""}
            onChange={(e) =>
              setFilter({ status: (e.target.value || undefined) as AdminUsersQuery["status"] })
            }
          >
            <NativeSelectOption value="">Any status</NativeSelectOption>
            <NativeSelectOption value="active">Active</NativeSelectOption>
            <NativeSelectOption value="inactive">Deactivated</NativeSelectOption>
          </NativeSelect>
        </label>
        {query.data ? (
          <p className="text-muted-foreground ml-auto text-sm" aria-live="polite">
            {total.toLocaleString()} {total === 1 ? "account" : "accounts"}
          </p>
        ) : null}
      </div>

      {query.isError ? (
        <ErrorState
          error={query.error}
          title="Couldn't load users"
          onRetry={() => void query.refetch()}
        />
      ) : (
        <UsersTable
          users={query.data?.users ?? []}
          loading={query.isLoading}
          currentUserId={session.status === "authenticated" ? session.user.id : undefined}
          onChange={apply}
        />
      )}

      {pages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground tabular-nums">
            Accounts {(filters.page - 1) * PAGE_SIZE + 1}–
            {Math.min(filters.page * PAGE_SIZE, total)} of {total}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous 100 accounts"
            disabled={filters.page <= 1 || query.isFetching}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next 100 accounts"
            disabled={filters.page >= pages || query.isFetching}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
          >
            <ChevronRight />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
