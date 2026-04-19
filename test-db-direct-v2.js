
const { Pool } = require('pg');
require('dotenv').config();

async function testDirectV2() {
  const poolerUrl = process.env.DATABASE_URL;
  const directUrl = poolerUrl.replace('aws-1-eu-north-1.pooler.supabase.com:6543', 'ephsigjminwavcymicxa.supabase.co:5432');
  
  console.log('Testing DIRECT V2 connection to:', directUrl.split('@')[1]);
  
  const pool = new Pool({ 
    connectionString: directUrl,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log(`✅ Connected in direct mode!`);
    client.release();
  } catch (err) {
    console.error(`❌ Failed:`, err.message);
  } finally {
    await pool.end();
  }
}

testDirectV2();
