"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { GoogleSignIn } from "@/components/auth/GoogleSignIn";
import { Input, PasswordInput } from "@/components/ui/form";
import { useLoginMutation } from "@/lib/api/endpoints/auth";
import { errorMessage } from "@/lib/api/errors";
import { homeFor, safeNext } from "@/lib/auth/session";
import { useStartSession } from "@/lib/auth/useSession";
import { isValid, validateEmail, validateRequired } from "@/lib/utils/validation";

type Errors = { email?: string; password?: string };

export function LoginForm({ next, error }: { next?: string; error?: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(error ?? null);
  const [login, { isLoading, isSuccess }] = useLoginMutation();
  // Stays true after success while the page navigates away.
  const submitting = isLoading || isSuccess;
  const startSession = useStartSession();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found: Errors = {
      email: validateEmail(email),
      password: validateRequired(password, "Enter your password."),
    };
    setErrors(found);
    setFormError(null);
    if (!isValid(found)) return;

    try {
      const session = await login({ email: email.trim(), password }).unwrap();
      startSession(session);
      router.replace(safeNext(next) ?? homeFor(session.user));
    } catch (error) {
      setFormError(errorMessage(error));
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <GoogleSignIn next={safeNext(next)} />
      {formError ? <Alert tone="error">{formError}</Alert> : null}
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@college.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />
      <PasswordInput
        label="Password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
      />
      <Button type="submit" label="Log in" loading={submitting} fullWidth className="mt-2" />
    </form>
  );
}
