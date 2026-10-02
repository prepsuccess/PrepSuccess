import { Badge } from "@/components/shadcn/badge";
import type { MySkill } from "@/lib/api/types";

/** Where the student stands on a skill, in one badge. Text always says it — colour only reinforces. */
export function SkillStatusBadge({ skill }: { skill: MySkill }) {
  if (skill.in_progress_id) return <Badge variant="secondary">In progress</Badge>;
  const result = skill.last_result;
  if (!result) return <Badge variant="outline">Not checked yet</Badge>;
  return result.mastery === "mastered" ? (
    <Badge className="bg-success/10 text-success">Mastered · {result.percent}%</Badge>
  ) : (
    <Badge variant="destructive">Needs revision · {result.percent}%</Badge>
  );
}

export function actionLabel(skill: MySkill) {
  if (skill.in_progress_id) return "Resume";
  return skill.last_result ? "Retake" : "Start check";
}
