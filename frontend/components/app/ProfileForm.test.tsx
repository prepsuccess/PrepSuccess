import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "@/lib/api/auth";
import { ProfileForm } from "./ProfileForm";

const user: AuthUser = {
  id: "1",
  first_name: "Asha",
  last_name: "Verma",
  email: "asha@college.edu",
  profile_image_url: null,
  role: "student",
  auth_provider: "local",
  is_verified: true,
  onboarding_completed: false,
  profile: { student_year: 3, mobile_no: "9876543210", skills: ["HTML"] },
  created_at: "2026-10-01T00:00:00.000Z",
};

function mockPatch() {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ success: true, data: { ...user, first_name: "Asha" } }), {
      status: 200,
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("ProfileForm", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("pre-fills the current values", () => {
    render(<ProfileForm user={user} onDone={() => {}} />);
    expect(screen.getByLabelText(/First name/)).toHaveValue("Asha");
    expect(screen.getByLabelText(/Mobile/)).toHaveValue("9876543210");
    expect(screen.getByLabelText(/Year of study/)).toHaveValue("3");
  });

  it("sends edits, and clears emptied fields with null", async () => {
    const fetchMock = mockPatch();
    const onDone = vi.fn();
    render(<ProfileForm user={user} onDone={onDone} />);

    await userEvent.type(screen.getByLabelText(/College/), "Christ University");
    await userEvent.clear(screen.getByLabelText(/Mobile/));
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onDone).toHaveBeenCalled();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://localhost:8000/api/v1/users/me");
    expect(init.method).toBe("PATCH");
    const body = JSON.parse(init.body);
    expect(body.profile).toMatchObject({
      college: "Christ University",
      mobile_no: null,
      student_year: 3,
    });
    // Fields this form doesn't show (skills from the onboarding chat) are never sent, so they're kept.
    expect(body.profile).not.toHaveProperty("skills");
  });

  it("blocks an invalid phone number without calling the API", async () => {
    const fetchMock = mockPatch();
    render(<ProfileForm user={user} onDone={() => {}} />);

    await userEvent.clear(screen.getByLabelText(/Mobile/));
    await userEvent.type(screen.getByLabelText(/Mobile/), "call me");
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.getByLabelText(/Mobile/)).toHaveAccessibleDescription(
      "Enter a valid phone number.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
