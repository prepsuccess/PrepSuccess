import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins and skips falsy values, like before", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("lets the last conflicting Tailwind class win", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("bg-brand", "bg-primary")).toBe("bg-primary");
  });

  it("keeps a custom colour and a custom font size together", () => {
    expect(cn("text-heading", "text-h1")).toBe("text-heading text-h1");
    expect(cn("text-h1", "text-h2")).toBe("text-h2");
    expect(cn("text-text", "text-heading")).toBe("text-heading");
  });

  it("knows the custom radius, shadow and animation names", () => {
    expect(cn("rounded-card", "rounded-lg")).toBe("rounded-lg");
    expect(cn("shadow-card", "shadow-window")).toBe("shadow-window");
    expect(cn("animate-shimmer", "animate-none")).toBe("animate-none");
  });
});
