const crypto = require("crypto");
const Order = require("../models/Order");
const User = require("../models/User");

const RAZORPAY_API_URL = "https://api.razorpay.com/v1/orders";

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

    const totalAmount = Number(pricing?.totalAmount);
    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order total amount.",
      });
    }

    // Amount in paise (Razorpay standard: ₹1 = 100 paise)
    const amountInPaise = Math.round(totalAmount * 100);
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const customOrderId = `ORD-${dateCode}-${randomSuffix}`;
    const receiptId = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const authHeader =
      "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const rzpResponse = await fetch(RAZORPAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
        notes: {
          userId: req.user._id.toString(),
          userEmail: req.user.email,
          itemCount: String(items.length),
        },
      }),
    });

    const rzpData = await rzpResponse.json();

    if (!rzpResponse.ok) {
      console.error("Razorpay order creation error:", rzpData);
      return res.status(rzpResponse.status || 500).json({
        success: false,
        message:
          rzpData?.error?.description ||
          "Failed to initiate order with Razorpay.",
        error: rzpData?.error,
      });
    }

    // Format items for DB
    const formattedItems = items.map((item) => ({
      bookId: String(item.id || item.bookId || item._id),
      title: item.title || item.name || "Untitled Book",
      author: item.author || "Unknown",
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      coverImage: item.image || item.coverImage || "",
    }));

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
        razorpayOrderId: rzpData.id,
        status: "Pending",
      },
      pricing: {
        itemsSubtotal: Number(pricing.itemsSubtotal) || totalAmount,
        discount: Number(pricing.discount) || 0,
        couponCode: pricing.couponCode ? String(pricing.couponCode) : "",
        shippingFee: Number(pricing.shippingFee) || 0,
        totalAmount: totalAmount,
        currency: "INR",
      },
      orderStatus: "Placed",
      receipt: receiptId,
    });

    return res.status(201).json({
      success: true,
      message: "Razorpay order initialized successfully",
      key: keyId,
      order: {
        dbOrderId: dbOrder._id,
        orderId: customOrderId,
        razorpayOrderId: rzpData.id,
        amount: rzpData.amount,
        currency: rzpData.currency,
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

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Incomplete payment verification payload.",
      });
    }

    // Verify HMAC-SHA256 signature
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    const isMatch = generatedSignature === razorpay_signature;

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

    if (!isMatch) {
      order.paymentInfo.status = "Failed";
      order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
      order.paymentInfo.razorpaySignature = razorpay_signature;
      await order.save();

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

    // Increment user's order count
    await User.findByIdAndUpdate(order.user, {
      $inc: { orders: 1 },
      $set: {
        address: `${order.shippingAddress.street}, ${order.shippingAddress.city}`,
        phone: order.shippingAddress.phone,
      },
    });

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

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_TppGgVggUkbJv4";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "PMTMnawtXe2ZEHUUPT2JMzoN";
    if (!keyId || !keySecret) return order;

    const authHeader =
      "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const rzpResponse = await fetch(
      `https://api.razorpay.com/v1/orders/${order.paymentInfo.razorpayOrderId}/payments`,
      {
        headers: { Authorization: authHeader },
      }
    );

    if (!rzpResponse.ok) return order;

    const rzpData = await rzpResponse.json();
    const payments = Array.isArray(rzpData.items) ? rzpData.items : [];
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
    const orders = await Order.find()
      .populate("user", "name email phone firstName lastName")
      .sort({ createdAt: -1 });

    // Reconcile pending orders with Razorpay
    const pendingOrders = orders.filter(
      (o) => o.paymentInfo?.status === "Pending" && o.paymentInfo?.razorpayOrderId
    );
    if (pendingOrders.length > 0) {
      await Promise.all(pendingOrders.map((o) => syncOrderPaymentWithRazorpay(o)));
    }

    // Ensure every order has a clean, professional orderId
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

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found in database.",
      });
    }

    if (newStatus) {
      order.orderStatus = newStatus;
    }
    if (newPayment) {
      order.paymentInfo.status = newPayment;
      if (newPayment === "Paid" && !order.paymentInfo.paidAt) {
        order.paymentInfo.paidAt = new Date();
      }
    }

    await order.save();

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
