const MemberModel = require("../models/member.model");
const bcrypt = require("bcrypt");

const login = async (email, password) => {
  const member = await MemberModel.findOne({ email });
  if (!member) {
    return {
      status: "failed",
      statusCode: 401,
      message: "Invalid email or password"
    };
  }

  const passwordMatch = await bcrypt.compare(password, member.password);
  if (!passwordMatch) {
    return {
      status: "failed", 
      statusCode: 401,
      message: "Invalid email or password"
    };
  }
  
  return {
    status: "success",
    statusCode: 200,
    data: member
  };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  // First validate current password (like login)
  const member = await MemberModel.findById(userId);
  if (!member) {
    return {
      status: "failed",
      statusCode: 404,
      message: "User not found"
    };
  }
  
  const passwordMatch = await bcrypt.compare(currentPassword, member.password);
  if (!passwordMatch) {
    return {
      status: "failed",
      statusCode: 401,
      message: "Current password is incorrect"
    };
  }

  // Validate new password
  if (!newPassword || newPassword.length < 8) {
    return {
      status: "failed",
      statusCode: 400,
      message: "New password must be at least 8 characters"
    };
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 12);

    await MemberModel.updateOne(
      { _id: userId },
      { $set: { password: hashed, mustChangePassword: false } }
    );

    return {
      status: "success",
      statusCode: 200,
      message: "Password changed successfully"
    };
  } 

  catch (error) {
    return {
      status: "failed",
      statusCode: 500,
      message: error.message
    };
  }
};


module.exports = {
  login,
  changePassword
};
