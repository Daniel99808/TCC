-- SQL para criar as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Tabela de Cursos
CREATE TABLE IF NOT EXISTS public."Curso" (
    id SERIAL PRIMARY KEY,
    nome VARCHAR UNIQUE NOT NULL
);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS public."User" (
    id SERIAL PRIMARY KEY,
    nome VARCHAR UNIQUE NOT NULL,
    cpf VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "cursoId" INTEGER REFERENCES public."Curso"(id)
);

-- Tabela de Mural
CREATE TABLE IF NOT EXISTS public."Mural" (
    id SERIAL PRIMARY KEY,
    conteudo TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Calendário
CREATE TABLE IF NOT EXISTS public."Calendario" (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR NOT NULL,
    descricao TEXT NOT NULL,
    data TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabela de Conversas
CREATE TABLE IF NOT EXISTS public."Conversa" (
    id SERIAL PRIMARY KEY,
    "usuario1Id" INTEGER NOT NULL REFERENCES public."User"(id),
    "usuario2Id" INTEGER NOT NULL REFERENCES public."User"(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("usuario1Id", "usuario2Id")
);

-- Tabela de Mensagens
CREATE TABLE IF NOT EXISTS public."Mensagem" (
    id SERIAL PRIMARY KEY,
    conteudo TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lida BOOLEAN DEFAULT FALSE,
    "remetenteId" INTEGER NOT NULL REFERENCES public."User"(id),
    "conversaId" INTEGER NOT NULL REFERENCES public."Conversa"(id)
);

-- Inserir alguns cursos de exemplo
INSERT INTO public."Curso" (nome) VALUES 
    ('Engenharia de Software'),
    ('Ciência da Computação'),
    ('Sistemas de Informação')
ON CONFLICT (nome) DO NOTHING;

-- Configurar RLS (Row Level Security) se necessário
-- ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public."Curso" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public."Mural" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public."Calendario" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public."Conversa" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public."Mensagem" ENABLE ROW LEVEL SECURITY;