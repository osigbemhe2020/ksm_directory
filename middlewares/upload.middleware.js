// middlewares/upload.middleware.js
const { uploadPortalDocument } = require("../config/cloudinary");
const multer = require('multer');

// ---- Existing: Portal document upload (PDF) ----
const handleUpload = (req, res, next) => {
  uploadPortalDocument.single('document')(req, res, (err) => {
    if (err) return res.status(400).json({ status: "failed", message: err.message });
    next();
  });
};

// ---- New: Registration profile photo upload ----
const registrationUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Profile photo must be an image'), false);
    }
  },
}).fields([
  { name: 'profilePhoto', maxCount: 1 },
]);

const handleRegistrationUpload = (req, res, next) => {
  registrationUpload(req, res, (err) => {
    if (err) return res.status(400).json({ status: "failed", message: err.message });
    next();
  });
};

module.exports = { handleUpload, handleRegistrationUpload };