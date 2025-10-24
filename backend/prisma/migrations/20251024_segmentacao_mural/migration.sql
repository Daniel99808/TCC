-- Migration: Adicionar segmentação ao Mural
-- Criado em: 2025-10-24

-- Adicionar colunas
ALTER TABLE "Mural" ADD COLUMN IF NOT EXISTS "tipoPublico" TEXT NOT NULL DEFAULT 'TODOS';
ALTER TABLE "Mural" ADD COLUMN IF NOT EXISTS "cursoId" INTEGER;
ALTER TABLE "Mural" ADD COLUMN IF NOT EXISTS "turma" TEXT;

-- Adicionar foreign key
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Mural_cursoId_fkey') THEN
        ALTER TABLE "Mural" ADD CONSTRAINT "Mural_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
