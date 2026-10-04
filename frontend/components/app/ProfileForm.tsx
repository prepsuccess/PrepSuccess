"use client";

import { useState, type FormEvent } from "react";
import { CircleAlert, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn/alert";
import { Button } from "@/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { SelectField, TextField } from "./form-fields";
import { useUpdateMeMutation } from "@/lib/api/endpoints/users";
import { errorMessage, fieldErrors } from "@/lib/api/errors";
import type { AuthUser, UpdateMeRequest } from "@/lib/api/types";
import { isValid, validateRequired } from "@/lib/utils/validation";

// The dropdown can't hold an empty value, so "Not set" uses this stand-in; it's stored as "".
const NOT_SET = "none";

const yearOptions = [
  { value: NOT_SET, label: "Not set" },
  ...[1, 2, 3, 4, 5, 6].map((year) => ({
    value: String(year),
    label: year >= 5 ? `Year ${year} / other` : `Year ${year}`,
  })),
];

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

const FORM_FIELDS = new Set<string>([
  ...TEXT_FIELDS,
  "first_name",
  "last_name",
  "student_year",
  "graduation_year",
]);

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
function toPayload(v: Values): UpdateMeRequest {
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
  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();

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

    try {
      // The mutation writes the updated user into the cache, so the details view refreshes itself.
      await updateMe(toPayload(values)).unwrap();
      toast.success("Profile saved");
      onDone();
    } catch (error) {
      // Server-side validation lands on the matching field; anything else goes in
      // the banner, including issues with fields this form doesn't show.
      const issues = Object.entries(fieldErrors(error));
      const shown = issues.filter(([name]) => FORM_FIELDS.has(name));
      const hidden = issues.filter(([name]) => !FORM_FIELDS.has(name));
      setErrors(Object.fromEntries(shown) as Errors);
      if (shown.length === 0 || hidden.length > 0) {
        setFormError(hidden[0]?.[1] ?? errorMessage(error));
      }
    }
  }

  return (
    <Card>
      <form
        noValidate
        onSubmit={onSubmit}
        aria-labelledby="profile-form-title"
        className="flex flex-col gap-(--card-spacing)"
      >
        <CardHeader>
          <CardTitle id="profile-form-title">Edit details</CardTitle>
          <CardDescription>
            Leave a box empty to remove it. Skills and goals come from your onboarding chat.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {formError ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>Couldn&apos;t save your details</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            <TextField
              label="First name"
              autoComplete="given-name"
              required
              {...field("first_name")}
            />
            <TextField label="Last name" autoComplete="family-name" {...field("last_name")} />
            <TextField label="College" autoComplete="organization" {...field("college")} />
            <TextField label="Degree" placeholder="e.g. BCA, B.Tech" {...field("degree")} />
            <TextField
              label="Branch"
              placeholder="e.g. Computer Applications"
              {...field("branch")}
            />
            <SelectField
              label="Year of study"
              placeholder="Choose your year"
              options={yearOptions}
              {...field("student_year")}
              onChange={(e) =>
                setValues((current) => ({
                  ...current,
                  student_year: e.target.value === NOT_SET ? "" : e.target.value,
                }))
              }
            />
            <TextField
              label="Graduation year"
              inputMode="numeric"
              placeholder="e.g. 2027"
              {...field("graduation_year")}
            />
            <TextField
              label="Target role"
              placeholder="e.g. SDE, Data Analyst"
              {...field("target_role")}
            />
            <TextField
              label="Mobile"
              type="tel"
              autoComplete="tel"
              placeholder="e.g. +91 98765 43210"
              {...field("mobile_no")}
            />
            <TextField
              label="Location"
              autoComplete="address-level2"
              placeholder="e.g. Bengaluru"
              {...field("location")}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="button" variant="outline" onClick={onDone} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} aria-busy={saving || undefined}>
            {saving ? <Loader2 className="animate-spin" aria-hidden /> : null}
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
