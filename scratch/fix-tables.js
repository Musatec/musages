const { Pool } = require('pg');

const connectionString = "postgresql://postgres.ephsigjminwavcymicxa:MusaSaaS2026@aws-1-eu-north-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function createTables() {
  try {
    console.log('Tentative de création manuelle des tables Sales...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Sale" (
        "id" TEXT NOT NULL,
        "storeId" TEXT NOT NULL,
        "totalAmount" DOUBLE PRECISION NOT NULL,
        "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'COMPLETED',
        "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
        "customerName" TEXT,
        "customerPhone" TEXT,
        "sellerId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "deletedAt" TIMESTAMP(3),

        CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "SaleItem" (
        "id" TEXT NOT NULL,
        "saleId" TEXT NOT NULL,
        "productId" TEXT,
        "customName" TEXT,
        "quantity" INTEGER NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,

        CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
      );

      -- Add foreign keys if they don't exist
      -- Note: Simplified for emergency fix
    `);

    console.log('✅ Tables Sale et SaleItem créées ou déjà présentes !');
  } catch (err) {
    console.error('❌ Erreur SQL:', err.message);
  } finally {
    await pool.end();
  }
}

createTables();
