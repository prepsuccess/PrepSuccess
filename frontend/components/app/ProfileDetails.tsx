"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Skeleton } from "@/components/shadcn/skeleton";
import { Loading } from "@/components/ui/Skeleton";
import { useSession } from "@/lib/auth/useSession";
import { ProfileForm } from "./ProfileForm";

function DetailsSkeleton() {
  return (
    <Loading label="Loading your details…">
      <Card aria-hidden>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="divide-y">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="grid gap-2 py-3 sm:grid-cols-[180px_1fr]">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </CardContent>
      </Card>
    </Loading>
  );
}

export function ProfileDetails() {
  const session = useSession();
  const [editing, setEditing] = useState(false);

  if (session.status === "loading") return <DetailsSkeleton />;
  if (session.status !== "authenticated") return null;
  const { user } = session;

  if (editing) return <ProfileForm user={user} onDone={() => setEditing(false)} />;

  const p = user.profile;
  const rows: [string, string | null][] = [
    ["Name", [user.first_name, user.last_name].filter(Boolean).join(" ")],
    ["Email", user.email],
    ["College", p.college ?? null],
    ["Degree", [p.degree, p.branch].filter(Boolean).join(" · ") || null],
    ["Year of study", p.student_year ? `Year ${p.student_year}` : null],
    ["Graduating", p.graduation_year ? String(p.graduation_year) : null],
    ["Target role", p.target_role ?? null],
    ["Mobile", p.mobile_no ?? null],
    ["Location", p.location ?? null],
    ["Member since", new Date(user.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })],
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
          <CardDescription>Used to tailor your skill checks and next steps.</CardDescription>
          <CardAction>
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil />
              Edit details
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
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

      {p.skills?.length || p.goals?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>From your onboarding chat</CardTitle>
            <CardDescription>
              What you told the AI coach. Update it in your next chat.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {p.skills?.length ? (
              <div>
                <p className="text-muted-foreground mb-2 text-sm">Skills you claimed</p>
                <ul className="flex flex-wrap gap-2">
                  {p.skills.map((skill) => (
                    <li key={skill}>
                      <Badge variant="secondary">{skill}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {p.goals?.length ? (
              <div>
                <p className="text-muted-foreground mb-2 text-sm">Goals</p>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {p.goals.map((goal) => (
                    <li key={goal}>{goal}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
