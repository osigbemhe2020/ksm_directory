const express = require("express");
const MemberController = require("../controllers/member.controller");
const { handleRegistrationUpload } = require('../middlewares/upload.middleware');

const router = express.Router();

// Public route - no auth required


// Protected routes - auth required
router.get("/", MemberController.getAll);
router.get("/filter", MemberController.getFilterOptions);
router.patch('/:id/photo', handleRegistrationUpload, MemberController.updateProfilePhoto);
router.get("/:id", MemberController.getById);
router.put("/:id", MemberController.update);
router.patch("/:id/office", MemberController.updateOffice);
router.delete("/:id", MemberController.remove);

module.exports = router;
