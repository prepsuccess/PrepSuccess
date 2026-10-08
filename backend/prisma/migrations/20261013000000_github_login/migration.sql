-- AlterEnum
ALTER TYPE "AuthProvider" ADD VALUE 'GITHUB';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "github_id" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN     "last_login_method" VARCHAR(10);

-- CreateIndex
CREATE UNIQUE INDEX "users_github_id_key" ON "users"("github_id");
