"use client";

import { useId, useRef, useState, type ClipboardEvent, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CircleAlert, ImagePlus, Loader2, MessageSquarePlus, X } from "lucide-react";
import { SelectField, TextareaField } from "@/components/app/form-fields";
import { Alert, AlertDescription } from "@/components/shadcn/alert";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { showNotice } from "@/components/ui/AppToaster";
import {
  FEEDBACK_MAX_IMAGES,
  FEEDBACK_MESSAGE_MAX,
  FEEDBACK_MESSAGE_MIN,
  useSendFeedbackMutation,
  type FeedbackCategory,
} from "@/lib/api/endpoints/feedback";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { track } from "@/lib/analytics";
import {
  formatBytes,
  ImageError,
  IMAGE_TYPES,
  prepareImage,
  splitImages,
  type PreparedImage,
} from "@/lib/utils/images";
import { cn } from "@/lib/utils/cn";
import { CATEGORIES } from "./meta";

const RATE_LIMITED = "You've sent a lot of feedback this hour. Try again later.";
const TOO_BIG = "Those images are too big. Try fewer or smaller ones.";

interface Errors {
  category?: string;
  message?: string;
  /** About the images as a whole. */
  images?: string;
  /** About one image, by its position. */
  imageAt?: Record<number, string>;
  /** Anything else (shown above the buttons). */
  form?: string;
}

/** The errors with these fields cleared. */
const without = (errors: Errors, ...keys: (keyof Errors)[]): Errors =>
  Object.fromEntries(Object.entries(errors).filter(([key]) => !keys.includes(key as keyof Errors)));

/** A 422's details as field errors; paths come as ["images", 1] or "images.1". */
function toErrors(details: unknown[]): Errors {
  const errors: Errors = {};
  for (const issue of details) {
    const { path, message } = (issue ?? {}) as { path?: unknown; message?: string };
    if (!message) continue;
    const parts = Array.isArray(path) ? path.map(String) : String(path ?? "").split(".");
    const [field, index] = parts;
    if (field === "message" || field === "category") errors[field] ??= message;
    else if (field === "images" && index !== undefined && /^\d+$/.test(index)) {
      errors.imageAt = { ...errors.imageAt, [Number(index)]: message };
    } else if (field === "images") errors.images ??= message;
    else errors.form ??= message;
  }
  return errors;
}

/**
 * "Send feedback": a category, a message and up to three screenshots (picked
 * or pasted with Ctrl+V). Big images are shrunk in the browser first. The
 * draft survives closing the dialog; it clears once sent.
 */
export function FeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [send, { isLoading: sending }] = useSendFeedbackMutation();
  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<PreparedImage[]>([]);
  const [processing, setProcessing] = useState(0);
  const [pickError, setPickError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const fileInput = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const ids = useId();

  const count = message.trim().length;
  const room = FEEDBACK_MAX_IMAGES - images.length - processing;

  async function addFiles(files: File[]) {
    setErrors((e) => without(e, "imageAt", "images"));
    const { images: picked, rejected } = splitImages(files);
    const problems: string[] = [];
    if (rejected) problems.push("Only PNG, JPEG or WebP images can be added.");
    if (picked.length > room) {
      problems.push(`You can add up to ${FEEDBACK_MAX_IMAGES} images.`);
    }
    const accepted = picked.slice(0, Math.max(0, room));
    setProcessing((n) => n + accepted.length);
    await Promise.all(
      accepted.map(async (file) => {
        try {
          const image = await prepareImage(file);
          setImages((list) => [...list, image].slice(0, FEEDBACK_MAX_IMAGES));
        } catch (error) {
          problems.push(error instanceof ImageError ? error.message : "Couldn't add that image.");
        } finally {
          setProcessing((n) => n - 1);
        }
      }),
    );
    setPickError(problems.length ? problems.join(" ") : null);
  }

  function onPaste(event: ClipboardEvent) {
    const files = Array.from(event.clipboardData?.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!files.length) return;
    event.preventDefault();
    void addFiles(files);
  }

  function reset() {
    setCategory("");
    setMessage("");
    setImages([]);
    setPickError(null);
    setErrors({});
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const local: Errors = {};
    if (!category) local.category = "Pick what this is about.";
    if (count < FEEDBACK_MESSAGE_MIN) {
      local.message = `Tell us a bit more: at least ${FEEDBACK_MESSAGE_MIN} characters.`;
    }
    setErrors(local);
    if (local.category || local.message) {
      if (local.category) document.getElementById(`${ids}-category`)?.focus();
      else messageRef.current?.focus();
      return;
    }
    try {
      await send({
        category: category as FeedbackCategory,
        message: message.trim(),
        page: pathname,
        ...(images.length ? { images: images.map(({ name, data }) => ({ name, data })) } : {}),
      }).unwrap();
      track("feedback_sent", { category: category as FeedbackCategory, images: images.length });
      reset();
      onOpenChange(false);
      showNotice({
        title: "Thanks! We got your feedback.",
        body: "We'll reply on your feedback page.",
        action:
          pathname === "/feedback"
            ? undefined
            : { label: "See your feedback", onClick: () => router.push("/feedback") },
      });
    } catch (error) {
      if (isApiError(error) && error.status === 429) setErrors({ form: RATE_LIMITED });
      else if (isApiError(error) && error.status === 413) setErrors({ images: TOO_BIG });
      else if (isApiError(error) && error.code === "VALIDATION_ERROR") {
        const fields = toErrors(error.details);
        setErrors(Object.keys(fields).length ? fields : { form: errorMessage(error) });
      } else setErrors({ form: errorMessage(error) });
    }
  }

  const busy = sending || processing > 0;
  const imagesHelpId = `${ids}-images-help`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg" onPaste={onPaste}>
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>
            Found a bug, have an idea or spotted a mistake? Tell us. We read every message.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={submit} className="space-y-5">
          <SelectField
            id={`${ids}-category`}
            label="What's it about?"
            placeholder="Pick one"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as FeedbackCategory);
              setErrors((e) => without(e, "category"));
            }}
            options={CATEGORIES.map(({ value, label }) => ({ value, label }))}
            error={errors.category}
            required
          />

          <TextareaField
            ref={messageRef}
            label="Your message"
            rows={5}
            maxLength={FEEDBACK_MESSAGE_MAX}
            value={message}
            placeholder="What happened, or what would make PrepSuccess better?"
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors((e) => without(e, "message"));
            }}
            error={errors.message}
            description={`${count} / ${FEEDBACK_MESSAGE_MAX} characters (at least ${FEEDBACK_MESSAGE_MIN})`}
            className="max-h-64"
            // Required, but without the asterisk: the category above has none either.
            aria-required
          />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-sm font-medium">Screenshots</span>
              <span id={imagesHelpId} className="text-muted-foreground text-xs">
                Optional. Up to {FEEDBACK_MAX_IMAGES}. You can also paste one with Ctrl+V.
              </span>
            </div>
            {images.length || processing ? (
              <ul
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                aria-label="Screenshots to send"
              >
                {images.map((image, i) => (
                  <li key={image.id} className="min-w-0">
                    <div className="relative">
                      {/* A local data URL, not a remote image. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.data}
                        alt={`Screenshot ${i + 1}: ${image.name}`}
                        className={cn(
                          "bg-muted aspect-video w-full rounded-lg border object-cover",
                          errors.imageAt?.[i] && "border-destructive",
                        )}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon-sm"
                        aria-label={`Remove ${image.name}`}
                        onClick={() => {
                          setImages((list) => list.filter((item) => item.id !== image.id));
                          setErrors((e) => without(e, "imageAt"));
                          setPickError(null);
                        }}
                        className="absolute top-1 right-1 rounded-full shadow-sm"
                      >
                        <X />
                      </Button>
                    </div>
                    <p className="text-muted-foreground mt-1 truncate text-xs" title={image.name}>
                      {formatBytes(image.size)} · {image.name}
                    </p>
                    {errors.imageAt?.[i] ? (
                      <p className="text-destructive mt-0.5 text-xs">{errors.imageAt[i]}</p>
                    ) : null}
                  </li>
                ))}
                {Array.from({ length: processing }, (_, i) => (
                  <li
                    key={`processing-${i}`}
                    className="bg-muted text-muted-foreground flex aspect-video items-center justify-center rounded-lg border text-xs"
                  >
                    <Loader2 className="mr-1 size-3.5 animate-spin" aria-hidden />
                    Adding…
                  </li>
                ))}
              </ul>
            ) : null}
            {room > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-describedby={imagesHelpId}
                onClick={() => fileInput.current?.click()}
              >
                <ImagePlus />
                Add screenshot
              </Button>
            ) : null}
            <input
              ref={fileInput}
              type="file"
              accept={IMAGE_TYPES.join(",")}
              multiple
              tabIndex={-1}
              aria-label="Choose screenshots"
              className="sr-only"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                if (files.length) void addFiles(files);
              }}
            />
            <div aria-live="polite">
              {pickError || errors.images ? (
                <p className="text-destructive text-sm">{errors.images ?? pickError}</p>
              ) : null}
            </div>
          </div>

          {errors.form ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy} aria-busy={sending || undefined}>
              {sending ? <Loader2 className="animate-spin" aria-hidden /> : null}
              Send feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** A "Send feedback" button that opens the dialog (mounted on first use; it keeps the draft after). */
export function SendFeedbackButton({
  label = "Send feedback",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onClick" | "children"> & { label?: string }) {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);
  return (
    <>
      <Button
        {...props}
        onClick={() => {
          setUsed(true);
          setOpen(true);
        }}
      >
        <MessageSquarePlus />
        {label}
      </Button>
      {used ? <FeedbackDialog open={open} onOpenChange={setOpen} /> : null}
    </>
  );
}
