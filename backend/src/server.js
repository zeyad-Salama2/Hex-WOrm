require("dotenv").config();

const express = require("express");
const cors = require("cors");
const prisma = require("../prisma/prisma.js");

const helmet = require("helmet");

const mainRouter = require("./routes/app_routes.js");
const campaignRouter = require("./routes/campaign_routes.js"); // NEW
const notFoundMiddleware = require("./middleware/not_found.js");
const errorHandlerMiddleware = require("./middleware/error_handler.js");

// Middleware Wall
const app = express();
app.use(cors());
app.locals.dbStatus = {
  ready: false,
  lastError: null,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// '/' and '/health' have both been moved into routes/app_routes.js
app.use("/", mainRouter);

// Campaign routes
app.use("/campaigns", campaignRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
// Middleware Wall Over :)

const port = process.env.APP_PORT || process.env.PORT || 4000;
const databaseRetryDelayMs = 5000;

const verifyDatabaseConnection = async () => {
  try {
    await prisma.$connect();

    const result = await prisma.$queryRaw`
      SELECT current_database()::text AS db, current_user::text AS usr
    `;

    const details = Array.isArray(result) ? result[0] : result;

    console.log(
      `[startup] Prisma connected to database "${details?.db}" as "${details?.usr}"`
    );

    app.locals.dbStatus = {
      ready: true,
      lastError: null,
    };
  } catch (error) {
    app.locals.dbStatus = {
      ready: false,
      lastError: error.message,
    };
    console.error("[startup] Prisma connection test failed:", error);
    throw error;
  }
};

const connectToDatabaseWithRetry = async () => {
  try {
    await verifyDatabaseConnection();
  } catch (error) {
    console.error(
      `[startup] Retrying database connection in ${databaseRetryDelayMs / 1000}s`
    );
    setTimeout(connectToDatabaseWithRetry, databaseRetryDelayMs);
  }
};

app.listen(port, () => {
  console.log(`[startup] Backend on http://localhost:${port}`);
  connectToDatabaseWithRetry();
});
