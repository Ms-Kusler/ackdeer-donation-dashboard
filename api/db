// api/_db.js
import pg from "pg";
const { Pool } = pg;

// Vercel expects DATABASE_URL in Project → Settings → Environment Variables
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Reuse a single pool across invocations
let pool = globalThis._ackdeerPool;
if (!pool) {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  globalThis._ackdeerPool = pool;
}

export default pool;
