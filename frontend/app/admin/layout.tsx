import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AppShell } from "@/components/shell/AppShell";
import { RequireAuth } from "@/components/shell/RequireAuth";

export const metadata: Metadata = {
  title: { template: "%s — PrepSuccess Admin", default: "Admin — PrepSuccess" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const defaultOpen = (await cookies()).get("sidebar_state")?.value !== "false";
  return (
    <RequireAuth roles={["admin"]}>
      <AppShell area="Admin" navArea="admin" defaultOpen={defaultOpen}>
        {children}
      </AppShell>
    </RequireAuth>
  );
}
