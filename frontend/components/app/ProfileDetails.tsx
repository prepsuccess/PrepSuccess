"use client";

import { useSession } from "@/lib/auth/useSession";

export function ProfileDetails() {
  const session = useSession();
  if (session.status !== "authenticated") return null;
  const { user } = session;

  const rows: [string, string][] = [
    ["Name", [user.first_name, user.last_name].filter(Boolean).join(" ")],
    ["Email", user.email],
    ["Year of study", user.student_year ? `Year ${user.student_year}` : "Not set"],
    ["Mobile", user.mobile_no ?? "Not set"],
    ["Member since", new Date(user.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })],
  ];

  return (
    <dl className="card divide-border divide-y">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-[200px_1fr]">
          <dt className="text-text-dim text-[14px]">{label}</dt>
          <dd className="text-heading text-[15px]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
