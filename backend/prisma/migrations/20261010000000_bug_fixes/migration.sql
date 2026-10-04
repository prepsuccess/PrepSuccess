-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "revoke_reason" VARCHAR(20);

-- AlterTable
ALTER TABLE "ai_usage" ADD COLUMN     "system" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user_question_progress" ADD COLUMN     "bookmarked_at" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "ai_usage_created_at_idx" ON "ai_usage"("created_at");


-- Existing bookmarks keep their order.
UPDATE "user_question_progress" SET "bookmarked_at" = "updated_at" WHERE "bookmarked" = true;
