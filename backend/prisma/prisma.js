require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma/client.js");
<<<<<<< HEAD
const bcrypt = require("bcrypt");
=======
>>>>>>> origin/email-feature

const localDatabaseUrl = "postgresql://postgres:postgres@localhost:5432/phishing_sim_dashboard?schema=public";
const connectionString = process.env.DATABASE_URL || localDatabaseUrl;

const adapter = new PrismaPg({ connectionString });

<<<<<<< HEAD
// The extension part of this basically automatically calls bcrypt whenever we call create or update.
// I'm not sure if this applies to adjacent operations like CreateMany or UpdateMany, so if we start using
// those then keep an eye out for that
const prisma = new PrismaClient({ adapter }).$extends({
    query: {
        user: {
          $allOperations({ operation, args, query }) {
            if (['create', 'update'].includes(operation) && args.data['passwordHash']) {
                console.log("extension triggered");
              args.data['passwordHash'] = bcrypt.hashSync(args.data['passwordHash'], 10)
            }
            return query(args)
          }
        }
      }
});

module.exports = prisma;
=======
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
>>>>>>> origin/email-feature
