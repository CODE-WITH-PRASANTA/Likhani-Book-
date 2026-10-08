const fs = require("fs");
const path = require("path");
const Testimonial = require("../models/testimonialModel");

// Helper to remove obsolete uploaded files
const deleteLocalFile = (relativePath) => {
  if (!relativePath || relativePath.startsWith("http")) return;
  const filePath = path.join(__dirname, "../../", relativePath);
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error removing old file:", err);
    });
  }
};

// GET ALL TESTIMONIALS (Admin Panel)
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ACTIVE TESTIMONIALS (Public Frontend)
exports.getActiveTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: "Active" }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE TESTIMONIAL BY ID
exports.getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE TESTIMONIAL
exports.createTestimonial = async (req, res) => {
  try {
    const { clientName, designation, company, rating, message, accentColor, status } = req.body;

    const logoPath = req.files?.logo?.[0]
      ? `/uploads/${req.files.logo[0].filename}`
      : null;

    const profileImagePath = req.files?.profileImage?.[0]
      ? `/uploads/${req.files.profileImage[0].filename}`
      : null;

    const testimonial = await Testimonial.create({
      clientName,
      designation,
      company: company || "",
      rating: Number(rating) || 5,
      message,
      accentColor: accentColor || "#f97316",
      status: status || "Active",
      logo: logoPath,
      profileImage: profileImagePath,
    });

    res.status(201).json({ success: true, message: "Testimonial created successfully", data: testimonial });
  } catch (error) {
    // Cleanup newly uploaded files if DB creation fails
    if (req.files?.logo?.[0]) deleteLocalFile(`/uploads/${req.files.logo[0].filename}`);
    if (req.files?.profileImage?.[0]) deleteLocalFile(`/uploads/${req.files.profileImage[0].filename}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// UPDATE TESTIMONIAL
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Testimonial.findById(id);

    if (!existing) {
      // Remove orphaned uploaded files if record doesn't exist
      if (req.files?.logo?.[0]) deleteLocalFile(`/uploads/${req.files.logo[0].filename}`);
      if (req.files?.profileImage?.[0]) deleteLocalFile(`/uploads/${req.files.profileImage[0].filename}`);
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    const updateData = { ...req.body };
    if (updateData.rating) updateData.rating = Number(updateData.rating);

    // If a new logo is uploaded, clean up old file and set new path
    if (req.files?.logo?.[0]) {
      deleteLocalFile(existing.logo);
      updateData.logo = `/uploads/${req.files.logo[0].filename}`;
    }

    // If a new profile image is uploaded, clean up old file and set new path
    if (req.files?.profileImage?.[0]) {
      deleteLocalFile(existing.profileImage);
      updateData.profileImage = `/uploads/${req.files.profileImage[0].filename}`;
    }

    const updated = await Testimonial.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: "Testimonial updated successfully", data: updated });
  } catch (error) {
    if (req.files?.logo?.[0]) deleteLocalFile(`/uploads/${req.files.logo[0].filename}`);
    if (req.files?.profileImage?.[0]) deleteLocalFile(`/uploads/${req.files.profileImage[0].filename}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// TOGGLE STATUS
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Testimonial.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    item.status = item.status === "Active" ? "Inactive" : "Active";
    await item.save();

    res.status(200).json({ success: true, message: `Status changed to ${item.status}`, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE SINGLE
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Testimonial.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    deleteLocalFile(item.logo);
    deleteLocalFile(item.profileImage);

    await Testimonial.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Testimonial deleted successfully", id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// BULK DELETE
exports.bulkDeleteTestimonials = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: "No IDs provided" });
    }

    const items = await Testimonial.find({ _id: { $in: ids } });
    items.forEach((item) => {
      deleteLocalFile(item.logo);
      deleteLocalFile(item.profileImage);
    });

    await Testimonial.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ success: true, message: "Selected testimonials deleted successfully", deletedIds: ids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};