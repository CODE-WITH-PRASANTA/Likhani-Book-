const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/adminAuthController");
const { protectAdmin, authorizeRoles } = require("../middleware/adminAuth");
const upload = require("../middleware/multer");

/* =========================================================
   PUBLIC ADMIN AUTH & PASSWORD RECOVERY (OTP) ROUTES
========================================================= */

// Admin login
router.post("/login", adminAuthController.loginAdmin);

// Create / register admin user
router.post("/create", adminAuthController.createAdmin);
router.post("/register", adminAuthController.createAdmin);

// Refresh access token
router.post("/refresh-token", adminAuthController.refreshToken);

// Logout admin
router.post("/logout", adminAuthController.logoutAdmin);

// OTP-based Forgot Password
router.post("/forgot-password", adminAuthController.forgotPassword);
router.post("/verify-otp", adminAuthController.verifyResetOtp);
router.post("/reset-password", adminAuthController.resetPassword);

/* =========================================================
   PROTECTED ADMIN PROFILE & MANAGEMENT ROUTES
========================================================= */

// Get currently logged in admin profile
router.get("/me", protectAdmin, adminAuthController.getMe);
router.get("/profile", protectAdmin, adminAuthController.getMe);

// Update admin profile details & avatar
router.put("/me", protectAdmin, upload, adminAuthController.updateAdminProfile);
router.put("/profile", protectAdmin, upload, adminAuthController.updateAdminProfile);

// Change password for logged-in admin (direct or with OTP)
router.put("/change-password", protectAdmin, adminAuthController.changePassword);

// Get all admin users (for management inside admin panel)
router.get("/users", protectAdmin, adminAuthController.getAllAdmins);
router.get("/all", protectAdmin, adminAuthController.getAllAdmins);

module.exports = router;
