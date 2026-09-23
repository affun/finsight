/**
 * Spins up a local embedded PostgreSQL for development — no Docker or
 * system install required. Data lives in ./pgdata (gitignored).
 *
 * Usage: node scripts/dev-postgres.mjs
 * Stop with Ctrl+C (shuts the database down cleanly).
 */
import EmbeddedPostgres from "embedded-postgres";

const PORT = Number(process.env.PGPORT ?? 5432);
const DB_NAME = "finsight";

const pg = new EmbeddedPostgres({
  databaseDir: "./pgdata",
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
});

async function main() {
  await pg.initialise();
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
