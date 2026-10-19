const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Public approved reviews for frontend
router.get("/public", reviewController.getPublicReviews);

// Bulk delete reviews
router.post("/bulk-delete", reviewController.bulkDeleteReviews);

// Toggle/set review status
router.patch("/:id/status", reviewController.toggleReviewStatus);

// Standard CRUD endpoints
router.get("/", reviewController.getReviews);
router.get("/:id", reviewController.getReviewById);
router.post("/", reviewController.createReview);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
