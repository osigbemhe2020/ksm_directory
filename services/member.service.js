const MemberModel = require("../models/member.model");

const getMembers = async (filters, page, limit) => {
  let query = {};

  // Search across name and phone
  if (filters.search) {
    query.$or = [
      { firstName:   { $regex: filters.search, $options: 'i' } },
      { lastName:    { $regex: filters.search, $options: 'i' } },
      { phoneNumber: { $regex: filters.search, $options: 'i' } },
    ];
  }

  // Exact-ish filters
  if (filters.subCouncil) query.subCouncil = filters.subCouncil;
if (filters.degree)     query.degree     = filters.degree;
if (filters.officeHeld) query.officeHeld = filters.officeHeld;
  if (filters.occupation)         query.occupation         = filters.occupation;
  if (filters.placeOfInitiation)  query.placeOfInitiation  = filters.placeOfInitiation;
  if (filters.yearOfInitiation)   query.yearOfInitiation   = filters.yearOfInitiation; // exact match — it's a numbe

if (filters.yearOfInitiation)   query.yearOfInitiation   = filters.yearOfInitiation; // exact match — it's a number
if (filters.id) query._id = filters.id;
  const skip = (page - 1) * limit;

  const [members, total] = await Promise.all([
    MemberModel.find(query).skip(skip).limit(limit),
    MemberModel.countDocuments(query),
  ]);

  return {
    members,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMembers: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

const getMemberById = async (id) => {
  const member = await MemberModel.findById(id);
  if (!member) throw new Error("Member not found");
  return member;
};

const createMember = async (data) => {
  return await MemberModel.create(data);
};

const createManyMembers = async (dataArray) => {
  return await MemberModel.insertMany(dataArray);
};

const updateMember = async (id, data) => {
  const updated = await MemberModel.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw new Error("Member not found");
  return updated;
};

const updateOffice = async (id, officeHeld) => {
  if (!officeHeld) throw new Error("officeHeld is required");
  return await updateMember(id, { officeHeld });
};

const deleteMember = async (id) => {
  const deleted = await MemberModel.findByIdAndDelete(id);
  if (!deleted) throw new Error("Member not found");
  return deleted;
};

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  createManyMembers,
  updateMember,
  updateOffice,
  deleteMember,
};
