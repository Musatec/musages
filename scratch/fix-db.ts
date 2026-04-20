
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
      console.error('DATABASE_URL missing');
      return;
  }

  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- ATTEMPTING DIRECT SQL INJECTION ---');
    // Check if column exists first to avoid errors
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Product' AND column_name='image';
    `;
    const res = await pool.query(checkQuery);
    
    if (res.rows.length === 0) {
      console.log('Column "image" does not exist. Adding it...');
      await pool.query('ALTER TABLE "Product" ADD COLUMN "image" TEXT;');
      console.log('Column "image" added successfully!');
    } else {
      console.log('Column "image" already exists.');
    }
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await pool.end();
  }
}

main();
