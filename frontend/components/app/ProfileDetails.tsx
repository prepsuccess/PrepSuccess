"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/auth/useSession";
import { ProfileForm } from "./ProfileForm";

const list = (items: string[] | undefined) => (items?.length ? items.join(", ") : null);

export function ProfileDetails() {
  const session = useSession();
  const [editing, setEditing] = useState(false);
  if (session.status !== "authenticated") return null;
  const { user } = session;

  if (editing) return <ProfileForm user={user} onDone={() => setEditing(false)} />;

  const p = user.profile;
  const education = [p.degree, p.branch].filter(Boolean).join(" · ");
  const rows: [string, string | null][] = [
    ["Name", [user.first_name, user.last_name].filter(Boolean).join(" ")],
    ["Email", user.email],
    ["College", p.college ?? null],
    ["Degree", education || null],
    ["Year of study", p.student_year ? `Year ${p.student_year}` : null],
    ["Graduating", p.graduation_year ? String(p.graduation_year) : null],
    ["Target role", p.target_role ?? null],
    ["Mobile", p.mobile_no ?? null],
    ["Location", p.location ?? null],
    ["Skills", list(p.skills)],
    ["Goals", list(p.goals)],
    ["Member since", new Date(user.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })],
  ];

  return (
    <div className="flex flex-col gap-4">
      <dl className="card divide-border divide-y">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-[200px_1fr]">
            <dt className="text-text-dim text-[14px]">{label}</dt>
            <dd className={value ? "text-heading text-[15px]" : "text-text-dim text-[15px]"}>
              {value ?? "Not set"}
            </dd>
          </div>
        ))}
      </dl>
      <div>
        <Button label="Edit details" variant="secondary" onClick={() => setEditing(true)} />
      </div>
    </div>
  );
}
