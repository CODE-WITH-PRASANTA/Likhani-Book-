const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: [true, "Blog ID is required"],
      index: true,
    },
    blogSlug: {
      type: String,
      required: [true, "Blog slug is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    blogTitle: {
      type: String,
      trim: true,
      default: "",
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
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
      required: [true, "Comment message is required"],
      trim: true,
      minlength: [2, "Comment message must be at least 2 characters"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Pending", "Approved", "Spam", "Rejected"],
      default: "Draft",
      index: true,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Performance & Scoping Indexes
commentSchema.index({ blog: 1, status: 1, createdAt: -1 });
commentSchema.index({ blogSlug: 1, status: 1, createdAt: -1 });
commentSchema.index({ blog: 1, email: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
