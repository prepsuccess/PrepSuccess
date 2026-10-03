import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithStore, testUser } from "@/test/render";
import { API, fail, http, ok, server } from "@/test/server";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

describe("ForgotPasswordForm", () => {
  afterEach(() => replace.mockReset());

  it("sends a code, then resets the password and signs in", async () => {
    const bodies: unknown[] = [];
    server.use(
      http.post(`${API}/api/v1/auth/forgot-password`, async ({ request }) => {
        bodies.push(await request.json());
        return ok({
          message: "If asha@college.edu has a PrepSuccess account, we sent a 6-digit code to it.",
          email: "asha@college.edu",
        });
      }),
      http.post(`${API}/api/v1/auth/reset-password`, async ({ request }) => {
        bodies.push(await request.json());
        return ok({
          access_token: "a",
          refresh_token: "r",
          token_type: "bearer",
          expires_in: 1800,
          user: { ...testUser, onboarding_completed: true },
        });
      }),
    );
    renderWithStore(<ForgotPasswordForm initialEmail="asha@college.edu" />);

    await userEvent.click(screen.getByRole("button", { name: "Send reset code" }));
    expect(
      await screen.findByText(/If asha@college.edu has a PrepSuccess account/),
    ).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/Reset code/), "48a2913");
    await userEvent.type(screen.getByLabelText(/New password/), "new-password-1");
    await userEvent.click(screen.getByRole("button", { name: "Set new password" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
    expect(bodies).toEqual([
      { email: "asha@college.edu" },
      // Non-digits are dropped as you type.
      { email: "asha@college.edu", otp: "482913", password: "new-password-1" },
    ]);
    expect(localStorage.getItem("ps-access-token")).toBe("a");
  });

  it("shows the API's error and stays on the code step", async () => {
    server.use(
      http.post(`${API}/api/v1/auth/forgot-password`, () =>
        ok({ message: "Sent if it exists.", email: "asha@college.edu" }),
      ),
      http.post(`${API}/api/v1/auth/reset-password`, () =>
        fail(400, "OTP_INVALID", "That code isn't right. 2 attempts left."),
      ),
    );
    renderWithStore(<ForgotPasswordForm initialEmail="asha@college.edu" />);

    await userEvent.click(screen.getByRole("button", { name: "Send reset code" }));
    await userEvent.type(await screen.findByLabelText(/Reset code/), "111111");
    await userEvent.type(screen.getByLabelText(/New password/), "new-password-1");
    await userEvent.click(screen.getByRole("button", { name: "Set new password" }));

    expect(await screen.findByText("That code isn't right. 2 attempts left.")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("validates the email before calling the API", async () => {
    renderWithStore(<ForgotPasswordForm />);
    await userEvent.click(screen.getByRole("button", { name: "Send reset code" }));
    expect(screen.getByLabelText(/Email/)).toHaveAccessibleDescription(/Enter your email/);
  });
});
