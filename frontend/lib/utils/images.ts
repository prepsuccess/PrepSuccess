/*
 * Screenshots for feedback: check the type, shrink big ones in the browser,
 * and turn them into data URLs for the API. The checks and sums are pure; only
 * `prepareImage` touches the DOM (FileReader, canvas).
 */

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
/** The server's limit per image, once decoded. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
/** JPEG and WebP files this small are sent as they are. */
export const KEEP_AS_IS_BYTES = 300 * 1024;
/** Longest side after resizing, in pixels. */
export const MAX_IMAGE_SIDE = 1600;
export const JPEG_QUALITY = 0.82;

export const isAllowedImage = (type: string) => (IMAGE_TYPES as readonly string[]).includes(type);

/** Small JPEG/WebP files are already fine; everything else is resized and re-encoded. */
export const needsCompression = (file: { type: string; size: number }) =>
  !((file.type === "image/jpeg" || file.type === "image/webp") && file.size <= KEEP_AS_IS_BYTES);

/** Scales width × height down (never up) so the longest side is at most `max`. */
export function fitWithin(width: number, height: number, max = MAX_IMAGE_SIDE) {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const scale = max / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** How many bytes a base64 data URL holds once decoded. */
export function dataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

/** "84 KB", "1.4 MB". */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** The image files in a pick or paste, and how many were something else. */
export function splitImages(files: Iterable<File>) {
  const images: File[] = [];
  let rejected = 0;
  for (const file of files) {
    if (isAllowedImage(file.type)) images.push(file);
    else rejected += 1;
  }
  return { images, rejected };
}

/** A screenshot ready to send: the data URL plus what to show for it. */
export interface PreparedImage {
  id: string;
  name: string;
  /** "data:image/jpeg;base64,..." — doubles as the thumbnail's src. */
  data: string;
  /** Decoded size in bytes. */
  size: number;
}

export class ImageError extends Error {}

function readAsDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

async function decode(file: File): Promise<{ source: CanvasImageSource; w: number; h: number }> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, w: bitmap.width, h: bitmap.height };
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { source: img, w: img.naturalWidth, h: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Resizes to MAX_IMAGE_SIDE and re-encodes as JPEG (on white, so transparency stays light). */
async function compress(file: File) {
  const { source, w, h } = await decode(file);
  const { width, height } = fitWithin(w, h);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new ImageError("Your browser couldn't process this image.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(source, 0, 0, width, height);
  if ("close" in source && typeof source.close === "function") source.close();
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

let nextId = 0;

/**
 * Turns a picked file into something the API accepts, or throws an
 * ImageError with a message to show the student.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!isAllowedImage(file.type)) {
    throw new ImageError(`${file.name || "That file"} isn't a PNG, JPEG or WebP image.`);
  }
  const shrink = needsCompression(file);
  let data: string;
  try {
    data = shrink ? await compress(file) : await readAsDataUrl(file);
  } catch (error) {
    if (error instanceof ImageError) throw error;
    throw new ImageError(`Couldn't read ${file.name || "that image"}. Try another file.`);
  }
  const size = dataUrlBytes(data);
  if (size > MAX_IMAGE_BYTES) {
    throw new ImageError(
      `${file.name || "That image"} is still over 2 MB after shrinking. Try a smaller screenshot.`,
    );
  }
  nextId += 1;
  const name = file.name || "screenshot.png";
  // Re-encoded files are JPEGs now; say so in the name.
  return {
    id: `img-${nextId}`,
    name: shrink ? name.replace(/\.\w+$/, "") + ".jpg" : name,
    data,
    size,
  };
}
