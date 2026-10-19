const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const {
  getAllGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
  bulkDeleteGalleries,
  incrementViews,
} = require("../controllers/galleryController");

// Bulk deletion (must be placed before dynamic :id route)
router.post("/bulk-delete", bulkDeleteGalleries);

// CRUD routes
router.get("/", getAllGalleries);
router.post("/", upload, createGallery);
router.get("/:id", getGalleryById);
router.put("/:id", upload, updateGallery);
router.delete("/:id", deleteGallery);
router.post("/:id/view", incrementViews);

module.exports = router;
