const { Pool } = require('pg');

const connectionString = "postgresql://postgres.ephsigjminwavcymicxa:MusaSaaS2026@aws-1-eu-north-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkUsers() {
  try {
    const res = await pool.query('SELECT count(*) FROM "User"');
    console.log('Total Users:', res.rows[0].count);
    
    const tables = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    console.log('Available Tables:', tables.rows.map(r => r.tablename));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkUsers();
