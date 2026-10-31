const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const { sendPasswordResetOtpEmail } = require("../utils/emailService");

// Helper to get refresh secret
const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET ||
  (process.env.JWT_SECRET
    ? `${process.env.JWT_SECRET}_refresh`
    : "lekhani_super_secret_jwt_refresh_key_2026");

// Cookie options for secure tokens
const getCookieOptions = (maxAgeMs = 7 * 24 * 60 * 60 * 1000) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: maxAgeMs,
});

/**
 * Clean admin object representation for API responses
 */
const sanitizeAdmin = (adminDoc) => {
  const adminObj = adminDoc.toObject ? adminDoc.toObject() : { ...adminDoc };
  delete adminObj.password;
  delete adminObj.refreshToken;
  delete adminObj.__v;
  return {
    id: adminObj._id ? adminObj._id.toString() : adminObj.id,
    ...adminObj,
  };
};

// =========================================================
// CREATE / REGISTER ADMIN USER
// =========================================================
exports.createAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      username,
      password,
      phone = "",
      role = "Admin",
      avatar = "",
      permissions,
    } = req.body || {};

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Admin name is required.",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username
      ? username.trim().toLowerCase()
      : normalizedEmail.split("@")[0];

    // Check if email already registered as admin
    const existingEmail = await AdminUser.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An admin with this email address already exists.",
      });
    }

    // Check if username already exists
    if (normalizedUsername) {
      const existingUsername = await AdminUser.findOne({
        username: normalizedUsername,
      });
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "An admin with this username already exists.",
        });
      }
    }

    // Validate role
    const allowedRoles = ["SuperAdmin", "Admin", "Editor", "Manager"];
    const adminRole = allowedRoles.includes(role) ? role : "Admin";

    // Create Admin User
    const adminUser = new AdminUser({
      name: name.trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      password,
      phone: phone.trim(),
      role: adminRole,
      status: "Active",
      avatar: avatar.trim(),
      permissions: Array.isArray(permissions) ? permissions : ["all"],
    });

    // Generate tokens
    const accessToken = adminUser.generateAccessToken();
    const refreshToken = adminUser.generateRefreshToken();

    // Store refresh token
    adminUser.refreshToken = refreshToken;
    adminUser.lastLogin = new Date();
    await adminUser.save();

    // Set refresh token cookie
    res.cookie("adminRefreshToken", refreshToken, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: "Admin user created successfully.",
      accessToken,
      refreshToken,
      admin: sanitizeAdmin(adminUser),
    });
  } catch (error) {
    console.error("CREATE ADMIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create admin user.",
    });
  }
};

// =========================================================
// LOGIN ADMIN USER
// =========================================================
exports.loginAdmin = async (req, res) => {
  try {
    const { identifier, email, username, password } = req.body || {};
    const inputIdentifier = (identifier || email || username || "").trim();

    if (!inputIdentifier) {
      return res.status(400).json({
        success: false,
        message: "Admin email or username is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    // Query by email or username
    const normalizedIdentifier = inputIdentifier.toLowerCase();
    const admin = await AdminUser.findOne({
      $or: [
        { email: normalizedIdentifier },
        { username: normalizedIdentifier },
      ],
    }).select("+password +refreshToken");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please verify your email/username and password.",
      });
    }

    // Check account status
    if (admin.status === "Blocked") {
      return res.status(403).json({
        success: false,
        message: "Your admin account is blocked. Contact administrator.",
      });
    }

    if (admin.status === "Inactive") {
      return res.status(403).json({
        success: false,
        message: "Your admin account is inactive. Please contact support.",
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please verify your email/username and password.",
      });
    }

    // Generate fresh tokens
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    // Update refresh token & lastLogin in database
    admin.refreshToken = refreshToken;
    admin.lastLogin = new Date();
    await admin.save();

    // Store in cookie
    res.cookie("adminRefreshToken", refreshToken, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      accessToken,
      refreshToken,
      admin: sanitizeAdmin(admin),
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Admin login failed due to a server error.",
    });
  }
};

// =========================================================
// REFRESH ACCESS TOKEN
// =========================================================
exports.refreshToken = async (req, res) => {
  try {
    const token =
      req.body?.refreshToken ||
      req.cookies?.adminRefreshToken ||
      req.headers["x-refresh-token"];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getRefreshSecret());
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token. Please sign in again.",
        isExpired: true,
      });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Malformed token payload.",
      });
    }

    const admin = await AdminUser.findById(decoded.id).select("+refreshToken");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin user not found.",
      });
    }

    if (admin.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: `Account is ${admin.status}. Please contact administrator.`,
      });
    }

    // Verify token matches the stored token
    if (!admin.refreshToken || admin.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid or has been revoked. Please sign in again.",
      });
    }

    // Issue new access token and rotate refresh token
    const newAccessToken = admin.generateAccessToken();
    const newRefreshToken = admin.generateRefreshToken();

    admin.refreshToken = newRefreshToken;
    await admin.save();

    res.cookie("adminRefreshToken", newRefreshToken, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully.",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      admin: sanitizeAdmin(admin),
    });
  } catch (error) {
    console.error("REFRESH TOKEN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to refresh token.",
    });
  }
};

// =========================================================
// LOGOUT ADMIN
// =========================================================
exports.logoutAdmin = async (req, res) => {
  try {
    const token =
      req.body?.refreshToken ||
      req.cookies?.adminRefreshToken ||
      req.headers["x-refresh-token"];

    const adminId = req.admin?._id;

    if (adminId) {
      await AdminUser.findByIdAndUpdate(adminId, {
        $set: { refreshToken: null },
      });
    } else if (token) {
      await AdminUser.findOneAndUpdate(
        { refreshToken: token },
        { $set: { refreshToken: null } }
      );
    }

    // Clear cookie
    res.clearCookie("adminRefreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("ADMIN LOGOUT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Logout failed.",
    });
  }
};

// =========================================================
// GET CURRENT ADMIN PROFILE (ME)
// =========================================================
exports.getMe = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    return res.status(200).json({
      success: true,
      admin: sanitizeAdmin(req.admin),
    });
  } catch (error) {
    console.error("GET ADMIN ME ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve profile.",
    });
  }
};

// =========================================================
// UPDATE ADMIN PROFILE
// =========================================================
exports.updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to update profile.",
      });
    }

    const {
      name,
      email,
      username,
      phone,
      location,
      bio,
      role,
      travelerType,
      homeLocation,
    } = req.body || {};

    const admin = await AdminUser.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    // Name update
    if (name && name.trim()) {
      admin.name = name.trim();
    }

    // Email update (with uniqueness check)
    if (email && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== admin.email) {
        const existing = await AdminUser.findOne({
          email: normalizedEmail,
          _id: { $ne: adminId },
        });
        if (existing) {
          return res.status(409).json({
            success: false,
            message: "This email address is already in use by another admin.",
          });
        }
        admin.email = normalizedEmail;
      }
    }

    // Username update (with uniqueness check)
    if (username !== undefined) {
      const normalizedUsername = username.trim().toLowerCase();
      if (normalizedUsername && normalizedUsername !== admin.username) {
        const existing = await AdminUser.findOne({
          username: normalizedUsername,
          _id: { $ne: adminId },
        });
        if (existing) {
          return res.status(409).json({
            success: false,
            message: "This username is already taken.",
          });
        }
        admin.username = normalizedUsername;
      }
    }

    // Optional fields
    if (phone !== undefined) admin.phone = phone.trim();
    if (location !== undefined || homeLocation !== undefined) {
      admin.location = (location || homeLocation || "").trim();
    }
    if (bio !== undefined) admin.bio = bio.trim();

    // Role (support both role & legacy travelerType field names)
    const newRole = role || travelerType;
    if (newRole && ["SuperAdmin", "Admin", "Editor", "Manager", "Administrator"].includes(newRole)) {
      admin.role = newRole === "Administrator" ? "Admin" : newRole;
    }

    // Handle avatar upload via multer or avatar URL
    if (req.files && (req.files.avatarFile || req.files.avatar || req.files.profileImage)) {
      const uploadedFile =
        (req.files.avatarFile && req.files.avatarFile[0]) ||
        (req.files.avatar && req.files.avatar[0]) ||
        (req.files.profileImage && req.files.profileImage[0]);
      if (uploadedFile) {
        admin.avatar = `/uploads/${uploadedFile.filename}`;
      }
    } else if (req.body.avatar && req.body.avatar.trim()) {
      admin.avatar = req.body.avatar.trim();
    }

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully.",
      admin: sanitizeAdmin(admin),
      data: sanitizeAdmin(admin), // compatibility
    });
  } catch (error) {
    console.error("UPDATE ADMIN PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile.",
    });
  }
};

// =========================================================
// FORGOT PASSWORD - Generate and Send 6-digit OTP
// =========================================================
exports.forgotPassword = async (req, res) => {
  try {
    const { identifier, email } = req.body || {};
    const input = (identifier || email || "").trim().toLowerCase();

    if (!input) {
      return res.status(400).json({
        success: false,
        message: "Please provide your admin email address or username.",
      });
    }

    // Look up admin by email or username
    const admin = await AdminUser.findOne({
      $or: [{ email: input }, { username: input }],
    });

    if (!admin) {
      // Return 200/generic message or 404 for clarity in admin panel
      return res.status(404).json({
        success: false,
        message: "No admin account found with that email or username.",
      });
    }

    if (admin.status === "Blocked") {
      return res.status(403).json({
        success: false,
        message: "This admin account is suspended. Please contact SuperAdmin.",
      });
    }

    // Generate numeric 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.resetPasswordOtp = otp;
    admin.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity
    await admin.save();

    // Send email with OTP
    try {
      await sendPasswordResetOtpEmail({
        to: admin.email,
        name: admin.name,
        otp: otp,
      });
    } catch (mailErr) {
      console.warn("Failed to deliver OTP email via nodemailer:", mailErr.message);
    }

    // Always log OTP to server console for testing convenience
    console.log(`🔐 [ADMIN PASSWORD RESET OTP] Sent to ${admin.email}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${admin.email}.`,
      email: admin.email,
      // Provide OTP in response only in development/test environments
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  } catch (error) {
    console.error("ADMIN FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send password reset OTP.",
    });
  }
};

// =========================================================
// VERIFY OTP
// =========================================================
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, identifier, otp } = req.body || {};
    const input = (email || identifier || "").trim().toLowerCase();

    if (!input) {
      return res.status(400).json({
        success: false,
        message: "Admin email is required.",
      });
    }

    if (!otp || !otp.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "6-digit verification code is required.",
      });
    }

    const cleanOtp = otp.toString().trim();
    const admin = await AdminUser.findOne({
      $or: [{ email: input }, { username: input }],
    }).select("+resetPasswordOtp +resetPasswordExpires");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    if (!admin.resetPasswordOtp || admin.resetPasswordOtp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code. Please double-check and try again.",
      });
    }

    if (!admin.resetPasswordExpires || new Date() > new Date(admin.resetPasswordExpires)) {
      return res.status(400).json({
        success: false,
        message: "The OTP verification code has expired. Please request a new one.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You may now enter your new password.",
    });
  } catch (error) {
    console.error("ADMIN VERIFY OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP code.",
    });
  }
};

// =========================================================
// RESET PASSWORD WITH OTP
// =========================================================
exports.resetPassword = async (req, res) => {
  try {
    const { email, identifier, otp, newPassword, confirmPassword } = req.body || {};
    const input = (email || identifier || "").trim().toLowerCase();

    if (!input) {
      return res.status(400).json({
        success: false,
        message: "Admin email is required.",
      });
    }

    if (!otp || !otp.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "6-digit OTP code is required.",
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 6 characters.",
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const cleanOtp = otp.toString().trim();
    const admin = await AdminUser.findOne({
      $or: [{ email: input }, { username: input }],
    }).select("+resetPasswordOtp +resetPasswordExpires +password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    if (!admin.resetPasswordOtp || admin.resetPasswordOtp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code. Please request a new code.",
      });
    }

    if (!admin.resetPasswordExpires || new Date() > new Date(admin.resetPasswordExpires)) {
      return res.status(400).json({
        success: false,
        message: "This OTP code has expired. Please request a new code.",
      });
    }

    // Set new password (pre-save hook will hash it with bcrypt)
    admin.password = newPassword;
    admin.resetPasswordOtp = null;
    admin.resetPasswordExpires = null;
    admin.refreshToken = null; // Invalidate active sessions for security
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Your admin password has been reset successfully. Please log in with your new credentials.",
    });
  } catch (error) {
    console.error("ADMIN RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reset password.",
    });
  }
};

// =========================================================
// CHANGE PASSWORD (For Logged-in Admin in MyProfile)
// =========================================================
exports.changePassword = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { currentPassword, newPassword, confirmPassword, otp } = req.body || {};

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match.",
      });
    }

    const admin = await AdminUser.findById(adminId).select(
      "+password +resetPasswordOtp +resetPasswordExpires"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    // If OTP was provided, verify OTP
    if (otp) {
      const cleanOtp = otp.toString().trim();
      if (!admin.resetPasswordOtp || admin.resetPasswordOtp !== cleanOtp) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP code.",
        });
      }
      if (!admin.resetPasswordExpires || new Date() > new Date(admin.resetPasswordExpires)) {
        return res.status(400).json({
          success: false,
          message: "OTP code has expired. Please request a new code.",
        });
      }
    } else {
      // Verify current password
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password or verification OTP is required.",
        });
      }

      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Incorrect current password.",
        });
      }
    }

    // Update password
    admin.password = newPassword;
    admin.resetPasswordOtp = null;
    admin.resetPasswordExpires = null;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("ADMIN CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to change password.",
    });
  }
};

// =========================================================
// GET ALL ADMIN USERS (Protected for Admins)
// =========================================================
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await AdminUser.find()
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: admins.length,
      admins: admins.map((a) => sanitizeAdmin(a)),
    });
  } catch (error) {
    console.error("GET ALL ADMINS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch admin users.",
    });
  }
};

// =========================================================
// SEED OR SYNC DEFAULT ADMIN FROM ENVIRONMENT VARIABLES
// =========================================================
exports.seedInitialAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "lekhani@publication.com").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "Lekhani@123";
    const adminName = process.env.ADMIN_NAME || "Lekhani Master Admin";
    const adminUsername = (process.env.ADMIN_USERNAME || "lekhani").trim().toLowerCase();

    let admin = await AdminUser.findOne({
      $or: [{ email: adminEmail }, { username: adminUsername }],
    }).select("+password");

    if (!admin) {
      admin = new AdminUser({
        name: adminName,
        email: adminEmail,
        username: adminUsername,
        password: adminPassword,
        role: "SuperAdmin",
        status: "Active",
        permissions: ["all"],
      });
      await admin.save();
      console.log(`✅ Master Admin seeded from env: ${adminEmail}`);
    } else {
      // Ensure credentials and status match .env
      const isPasswordMatch = await admin.comparePassword(adminPassword);
      let modified = false;

      if (!isPasswordMatch) {
        admin.password = adminPassword;
        modified = true;
      }
      if (admin.email !== adminEmail) {
        admin.email = adminEmail;
        modified = true;
      }
      if (admin.status !== "Active") {
        admin.status = "Active";
        modified = true;
      }
      if (admin.role !== "SuperAdmin") {
        admin.role = "SuperAdmin";
        modified = true;
      }
      if (modified) {
        await admin.save();
        console.log(`✅ Master Admin credentials synchronized from env: ${adminEmail}`);
      }
    }
  } catch (err) {
    console.error("Seed admin error:", err.message);
  }
};

