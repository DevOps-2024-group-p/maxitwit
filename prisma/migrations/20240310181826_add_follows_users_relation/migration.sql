-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Follower" (
    "who_id" INTEGER NOT NULL,
    "whom_id" INTEGER NOT NULL,

    PRIMARY KEY ("who_id", "whom_id"),
    CONSTRAINT "Follower_whom_id_fkey" FOREIGN KEY ("whom_id") REFERENCES "User" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Follower" ("who_id", "whom_id") SELECT "who_id", "whom_id" FROM "Follower";
DROP TABLE "Follower";
ALTER TABLE "new_Follower" RENAME TO "Follower";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
