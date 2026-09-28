import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders a link when given an href", () => {
    render(<Button href="/signup" label="Get started" />);
    expect(screen.getByRole("link", { name: "Get started" })).toHaveAttribute("href", "/signup");
  });

  it("renders a native button that defaults to type=button", async () => {
    const onClick = vi.fn();
    render(<Button label="Save" onClick={onClick} />);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("disables itself and reports busy while loading", () => {
    render(<Button type="submit" label="Log in" loading />);

    const button = screen.getByRole("button", { name: "Log in" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("type", "submit");
  });
});
