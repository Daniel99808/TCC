-- Adicionar campos de segmentação ao modelo Mural
ALTER TABLE "Mural" 
ADD COLUMN "tipoPublico" TEXT NOT NULL DEFAULT 'TODOS',
ADD COLUMN "cursoId" INTEGER,
ADD COLUMN "turma" TEXT;

-- Adicionar foreign key para o curso
ALTER TABLE "Mural" 
ADD CONSTRAINT "Mural_cursoId_fkey" 
FOREIGN KEY ("cursoId") 
REFERENCES "Curso"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Comentários para documentação
COMMENT ON COLUMN "Mural"."tipoPublico" IS 'Tipo de público: TODOS, CURSO, TURMA';
COMMENT ON COLUMN "Mural"."cursoId" IS 'ID do curso específico (se tipoPublico = CURSO ou TURMA)';
COMMENT ON COLUMN "Mural"."turma" IS 'Turma específica: A, B, C, etc (se tipoPublico = TURMA)';
