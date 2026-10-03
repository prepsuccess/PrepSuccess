-- CreateTable
CREATE TABLE "question_bank" (
    "id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "answer" TEXT,
    "company" VARCHAR(100),
    "role" VARCHAR(100),
    "topic" VARCHAR(100) NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "created_by" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "question_bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_question_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "solved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_question_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prep_pdfs" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500),
    "skill_id" UUID,
    "role" VARCHAR(100),
    "company" VARCHAR(100),
    "file_url" VARCHAR(500) NOT NULL,
    "size_label" VARCHAR(50),
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "prep_pdfs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_bank_company_idx" ON "question_bank"("company");

-- CreateIndex
CREATE INDEX "question_bank_role_idx" ON "question_bank"("role");

-- CreateIndex
CREATE INDEX "question_bank_topic_idx" ON "question_bank"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "question_bank_skill_id_title_key" ON "question_bank"("skill_id", "title");

-- CreateIndex
CREATE INDEX "user_question_progress_user_id_solved_at_idx" ON "user_question_progress"("user_id", "solved_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_question_progress_user_id_question_id_key" ON "user_question_progress"("user_id", "question_id");

-- AddForeignKey
ALTER TABLE "question_bank" ADD CONSTRAINT "question_bank_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_bank" ADD CONSTRAINT "question_bank_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_question_progress" ADD CONSTRAINT "user_question_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_question_progress" ADD CONSTRAINT "user_question_progress_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question_bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prep_pdfs" ADD CONSTRAINT "prep_pdfs_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;


ALTER TABLE "question_bank" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_question_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prep_pdfs" ENABLE ROW LEVEL SECURITY;
