// scripts/assignPasswords.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto"); // built into Node, no install needed
const MemberModel = require("../models/member.model");

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
  console.log("Connected to MongoDB\n");

  // Find members who don't have a password yet
  const members = await MemberModel.find({ password: { $exists: false } });

  if (members.length === 0) {
    console.log("No members without passwords found.");
    process.exit(0);
  }

  console.log(`Found ${members.length} member(s) without passwords:\n`);

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

    console.log(`✓ ${member.firstName} ${member.lastName} — ${member.email}`);
  }

  // Print a clean summary table you can copy from terminal
  console.log("\n======= SAVE THIS — passwords will not be shown again =======\n");
  console.table(results);
  console.log("\n=============================================================\n");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Script failed:", err.message);
  process.exit(1);
});