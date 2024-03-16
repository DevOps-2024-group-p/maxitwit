-- CreateTable
CREATE TABLE "Follower" (
    "who_id" INTEGER NOT NULL,
    "whom_id" INTEGER NOT NULL,

    CONSTRAINT "Follower_pkey" PRIMARY KEY ("who_id","whom_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "message_id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "pub_date" INTEGER,
    "flagged" INTEGER,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pw_hash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Follower" ADD CONSTRAINT "Follower_whom_id_fkey" FOREIGN KEY ("whom_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
