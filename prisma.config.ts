import "dotenv/config";
import { defineConfig } from "@prisma/config";
import path from "node:path";
import { pathToFileURL } from "node:url";

const sqlitePath = path.resolve(
  process.env.SQLITE_DB_PATH || path.join(process.cwd(), "prisma", "dev.db"),
);

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: pathToFileURL(sqlitePath).href,
  },
});
