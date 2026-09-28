import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { RequireAuth } from "@/components/shell/RequireAuth";
import { adminNav } from "@/components/shell/nav";

export const metadata: Metadata = {
  title: { template: "%s — PrepSuccess Admin", default: "Admin — PrepSuccess" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={["admin"]}>
      <AppShell area="Admin" nav={adminNav}>
        {children}
      </AppShell>
    </RequireAuth>
  );
}
