// models/document.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const documentSchema = new Schema({
  title:      { type: String, required: true },
  category:   { type: String, required: true }, 
  url:        { type: String, required: true }, 
  publicId:   { type: String, required: true },
  fileType:   { type: String },                
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Document", documentSchema);