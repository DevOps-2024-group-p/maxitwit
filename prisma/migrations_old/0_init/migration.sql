-- CreateTable
CREATE TABLE "Follower" (
    "who_id" INTEGER NOT NULL,
    "whom_id" INTEGER NOT NULL,

    PRIMARY KEY ("who_id", "whom_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "message_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "author_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "pub_date" INTEGER,
    "flagged" INTEGER,
    CONSTRAINT "Message_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pw_hash" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

