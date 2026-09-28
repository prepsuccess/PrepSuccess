import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const user = {
  id: "1",
  first_name: "Asha",
  last_name: null,
  email: "asha@college.edu",
  role: "admin",
};

describe("LoginForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    replace.mockReset();
    localStorage.clear();
  });

  it("shows field errors and doesn't call the API when empty", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<LoginForm />);

    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByLabelText(/Email/)).toHaveAccessibleDescription("Enter your email.");
    expect(screen.getByLabelText(/^Password/)).toHaveAccessibleDescription("Enter your password.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stores the tokens and sends an admin to the admin panel", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ access_token: "a", refresh_token: "r", token_type: "bearer", user }),
            { status: 200 },
          ),
        ),
    );
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/Email/), "asha@college.edu");
    await userEvent.type(screen.getByLabelText(/^Password/), "secret-pass");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(localStorage.getItem("ps-access-token")).toBe("a");
    expect(replace).toHaveBeenCalledWith("/admin");
  });

  it("shows the API's error message on bad credentials", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ detail: "Invalid email or password." }), { status: 401 }),
        ),
    );
    render(<LoginForm next="/profile" />);

    await userEvent.type(screen.getByLabelText(/Email/), "asha@college.edu");
    await userEvent.type(screen.getByLabelText(/^Password/), "wrong-pass");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
    expect(replace).not.toHaveBeenCalled();
  });
});
