import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithStore, testUser } from "@/test/render";
import { ProfileDetails } from "./ProfileDetails";

const row = (label: string) => screen.getByText(label).nextElementSibling;

describe("ProfileDetails sign-in rows", () => {
  it("shows how this session started and every linked method", async () => {
    renderWithStore(<ProfileDetails />, {
      signedInAs: {
        ...testUser,
        last_login_method: "github",
        sign_in_methods: { password: true, google: true, github: true },
      } as typeof testUser,
    });
    await screen.findByText("Signed in with");
    expect(row("Signed in with")).toHaveTextContent("GitHub");
    expect(row("Sign-in methods")).toHaveTextContent("Email and password, Google, GitHub");
  });

  it("falls back to the account's provider before the API sends the new fields", async () => {
    renderWithStore(<ProfileDetails />, {
      signedInAs: { ...testUser, auth_provider: "google" },
    });
    await screen.findByText("Signed in with");
    expect(row("Signed in with")).toHaveTextContent("Not set");
    expect(row("Sign-in methods")).toHaveTextContent("Google");
  });
});
