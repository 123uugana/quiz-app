import "server-only";

import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env.local");
}

const globalForDatabase = globalThis as unknown as {
  __quizDatabasePool?: Pool;
};

export const db =
  globalForDatabase.__quizDatabasePool ??
  new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.__quizDatabasePool = db;
}
