import "server-only";

import { Pool } from "pg";

const globalForDatabase = globalThis as unknown as {
  __quizDatabasePool?: Pool;
};

function getDatabasePool() {
  if (globalForDatabase.__quizDatabasePool) {
    return globalForDatabase.__quizDatabasePool;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not configured.");
  }

  const pool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  globalForDatabase.__quizDatabasePool = pool;
  return pool;
}

// Route modules are evaluated during `next build`. Delay creating the pool until
// a request actually uses it so builds do not require a live database connection.
export const db = new Proxy({} as Pool, {
  get(_target, property, receiver) {
    const pool = getDatabasePool();
    const value = Reflect.get(pool, property, receiver);
    return typeof value === "function" ? value.bind(pool) : value;
  },
});
