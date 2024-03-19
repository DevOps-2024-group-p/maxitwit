/*
  Warnings:

  - Made the column `pub_date` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "pub_date" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Message_author_id_pub_date_idx" ON "Message"("author_id", "pub_date" DESC);

-- CreateIndex
CREATE INDEX "User_user_id_idx" ON "User"("user_id");
