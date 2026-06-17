const AuthService = require("../services/auth.service");
const MemberModel = require("../models/member.model");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { sendPasswordResetEmail } = require("../services/email.service");


const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "failed",
      message: "Email and password are required"
    });
  }

  const result = await AuthService.login(email, password);
  
  if (result.status === "failed") {
    return res.status(result.statusCode).json(result);
  }

  const member = result.data;
  
  // Regenerate session ID to prevent session fixation attacks
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ status: "failed", message: "Session error" });

    req.session.user = {
      id: member._id,
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      mustChangePassword: member.mustChangePassword
    };

    res.status(200).json({
      status: "success",
      message: "Login successful",
      user: req.session.user
    });
  });
};

const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        status: "failed",
        message: "Logout failed"
      });
    }

    res.clearCookie("connect.sid");
    res.status(200).json({
      status: "success",
      message: "Logout successful"
    });
  });
};

// In auth.controller.js
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.session.user.id;

  const result = await AuthService.changePassword(userId, currentPassword, newPassword);

  if (result.status === "failed") {
    return res.status(result.statusCode).json(result);
  }

  // Update session too so middleware stops blocking them
  req.session.user.mustChangePassword = false;

  res.status(result.statusCode).json(result);
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const member = await MemberModel.findOne({ email });

    // Always return success even if email not found
    // This prevents attackers from knowing which emails exist
    if (!member) {
      return res.status(200).json({
        status: "success",
        message: "If that email exists, a reset link has been sent"
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60); 
    await MemberModel.updateOne(
      { _id: member._id },
      { $set: { resetToken: token, resetTokenExpiry: expiry } }
    );

    await sendPasswordResetEmail({
      // to: member.email,
      // firstname: member.firstName,
      token,
    });

    res.status(200).json({
      status: "success",
      message: "If that email exists, a reset link has been sent"
    });

  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword ) {
      return res.status(400).json({
        status: "failed",
        message: "Token and password  are required"
      });
    }

    // Find member with valid non-expired token
    const member = await MemberModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() } // token must not be expired
    });

    if (!member) {
      return res.status(400).json({status: "failed",
        message: "Reset link is invalid or has expired"
      });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await MemberModel.updateOne(
      { _id: member._id },
      {
        $set: { password: hashed, mustChangePassword: false },
        $unset: { resetToken: "", resetTokenExpiry: "" } // clean up token
      }
    );

    res.status(200).json({
      status: "success",
      message: "Password reset successfully. You can now log in."
    });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

const getMe = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ status: "failed", message: "Not logged in" });
  }
  res.status(200).json({ status: "success", user: req.session.user });
};

module.exports = {
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe
};
