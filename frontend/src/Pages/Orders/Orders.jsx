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
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { fetchMyOrders } from "../../api/orderService";
import { downloadInvoice } from "../../utils/invoiceGenerator";
import { addToCart } from "../../Components/ShopMain/useShopStore";
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
                  const stages = ["Placed", "Processing", "Shipped", "Delivered"];
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
                            <strong>Order Cancelled</strong>
                            <p>
                              {isFailed
                                ? "This order was cancelled because payment verification was not completed or was declined by the bank."
                                : "This order was cancelled. Please feel free to place a new order anytime."}
                            </p>
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
                                  {order.paymentInfo?.method || "Razorpay (Online)"}
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
                                  <span>Razorpay Order ID</span>
                                  <div className="OrderDetail__copyWrap">
                                    <code>{razorpayOrderId}</code>
                                    <button
                                      type="button"
                                      className="OrderDetail__copyBtn"
                                      onClick={() =>
                                        handleCopy(razorpayOrderId, "orderId")
                                      }
                                      title="Copy Razorpay Order ID"
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
                              <button
                                type="button"
                                className="OrderDetail__actionBtn OrderDetail__actionBtn--reorder"
                                onClick={() => handleReorder(order)}
                              >
                                <FiRefreshCw /> {isFailed ? "Retry Payment / Reorder" : "Buy Items Again"}
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

                {/* Status Filter Tabs */}
                <div className="OrdersPage__filters">
                  {["All", "Placed", "Processing", "Shipped", "Delivered", "Cancelled"].map(
                    (status) => (
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
                      const isFailed = payStatusRaw === "failed";

                      const items = Array.isArray(order.items) ? order.items : [];
                      const firstItem = items[0] || {};
                      const extraCount = items.length > 1 ? items.length - 1 : 0;

                      return (
                        <article
                          key={order._id}
                          className="OrdersPage__compactCard"
                          onClick={() => navigate(`/orders/${displayOrderId}`)}
                          title="Click to view full order and payment details"
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

                          {/* Right: Actions & Chevron */}
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
                              onClick={() => navigate(`/orders/${receiptNo}`)}
                              title="View full order details"
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
    </main>
  );
};

export default Orders;
