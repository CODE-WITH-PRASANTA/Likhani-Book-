const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Image title is required"],
      trim: true,
      maxLength: [150, "Title cannot exceed 150 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxLength: [100, "Category cannot exceed 100 characters"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    size: {
      type: String,
      default: "0 MB",
      trim: true,
    },
    uploadedOn: {
      type: String,
      default: "",
      trim: true,
    },
    time: {
      type: String,
      default: "",
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes for Sorting & Filtering
gallerySchema.index({ createdAt: -1 });
gallerySchema.index({ category: 1, createdAt: -1 });
gallerySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Gallery", gallerySchema);
