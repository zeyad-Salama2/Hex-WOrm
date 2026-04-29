const { spawnSync } = require("child_process");
const path = require("path");

const fallbackDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/phishing_sim_dashboard?schema=public";

const prismaCliPath = path.join(
  process.cwd(),
  "node_modules",
  "prisma",
  "build",
  "index.js"
);

const result = spawnSync(
  process.execPath,
  [prismaCliPath, "generate", "--schema", "prisma/schema.prisma"],
  {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || fallbackDatabaseUrl,
    },
  }
);

if (result.error) {
  console.error("[prisma:generate] Failed to start Prisma CLI:", result.error);
  process.exit(1);
}

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
