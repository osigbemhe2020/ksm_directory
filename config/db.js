const mongoose = require("mongoose");
const logger = require("../logger");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info({ databaseName: mongoose.connection.db.databaseName }, "MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    logger.error({ err: error }, "MongoDB connection error");
    process.exit(1);
  }
};

module.exports = connectDB;