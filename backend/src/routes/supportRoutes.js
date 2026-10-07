const express = require("express");
const router = express.Router();
const {
  getSupports,
  createSupport,
  updateSupport,
  deleteSupport,
  bulkDeleteSupports,
} = require("../controllers/supportController");

router.route("/").get(getSupports).post(createSupport);
router.post("/bulk-delete", bulkDeleteSupports);
router.route("/:id").put(updateSupport).delete(deleteSupport);

module.exports = router;