import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const fallbackDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/phishing_sim_dashboard?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // `prisma generate` only needs a valid datasource string, not a live DB connection.
    url: env("DATABASE_URL", fallbackDatabaseUrl),
  },
});
