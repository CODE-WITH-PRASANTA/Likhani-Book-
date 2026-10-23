const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

// Blog-specific comment routes
router
  .route("/blog/:identifier")
  .get(commentController.getCommentsByBlog)
  .post(commentController.createComment);

// General comment endpoints
router
  .route("/")
  .get(commentController.getAllComments)
  .post(commentController.createComment);

// Publish & Unpublish actions
router.patch("/:id/publish", commentController.publishComment);
router.patch("/:id/unpublish", commentController.unpublishComment);

// Individual comment deletion
router.route("/:id").delete(commentController.deleteComment);

module.exports = router;
