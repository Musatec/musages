import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

// Ignorer les avertissements et contrôles TLS de certificats auto-signés
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const rawUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
const connectionString = rawUrl.split("?")[0];

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined,
  pool: Pool | undefined 
};

const pool = globalForPrisma.pool || new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
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
