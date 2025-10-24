const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de usuários com roles...');

  // Hash para a senha padrão: "123456"
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. ADMIN
  const admin = await prisma.user.upsert({
    where: { cpf: '11111111111' },
    update: {},
    create: {
      nome: 'Administrador Sistema',
      cpf: '11111111111',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin criado:', admin.nome, '- CPF:', admin.cpf);

  // 2. PROFESSOR
  const professor = await prisma.user.upsert({
    where: { cpf: '22222222222' },
    update: {},
    create: {
      nome: 'Professor João Silva',
      cpf: '22222222222',
      password: hashedPassword,
      role: 'PROFESSOR',
    },
  });
  console.log('Professor criado:', professor.nome, '- CPF:', professor.cpf);

  // 3. ESTUDANTE
  const estudante = await prisma.user.upsert({
    where: { cpf: '33333333333' },
    update: {},
    create: {
      nome: 'Estudante Maria Santos',
      cpf: '33333333333',
      password: hashedPassword,
      role: 'ESTUDANTE',
    },
  });
  console.log('Estudante criado:', estudante.nome, '- CPF:', estudante.cpf);

  console.log('\nSeed concluído com sucesso!');
  console.log('\nCredenciais para teste:');
  console.log('════════════════════════════════════════');
  console.log('ADMIN:');
  console.log('  CPF: 111.111.111-11 ou 11111111111');
  console.log('  Senha: 123456');
  console.log('  Acesso: Painel Administrativo');
  console.log('');
  console.log('PROFESSOR:');
  console.log('  CPF: 222.222.222-22 ou 22222222222');
  console.log('  Senha: 123456');
  console.log('  Acesso: Área do Professor');
  console.log('');
  console.log('ESTUDANTE:');
  console.log('  CPF: 333.333.333-33 ou 33333333333');
  console.log('  Senha: 123456');
  console.log('  Acesso: Área do Estudante');
  console.log('════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
