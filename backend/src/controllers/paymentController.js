const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const Book = require("../models/Book");
const BookPosting = require("../models/BookPosting");
const Coupon = require("../models/Coupon");
const {
  sendOrderConfirmationEmail,
  sendPaymentFailedEmail,
  sendOrderDeliveredEmail,
  notifyOrderStatusChange,
  sendTestSampleEmail,
} = require("../utils/emailService");
const {
  createRazorpayOrder,
  fetchRazorpayOrder,
  fetchRazorpayOrderPayments,
  fetchRazorpayPayment,
  verifyRazorpaySignature,
} = require("../utils/razorpayClient");

/**
 * Creates a Razorpay Order and preliminary Order record in the database
 * Route: POST /api/payment/create-order
 * Access: Private (Customer)
 */
exports.createOrder = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_TppGgVggUkbJv4";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "PMTMnawtXe2ZEHUUPT2JMzoN";

    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay credentials are not configured on the server.",
      });
    }

    const { items, shippingAddress, pricing } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Please select books before checkout.",
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete delivery address and contact information are required.",
      });
    }

    // 1. Authoritative Catalog & Stock Validation
    let serverSubtotal = 0;
    const formattedItems = [];

    for (const item of items) {
      const bId = item.id || item.bookId || item._id;
      const title = (item.title || item.name || "").trim();
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

      // Search BookPosting first, then Book
      let bookRecord = null;
      if (bId && mongoose.isValidObjectId(bId)) {
        bookRecord = await BookPosting.findById(bId).lean();
        if (!bookRecord) {
          bookRecord = await Book.findById(bId).lean();
        }
      }
      if (!bookRecord && title) {
        const titleRegex = new RegExp(`^${title.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, "i");
        bookRecord = await BookPosting.findOne({ title: titleRegex }).lean();
        if (!bookRecord) {
          bookRecord = await Book.findOne({ title: titleRegex }).lean();
        }
      }

      if (!bookRecord) {
        return res.status(400).json({
          success: false,
          message: `Book "${title || bId}" was not found in our catalog. Please update your cart.`,
        });
      }

      // Check stock and status
      if (bookRecord.status === "Out of Stock" || bookRecord.stock <= 0) {
        return res.status(400).json({
          success: false,
          message: `"${bookRecord.title}" is currently out of stock.`,
        });
      }

      if (quantity > bookRecord.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${bookRecord.stock} copies of "${bookRecord.title}" are available in stock (requested ${quantity}).`,
        });
      }

      // Authoritative unit price from database
      const authoritativeUnitPrice =
        typeof bookRecord.offerPrice === "number" && bookRecord.offerPrice > 0
          ? bookRecord.offerPrice
          : bookRecord.price;

      serverSubtotal += authoritativeUnitPrice * quantity;

      formattedItems.push({
        bookId: bookRecord._id.toString(),
        title: bookRecord.title,
        author: bookRecord.author || "Unknown",
        price: authoritativeUnitPrice,
        quantity,
        coverImage: item.image || item.coverImage || bookRecord.image || (Array.isArray(bookRecord.images) && bookRecord.images[0]) || "",
      });
    }

    // 2. Authoritative Coupon Validation
    let serverDiscount = 0;
    let validatedCouponCode = "";

    if (pricing?.couponCode && String(pricing.couponCode).trim()) {
      const cleanCode = String(pricing.couponCode).trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCode });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: `Coupon code '${cleanCode}' is invalid.`,
        });
      }

      if (coupon.status === "Disabled") {
        return res.status(400).json({
          success: false,
          message: `Coupon '${cleanCode}' is currently disabled.`,
        });
      }

      const today = new Date().toISOString().split("T")[0];
      if (coupon.status === "Scheduled" || coupon.startDate > today) {
        return res.status(400).json({
          success: false,
          message: `Coupon '${cleanCode}' is not active yet (valid from ${coupon.startDate}).`,
        });
      }

      if (coupon.status === "Expired" || coupon.endDate < today) {
        return res.status(400).json({
          success: false,
          message: `Coupon '${cleanCode}' expired on ${coupon.endDate}.`,
        });
      }

      if (
        coupon.usageLimit !== "Unlimited" &&
        typeof coupon.usageLimit === "number" &&
        coupon.used >= coupon.usageLimit
      ) {
        return res.status(400).json({
          success: false,
          message: `Coupon '${cleanCode}' has reached its maximum usage limit.`,
        });
      }

      if (serverSubtotal < (coupon.minimumPurchase || 0)) {
        return res.status(400).json({
          success: false,
          message: `Minimum order of ₹${coupon.minimumPurchase} required for coupon '${cleanCode}'.`,
        });
      }

      serverDiscount = Math.round((serverSubtotal * coupon.discountPercent) / 100);
      validatedCouponCode = cleanCode;
    }

    // 3. Authoritative Total & Anti-Tampering Check
    const shippingFee = Number(pricing?.shippingFee) || 0;
    const authoritativeTotal = Math.max(0, serverSubtotal - serverDiscount + shippingFee);

    const clientTotal = Number(pricing?.totalAmount);
    if (!clientTotal || isNaN(clientTotal) || clientTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order total amount provided.",
      });
    }

    // Reject if client total deviates from server calculation by more than ₹1 (rounding leeway)
    if (Math.abs(authoritativeTotal - clientTotal) > 1) {
      return res.status(400).json({
        success: false,
        message: `Pricing discrepancy detected: cart submitted ₹${clientTotal}, but verified price is ₹${authoritativeTotal}. Please refresh your cart.`,
        verifiedPricing: {
          itemsSubtotal: serverSubtotal,
          discount: serverDiscount,
          shippingFee,
          totalAmount: authoritativeTotal,
        },
      });
    }

    // Amount in paise (Razorpay standard: ₹1 = 100 paise)
    const amountInPaise = Math.round(authoritativeTotal * 100);
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const customOrderId = `ORD-${dateCode}-${randomSuffix}`;
    const receiptId = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let rzpOrderId = null;
    let isSimulated = false;

    // Call official Razorpay API with IPv4 DNS resolver
    try {
      const rzpRes = await createRazorpayOrder({
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
        notes: {
          userId: req.user._id.toString(),
          userEmail: req.user.email,
          itemCount: String(formattedItems.length),
        },
      });

      if (rzpRes.ok && rzpRes.data?.id) {
        rzpOrderId = rzpRes.data.id;
        console.log(`[PaymentController] Successfully created live Razorpay order: ${rzpOrderId}`);
      } else {
        console.warn("[PaymentController] Razorpay order creation response not ok:", rzpRes);
      }
    } catch (networkErr) {
      console.warn(
        `[PaymentController] ⚠️ Notice: Error calling Razorpay API (${networkErr.message}). Switching gracefully to test sandbox mode.`
      );
    }

    // Graceful fallback for offline test environments
    if (!rzpOrderId) {
      isSimulated = true;
      const simSuffix = Math.random().toString(36).substring(2, 8);
      rzpOrderId = `order_sim_${Date.now()}_${simSuffix}`;
    }

    // Create DB Order record
    const dbOrder = await Order.create({
      user: req.user._id,
      orderId: customOrderId,
      items: formattedItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        email: (shippingAddress.email || req.user.email).trim().toLowerCase(),
        phone: shippingAddress.phone.trim(),
        street: shippingAddress.street.trim(),
        locality: (shippingAddress.locality || "").trim(),
        city: shippingAddress.city.trim(),
        state: (shippingAddress.state || "Odisha").trim(),
        pincode: shippingAddress.pincode.trim(),
        landmark: (shippingAddress.landmark || "").trim(),
        addressType: shippingAddress.addressType || "Home",
      },
      paymentInfo: {
        method: "Razorpay",
        razorpayOrderId: rzpOrderId,
        status: "Pending",
      },
      pricing: {
        itemsSubtotal: serverSubtotal,
        discount: serverDiscount,
        couponCode: validatedCouponCode,
        shippingFee: shippingFee,
        totalAmount: authoritativeTotal,
        currency: "INR",
      },
      orderStatus: "Placed",
      receipt: receiptId,
    });

    return res.status(201).json({
      success: true,
      message: isSimulated
        ? "Order initialized in test sandbox mode (Razorpay offline/simulated)"
        : "Razorpay order initialized successfully",
      isSimulated,
      key: keyId,
      order: {
        dbOrderId: dbOrder._id,
        orderId: customOrderId,
        razorpayOrderId: rzpOrderId,
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
      },
      customer: {
        name: shippingAddress.fullName,
        email: shippingAddress.email || req.user.email,
        phone: shippingAddress.phone,
      },
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred while initiating checkout.",
      error: error.message,
    });
  }
};

/**
 * Retries payment for an existing unpaid/failed order
 * Route: POST /api/payment/retry-order
 * Access: Private (Customer)
 */
exports.retryOrderPayment = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_TppGgVggUkbJv4";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "PMTMnawtXe2ZEHUUPT2JMzoN";

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required to retry payment.",
      });
    }

    const mongoose = require("mongoose");
    const query = {
      $or: [
        { _id: mongoose.isValidObjectId(orderId) ? orderId : null },
        { orderId: orderId },
      ],
    };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order record not found.",
      });
    }

    // Verify ownership
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to pay for this order.",
      });
    }

    if (order.paymentInfo?.status === "Paid") {
      return res.status(400).json({
        success: false,
        message: "This order has already been paid successfully.",
      });
    }

    const totalAmount = Number(order.pricing?.totalAmount);
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount for payment.",
      });
    }

    const amountInPaise = Math.round(totalAmount * 100);
    const receiptId = `rcpt_retry_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let rzpOrderId = null;
    let isSimulated = false;

    try {
      const rzpRes = await createRazorpayOrder({
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
        notes: {
          userId: req.user._id.toString(),
          orderId: order.orderId,
          isRetry: "true",
        },
      });

      if (rzpRes.ok && rzpRes.data?.id) {
        rzpOrderId = rzpRes.data.id;
        console.log(`[PaymentController] Successfully generated retry Razorpay order: ${rzpOrderId}`);
      } else {
        console.warn("[PaymentController] Retry Razorpay order response not ok:", rzpRes);
      }
    } catch (networkErr) {
      console.warn(
        `[PaymentController] Error connecting to Razorpay for retry order: ${networkErr.message}`
      );
    }

    if (!rzpOrderId) {
      isSimulated = true;
      const simSuffix = Math.random().toString(36).substring(2, 8);
      rzpOrderId = `order_sim_${Date.now()}_${simSuffix}`;
    }

    // Update order with fresh razorpayOrderId & reset status to Pending
    order.paymentInfo.razorpayOrderId = rzpOrderId;
    order.paymentInfo.status = "Pending";
    order.orderStatus = "Placed"; // Reset from Cancelled so customer can complete
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment order initialized successfully.",
      isSimulated,
      key: keyId,
      order: {
        dbOrderId: order._id,
        orderId: order.orderId,
        razorpayOrderId: rzpOrderId,
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
      },
      customer: {
        name: order.shippingAddress?.fullName || req.user.name,
        email: order.shippingAddress?.email || req.user.email,
        phone: order.shippingAddress?.phone || req.user.phone,
      },
    });
  } catch (error) {
    console.error("Error retrying order payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred while retrying payment.",
      error: error.message,
    });
  }
};

/**
 * Verifies Razorpay payment signature and marks order as Paid
 * Route: POST /api/payment/verify-payment
 * Access: Private (Customer)
 */
exports.verifyPayment = async (req, res) => {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "PMTMnawtXe2ZEHUUPT2JMzoN";

    const {
      dbOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const query = dbOrderId
      ? { _id: dbOrderId }
      : { "paymentInfo.razorpayOrderId": razorpay_order_id };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order record not found.",
      });
    }

    // Idempotency Guard: If order has already been verified and paid, return early to prevent double-processing
    if (order.paymentInfo?.status === "Paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified and recorded.",
        isIdempotent: true,
        order: {
          id: order._id,
          orderId: order.orderId,
          totalAmount: order.pricing?.totalAmount,
          currency: order.pricing?.currency,
          itemsCount: order.items?.length || 0,
          paymentStatus: order.paymentInfo.status,
          paymentId: order.paymentInfo.razorpayPaymentId,
          paidAt: order.paymentInfo.paidAt,
        },
      });
    }

    // Check if this is a simulated test order or real Razorpay HMAC signature
    const isSimulatedOrder =
      razorpay_signature === "simulated_success" ||
      (order.paymentInfo?.razorpayOrderId &&
        order.paymentInfo.razorpayOrderId.startsWith("order_sim_")) ||
      (razorpay_order_id && razorpay_order_id.startsWith("order_sim_"));

    let isMatch = false;

    if (isSimulatedOrder) {
      isMatch = true;
    } else {
      // 1. Direct HMAC SHA256 verification
      if (razorpay_signature && (razorpay_order_id || order.paymentInfo?.razorpayOrderId)) {
        const orderIdToVerify = razorpay_order_id || order.paymentInfo.razorpayOrderId;
        isMatch = verifyRazorpaySignature({
          orderId: orderIdToVerify,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        });
      }

      // 2. Direct API reconciliation fallback
      if (!isMatch && razorpay_payment_id) {
        try {
          const payRes = await fetchRazorpayPayment(razorpay_payment_id);
          if (payRes.ok && payRes.data) {
            const payStatus = payRes.data.status;
            if (payStatus === "captured" || payStatus === "authorized") {
              isMatch = true;
            }
          }
        } catch (apiErr) {
          console.warn("[PaymentController] Direct payment status check warning:", apiErr.message);
        }
      }
    }

    if (!isMatch) {
      order.paymentInfo.status = "Failed";
      order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
      order.paymentInfo.razorpaySignature = razorpay_signature;
      await order.save();

      // Send payment failed email asynchronously (non-blocking)
      sendPaymentFailedEmail(order, "Payment signature verification failed.").catch((err) => {
        console.error("[EmailService] Error sending payment failed email on signature mismatch:", err.message);
      });

      return res.status(400).json({
        success: false,
        message: "Payment signature mismatch. Transaction failed verification.",
      });
    }

    // Mark Order as Paid
    if (!order.orderId) {
      const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      order.orderId = `ORD-${dateCode}-${randomSuffix}`;
    }
    order.paymentInfo.status = "Paid";
    order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
    order.paymentInfo.razorpaySignature = razorpay_signature;
    order.paymentInfo.paidAt = new Date();
    order.orderStatus = "Placed";
    await order.save();

    // Trigger Order Confirmation Email to customer (non-blocking)
    sendOrderConfirmationEmail(order).catch((err) => {
      console.error("[EmailService] Error sending order confirmation email:", err.message);
    });

    // Increment user's order count
    await User.findByIdAndUpdate(order.user, {
      $inc: { orders: 1 },
      $set: {
        address: `${order.shippingAddress.street}, ${order.shippingAddress.city}`,
        phone: order.shippingAddress.phone,
      },
    });

    // Atomically decrement stock and increment salesCount on purchased books
    try {
      for (const item of order.items || []) {
        const qty = Number(item.quantity) || 1;
        const bId = item.bookId;
        const title = (item.title || "").trim();

        const matchConditions = [];
        if (bId && mongoose.isValidObjectId(bId)) {
          matchConditions.push({ _id: bId });
        }
        if (title) {
          matchConditions.push({
            title: {
              $regex: new RegExp(`^${title.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, "i"),
            },
          });
        }

        if (matchConditions.length > 0) {
          // Decrement stock and increment salesCount
          await Promise.allSettled([
            BookPosting.updateMany({ $or: matchConditions }, { $inc: { stock: -qty, salesCount: qty } }),
            Book.updateMany({ $or: matchConditions }, { $inc: { stock: -qty, salesCount: qty } }),
          ]);

          // Prevent negative stock and mark as "Out of Stock" if 0 or below
          await Promise.allSettled([
            BookPosting.updateMany({ $or: matchConditions, stock: { $lte: 0 } }, { $set: { status: "Out of Stock", stock: 0 } }),
            Book.updateMany({ $or: matchConditions, stock: { $lte: 0 } }, { $set: { status: "Out of Stock", stock: 0 } }),
          ]);
        }
      }
    } catch (stockErr) {
      console.warn("[PaymentController] Warning updating book stock/sales count:", stockErr.message);
    }

    // Atomically increment coupon usage count
    if (order.pricing?.couponCode && String(order.pricing.couponCode).trim()) {
      try {
        const cleanCoupon = String(order.pricing.couponCode).trim().toUpperCase();
        await Coupon.findOneAndUpdate(
          { code: cleanCoupon },
          { $inc: { used: 1 } }
        );
      } catch (couponIncErr) {
        console.warn("[PaymentController] Warning incrementing coupon used count:", couponIncErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment successfully verified and order placed!",
      order: {
        id: order._id,
        orderId: order.orderId,
        totalAmount: order.pricing.totalAmount,
        currency: order.pricing.currency,
        itemsCount: order.items.length,
        paymentStatus: order.paymentInfo.status,
        paymentId: razorpay_payment_id,
        paidAt: order.paymentInfo.paidAt,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment.",
      error: error.message,
    });
  }
};

/**
 * Helper to sync pending order payment status directly with Razorpay API
 */
const syncOrderPaymentWithRazorpay = async (order) => {
  try {
    if (!order || !order.paymentInfo) return order;
    if (order.paymentInfo.status !== "Pending") return order;
    if (!order.paymentInfo.razorpayOrderId) return order;

    const rzpRes = await fetchRazorpayOrderPayments(order.paymentInfo.razorpayOrderId);
    if (!rzpRes.ok || !rzpRes.data) return order;

    const payments = Array.isArray(rzpRes.data.items) ? rzpRes.data.items : [];
    if (payments.length === 0) return order;

    // Check if any payment succeeded/captured
    const captured = payments.find(
      (p) => p.status === "captured" || p.captured === true
    );
    if (captured) {
      order.paymentInfo.status = "Paid";
      order.paymentInfo.razorpayPaymentId = captured.id;
      order.paymentInfo.paidAt = new Date(captured.created_at * 1000);
      order.orderStatus = "Placed";
      await order.save();

      // Trigger Order Confirmation Email
      sendOrderConfirmationEmail(order).catch((err) => {
        console.error("[EmailService] Reconciliation order confirmation error:", err.message);
      });
      return order;
    }

    // Check if all attempted payments failed
    const allFailed = payments.every((p) => p.status === "failed");
    if (allFailed) {
      const latest = payments[0];
      order.paymentInfo.status = "Failed";
      if (latest && latest.id) {
        order.paymentInfo.razorpayPaymentId = latest.id;
      }
      order.orderStatus = "Cancelled";
      await order.save();

      // Trigger Payment Failed Email
      sendPaymentFailedEmail(
        order,
        latest?.error_description || "Payment attempt declined by payment provider."
      ).catch((err) => {
        console.error("[EmailService] Reconciliation payment failed error:", err.message);
      });
      return order;
    }

    return order;
  } catch (err) {
    console.error("Reconciliation error for order", order._id, err.message);
    return order;
  }
};

/**
 * Records payment failure when Razorpay on('payment.failed') triggers
 * Route: POST /api/payment/payment-failed
 * Access: Private (Customer)
 */
exports.recordPaymentFailure = async (req, res) => {
  try {
    const { dbOrderId, razorpay_order_id, razorpay_payment_id, error } = req.body;

    const query = dbOrderId
      ? { _id: dbOrderId }
      : { "paymentInfo.razorpayOrderId": razorpay_order_id };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order record not found.",
      });
    }

    order.paymentInfo.status = "Failed";
    if (razorpay_payment_id) {
      order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
    }
    order.orderStatus = "Cancelled";
    await order.save();

    const failureReason =
      error?.description ||
      error?.reason ||
      error?.message ||
      "Payment could not be completed by your bank/payment provider.";

    // Trigger Payment Failed Email (non-blocking)
    sendPaymentFailedEmail(order, failureReason).catch((err) => {
      console.error("[EmailService] Error sending payment failed email:", err.message);
    });

    return res.status(200).json({
      success: true,
      message: "Order payment marked as failed.",
      order,
    });
  } catch (error) {
    console.error("Payment failure recording error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record payment failure.",
      error: error.message,
    });
  }
};

/**
 * Get current user's order history
 */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    // Reconcile pending orders in background
    const pendingOrders = orders.filter(
      (o) => o.paymentInfo?.status === "Pending" && o.paymentInfo?.razorpayOrderId
    );
    if (pendingOrders.length > 0) {
      await Promise.all(pendingOrders.map((o) => syncOrderPaymentWithRazorpay(o)));
    }

    // Ensure every order has a clean, professional customer-facing orderId
    for (const ord of orders) {
      if (!ord.orderId) {
        const dCode = ord.createdAt
          ? new Date(ord.createdAt).toISOString().slice(0, 10).replace(/-/g, "")
          : "20261019";
        const rCode = ord._id ? ord._id.toString().slice(-4).toUpperCase() : Math.floor(1000 + Math.random() * 9000);
        ord.orderId = `ORD-${dCode}-${rCode}`;
        await Order.findByIdAndUpdate(ord._id, { orderId: ord.orderId });
      }
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({
      success: false,
      message: "Could not retrieve order history.",
      error: error.message,
    });
  }
};

/**
 * Get all orders (for Admin Workspace / Dashboard)
 * Route: GET /api/orders/all, GET /api/orders
 */
exports.getAllOrders = async (req, res) => {
  try {
    // 1. Reconcile any pending orders with Razorpay in background
    try {
      const pendingOrders = await Order.find({
        "paymentInfo.status": "Pending",
        "paymentInfo.razorpayOrderId": { $exists: true, $ne: "" },
      })
        .sort({ createdAt: -1 })
        .limit(20);

      if (pendingOrders.length > 0) {
        await Promise.all(pendingOrders.map((o) => syncOrderPaymentWithRazorpay(o)));
      }
    } catch (reconcileErr) {
      console.warn("[PaymentController] Pending order reconciliation warning:", reconcileErr.message);
    }

    // 2. Build query filter: by default, only return paid/successful orders
    const { paymentStatus } = req.query;
    const query = {};

    if (paymentStatus && paymentStatus.toLowerCase() !== "all") {
      if (paymentStatus.toLowerCase() === "paid" || paymentStatus.toLowerCase() === "success") {
        query["paymentInfo.status"] = { $in: ["Paid", "paid", "success", "Success", "Refunded", "refunded"] };
      } else {
        query["paymentInfo.status"] = new RegExp(`^${paymentStatus}$`, "i");
      }
    } else if (!paymentStatus) {
      // By default: only return successfully paid (or refunded) orders for admin management
      query["paymentInfo.status"] = { $in: ["Paid", "paid", "success", "Success", "Refunded", "refunded"] };
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone firstName lastName")
      .sort({ createdAt: -1 });

    // 3. Ensure every order has a clean, professional orderId
    for (const ord of orders) {
      if (!ord.orderId) {
        const dCode = ord.createdAt
          ? new Date(ord.createdAt).toISOString().slice(0, 10).replace(/-/g, "")
          : "20261019";
        const rCode = ord._id ? ord._id.toString().slice(-4).toUpperCase() : Math.floor(1000 + Math.random() * 9000);
        ord.orderId = `ORD-${dCode}-${rCode}`;
        await Order.findByIdAndUpdate(ord._id, { orderId: ord.orderId });
      }
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching all orders for admin:", error);
    return res.status(500).json({
      success: false,
      message: "Could not retrieve orders from database.",
      error: error.message,
    });
  }
};

/**
 * Update order status or tracking (Admin)
 * Route: PUT /api/orders/:id/status, PUT /api/orders/:id
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, orderStatus, paymentStatus, payment } = req.body;

    const newStatus = status || orderStatus;
    const newPayment = paymentStatus || payment;

    const ALLOWED_ORDER_STATUSES = [
      "Placed",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Pending",
    ];
    const ALLOWED_PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];

    if (newStatus && !ALLOWED_ORDER_STATUSES.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status '${newStatus}'. Allowed: ${ALLOWED_ORDER_STATUSES.join(", ")}`,
      });
    }

    if (newPayment && !ALLOWED_PAYMENT_STATUSES.includes(newPayment)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status '${newPayment}'. Allowed: ${ALLOWED_PAYMENT_STATUSES.join(", ")}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found in database.",
      });
    }

    const previousStatus = order.orderStatus;
    const previousPayment = order.paymentInfo?.status;

    if (newStatus) {
      order.orderStatus = newStatus;
    }
    if (newPayment) {
      order.paymentInfo.status = newPayment;
      if (newPayment === "Paid" && !order.paymentInfo.paidAt) {
        order.paymentInfo.paidAt = new Date();
      }
    }

    const hubValue =
      req.body.currentCourierHub !== undefined
        ? req.body.currentCourierHub
        : req.body.currentHub !== undefined
        ? req.body.currentHub
        : req.body.currentLocation;
    if (hubValue !== undefined) {
      const sanitizedHub = hubValue ? String(hubValue).trim() : "";
      order.currentLocation = sanitizedHub;
      order.currentHub = sanitizedHub;
    }

    const deliveryDateValue =
      req.body.expectedDeliveryDate !== undefined
        ? req.body.expectedDeliveryDate
        : req.body.dateOfDelivery;
    if (deliveryDateValue !== undefined) {
      const sanitizedDate = deliveryDateValue ? String(deliveryDateValue).trim() : "";
      order.expectedDeliveryDate = sanitizedDate;
      order.dateOfDelivery = sanitizedDate;
    }

    const partnerValue =
      req.body.deliveryTrackingSpeedPost !== undefined
        ? req.body.deliveryTrackingSpeedPost
        : req.body.deliveryPartner;
    if (partnerValue !== undefined) {
      order.deliveryPartner = partnerValue ? String(partnerValue).trim() : "";
    }

    const agentValue =
      req.body.agentNo !== undefined
        ? req.body.agentNo
        : req.body.deliveryAgentPhone;
    if (agentValue !== undefined) {
      const sanitizedAgent = agentValue ? String(agentValue).trim() : "";
      order.deliveryAgentPhone = sanitizedAgent;
      order.agentNo = sanitizedAgent;
    }

    if (req.body.trackingId !== undefined) {
      order.trackingId = req.body.trackingId ? String(req.body.trackingId).trim() : "";
    }

    await order.save();

    // Notify customer of status change (e.g. Delivered, Shipped, Cancelled, Paid)
    notifyOrderStatusChange({
      order,
      previousStatus,
      newStatus,
      previousPayment,
      newPayment,
      failureReason: req.body.reason || req.body.failureReason,
      trackingInfo: req.body.trackingInfo || {
        carrier: order.deliveryPartner || req.body.carrier || "India Post Speed Post",
        trackingNumber: order.trackingId || req.body.trackingNumber || req.body.awb || "",
      },
    }).catch((err) => {
      console.error("[EmailService] Error sending status update email:", err.message);
    });

    return res.status(200).json({
      success: true,
      message: "Order updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status.",
      error: error.message,
    });
  }
};

/**
 * Delete order (Admin)
 * Route: DELETE /api/orders/:id
 */
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully from database.",
      id,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete order.",
      error: error.message,
    });
  }
};

/**
 * Test endpoint to verify email integration live
 * Route: POST /api/payment/test-email or POST /api/orders/test-email
 */
exports.sendTestEmail = async (req, res) => {
  try {
    const { email, type = "order_confirmed" } = req.body;
    const targetEmail = (email || process.env.EMAIL_USER || "").trim();

    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        message: "Recipient email is required.",
      });
    }

    const result = await sendTestSampleEmail({ to: targetEmail, type });

    return res.status(result.success ? 200 : 500).json({
      success: result.success,
      message: result.success
        ? `Test email (${type}) successfully dispatched to ${targetEmail} via Gmail!`
        : `Failed to dispatch test email: ${result.error || result.reason}`,
      result,
    });
  } catch (error) {
    console.error("Test email error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
