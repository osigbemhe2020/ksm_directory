// scripts/assignPasswords.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto"); // built into Node, no install needed
const MemberModel = require("../models/member.model");
const logger = require("../logger");

// ---- config ----
const SALT_ROUNDS = 12;
const PASSWORD_LENGTH = 12;
// ----------------

const generatePassword = () => {
  return crypto.randomBytes(PASSWORD_LENGTH).toString("base64").slice(0, PASSWORD_LENGTH);
  // produces something like: "aB3$kL9mXq2R"
};

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  logger.info("Connected to MongoDB");

  // Find members who don't have a password yet
  const members = await MemberModel.find({ password: { $exists: false } });

  if (members.length === 0) {
    logger.info("No members without passwords found.");
    process.exit(0);
  }

  logger.info({ count: members.length }, "Members without passwords found");

  const results = [];

  for (const member of members) {
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    await MemberModel.updateOne(
      { _id: member._id },
      {
        $set: {
          password: hashedPassword,
          mustChangePassword: true,
        },
      }
    );

    results.push({
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
      temporaryPassword: plainPassword, // plain text — log once, then gone
    });

    logger.info({ name: `${member.firstName} ${member.lastName}`, email: member.email }, "Password assigned");
  }

  logger.info({ results }, "Password assignment summary");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  logger.error({ err }, "Script failed");
  process.exit(1);
});