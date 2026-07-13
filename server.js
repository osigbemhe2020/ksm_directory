// server.js
require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");
const logger = require("./logger");

const startServer = async () => {
  await connectDB(); // ← DB connects before app starts

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info({ port }, "Server is running");
  });
};

startServer();