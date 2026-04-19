
const { Pool } = require('pg');
require('dotenv').config();

async function testLatency() {
  const url = process.env.DATABASE_URL;
  console.log('Testing connection to:', url.split('@')[1]);
  
  const pool = new Pool({ 
    connectionString: url,
    connectionTimeoutMillis: 20000,
    ssl: { rejectUnauthorized: false }
  });

  const start = Date.now();
  try {
    const client = await pool.connect();
    console.log(`✅ Connected in ${Date.now() - start}ms`);
    const res = await client.query('SELECT NOW()');
    console.log(`✅ Query successful: ${res.rows[0].now}`);
    client.release();
  } catch (err) {
    console.error(`❌ Connection failed after ${Date.now() - start}ms`);
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

testLatency();
