import { afterEach, describe, expect, it, vi } from "vitest";
import {
  dataUrlBytes,
  fitWithin,
  formatBytes,
  ImageError,
  isAllowedImage,
  JPEG_QUALITY,
  MAX_IMAGE_BYTES,
  needsCompression,
  prepareImage,
  splitImages,
} from "./images";

const KB = 1024;
const fileOf = (name: string, type: string, bytes: number) =>
  new File([new Uint8Array(bytes)], name, { type });

describe("image checks", () => {
  it("accepts PNG, JPEG and WebP only", () => {
    expect(isAllowedImage("image/png")).toBe(true);
    expect(isAllowedImage("image/jpeg")).toBe(true);
    expect(isAllowedImage("image/webp")).toBe(true);
    expect(isAllowedImage("image/gif")).toBe(false);
    expect(isAllowedImage("application/pdf")).toBe(false);
  });

  it("sends small JPEG and WebP files as they are and shrinks the rest", () => {
    expect(needsCompression({ type: "image/jpeg", size: 300 * KB })).toBe(false);
    expect(needsCompression({ type: "image/webp", size: 120 * KB })).toBe(false);
    expect(needsCompression({ type: "image/jpeg", size: 300 * KB + 1 })).toBe(true);
    // PNG screenshots are usually far bigger than the same picture as JPEG.
    expect(needsCompression({ type: "image/png", size: 10 * KB })).toBe(true);
  });

  it("fits the longest side within 1600px, keeping the shape and never enlarging", () => {
    expect(fitWithin(3200, 1800)).toEqual({ width: 1600, height: 900 });
    expect(fitWithin(1000, 4000)).toEqual({ width: 400, height: 1600 });
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("works out a data URL's decoded size", () => {
    expect(dataUrlBytes("data:image/png;base64,AAAA")).toBe(3);
    expect(dataUrlBytes("data:image/png;base64,AAA=")).toBe(2);
    expect(dataUrlBytes("data:image/png;base64,AA==")).toBe(1);
  });

  it("formats sizes for people", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(84 * KB)).toBe("84 KB");
    expect(formatBytes(1.4 * KB * KB)).toBe("1.4 MB");
  });

  it("keeps the images from a pick or paste and counts the rest", () => {
    const { images, rejected } = splitImages([
      fileOf("a.png", "image/png", 10),
      fileOf("notes.pdf", "application/pdf", 10),
      fileOf("b.webp", "image/webp", 10),
    ]);
    expect(images.map((f) => f.name)).toEqual(["a.png", "b.webp"]);
    expect(rejected).toBe(1);
  });
});

describe("prepareImage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  /** Fakes the browser's decode + canvas: returns what toDataURL was asked for. */
  function fakeCanvas(size: { width: number; height: number }, output: string) {
    const close = vi.fn();
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({ ...size, close })),
    );
    const context = { fillStyle: "", fillRect: vi.fn(), drawImage: vi.fn() };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    const toDataURL = vi
      .spyOn(HTMLCanvasElement.prototype, "toDataURL")
      .mockImplementation(function (this: HTMLCanvasElement) {
        return output;
      });
    return { toDataURL, context, close };
  }

  it("rejects files that aren't PNG, JPEG or WebP", async () => {
    await expect(prepareImage(fileOf("cat.gif", "image/gif", 10))).rejects.toThrow(
      "cat.gif isn't a PNG, JPEG or WebP image.",
    );
  });

  it("sends a small JPEG unchanged", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "photo.jpg", { type: "image/jpeg" });
    const image = await prepareImage(file);
    expect(image.data).toBe("data:image/jpeg;base64,AQID");
    expect(image.size).toBe(3);
    expect(image.name).toBe("photo.jpg");
  });

  it("resizes a big screenshot and re-encodes it as JPEG", async () => {
    const { toDataURL, context, close } = fakeCanvas(
      { width: 3200, height: 2000 },
      "data:image/jpeg;base64,AAAA",
    );
    const image = await prepareImage(fileOf("screen.png", "image/png", 900 * KB));

    expect(toDataURL).toHaveBeenCalledWith("image/jpeg", JPEG_QUALITY);
    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1600, 1000);
    // Painted on white first, so transparent areas don't turn black.
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 1600, 1000);
    expect(close).toHaveBeenCalled();
    expect(image).toMatchObject({
      name: "screen.jpg",
      size: 3,
      data: "data:image/jpeg;base64,AAAA",
    });
  });

  it("refuses an image that's still over 2 MB after shrinking", async () => {
    const huge = `data:image/jpeg;base64,${"A".repeat(Math.ceil(((MAX_IMAGE_BYTES + 10) * 4) / 3))}`;
    fakeCanvas({ width: 1600, height: 1600 }, huge);
    const attempt = prepareImage(fileOf("poster.png", "image/png", 5 * KB * KB));
    await expect(attempt).rejects.toBeInstanceOf(ImageError);
    await expect(attempt).rejects.toThrow(
      "poster.png is still over 2 MB after shrinking. Try a smaller screenshot.",
    );
  });

  it("explains when the browser can't read the image", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => {
        throw new Error("decode failed");
      }),
    );
    await expect(prepareImage(fileOf("broken.png", "image/png", 10))).rejects.toThrow(
      "Couldn't read broken.png. Try another file.",
    );
  });
});
