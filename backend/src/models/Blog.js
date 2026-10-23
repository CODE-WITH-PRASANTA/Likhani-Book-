const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: [250, "Blog title cannot exceed 250 characters"],
    },
    slug: {
      type: String,
      required: [true, "Blog slug is required"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    author: {
      type: String,
      default: "Admin",
      trim: true,
    },
    shortDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: [600, "Short description cannot exceed 600 characters"],
    },
    description: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Published", "Draft", "Trash"],
      default: "Published",
      index: true,
    },
    image: {
      type: String,
      default: "",
    },
    comments: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    pageTitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: [300, "Page title cannot exceed 300 characters"],
    },
    metaTitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: [300, "Meta title cannot exceed 300 characters"],
    },
    metaDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Meta description cannot exceed 1000 characters"],
    },
    metaKeywords: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Meta keywords cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.index({ title: "text", shortDescription: "text", tags: "text" });
blogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Blog", blogSchema);
