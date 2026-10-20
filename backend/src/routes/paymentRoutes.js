const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

// Customer routes
router.post("/create-order", protect, paymentController.createOrder);
router.post("/retry-order", protect, paymentController.retryOrderPayment);
router.post("/verify-payment", protect, paymentController.verifyPayment);
router.post("/payment-failed", paymentController.recordPaymentFailure);
router.get("/my-orders", protect, paymentController.getMyOrders);

// Admin & General Order routes
router.get("/all", paymentController.getAllOrders);
router.get("/", paymentController.getAllOrders);
router.put("/:id/status", paymentController.updateOrderStatus);
router.put("/:id", paymentController.updateOrderStatus);
router.delete("/:id", paymentController.deleteOrder);
router.post("/test-email", paymentController.sendTestEmail);

module.exports = router;
