const Support = require("../models/Support");

// @desc    Get all support messages
// @route   GET /api/supports
exports.getSupports = async (req, res) => {
  try {
    const supports = await Support.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: supports.length, data: supports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new support message
// @route   POST /api/supports
exports.createSupport = async (req, res) => {
  try {
    const { name, mobile, email, message, status } = req.body;

    if (!name || !mobile || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, mobile, email, message",
      });
    }

    const newSupport = await Support.create({
      name,
      mobile,
      email,
      message,
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
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No IDs provided" });
    }

    await Support.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ success: true, message: "Selected messages deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};