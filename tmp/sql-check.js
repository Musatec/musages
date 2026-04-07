
const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:MusaProjet2026@ephsigjminwavcymicxa.supabase.co:5432/postgres"
});

async function run() {
  await client.connect();
  try {
    const res = await client.query('SELECT id, email, password FROM "User"');
    console.log("=== COMPTES DANS LA TABLE PUBLIQUE USER ===");
    console.table(res.rows);
    console.log("============================================");
  } catch (err) {
    console.error("Erreur de requête:", err.message);
  } finally {
    await client.end();
  }
}

run();
