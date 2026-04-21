const { Pool } = require('pg');

const connectionString = "postgresql://postgres.ephsigjminwavcymicxa:MusaSaaS2026@aws-1-eu-north-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});

async function test() {
  try {
    console.log('Connecting to direct port 5432...');
    const res = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    console.log('Tables:', res.rows.map(r => r.tablename));
  } catch (err) {
    console.error('CRITICAL ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

test();
