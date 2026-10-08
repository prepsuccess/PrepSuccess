import { describe, expect, it } from "vitest";
import { activeNavItem, pageLabel, studentNav } from "./nav";

describe("nav", () => {
  it("highlights Dashboard on onboarding but names the page in the breadcrumb", () => {
    expect(activeNavItem(studentNav, "/onboarding")?.label).toBe("Dashboard");
    expect(pageLabel("/onboarding")).toBe("Getting started");
  });

  it("names the feedback page and keeps it under Dashboard", () => {
    expect(pageLabel("/feedback")).toBe("Feedback");
    expect(activeNavItem(studentNav, "/feedback")?.label).toBe("Dashboard");
  });

  it("leaves other pages to their nav item's label", () => {
    expect(pageLabel("/dashboard")).toBeUndefined();
    expect(pageLabel("/onboardingx")).toBeUndefined();
    expect(activeNavItem(studentNav, "/tasks/abc")?.label).toBe("Learn");
  });
});
