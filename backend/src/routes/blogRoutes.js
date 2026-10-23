const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const upload = require("../middleware/multer");

// List & Create
router
  .route("/")
  .get(blogController.getBlogs)
  .post(upload, blogController.createBlog);

// Bulk Delete
router.post("/bulk-delete", blogController.bulkDeleteBlogs);
router.delete("/bulk", blogController.bulkDeleteBlogs);

// Categories
router.get("/categories", blogController.getBlogCategories);

// Single Item CRUD
router
  .route("/:id")
  .get(blogController.getBlogById)
  .put(upload, blogController.updateBlog)
  .delete(blogController.deleteBlog);

const commentController = require("../controllers/commentController");

// Blog Comments (sub-resource)
router
  .route("/:identifier/comments")
  .get(commentController.getCommentsByBlog)
  .post(commentController.createComment);

// Toggle Status
router.patch("/:id/status", blogController.toggleBlogStatus);

module.exports = router;
