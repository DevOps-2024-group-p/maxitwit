-- CreateTable
CREATE TABLE "follower" (
    "who_id" INTEGER NOT NULL,
    "whom_id" INTEGER NOT NULL,

    PRIMARY KEY ("who_id", "whom_id")
);

-- CreateTable
CREATE TABLE "message" (
    "message_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "author_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "pub_date" INTEGER,
    "flagged" INTEGER
);

-- CreateTable
CREATE TABLE "user" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pw_hash" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
