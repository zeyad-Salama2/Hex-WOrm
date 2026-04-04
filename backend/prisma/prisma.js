require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma/client.js");

const localDatabaseUrl = "postgresql://postgres:postgres@localhost:5432/phishing_sim_dashboard?schema=public";
const connectionString = process.env.DATABASE_URL || localDatabaseUrl;

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

module.exports = prisma;