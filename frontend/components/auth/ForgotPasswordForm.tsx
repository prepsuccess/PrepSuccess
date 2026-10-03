"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Input, PasswordInput } from "@/components/ui/form";
import { useForgotPasswordMutation, useResetPasswordMutation } from "@/lib/api/endpoints/auth";
import { errorMessage } from "@/lib/api/errors";
import { homeFor } from "@/lib/auth/session";
import { useStartSession } from "@/lib/auth/useSession";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { track } from "@/lib/analytics";
import { isValid, validateEmail, validateNewPassword, validateOtp } from "@/lib/utils/validation";

const RESEND_SECONDS = 60;

type ResetErrors = { otp?: string; password?: string };

/**
 * Two steps: email, then the 6-digit code plus a new password. The backend
 * answers the first step the same way for every email, so this form never
 * says whether an account exists. A successful reset signs the student in.
 */
export function ForgotPasswordForm({ initialEmail = "" }: { initialEmail?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState<string>();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ResetErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [forgot, { isLoading: sending }] = useForgotPasswordMutation();
  const [reset, { isLoading: resetting, isSuccess: done }] = useResetPasswordMutation();
  const submitting = sending || resetting || done;
  const startSession = useStartSession();
  const [resendIn, startResendTimer] = useCountdown(RESEND_SECONDS);

  async function sendCode() {
    setFormError(null);
    try {
      const res = await forgot({ email: email.trim() }).unwrap();
      setNotice(res.message);
      startResendTimer();
      setStep("reset");
    } catch (error) {
      setFormError(errorMessage(error));
    }
  }

  async function onEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateEmail(email);
    setEmailError(found);
    if (!found) await sendCode();
  }

  async function onResetSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found: ResetErrors = { otp: validateOtp(otp), password: validateNewPassword(password) };
    setErrors(found);
    setFormError(null);
    if (!isValid(found)) return;

    try {
      const session = await reset({ email: email.trim(), otp, password }).unwrap();
      startSession(session);
      track("password_reset_completed");
      router.replace(homeFor(session.user));
    } catch (error) {
      setFormError(errorMessage(error));
    }
  }

  if (step === "reset") {
    return (
      <form noValidate onSubmit={onResetSubmit} className="flex flex-col gap-5">
        {formError ? (
          <Alert tone="error">{formError}</Alert>
        ) : notice ? (
          <Alert tone="info">{notice}</Alert>
        ) : null}
        <Input
          label="Reset code"
          name="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          error={errors.otp}
          hint="Check your inbox and spam folder. The code expires in 10 minutes."
          className="text-[18px] tracking-[0.3em] tabular-nums"
          autoFocus
          required
        />
        <PasswordInput
          label="New password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint="At least 8 characters."
          required
        />
        <Button
          type="submit"
          label="Set new password"
          loading={submitting}
          fullWidth
          className="mt-2"
        />
        <div className="flex items-center justify-between text-[14px]">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setOtp("");
              setFormError(null);
            }}
            className="text-text hover:text-heading underline-offset-4 hover:underline"
          >
            Use another email
          </button>
          <button
            type="button"
            onClick={sendCode}
            disabled={resendIn > 0 || submitting}
            className="text-heading disabled:text-text-dim underline-offset-4 hover:underline disabled:no-underline"
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form noValidate onSubmit={onEmailSubmit} className="flex flex-col gap-5">
      {formError ? <Alert tone="error">{formError}</Alert> : null}
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@college.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
        hint="We'll email you a 6-digit code to set a new password."
        required
      />
      <Button type="submit" label="Send reset code" loading={sending} fullWidth className="mt-2" />
    </form>
  );
}
