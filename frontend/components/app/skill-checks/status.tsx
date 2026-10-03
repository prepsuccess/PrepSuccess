import { CircleCheck, CircleDashed, CircleDot, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import type { MySkill } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { statusOf } from "./skillsView";

/**
 * Where the student stands on a skill, in one badge. The words and the icon
 * always say it — colour only reinforces.
 */
export function SkillStatusBadge({ skill, className }: { skill: MySkill; className?: string }) {
  const result = skill.last_result;
  switch (statusOf(skill)) {
    case "in_progress":
      return (
        <Badge variant="secondary" className={className}>
          <CircleDot aria-hidden />
          In progress
        </Badge>
      );
    case "mastered":
      return (
        <Badge className={cn("bg-success/10 text-success", className)}>
          <CircleCheck aria-hidden />
          Mastered · {result!.percent}%
        </Badge>
      );
    case "needs_revision":
      return (
        <Badge variant="destructive" className={className}>
          <TriangleAlert aria-hidden />
          Needs revision · {result!.percent}%
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={cn("text-muted-foreground", className)}>
          <CircleDashed aria-hidden />
          Not checked yet
        </Badge>
      );
  }
}

export function actionLabel(skill: MySkill) {
  if (skill.in_progress_id) return "Resume";
  return skill.last_result ? "Retake" : "Start check";
}
