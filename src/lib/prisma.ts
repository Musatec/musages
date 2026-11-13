import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import "dotenv/config";

// Set SQLITE_DB_PATH to a persistent volume when deploying the SQLite app.
const dbPath = path.resolve(
  process.env.SQLITE_DB_PATH || path.join(/*turbopackIgnore: true*/ process.cwd(), "prisma", "dev.db"),
);
const adapter = new PrismaBetterSqlite3({ url: dbPath });

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
