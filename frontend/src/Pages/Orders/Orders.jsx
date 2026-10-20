import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiPackage,
  FiSearch,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiShoppingBag,
  FiUser,
  FiHeart,
  FiLogOut,
  FiArrowRight,
  FiArrowLeft,
  FiTruck,
  FiCreditCard,
  FiDownload,
  FiRefreshCw,
  FiChevronRight,
  FiCopy,
  FiCheck,
  FiHelpCircle,
  FiTag,
  FiShield,
  FiLock,
  FiX,
  FiAlertTriangle,
  FiPhone,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { fetchMyOrders } from "../../api/orderService";
import { downloadInvoice } from "../../utils/invoiceGenerator";
import { addToCart } from "../../Components/ShopMain/useShopStore";
import API from "../../api/axios";
import { loadRazorpayScript } from "../../utils/razorpay";
import "./Orders.css";

const Orders = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { currentUser, logout, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [copiedField, setCopiedField] = useState(null);

  // Payment popup modal state
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/orders" } });
      return;
    }

    let active = true;
    fetchMyOrders().then((data) => {
      if (active) {
        setOrders(data);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [isAuthenticated, navigate]);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "OrdersPage__status--delivered";
      case "out for delivery":
        return "OrdersPage__status--outfordelivery";
      case "shipped":
        return "OrdersPage__status--shipped";
      case "processing":
        return "OrdersPage__status--processing";
      case "cancelled":
        return "OrdersPage__status--cancelled";
      default:
        return "OrdersPage__status--placed";
    }
  };

  const handleReorder = (order) => {
    if (Array.isArray(order?.items) && order.items.length > 0) {
      order.items.forEach((item) => {
        const bookId = item.bookId || item.id || item._id;
        if (bookId) {
          addToCart(bookId, item.quantity || 1);
        }
      });
      navigate("/cart");
    } else {
      navigate("/shop");
    }
  };

  const handlePayWithRazorpay = async (order) => {
    if (!order) return;
    setPayingOrderId(order._id);
    setPayError("");
    setPaySuccess("");

    try {
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      if (!window.Razorpay) {
        throw new Error(
          "Unable to load secure payment gateway. Please check your internet connection."
        );
      }

      const res = await API.post("/payment/retry-order", {
        orderId: order._id || order.orderId,
      });

      if (!res.data?.success || !res.data.order) {
        throw new Error(res.data?.message || "Failed to initialize payment.");
      }

      const { key, order: rzpOrder, customer } = res.data;

      const rzpOrderId =
        rzpOrder.razorpayOrderId &&
        !rzpOrder.razorpayOrderId.startsWith("order_sim_")
          ? rzpOrder.razorpayOrderId
          : undefined;

      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TppGgVggUkbJv4",
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || "INR",
        name: "Lekhani Books",
        description: `Order #${order.orderId || "LKH"} (${(order.items || []).length} items)`,
        image: "https://cdn.razorpay.com/static/assets/logo/rzp.png",
        order_id: rzpOrderId,
        prefill: {
          name: customer?.name || order.shippingAddress?.fullName || currentUser?.name || "",
          email: customer?.email || order.shippingAddress?.email || currentUser?.email || "",
          contact: customer?.phone || order.shippingAddress?.phone || currentUser?.phone || "",
        },
        theme: {
          color: "#12598f",
        },
        modal: {
          ondismiss: () => {
            setPayingOrderId(null);
          },
        },
        handler: async (response) => {
          try {
            setPayingOrderId(order._id);
            const verifyRes = await API.post("/payment/verify-payment", {
              dbOrderId: rzpOrder.dbOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              setPaymentModalOrder(null);
              setPaySuccess(
                `Payment of ₹${Number(
                  order.pricing?.totalAmount || 0
                ).toLocaleString("en-IN")} verified! Order #${order.orderId || ""} is now confirmed.`
              );
              // Refresh orders list
              const refreshed = await fetchMyOrders();
              setOrders(refreshed);
            } else {
              setPayError(
                verifyRes.data?.message || "Payment signature verification failed."
              );
            }
          } catch (vErr) {
            console.error("Payment verification error:", vErr);
            setPayError(
              vErr.response?.data?.message ||
                vErr.message ||
                "Failed to verify payment."
            );
          } finally {
            setPayingOrderId(null);
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on("payment.failed", async (failedRes) => {
        try {
          await API.post("/payment/payment-failed", {
            dbOrderId: rzpOrder.dbOrderId,
            razorpay_order_id:
              failedRes.error?.metadata?.order_id || rzpOrder.razorpayOrderId,
            razorpay_payment_id: failedRes.error?.metadata?.payment_id,
            error: failedRes.error,
          });
        } catch (reportErr) {
          console.warn("Could not sync payment failure to backend:", reportErr);
        }
        setPayError(
          failedRes.error?.description ||
            failedRes.error?.reason ||
            "Payment failed or was cancelled."
        );
        setPayingOrderId(null);
      });

      setPayingOrderId(null);
      rzpInstance.open();
    } catch (err) {
      console.error("Error initiating payment retry:", err);
      setPayError(
        err.response?.data?.message ||
          err.message ||
          "Could not initialize checkout. Please try again."
      );
      setPayingOrderId(null);
    }
  };

  // Find active order if an orderId param is provided in route
  const activeOrder = orderId
    ? orders.find(
        (o) =>
          (o.orderId && o.orderId.toLowerCase() === orderId.toLowerCase()) ||
          (o.receipt && o.receipt.toLowerCase() === orderId.toLowerCase()) ||
          (o._id && o._id.toLowerCase() === orderId.toLowerCase())
      )
    : null;

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "All" ||
      order.orderStatus?.toLowerCase() === statusFilter.toLowerCase();

    if (!matchesStatus) return false;

    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const idMatch =
      (order.orderId && order.orderId.toLowerCase().includes(term)) ||
      (order._id && order._id.toLowerCase().includes(term));

    const itemMatch =
      Array.isArray(order.items) &&
      order.items.some(
        (item) =>
          item.title?.toLowerCase().includes(term) ||
          item.author?.toLowerCase().includes(term)
      );

    return idMatch || itemMatch;
  });

  if (!currentUser) return null;

  return (
    <main className="OrdersPage">
      <div className="OrdersPage__container">
        {/* Breadcrumb Navigation */}
        <div className="OrdersPage__breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/profile">My Account</Link>
          <span>/</span>
          <Link to="/orders" className={!orderId ? "OrdersPage__breadcrumbCurrent" : ""}>
            My Orders
          </Link>
          {orderId && (
            <>
              <span>/</span>
              <span className="OrdersPage__breadcrumbCurrent">
                {activeOrder
                  ? activeOrder.orderId ||
                    (activeOrder._id
                      ? `ORD-${activeOrder._id.slice(-6).toUpperCase()}`
                      : "Order Details")
                  : orderId}
              </span>
            </>
          )}
        </div>

        <div className="OrdersPage__layout">
          {/* ================= LEFT SIDEBAR ================= */}
          <aside className="OrdersPage__sidebar">
            <div className="OrdersPage__userCard">
              <div className="OrdersPage__userAvatar">
                {currentUser.name
                  ? currentUser.name.charAt(0).toUpperCase()
                  : currentUser.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="OrdersPage__userMeta">
                <span className="OrdersPage__hello">Hello,</span>
                <strong className="OrdersPage__userName">
                  {currentUser.name || currentUser.email?.split("@")[0]}
                </strong>
              </div>
            </div>

            <nav className="OrdersPage__nav">
              <div className="OrdersPage__navSection">
                <span className="OrdersPage__navSectionTitle">ACCOUNT SETTINGS</span>
                <Link to="/profile" className="OrdersPage__navLink">
                  <FiUser />
                  <span>Profile Information</span>
                </Link>
                <Link to="/addresses" className="OrdersPage__navLink">
                  <FiMapPin />
                  <span>Manage Addresses</span>
                </Link>
              </div>

              <div className="OrdersPage__navSection">
                <span className="OrdersPage__navSectionTitle">MY STUFF</span>
                <Link
                  to="/orders"
                  className="OrdersPage__navLink OrdersPage__navLink--active"
                >
                  <FiPackage />
                  <span>My Orders</span>
                </Link>
                <Link to="/wishlist" className="OrdersPage__navLink">
                  <FiHeart />
                  <span>My Wishlist</span>
                </Link>
                <Link to="/cart" className="OrdersPage__navLink">
                  <FiShoppingBag />
                  <span>My Cart</span>
                </Link>
              </div>

              <div className="OrdersPage__navSection">
                <button
                  type="button"
                  className="OrdersPage__logoutBtn"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* ================= RIGHT CONTENT AREA ================= */}
          <section className="OrdersPage__content">
            {orderId ? (
              /* ========================================================
                 INDIVIDUAL ORDER DETAILS VIEW
              ======================================================== */
              loading ? (
                <div className="OrdersPage__loading">
                  <div className="OrdersPage__spinner"></div>
                  <p>Loading order details...</p>
                </div>
              ) : !activeOrder ? (
                <div className="OrdersPage__empty">
                  <div className="OrdersPage__emptyIcon">
                    <FiAlertCircle />
                  </div>
                  <h3>Order Not Found</h3>
                  <p>We couldn't locate the order with reference #{orderId}.</p>
                  <button
                    type="button"
                    className="OrdersPage__shopBtn"
                    onClick={() => navigate("/orders")}
                  >
                    <FiArrowLeft />
                    <span>Back to All Orders</span>
                  </button>
                </div>
              ) : (
                (() => {
                  const order = activeOrder;
                  const displayOrderId =
                    order.orderId ||
                    (order._id
                      ? `ORD-${order._id.slice(-6).toUpperCase()}`
                      : "ORD-ORDER");
                  const total = order.pricing?.totalAmount || 0;
                  const subtotal = order.pricing?.itemsSubtotal || total;
                  const discount = order.pricing?.discount || 0;
                  const couponCode = order.pricing?.couponCode || "";
                  const shippingFee = order.pricing?.shippingFee || 0;
                  const paymentId = order.paymentInfo?.razorpayPaymentId;
                  const razorpayOrderId = order.paymentInfo?.razorpayOrderId;
                  const status = order.orderStatus || "Placed";
                  const payStatusRaw = (
                    order.paymentInfo?.status || "Pending"
                  ).toLowerCase();
                  const isPaid =
                    payStatusRaw === "paid" || payStatusRaw === "success";
                  const isFailed = payStatusRaw === "failed";
                  const isCancelled = status.toLowerCase() === "cancelled";

                  // Order stages for progress stepper
                  const stages = [
                    "Placed",
                    "Processing",
                    "Shipped",
                    "Out for Delivery",
                    "Delivered",
                  ];
                  const currentStageIdx = isCancelled
                    ? -1
                    : stages.findIndex(
                        (s) => s.toLowerCase() === status.toLowerCase()
                      ) !== -1
                    ? stages.findIndex(
                        (s) => s.toLowerCase() === status.toLowerCase()
                      )
                    : 0;

                  return (
                    <div className="OrderDetail">
                      {/* Top Bar with Back Button & Actions */}
                      <div className="OrderDetail__topNav">
                        <button
                          type="button"
                          className="OrderDetail__backBtn"
                          onClick={() => navigate("/orders")}
                        >
                          <FiArrowLeft />
                          <span>Back to My Orders</span>
                        </button>

                        <div className="OrderDetail__topActions">
                          {isPaid && (
                            <button
                              type="button"
                              className="OrderDetail__btn OrderDetail__btn--invoice"
                              onClick={() => downloadInvoice(order)}
                              title="Download Official Tax Invoice PDF"
                            >
                              <FiDownload />
                              <span>Download Invoice</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="OrderDetail__btn OrderDetail__btn--reorder"
                            onClick={() => handleReorder(order)}
                            title="Reorder items from this purchase"
                          >
                            <FiRefreshCw />
                            <span>{isFailed ? "Retry Order" : "Buy Again"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Order Identity Card */}
                      <div className="OrderDetail__identityCard">
                        <div className="OrderDetail__identityMeta">
                          <span className="OrderDetail__label">ORDER ID</span>
                          <h2 className="OrderDetail__receipt">{displayOrderId}</h2>
                          <div className="OrderDetail__dateWrap">
                            <FiCalendar />
                            <span>Placed on {formatDate(order.createdAt)}</span>
                          </div>
                        </div>

                        <div className="OrderDetail__identityBadges">
                          <span
                            className={`OrdersPage__statusBadge ${getStatusClass(
                              status
                            )}`}
                          >
                            <span className="OrdersPage__statusDot"></span>
                            Order: {status}
                          </span>

                          <span
                            className={`OrdersPage__paymentStatusTag OrdersPage__paymentStatusTag--${
                              isPaid ? "success" : isFailed ? "failed" : "pending"
                            }`}
                          >
                            Payment: {isPaid ? "Success" : isFailed ? "Failed" : "Pending"}
                          </span>
                        </div>
                      </div>

                      {/* Stepper or Cancelled Alert */}
                      {isCancelled ? (
                        <div className="OrderDetail__cancelledBanner">
                          <FiXCircle />
                          <div>
                            <strong>
                              {isFailed
                                ? "Payment Incomplete / Cancelled"
                                : "Order Cancelled"}
                            </strong>
                            <p>
                              {isFailed
                                ? `Payment of ₹${Number(total).toLocaleString("en-IN")} was not completed. Complete payment now to place and dispatch your books.`
                                : "This order was cancelled. Please feel free to place a new order anytime."}
                            </p>
                            {isFailed && (
                              <button
                                type="button"
                                className="OrderDetail__cancelledPayBtn"
                                onClick={() => setPaymentModalOrder(order)}
                              >
                                <FiLock />
                                <span>
                                  Pay ₹{Number(total).toLocaleString("en-IN")}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="OrderDetail__stepperCard">
                          <div className="OrderDetail__stepper">
                            {stages.map((st, idx) => {
                              const isCompleted = idx <= currentStageIdx;
                              const isCurrent = idx === currentStageIdx;
                              return (
                                <div
                                  key={st}
                                  className={`OrderDetail__step ${
                                    isCompleted ? "OrderDetail__step--completed" : ""
                                  } ${isCurrent ? "OrderDetail__step--current" : ""}`}
                                >
                                  <div className="OrderDetail__stepMarker">
                                    {isCompleted ? <FiCheck /> : idx + 1}
                                  </div>
                                  <span className="OrderDetail__stepTitle">{st}</span>
                                  {idx < stages.length - 1 && (
                                    <div
                                      className={`OrderDetail__stepLine ${
                                        idx < currentStageIdx
                                          ? "OrderDetail__stepLine--completed"
                                          : ""
                                      }`}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Live Logistics / Dispatch Tracking Update Card */}
                      {!isCancelled &&
                        (order.currentLocation ||
                          order.expectedDeliveryDate ||
                          order.deliveryPartner ||
                          status === "Shipped" ||
                          status === "Out for Delivery" ||
                          status === "Delivered") && (
                          <div
                            className={`OrderDetail__trackingLiveCard OrderDetail__trackingLiveCard--${
                              status === "Out for Delivery"
                                ? "outForDelivery"
                                : status === "Shipped"
                                ? "shipped"
                                : status === "Delivered"
                                ? "delivered"
                                : "active"
                            }`}
                          >
                            <div className="OrderDetail__trackingLiveHeader">
                              <div className="OrderDetail__trackingLiveIcon">
                                {status === "Out for Delivery" ? (
                                  <FiTruck />
                                ) : status === "Delivered" ? (
                                  <FiCheckCircle />
                                ) : (
                                  <FiMapPin />
                                )}
                              </div>
                              <div className="OrderDetail__trackingLiveHeading">
                                <div className="OrderDetail__trackingLiveTag">
                                  <span className="OrderDetail__trackingLivePulse" />
                                  {status === "Out for Delivery"
                                    ? "DISPATCHED • OUT FOR DELIVERY"
                                    : status === "Shipped"
                                    ? "IN TRANSIT • ON THE WAY"
                                    : status === "Delivered"
                                    ? "DELIVERED"
                                    : "LIVE ORDER TRACKING"}
                                </div>
                                <h4>
                                  {status === "Out for Delivery"
                                    ? "Your package is out for delivery today!"
                                    : status === "Shipped"
                                    ? "Your shipment is on its way"
                                    : status === "Delivered"
                                    ? "Package delivered successfully"
                                    : "Logistics & Shipment Details"}
                                </h4>
                              </div>
                            </div>

                            <div className="OrderDetail__trackingLiveGrid">
                              {/* 1. Location field: shown when shipped or provided */}
                              {(order.currentLocation || status === "Shipped") && (
                                <div className="OrderDetail__trackingLiveItem">
                                  <span className="OrderDetail__trackingLiveLabel">
                                    <FiMapPin /> Current Hub / Location
                                  </span>
                                  <strong className="OrderDetail__trackingLiveVal">
                                    {order.currentLocation ||
                                      "In Transit via Nearest Hub"}
                                  </strong>
                                </div>
                              )}

                              {/* 2. Expected Delivery Date: shown when out for delivery or provided */}
                              {(order.expectedDeliveryDate ||
                                status === "Out for Delivery") && (
                                <div className="OrderDetail__trackingLiveItem">
                                  <span className="OrderDetail__trackingLiveLabel">
                                    <FiCalendar /> Expected Delivery Date
                                  </span>
                                  <strong className="OrderDetail__trackingLiveVal OrderDetail__trackingLiveVal--date">
                                    {order.expectedDeliveryDate || "Arriving Today"}
                                  </strong>
                                </div>
                              )}

                              {/* 3 & 4. Delivery Partner & Tracking ID: cleanly separated */}
                              {(() => {
                                let displayAgentPhone = (order.deliveryAgentPhone || "").trim();
                                let displayTrackingId = (order.trackingId || "").trim();

                                if (displayAgentPhone && displayAgentPhone.includes("/")) {
                                  const parts = displayAgentPhone.split("/");
                                  displayAgentPhone = parts[0].trim();
                                  if (!displayTrackingId || displayTrackingId === order.deliveryAgentPhone) {
                                    displayTrackingId = parts.slice(1).join("/").trim();
                                  }
                                } else if (displayTrackingId && displayTrackingId.includes("/") && !displayAgentPhone) {
                                  const parts = displayTrackingId.split("/");
                                  displayAgentPhone = parts[0].trim();
                                  displayTrackingId = parts.slice(1).join("/").trim();
                                } else if (displayAgentPhone && displayTrackingId && displayAgentPhone === displayTrackingId) {
                                  if (/^\+?\d[\d\s-]{6,}$/.test(displayAgentPhone)) {
                                    displayTrackingId = "";
                                  } else {
                                    displayAgentPhone = "";
                                  }
                                }

                                return (
                                  <>
                                    {(order.deliveryPartner ||
                                      status === "Out for Delivery") && (
                                      <div className="OrderDetail__trackingLiveItem">
                                        <span className="OrderDetail__trackingLiveLabel">
                                          <FiTruck /> Delivery Partner
                                        </span>
                                        <strong className="OrderDetail__trackingLiveVal">
                                          {order.deliveryPartner || "Courier Partner"}
                                          {displayAgentPhone ? (
                                            <span className="OrderDetail__trackingAgentPhone">
                                              {" "}• <FiPhone style={{ verticalAlign: "-2px" }} /> {displayAgentPhone}
                                            </span>
                                          ) : null}
                                        </strong>
                                      </div>
                                    )}

                                    {displayTrackingId && (
                                      <div className="OrderDetail__trackingLiveItem">
                                        <span className="OrderDetail__trackingLiveLabel">
                                          <FiPackage /> Tracking Number (AWB)
                                        </span>
                                        <div className="OrderDetail__copyWrap">
                                          <code>{displayTrackingId}</code>
                                          <button
                                            type="button"
                                            className="OrderDetail__copyBtn"
                                            onClick={() => handleCopy(displayTrackingId, "trackingId")}
                                            title="Copy Tracking ID"
                                          >
                                            {copiedField === "trackingId" ? (
                                              <FiCheck className="OrderDetail__checkGreen" />
                                            ) : (
                                              <FiCopy />
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                      {/* Main 2-Column Grid */}
                      <div className="OrderDetail__grid">
                        {/* LEFT COLUMN: Items & Address */}
                        <div className="OrderDetail__colMain">
                          {/* Items Section */}
                          <div className="OrderDetail__sectionCard">
                            <div className="OrderDetail__sectionHeader">
                              <div className="OrderDetail__sectionTitle">
                                <FiPackage />
                                <h3>Items in this Order ({order.items?.length || 0})</h3>
                              </div>
                            </div>

                            <div className="OrderDetail__itemsList">
                              {order.items &&
                                order.items.map((item, idx) => (
                                  <div key={idx} className="OrderDetail__itemRow">
                                    <div className="OrderDetail__itemThumb">
                                      {item.coverImage ? (
                                        <img
                                          src={item.coverImage}
                                          alt={item.title}
                                          onError={(e) => {
                                            e.target.style.display = "none";
                                          }}
                                        />
                                      ) : (
                                        <FiPackage />
                                      )}
                                    </div>
                                    <div className="OrderDetail__itemDetails">
                                      <h4 className="OrderDetail__itemTitle">
                                        {item.title}
                                      </h4>
                                      {item.author && (
                                        <p className="OrderDetail__itemAuthor">
                                          By {item.author}
                                        </p>
                                      )}
                                      <span className="OrderDetail__itemQty">
                                        Qty: {item.quantity} × ₹{item.price}
                                      </span>
                                    </div>
                                    <div className="OrderDetail__itemPrice">
                                      <strong>
                                        ₹{(item.price * item.quantity).toLocaleString(
                                          "en-IN"
                                        )}
                                      </strong>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Delivery Destination */}
                          <div className="OrderDetail__sectionCard">
                            <div className="OrderDetail__sectionHeader">
                              <div className="OrderDetail__sectionTitle">
                                <FiMapPin />
                                <h3>Delivery Destination</h3>
                              </div>
                              <span className="OrderDetail__addressBadge">
                                {order.shippingAddress?.addressType || "Home"}
                              </span>
                            </div>

                            <div className="OrderDetail__addressBody">
                              <h4 className="OrderDetail__recipientName">
                                {order.shippingAddress?.fullName}
                              </h4>
                              <p className="OrderDetail__addressText">
                                {order.shippingAddress?.street}
                                {order.shippingAddress?.locality
                                  ? `, ${order.shippingAddress.locality}`
                                  : ""}
                                <br />
                                {order.shippingAddress?.city},{" "}
                                {order.shippingAddress?.state || "Odisha"} -{" "}
                                <strong>{order.shippingAddress?.pincode}</strong>
                              </p>
                              {order.shippingAddress?.landmark && (
                                <p className="OrderDetail__addressLandmark">
                                  <strong>Landmark:</strong>{" "}
                                  {order.shippingAddress.landmark}
                                </p>
                              )}
                              <div className="OrderDetail__contactRow">
                                <span>
                                  <strong>Phone:</strong>{" "}
                                  {order.shippingAddress?.phone}
                                </span>
                                {order.shippingAddress?.email && (
                                  <span>
                                    <strong>Email:</strong>{" "}
                                    {order.shippingAddress.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Comprehensive Payment & Pricing Breakdown */}
                        <div className="OrderDetail__colSide">
                          {/* Payment Card */}
                          <div className="OrderDetail__paymentCard">
                            <div className="OrderDetail__sectionHeader">
                              <div className="OrderDetail__sectionTitle">
                                <FiCreditCard />
                                <h3>Payment Details</h3>
                              </div>
                            </div>

                            {/* Status Banner */}
                            <div
                              className={`OrderDetail__paymentBanner OrderDetail__paymentBanner--${
                                isPaid ? "success" : isFailed ? "failed" : "pending"
                              }`}
                            >
                              <div className="OrderDetail__paymentBannerIcon">
                                {isPaid ? (
                                  <FiCheckCircle />
                                ) : isFailed ? (
                                  <FiAlertCircle />
                                ) : (
                                  <FiClock />
                                )}
                              </div>
                              <div className="OrderDetail__paymentBannerText">
                                <strong>
                                  {isPaid
                                    ? "Payment Succeeded"
                                    : isFailed
                                    ? "Payment Failed"
                                    : "Payment Pending"}
                                </strong>
                                <span>
                                  {isPaid
                                    ? "Transaction verified & paid securely"
                                    : isFailed
                                    ? "Transaction declined or incomplete"
                                    : "Awaiting payment confirmation"}
                                </span>
                              </div>
                            </div>

                            {/* Payment Meta Fields */}
                            <div className="OrderDetail__paymentRows">
                              <div className="OrderDetail__infoRow">
                                <span>Payment Method</span>
                                <strong>
                                  {order.paymentInfo?.method || "Online Payment"}
                                </strong>
                              </div>

                              {paymentId && (
                                <div className="OrderDetail__infoRow">
                                  <span>Payment ID</span>
                                  <div className="OrderDetail__copyWrap">
                                    <code>{paymentId}</code>
                                    <button
                                      type="button"
                                      className="OrderDetail__copyBtn"
                                      onClick={() => handleCopy(paymentId, "payId")}
                                      title="Copy Payment ID"
                                    >
                                      {copiedField === "payId" ? (
                                        <FiCheck className="OrderDetail__checkGreen" />
                                      ) : (
                                        <FiCopy />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {razorpayOrderId && (
                                <div className="OrderDetail__infoRow">
                                  <span>Payment Reference ID</span>
                                  <div className="OrderDetail__copyWrap">
                                    <code>{razorpayOrderId}</code>
                                    <button
                                      type="button"
                                      className="OrderDetail__copyBtn"
                                      onClick={() =>
                                        handleCopy(razorpayOrderId, "orderId")
                                      }
                                      title="Copy Payment Reference ID"
                                    >
                                      {copiedField === "orderId" ? (
                                        <FiCheck className="OrderDetail__checkGreen" />
                                      ) : (
                                        <FiCopy />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="OrderDetail__infoRow">
                                <span>Transaction Date</span>
                                <span>{formatDate(order.paymentInfo?.paidAt || order.createdAt)}</span>
                              </div>

                              <div className="OrderDetail__infoRow">
                                <span>Currency</span>
                                <span>INR (₹)</span>
                              </div>
                            </div>

                            {/* Pricing Breakdown */}
                            <div className="OrderDetail__priceBreakdown">
                              <h4 className="OrderDetail__priceTitle">
                                Order Price Summary
                              </h4>

                              <div className="OrderDetail__priceRow">
                                <span>Items Subtotal</span>
                                <span>₹{Number(subtotal).toLocaleString("en-IN")}</span>
                              </div>

                              {discount > 0 && (
                                <div className="OrderDetail__priceRow OrderDetail__priceRow--discount">
                                  <span>
                                    <FiTag /> Coupon Discount{" "}
                                    {couponCode ? `(${couponCode})` : ""}
                                  </span>
                                  <span>-₹{Number(discount).toLocaleString("en-IN")}</span>
                                </div>
                              )}

                              <div className="OrderDetail__priceRow OrderDetail__priceRow--grand">
                                <span>{isPaid ? "Total Paid" : "Total Payable"}</span>
                                <strong className="OrderDetail__grandTotal">
                                  ₹{Number(total).toLocaleString("en-IN")}
                                </strong>
                              </div>
                            </div>

                            {/* Quick Help & Invoices in Payment Card */}
                            <div className="OrderDetail__paymentActions">
                              {isPaid && (
                                <button
                                  type="button"
                                  className="OrderDetail__actionBtn OrderDetail__actionBtn--invoice"
                                  onClick={() => downloadInvoice(order)}
                                >
                                  <FiDownload /> Download Official Tax Invoice
                                </button>
                              )}
                              {isFailed && (
                                <button
                                  type="button"
                                  className="OrderDetail__actionBtn OrderDetail__actionBtn--payNow"
                                  onClick={() => setPaymentModalOrder(order)}
                                >
                                  <FiCreditCard /> Pay ₹{Number(total).toLocaleString("en-IN")}
                                </button>
                              )}
                              <button
                                type="button"
                                className="OrderDetail__actionBtn OrderDetail__actionBtn--reorder"
                                onClick={() => handleReorder(order)}
                              >
                                <FiRefreshCw /> {isFailed ? "Reorder Items to Cart" : "Buy Items Again"}
                              </button>
                              <Link to="/contact" className="OrderDetail__supportLink">
                                <FiHelpCircle /> Need help with this payment? Contact Support
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )
            ) : (
              /* ========================================================
                 COMPACT ORDERS LIST VIEW (Decreased Height)
              ======================================================== */
              <>
                <div className="OrdersPage__contentHeader">
                  <div>
                    <h2>My Orders</h2>
                    <p className="OrdersPage__subtitle">
                      Track, return, and review your purchased books
                    </p>
                  </div>

                  <div className="OrdersPage__headerActions">
                    {/* Search Bar */}
                    <div className="OrdersPage__searchWrap">
                      <FiSearch />
                      <input
                        type="text"
                        placeholder="Search orders by title or receipt..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Toast alerts for payment retry */}
                {paySuccess && (
                  <div className="OrdersPage__toastBanner OrdersPage__toastBanner--success">
                    <span>{paySuccess}</span>
                    <button
                      type="button"
                      className="OrdersPage__toastClose"
                      onClick={() => setPaySuccess("")}
                      aria-label="Close message"
                    >
                      <FiX />
                    </button>
                  </div>
                )}

                {payError && (
                  <div className="OrdersPage__toastBanner OrdersPage__toastBanner--error">
                    <span>{payError}</span>
                    <button
                      type="button"
                      className="OrdersPage__toastClose"
                      onClick={() => setPayError("")}
                      aria-label="Close message"
                    >
                      <FiX />
                    </button>
                  </div>
                )}

                {/* Status Filter Tabs */}
                <div className="OrdersPage__filters">
                  {[
                    "All",
                    "Placed",
                    "Processing",
                    "Shipped",
                    "Out for Delivery",
                    "Delivered",
                    "Cancelled",
                  ].map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={`OrdersPage__filterTab ${
                          statusFilter === status
                            ? "OrdersPage__filterTab--active"
                            : ""
                        }`}
                        onClick={() => setStatusFilter(status)}
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>

                {/* Orders List */}
                {loading ? (
                  <div className="OrdersPage__loading">
                    <div className="OrdersPage__spinner"></div>
                    <p>Loading your orders...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="OrdersPage__empty">
                    <div className="OrdersPage__emptyIcon">
                      <FiShoppingBag />
                    </div>
                    <h3>
                      {searchTerm
                        ? "No matching orders found"
                        : "No Orders Placed Yet"}
                    </h3>
                    <p>
                      {searchTerm
                        ? "Try searching with a different book title or order ID."
                        : "You haven't placed any book orders yet. Explore our bestselling collection and enjoy fast delivery!"}
                    </p>
                    <Link to="/shop" className="OrdersPage__shopBtn">
                      <span>Browse Books</span>
                      <FiArrowRight />
                    </Link>
                  </div>
                ) : (
                  <div className="OrdersPage__compactList">
                    {filteredOrders.map((order) => {
                      const displayOrderId =
                        order.orderId ||
                        (order._id
                          ? `ORD-${order._id.slice(-6).toUpperCase()}`
                          : "ORD-ORDER");
                      const total = order.pricing?.totalAmount || 0;
                      const status = order.orderStatus || "Placed";
                      const payStatusRaw = (
                        order.paymentInfo?.status || "Pending"
                      ).toLowerCase();
                      const isPaid =
                        payStatusRaw === "paid" || payStatusRaw === "success";
                      const isFailed =
                        payStatusRaw === "failed" ||
                        (!isPaid && status.toLowerCase() === "cancelled");
                      const needsPayment = !isPaid;

                      const items = Array.isArray(order.items) ? order.items : [];
                      const firstItem = items[0] || {};
                      const extraCount = items.length > 1 ? items.length - 1 : 0;

                      return (
                        <article
                          key={order._id}
                          className="OrdersPage__compactCard"
                          onClick={() => {
                            if (needsPayment) {
                              setPaymentModalOrder(order);
                            } else {
                              navigate(`/orders/${displayOrderId}`);
                            }
                          }}
                          title={
                            needsPayment
                              ? "Payment incomplete. Click to view payment details & pay"
                              : "Click to view full order details"
                          }
                        >
                          {/* Left: Book Cover preview + Title & Order Meta */}
                          <div className="OrdersPage__compactLeft">
                            <div className="OrdersPage__compactThumb">
                              {firstItem?.coverImage ? (
                                <img
                                  src={firstItem.coverImage}
                                  alt={firstItem.title || "Book"}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <FiPackage />
                              )}
                              {extraCount > 0 && (
                                <span className="OrdersPage__compactBadgeCount">
                                  +{extraCount}
                                </span>
                              )}
                            </div>

                            <div className="OrdersPage__compactInfo">
                              <h4 className="OrdersPage__compactTitle">
                                {firstItem?.title || "Book Purchase"}
                                {extraCount > 0 && (
                                  <span className="OrdersPage__compactMoreText">
                                    {" "}
                                    & {extraCount} other{" "}
                                    {extraCount === 1 ? "book" : "books"}
                                  </span>
                                )}
                              </h4>

                              <div className="OrdersPage__compactMeta">
                                <span className="OrdersPage__compactReceipt">
                                  Order ID: <strong>{displayOrderId}</strong>
                                </span>
                                <span className="OrdersPage__compactDot">•</span>
                                <span className="OrdersPage__compactDate">
                                  <FiCalendar /> {formatDate(order.createdAt)}
                                </span>
                              </div>

                              {status === "Out for Delivery" && (
                                <div className="OrdersPage__compactDeliveryAlert">
                                  <FiTruck />
                                  <span>
                                    Out for Delivery
                                    {order.expectedDeliveryDate
                                      ? ` • Expected ${order.expectedDeliveryDate}`
                                      : ""}
                                    {order.deliveryPartner
                                      ? ` via ${order.deliveryPartner}`
                                      : ""}
                                  </span>
                                </div>
                              )}

                              {status === "Shipped" && order.currentLocation && (
                                <div className="OrdersPage__compactLocationAlert">
                                  <FiMapPin />
                                  <span>Current Hub: {order.currentLocation}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Center / Stats: Price & Badges */}
                          <div className="OrdersPage__compactCenter">
                            <div className="OrdersPage__compactPrice">
                              <span className="OrdersPage__compactPriceLabel">
                                {isPaid ? "Total Paid:" : "Total:"}
                              </span>
                              <strong className="OrdersPage__compactPriceVal">
                                ₹{Number(total).toLocaleString("en-IN")}
                              </strong>
                            </div>

                            <div className="OrdersPage__compactBadges">
                              <span
                                className={`OrdersPage__paymentStatusTag OrdersPage__paymentStatusTag--${
                                  isPaid
                                    ? "success"
                                    : isFailed
                                    ? "failed"
                                    : "pending"
                                }`}
                              >
                                <span className="OrdersPage__statusDot"></span>
                                {isPaid
                                  ? "Paid"
                                  : isFailed
                                  ? "Payment Failed"
                                  : "Payment Pending"}
                              </span>

                              <span
                                className={`OrdersPage__statusBadge ${getStatusClass(
                                  status
                                )}`}
                              >
                                <span className="OrdersPage__statusDot"></span>
                                {status}
                              </span>
                            </div>
                          </div>

                          {/* Right: Actions & Details */}
                          <div
                            className="OrdersPage__compactRight"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isPaid && (
                              <button
                                type="button"
                                className="OrdersPage__compactActionBtn OrdersPage__compactActionBtn--invoice"
                                onClick={() => downloadInvoice(order)}
                                title="Download Tax Invoice PDF"
                              >
                                <FiDownload />
                                <span>Invoice</span>
                              </button>
                            )}

                            <button
                              type="button"
                              className="OrdersPage__compactActionBtn OrdersPage__compactActionBtn--view"
                              onClick={() => {
                                if (needsPayment) {
                                  setPaymentModalOrder(order);
                                } else {
                                  navigate(`/orders/${displayOrderId}`);
                                }
                              }}
                              title={
                                needsPayment
                                  ? "Payment incomplete. Click to view payment details & pay"
                                  : "View full order details"
                              }
                            >
                              <span>Details</span>
                              <FiChevronRight />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* ========================================================
          PAYMENT POPUP MODAL (FOR FAILED / PENDING ORDERS)
      ======================================================== */}
      {paymentModalOrder && (() => {
        const pTotal = paymentModalOrder.pricing?.totalAmount || 0;
        const pOrderId =
          paymentModalOrder.orderId ||
          (paymentModalOrder._id
            ? `ORD-${paymentModalOrder._id.slice(-6).toUpperCase()}`
            : "ORD-ORDER");
        const pItems = Array.isArray(paymentModalOrder.items)
          ? paymentModalOrder.items
          : [];

        return (
          <div
            className="OrdersPage__modalOverlay"
            onClick={() => setPaymentModalOrder(null)}
          >
            <div
              className="OrdersPage__modalCard"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="OrdersPage__modalHeader">
                <div className="OrdersPage__modalHeaderTitle">
                  <div className="OrdersPage__modalHeaderIcon">
                    <FiCreditCard />
                  </div>
                  <div>
                    <h3>Order Payment</h3>
                    <span className="OrdersPage__modalOrderId">{pOrderId}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="OrdersPage__modalCloseBtn"
                  onClick={() => setPaymentModalOrder(null)}
                  aria-label="Close payment modal"
                >
                  <FiX />
                </button>
              </div>

              <div className="OrdersPage__modalBody">
                {/* Payment Incomplete Alert */}
                <div className="OrdersPage__modalAlert">
                  <FiAlertTriangle />
                  <div>
                    <strong>Payment Incomplete / Failed</strong>
                    <p>
                      Your previous payment attempt was not completed. You can pay securely now to place and dispatch your books.
                    </p>
                  </div>
                </div>

                {/* Ordered Books Preview */}
                <div className="OrdersPage__modalItemsSummary">
                  <span className="OrdersPage__modalSectionLabel">
                    ORDERED BOOKS ({pItems.length})
                  </span>
                  <div className="OrdersPage__modalItemsList">
                    {pItems.map((it, idx) => (
                      <div key={idx} className="OrdersPage__modalItemRow">
                        <div className="OrdersPage__modalItemThumb">
                          {it.coverImage ? (
                            <img
                              src={it.coverImage}
                              alt={it.title || "Book"}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <FiPackage />
                          )}
                        </div>
                        <div className="OrdersPage__modalItemInfo">
                          <span className="OrdersPage__modalItemTitle">
                            {it.title || "Book"}
                          </span>
                          <span className="OrdersPage__modalItemMeta">
                            Qty: {it.quantity || 1} • ₹{Number(it.price || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address Snapshot */}
                {paymentModalOrder.shippingAddress && (
                  <div className="OrdersPage__modalAddress">
                    <span className="OrdersPage__modalSectionLabel">
                      DELIVERING TO
                    </span>
                    <p>
                      <strong>
                        {paymentModalOrder.shippingAddress.fullName}
                      </strong>{" "}
                      ({paymentModalOrder.shippingAddress.phone})
                      <br />
                      {paymentModalOrder.shippingAddress.street},{" "}
                      {paymentModalOrder.shippingAddress.city},{" "}
                      {paymentModalOrder.shippingAddress.state || "Odisha"} -{" "}
                      {paymentModalOrder.shippingAddress.pincode}
                    </p>
                  </div>
                )}

                {/* High-Contrast Highlighted Price Box */}
                <div className="OrdersPage__modalPriceBox">
                  <div className="OrdersPage__modalPriceLeft">
                    <span className="OrdersPage__modalPriceLabel">
                      TOTAL AMOUNT PAYABLE
                    </span>
                    <div className="OrdersPage__modalPriceAmount">
                      ₹{Number(pTotal).toLocaleString("en-IN")}
                    </div>
                    <span className="OrdersPage__modalPriceSub">
                      Guaranteed Secure 256-bit Encrypted Checkout
                    </span>
                  </div>
                  <div className="OrdersPage__modalPriceTag">
                    <span>Payment Due</span>
                  </div>
                </div>

                {payError && (
                  <div className="OrdersPage__modalError">
                    <FiAlertCircle />
                    <span>{payError}</span>
                  </div>
                )}
              </div>

              <div className="OrdersPage__modalFooter">
                <button
                  type="button"
                  className="OrdersPage__modalPayBtn"
                  onClick={() => handlePayWithRazorpay(paymentModalOrder)}
                  disabled={payingOrderId === paymentModalOrder._id}
                >
                  {payingOrderId === paymentModalOrder._id ? (
                    <>
                      <div className="OrdersPage__miniSpinner"></div>
                      <span>Opening Secure Gateway...</span>
                    </>
                  ) : (
                    <>
                      <FiLock />
                      <span>
                        Pay ₹{Number(pTotal).toLocaleString("en-IN")}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="OrdersPage__modalDetailBtn"
                  onClick={() => {
                    const dispId =
                      paymentModalOrder.orderId ||
                      (paymentModalOrder._id
                        ? `ORD-${paymentModalOrder._id.slice(-6).toUpperCase()}`
                        : paymentModalOrder._id);
                    setPaymentModalOrder(null);
                    navigate(`/orders/${dispId}`);
                  }}
                >
                  <span>View Full Order Details</span>
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
};

export default Orders;
