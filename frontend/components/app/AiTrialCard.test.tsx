import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { API, fail, http, ok, server } from "@/test/server";
import { renderWithStore, testUser } from "@/test/render";
import { AiTrialCard } from "./AiTrialCard";

const status = (overrides: object = {}) => ({
  available: true,
  allowed: true,
  reason: null,
  trial: { active: true, ends_at: "2027-01-01T00:00:00.000Z", days_left: 87, enforced: false },
  today: { requests: 12, limit: 200 },
  ...overrides,
});

describe("AiTrialCard", () => {
  it("shows days left and today's usage", async () => {
    server.use(http.get(`${API}/api/v1/ai/status`, () => ok(status())));
    renderWithStore(<AiTrialCard />, { signedInAs: testUser });

    expect(await screen.findByText("AI free trial · 87 days left")).toBeInTheDocument();
    expect(screen.getByText(/12 of 200 AI chats used today/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "12");
  });

  it("explains the daily limit when it's reached", async () => {
    server.use(
      http.get(`${API}/api/v1/ai/status`, () =>
        ok(
          status({
            allowed: false,
            reason: "AI_DAILY_LIMIT",
            today: { requests: 200, limit: 200 },
          }),
        ),
      ),
    );
    renderWithStore(<AiTrialCard />, { signedInAs: testUser });

    expect(await screen.findByText(/used today's AI chats/)).toBeInTheDocument();
  });

  it("shows an error with a retry when the status can't load", async () => {
    server.use(
      http.get(`${API}/api/v1/ai/status`, () => fail(500, "INTERNAL_SERVER_ERROR", "Boom.")),
    );
    renderWithStore(<AiTrialCard />, { signedInAs: testUser });

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load your AI trial");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
