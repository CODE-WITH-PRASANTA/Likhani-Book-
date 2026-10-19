const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      minlength: [2, "User name must be at least 2 characters"],
      maxlength: [100, "User name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    userImage: {
      type: String,
      default: "",
    },
    book: {
      type: String,
      required: [true, "Book name is required"],
      trim: true,
      minlength: [1, "Book name cannot be empty"],
      maxlength: [200, "Book name cannot exceed 200 characters"],
    },
    bookImage: {
      type: String,
      default: "",
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      default: null,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [3, "Comment must be at least 3 characters"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: ["Approved", "Pending", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup, filtering, and sorting
reviewSchema.index({ book: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
