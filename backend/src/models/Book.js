const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
      maxLength: [250, "Book title cannot exceed 250 characters"],
    },
    isbn: {
      type: String,
      trim: true,
      default: "",
      maxLength: [50, "ISBN cannot exceed 50 characters"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      maxLength: [150, "Author name cannot exceed 150 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    offerPrice: {
      type: Number,
      min: [0, "Offer price must be a positive number"],
      default: null,
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    status: {
      type: String,
      enum: ["Published", "Draft", "Out of Stock"],
      default: "Published",
    },
    image: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxLength: [5000, "Description cannot exceed 5000 characters"],
    },
    publisher: {
      type: String,
      trim: true,
      default: "",
      maxLength: [150, "Publisher cannot exceed 150 characters"],
    },
    pages: {
      type: Number,
      min: 0,
      default: 0,
    },
    language: {
      type: String,
      trim: true,
      default: "English",
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isTopSelling: {
      type: Boolean,
      default: false,
      index: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },
    salesCount: {
      type: Number,
      default: 0,
      min: [0, "Sales count cannot be negative"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes for Sorting & Filtering
bookSchema.index({ createdAt: -1 });
bookSchema.index({ category: 1, createdAt: -1 });
bookSchema.index({ status: 1, createdAt: -1 });
bookSchema.index({ price: 1 });
bookSchema.index({ salesCount: -1 });

module.exports = mongoose.model("Book", bookSchema);
