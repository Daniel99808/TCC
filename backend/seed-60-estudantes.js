const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de 60 estudantes adicionais...');
  
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  // Buscar todos os cursos disponíveis
  const cursos = await prisma.curso.findMany();
  if (cursos.length === 0) {
    console.error('Nenhum curso encontrado! Execute seed-cursos.js primeiro.');
    return;
  }
  
  const turmas = ['A', 'B', 'C'];
  
  // Lista de 60 nomes de estudantes
  const nomesEstudantes = [
    'Lucas Mendes', 'Marina Silva', 'Paulo Ricardo', 'Juliana Costa', 'Roberto Santos',
    'Carla Oliveira', 'Marcelo Alves', 'Beatriz Lima', 'Rodrigo Ferreira', 'Tatiana Souza',
    'Fernando Dias', 'Aline Pereira', 'Gustavo Martins', 'Leticia Gomes', 'Vinicius Rocha',
    'Priscila Cardoso', 'Alexandre Moreira', 'Renata Freitas', 'Leonardo Castro', 'Bianca Pinto',
    'Ricardo Nunes', 'Cristiane Torres', 'Matheus Nascimento', 'Adriana Monteiro', 'Andre Araujo',
    'Luciana Azevedo', 'Fabio Teixeira', 'Monica Moraes', 'Joao Pedro', 'Sabrina Batista',
    'Claudio Almeida', 'Simone Correia', 'Edson Barbosa', 'Patricia Ribeiro', 'Sergio Lima',
    'Elaine Santos', 'Alberto Costa', 'Fernanda Rodrigues', 'Daniel Oliveira', 'Camila Fernandes',
    'Marcio Silva', 'Luciene Alves', 'Valter Pereira', 'Andreia Dias', 'Cesar Martins',
    'Silvia Gomes', 'Antonio Carlos', 'Marcia Rocha', 'Jose Roberto', 'Angela Cardoso',
    'Wagner Moreira', 'Rosana Freitas', 'Francisco Castro', 'Claudia Pinto', 'Hamilton Nunes',
    'Denise Torres', 'Mauro Nascimento', 'Vera Monteiro', 'Rogerio Araujo', 'Sandra Azevedo'
  ];
  
  // Começar CPF de onde o seed anterior parou (10000000000 + 40 usuarios = 10000000040)
  let cpfCounter = 10000000040;
  let estudantesCriados = 0;
  
  try {
    console.log('Criando 60 Estudantes...');
    
    for (let i = 0; i < 60; i++) {
      const cpf = String(cpfCounter++);
      const cursoAleatorio = cursos[Math.floor(Math.random() * cursos.length)];
      const turmaAleatoria = turmas[Math.floor(Math.random() * turmas.length)];
      const temAAPM = Math.random() > 0.6; // 40% têm AAPM
      
      await prisma.user.upsert({
        where: { cpf },
        update: {},
        create: {
          nome: nomesEstudantes[i],
          cpf,
          password: hashedPassword,
          role: 'ESTUDANTE',
          cursoId: cursoAleatorio.id,
          hasAAPM: temAAPM,
          turma: turmaAleatoria
        }
      });
      
      console.log(`Estudante: ${nomesEstudantes[i]} - CPF: ${cpf} - Turma: ${turmaAleatoria} - Curso: ${cursoAleatorio.nome} - AAPM: ${temAAPM ? 'Sim' : 'Nao'}`);
      estudantesCriados++;
    }
    
    console.log('\n=== SEED CONCLUIDO ===');
    console.log(`Total de estudantes criados: ${estudantesCriados}`);
    console.log('Turmas: A, B e C');
    console.log('Senha padrão: 123456 para todos');
    console.log(`CPFs: 10000000040 até ${cpfCounter - 1}`);
    
  } catch (error) {
    console.error('Erro ao criar estudantes:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
