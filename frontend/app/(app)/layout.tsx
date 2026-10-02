import { cookies } from "next/headers";
import { AppShell } from "@/components/shell/AppShell";
import { RequireAuth } from "@/components/shell/RequireAuth";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  // The shadcn sidebar remembers open/collapsed in this cookie; read it so the
  // server render matches and the sidebar doesn't jump on load.
  const defaultOpen = (await cookies()).get("sidebar_state")?.value !== "false";
  return (
    <RequireAuth roles={["student", "mentor"]}>
      <AppShell area="Student" navArea="student" defaultOpen={defaultOpen}>
        {children}
      </AppShell>
    </RequireAuth>
  );
}
