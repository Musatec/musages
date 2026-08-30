import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: "postgresql://postgres:postgres@localhost:5432/postgres", connectionTimeoutMillis: 3000 });
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("✅ SUCCÈS LOCAL POSTGRESQL:", res.rows[0].now);
  } catch (err: any) {
    console.error("❌ PAS DE POSTGRESQL LOCAL:", err.message);
  } finally {
    await pool.end();
  }
}

main();
