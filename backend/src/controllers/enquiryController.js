const Enquiry = require("../models/Enquiry");

// =====================================================
// CREATE ENQUIRY
// =====================================================

const createEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      type,
      subject,
      message,
    } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!name || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and address are required.",
      });
    }

    // -----------------------------
    // Email validation
    // -----------------------------

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // -----------------------------
    // Phone validation
    // -----------------------------

    const phoneDigits = String(phone).replace(/\D/g, "");

    if (phoneDigits.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number.",
      });
    }

    // -----------------------------
    // Create enquiry
    // -----------------------------

    const enquiry = await Enquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),

      type: type?.trim() || "General Enquiry",

      subject:
        subject?.trim() || "Website Enquiry",

      message:
        message?.trim() || `Address: ${address.trim()}`,

      status: "New",
    });

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully.",
      enquiry,
    });
  } catch (error) {
    console.error("CREATE ENQUIRY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create enquiry.",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL ENQUIRIES
// =====================================================

const getEnquiries = async (req, res) => {
  try {
    const {
      search = "",
      type = "All",
      status = "All",
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 10, 1);

    const query = {};

    // -----------------------------
    // Search
    // -----------------------------

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
        { address: searchRegex },
      ];
    }

    // -----------------------------
    // Type filter
    // -----------------------------

    if (type !== "All") {
      query.type = type;
    }

    // -----------------------------
    // Status filter
    // -----------------------------

    if (status !== "All") {
      query.status = status;
    }

    // -----------------------------
    // Total
    // -----------------------------

    const total = await Enquiry.countDocuments(query);

    // -----------------------------
    // Data
    // -----------------------------

    const enquiries = await Enquiry.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    const totalPages =
      Math.ceil(total / limitNumber) || 1;

    return res.status(200).json({
      success: true,

      data: enquiries,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("GET ENQUIRIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries.",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE ENQUIRY
// =====================================================

const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(
      req.params.id
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    console.error("GET SINGLE ENQUIRY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch enquiry.",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE ENQUIRY
// =====================================================

const updateEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      type,
      subject,
      message,
      status,
      adminReply,
    } = req.body;

    const enquiry = await Enquiry.findById(
      req.params.id
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    // -----------------------------
    // Update fields
    // -----------------------------

    if (name !== undefined) {
      enquiry.name = name.trim();
    }

    if (email !== undefined) {
      enquiry.email = email.trim().toLowerCase();
    }

    if (phone !== undefined) {
      enquiry.phone = phone.trim();
    }

    if (address !== undefined) {
      enquiry.address = address.trim();
    }

    if (type !== undefined) {
      enquiry.type = type.trim();
    }

    if (subject !== undefined) {
      enquiry.subject = subject.trim();
    }

    if (message !== undefined) {
      enquiry.message = message.trim();
    }

    if (status !== undefined) {
      enquiry.status = status;
    }

    if (adminReply !== undefined) {
      enquiry.adminReply = adminReply.trim();
      enquiry.repliedAt = new Date();
    }

    const updatedEnquiry = await enquiry.save();

    return res.status(200).json({
      success: true,
      message: "Enquiry updated successfully.",
      data: updatedEnquiry,
    });
  } catch (error) {
    console.error("UPDATE ENQUIRY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update enquiry.",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE ENQUIRY
// =====================================================

const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(
      req.params.id
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    await Enquiry.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ENQUIRY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete enquiry.",
      error: error.message,
    });
  }
};

// =====================================================
// BULK DELETE
// =====================================================

const deleteMultipleEnquiries = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide enquiry IDs.",
      });
    }

    const result = await Enquiry.deleteMany({
      _id: { $in: ids },
    });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} enquiries deleted successfully.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error(
      "DELETE MULTIPLE ENQUIRIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete enquiries.",
      error: error.message,
    });
  }
};

// =====================================================

module.exports = {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
  deleteMultipleEnquiries,
};