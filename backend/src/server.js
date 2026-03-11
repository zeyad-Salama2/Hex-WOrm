require("dotenv").config();

const express = require("express");

const cors = require("cors");
const prisma = require("../prisma/prisma.js");

const mainRouter = require("./routes/app_routes.js");
const campaignRouter = require("./routes/campaign_routes.js"); // NEW
const notFoundMiddleware = require("./middleware/not_found.js");
const errorHandlerMiddleware = require("./middleware/error_handler.js");



// Middleware Wall

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// '/' and '/health' have both been moved into routes/app_routes.js
app.use("/",mainRouter);

// Campaign routes
app.use("/campaigns", campaignRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Middleware Wall Over :)

const port = process.env.PORT || 4000;

const start = async () => {
    try {
        app.listen(port, () => console.log(`Backend on http://localhost:${4000}`));
    } catch (error) {
        console.log(error);
    }
}

start();