import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function createDb() {
  const url = process.env.TURSO_DATABASE_URL;

  if (!url) {
    throw new Error(
      "Falta TURSO_DATABASE_URL. Copia .env.example a .env.local y configura la base de datos.",
    );
  }

  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });

  return drizzle(client, { schema });
}

const globalForDb = globalThis as unknown as {
  sorteillosDb?: ReturnType<typeof createDb>;
};

export const db = globalForDb.sorteillosDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.sorteillosDb = db;
}
