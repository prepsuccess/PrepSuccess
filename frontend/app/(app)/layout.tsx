import { AppShell } from "@/components/shell/AppShell";
import { RequireAuth } from "@/components/shell/RequireAuth";
import { studentNav } from "@/components/shell/nav";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={["student", "mentor"]}>
      <AppShell area="Student" nav={studentNav}>
        {children}
      </AppShell>
    </RequireAuth>
  );
}
