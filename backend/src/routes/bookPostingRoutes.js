const express = require("express");
const router = express.Router();
const bookPostingController = require("../controllers/bookPostingController");
const upload = require("../middleware/multer");

// List & Create
router
  .route("/")
  .get(bookPostingController.getBookPostings)
  .post(upload, bookPostingController.createBookPosting);

// Bulk Delete
router.post("/bulk-delete", bookPostingController.bulkDeleteBookPostings);
router.delete("/bulk", bookPostingController.bulkDeleteBookPostings);

// Top Selling Books (must be before dynamic :id)
router.get("/top-selling", bookPostingController.getTopSellingBookPostings);
router.get("/featured-authors", bookPostingController.getFeaturedAuthors);

// Single Item CRUD
router
  .route("/:id")
  .get(bookPostingController.getBookPostingById)
  .put(upload, bookPostingController.updateBookPosting)
  .delete(bookPostingController.deleteBookPosting);

// Status & Featured & Top Selling & Best Seller Toggles
router.patch("/:id/status", bookPostingController.toggleBookPostingStatus);
router.patch("/:id/featured", bookPostingController.toggleBookPostingFeatured);
router.patch("/:id/top-selling", bookPostingController.toggleBookPostingTopSelling);
router.patch("/:id/best-seller", bookPostingController.toggleBookPostingBestSeller);

module.exports = router;
