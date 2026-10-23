const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxLength: [100, "Name cannot exceed 100 characters"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      maxLength: [25, "Mobile number cannot exceed 25 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    message: {
      type: String,
      trim: true,
      maxLength: [2000, "Message cannot exceed 2000 characters"],
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      trim: true,
      default: "Need Help",
    },
    status: {
      type: String,
      enum: ["New", "Replied", "Pending"],
      default: "New",
    },
    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    time: {
      type: String,
      default: () =>
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes for Sorting & Filtering
supportSchema.index({ createdAt: -1 });
supportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Support", supportSchema);