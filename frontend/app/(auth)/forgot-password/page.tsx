import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Underlined } from "@/components/ui/Annotation";

export const metadata: Metadata = { title: "Reset your password — PrepSuccess" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { email } = await searchParams;
  return (
    <AuthCard
      eyebrow="it happens"
      title={
        <>
          Reset your{" "}
          <Underlined now delay={0.4}>
            password
          </Underlined>
          .
        </>
      }
      description="Signed up with Google? This also lets you add a password to your account."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-heading font-medium underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm initialEmail={typeof email === "string" ? email : ""} />
    </AuthCard>
  );
}
