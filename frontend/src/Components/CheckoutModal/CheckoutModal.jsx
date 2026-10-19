import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiX,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiShoppingBag,
  FiShield,
  FiArrowRight,
  FiPackage,
  FiDownload,
  FiRefreshCw,
  FiAlertTriangle,
  FiEdit2,
} from "react-icons/fi";
import API from "../../api/axios";
import { loadRazorpayScript } from "../../utils/razorpay";
import { downloadInvoice } from "../../utils/invoiceGenerator";
import "./CheckoutModal.css";

const CheckoutModal = ({
  isOpen,
  onClose,
  items = [],
  subtotal = 0,
  discount = 0,
  couponCode = "",
  grandTotal = 0,
  currentUser = null,
  selectedAddress = null,
  onOrderSuccess = () => {},
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    locality: "",
    city: "",
    state: "Odisha",
    pincode: "",
    landmark: "",
    addressType: "Home",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);
  const [paymentFailed, setPaymentFailed] = useState(null);

  // Sync selected address or user info when modal opens
  useEffect(() => {
    if (isOpen) {
      if (selectedAddress) {
        setFormData({
          fullName: selectedAddress.name || currentUser?.name || "",
          email: currentUser?.email || "",
          phone: selectedAddress.phone || currentUser?.phone || "",
          street: selectedAddress.street || "",
          locality: selectedAddress.locality || "",
          city: selectedAddress.city || "",
          state: selectedAddress.state || "Odisha",
          pincode: selectedAddress.pincode || "",
          landmark: selectedAddress.landmark || "",
          addressType: selectedAddress.addressType || "Home",
        });
      } else if (currentUser) {
        setFormData((prev) => ({
          ...prev,
          fullName:
            currentUser.name ||
            `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim(),
          email: currentUser.email || "",
          phone: currentUser.phone || "",
          street: currentUser.address || "",
        }));
      }
      setErrorMessage("");
      setCompletedOrder(null);
      setPaymentFailed(null);
    }
  }, [isOpen, selectedAddress, currentUser]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim().replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.street.trim()) newErrors.street = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayNow = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMessage("");
    setPaymentFailed(null);

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error(
          "Could not load Razorpay SDK. Please check your internet connection."
        );
      }

      const payload = {
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          author: item.author || "Unknown",
          price: item.price,
          quantity: item.quantity,
          image: item.coverImage || item.image || "",
        })),
        shippingAddress: {
          fullName: formData.fullName.trim(),
          email: (formData.email.trim() || currentUser?.email || "customer@likhani.com"),
          phone: formData.phone.trim(),
          street: formData.street.trim(),
          locality: (formData.locality || "").trim(),
          city: formData.city.trim(),
          state: formData.state.trim() || "Odisha",
          pincode: formData.pincode.trim(),
          landmark: (formData.landmark || "").trim(),
          addressType: formData.addressType || "Home",
        },
        pricing: {
          itemsSubtotal: subtotal,
          discount: discount,
          couponCode: couponCode || "",
          shippingFee: 0,
          totalAmount: grandTotal,
        },
      };

      const res = await API.post("/payment/create-order", payload);

      if (!res.data?.success || !res.data.order) {
        throw new Error(res.data?.message || "Failed to initialize order.");
      }

      const { key, order, customer } = res.data;

      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TppGgVggUkbJv4",
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Lekhani Books",
        description: `Order of ${items.length} ${
          items.length === 1 ? "book" : "books"
        }`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: customer.name || formData.fullName,
          email: customer.email || formData.email,
          contact: customer.phone || formData.phone,
        },
        theme: {
          color: "#12598f",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response) => {
          try {
            setLoading(true);
            const verifyRes = await API.post("/payment/verify-payment", {
              dbOrderId: order.dbOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              const confirmed = {
                ...verifyRes.data.order,
                shippingAddress: formData,
                items: items,
                pricing: {
                  itemsSubtotal: subtotal,
                  discount: discount,
                  couponCode: couponCode || "",
                  shippingFee: 0,
                  totalAmount: grandTotal,
                },
                itemsCount: items.length,
                totalAmount: grandTotal,
                createdAt: new Date().toISOString(),
              };
              setCompletedOrder(confirmed);
              setPaymentFailed(null);
              onOrderSuccess(confirmed);
            } else {
              setPaymentFailed({
                reason:
                  verifyRes.data?.message ||
                  "Payment signature verification failed.",
                code: "VERIFICATION_FAILED",
              });
            }
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            setPaymentFailed({
              reason:
                verifyErr.response?.data?.message ||
                verifyErr.message ||
                "Payment verification could not be completed.",
              code: "VERIFY_ERROR",
            });
          } finally {
            setLoading(false);
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on("payment.failed", async (failedRes) => {
        console.error("Razorpay Payment Failed:", failedRes);
        try {
          await API.post("/payment/payment-failed", {
            dbOrderId: order.dbOrderId,
            razorpay_order_id:
              failedRes.error?.metadata?.order_id || order.razorpayOrderId,
            razorpay_payment_id: failedRes.error?.metadata?.payment_id,
            error: failedRes.error,
          });
        } catch (reportErr) {
          console.warn("Could not sync payment failure to backend:", reportErr);
        }
        setPaymentFailed({
          reason:
            failedRes.error?.description ||
            failedRes.error?.reason ||
            "Payment failed or was cancelled.",
          code: failedRes.error?.code || "PAYMENT_FAILED",
        });
        setLoading(false);
      });

      rzpInstance.open();
    } catch (err) {
      console.error("Checkout error:", err);
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          "Could not initialize checkout. Please try again."
      );
      setLoading(false);
    }
  };

  const handleRetryPayment = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPaymentFailed(null);
    setErrorMessage("");
    handlePayNow(e);
  };

  return (
    <div className="CheckoutModal__backdrop" onClick={onClose}>
      <div
        className="CheckoutModal__container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="CheckoutModal__header">
          <div className="CheckoutModal__headerTitle">
            <FiLock className="CheckoutModal__lockIcon" />
            <div>
              <h3>Secure Checkout</h3>
              <p>Powered by Razorpay Official Payment Gateway</p>
            </div>
          </div>
          <button
            type="button"
            className="CheckoutModal__closeBtn"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        {/* Modal Body */}
        {completedOrder ? (
          <div className="CheckoutModal__successView">
            <div className="CheckoutModal__successIcon">
              <FiCheckCircle />
            </div>
            <h2>Order Placed Successfully!</h2>
            <p className="CheckoutModal__successSubtitle">
              Thank you for ordering with Lekhani! Your payment was verified and
              your books are being prepared for dispatch.
            </p>

            <div className="CheckoutModal__receiptBox">
              <div className="CheckoutModal__receiptRow">
                <span>Order ID:</span>
                <strong>
                  {completedOrder.orderId ||
                    (completedOrder.id
                      ? `ORD-${completedOrder.id.slice(-6).toUpperCase()}`
                      : "ORD-CONFIRMED")}
                </strong>
              </div>
              <div className="CheckoutModal__receiptRow">
                <span>Payment ID:</span>
                <code>{completedOrder.paymentId}</code>
              </div>
              <div className="CheckoutModal__receiptRow">
                <span>Total Paid:</span>
                <strong className="CheckoutModal__receiptAmount">
                  ₹{Number(completedOrder.totalAmount).toLocaleString("en-IN")}
                </strong>
              </div>
              <div className="CheckoutModal__receiptRow">
                <span>Deliver To:</span>
                <span>
                  {formData.fullName}, {formData.street}, {formData.city} -{" "}
                  {formData.pincode}
                </span>
              </div>
            </div>

            <div className="CheckoutModal__successActions">
              <button
                type="button"
                className="CheckoutModal__downloadInvoiceBtn"
                onClick={() => downloadInvoice(completedOrder)}
                title="Download Official Tax Invoice"
              >
                <FiDownload />
                Download Invoice
              </button>
              <button
                type="button"
                className="CheckoutModal__ordersBtn"
                onClick={() => {
                  onClose();
                  navigate("/orders");
                }}
              >
                <FiPackage />
                View My Orders
              </button>
              <button
                type="button"
                className="CheckoutModal__continueBtn"
                onClick={onClose}
              >
                Continue Shopping
                <FiArrowRight />
              </button>
            </div>
          </div>
        ) : paymentFailed ? (
          <div className="CheckoutModal__failedView">
            <div className="CheckoutModal__failedIcon">
              <FiAlertTriangle />
            </div>
            <h2>Payment Unsuccessful</h2>
            <p className="CheckoutModal__failedSubtitle">
              {paymentFailed.reason || "We could not process your transaction."}
            </p>

            <div className="CheckoutModal__failedAlert">
              <p>
                <strong>No money was deducted</strong> from your account. If you were testing in Test Mode,
                UPI QR scanning with real banking apps is unsupported in test environment—please choose <strong>Cards (Test)</strong> or <strong>Netbanking</strong>.
              </p>
            </div>

            <div className="CheckoutModal__failedOrderSummary">
              <div className="CheckoutModal__failedSummaryRow">
                <span>Books in Order:</span>
                <strong>{items.length} {items.length === 1 ? "Book" : "Books"}</strong>
              </div>
              <div className="CheckoutModal__failedSummaryRow">
                <span>Total Amount:</span>
                <strong className="CheckoutModal__failedAmount">
                  ₹{Number(grandTotal).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <div className="CheckoutModal__failedActions">
              <button
                type="button"
                className="CheckoutModal__retryBtn"
                onClick={handleRetryPayment}
                disabled={loading}
              >
                <FiRefreshCw className={loading ? "spin" : ""} />
                {loading ? "Reordering..." : "Reorder / Retry Payment"}
              </button>
              <button
                type="button"
                className="CheckoutModal__editBtn"
                onClick={() => setPaymentFailed(null)}
              >
                <FiEdit2 />
                Review Delivery Details
              </button>
              <button
                type="button"
                className="CheckoutModal__failedCloseBtn"
                onClick={onClose}
              >
                Cancel & Close
              </button>
            </div>
          </div>
        ) : (
          <form className="CheckoutModal__body" onSubmit={handlePayNow}>
            {errorMessage && (
              <div className="CheckoutModal__alert">
                <FiAlertCircle />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="CheckoutModal__layout">
              {/* Left Column: Delivery Details */}
              <div className="CheckoutModal__shippingSection">
                <h4 className="CheckoutModal__sectionTitle">
                  <FiMapPin /> 1. Delivery Details
                </h4>

                <div className="CheckoutModal__field">
                  <label>Full Name *</label>
                  <div className="CheckoutModal__inputGroup">
                    <FiUser />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Receiver's Full Name"
                    />
                  </div>
                  {errors.fullName && (
                    <span className="CheckoutModal__error">
                      {errors.fullName}
                    </span>
                  )}
                </div>

                <div className="CheckoutModal__fieldRow">
                  <div className="CheckoutModal__field">
                    <label>Phone Number *</label>
                    <div className="CheckoutModal__inputGroup">
                      <FiPhone />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                      />
                    </div>
                    {errors.phone && (
                      <span className="CheckoutModal__error">
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  <div className="CheckoutModal__field">
                    <label>Email Address</label>
                    <div className="CheckoutModal__inputGroup">
                      <FiMail />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="For order tracking updates"
                      />
                    </div>
                  </div>
                </div>

                <div className="CheckoutModal__field">
                  <label>Street Address / Flat / Landmark *</label>
                  <textarea
                    name="street"
                    rows="2"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="House/Plot No., Street, Area, Landmark"
                  ></textarea>
                  {errors.street && (
                    <span className="CheckoutModal__error">
                      {errors.street}
                    </span>
                  )}
                </div>

                <div className="CheckoutModal__fieldRow">
                  <div className="CheckoutModal__field">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Bhubaneswar"
                    />
                    {errors.city && (
                      <span className="CheckoutModal__error">{errors.city}</span>
                    )}
                  </div>

                  <div className="CheckoutModal__field">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                    />
                  </div>

                  <div className="CheckoutModal__field">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="6-digit PIN"
                      maxLength="6"
                    />
                    {errors.pincode && (
                      <span className="CheckoutModal__error">
                        {errors.pincode}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary & Payment Button */}
              <div className="CheckoutModal__summarySection">
                <h4 className="CheckoutModal__sectionTitle">
                  <FiShoppingBag /> 2. Order Review
                </h4>

                <div className="CheckoutModal__itemsList">
                  {items.map((item) => (
                    <div key={item.id} className="CheckoutModal__itemRow">
                      <div className="CheckoutModal__itemInfo">
                        <span className="CheckoutModal__itemTitle">
                          {item.title}
                        </span>
                        <span className="CheckoutModal__itemQty">
                          Qty: {item.quantity} × ₹{item.price}
                        </span>
                      </div>
                      <span className="CheckoutModal__itemSubtotal">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="CheckoutModal__breakdown">
                  <div className="CheckoutModal__breakdownRow">
                    <span>Items Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {discount > 0 && (
                    <div className="CheckoutModal__breakdownRow CheckoutModal__discountRow">
                      <span>
                        Coupon Discount {couponCode ? `(${couponCode})` : ""}
                      </span>
                      <span>-₹{discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="CheckoutModal__totalRow">
                    <span>Total Payable</span>
                    <span className="CheckoutModal__totalPrice">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="CheckoutModal__securityBadge">
                  <FiShield />
                  <span>
                    256-bit Encrypted Transaction. Cards, UPI, Netbanking &
                    Wallets accepted.
                  </span>
                </div>

                <button
                  type="submit"
                  className="CheckoutModal__submitBtn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="CheckoutModal__spinnerWrap">
                      <span className="CheckoutModal__spinner"></span>
                      Connecting to Razorpay...
                    </span>
                  ) : (
                    <>
                      <span>Pay ₹{grandTotal.toLocaleString("en-IN")} with Razorpay</span>
                      <FiArrowRight />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
