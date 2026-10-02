import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { API, fail, http, ok, server } from "@/test/server";
import { renderWithStore, testUser } from "@/test/render";
import { LoginForm } from "./LoginForm";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const admin = { ...testUser, role: "admin" as const };

describe("LoginForm", () => {
  afterEach(() => replace.mockReset());

  it("shows field errors and doesn't call the API when empty", async () => {
    // No handlers: any request would fail the test (onUnhandledRequest: "error").
    renderWithStore(<LoginForm />);

    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByLabelText(/Email/)).toHaveAccessibleDescription("Enter your email.");
    expect(screen.getByLabelText(/^Password/)).toHaveAccessibleDescription("Enter your password.");
  });

  it("stores the tokens, caches the user and sends an admin to the admin panel", async () => {
    let body: unknown;
    server.use(
      http.post(`${API}/api/v1/auth/login`, async ({ request }) => {
        body = await request.json();
        return ok({
          access_token: "a",
          refresh_token: "r",
          token_type: "bearer",
          expires_in: 1800,
          user: admin,
        });
      }),
    );
    const { store } = renderWithStore(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/Email/), " asha@college.edu ");
    await userEvent.type(screen.getByLabelText(/^Password/), "secret-pass");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/admin"));
    expect(body).toEqual({ email: "asha@college.edu", password: "secret-pass" });
    expect(localStorage.getItem("ps-access-token")).toBe("a");
    expect(store.getState().auth.status).toBe("signedIn");
    // The login response seeded the user cache, so no separate /me request is needed.
    expect(store.getState().api.queries["getMe(undefined)"]?.data).toMatchObject({
      role: "admin",
    });
  });

  it("shows the API's error message on bad credentials", async () => {
    server.use(
      http.post(`${API}/api/v1/auth/login`, () =>
        fail(401, "INVALID_CREDENTIALS", "Invalid email or password."),
      ),
    );
    renderWithStore(<LoginForm next="/profile" />);

    await userEvent.type(screen.getByLabelText(/Email/), "asha@college.edu");
    await userEvent.type(screen.getByLabelText(/^Password/), "wrong-pass");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows a friendly message when the API can't be reached", async () => {
    server.use(http.post(`${API}/api/v1/auth/login`, () => Response.error()));
    renderWithStore(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/Email/), "asha@college.edu");
    await userEvent.type(screen.getByLabelText(/^Password/), "secret-pass");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Couldn't reach PrepSuccess/);
  });
});
