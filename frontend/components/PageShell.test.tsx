import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageShell } from "./PageShell";

describe("PageShell", () => {
  it("renders the title and description", () => {
    render(<PageShell title="Dashboard" description="Your readiness score." />);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Your readiness score.")).toBeInTheDocument();
  });

  it("omits the description when none is given", () => {
    render(<PageShell title="Profile" />);

    expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
  });
});
