const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxLength: [100, "Category name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxLength: [500, "Description cannot exceed 500 characters"],
    },
    color: {
      type: String,
      default: "blue",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Category", categorySchema);
