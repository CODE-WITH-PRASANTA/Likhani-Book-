const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      maxLength: [100, "Client name cannot exceed 100 characters"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
      maxLength: [100, "Designation cannot exceed 100 characters"],
    },
    company: {
      type: String,
      trim: true,
      default: "",
      maxLength: [100, "Company name cannot exceed 100 characters"],
    },
    logo: {
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      maxLength: [1000, "Message cannot exceed 1000 characters"],
      trim: true,
    },
    accentColor: {
      type: String,
      default: "#f97316",
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
testimonialSchema.index({ createdAt: -1 });
testimonialSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Testimonial", testimonialSchema);