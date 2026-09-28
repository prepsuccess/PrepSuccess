import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";
import { PasswordInput } from "./PasswordInput";

describe("Input", () => {
  it("links the label and hint to the control", () => {
    render(<Input label="Email" hint="We never share it." />);

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAccessibleDescription("We never share it.");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("shows the error instead of the hint and marks the control invalid", () => {
    render(<Input label="Email" hint="We never share it." error="Enter your email." />);

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter your email.");
    expect(screen.queryByText("We never share it.")).not.toBeInTheDocument();
  });
});

describe("PasswordInput", () => {
  it("toggles between hidden and visible text", async () => {
    render(<PasswordInput label="Password" />);

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
  });
});
