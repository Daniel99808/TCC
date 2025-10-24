require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Tentando conectar ao Supabase...');
    console.log('URL:', process.env.DATABASE_URL);
    
    await client.connect();
    console.log('Conexão bem-sucedida!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Teste de query:', result.rows[0]);
    
  } catch (error) {
    console.error('Erro de conexão:', error.message);
  } finally {
    await client.end();
  }
}

testConnection();