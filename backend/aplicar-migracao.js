const { Client } = require('pg');
require('dotenv').config();

async function aplicarMigracao() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Conectando ao banco de dados...');
    await client.connect();
    console.log('Conectado!');

    console.log('\n1. Adicionando coluna tipoPublico...');
    await client.query(`
      ALTER TABLE "Mural" 
      ADD COLUMN IF NOT EXISTS "tipoPublico" TEXT NOT NULL DEFAULT 'TODOS'
    `);
    console.log('Coluna tipoPublico adicionada');

    console.log('\n2. Adicionando coluna cursoId...');
    await client.query(`
      ALTER TABLE "Mural" 
      ADD COLUMN IF NOT EXISTS "cursoId" INTEGER
    `);
    console.log('Coluna cursoId adicionada');

    console.log('\n3. Adicionando coluna turma...');
    await client.query(`
      ALTER TABLE "Mural" 
      ADD COLUMN IF NOT EXISTS "turma" TEXT
    `);
    console.log('Coluna turma adicionada');

    console.log('\n4. Adicionando foreign key...');
    try {
      await client.query(`
        ALTER TABLE "Mural" 
        ADD CONSTRAINT "Mural_cursoId_fkey" 
        FOREIGN KEY ("cursoId") 
        REFERENCES "Curso"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
      `);
      console.log('Foreign key adicionada');
    } catch (err) {
      if (err.code === '42P07' || err.message.includes('already exists')) {
        console.log('Foreign key já existe');
      } else {
        throw err;
      }
    }

    console.log('\n5. Verificando estrutura da tabela...');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'Mural' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nEstrutura da tabela Mural:');
    console.table(result.rows);

    console.log('\nMIGRAÇÃO APLICADA COM SUCESSO!');

  } catch (error) {
    console.error('\nErro ao aplicar migração:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('\nConexão fechada');
  }
}

aplicarMigracao()
  .then(() => {
    console.log('\nProcesso concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nProcesso falhou:', error);
    process.exit(1);
  });
