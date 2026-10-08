const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: "",
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
      maxLength: 500,
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

module.exports = mongoose.model("Testimonial", testimonialSchema);