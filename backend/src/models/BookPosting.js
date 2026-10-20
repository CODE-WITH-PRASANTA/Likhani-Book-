const mongoose = require("mongoose");

const bookPostingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      maxlength: [120, "Author name cannot exceed 120 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    offerPrice: {
      type: Number,
      default: null,
      min: [0, "Offer price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    status: {
      type: String,
      enum: ["Published", "Draft", "Out of Stock"],
      default: "Published",
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
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
    publisher: {
      type: String,
      trim: true,
      default: "",
      maxlength: [150, "Publisher cannot exceed 150 characters"],
    },
    pages: {
      type: Number,
      min: [0, "Pages cannot be negative"],
      default: 0,
    },
    language: {
      type: String,
      trim: true,
      default: "English",
      maxlength: [100, "Language cannot exceed 100 characters"],
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
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

// Search index on title and author
bookPostingSchema.index(
  { title: "text", author: "text" },
  { language_override: "none", default_language: "none" }
);
bookPostingSchema.index({ createdAt: -1 });
bookPostingSchema.index({ salesCount: -1 });

module.exports = mongoose.model("BookPosting", bookPostingSchema);
