import type { MySkill } from "@/lib/api/types";

/**
 * Pure rules behind the skill checks page: the progress summary, the one
 * recommended next action, the status filter and the topic groups. Kept out
 * of the components so they're easy to test.
 */

export type SkillStatus = "todo" | "in_progress" | "needs_revision" | "mastered";

export function statusOf(skill: MySkill): SkillStatus {
  if (skill.in_progress_id) return "in_progress";
  if (!skill.last_result) return "todo";
  return skill.last_result.mastery === "mastered" ? "mastered" : "needs_revision";
}

export function summarise(skills: MySkill[]) {
  const counts = { todo: 0, in_progress: 0, needs_revision: 0, mastered: 0 };
  for (const skill of skills) counts[statusOf(skill)] += 1;
  return {
    total: skills.length,
    checked: counts.mastered + counts.needs_revision,
    ...counts,
  };
}

export type UpNext =
  | { kind: "resume"; skill: MySkill }
  | { kind: "start_claimed"; skill: MySkill }
  | { kind: "revise"; skill: MySkill }
  | { kind: "start_aptitude"; skill: MySkill }
  | { kind: "explore" };

/**
 * The single most useful thing to do now, in order: finish what's started,
 * check what you said you know, fix your weakest result, then aptitude
 * (every placement test has a round of it).
 */
export function upNext(skills: MySkill[]): UpNext {
  const inProgress = skills.filter((s) => s.in_progress_id);
  const resume = inProgress.find((s) => s.claimed) ?? inProgress[0];
  if (resume) return { kind: "resume", skill: resume };

  const claimedTodo = skills.find((s) => s.claimed && !s.last_result);
  if (claimedTodo) return { kind: "start_claimed", skill: claimedTodo };

  const weakest = skills
    .filter((s) => s.last_result?.mastery === "needs_revision")
    .sort((a, b) => a.last_result!.percent - b.last_result!.percent)[0];
  if (weakest) return { kind: "revise", skill: weakest };

  const aptitude = skills.filter((s) => s.category === "aptitude");
  if (!aptitude.some((s) => s.last_result)) {
    const first = aptitude[0];
    if (first) return { kind: "start_aptitude", skill: first };
  }
  return { kind: "explore" };
}

export type StatusFilter = "all" | SkillStatus;

/** Case- and punctuation-insensitive match on name, topic and description. */
export function matches(skill: MySkill, query: string, filter: StatusFilter) {
  if (filter !== "all" && statusOf(skill) !== filter) return false;
  const q = normalise(query);
  if (!q) return true;
  return [skill.name, skill.topic ?? "", skill.description ?? ""].some((text) =>
    normalise(text).includes(q),
  );
}

const normalise = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .trim();

export interface TopicGroup {
  topic: string;
  skills: MySkill[];
  checked: number;
}

/** Groups skills by topic, keeping the catalogue's order (skills arrive sorted). */
export function groupByTopic(skills: MySkill[]): TopicGroup[] {
  const groups = new Map<string, MySkill[]>();
  for (const skill of skills) {
    const topic = skill.topic ?? "Other";
    groups.set(topic, [...(groups.get(topic) ?? []), skill]);
  }
  return [...groups].map(([topic, list]) => ({
    topic,
    skills: list,
    checked: list.filter((s) => s.last_result).length,
  }));
}
