const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");

// Cart validation endpoint
router.post("/validate", couponController.validateCouponForCart);

// Bulk delete
router.post("/bulk-delete", couponController.bulkDeleteCoupons);

// Toggle/update status
router.patch("/:id/status", couponController.toggleCouponStatus);

// Standard CRUD endpoints
router.get("/", couponController.getCoupons);
router.get("/:id", couponController.getCouponById);
router.post("/", couponController.createCoupon);
router.put("/:id", couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);

module.exports = router;
