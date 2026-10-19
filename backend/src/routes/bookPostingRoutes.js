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

// Single Item CRUD
router
  .route("/:id")
  .get(bookPostingController.getBookPostingById)
  .put(upload, bookPostingController.updateBookPosting)
  .delete(bookPostingController.deleteBookPosting);

// Status & Featured Toggles
router.patch("/:id/status", bookPostingController.toggleBookPostingStatus);
router.patch("/:id/featured", bookPostingController.toggleBookPostingFeatured);

module.exports = router;
