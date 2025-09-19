/*
  Warnings:

  - You are about to drop the column `fim` on the `Calendario` table. All the data in the column will be lost.
  - Added the required column `cursoId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Curso" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL
);

-- Insert default courses
INSERT INTO "Curso" ("nome") VALUES 
  ('Análise e Desenvolvimento de Sistemas'),
  ('Gestão da Tecnologia da Informação'),
  ('Ciência da Computação'),
  ('Engenharia de Software'),
  ('Sistemas de Informação'),
  ('Redes de Computadores');

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Calendario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "inicio" DATETIME NOT NULL
);
INSERT INTO "new_Calendario" ("descricao", "id", "inicio", "titulo") SELECT "descricao", "id", "inicio", "titulo" FROM "Calendario";
DROP TABLE "Calendario";
ALTER TABLE "new_Calendario" RENAME TO "Calendario";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cpf" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cursoId" INTEGER NOT NULL,
    CONSTRAINT "User_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
-- Insert users with default course (Análise e Desenvolvimento de Sistemas - id 1)
INSERT INTO "new_User" ("cpf", "createdAt", "id", "password", "cursoId") 
SELECT "cpf", "createdAt", "id", "password", 1 FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Curso_nome_key" ON "Curso"("nome");
