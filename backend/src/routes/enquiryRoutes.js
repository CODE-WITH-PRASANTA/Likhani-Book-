const express = require("express");

const {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
  deleteMultipleEnquiries,
} = require("../controllers/enquiryController");

const router = express.Router();

// =====================================================
// CREATE
// POST /api/enquiries
// =====================================================

router.post("/", createEnquiry);

// =====================================================
// GET ALL
// GET /api/enquiries
// =====================================================

router.get("/", getEnquiries);

// =====================================================
// BULK DELETE
// DELETE /api/enquiries/bulk
// =====================================================

router.delete("/bulk", deleteMultipleEnquiries);

// =====================================================
// GET SINGLE
// GET /api/enquiries/:id
// =====================================================

router.get("/:id", getEnquiryById);

// =====================================================
// UPDATE
// PUT /api/enquiries/:id
// =====================================================

router.put("/:id", updateEnquiry);

// =====================================================
// DELETE
// DELETE /api/enquiries/:id
// =====================================================

router.delete("/:id", deleteEnquiry);

module.exports = router;