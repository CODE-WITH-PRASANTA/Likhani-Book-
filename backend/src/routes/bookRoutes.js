const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  bulkDeleteBooks,
  toggleBookStatus,
  toggleFeatured,
} = require("../controllers/bookController");

// List & Create
router.route("/").get(getBooks).post(upload, createBook);

// Bulk Delete (before dynamic :id)
router.post("/bulk-delete", bulkDeleteBooks);

// Status & Featured Toggles
router.patch("/:id/status", toggleBookStatus);
router.patch("/:id/featured", toggleFeatured);

// Single Item CRUD
router.route("/:id").get(getBookById).put(upload, updateBook).delete(deleteBook);

module.exports = router;
