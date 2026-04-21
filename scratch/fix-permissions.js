const { Pool } = require('pg');

const connectionString = "postgresql://postgres.ephsigjminwavcymicxa:MusaSaaS2026@aws-1-eu-north-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function fixPermissions() {
  try {
    console.log('Tentative de réparation des permissions SQL...');
    
    await pool.query(`
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO anon;
      GRANT ALL ON SCHEMA public TO authenticated;
      GRANT ALL ON SCHEMA public TO service_role;
      
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
      GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;
      
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
    `);

    console.log('✅ Permissions restaurées ! Vos onglets devraient revenir après un rafraîchissement.');
  } catch (err) {
    console.error('❌ Erreur SQL:', err.message);
  } finally {
    await pool.end();
  }
}

fixPermissions();
