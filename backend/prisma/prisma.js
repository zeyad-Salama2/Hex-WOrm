require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma/client.js");
const bcrypt = require("bcrypt");

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

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