// Script para inserir cursos padrão
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCursos() {
  try {
    // Inserir cursos se não existirem
    const cursos = [
      'Téc. Análise e Desenvolvimento de Sistemas',
      'Téc. Administração',
      'Téc. Plástico',
      'Téc. Mecânica Industrial',
      'Téc. Logística',
      'Téc. Eletroeletrônica'
    ];

    for (const nomeCurso of cursos) {
      await prisma.curso.upsert({
        where: { nome: nomeCurso },
        update: {},
        create: { nome: nomeCurso }
      });
    }

    console.log('Cursos inseridos com sucesso!');
    
    // Listar todos os cursos
    const todosCursos = await prisma.curso.findMany();
    console.log('Cursos disponíveis:', todosCursos);

  } catch (error) {
    console.error('Erro ao inserir cursos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCursos();