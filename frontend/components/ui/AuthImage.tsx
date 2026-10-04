"use client";

import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/shadcn/skeleton";
import { API_BASE_URL } from "@/lib/api/config";
import { getAccessToken } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";

type State = { src: string; url: string | null; failed: boolean };

/**
 * An image the API only serves with the bearer token (e.g. feedback
 * screenshots), so a plain <img src> can't load it. Fetches it with the
 * token, shows it from an object URL (revoked when done), with a skeleton
 * while loading and a short message if it can't be loaded.
 */
export function AuthImage({
  src,
  alt,
  className,
  imgClassName,
}: {
  /** API path like /api/v1/feedback/{id}/images/{imageId}, or a full URL. */
  src: string;
  alt: string;
  /** Size and shape of the box (skeleton, image and error all fill it). */
  className?: string;
  imgClassName?: string;
}) {
  const [state, setState] = useState<State>({ src, url: null, failed: false });
  // A new src starts over; render-time reset keeps the old picture off screen.
  if (state.src !== src) setState({ src, url: null, failed: false });

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;
    const token = getAccessToken();
    fetch(src.startsWith("http") ? src : `${API_BASE_URL}${src}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setState({ src, url: objectUrl, failed: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ src, url: null, failed: true });
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (state.failed) {
    return (
      <span
        role="img"
        aria-label={`${alt} (couldn't load)`}
        className={cn(
          "bg-muted text-muted-foreground flex flex-col items-center justify-center gap-1 overflow-hidden rounded-lg p-2 text-center text-xs",
          className,
        )}
      >
        <ImageOff className="size-4 shrink-0" aria-hidden />
        <span aria-hidden>Couldn&apos;t load image</span>
      </span>
    );
  }
  if (!state.url) {
    return (
      <Skeleton
        role="img"
        aria-label={`${alt} (loading)`}
        className={cn("rounded-lg", className)}
      />
    );
  }
  return (
    // An object URL from fetch(), which next/image can't optimise.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={state.url}
      alt={alt}
      className={cn("rounded-lg object-cover", className, imgClassName)}
    />
  );
}
