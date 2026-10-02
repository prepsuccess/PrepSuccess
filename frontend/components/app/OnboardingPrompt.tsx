"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { useSession } from "@/lib/auth/useSession";
import { cn } from "@/lib/utils/cn";

/** Dashboard nudge for students who left the onboarding chat before finishing. */
export function OnboardingPrompt({ className }: { className?: string }) {
  const session = useSession();
  if (
    session.status !== "authenticated" ||
    session.user.role !== "student" ||
    session.user.onboarding_completed
  ) {
    return null;
  }
  return (
    <Card className={cn("ring-primary/30", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="text-brand size-4" aria-hidden />
          Finish your onboarding chat
        </CardTitle>
        <CardDescription>
          A few quick questions, so your skill checks match what you know and the role you want.
        </CardDescription>
        <CardAction>
          <Button asChild size="sm">
            <Link href="/onboarding">Continue</Link>
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  );
}
