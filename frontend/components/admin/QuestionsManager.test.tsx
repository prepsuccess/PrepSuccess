import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { AdminQuestion, AdminSkill } from "@/lib/api/types";
import { API, fail, http, ok, server } from "@/test/server";
import { renderWithStore, testUser } from "@/test/render";
import { QuestionsManager } from "./QuestionsManager";

const admin = { ...testUser, role: "admin" as const };

const sql: AdminSkill = {
  id: "0b6f4a2e-3c1d-4e5f-8a9b-1c2d3e4f5a6b",
  slug: "sql",
  name: "SQL",
  category: "technical",
  topic: "Databases",
  description: null,
  mastery_threshold: 70,
  is_active: true,
  resources: 3,
  tasks: 1,
  checks: 12,
};

const question: AdminQuestion = {
  id: "7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f",
  title: "What is the difference between WHERE and HAVING?",
  topic: "Aggregation",
  difficulty: "medium",
  company: "TCS",
  role: "Data Analyst",
  skill: { id: sql.id, slug: sql.slug, name: sql.name },
  body: "Explain when each clause runs.",
  answer: null,
  is_active: true,
  created_at: "2026-10-01T00:00:00.000Z",
  updated_at: "2026-10-01T00:00:00.000Z",
};

const page = (questions: AdminQuestion[]) => ({
  success: true,
  data: questions,
  meta: { page: 1, limit: 20, total: questions.length },
  request_id: "test",
  timestamp: new Date().toISOString(),
});

// Radix Select uses pointer capture, which jsdom doesn't implement.
beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
});

beforeEach(() => {
  server.use(
    http.get(`${API}/api/v1/admin/questions`, () => Response.json(page([question]))),
    http.get(`${API}/api/v1/admin/skills`, () => ok([sql])),
    http.get(`${API}/api/v1/admin/question-taxonomy`, () =>
      ok({ companies: ["TCS", "Infosys"], roles: ["SDE", "Data Analyst"] }),
    ),
  );
});

const renderManager = () => renderWithStore(<QuestionsManager />, { signedInAs: admin });

// No per-keystroke delay: the form has several long fields.
const user = userEvent.setup({ delay: null });

async function fill(field: HTMLElement, text: string) {
  await user.click(field);
  await user.paste(text);
}

async function pick(label: RegExp, option: string) {
  await user.click(screen.getByRole("combobox", { name: label }));
  await user.click(await screen.findByRole("option", { name: option }));
}

// Filling the whole form through Radix selects is slow in jsdom on a busy machine.
describe("QuestionsManager", { timeout: 15_000 }, () => {
  it("lists questions with their skill, tags and status", async () => {
    renderManager();
    const row = (await screen.findByText(question.title)).closest("tr")!;
    expect(within(row).getByText("SQL")).toBeInTheDocument();
    expect(within(row).getByText("Aggregation")).toBeInTheDocument();
    expect(within(row).getByText("medium")).toBeInTheDocument();
    expect(within(row).getByText("TCS")).toBeInTheDocument();
    expect(within(row).getByText("Data Analyst")).toBeInTheDocument();
    expect(within(row).getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("1 question")).toBeInTheDocument();
  });

  it("creates a question with the form's values", async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.post(`${API}/api/v1/admin/questions`, async ({ request }) => {
        body = (await request.json()) as typeof body;
        return ok({ ...question, id: "new" }, 201);
      }),
    );
    renderManager();
    await screen.findByText(question.title);

    await user.click(screen.getByRole("button", { name: "Add question" }));
    const dialog = await screen.findByRole("dialog", { name: "Add a question" });
    await fill(within(dialog).getByLabelText(/Title/), "Explain INNER vs LEFT JOIN");
    await pick(/^Skill/, "SQL");
    await fill(within(dialog).getByLabelText(/Topic/), "Joins");
    await pick(/Difficulty/, "Hard");
    await pick(/Company/, "Infosys");
    await fill(within(dialog).getByLabelText(/^Question/), "When does a LEFT JOIN return NULLs?");
    await user.click(within(dialog).getByRole("button", { name: "Add question" }));

    await waitFor(() => expect(body).toBeDefined());
    expect(body).toEqual({
      skill_id: sql.id,
      title: "Explain INNER vs LEFT JOIN",
      topic: "Joins",
      difficulty: "hard",
      company: "Infosys",
      role: null,
      body: "When does a LEFT JOIN return NULLs?",
      answer: null,
      is_active: true,
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("puts server validation errors on the matching field", async () => {
    server.use(
      http.post(`${API}/api/v1/admin/questions`, () =>
        fail(422, "VALIDATION_ERROR", "Request validation failed.", [
          { path: ["topic"], message: "Topic is too vague." },
        ]),
      ),
    );
    renderManager();
    await screen.findByText(question.title);

    await user.click(screen.getByRole("button", { name: "Add question" }));
    const dialog = await screen.findByRole("dialog");
    await fill(within(dialog).getByLabelText(/Title/), "Explain INNER vs LEFT JOIN");
    await pick(/^Skill/, "SQL");
    await fill(within(dialog).getByLabelText(/Topic/), "Misc");
    await fill(within(dialog).getByLabelText(/^Question/), "A long enough body.");
    await user.click(within(dialog).getByRole("button", { name: "Add question" }));

    await waitFor(() =>
      expect(within(dialog).getByLabelText(/Topic/)).toHaveAccessibleDescription(
        "Topic is too vague.",
      ),
    );
  });

  it("asks before deleting, then deletes", async () => {
    let deleted: string | undefined;
    server.use(
      http.delete(`${API}/api/v1/admin/questions/:id`, ({ params }) => {
        deleted = params.id as string;
        return ok({ id: params.id as string, deleted: true });
      }),
    );
    renderManager();
    await screen.findByText(question.title);

    await user.click(screen.getByRole("button", { name: `Delete “${question.title}”` }));
    const confirm = await screen.findByRole("alertdialog", {
      name: `Delete “${question.title}”?`,
    });
    expect(deleted).toBeUndefined();

    await user.click(within(confirm).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(deleted).toBe(question.id));
  });
});
