"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/form";
import type { AuthUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { updateMe, type UpdateMePayload } from "@/lib/api/users";
import { updateSessionUser } from "@/lib/auth/useSession";
import { isValid, validateRequired } from "@/lib/utils/validation";

const yearOptions = [1, 2, 3, 4, 5, 6].map((year) => ({
  value: String(year),
  label: year >= 5 ? `Year ${year} / other` : `Year ${year}`,
}));

// Text profile fields this form edits. Skills, goals and the rest come from the onboarding chat.
const TEXT_FIELDS = [
  "college",
  "degree",
  "branch",
  "target_role",
  "mobile_no",
  "location",
] as const;
type TextField = (typeof TEXT_FIELDS)[number];

type Values = Record<
  TextField | "first_name" | "last_name" | "student_year" | "graduation_year",
  string
>;
type Errors = Partial<Record<keyof Values, string>>;

const PHONE = /^\+?\d[\d\s-]{6,18}\d$/;

function initialValues(user: AuthUser): Values {
  const p = user.profile;
  return {
    first_name: user.first_name,
    last_name: user.last_name ?? "",
    college: p.college ?? "",
    degree: p.degree ?? "",
    branch: p.branch ?? "",
    student_year: p.student_year ? String(p.student_year) : "",
    graduation_year: p.graduation_year ? String(p.graduation_year) : "",
    target_role: p.target_role ?? "",
    mobile_no: p.mobile_no ?? "",
    location: p.location ?? "",
  };
}

function validate(v: Values): Errors {
  const gradYear = v.graduation_year.trim();
  return {
    first_name: validateRequired(v.first_name, "Enter your first name."),
    mobile_no:
      v.mobile_no.trim() && !PHONE.test(v.mobile_no.trim())
        ? "Enter a valid phone number."
        : undefined,
    graduation_year:
      gradYear && !/^20\d{2}$/.test(gradYear) ? "Enter a year like 2027." : undefined,
  };
}

/** Empty inputs clear the field (`null`), so a student can remove what they no longer want shown. */
function toPayload(v: Values): UpdateMePayload {
  const text = (value: string) => value.trim() || null;
  const number = (value: string) => (value.trim() ? Number(value) : null);
  return {
    first_name: v.first_name.trim(),
    last_name: text(v.last_name),
    profile: {
      ...Object.fromEntries(TEXT_FIELDS.map((field) => [field, text(v[field])])),
      student_year: number(v.student_year),
      graduation_year: number(v.graduation_year),
    },
  };
}

export function ProfileForm({ user, onDone }: { user: AuthUser; onDone: () => void }) {
  const [values, setValues] = useState(() => initialValues(user));
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const field = (name: keyof Values) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (e: { target: { value: string } }) =>
      setValues((current) => ({ ...current, [name]: e.target.value })),
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setFormError(null);
    if (!isValid(found)) return;

    setSaving(true);
    try {
      updateSessionUser(await updateMe(toPayload(values)));
      onDone();
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "Couldn't reach PrepSuccess. Try again.",
      );
      setSaving(false);
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className="card flex flex-col gap-5 p-5 sm:p-6">
      {formError ? <Alert tone="error">{formError}</Alert> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="First name" autoComplete="given-name" required {...field("first_name")} />
        <Input label="Last name" autoComplete="family-name" {...field("last_name")} />
        <Input label="College" autoComplete="organization" {...field("college")} />
        <Input label="Degree" placeholder="BCA, B.Tech, …" {...field("degree")} />
        <Input label="Branch" placeholder="Computer Applications" {...field("branch")} />
        <Select
          label="Year of study"
          placeholder="Choose your year"
          options={yearOptions}
          {...field("student_year")}
        />
        <Input
          label="Graduation year"
          inputMode="numeric"
          placeholder="2027"
          {...field("graduation_year")}
        />
        <Input label="Target role" placeholder="SDE, Data Analyst, …" {...field("target_role")} />
        <Input
          label="Mobile"
          type="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          {...field("mobile_no")}
        />
        <Input
          label="Location"
          autoComplete="address-level2"
          placeholder="Bengaluru"
          {...field("location")}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" label="Save changes" loading={saving} noArrow />
        <Button label="Cancel" variant="secondary" onClick={onDone} disabled={saving} />
      </div>
    </form>
  );
}
