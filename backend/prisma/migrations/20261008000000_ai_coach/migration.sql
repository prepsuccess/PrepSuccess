-- AlterEnum
ALTER TYPE "AgentType" ADD VALUE 'COACH';

-- CreateTable
CREATE TABLE "user_activity" (
    "user_id" UUID NOT NULL,
    "session_started_at" TIMESTAMPTZ(6) NOT NULL,
    "last_seen_at" TIMESTAMPTZ(6) NOT NULL,
    "last_nudge_at" TIMESTAMPTZ(6),

    CONSTRAINT "user_activity_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_activity" ENABLE ROW LEVEL SECURITY;
