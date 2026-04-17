import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
  console.warn("⚠️ DATABASE_URL is missing from environment variables during production build!");
}

// Configuration du pool optimisée pour le pooler Supabase (port 6543 / Transaction mode)
const pool = new Pool({ 
  connectionString,
  // Indispensable pour le Transaction Mode de Supavisor/PgBouncer
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
