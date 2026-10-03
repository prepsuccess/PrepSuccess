import { prisma } from "../../db/prisma.js";
import type {
  PracticalTask,
  Prisma,
  Skill,
  UserTaskSubmission,
} from "../../generated/prisma/client.js";
import { AppError } from "../../lib/http.js";
import { generateJson } from "../../services/ai-agent/ai.service.js";
import { notify } from "../../services/notifications/notifications.service.js";
import { toSkill } from "../skills/skills.schemas.js";
import {
  TASK_PASS_PERCENT,
  buildReviewPrompt,
  parseRubric,
  scoreReview,
  taskLanguage,
  taskReviewSchema,
  taskRunner,
  wrapSubmission,
  type TaskFeedback,
} from "./tasks.logic.js";
import type {
  SkillTasksResponse,
  SubmissionResponse,
  TaskDetailResponse,
} from "./tasks.schemas.js";

const live = { isActive: true, isDeleted: false } as const;
const DIFFICULTY_ORDER = { EASY: 0, MEDIUM: 1, HARD: 2 } as const;
const lower = <T extends string>(value: T) => value.toLowerCase() as Lowercase<T>;

function toSubmission(submission: UserTaskSubmission): SubmissionResponse {
  const feedback = (submission.aiFeedback ?? {}) as Partial<TaskFeedback>;
  return {
    id: submission.id,
    content: submission.submissionContent,
    percent: Math.round(submission.score ?? 0),
    passed: submission.passed ?? false,
    pass_mark: TASK_PASS_PERCENT,
    feedback: {
      summary: feedback.summary ?? "",
      strengths: feedback.strengths ?? [],
      improvements: feedback.improvements ?? [],
      criteria: feedback.criteria ?? [],
    },
    created_at: submission.createdAt.toISOString(),
  };
}

/** GET /tasks?skill= — a skill's tasks, with the student's attempts and best score on each. */
export async function listForSkill(userId: string, slug: string): Promise<SkillTasksResponse> {
  const skill = await prisma.skill.findFirst({ where: { slug, ...live } });
  if (!skill) throw new AppError(404, "SKILL_NOT_FOUND", "That skill isn't available.");

  const tasks = await prisma.practicalTask.findMany({
    where: { skillId: skill.id, ...live },
    include: {
      submissions: { where: { userId }, select: { score: true, passed: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  tasks.sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);

  return {
    skill: toSkill(skill),
    tasks: tasks.map((task) => {
      const best = task.submissions.reduce<number | null>(
        (max, s) => (s.score !== null && (max === null || s.score > max) ? s.score : max),
        null,
      );
      return {
        id: task.id,
        skill_id: task.skillId,
        title: task.title,
        difficulty: lower(task.difficulty),
        language: taskLanguage(skill.slug),
        runner: taskRunner(skill.slug),
        attempts: task.submissions.length,
        best:
          best === null
            ? null
            : { percent: Math.round(best), passed: task.submissions.some((s) => s.passed) },
      };
    }),
  };
}

async function loadTask(taskId: string) {
  const task = await prisma.practicalTask.findFirst({
    where: { id: taskId, ...live, skill: live },
    include: { skill: true },
  });
  if (!task) throw new AppError(404, "TASK_NOT_FOUND", "That task doesn't exist.");
  return task;
}

function toDetail(
  task: PracticalTask & { skill: Skill },
  submissions: UserTaskSubmission[],
): TaskDetailResponse {
  return {
    id: task.id,
    skill: toSkill(task.skill),
    title: task.title,
    description: task.description,
    difficulty: lower(task.difficulty),
    language: taskLanguage(task.skill.slug),
    runner: taskRunner(task.skill.slug),
    starter_code: task.starterCode,
    pass_mark: TASK_PASS_PERCENT,
    rubric: parseRubric(task.evaluationCriteria).criteria,
    submissions: submissions.map(toSubmission),
  };
}

/** GET /tasks/:id — the task, its rubric and the student's own attempts. */
export async function getTask(userId: string, taskId: string) {
  const task = await loadTask(taskId);
  const submissions = await prisma.userTaskSubmission.findMany({
    where: { userId, taskId },
    orderBy: { createdAt: "desc" },
  });
  return toDetail(task, submissions);
}

/**
 * POST /tasks/:id/submit — the AI scores each rubric criterion (one AI call),
 * then the total and pass/fail are computed in tasks.logic.ts. Nothing is
 * saved if the AI call fails, so a failed review never costs an attempt.
 */
export async function submitTask(userId: string, taskId: string, content: string) {
  const task = await loadTask(taskId);
  const rubric = parseRubric(task.evaluationCriteria);

  const { data: review } = await generateJson(
    {
      userId,
      feature: "task_review",
      system: buildReviewPrompt({
        skillName: task.skill.name,
        title: task.title,
        description: task.description,
        rubric,
      }),
      messages: [{ role: "user", content: wrapSubmission(content) }],
      temperature: 0.2,
      maxOutputTokens: 2000,
      thinking: true,
      timeoutMs: 60_000,
    },
    taskReviewSchema,
  );

  const scored = scoreReview(rubric, review);
  const submission = await prisma.userTaskSubmission.create({
    data: {
      userId,
      taskId,
      submissionContent: content,
      score: scored.percent,
      passed: scored.passed,
      aiFeedback: scored.feedback as unknown as Prisma.InputJsonObject,
    },
  });

  await notify(userId, {
    type: "TASK_REVIEWED",
    title: scored.passed ? `Task passed: ${task.title}` : `Feedback ready: ${task.title}`,
    body: `You scored ${scored.percent}% (pass mark ${TASK_PASS_PERCENT}%).`,
    href: `/tasks/${task.id}`,
  });

  return toSubmission(submission);
}
