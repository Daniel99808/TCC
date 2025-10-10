
-- 1. Criar tabela Curso
CREATE TABLE "Curso" (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) UNIQUE NOT NULL
);

-- 2. Criar tabela User
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) UNIQUE NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "cursoId" INTEGER REFERENCES "Curso"(id)
);

-- 3. Criar tabela Mural
CREATE TABLE "Mural" (
  id SERIAL PRIMARY KEY,
  conteudo TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela Calendario
CREATE TABLE "Calendario" (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 5. Criar tabela Conversa
CREATE TABLE "Conversa" (
  id SERIAL PRIMARY KEY,
  "usuario1Id" INTEGER NOT NULL REFERENCES "User"(id),
  "usuario2Id" INTEGER NOT NULL REFERENCES "User"(id),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("usuario1Id", "usuario2Id")
);

-- 6. Criar tabela Mensagem
CREATE TABLE "Mensagem" (
  id SERIAL PRIMARY KEY,
  conteudo TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lida BOOLEAN DEFAULT FALSE,
  "remetenteId" INTEGER NOT NULL REFERENCES "User"(id),
  "conversaId" INTEGER NOT NULL REFERENCES "Conversa"(id)
);

-- 7. Habilitar Row Level Security (RLS) para todas as tabelas
ALTER TABLE "Curso" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Mural" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Calendario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conversa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Mensagem" ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas permissivas (ajuste conforme suas necessidades de segurança)
-- Políticas para Curso
CREATE POLICY "Allow all operations on Curso" ON "Curso" USING (true);

-- Políticas para User
CREATE POLICY "Allow all operations on User" ON "User" USING (true);

-- Políticas para Mural
CREATE POLICY "Allow all operations on Mural" ON "Mural" USING (true);

-- Políticas para Calendario
CREATE POLICY "Allow all operations on Calendario" ON "Calendario" USING (true);

-- Políticas para Conversa
CREATE POLICY "Allow all operations on Conversa" ON "Conversa" USING (true);

-- Políticas para Mensagem
CREATE POLICY "Allow all operations on Mensagem" ON "Mensagem" USING (true);

-- 9. Habilitar Real-time para tabelas que precisam de atualizações em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE "Mural";
ALTER PUBLICATION supabase_realtime ADD TABLE "Mensagem";
ALTER PUBLICATION supabase_realtime ADD TABLE "Calendario";
ALTER PUBLICATION supabase_realtime ADD TABLE "Conversa";

-- 10. Criar função para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Aplicar trigger para atualizar updatedAt na tabela Conversa
CREATE TRIGGER update_conversa_updated_at 
    BEFORE UPDATE ON "Conversa" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Inserir alguns cursos de exemplo (opcional)
INSERT INTO "Curso" (nome) VALUES 
('Tec. Análise e Desenvolvimento de Sistemas'),
('Tec. Administração'),
('Tec. Mecânica'),
('Tec. Logística'),
('Tec. Plástico'),
('Tec. Eletroeletrônica')
ON CONFLICT (nome) DO NOTHING;

-- Script finalizado!
-- Após executar este script, suas tabelas estarão criadas no Supabase
-- com Row Level Security e Real-time habilitados.