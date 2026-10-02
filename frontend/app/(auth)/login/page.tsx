import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { Underlined } from "@/components/ui/Annotation";
import { authErrorMessage } from "@/lib/auth/google";

export const metadata: Metadata = { title: "Log in — PrepSuccess" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { next, error } = await searchParams;

  return (
    <AuthCard
      eyebrow="welcome back"
      title={
        <>
          Pick up where you{" "}
          <Underlined now delay={0.4}>
            left off
          </Underlined>
          .
        </>
      }
      description="Log in to see your readiness score and next steps."
      footer={
        <>
          New to PrepSuccess?{" "}
          <Link href="/signup" className="text-heading font-medium underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm
        next={typeof next === "string" ? next : undefined}
        error={authErrorMessage(typeof error === "string" ? error : undefined)}
      />
    </AuthCard>
  );
}
