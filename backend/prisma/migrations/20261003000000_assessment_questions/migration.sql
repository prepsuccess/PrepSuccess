-- Adaptive assessment: the question pool and answers live on the attempt itself.
ALTER TABLE "assessments" ADD COLUMN "questions" JSONB NOT NULL DEFAULT '[]';
