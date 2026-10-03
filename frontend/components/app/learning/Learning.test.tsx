import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { TaskDetail, TaskSubmission } from "@/lib/api/types";
import { renderWithStore, testUser } from "@/test/render";
import { API, fail, http, ok, server } from "@/test/server";
import { Prose } from "./Prose";
import { ResourceList } from "./ResourceList";
import { TaskView } from "./TaskView";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));

const skill = {
  id: "5c8b4d2f-3a1e-4b7c-8d9f-2e3a4b5c6d7e",
  slug: "sql",
  name: "SQL",
  category: "technical" as const,
  topic: "Databases",
  description: null,
  mastery_threshold: 40,
};

describe("Prose", () => {
  it("renders paragraphs, lists and code without ever rendering HTML", () => {
    const { container } = render(
      <Prose
        text={
          "Lead line:\n- one\n- two `x`\n\n<img src=x onerror=alert(1)>\n\n```sql\nSELECT 1;\n```"
        }
      />,
    );
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["one", "two x"]);
    expect(screen.getByText("Lead line:")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
    expect(container.querySelector("pre code")?.textContent).toBe("SELECT 1;");
  });
});

describe("ResourceList", () => {
  it("opens links in a new tab and our notes in place", async () => {
    server.use(
      http.get(`${API}/api/v1/resources`, ({ request }) => {
        expect(new URL(request.url).searchParams.get("skill")).toBe("sql");
        return ok({
          skill,
          resources: [
            {
              id: "r1",
              title: "Normal forms",
              type: "reference",
              url: null,
              content: "- 1NF\n- 2NF",
              source: "PrepSuccess",
            },
            {
              id: "r2",
              title: "SQLBolt",
              type: "practice",
              url: "https://sqlbolt.com/",
              content: null,
              source: "SQLBolt",
            },
          ],
        });
      }),
    );
    renderWithStore(<ResourceList slug="sql" />, { signedInAs: testUser });

    const link = await screen.findByRole("link", { name: /SQLBolt/ });
    expect(link).toHaveAttribute("href", "https://sqlbolt.com/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));

    const notes = screen.getByRole("button", { name: /Normal forms/ });
    expect(notes).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(notes);
    expect(notes).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("2NF")).toBeInTheDocument();
  });
});

describe("TaskView", () => {
  const TASK_ID = "7e0d6f4b-5c3a-4d9e-8fb0-4a5b6c7d8e9f";
  const submission: TaskSubmission = {
    id: "s1",
    content: "SELECT d.name FROM departments d JOIN employees e ...",
    percent: 70,
    passed: true,
    pass_mark: 60,
    feedback: {
      summary: "Mostly right.",
      strengths: ["Clean join"],
      improvements: ["Sort by the average"],
      criteria: [
        { id: "join", description: "Correct JOIN", points: 4, score: 4, comment: "Good." },
        { id: "group", description: "GROUP BY", points: 6, score: 3, comment: "No ORDER BY." },
      ],
    },
    created_at: "2026-10-03T10:00:00.000Z",
  };
  const task = (submissions: TaskSubmission[]): TaskDetail => ({
    id: TASK_ID,
    skill,
    title: "Top earners per department",
    description: "Write the queries:\n- average per department\n- top earner per department",
    difficulty: "medium",
    // A written answer, so the plain text box is used (CodeMirror needs a real browser; see e2e).
    language: "text",
    runner: null,
    starter_code: null,
    pass_mark: 60,
    rubric: submission.feedback.criteria.map(({ id, description, points }) => ({
      id,
      description,
      points,
    })),
    submissions,
  });

  it("shows the brief and rubric, submits, and shows the AI's marks", async () => {
    let current = task([]);
    let body: unknown;
    server.use(
      http.get(`${API}/api/v1/tasks/${TASK_ID}`, () => ok(current)),
      http.post(`${API}/api/v1/tasks/${TASK_ID}/submit`, async ({ request }) => {
        body = await request.json();
        current = task([submission]);
        return ok(submission, 201);
      }),
      // Submitting refreshes the AI meter and the bell.
      http.get(`${API}/api/v1/ai/status`, () => ok({})),
      http.get(`${API}/api/v1/notifications`, () => ok({ notifications: [], unread_count: 0 })),
    );
    renderWithStore(<TaskView id={TASK_ID} />, { signedInAs: testUser });

    expect(
      await screen.findByRole("heading", { name: "Top earners per department" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/How it's marked · pass mark 60%/)).toBeInTheDocument();
    expect(screen.getByText("6 points")).toBeInTheDocument();

    const submit = screen.getByRole("button", { name: "Submit for review" });
    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Your answer"), submission.content);
    await userEvent.click(submit);

    expect(await screen.findByText("Latest feedback")).toBeInTheDocument();
    expect(body).toEqual({ content: submission.content });
    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(screen.getByText("Passed")).toBeInTheDocument();
    expect(screen.getByText("3 / 6")).toBeInTheDocument();
    expect(
      within(screen.getByText("What to fix").parentElement!).getByText("Sort by the average"),
    ).toBeInTheDocument();
  });

  it("keeps the answer when the review fails", async () => {
    server.use(
      http.get(`${API}/api/v1/tasks/${TASK_ID}`, () => ok(task([]))),
      http.post(`${API}/api/v1/tasks/${TASK_ID}/submit`, () =>
        fail(503, "AI_UNAVAILABLE", "The AI is busy right now."),
      ),
      http.get(`${API}/api/v1/ai/status`, () => ok({})),
    );
    renderWithStore(<TaskView id={TASK_ID} />, { signedInAs: testUser });

    const box = await screen.findByLabelText("Your answer");
    await userEvent.type(box, "a reasonably long answer to the task");
    await userEvent.click(screen.getByRole("button", { name: "Submit for review" }));

    expect(await screen.findByText(/The AI is busy right now/)).toBeInTheDocument();
    await waitFor(() => expect(box).toHaveValue("a reasonably long answer to the task"));
  });
});
