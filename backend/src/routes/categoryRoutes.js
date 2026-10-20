const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  getTopSellingCategories,
} = require("../controllers/categoryController");

router.get("/top-selling", getTopSellingCategories);
router.route("/").get(getCategories).post(createCategory);
router.post("/bulk-delete", bulkDeleteCategories);
router.route("/:id").get(getCategoryById).put(updateCategory).delete(deleteCategory);

module.exports = router;
