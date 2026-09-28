const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Enter your email.";
  if (!EMAIL.test(value.trim())) return "Enter a valid email, like name@college.edu.";
}

/** Matches the backend's rule (8–128 characters). */
export function validateNewPassword(value: string): string | undefined {
  if (value.length < 8) return "Use at least 8 characters.";
  if (value.length > 128) return "Use 128 characters or fewer.";
}

export function validateRequired(value: string, message: string): string | undefined {
  if (!value.trim()) return message;
}

export function validateOtp(value: string): string | undefined {
  if (!/^\d{6}$/.test(value)) return "Enter the 6-digit code from your email.";
}

/** True when no field has an error message. */
export function isValid(errors: Record<string, string | undefined>) {
  return Object.values(errors).every((message) => !message);
}
