const express = require("express");
const AuthController = require("../controllers/auth.controller");
const requireAuth = require("../middlewares/auth.middleware");
const rateLimiter = require("../middlewares/rateLimiter.middleware");

const router = express.Router();

router.get("/me", requireAuth, AuthController.getMe);
router.post("/login", rateLimiter, AuthController.login);
router.post("/logout", AuthController.logout);

router.post("/change-password", AuthController.changePassword);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

module.exports = router;
