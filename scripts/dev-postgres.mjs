/**
 * Spins up a local embedded PostgreSQL for development — no Docker or
 * system install required. Data lives in ./pgdata (gitignored).
 *
 * Safe to run repeatedly: if ./pgdata already contains an initialized
 * cluster it is reused instead of re-running initdb.
 *
 * Usage: node scripts/dev-postgres.mjs
 * Stop with Ctrl+C (shuts the database down cleanly).
 */
import { existsSync } from "node:fs";
import EmbeddedPostgres from "embedded-postgres";

const PORT = Number(process.env.PGPORT ?? 5432);
// Override with DB_NAME when several worktrees share one Postgres instance
// (each checkout points its .env at its own database, e.g. finsight_1).
const DB_NAME = process.env.DB_NAME ?? "finsight";
const DATA_DIR = "./pgdata";

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
});

async function main() {
  // initdb refuses to run on a non-empty directory — only initialize once.
  if (existsSync(`${DATA_DIR}/PG_VERSION`)) {
    console.log("[dev-postgres] reusing existing cluster in ./pgdata");
  } else {
    await pg.initialise();
  }
  await pg.start();
  try {
    await pg.createDatabase(DB_NAME);
    console.log(`[dev-postgres] created database "${DB_NAME}"`);
  } catch {
    // Already exists — fine.
  }
  console.log(`[dev-postgres] PostgreSQL ready on localhost:${PORT} (user: postgres, db: ${DB_NAME})`);
  console.log("[dev-postgres] Press Ctrl+C to stop.");
}

async function shutdown(code) {
  console.log("\n[dev-postgres] Shutting down…");
  try {
    await pg.stop();
  } finally {
    process.exit(code);
  }
}

main().catch(async (err) => {
  console.error("[dev-postgres] failed:", err.message ?? err);
  await shutdown(1);
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
