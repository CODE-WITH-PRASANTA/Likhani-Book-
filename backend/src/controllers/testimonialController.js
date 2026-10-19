const Testimonial = require("../models/testimonialModel");
const {
  isValidObjectId,
  escapeRegex,
  safeDeleteUploadFile,
  convertFileToWebp,
  saveBase64Image,
} = require("../utils/helpers");

// =========================================================
// GET ALL TESTIMONIALS (Admin Panel with Search & Filter)
// =========================================================
exports.getAllTestimonials = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      sort = "latest",
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      query.$or = [
        { clientName: { $regex: escaped, $options: "i" } },
        { designation: { $regex: escaped, $options: "i" } },
        { company: { $regex: escaped, $options: "i" } },
        { message: { $regex: escaped, $options: "i" } },
      ];
    }

    if (status && status !== "All" && status !== "All Status") {
      query.status = status.trim();
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };
    else if (sort === "rating-high") sortOptions = { rating: -1, createdAt: -1 };
    else if (sort === "rating-low") sortOptions = { rating: 1, createdAt: -1 };
    else if (sort === "a-z" || sort === "A-Z") sortOptions = { clientName: 1 };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, testimonials, globalTotal, activeCount, inactiveCount] = await Promise.all([
      Testimonial.countDocuments(query),
      Testimonial.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Testimonial.countDocuments({}),
      Testimonial.countDocuments({ status: "Active" }),
      Testimonial.countDocuments({ status: "Inactive" }),
    ]);

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      stats: {
        total: globalTotal,
        active: activeCount,
        inactive: inactiveCount,
      },
    });
  } catch (error) {
    console.error("GET TESTIMONIALS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// GET ACTIVE TESTIMONIALS (Public Frontend)
// =========================================================
exports.getActiveTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: "Active" })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    console.error("GET ACTIVE TESTIMONIALS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// GET SINGLE TESTIMONIAL BY ID
// =========================================================
exports.getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid testimonial ID format" });
    }

    const testimonial = await Testimonial.findById(id).lean();
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    console.error("GET TESTIMONIAL BY ID ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// CREATE TESTIMONIAL (WebP Image Processing)
// =========================================================
exports.createTestimonial = async (req, res) => {
  const logoFile = req.files?.logo?.[0];
  const profileFile = req.files?.profileImage?.[0];

  try {
    const {
      clientName,
      designation,
      company,
      rating,
      message,
      accentColor,
      status,
      logo,
      profileImage,
    } = req.body || {};

    if (!clientName?.trim() || !designation?.trim() || !message?.trim()) {
      if (logoFile) safeDeleteUploadFile(logoFile.filename);
      if (profileFile) safeDeleteUploadFile(profileFile.filename);
      return res.status(400).json({
        success: false,
        message: "Client name, designation, and message are required fields.",
      });
    }

    // Process Logo (convert to WebP)
    let logoPath = null;
    if (logoFile) {
      logoPath = await convertFileToWebp(logoFile);
    } else if (logo && typeof logo === "string" && logo.startsWith("data:")) {
      logoPath = await saveBase64Image(logo);
    } else if (logo && typeof logo === "string") {
      logoPath = logo.trim();
    }

    // Process Profile Image (convert to WebP)
    let profileImagePath = null;
    if (profileFile) {
      profileImagePath = await convertFileToWebp(profileFile);
    } else if (profileImage && typeof profileImage === "string" && profileImage.startsWith("data:")) {
      profileImagePath = await saveBase64Image(profileImage);
    } else if (profileImage && typeof profileImage === "string") {
      profileImagePath = profileImage.trim();
    }

    const numericRating = Math.min(Math.max(Number(rating) || 5, 1), 5);

    const testimonial = await Testimonial.create({
      clientName: clientName.trim(),
      designation: designation.trim(),
      company: company ? company.trim() : "",
      rating: numericRating,
      message: message.trim(),
      accentColor: accentColor || "#f97316",
      status: status || "Active",
      logo: logoPath,
      profileImage: profileImagePath,
    });

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      data: testimonial,
    });
  } catch (error) {
    if (logoFile) safeDeleteUploadFile(logoFile.filename);
    if (profileFile) safeDeleteUploadFile(profileFile.filename);
    console.error("CREATE TESTIMONIAL ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// =========================================================
// UPDATE TESTIMONIAL (WebP Image Processing)
// =========================================================
exports.updateTestimonial = async (req, res) => {
  const logoFile = req.files?.logo?.[0];
  const profileFile = req.files?.profileImage?.[0];

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      if (logoFile) safeDeleteUploadFile(logoFile.filename);
      if (profileFile) safeDeleteUploadFile(profileFile.filename);
      return res.status(400).json({ success: false, message: "Invalid testimonial ID format" });
    }

    const existing = await Testimonial.findById(id);

    if (!existing) {
      if (logoFile) safeDeleteUploadFile(logoFile.filename);
      if (profileFile) safeDeleteUploadFile(profileFile.filename);
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    const updateData = { ...req.body };
    if (updateData.rating !== undefined) {
      updateData.rating = Math.min(Math.max(Number(updateData.rating) || 5, 1), 5);
    }

    // Process new logo
    if (logoFile) {
      safeDeleteUploadFile(existing.logo);
      updateData.logo = await convertFileToWebp(logoFile);
    } else if (req.body.logo && typeof req.body.logo === "string" && req.body.logo.startsWith("data:")) {
      safeDeleteUploadFile(existing.logo);
      updateData.logo = await saveBase64Image(req.body.logo);
    }

    // Process new profile image
    if (profileFile) {
      safeDeleteUploadFile(existing.profileImage);
      updateData.profileImage = await convertFileToWebp(profileFile);
    } else if (req.body.profileImage && typeof req.body.profileImage === "string" && req.body.profileImage.startsWith("data:")) {
      safeDeleteUploadFile(existing.profileImage);
      updateData.profileImage = await saveBase64Image(req.body.profileImage);
    }

    const updated = await Testimonial.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: updated,
    });
  } catch (error) {
    if (logoFile) safeDeleteUploadFile(logoFile.filename);
    if (profileFile) safeDeleteUploadFile(profileFile.filename);
    console.error("UPDATE TESTIMONIAL ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// =========================================================
// TOGGLE STATUS
// =========================================================
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid testimonial ID format" });
    }

    const item = await Testimonial.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    item.status = item.status === "Active" ? "Inactive" : "Active";
    await item.save();

    res.status(200).json({
      success: true,
      message: `Status changed to ${item.status}`,
      data: item,
    });
  } catch (error) {
    console.error("TOGGLE TESTIMONIAL STATUS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// DELETE SINGLE TESTIMONIAL
// =========================================================
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid testimonial ID format" });
    }

    const item = await Testimonial.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    safeDeleteUploadFile(item.logo);
    safeDeleteUploadFile(item.profileImage);

    await Testimonial.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
      id,
    });
  } catch (error) {
    console.error("DELETE TESTIMONIAL ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// BULK DELETE TESTIMONIALS
// =========================================================
exports.bulkDeleteTestimonials = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: "No IDs provided as an array" });
    }

    const validIds = ids.filter((id) => isValidObjectId(id));
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: "No valid ObjectIds provided" });
    }

    const items = await Testimonial.find({ _id: { $in: validIds } });
    items.forEach((item) => {
      safeDeleteUploadFile(item.logo);
      safeDeleteUploadFile(item.profileImage);
    });

    const result = await Testimonial.deleteMany({ _id: { $in: validIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} testimonials deleted successfully`,
      deletedCount: result.deletedCount,
      deletedIds: validIds,
    });
  } catch (error) {
    console.error("BULK DELETE TESTIMONIALS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};