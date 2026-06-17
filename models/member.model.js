const mongoose = require("mongoose");
const { Schema } = mongoose;

const memberSchema = new Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  subCouncil: {type: String, required: true},
  occupation: {type: String, required: true},
  email: {type: String, required: true},
  password: { type: String },
  mustChangePassword: { type: Boolean, default: true },
  phoneNumber: {type: String, required: true},
  placeOfInitiation: {type: String, required: true},
  yearOfInitiation: {type: String, required: true},
  officeAddress: {type: String, required: true},
  residentialAddress: {type: String, required: true},
  homeParish: {type: String, required: true},
  officeHeld: {type: String, required: true},
  previousOfficesHeld: {type: [String], required: false},
  degree: {type: String, required: true},
  profilePhoto: { type: String, default: null },
  resetToken:       { type: String },
  resetTokenExpiry: { type: Date },
});

const Member = mongoose.model("Member", memberSchema, "member_data");

module.exports = Member;
