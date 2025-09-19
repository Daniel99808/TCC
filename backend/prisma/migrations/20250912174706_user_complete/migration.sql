/*
  Warnings:

  - Added the required column `title` to the `Mural` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mural" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Mural" ("conteudo", "createdAt", "id") SELECT "conteudo", "createdAt", "id" FROM "Mural";
DROP TABLE "Mural";
ALTER TABLE "new_Mural" RENAME TO "Mural";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
