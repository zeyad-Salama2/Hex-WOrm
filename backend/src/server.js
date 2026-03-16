require("dotenv").config();

const express = require("express");
const cors = require("cors");
const prisma = require("../prisma/prisma.js");

const mainRouter = require("./routes/app_routes.js");
const notFoundMiddleware = require("./middleware/not_found.js");
const errorHandlerMiddleware = require("./middleware/error_handler.js");

// Middleware Wall
const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// '/' and '/health' have both been moved into routes/app_routes.js
app.use("/", mainRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
// Middleware Wall Over :)

const port = process.env.PORT || 4000;

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
  } catch (error) {
    console.error("[startup] Prisma connection test failed:", error);
    throw error;
  }
};

const start = async () => {
  try {
    await verifyDatabaseConnection();
    app.listen(port, () => console.log(`Backend on http://localhost:${port}`));
  } catch (error) {
    console.error("[startup] Backend failed to start:", error);
    process.exit(1);
  }
};

start();
