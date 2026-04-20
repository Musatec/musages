import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
  console.warn("⚠️ DATABASE_URL is missing from environment variables during production build!");
}

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined,
  pool: Pool | undefined 
};

// Singleton pour le Pool (évite de saturer Supabase en dev)
const pool = globalForPrisma.pool || new Pool({ 
  connectionString,
  max: 5, // Réduit pour éviter de saturer PgBouncer
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 90000, // Augmenté à 90s pour les connexions critiques
  statement_timeout: 90000, // Timeout au niveau SQL
  ssl: {
    rejectUnauthorized: false
  }
});

if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
