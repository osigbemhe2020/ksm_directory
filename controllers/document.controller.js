// controllers/document.controller.js
const DocumentModel = require("../models/document.model");
const { uploadToCloudinary } = require('../config/cloudinary');
const cloudinary = require("cloudinary").v2;

// Get all documents — any logged in member can access
const getDocuments = async (req, res) => {
  try {
    const documents = await DocumentModel.find()
      .sort({ uploadedAt: -1 })
      .populate('uploadedBy', 'firstName lastName');

    res.status(200).json({ status: "success", documents });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

const uploadDocument = async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ status: "failed", message: "No file uploaded" });
    }

    if (!title || !category) {
      return res.status(400).json({ status: "failed", message: "Title and category are required" });
    }

    // Upload buffer to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    const document = await DocumentModel.create({
      title,
      category,
      url:        cloudinaryResult.secure_url,  // ← Cloudinary URL
      publicId:   cloudinaryResult.public_id,   // ← for deletion later
      uploadedBy: req.session.user.id,
    });

    res.status(201).json({ status: "success", document });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

// Delete document — admin only
const deleteDocument = async (req, res) => {
  try {
    const document = await DocumentModel.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ status: "failed", message: "Document not found" });
    }

    // Delete from Cloudinary first
    await cloudinary.uploader.destroy(document.publicId, { resource_type: 'raw' });

    // Then delete from MongoDB
    await DocumentModel.findByIdAndDelete(req.params.id);

    res.status(200).json({ status: "success", message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

module.exports = { getDocuments, uploadDocument, deleteDocument };