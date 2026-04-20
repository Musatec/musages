
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Product'
      ORDER BY ordinal_position;
    `);
    console.log('--- ACTUAL COLUMNS IN DATABASE ---');
    res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
