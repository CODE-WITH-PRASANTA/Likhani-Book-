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
  },
  {
    timestamps: true,
  }
);

// Search index on title and author
bookPostingSchema.index({ title: "text", author: "text" });
bookPostingSchema.index({ createdAt: -1 });

module.exports = mongoose.model("BookPosting", bookPostingSchema);
