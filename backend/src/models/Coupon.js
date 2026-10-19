const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [30, "Coupon code cannot exceed 30 characters"],
      match: [
        /^[A-Z0-9_-]+$/,
        "Coupon code can only contain uppercase letters, numbers, hyphens, and underscores",
      ],
    },
    title: {
      type: String,
      required: [true, "Coupon title is required"],
      trim: true,
      minlength: [2, "Coupon title must be at least 2 characters"],
      maxlength: [100, "Coupon title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    discountPercent: {
      type: Number,
      required: [true, "Discount percentage is required"],
      min: [1, "Discount percentage must be at least 1%"],
      max: [100, "Discount percentage cannot exceed 100%"],
    },
    minimumPurchase: {
      type: Number,
      default: 0,
      min: [0, "Minimum purchase cannot be negative"],
    },
    usageLimit: {
      type: mongoose.Schema.Types.Mixed,
      default: "Unlimited",
    },
    used: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
    startDate: {
      type: String,
      required: [true, "Start date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"],
    },
    endDate: {
      type: String,
      required: [true, "End date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"],
    },
    status: {
      type: String,
      enum: ["Active", "Scheduled", "Expired", "Disabled"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
couponSchema.index({ status: 1 });
couponSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Coupon", couponSchema);
