const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const {
  getAllTestimonials,
  getActiveTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  toggleStatus,
  deleteTestimonial,
  bulkDeleteTestimonials,
} = require("../controllers/testimonialController");

// Public route for landing page / frontend
router.get("/active", getActiveTestimonials);

// Bulk deletion (must be before dynamic :id route)
router.post("/bulk-delete", bulkDeleteTestimonials);

// CRUD routes for Admin Panel
router.get("/", getAllTestimonials);
router.post("/", upload, createTestimonial);
router.get("/:id", getTestimonialById);
router.put("/:id", upload, updateTestimonial);
router.patch("/:id/status", toggleStatus);
router.delete("/:id", deleteTestimonial);

module.exports = router;