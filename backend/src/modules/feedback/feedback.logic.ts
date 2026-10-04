/**
 * Pure rules for student feedback: screenshot decoding and checks, the app
 * path, and what an admin's change means for the student. No database, no
 * env, so the OpenAPI export and unit tests can import it.
 */

export const MESSAGE_MIN_CHARS = 10;
export const MESSAGE_MAX_CHARS = 2000;
export const REMARK_MAX_CHARS = 1000;
export const PAGE_MAX_CHARS = 300;
export const IMAGES_MAX = 3;
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
/** Submissions per student per rolling hour. */
export const SUBMISSIONS_PER_HOUR = 5;
/** Longest data URL worth decoding: 2 MB as base64, plus the header. */
export const DATA_URL_MAX_CHARS = Math.ceil(IMAGE_MAX_BYTES / 3) * 4 + 100;

export type ImageMime = "image/png" | "image/jpeg" | "image/webp";

const EXTENSIONS: Record<ImageMime, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export const extensionOf = (mime: ImageMime) => EXTENSIONS[mime];

/**
 * Splits `data:image/png;base64,....` into the declared type and the bytes.
 * Null when it isn't a base64 data URL for one of the allowed types.
 */
export function parseDataUrl(dataUrl: string): { declared: ImageMime; bytes: Buffer } | null {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]*={0,2})$/.exec(dataUrl);
  if (!match || match[2]!.length % 4 !== 0) return null;
  return { declared: match[1] as ImageMime, bytes: Buffer.from(match[2]!, "base64") };
}

/** The real type from the file's first bytes. The declared type is never trusted. */
export function detectImageMime(bytes: Uint8Array): ImageMime | null {
  const starts = (offset: number, signature: number[]) =>
    bytes.length >= offset + signature.length &&
    signature.every((byte, i) => bytes[offset + i] === byte);
  if (starts(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (starts(0, [0xff, 0xd8, 0xff])) return "image/jpeg";
  // RIFF....WEBP
  if (starts(0, [0x52, 0x49, 0x46, 0x46]) && starts(8, [0x57, 0x45, 0x42, 0x50])) {
    return "image/webp";
  }
  return null;
}

export type DecodedImage =
  { ok: true; mime: ImageMime; bytes: Buffer } | { ok: false; message: string };

/** Decodes and checks one screenshot: base64 data URL, at most 2 MB, really a PNG/JPEG/WebP. */
export function decodeImage(dataUrl: string): DecodedImage {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return { ok: false, message: "Attach a PNG, JPEG or WebP image." };
  if (parsed.bytes.length === 0) return { ok: false, message: "That image is empty." };
  if (parsed.bytes.length > IMAGE_MAX_BYTES) {
    return { ok: false, message: "Each image must be 2 MB or smaller." };
  }
  const mime = detectImageMime(parsed.bytes);
  if (!mime) return { ok: false, message: "That file isn't a PNG, JPEG or WebP image." };
  return { ok: true, mime, bytes: parsed.bytes };
}

/**
 * The app path the student was on, or null. Only same-app paths ("/..."),
 * never "//host" or full URLs, since admins open it as a link.
 */
export function cleanPage(page: string | null | undefined): string | null {
  const value = page?.trim();
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.length > PAGE_MAX_CHARS) return null;
  return value;
}

/** Attachment name for the email: the student's file name, or feedback-<n>.<ext>. */
export function attachmentName(name: string | undefined, index: number, mime: ImageMime) {
  const ext = extensionOf(mime);
  const base = name
    ?.trim()
    .replace(/\.[^.]*$/, "")
    .replace(/[^\w.-]+/g, "-")
    .slice(0, 80);
  return `${base || `feedback-${index + 1}`}.${ext}`;
}

/** Where team emails go: FEEDBACK_EMAIL, else the SMTP account. Null when neither is set. */
export function feedbackRecipient(feedbackEmail?: string, smtpUser?: string): string | null {
  return feedbackEmail || smtpUser || null;
}

export const CATEGORY_LABELS = {
  BUG: "Bug",
  IDEA: "Idea",
  CONTENT: "Content",
  OTHER: "Other",
} as const;

export type FeedbackStatusValue = "OPEN" | "IN_PROGRESS" | "SOLVED";

export interface FeedbackState {
  status: FeedbackStatusValue;
  adminRemark: string | null;
  resolvedAt: Date | null;
}

export interface FeedbackChange {
  status?: FeedbackStatusValue;
  /** Null (or blank) clears the remark. */
  adminRemark?: string | null;
}

export interface FeedbackUpdatePlan {
  /** Fields to write; empty when nothing changed. */
  data: {
    status?: FeedbackStatusValue;
    adminRemark?: string | null;
    remarkedById?: string;
    resolvedAt?: Date | null;
  };
  /** What to tell the student, or null when nothing they'd see changed. */
  notification: { title: string; body: string | null } | null;
}

const NOTIFICATION_BODY_MAX = 300;

/**
 * Works out an admin's PATCH: only real changes are written. A new remark
 * records who wrote it; becoming SOLVED stamps resolvedAt, leaving SOLVED clears it.
 * The student is notified when the status changes or a remark is added or edited.
 */
export function planFeedbackUpdate(
  current: FeedbackState,
  change: FeedbackChange,
  adminId: string,
  now = new Date(),
): FeedbackUpdatePlan {
  const data: FeedbackUpdatePlan["data"] = {};

  const statusChanged = change.status !== undefined && change.status !== current.status;
  if (statusChanged) {
    data.status = change.status;
    if (change.status === "SOLVED") data.resolvedAt = now;
    else if (current.status === "SOLVED") data.resolvedAt = null;
  }

  const remark = change.adminRemark === undefined ? undefined : change.adminRemark?.trim() || null;
  const remarkChanged = remark !== undefined && remark !== current.adminRemark;
  if (remarkChanged) {
    data.adminRemark = remark;
    data.remarkedById = adminId;
  }

  // Clearing a remark on its own isn't news for the student.
  if (!statusChanged && (!remarkChanged || remark === null)) return { data, notification: null };

  const status = data.status ?? current.status;
  const latestRemark = remarkChanged ? remark : current.adminRemark;
  let title: string;
  if (statusChanged && status === "SOLVED") title = "Your feedback was marked solved";
  else if (remarkChanged && remark) title = "We replied to your feedback";
  else if (status === "IN_PROGRESS") title = "Your feedback is in progress";
  else title = "Your feedback was reopened";

  return {
    data,
    notification: {
      title,
      body: latestRemark ? latestRemark.slice(0, NOTIFICATION_BODY_MAX) : null,
    },
  };
}
