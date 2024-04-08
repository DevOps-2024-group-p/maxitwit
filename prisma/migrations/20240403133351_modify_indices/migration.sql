-- DropIndex
DROP INDEX "User_user_id_idx";

-- CreateIndex
CREATE INDEX "Message_author_id_idx" ON "Message"("author_id");

-- CreateIndex
CREATE INDEX "Message_pub_date_idx" ON "Message"("pub_date");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
