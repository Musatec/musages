
const { Pool } = require('pg');
require('dotenv').config();

async function testDirect() {
  // We construct the direct URL from the pooler one
  // Pooler: postgresql://postgres.ephsigjminwavcymicxa:PASSWORD@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
  // Direct: postgresql://postgres.ephsigjminwavcymicxa:PASSWORD@db.ephsigjminwavcymicxa.supabase.co:5432/postgres
  
  const poolerUrl = process.env.DATABASE_URL;
  const directUrl = poolerUrl.replace('aws-1-eu-north-1.pooler.supabase.com:6543', 'db.ephsigjminwavcymicxa.supabase.co:5432');
  
  console.log('Testing DIRECT connection to:', directUrl.split('@')[1]);
  
  const pool = new Pool({ 
    connectionString: directUrl,
    connectionTimeoutMillis: 20000,
    ssl: { rejectUnauthorized: false }
  });

  const start = Date.now();
  try {
    const client = await pool.connect();
    console.log(`✅ DIRECT Connected in ${Date.now() - start}ms`);
    const res = await client.query('SELECT NOW()');
    console.log(`✅ Query successful: ${res.rows[0].now}`);
    client.release();
  } catch (err) {
    console.error(`❌ DIRECT Connection failed after ${Date.now() - start}ms`);
    console.error('Error:', err.message);
    console.log('Note: This might fail if your network blocks port 5432 or if you are using IPv4 on an IPv6-only host.');
  } finally {
    await pool.end();
  }
}

testDirect();
