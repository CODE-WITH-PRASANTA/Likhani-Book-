const express = require("express");
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  getMe,
  updateProfile,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Public auth routes
router.post("/register", register);
router.post("/signup", register); // Alias for convenience
router.post("/login", login);
router.post("/google", googleAuth);

// Password recovery / OTP routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Address management routes
const addressController = require("../controllers/addressController");
router.get("/addresses", protect, addressController.getAddresses);
router.post("/addresses", protect, addressController.addAddress);
router.put("/addresses/:id", protect, addressController.updateAddress);
router.delete("/addresses/:id", protect, addressController.deleteAddress);
router.put("/addresses/:id/default", protect, addressController.setDefaultAddress);

module.exports = router;
