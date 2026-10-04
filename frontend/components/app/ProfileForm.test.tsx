import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { API, fail, http, ok, server } from "@/test/server";
import { renderWithStore, testUser } from "@/test/render";
import { ProfileForm } from "./ProfileForm";

// jsdom has no pointer capture; the Radix Select calls it when opened with a pointer.
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.releasePointerCapture ??= () => {};

const renderForm = (onDone = () => {}) =>
  renderWithStore(<ProfileForm user={testUser} onDone={onDone} />, { signedInAs: testUser });

describe("ProfileForm", () => {
  it("pre-fills the current values", () => {
    renderForm();
    expect(screen.getByLabelText(/First name/)).toHaveValue("Asha");
    expect(screen.getByLabelText(/Mobile/)).toHaveValue("9876543210");
    expect(screen.getByLabelText(/Year of study/)).toHaveTextContent("Year 3");
  });

  it("sends edits, clears emptied fields with null, and updates the cached user", async () => {
    let body: { profile: Record<string, unknown> } | undefined;
    server.use(
      http.patch(`${API}/api/v1/users/me`, async ({ request }) => {
        body = (await request.json()) as typeof body;
        return ok({ ...testUser, profile: { ...testUser.profile, college: "Christ University" } });
      }),
    );
    const onDone = vi.fn();
    const { store } = renderForm(onDone);

    await userEvent.type(screen.getByLabelText(/College/), "Christ University");
    await userEvent.clear(screen.getByLabelText(/Mobile/));
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(body!.profile).toMatchObject({
      college: "Christ University",
      mobile_no: null,
      student_year: 3,
    });
    // Fields this form doesn't show (skills from the onboarding chat) are never sent, so they're kept.
    expect(body!.profile).not.toHaveProperty("skills");
    // The response was written into the getMe cache — no refetch needed.
    const cached = store.getState().api.queries["getMe(undefined)"]?.data as typeof testUser;
    expect(cached.profile.college).toBe("Christ University");
  });

  it("blocks an invalid phone number without calling the API", async () => {
    renderForm();

    await userEvent.clear(screen.getByLabelText(/Mobile/));
    await userEvent.type(screen.getByLabelText(/Mobile/), "call me");
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.getByLabelText(/Mobile/)).toHaveAccessibleDescription(
      "Enter a valid phone number.",
    );
  });

  it("puts server validation errors on the matching field", async () => {
    server.use(
      http.patch(`${API}/api/v1/users/me`, () =>
        fail(422, "VALIDATION_ERROR", "Request validation failed.", [
          { path: ["profile", "college"], message: "Too long." },
        ]),
      ),
    );
    renderForm();

    await userEvent.type(screen.getByLabelText(/College/), "X");
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(screen.getByLabelText(/College/)).toHaveAccessibleDescription("Too long."),
    );
    // The message sits on the field (announced there), not in a form-level banner.
    expect(screen.queryByText(/Couldn.t save your details/)).toBeNull();
  });

  it("shows a 422 for a field the form doesn't show in the banner", async () => {
    server.use(
      http.patch(`${API}/api/v1/users/me`, () =>
        fail(422, "VALIDATION_ERROR", "Request validation failed.", [
          { path: ["profile", "skills"], message: "Too many skills." },
        ]),
      ),
    );
    const onDone = vi.fn();
    renderForm(onDone);

    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText(/Couldn.t save your details/)).toBeInTheDocument();
    expect(screen.getByText("Too many skills.")).toBeInTheDocument();
    expect(onDone).not.toHaveBeenCalled();
  });

  it("can clear the year of study", async () => {
    let body: { profile: Record<string, unknown> } | undefined;
    server.use(
      http.patch(`${API}/api/v1/users/me`, async ({ request }) => {
        body = (await request.json()) as typeof body;
        return ok({ ...testUser, profile: { ...testUser.profile, student_year: null } });
      }),
    );
    const onDone = vi.fn();
    renderForm(onDone);

    await userEvent.click(screen.getByLabelText(/Year of study/));
    await userEvent.click(await screen.findByRole("option", { name: "Not set" }));
    expect(screen.getByLabelText(/Year of study/)).toHaveTextContent("Choose your year");
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(body!.profile).toMatchObject({ student_year: null });
  });
});
