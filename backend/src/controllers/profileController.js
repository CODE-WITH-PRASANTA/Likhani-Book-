const Profile = require("../models/Profile");
const { isValidObjectId, isValidEmail, safeDeleteUploadFile } = require("../utils/helpers");

// GET ALL PROFILES
exports.getProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: profiles.length, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE PROFILE
exports.getProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid profile ID format" });
    }

    const profile = await Profile.findById(id).lean();
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE PROFILE
exports.createProfile = async (req, res) => {
  const avatarFile = req.files?.avatarFile?.[0] || req.files?.avatar?.[0];

  try {
    const { name, email, travelerType, homeLocation, bio, status } = req.body || {};

    if (!name?.trim() || !email?.trim()) {
      if (avatarFile) safeDeleteUploadFile(avatarFile.filename);
      return res.status(400).json({
        success: false,
        message: "Admin name and email address are required.",
      });
    }

    if (!isValidEmail(email)) {
      if (avatarFile) safeDeleteUploadFile(avatarFile.filename);
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const avatarPath = avatarFile ? `/uploads/${avatarFile.filename}` : "";

    const profile = await Profile.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      travelerType: travelerType?.trim() || "Administrator",
      homeLocation: homeLocation ? homeLocation.trim() : "",
      bio: bio ? bio.trim() : "",
      avatar: avatarPath,
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: profile,
    });
  } catch (error) {
    if (avatarFile) safeDeleteUploadFile(avatarFile.filename);
    res.status(400).json({ success: false, message: error.message });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  const avatarFile = req.files?.avatarFile?.[0] || req.files?.avatar?.[0];

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      if (avatarFile) safeDeleteUploadFile(avatarFile.filename);
      return res.status(400).json({ success: false, message: "Invalid profile ID format" });
    }

    const existing = await Profile.findById(id);
    if (!existing) {
      if (avatarFile) safeDeleteUploadFile(avatarFile.filename);
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const updateData = { ...req.body };

    if (updateData.email && !isValidEmail(updateData.email)) {
      if (avatarFile) safeDeleteUploadFile(avatarFile.filename);
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }

    if (avatarFile) {
      safeDeleteUploadFile(existing.avatar);
      updateData.avatar = `/uploads/${avatarFile.filename}`;
    }

    const updated = await Profile.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    if (avatarFile) safeDeleteUploadFile(avatarFile.filename);
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE PROFILE
exports.deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid profile ID format" });
    }

    const existing = await Profile.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    safeDeleteUploadFile(existing.avatar);
    await Profile.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
