const { spawnSync } = require("child_process");

const fallbackDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/phishing_sim_dashboard?schema=public";

const prismaBin = process.platform === "win32" ? "npx.cmd" : "npx";

const result = spawnSync(
  prismaBin,
  ["prisma", "generate", "--schema", "prisma/schema.prisma"],
  {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || fallbackDatabaseUrl,
    },
  }
);

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
