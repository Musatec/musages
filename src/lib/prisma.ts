import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import "dotenv/config";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const db = new Database(dbPath);
const adapter = new (PrismaBetterSqlite3 as any)({ db, url: `file:${dbPath}` });

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
