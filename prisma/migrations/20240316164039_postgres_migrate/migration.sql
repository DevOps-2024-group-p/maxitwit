/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Follower" DROP CONSTRAINT "Follower_whom_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_author_id_fkey";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "MaxiUser" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pw_hash" TEXT NOT NULL,

    CONSTRAINT "MaxiUser_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaxiUser_username_key" ON "MaxiUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "MaxiUser_email_key" ON "MaxiUser"("email");

-- AddForeignKey
ALTER TABLE "Follower" ADD CONSTRAINT "Follower_whom_id_fkey" FOREIGN KEY ("whom_id") REFERENCES "MaxiUser"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "MaxiUser"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
