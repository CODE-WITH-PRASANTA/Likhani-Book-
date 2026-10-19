const Coupon = require("../models/Coupon");
const { isValidObjectId, escapeRegex } = require("../utils/helpers");

// Helper to calculate status dynamically based on current date
const computeDateStatus = (startDate, endDate) => {
  const today = new Date().toISOString().split("T")[0];
  if (startDate > today) return "Scheduled";
  if (endDate < today) return "Expired";
  return "Active";
};

// =========================================================
// GET ALL COUPONS
// =========================================================
exports.getCoupons = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      discount = "",
      sort = "latest",
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    // Search query on code, title, and description
    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      query.$or = [
        { code: { $regex: escaped, $options: "i" } },
        { title: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    // Status filter
    if (status && status !== "All Status" && status !== "All") {
      query.status = status.trim();
    }

    // Discount range filter
    if (discount && discount !== "All Discounts") {
      if (discount === "Up to 10%") {
        query.discountPercent = { $lte: 10 };
      } else if (discount === "11% to 20%") {
        query.discountPercent = { $gt: 10, $lte: 20 };
      } else if (discount === "Above 20%") {
        query.discountPercent = { $gt: 20 };
      }
    }

    // Sort order
    let sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };
    else if (sort === "A-Z" || sort === "Sort By: A-Z" || sort === "a-z") sortOptions = { title: 1 };
    else if (sort === "Z-A" || sort === "z-a") sortOptions = { title: -1 };
    else if (sort === "Discount" || sort === "Sort By: Discount") sortOptions = { discountPercent: -1 };
    else if (sort === "discount-low") sortOptions = { discountPercent: 1 };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, coupons, globalTotal, activeCount, scheduledCount, expiredCount] =
      await Promise.all([
        Coupon.countDocuments(query),
        Coupon.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
        Coupon.countDocuments({}),
        Coupon.countDocuments({ status: "Active" }),
        Coupon.countDocuments({ status: "Scheduled" }),
        Coupon.countDocuments({ status: "Expired" }),
      ]);

    // Format output with mapped id
    const formatted = coupons.map((c) => ({
      ...c,
      id: c._id.toString(),
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      stats: {
        total: globalTotal,
        active: activeCount,
        scheduled: scheduledCount,
        expired: expiredCount,
      },
    });
  } catch (error) {
    console.error("GET COUPONS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// GET SINGLE COUPON BY ID OR CODE
// =========================================================
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    let coupon = null;
    if (isValidObjectId(id)) {
      coupon = await Coupon.findById(id).lean();
    } else {
      coupon = await Coupon.findOne({ code: id.toUpperCase().trim() }).lean();
    }

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        ...coupon,
        id: coupon._id.toString(),
      },
    });
  } catch (error) {
    console.error("GET COUPON BY ID ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// CREATE COUPON (Full End-to-End Validation)
// =========================================================
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discountPercent,
      minimumPurchase = 0,
      usageLimit = "Unlimited",
      unlimited = false,
      startDate,
      endDate,
      status,
    } = req.body || {};

    // 1. Validate Code
    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length < 3 || cleanCode.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Coupon code must be between 3 and 30 characters",
      });
    }
    if (!/^[A-Z0-9_-]+$/.test(cleanCode)) {
      return res.status(400).json({
        success: false,
        message: "Coupon code can only contain letters, numbers, hyphens, and underscores",
      });
    }

    // Check duplicate code
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code '${cleanCode}' already exists. Please choose a different code.`,
      });
    }

    // 2. Validate Title & Description
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ success: false, message: "Coupon title is required" });
    }
    if (!description || typeof description !== "string" || !description.trim()) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }

    // 3. Validate Discount Percentage
    const numericDiscount = Number(discountPercent);
    if (isNaN(numericDiscount) || numericDiscount < 1 || numericDiscount > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount percentage must be a number between 1 and 100",
      });
    }

    // 4. Validate Minimum Purchase
    const numericMinPurchase = Math.max(Number(minimumPurchase) || 0, 0);

    // 5. Validate Usage Limit
    let parsedUsageLimit = "Unlimited";
    if (!unlimited && usageLimit !== "Unlimited" && usageLimit !== "" && usageLimit !== null && usageLimit !== undefined) {
      const numLimit = Number(usageLimit);
      if (isNaN(numLimit) || numLimit < 1) {
        return res.status(400).json({
          success: false,
          message: "Usage limit must be a number of 1 or greater, or set to unlimited",
        });
      }
      parsedUsageLimit = Math.floor(numLimit);
    }

    // 6. Validate Start & End Dates
    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return res.status(400).json({
        success: false,
        message: "Valid start date is required (YYYY-MM-DD)",
      });
    }
    if (!endDate || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Valid end date is required (YYYY-MM-DD)",
      });
    }
    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be on or after the start date",
      });
    }

    // 7. Determine Status
    const computedStatus = status && ["Active", "Scheduled", "Expired", "Disabled"].includes(status)
      ? status
      : computeDateStatus(startDate, endDate);

    const coupon = await Coupon.create({
      code: cleanCode,
      title: title.trim(),
      description: description.trim(),
      discountPercent: numericDiscount,
      minimumPurchase: numericMinPurchase,
      usageLimit: parsedUsageLimit,
      used: 0,
      startDate,
      endDate,
      status: computedStatus,
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: {
        ...coupon.toObject(),
        id: coupon._id.toString(),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists.",
      });
    }
    console.error("CREATE COUPON ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// UPDATE COUPON (Full End-to-End Validation)
// =========================================================
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid coupon ID format" });
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    const {
      code,
      title,
      description,
      discountPercent,
      minimumPurchase,
      usageLimit,
      unlimited,
      startDate,
      endDate,
      status,
    } = req.body || {};

    // 1. Code update & uniqueness check
    if (code) {
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode.length < 3 || cleanCode.length > 30) {
        return res.status(400).json({
          success: false,
          message: "Coupon code must be between 3 and 30 characters",
        });
      }
      if (!/^[A-Z0-9_-]+$/.test(cleanCode)) {
        return res.status(400).json({
          success: false,
          message: "Coupon code can only contain letters, numbers, hyphens, and underscores",
        });
      }

      if (cleanCode !== coupon.code) {
        const duplicate = await Coupon.findOne({ code: cleanCode, _id: { $ne: id } });
        if (duplicate) {
          return res.status(400).json({
            success: false,
            message: `Coupon code '${cleanCode}' is already in use by another coupon.`,
          });
        }
        coupon.code = cleanCode;
      }
    }

    if (title && title.trim()) coupon.title = title.trim();
    if (description && description.trim()) coupon.description = description.trim();

    if (discountPercent !== undefined && discountPercent !== "") {
      const numericDiscount = Number(discountPercent);
      if (isNaN(numericDiscount) || numericDiscount < 1 || numericDiscount > 100) {
        return res.status(400).json({
          success: false,
          message: "Discount percentage must be a number between 1 and 100",
        });
      }
      coupon.discountPercent = numericDiscount;
    }

    if (minimumPurchase !== undefined && minimumPurchase !== "") {
      coupon.minimumPurchase = Math.max(Number(minimumPurchase) || 0, 0);
    }

    if (unlimited === true || usageLimit === "Unlimited") {
      coupon.usageLimit = "Unlimited";
    } else if (usageLimit !== undefined && usageLimit !== "") {
      const numLimit = Number(usageLimit);
      if (isNaN(numLimit) || numLimit < 1) {
        return res.status(400).json({
          success: false,
          message: "Usage limit must be a number of 1 or greater, or set to unlimited",
        });
      }
      if (numLimit < coupon.used) {
        return res.status(400).json({
          success: false,
          message: `Usage limit cannot be less than the ${coupon.used} already used.`,
        });
      }
      coupon.usageLimit = Math.floor(numLimit);
    }

    const newStart = startDate || coupon.startDate;
    const newEnd = endDate || coupon.endDate;

    if (newEnd < newStart) {
      return res.status(400).json({
        success: false,
        message: "End date must be on or after the start date",
      });
    }

    if (startDate) coupon.startDate = startDate;
    if (endDate) coupon.endDate = endDate;

    if (status && ["Active", "Scheduled", "Expired", "Disabled"].includes(status)) {
      coupon.status = status;
    } else if (startDate || endDate) {
      coupon.status = computeDateStatus(coupon.startDate, coupon.endDate);
    }

    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: {
        ...coupon.toObject(),
        id: coupon._id.toString(),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists.",
      });
    }
    console.error("UPDATE COUPON ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// DELETE COUPON
// =========================================================
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid coupon ID format" });
    }

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.code} deleted successfully`,
    });
  } catch (error) {
    console.error("DELETE COUPON ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// BULK DELETE COUPONS
// =========================================================
exports.bulkDeleteCoupons = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of coupon IDs to delete",
      });
    }

    const validIds = ids.filter(isValidObjectId);
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid coupon IDs provided",
      });
    }

    const result = await Coupon.deleteMany({ _id: { $in: validIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} coupon(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("BULK DELETE COUPONS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// TOGGLE / SET COUPON STATUS
// =========================================================
exports.toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: targetStatus } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid coupon ID format" });
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    if (targetStatus && ["Active", "Scheduled", "Expired", "Disabled"].includes(targetStatus)) {
      coupon.status = targetStatus;
    } else {
      // Cycle: Active -> Expired -> Scheduled -> Active
      if (coupon.status === "Active") coupon.status = "Expired";
      else if (coupon.status === "Expired") coupon.status = "Scheduled";
      else coupon.status = "Active";
    }

    await coupon.save();

    res.status(200).json({
      success: true,
      message: `Coupon status updated to ${coupon.status}`,
      data: {
        ...coupon.toObject(),
        id: coupon._id.toString(),
      },
    });
  } catch (error) {
    console.error("TOGGLE COUPON STATUS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// GET ACTIVE PUBLIC COUPONS FOR CART / SHOP
// =========================================================
exports.getActiveCoupons = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const coupons = await Coupon.find({
      status: { $ne: "Disabled" },
      startDate: { $lte: today },
      endDate: { $gte: today },
    })
      .sort({ discountPercent: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons.map((c) => ({
        id: c._id.toString(),
        code: c.code,
        title: c.title,
        description: c.description,
        discountPercent: c.discountPercent,
        minimumPurchase: c.minimumPurchase,
        endDate: c.endDate,
      })),
    });
  } catch (error) {
    console.error("GET ACTIVE COUPONS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// VALIDATE COUPON FOR CART / CHECKOUT
// =========================================================
exports.validateCouponForCart = async (req, res) => {
  try {
    const { code, cartTotal = 0 } = req.body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ success: false, message: "Please enter a coupon code." });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });
    if (!coupon) {
      return res.status(404).json({ success: false, message: `Coupon "${cleanCode}" is invalid.` });
    }

    // Check status
    if (coupon.status === "Disabled") {
      return res.status(400).json({ success: false, message: "This coupon is currently disabled." });
    }

    const today = new Date().toISOString().split("T")[0];

    // Check start date / scheduled
    if (coupon.status === "Scheduled" || coupon.startDate > today) {
      return res.status(400).json({
        success: false,
        message: `This coupon is not active yet. Valid from ${coupon.startDate}.`,
      });
    }

    // Check deadline / expiry
    if (coupon.status === "Expired" || coupon.endDate < today) {
      return res.status(400).json({
        success: false,
        message: `This coupon expired on ${coupon.endDate}. Deadline has passed.`,
      });
    }

    // Check usage limit
    if (coupon.usageLimit !== "Unlimited" && typeof coupon.usageLimit === "number") {
      if (coupon.used >= coupon.usageLimit) {
        return res.status(400).json({
          success: false,
          message: "This coupon has reached its maximum usage limit.",
        });
      }
    }

    // Check minimum purchase
    const total = Math.max(Number(cartTotal) || 0, 0);
    if (total === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart has no selected items. Please select items first.",
      });
    }

    if (total < coupon.minimumPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of ₹${coupon.minimumPurchase} required for this coupon (add ₹${coupon.minimumPurchase - total} more).`,
      });
    }

    // Calculate discount
    const discountAmount = Math.round((total * coupon.discountPercent) / 100);
    const finalAmount = Math.max(0, total - discountAmount);

    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" applied! You saved ₹${discountAmount.toLocaleString("en-IN")} (${coupon.discountPercent}% off).`,
      data: {
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discountPercent: coupon.discountPercent,
        discountAmount,
        finalAmount,
        minimumPurchase: coupon.minimumPurchase,
        endDate: coupon.endDate,
      },
    });
  } catch (error) {
    console.error("VALIDATE COUPON ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
