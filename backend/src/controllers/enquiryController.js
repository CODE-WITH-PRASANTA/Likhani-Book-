const Enquiry = require("../models/Enquiry");
const { escapeRegex, isValidObjectId, isValidEmail } = require("../utils/helpers");

// =====================================================
// CREATE ENQUIRY
// =====================================================
const createEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address = "",
      type = "General Enquiry",
      subject = "Website Enquiry",
      message = "",
    } = req.body || {};

    const isBlogComment = type === "Blog Comment";

    if (!name?.trim() || !email?.trim() || (!isBlogComment && !phone?.trim())) {
      return res.status(400).json({
        success: false,
        message: isBlogComment
          ? "Name and email are required."
          : "Name, email, and phone number are required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!isBlogComment && phone) {
      const phoneDigits = String(phone).replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid 10-digit phone number.",
        });
      }
    }

    const enquiry = await Enquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "N/A",
      address: address ? address.trim() : "",
      type: type?.trim() || "General Enquiry",
      subject: subject?.trim() || "Website Enquiry",
      message: message?.trim() || (address ? `Address: ${address.trim()}` : "Website Enquiry"),
      status: "New",
    });

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully.",
      enquiry,
    });
  } catch (error) {
    console.error("CREATE ENQUIRY ERROR:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create enquiry.",
    });
  }
};

// =====================================================
// GET ALL ENQUIRIES (WITH PAGINATION, FILTERS & GLOBAL STATS)
// =====================================================
const getEnquiries = async (req, res) => {
  try {
    const {
      search = "",
      type = "All",
      status = "All",
      date = "",
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 10, 1);

    const query = {};

    // 1. Safe Search (escaped regex)
    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      const searchRegex = new RegExp(safeSearch, "i");

      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
        { address: searchRegex },
      ];
    }

    // 2. Type Filter
    if (type && type !== "All") {
      query.type = type;
    }

    // 3. Status Filter
    if (status && status !== "All") {
      query.status = status;
    }

    // 4. Date Filter (YYYY-MM-DD)
    if (date && date.trim()) {
      const parsedDate = new Date(date.trim());
      if (!isNaN(parsedDate.getTime())) {
        const startOfDay = new Date(parsedDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(parsedDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        query.createdAt = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    // Execute queries concurrently
    const [total, enquiries, statsTotal, statsNew, statsInProgress, statsClosed] =
      await Promise.all([
        Enquiry.countDocuments(query),
        Enquiry.find(query)
          .sort({ createdAt: -1 })
          .skip((pageNumber - 1) * limitNumber)
          .limit(limitNumber)
          .lean(),
        Enquiry.countDocuments(),
        Enquiry.countDocuments({ status: "New" }),
        Enquiry.countDocuments({ status: "In Progress" }),
        Enquiry.countDocuments({ status: "Closed" }),
      ]);

    const totalPages = Math.ceil(total / limitNumber) || 1;

    return res.status(200).json({
      success: true,
      data: enquiries,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
      },
      stats: {
        total: statsTotal,
        newCount: statsNew,
        inProgressCount: statsInProgress,
        closedCount: statsClosed,
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
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry ID format.",
      });
    }

    const enquiry = await Enquiry.findById(id).lean();

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
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry ID format.",
      });
    }

    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

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
    } = req.body || {};

    if (name !== undefined) enquiry.name = name.trim();
    if (email !== undefined) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format." });
      }
      enquiry.email = email.trim().toLowerCase();
    }
    if (phone !== undefined) enquiry.phone = phone.trim();
    if (address !== undefined) enquiry.address = address.trim();
    if (type !== undefined) enquiry.type = type.trim();
    if (subject !== undefined) enquiry.subject = subject.trim();
    if (message !== undefined) enquiry.message = message.trim();
    if (status !== undefined) enquiry.status = status;
    if (adminReply !== undefined) {
      enquiry.adminReply = adminReply.trim();
      enquiry.repliedAt = new Date();
    }

    const updatedEnquiry = await enquiry.save();

    // If this is a Blog Comment, synchronize fields and status, and recalculate blog count
    if (enquiry.type === "Blog Comment") {
      try {
        const Comment = require("../models/Comment");
        const Blog = require("../models/Blog");
        let comment = null;
        if (enquiry.commentId) {
          comment = await Comment.findById(enquiry.commentId);
        }
        if (!comment) {
          const slugFromAddress = (enquiry.address || "").replace(/^\/blog\//, "").trim();
          comment = await Comment.findOne({ email: enquiry.email, blogSlug: slugFromAddress });
        }
        if (comment) {
          if (name !== undefined) comment.name = name.trim();
          if (email !== undefined) comment.email = email.trim().toLowerCase();
          if (message !== undefined) comment.message = message.trim();
          if (status !== undefined) {
            comment.status = status === "Closed" ? "Published" : "Draft";
          }
          await comment.save();
          const count = await Comment.countDocuments({
            blog: comment.blog,
            status: { $in: ["Published", "Approved"] },
          });
          await Blog.findByIdAndUpdate(comment.blog, { comments: count });
        }
      } catch (syncErr) {
        console.error("Error syncing enquiry update to Comment model:", syncErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Enquiry updated successfully.",
      data: updatedEnquiry,
    });
  } catch (error) {
    console.error("UPDATE ENQUIRY ERROR:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update enquiry.",
    });
  }
};

// =====================================================
// DELETE ENQUIRY
// =====================================================
const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry ID format.",
      });
    }

    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    // If this is a Blog Comment, remove the corresponding comment and recalculate blog count
    if (enquiry.type === "Blog Comment") {
      try {
        const Comment = require("../models/Comment");
        const Blog = require("../models/Blog");
        let comment = null;
        if (enquiry.commentId) {
          comment = await Comment.findById(enquiry.commentId);
        }
        if (!comment) {
          const slugFromAddress = (enquiry.address || "").replace(/^\/blog\//, "").trim();
          comment = await Comment.findOne({ email: enquiry.email, blogSlug: slugFromAddress });
        }
        if (comment) {
          const blogId = comment.blog;
          await comment.deleteOne();
          if (blogId) {
            const count = await Comment.countDocuments({
              blog: blogId,
              status: { $in: ["Published", "Approved"] },
            });
            await Blog.findByIdAndUpdate(blogId, { comments: count });
          }
        }
      } catch (delSyncErr) {
        console.error("Error syncing comment deletion from enquiry:", delSyncErr);
      }
    }

    await Enquiry.findByIdAndDelete(id);

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
    const { ids } = req.body || {};

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide enquiry IDs as an array.",
      });
    }

    const validIds = ids.filter((id) => isValidObjectId(id));
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid enquiry ObjectIds provided.",
      });
    }

    const result = await Enquiry.deleteMany({
      _id: { $in: validIds },
    });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} enquiries deleted successfully.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("DELETE MULTIPLE ENQUIRIES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete enquiries.",
      error: error.message,
    });
  }
};

module.exports = {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
  deleteMultipleEnquiries,
};