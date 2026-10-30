const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
      maxLength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Admin email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      unique: true,
      maxLength: [50, "Username cannot exceed 50 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["SuperAdmin", "Admin", "Editor", "Manager"],
      default: "Admin",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Blocked"],
      default: "Active",
    },
    avatar: {
      type: String,
      default: "",
    },
    permissions: {
      type: [String],
      default: ["all"],
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    resetPasswordOtp: {
      type: String,
      select: false,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
      default: null,
    },
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "admin_users", // Separate collection for Admin Users
  }
);

// Performance indexes (unique: true on email & username already creates their indexes)
adminUserSchema.index({ status: 1 });
adminUserSchema.index({ role: 1 });
adminUserSchema.index({ createdAt: -1 });

// Pre-save hook: Hash password and populate avatar if missing
adminUserSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (!this.avatar && this.name) {
    this.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      this.name
    )}&background=1e3a5f&color=ffffff&bold=true`;
  }
});

// Compare password helper
adminUserSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Access Token (Short-lived, e.g. 2 hours)
adminUserSchema.methods.generateAccessToken = function () {
  const secret = process.env.JWT_SECRET || "lekhani_super_secret_jwt_key_2026";
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      type: "admin_access",
    },
    secret,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "2h" }
  );
};

// Generate Refresh Token (Longer-lived, e.g. 7 days)
adminUserSchema.methods.generateRefreshToken = function () {
  const refreshSecret =
    process.env.JWT_REFRESH_SECRET ||
    (process.env.JWT_SECRET
      ? `${process.env.JWT_SECRET}_refresh`
      : "lekhani_super_secret_jwt_refresh_key_2026");

  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      type: "admin_refresh",
    },
    refreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );
};

module.exports = mongoose.model("AdminUser", adminUserSchema);
