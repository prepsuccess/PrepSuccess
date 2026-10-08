"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { GitHubSignIn } from "@/components/auth/GitHubSignIn";
import { GoogleSignIn } from "@/components/auth/GoogleSignIn";
import { SelectField } from "@/components/app/form-fields";
import { Checkbox, Input, PasswordInput } from "@/components/ui/form";
import { useRegisterMutation, useSendOtpMutation } from "@/lib/api/endpoints/auth";
import { errorMessage } from "@/lib/api/errors";
import { homeFor } from "@/lib/auth/session";
import { useStartSession } from "@/lib/auth/useSession";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { track } from "@/lib/analytics";
import {
  isValid,
  validateEmail,
  validateNewPassword,
  validateOtp,
  validateRequired,
} from "@/lib/utils/validation";

const RESEND_SECONDS = 60;

const yearOptions = [1, 2, 3, 4, 5].map((year) => ({
  value: String(year),
  label: year === 5 ? "5th year / other" : `Year ${year}`,
}));

type Details = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  year: string;
  terms: boolean;
};

type DetailErrors = Partial<Record<keyof Details, string>>;

/** Two steps: details, then the 6-digit code the backend emails before it creates the account. */
export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "verify">("details");
  const [details, setDetails] = useState<Details>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    year: "",
    terms: false,
  });
  const [errors, setErrors] = useState<DetailErrors>({});
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sendOtp, { isLoading: sendingCode }] = useSendOtpMutation();
  const [register, { isLoading: registering, isSuccess: registered }] = useRegisterMutation();
  // Stays true after a successful register while the page navigates away.
  const submitting = sendingCode || registering || registered;
  const startSession = useStartSession();
  const [resendIn, startResendTimer] = useCountdown(RESEND_SECONDS);

  const update = <K extends keyof Details>(key: K, value: Details[K]) =>
    setDetails((d) => ({ ...d, [key]: value }));

  async function sendCode() {
    setFormError(null);
    try {
      const res = await sendOtp({ email: details.email.trim() }).unwrap();
      setNotice(res.message);
      startResendTimer();
      setStep("verify");
    } catch (error) {
      setFormError(errorMessage(error));
    }
  }

  async function onDetailsSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found: DetailErrors = {
      firstName: validateRequired(details.firstName, "Enter your first name."),
      email: validateEmail(details.email),
      password: validateNewPassword(details.password),
      terms: details.terms ? undefined : "Please accept the terms to continue.",
    };
    setErrors(found);
    if (isValid(found)) await sendCode();
  }

  async function onVerifySubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateOtp(otp);
    setOtpError(found);
    setFormError(null);
    if (found) return;

    try {
      const session = await register({
        first_name: details.firstName.trim(),
        last_name: details.lastName.trim() || undefined,
        email: details.email.trim(),
        password: details.password,
        student_year: details.year ? Number(details.year) : undefined,
        otp,
      }).unwrap();
      startSession(session);
      track("signup_completed", { method: "email" });
      router.replace(homeFor(session.user));
    } catch (error) {
      setFormError(errorMessage(error));
    }
  }

  if (step === "verify") {
    return (
      <form noValidate onSubmit={onVerifySubmit} className="flex flex-col gap-5">
        {formError ? (
          <Alert tone="error">{formError}</Alert>
        ) : notice ? (
          <Alert tone="info">{notice}</Alert>
        ) : null}
        <Input
          label="Verification code"
          name="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          error={otpError}
          hint={`Sent to ${details.email.trim()}. It expires in a few minutes.`}
          className="text-[18px] tracking-[0.3em] tabular-nums"
          autoFocus
          required
        />
        <Button
          type="submit"
          label="Create account"
          loading={submitting}
          fullWidth
          className="mt-2"
        />
        <div className="flex items-center justify-between text-[14px]">
          <button
            type="button"
            onClick={() => {
              setStep("details");
              setOtp("");
              setFormError(null);
            }}
            className="text-text hover:text-heading underline-offset-4 hover:underline"
          >
            Change details
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
    <form noValidate onSubmit={onDetailsSubmit} className="flex flex-col gap-5">
      <GoogleSignIn
        label="Sign up with Google"
        also={<GitHubSignIn label="Sign up with GitHub" />}
      />
      {formError ? <Alert tone="error">{formError}</Alert> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="First name"
          name="firstName"
          autoComplete="given-name"
          value={details.firstName}
          onChange={(e) => update("firstName", e.target.value)}
          error={errors.firstName}
          required
        />
        <Input
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          value={details.lastName}
          onChange={(e) => update("lastName", e.target.value)}
        />
      </div>
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@college.edu"
        value={details.email}
        onChange={(e) => update("email", e.target.value)}
        error={errors.email}
        required
      />
      <PasswordInput
        label="Password"
        name="password"
        autoComplete="new-password"
        value={details.password}
        onChange={(e) => update("password", e.target.value)}
        error={errors.password}
        hint="At least 8 characters."
        required
      />
      <SelectField
        label="Year of study"
        name="year"
        placeholder="Choose your year"
        options={yearOptions}
        value={details.year}
        onChange={(e) => update("year", e.target.value)}
        description="Optional — helps the AI pitch your first checks."
      />
      <Checkbox
        name="terms"
        checked={details.terms}
        onChange={(e) => update("terms", e.target.checked)}
        error={errors.terms}
        label={
          <>
            I agree to the{" "}
            <Link href="/terms" className="text-heading underline underline-offset-2">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-heading underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </>
        }
      />
      <Button
        type="submit"
        label="Email me a code"
        loading={submitting}
        fullWidth
        className="mt-2"
      />
    </form>
  );
}
