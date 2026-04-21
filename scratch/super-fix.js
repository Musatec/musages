const { Pool } = require('pg');

const connectionString = "postgresql://postgres.ephsigjminwavcymicxa:MusaSaaS2026@aws-1-eu-north-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function superFix() {
  try {
    console.log('--- REPARATION CRITIQUE DES PERMISSIONS ---');
    
    // 1. Restaurer les droits sur le schéma public
    await pool.query(`
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
      GRANT ALL ON SCHEMA public TO authenticated;
      GRANT ALL ON SCHEMA public TO anon;
      GRANT ALL ON SCHEMA public TO service_role;
      
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
      GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;
      
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

      -- S'assurer que le propriétaire est bien postgres pour les tables critiques
      DO $$ 
      DECLARE 
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'ALTER TABLE public."' || r.tablename || '" OWNER TO postgres';
        END LOOP;
      END $$;
    `);

    // 2. Vérifier si AuditLog existe, sinon le créer
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL,
        "storeId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "details" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('✅ REPARATION TERMINEE. Toutes les tables sont maintenant accessibles.');
  } catch (err) {
    console.error('❌ ERREUR LORS DE LA REPARATION:', err.message);
  } finally {
    await pool.end();
  }
}

superFix();
