import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AnsweredQuestion, AssessmentQuestion, AssessmentState } from "@/lib/api/types";
import { API, fail, http, ok, server } from "@/test/server";
import { renderWithStore, testUser } from "@/test/render";
import { SkillCheck } from "./SkillCheck";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const ID = "55555555-5555-4555-8555-555555555555";

const q = (number: number, difficulty: AssessmentQuestion["difficulty"]): AssessmentQuestion => ({
  id: `q${number}`,
  number,
  difficulty,
  question: `Question ${number}: what does this print?\n\`\`\`js\nconsole.log(${number})\n\`\`\``,
  options: [`\`${number}\``, "undefined", "null", "an error"],
});

const answered = (
  question: AssessmentQuestion,
  chosen: number,
  correctIndex = 0,
): AnsweredQuestion => ({
  ...question,
  chosen_index: chosen,
  correct_index: correctIndex,
  correct: chosen === correctIndex,
  explanation: `It logs ${question.number}.`,
});

const base: AssessmentState = {
  id: ID,
  skill: {
    id: "66666666-6666-4666-8666-666666666666",
    slug: "javascript",
    name: "JavaScript",
    category: "technical",
    topic: "Web development",
    description: null,
    mastery_threshold: 40,
  },
  status: "in_progress",
  total_questions: 5,
  answered: 0,
  current_question: q(1, "medium"),
  answers: [],
  result: null,
  started_at: "2026-10-03T10:00:00.000Z",
  completed_at: null,
};

const renderCheck = () => renderWithStore(<SkillCheck id={ID} />, { signedInAs: testUser });

describe("SkillCheck", () => {
  it("shows the question with its code, and sends the chosen option", async () => {
    let body: unknown;
    server.use(
      http.get(`${API}/api/v1/ai/assessment/${ID}`, () => ok(base)),
      http.post(`${API}/api/v1/ai/assessment/${ID}/answer`, async ({ request }) => {
        body = await request.json();
        return ok({
          ...base,
          answered: 1,
          current_question: q(2, "hard"),
          answers: [answered(q(1, "medium"), 0)],
        });
      }),
    );
    renderCheck();

    const group = await screen.findByRole("group", { name: /Question 1: what does this print/ });
    expect(screen.getByText("Question 1 of 5")).toBeInTheDocument();
    expect(screen.getByText("console.log(1)").closest("pre")).toBeInTheDocument();
    const submit = screen.getByRole("button", { name: "Submit answer" });
    expect(submit).toBeDisabled();

    await userEvent.click(within(group).getByRole("radio", { name: "1" }));
    await userEvent.click(submit);

    // Feedback on this answer comes before the next question.
    expect(await screen.findByText("Correct")).toBeInTheDocument();
    expect(screen.getByText("It logs 1.")).toBeInTheDocument();
    expect(body).toEqual({ question_id: "q1", choice_index: 0 });

    await userEvent.click(screen.getByRole("button", { name: "Next question" }));
    expect(await screen.findByText("Question 2 of 5")).toBeInTheDocument();
    expect(screen.getByText("hard")).toBeInTheDocument();
  });

  it("marks a wrong answer and shows the right one", async () => {
    server.use(
      http.get(`${API}/api/v1/ai/assessment/${ID}`, () => ok(base)),
      http.post(`${API}/api/v1/ai/assessment/${ID}/answer`, () =>
        ok({
          ...base,
          answered: 1,
          current_question: q(2, "easy"),
          answers: [answered(q(1, "medium"), 2)],
        }),
      ),
    );
    renderCheck();

    await userEvent.click(await screen.findByRole("radio", { name: /null/ }));
    await userEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    expect(await screen.findByText("Not quite")).toBeInTheDocument();
    expect(screen.getByText("Right answer")).toBeInTheDocument();
    expect(screen.getByText("Your answer")).toBeInTheDocument();
  });

  it("shows the result after the last answer", async () => {
    const lastQuestion = q(5, "hard");
    const done: AssessmentState = {
      ...base,
      status: "completed",
      answered: 5,
      current_question: null,
      answers: [
        answered(q(1, "medium"), 0),
        answered(q(2, "hard"), 1),
        answered(q(3, "medium"), 0),
        answered(q(4, "hard"), 0),
        answered(lastQuestion, 3),
      ],
      result: { score: 7, max_score: 14, percent: 50, threshold: 40, mastery: "mastered" },
      completed_at: "2026-10-03T10:05:00.000Z",
    };
    server.use(
      http.get(`${API}/api/v1/ai/assessment/${ID}`, () =>
        ok({ ...base, answered: 4, current_question: lastQuestion }),
      ),
      http.post(`${API}/api/v1/ai/assessment/${ID}/answer`, () => ok(done)),
    );
    renderCheck();

    await userEvent.click(await screen.findByRole("radio", { name: /an error/ }));
    await userEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    await userEvent.click(await screen.findByRole("button", { name: "See your result" }));

    expect(await screen.findByText("50%")).toBeInTheDocument();
    expect(screen.getByText("Mastered")).toBeInTheDocument();
    expect(screen.getByText(/3 of 5 right · 7 of 14 points/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Your score" })).toHaveAttribute(
      "aria-valuetext",
      "50%, pass mark 40%",
    );
    expect(screen.getByRole("link", { name: "Back to skill checks" })).toHaveAttribute(
      "href",
      "/assessment",
    );
    expect(screen.getAllByText(/^Question \d · (Right|Wrong)$/)).toHaveLength(5);
  });

  it("offers a reload when the question was already answered elsewhere", async () => {
    let gets = 0;
    server.use(
      http.get(`${API}/api/v1/ai/assessment/${ID}`, () => {
        gets += 1;
        return ok(
          gets === 1
            ? base
            : {
                ...base,
                answered: 1,
                current_question: q(2, "hard"),
                answers: [answered(q(1, "medium"), 0)],
              },
        );
      }),
      http.post(`${API}/api/v1/ai/assessment/${ID}/answer`, () =>
        fail(
          409,
          "QUESTION_ALREADY_ANSWERED",
          "That question was already answered. Reload to see the next one.",
        ),
      ),
    );
    renderCheck();

    await userEvent.click(await screen.findByRole("radio", { name: /undefined/ }));
    await userEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Your answer wasn't saved");

    await userEvent.click(within(alert).getByRole("button", { name: "Reload" }));
    await waitFor(() => expect(gets).toBe(2));
  });

  it("offers the results when the check was finished elsewhere", async () => {
    let gets = 0;
    server.use(
      http.get(`${API}/api/v1/ai/assessment/${ID}`, () => {
        gets += 1;
        return ok(base);
      }),
      http.post(`${API}/api/v1/ai/assessment/${ID}/answer`, () =>
        fail(409, "ASSESSMENT_COMPLETE", "This skill check is already finished."),
      ),
    );
    renderCheck();

    await userEvent.click(await screen.findByRole("radio", { name: /undefined/ }));
    await userEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("already finished");

    await userEvent.click(within(alert).getByRole("button", { name: "See results" }));
    await waitFor(() => expect(gets).toBe(2));
  });
});
