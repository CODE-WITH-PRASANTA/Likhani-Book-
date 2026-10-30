const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    bookId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      default: "Unknown",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    coverImage: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    shippingAddress: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      street: { type: String, required: true, trim: true },
      locality: { type: String, trim: true, default: "" },
      city: { type: String, required: true, trim: true },
      state: { type: String, default: "Odisha", trim: true },
      pincode: { type: String, required: true, trim: true },
      landmark: { type: String, trim: true, default: "" },
      addressType: { type: String, default: "Home" },
    },
    paymentInfo: {
      method: { type: String, default: "Razorpay" },
      razorpayOrderId: { type: String, required: true, trim: true, index: true },
      razorpayPaymentId: { type: String, trim: true, default: "" },
      razorpaySignature: { type: String, trim: true, default: "" },
      status: {
        type: String,
        enum: ["Pending", "Paid", "Failed", "Refunded"],
        default: "Pending",
        index: true,
      },
      paidAt: { type: Date },
    },
    pricing: {
      itemsSubtotal: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      couponCode: { type: String, trim: true, default: "" },
      shippingFee: { type: Number, default: 0, min: 0 },
      totalAmount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "INR" },
    },
    orderStatus: {
      type: String,
      enum: ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Pending"],
      default: "Placed",
      index: true,
    },
    currentLocation: { type: String, trim: true, default: "" },
    currentHub: { type: String, trim: true, default: "" },
    expectedDeliveryDate: { type: String, trim: true, default: "" },
    dateOfDelivery: { type: String, trim: true, default: "" },
    deliveryPartner: { type: String, trim: true, default: "" },
    deliveryAgentPhone: { type: String, trim: true, default: "" },
    agentNo: { type: String, trim: true, default: "" },
    trackingId: { type: String, trim: true, default: "" },
    orderId: { type: String, trim: true, index: true },
    receipt: { type: String, trim: true },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
