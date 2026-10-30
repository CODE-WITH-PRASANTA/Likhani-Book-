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
  userAddresses = [],
  onSelectAddress = () => {},
  onOpenAddressPicker = null,
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
  const [showAddressPicker, setShowAddressPicker] = useState(false);

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
      setShowAddressPicker(false);
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
    if (Object.keys(newErrors).length > 0) {
      setErrorMessage("Please ensure a valid delivery address with contact phone is selected.");
      return false;
    }
    return true;
  };

  const handlePayNow = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMessage("");
    setPaymentFailed(null);

    try {
      let isScriptLoaded = false;
      try {
        isScriptLoaded = await loadRazorpayScript();
      } catch (scriptErr) {
        console.warn("Razorpay SDK script load error:", scriptErr);
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

      // Ensure Razorpay SDK script is loaded in browser window
      if (!window.Razorpay) {
        try {
          await loadRazorpayScript();
        } catch (scriptErr) {
          console.warn("Could not load Razorpay SDK:", scriptErr);
        }
      }

      if (!window.Razorpay) {
        throw new Error(
          "Unable to load payment gateway. Please check your internet connection or ad-blocker."
        );
      }

      const rzpOrderId =
        order.razorpayOrderId &&
        !order.razorpayOrderId.startsWith("order_sim_") &&
        !order.razorpayOrderId.startsWith("order_test_")
          ? order.razorpayOrderId
          : undefined;

      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TppGgVggUkbJv4",
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Lekhani Books",
        description: `Order #${order.orderId || "LKH"} (${items.length} ${
          items.length === 1 ? "book" : "books"
        })`,
        image: "https://cdn.razorpay.com/static/assets/logo/rzp.png",
        order_id: rzpOrderId,
        prefill: {
          name: customer?.name || formData.fullName,
          email: customer?.email || formData.email,
          contact: customer?.phone || formData.phone,
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

      setLoading(false);
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
              <p>100% Safe & Encrypted Payment</p>
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
              {completedOrder?.orderStatus === "Delivered" && (
                <button
                  type="button"
                  className="CheckoutModal__downloadInvoiceBtn"
                  onClick={() => downloadInvoice(completedOrder)}
                  title="Download Official Tax Invoice"
                >
                  <FiDownload />
                  Download Invoice
                </button>
              )}
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
              {/* Left Column: Delivery Location */}
              <div className="CheckoutModal__shippingSection">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "10px", flexWrap: "wrap" }}>
                  <h4 className="CheckoutModal__sectionTitle" style={{ margin: 0 }}>
                    <FiMapPin /> 1. Delivery Location
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAddressPicker) {
                        onOpenAddressPicker(false);
                      } else {
                        setShowAddressPicker(!showAddressPicker);
                      }
                    }}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "6px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#12598f",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Change Address
                  </button>
                </div>

                {/* Delivery Location Card */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "18px 20px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Deliver to:</span>
                    <strong style={{ fontSize: "15px", color: "#0f172a" }}>
                      {formData.fullName || selectedAddress?.name || currentUser?.name || "Customer"}, {formData.pincode || selectedAddress?.pincode}
                    </strong>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: "#0f172a",
                        color: "#fff",
                      }}
                    >
                      {(formData.addressType || selectedAddress?.addressType || "HOME").toUpperCase()}
                    </span>
                  </div>

                  <p style={{ margin: "0 0 8px", fontSize: "13.5px", color: "#334155", lineHeight: 1.5 }}>
                    {formData.street || selectedAddress?.street}
                    {(formData.locality || selectedAddress?.locality) ? `, ${formData.locality || selectedAddress?.locality}` : ""}
                    {formData.city || selectedAddress?.city ? `, ${formData.city || selectedAddress?.city}` : ""}
                    {formData.state || selectedAddress?.state ? `, ${formData.state || selectedAddress?.state}` : ""}
                    {formData.pincode || selectedAddress?.pincode ? ` - ${formData.pincode || selectedAddress?.pincode}` : ""}
                  </p>

                  <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                    <strong>Phone:</strong> {formData.phone || selectedAddress?.phone || currentUser?.phone || "Not provided"}
                  </p>
                </div>

                {/* Address Picker Options */}
                {showAddressPicker && userAddresses && userAddresses.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      Choose another delivery address:
                    </span>
                    {userAddresses.map((addr) => {
                      const isCurrent = formData.pincode === addr.pincode && formData.street === addr.street;
                      return (
                        <div
                          key={addr._id || addr.id}
                          onClick={() => {
                            setFormData({
                              fullName: addr.name || "",
                              phone: addr.phone || "",
                              email: currentUser?.email || formData.email || "",
                              street: addr.street || "",
                              locality: addr.locality || "",
                              city: addr.city || "",
                              state: addr.state || "Odisha",
                              pincode: addr.pincode || "",
                              landmark: addr.landmark || "",
                              addressType: addr.addressType || "Home",
                            });
                            if (onSelectAddress) onSelectAddress(addr);
                            setShowAddressPicker(false);
                          }}
                          style={{
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: isCurrent ? "2px solid #0f172a" : "1px solid #e2e8f0",
                            background: isCurrent ? "#f1f5f9" : "#ffffff",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <strong style={{ fontSize: "13px", color: "#0f172a" }}>{addr.name}</strong>
                            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>{addr.addressType}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                            {addr.street}, {addr.city} - {addr.pincode}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
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

                <button
                  type="submit"
                  className="CheckoutModal__submitBtn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="CheckoutModal__spinnerWrap">
                      <span className="CheckoutModal__spinner"></span>
                      Connecting to Secure Gateway...
                    </span>
                  ) : (
                    <>
                      <span>Pay ₹{grandTotal.toLocaleString("en-IN")}</span>
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
