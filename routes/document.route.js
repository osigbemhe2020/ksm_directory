const express = require("express");
const router = express.Router();
const DocumentController = require("../controllers/document.controller");
const { handleUpload } = require("../middlewares/upload.middleware");

router.get("/",DocumentController.getDocuments);

// Only admins can upload and delete
router.post("/upload", handleUpload, DocumentController.uploadDocument);
router.delete("/:id", DocumentController.deleteDocument);

module.exports = router;