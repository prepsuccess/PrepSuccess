-- AlterTable: the student's latest written answer and its AI feedback.
ALTER TABLE "user_question_progress" ADD COLUMN     "last_answer" TEXT;
ALTER TABLE "user_question_progress" ADD COLUMN     "last_feedback" JSONB;
ALTER TABLE "user_question_progress" ADD COLUMN     "attempted_at" TIMESTAMPTZ(6);
ALTER TABLE "user_question_progress" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0;
