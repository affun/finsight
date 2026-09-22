import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Read directly so `prisma generate` works without DATABASE_URL set.
    // Commands that need a live database (migrate, db seed, db push) require it.
    url: process.env.DATABASE_URL ?? "",
  },
});
