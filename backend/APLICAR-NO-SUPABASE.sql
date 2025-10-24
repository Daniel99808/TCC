-- ========================================
-- EXECUTAR ESTE SQL NO SUPABASE
-- SQL Editor > New Query > Colar e executar
-- ========================================

-- Adicionar campos de segmentação ao modelo Mural
ALTER TABLE "Mural" 
ADD COLUMN IF NOT EXISTS "tipoPublico" TEXT NOT NULL DEFAULT 'TODOS',
ADD COLUMN IF NOT EXISTS "cursoId" INTEGER,
ADD COLUMN IF NOT EXISTS "turma" TEXT;

-- Adicionar foreign key para o curso (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Mural_cursoId_fkey'
    ) THEN
        ALTER TABLE "Mural" 
        ADD CONSTRAINT "Mural_cursoId_fkey" 
        FOREIGN KEY ("cursoId") 
        REFERENCES "Curso"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'Mural' 
ORDER BY ordinal_position;
