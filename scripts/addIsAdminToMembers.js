require("dotenv").config();
const mongoose = require("mongoose");
const MemberModel = require("../models/member.model");

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const result = await MemberModel.updateMany(
    {
      $or: [{ isAdmin: { $exists: false } }, { isAdmin: null }],
    },
    { $set: { isAdmin: false } }
  );

  console.log(`Updated ${result.modifiedCount} member(s) to include isAdmin: false.`);

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Failed to update members:", error);
  process.exit(1);
});
