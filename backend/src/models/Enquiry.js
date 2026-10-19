const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxLength: [100, "Name cannot exceed 100 characters"],
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

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxLength: [25, "Phone number cannot exceed 25 characters"],
    },

    address: {
      type: String,
      default: "",
      trim: true,
      maxLength: [250, "Address cannot exceed 250 characters"],
    },

    type: {
      type: String,
      default: "General Enquiry",
      trim: true,
    },

    subject: {
      type: String,
      default: "Website Enquiry",
      trim: true,
      maxLength: [200, "Subject cannot exceed 200 characters"],
    },

    message: {
      type: String,
      default: "",
      trim: true,
      maxLength: [2000, "Message cannot exceed 2000 characters"],
    },

    status: {
      type: String,
      enum: ["New", "In Progress", "Closed"],
      default: "New",
    },

    adminReply: {
      type: String,
      default: "",
      trim: true,
      maxLength: [2000, "Reply cannot exceed 2000 characters"],
    },

    repliedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes for Sorting & Filtering
enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model("Enquiry", enquirySchema);