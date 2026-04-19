
const { Pool } = require('pg');
require('dotenv').config();

async function listTables() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in database:", res.rows.map(r => r.table_name).join(", "));
  } catch (err) {
    console.error("Error listing tables:", err.message);
  } finally {
    await pool.end();
  }
}

listTables();
