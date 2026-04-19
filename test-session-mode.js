
const { Pool } = require('pg');
require('dotenv').config();

async function testPooler5432() {
  // Try port 5432 on the pooler host
  const poolerUrl = process.env.DATABASE_URL;
  const sessionUrl = poolerUrl.replace(':6543', ':5432');
  
  console.log('Testing SESSION MODE connection to:', sessionUrl.split('@')[1]);
  
  const pool = new Pool({ 
    connectionString: sessionUrl,
    connectionTimeoutMillis: 15000,
    ssl: { rejectUnauthorized: false }
  });

  const start = Date.now();
  try {
    const client = await pool.connect();
    console.log(`✅ SESSION MODE Connected in ${Date.now() - start}ms`);
    client.release();
  } catch (err) {
    console.error(`❌ SESSION MODE Failed:`, err.message);
  } finally {
    await pool.end();
  }
}

testPooler5432();
