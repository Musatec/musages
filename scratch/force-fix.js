const { Pool } = require('pg');

const connectionString = "postgresql://postgres.ephsigjminwavcymicxa:MusaSaaS2026@aws-1-eu-north-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function forceFix() {
  try {
    console.log('--- REPARATION DE FORCE DES PERMISSIONS ---');
    
    // Désactiver RLS temporairement sur les tables vitales si nécessaire
    // Mais on va d'abord tenter de redonner les droits au rôle postgres
    
    const queries = [
      'ALTER SCHEMA public OWNER TO postgres',
      'GRANT USAGE ON SCHEMA public TO postgres',
      'GRANT ALL ON SCHEMA public TO postgres',
      'GRANT ALL ON SCHEMA public TO authenticated',
      'GRANT ALL ON SCHEMA public TO service_role',
      'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres',
      'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres',
      'GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres',
      'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated',
      'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated',
      'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres',
      'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated'
    ];

    for (let q of queries) {
      try {
        console.log(`Running: ${q}`);
        await pool.query(q);
      } catch (e) {
        console.error(`Failed: ${q} -> ${e.message}`);
      }
    }

    console.log('✅ FIN DE LA REPARATION DE FORCE.');
  } catch (err) {
    console.error('❌ CRITICAL FAILURE:', err);
  } finally {
    await pool.end();
  }
}

forceFix();
