const express = require("express");
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Public auth routes
router.post("/register", register);
router.post("/signup", register); // Alias for convenience
router.post("/login", login);
router.post("/google", googleAuth);

// Protected routes
router.get("/me", protect, getMe);

module.exports = router;
