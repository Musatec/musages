const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connexion à:', process.env.DATABASE_URL.split('@')[1]);
    await client.connect();
    console.log('✅ Connexion TCP simple réussie!');
    const res = await client.query('SELECT count(*) FROM "User"');
    console.log('✅ Requête SQL réussie! Nombre d\'utilisateurs:', res.rows[0].count);
    const users = await client.query('SELECT email FROM "User" LIMIT 5');
    console.log('Emails existants:', users.rows.map(r => r.email));
  } catch (err) {
    console.error('❌ Échec de la connexion:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();
