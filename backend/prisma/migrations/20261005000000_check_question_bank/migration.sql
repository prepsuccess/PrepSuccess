-- AlterTable
ALTER TABLE "assessments" ADD COLUMN     "question_count" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "check_questions" (
    "id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "answer_index" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "fingerprint" VARCHAR(64) NOT NULL,
    "source" VARCHAR(20) NOT NULL DEFAULT 'ai',
    "times_asked" INTEGER NOT NULL DEFAULT 0,
    "times_correct" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "check_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "check_questions_skill_id_difficulty_idx" ON "check_questions"("skill_id", "difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "check_questions_skill_id_fingerprint_key" ON "check_questions"("skill_id", "fingerprint");

-- AddForeignKey
ALTER TABLE "check_questions" ADD CONSTRAINT "check_questions_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Block Supabase's auto-generated Data API (see the init migration).
ALTER TABLE "check_questions" ENABLE ROW LEVEL SECURITY;
