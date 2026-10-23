const Support = require("../models/Support");
const { isValidObjectId, isValidEmail } = require("../utils/helpers");

// @desc    Get all support messages with optional search/status filters
// @route   GET /api/supports
exports.getSupports = async (req, res) => {
  try {
    const { search = "", status = "All" } = req.query;
    const query = {};

    if (status && status !== "All" && status !== "All Status") {
      query.status = status;
    }

    if (search && search.trim()) {
      const sanitized = search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const regex = new RegExp(sanitized, "i");
      query.$or = [
        { name: regex },
        { mobile: regex },
        { email: regex },
        { message: regex },
        { address: regex },
        { source: regex },
      ];
    }

    const supports = await Support.find(query).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: supports.length, data: supports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new support message
// @route   POST /api/supports
exports.createSupport = async (req, res) => {
  try {
    const { name, mobile, phone, email, message, address, source, status } = req.body || {};

    const contactPhone = (mobile || phone || "").trim();

    if (!name?.trim() || !contactPhone || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, mobile/phone, email",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const finalMessage = (
      message?.trim() ||
      (address?.trim() ? `Address: ${address.trim()}` : "Customer request from website")
    ).trim();

    const newSupport = await Support.create({
      name: name.trim(),
      mobile: contactPhone,
      email: email.trim().toLowerCase(),
      message: finalMessage,
      address: address?.trim() || "",
      source: source?.trim() || "Need Help",
      status: status || "New",
    });

    res.status(201).json({ success: true, data: newSupport });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update support message
// @route   PUT /api/supports/:id
exports.updateSupport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid support ID format" });
    }

    let support = await Support.findById(id);
    if (!support) {
      return res.status(404).json({ success: false, message: "Support message not found" });
    }

    support = await Support.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: support });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete single support message
// @route   DELETE /api/supports/:id
exports.deleteSupport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid support ID format" });
    }

    const support = await Support.findById(id);
    if (!support) {
      return res.status(404).json({ success: false, message: "Support message not found" });
    }

    await Support.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk delete messages
// @route   POST /api/supports/bulk-delete
exports.bulkDeleteSupports = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No IDs provided" });
    }

    const validIds = ids.filter((id) => isValidObjectId(id));
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: "No valid ObjectIds provided" });
    }

    const result = await Support.deleteMany({ _id: { $in: validIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} messages deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};