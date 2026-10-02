import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";
import { Circled } from "@/components/ui/Annotation";

export const metadata: Metadata = { title: "Sign up — PrepSuccess" };

export default function SignupPage() {
  return (
    <AuthCard
      eyebrow="free to start"
      title={
        <>
          Find out where you{" "}
          <Circled now delay={0.4}>
            stand
          </Circled>
          .
        </>
      }
      description="Create your account, then chat with the AI to set up your profile."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-heading font-medium underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
