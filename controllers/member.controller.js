// controllers/auth.controller.js
const { sendWelcomeEmail } = require('../services/email.service');
const { uploadProfilePhoto } = require('../config/cloudinary');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const MemberService = require("../services/member.service");
const MemberModel = require("../models/member.model");

const getAll = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Strip pagination from filters so only actual filters are passed
    const { page: _, limit: __, ...filters } = req.query;
    const result = await MemberService.getMembers(filters, page, limit);
    res.status(200).json({
      ...result,
      filters: req.query
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getFilterOptions = async (req, res) => {
  try {
    const [subCouncils, degrees, officeHelds] = await Promise.all([
      MemberModel.distinct('subCouncil'),
      MemberModel.distinct('degree'),
      MemberModel.distinct('officeHeld'),
    ]);
    res.status(200).json({ subCouncils, degrees, officeHelds });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


const getById = async (req, res) => {
  try {
    const member = await MemberService.getMemberById(req.params.id);
    res.status(200).json(member);
  } catch (error) {
    res.status(404).json({
      error: "Member not found",
      message: error.message
    });
  }
};



const  register = async (req, res) => {
  try {
    // Clear any existing session before registration
    if (req.session) {
      req.session = null;
    }

    const memberData = req.body;

    let profilePhotoUrl = null;
    if (req.files?.profilePhoto?.[0]) {
      const file = req.files.profilePhoto[0];
      const result = await uploadProfilePhoto(file.buffer, file.originalname);
      profilePhotoUrl = result.secure_url;
    }

    // Check if email already exists
    const existing = await MemberModel.findOne({ email: memberData.email });
    if (existing) {
      return res.status(400).json({ status: "failed", message: "Email already registered" });
    }

    // Generate random password
    const plainPassword = crypto.randomBytes(12).toString('base64').slice(0, 12);
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    // Create member
    const member = await MemberModel.create({
      ...memberData,
      profilePhoto: profilePhotoUrl,
      password: hashedPassword,
      mustChangePassword: true,
    });

    // Send welcome email with plain password
    await sendWelcomeEmail({
      to: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      password: plainPassword,
    });

    res.status(201).json({
      status: "success",
      message: `Member registered. Login details sent to ${member.email}`
    });

  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const updated = await MemberService.updateMember((req.params.id), req.body);
    res.status(200).json({
      message: "User updated successfully",
      user: updated
    });
  } catch (error) {
    res.status(404).json({
      error: "User not found",
      message: error.message
    });
  }
};

const updateOffice = async (req, res) => {
  try {
    const updated = await MemberService.updateOffice(
      parseInt(req.params.id),
      req.body.officeHeld
    );
    res.status(200).json({
      message: "Office held updated successfully",
      user: updated
    });
  } catch (error) {
    res.status(400).json({
      error: "Bad Request",
      message: error.message
    });
  }
};

const updateProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await MemberModel.findById(id);
    if (!member) {
      return res.status(404).json({ status: 'failed', message: 'Member not found' });
    }

    if (!req.files?.profilePhoto?.[0]) {
      return res.status(400).json({ status: 'failed', message: 'No photo uploaded' });
    }

    const file = req.files.profilePhoto[0];
    const result = await uploadProfilePhoto(file.buffer, file.originalname);

    member.profilePhoto = result.secure_url;
    await member.save();

    res.status(200).json({
      status: 'success',
      message: 'Profile photo updated',
      profilePhoto: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({ status: 'failed', message: error.message });
  }
};


// Add this line BEFORE the /:id routes:


const remove = async (req, res) => {
  try {
    const deleted = await MemberService.deleteMember(req.params.id);
    res.status(200).json({
      message: "User deleted successfully",
      user: deleted
    });
  } catch (error) {
    res.status(404).json({
      error: "User not found",
      message: error.message
    });
  }
};

module.exports = {
  getAll,
  getFilterOptions,
  getById,
  register,
  update,
  updateOffice,
  updateProfilePhoto,
  remove,
};
