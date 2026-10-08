"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/avatar";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent } from "@/components/shadcn/card";
import { Skeleton } from "@/components/shadcn/skeleton";
import { Loading } from "@/components/ui/Skeleton";
import { useSession } from "@/lib/auth/useSession";
import { ProfileForm } from "./ProfileForm";

const METHOD: Record<string, string> = {
  password: "Email and password",
  google: "Google",
  github: "GitHub",
};

function DetailsSkeleton() {
  return (
    <Loading label="Loading your details…">
      <Skeleton className="h-96 rounded-xl" aria-hidden />
    </Loading>
  );
}

/** /profile — one simple card: who you are, then your details as a plain list. */
export function ProfileDetails() {
  const session = useSession();
  const [editing, setEditing] = useState(false);

  if (session.status === "loading") return <DetailsSkeleton />;
  if (session.status !== "authenticated") return null;
  const { user } = session;

  if (editing) return <ProfileForm user={user} onDone={() => setEditing(false)} />;

  const p = user.profile;
  // How this session started, and every way the account can sign in.
  const signIn = user as typeof user & {
    last_login_method?: "password" | "google" | "github" | null;
    sign_in_methods?: { password: boolean; google: boolean; github: boolean };
  };
  const methods = signIn.sign_in_methods;
  const linked = methods
    ? (["password", "google", "github"] as const).filter((m) => methods[m]).map((m) => METHOD[m])
    : [METHOD[user.auth_provider === "local" ? "password" : user.auth_provider]];
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
  const initials = `${user.first_name[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();
  const rows: [string, string | null][] = [
    ["Target role", p.target_role ?? null],
    ["College", p.college ?? null],
    ["Degree", [p.degree, p.branch].filter(Boolean).join(" · ") || null],
    ["Year of study", p.student_year ? `Year ${p.student_year}` : null],
    ["Graduating", p.graduation_year ? String(p.graduation_year) : null],
    ["Mobile", p.mobile_no ?? null],
    ["Location", p.location ?? null],
    ["Skills", p.skills?.length ? p.skills.join(", ") : null],
    ["Goals", p.goals?.length ? p.goals.join(", ") : null],
    ["Member since", new Date(user.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })],
    ["Signed in with", signIn.last_login_method ? METHOD[signIn.last_login_method] : null],
    ["Sign-in methods", linked.join(", ") || null],
  ];

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="size-14 rounded-full">
            {user.profile_image_url ? <AvatarImage src={user.profile_image_url} alt="" /> : null}
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="text-foreground text-lg font-semibold">{name}</h2>
            <p className="text-muted-foreground truncate text-sm">{user.email}</p>
          </div>
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil />
            Edit profile
          </Button>
        </div>

        <dl className="divide-y border-t">
          {rows.map(([label, value]) => (
            <div key={label} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr]">
              <dt className="text-muted-foreground text-sm">{label}</dt>
              <dd className={value ? "text-sm font-medium" : "text-muted-foreground text-sm"}>
                {value ?? "Not set"}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
