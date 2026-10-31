import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import {
  FiBookOpen,
  FiUsers,
  FiShoppingCart,
  FiDollarSign,
  FiCalendar,
  FiPlusCircle,
  FiEdit3,
  FiTrendingUp,
  FiClock,
  FiBook,
  FiRefreshCw,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiArrowUpRight,
  FiTag,
  FiAward,
  FiLayers,
  FiActivity,
  FiZap,
  FiStar,
  FiMessageSquare,
  FiPercent,
  FiShield,
  FiEye,
  FiCheck,
} from "react-icons/fi";
import "./Dashboard.css";

const getImageUrl = (book) => {
  const img =
    (Array.isArray(book?.images) && book.images[0]) ||
    book?.image ||
    book?.coverImage ||
    book?.cover;
  if (!img)
    return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80";
  if (
    img.startsWith("http://") ||
    img.startsWith("https://") ||
    img.startsWith("blob:") ||
    img.startsWith("data:")
  )
    return img;
  return `http://localhost:5000${img.startsWith("/") ? "" : "/"}${img}`;
};

const calculateDiscount = (price, offerPrice) => {
  const p = Number(price) || 0;
  const op = Number(offerPrice) || 0;
  if (p <= 0 || op <= 0 || op >= p) return 0;
  return Math.round(((p - op) / p) * 100);
};

const Dashboard = () => {
  const navigate = useNavigate();

  // Core Data States
  const [orders, setOrders] = useState([]);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [supports, setSupports] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Filters & Tabs
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Books Showcase Active Tab
  const [activeBookTab, setActiveBookTab] = useState("topSelling"); // "topSelling" | "bestSeller" | "onSale" | "lowStock" | "all"

  // Fetch all live data from backend APIs across the whole project
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [
        ordersRes,
        booksRes,
        catRes,
        usersRes,
        supportsRes,
        enquiriesRes,
        reviewsRes,
        couponsRes,
      ] = await Promise.allSettled([
        API.get("/orders"),
        API.get("/book-posting?limit=100"),
        API.get("/categories"),
        API.get("/users"),
        API.get("/supports"),
        API.get("/enquiries"),
        API.get("/reviews"),
        API.get("/coupons?limit=100"),
      ]);

      if (ordersRes.status === "fulfilled" && ordersRes.value.data) {
        const ords = ordersRes.value.data.orders || ordersRes.value.data.data || [];
        setOrders(Array.isArray(ords) ? ords : []);
      }

      if (booksRes.status === "fulfilled" && booksRes.value.data) {
        const bData = booksRes.value.data;
        const bList = Array.isArray(bData.data)
          ? bData.data
          : Array.isArray(bData.books)
          ? bData.books
          : Array.isArray(bData)
          ? bData
          : [];
        setBooks(bList);
      }

      if (catRes.status === "fulfilled" && catRes.value.data) {
        const cData = catRes.value.data;
        const cList = Array.isArray(cData.data)
          ? cData.data
          : Array.isArray(cData.categories)
          ? cData.categories
          : Array.isArray(cData)
          ? cData
          : [];
        setCategories(cList);
      }

      if (usersRes.status === "fulfilled" && usersRes.value.data) {
        const uData = usersRes.value.data;
        const uList = Array.isArray(uData.users)
          ? uData.users
          : Array.isArray(uData.data)
          ? uData.data
          : Array.isArray(uData)
          ? uData
          : [];
        setUsers(uList);
      }

      if (supportsRes.status === "fulfilled" && supportsRes.value.data) {
        const sData = supportsRes.value.data;
        setSupports(Array.isArray(sData.data) ? sData.data : []);
      }

      if (enquiriesRes.status === "fulfilled" && enquiriesRes.value.data) {
        const eData = enquiriesRes.value.data;
        setEnquiries(Array.isArray(eData.data) ? eData.data : []);
      }

      if (reviewsRes.status === "fulfilled" && reviewsRes.value.data) {
        const rData = reviewsRes.value.data;
        setReviews(Array.isArray(rData.data) ? rData.data : []);
      }

      if (couponsRes.status === "fulfilled" && couponsRes.value.data) {
        const cpData = couponsRes.value.data;
        const cpList = Array.isArray(cpData.data)
          ? cpData.data
          : Array.isArray(cpData.coupons)
          ? cpData.coupons
          : Array.isArray(cpData)
          ? cpData
          : [];
        setCoupons(cpList);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.warn("Error loading live dashboard metrics, fallback active:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ==========================================
  // METRIC CALCULATIONS & PROJECT-WIDE ANALYTICS
  // ==========================================
  const analytics = useMemo(() => {
    const totalOrdersCount = orders.length;

    let totalRevenue = 0;
    let paidRevenue = 0;
    let deliveredCount = 0;
    let shippedCount = 0;
    let outForDeliveryCount = 0;
    let processingCount = 0;
    let placedCount = 0;
    let cancelledCount = 0;

    orders.forEach((ord) => {
      const amt = Number(ord.pricing?.totalAmount || ord.totalAmount || 0);
      totalRevenue += amt;
      const pStatus = (ord.paymentInfo?.status || ord.paymentStatus || "").toLowerCase();
      if (pStatus === "paid" || pStatus === "success") {
        paidRevenue += amt;
      }

      const st = (ord.orderStatus || ord.status || "").toLowerCase();
      if (st === "delivered") deliveredCount++;
      else if (st === "out for delivery") outForDeliveryCount++;
      else if (st === "shipped") shippedCount++;
      else if (st === "processing") processingCount++;
      else if (st === "cancelled") cancelledCount++;
      else placedCount++;
    });

    const displayGrossRevenue = totalRevenue;
    const displayPaidRevenue = paidRevenue;
    const displayTotalOrders = totalOrdersCount;
    const displayBooksCount = books.length;
    const displayUsersCount = users.length;

    const aov = displayTotalOrders > 0 ? Math.round(displayGrossRevenue / displayTotalOrders) : 0;
    const fulfillmentRate =
      displayTotalOrders > 0
        ? Math.round((deliveredCount / displayTotalOrders) * 100)
        : 0;

    // Book Special Subsets
    const topSellingCount = books.filter((b) => b.isTopSelling).length;
    const bestSellerCount = books.filter((b) => b.isBestSeller).length;
    const onSaleCount = books.filter(
      (b) => Number(b.offerPrice) > 0 && Number(b.offerPrice) < Number(b.price)
    ).length;
    const lowStockCount = books.filter((b) => Number(b.stock || 0) < 10).length;
    const outOfStockCount = books.filter((b) => Number(b.stock || 0) === 0).length;

    // Customer Care / Supports Analytics
    const totalCareTickets = supports.length + enquiries.length;
    const newTickets =
      supports.filter((s) => s.status === "New" || s.status === "Pending").length +
      enquiries.filter((e) => e.status === "New" || e.status === "Pending").length;
    const resolvedTickets =
      supports.filter((s) => s.status === "Replied" || s.status === "Resolved" || s.status === "Closed").length +
      enquiries.filter((e) => e.status === "Replied" || e.status === "Resolved" || e.status === "Closed").length;

    // Reviews & Rating Analytics
    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / reviews.length
          ).toFixed(1)
        : "5.0";

    // Coupons Analytics
    const totalCouponsCount = Array.isArray(coupons) ? coupons.length : 0;
    const activeCouponsCount = Array.isArray(coupons)
      ? coupons.filter((c) => (c.status || "Active").toLowerCase() === "active").length
      : 0;
    const publicCouponsCount = Array.isArray(coupons)
      ? coupons.filter(
          (c) => (c.type || c.visibility || "public").toLowerCase() === "public"
        ).length
      : 0;
    const privateCouponsCount = Math.max(0, totalCouponsCount - publicCouponsCount);

    return {
      grossRevenue: displayGrossRevenue,
      paidRevenue: displayPaidRevenue,
      totalOrders: displayTotalOrders,
      totalBooks: displayBooksCount,
      totalUsers: displayUsersCount,
      aov,
      fulfillmentRate,
      topSellingCount,
      bestSellerCount,
      onSaleCount,
      lowStockCount,
      outOfStockCount,
      totalCareTickets,
      newTickets,
      resolvedTickets,
      totalReviews: reviews.length,
      avgRating,
      totalCoupons: totalCouponsCount,
      activeCoupons: activeCouponsCount,
      publicCoupons: publicCouponsCount,
      privateCoupons: privateCouponsCount,
      pipeline: {
        placed: placedCount,
        processing: processingCount,
        shipped: shippedCount,
        outForDelivery: outForDeliveryCount,
        delivered: deliveredCount,
        cancelled: cancelledCount,
      },
    };
  }, [orders, books, users, supports, enquiries, reviews, coupons]);

  // ==========================================
  // TOP SELLING, BEST SELLERS & ON SALE BOOKS (100% REAL)
  // ==========================================
  const displayedBooks = useMemo(() => {
    if (!books || books.length === 0) return [];

    if (activeBookTab === "topSelling") {
      return books.filter((b) => Boolean(b.isTopSelling));
    }
    if (activeBookTab === "bestSeller") {
      return books.filter((b) => Boolean(b.isBestSeller));
    }
    if (activeBookTab === "onSale") {
      return books.filter(
        (b) => Number(b.offerPrice) > 0 && Number(b.offerPrice) < Number(b.price)
      );
    }
    if (activeBookTab === "lowStock") {
      return books.filter((b) => Number(b.stock || 0) < 10);
    }
    return books;
  }, [books, activeBookTab]);

  // ==========================================
  // CATEGORY DISTRIBUTION DONUT (100% REAL FROM BOOKS & CATEGORIES)
  // ==========================================
  const categoryChartData = useMemo(() => {
    const colorPalette = [
      "#6366f1",
      "#06b6d4",
      "#10b981",
      "#f59e0b",
      "#ec4899",
      "#8b5cf6",
      "#ff7228",
      "#64748b",
    ];

    // Compute live book counts grouped by genre/category
    const countMap = {};
    books.forEach((b) => {
      const cName = (b.category || b.categoryName || "General").trim();
      countMap[cName] = (countMap[cName] || 0) + 1;
    });

    // Also register any category defined in the category collection
    categories.forEach((cat) => {
      const cName = (cat.name || "").trim();
      if (cName && countMap[cName] === undefined) {
        countMap[cName] = 0;
      }
    });

    const entries = Object.entries(countMap).sort((a, b) => b[1] - a[1]);
    const totalCount = books.length || 0;

    if (entries.length === 0) {
      return { segments: [], totalCount: 0 };
    }

    const circumference = 2 * Math.PI * 38;
    let accumulatedAngle = 0;

    const segments = entries.slice(0, 6).map(([name, count], idx) => {
      const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
      const dashLength = (percentage / 100) * circumference;
      const dashSpace = circumference - dashLength;
      const dashOffset = -accumulatedAngle;
      accumulatedAngle += dashLength;

      return {
        name,
        count,
        percentage: Math.round(percentage),
        color: colorPalette[idx % colorPalette.length],
        dashArray: `${dashLength} ${dashSpace}`,
        dashOffset,
      };
    });

    return { segments, totalCount };
  }, [books, categories]);

  // ==========================================
  // RECENT ORDERS STREAM (100% REAL FROM DATABASE)
  // ==========================================
  const recentOrdersList = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) {
      return [];
    }

    // Sort by latest createdAt timestamp descending
    const sorted = [...orders].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return sorted.slice(0, 8).map((ord) => ({
      id: ord.orderId || (ord._id ? `#${ord._id.slice(-6).toUpperCase()}` : "#ORD"),
      customer:
        ord.shippingAddress?.fullName ||
        ord.user?.name ||
        ord.userId?.name ||
        ord.customerName ||
        "Customer",
      amount: `₹ ${(ord.pricing?.totalAmount || ord.totalAmount || 0).toLocaleString("en-IN")}`,
      status: ord.orderStatus || ord.status || "Placed",
      payment: ord.paymentInfo?.status || ord.paymentStatus || "Paid",
      itemsCount: ord.items?.length || 1,
      date: ord.createdAt
        ? new Date(ord.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })
        : "Recent",
    }));
  }, [orders]);

  const getStageBadgeClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered") return "DashStatusBadge--green";
    if (s === "out for delivery") return "DashStatusBadge--purple";
    if (s === "shipped") return "DashStatusBadge--cyan";
    if (s === "processing") return "DashStatusBadge--amber";
    if (s === "cancelled") return "DashStatusBadge--rose";
    return "DashStatusBadge--blue";
  };

  return (
    <div className="DashPage">
      {/* ========================================================
          EXECUTIVE HERO HEADER BANNER
      ======================================================== */}
      <header className="DashHeader">
        <div className="DashHeader__left">
          <div className="DashHeader__badge">
            <span className="DashHeader__pulseDot" />
            <span>LEKHANI ENTERPRISE HUB</span>
            <span className="DashHeader__badgeDivider">•</span>
            <span style={{ color: "#10b981" }}>LIVE SYSTEM ANALYTICS</span>
          </div>
          <h1 className="DashHeader__title">Store Operations & Executive Analytics</h1>
          <p className="DashHeader__subtitle">
            Comprehensive real-time analysis across book sales, order pipelines, client care, and market demand.
          </p>
        </div>

        <div className="DashHeader__right">
          <div className="DashHeader__metaChip" title="Last background synchronisation">
            <FiClock className="DashHeader__metaIcon" />
            <span>
              Synced {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>

          <div className="DashHeader__actions">
            <button
              type="button"
              className={`DashHeader__btn DashHeader__btn--refresh ${
                isRefreshing ? "DashHeader__btn--spinning" : ""
              }`}
              onClick={fetchDashboardData}
              title="Reload live database telemetry"
            >
              <FiRefreshCw />
              <span>Sync Live</span>
            </button>

            <button
              type="button"
              className="DashHeader__btn DashHeader__btn--secondary"
              onClick={() => navigate("/orders")}
              title="View live dispatches & logistics"
            >
              <FiTruck />
              <span>Dispatches ({analytics.pipeline.outForDelivery})</span>
            </button>

            <button
              type="button"
              className="DashHeader__btn DashHeader__btn--primary"
              onClick={() => navigate("/book-posting")}
              title="Add a new book title"
            >
              <FiPlusCircle />
              <span>Add New Book</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          TIER 1: 6-CARD EXECUTIVE KPI ROW (ALL IN ONE ROW)
      ======================================================== */}
      <section className="DashKpiGrid">
        {/* Card 1: Gross & Paid Revenue */}
        <div className="DashKpiCard DashKpiCard--indigo">
          <div className="DashKpiCard__top">
            <div className="DashKpiCard__iconWrap DashKpiCard__iconWrap--indigo">
              <FiDollarSign />
            </div>
            <span className="DashKpiCard__trend DashKpiCard__trend--up">
              <FiTrendingUp /> Live
            </span>
          </div>
          <div className="DashKpiCard__body">
            <span className="DashKpiCard__label">Gross Revenue</span>
            <h2 className="DashKpiCard__value">₹ {analytics.grossRevenue.toLocaleString("en-IN")}</h2>
          </div>
        </div>

        {/* Card 2: Total Store Orders & Delivery Velocity */}
        <div className="DashKpiCard DashKpiCard--cyan">
          <div className="DashKpiCard__top">
            <div className="DashKpiCard__iconWrap DashKpiCard__iconWrap--cyan">
              <FiShoppingCart />
            </div>
            <span className="DashKpiCard__trend DashKpiCard__trend--up">
              <FiZap /> {analytics.fulfillmentRate}%
            </span>
          </div>
          <div className="DashKpiCard__body">
            <span className="DashKpiCard__label">Total Orders</span>
            <h2 className="DashKpiCard__value">{analytics.totalOrders.toLocaleString("en-IN")}</h2>
          </div>
        </div>

        {/* Card 3: Books Catalog, Top Sellers & Deals */}
        <div className="DashKpiCard DashKpiCard--orange">
          <div className="DashKpiCard__top">
            <div className="DashKpiCard__iconWrap DashKpiCard__iconWrap--orange">
              <FiBookOpen />
            </div>
            <span className="DashKpiCard__trend DashKpiCard__trend--accent">
              <FiTag /> {analytics.onSaleCount} Sale
            </span>
          </div>
          <div className="DashKpiCard__body">
            <span className="DashKpiCard__label">Active Books</span>
            <h2 className="DashKpiCard__value">{analytics.totalBooks}</h2>
          </div>
        </div>

        {/* Card 4: Registered Readers & Users */}
        <div className="DashKpiCard DashKpiCard--purple">
          <div className="DashKpiCard__top">
            <div className="DashKpiCard__iconWrap DashKpiCard__iconWrap--purple">
              <FiUsers />
            </div>
            <span className="DashKpiCard__trend DashKpiCard__trend--up">
              <FiActivity /> Active
            </span>
          </div>
          <div className="DashKpiCard__body">
            <span className="DashKpiCard__label">Readers & Users</span>
            <h2 className="DashKpiCard__value">{analytics.totalUsers}</h2>
          </div>
        </div>

        {/* Card 5: Customer Care & Support Tickets */}
        <div className="DashKpiCard DashKpiCard--emerald">
          <div className="DashKpiCard__top">
            <div className="DashKpiCard__iconWrap DashKpiCard__iconWrap--emerald">
              <FiMessageSquare />
            </div>
            <span className="DashKpiCard__trend DashKpiCard__trend--up">
              <FiCheckCircle /> {analytics.resolvedTickets} Done
            </span>
          </div>
          <div className="DashKpiCard__body">
            <span className="DashKpiCard__label">Care Requests</span>
            <h2 className="DashKpiCard__value">{analytics.totalCareTickets}</h2>
          </div>
        </div>

        {/* Card 6: Coupon Codes & Promotional Discounts */}
        <div
          className="DashKpiCard DashKpiCard--amber"
          onClick={() => navigate("/coupons")}
          style={{ cursor: "pointer" }}
          title="Click to manage coupon codes and promotions"
        >
          <div className="DashKpiCard__top">
            <div className="DashKpiCard__iconWrap DashKpiCard__iconWrap--amber">
              <FiTag />
            </div>
            <span className="DashKpiCard__trend DashKpiCard__trend--gold">
              <FiCheckCircle /> {analytics.activeCoupons} Active
            </span>
          </div>
          <div className="DashKpiCard__body">
            <span className="DashKpiCard__label">Coupon Codes</span>
            <h2 className="DashKpiCard__value">{analytics.totalCoupons}</h2>
          </div>
        </div>
      </section>

      {/* ========================================================
          TIER 2: DEDICATED SPECIAL SHOWCASE
          TOP SELLING, BEST SELLERS & BOOKS ON SALE
      ======================================================== */}
      <section className="DashSectionCard DashShowcaseSection">
        <div className="DashSectionHeader">
          <div className="DashSectionHeader__meta">
            <div className="DashSectionHeader__tag" style={{ color: "#ff7228", background: "#fff2eb" }}>
              <FiAward /> PROMOTIONS & BEST PERFORMERS
            </div>
            <h2 className="DashSectionHeader__title">
              Top Selling, Best Sellers & Special Offers Showcase
            </h2>
            <p className="DashSectionHeader__desc">
              Curated merchandising spotlight analyzing top turnover books, official best sellers, and active discount campaigns.
            </p>
          </div>

          <div className="DashShowcaseTabs">
            <button
              type="button"
              className={`DashShowcaseTab ${
                activeBookTab === "topSelling" ? "DashShowcaseTab--active" : ""
              }`}
              onClick={() => setActiveBookTab("topSelling")}
            >
              🔥 Top Selling ({analytics.topSellingCount})
            </button>

            <button
              type="button"
              className={`DashShowcaseTab ${
                activeBookTab === "bestSeller" ? "DashShowcaseTab--active" : ""
              }`}
              onClick={() => setActiveBookTab("bestSeller")}
            >
              ⭐ Best Sellers ({analytics.bestSellerCount})
            </button>

            <button
              type="button"
              className={`DashShowcaseTab ${
                activeBookTab === "onSale" ? "DashShowcaseTab--active" : ""
              }`}
              onClick={() => setActiveBookTab("onSale")}
            >
              🏷️ On Sale & Deals ({analytics.onSaleCount})
            </button>

            <button
              type="button"
              className={`DashShowcaseTab ${
                activeBookTab === "lowStock" ? "DashShowcaseTab--active" : ""
              }`}
              onClick={() => setActiveBookTab("lowStock")}
            >
              ⚠️ Low Stock ({analytics.lowStockCount})
            </button>

            <button
              type="button"
              className={`DashShowcaseTab ${
                activeBookTab === "all" ? "DashShowcaseTab--active" : ""
              }`}
              onClick={() => setActiveBookTab("all")}
            >
              📚 All Titles ({books.length})
            </button>
          </div>
        </div>

        {/* Showcase Grid Cards */}
        <div className="DashBookCardsGrid">
          {displayedBooks.length > 0 ? (
            displayedBooks.map((book, idx) => {
              const price = Number(book.price || 0);
              const offerPrice = Number(book.offerPrice || 0);
              const hasOffer = offerPrice > 0 && offerPrice < price;
              const discountPercent = calculateDiscount(price, offerPrice);
              const stock = Number(book.stock || 0);
              const isLowStock = stock < 10;
              const isOut = stock === 0;

              return (
                <div key={book._id || idx} className="DashBookCard">
                  {/* Floating Badges */}
                  <div className="DashBookCard__badges">
                    {book.isTopSelling && (
                      <span className="DashBookCard__badge DashBookCard__badge--top">
                        🔥 Top Seller
                      </span>
                    )}
                    {book.isBestSeller && (
                      <span className="DashBookCard__badge DashBookCard__badge--best">
                        ⭐ Best Seller
                      </span>
                    )}
                    {hasOffer && (
                      <span className="DashBookCard__badge DashBookCard__badge--sale">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Cover */}
                  <div className="DashBookCard__coverWrapper">
                    <img
                      src={getImageUrl(book)}
                      alt={book.title}
                      className="DashBookCard__cover"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                  </div>

                  {/* Body Content */}
                  <div className="DashBookCard__content">
                    <span className="DashBookCard__category">{book.category || "Literature"}</span>
                    <h3 className="DashBookCard__title" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="DashBookCard__author">by {book.author || "Prominent Author"}</p>

                    {/* Price Block */}
                    <div className="DashBookCard__priceRow">
                      {hasOffer ? (
                        <>
                          <div className="DashBookCard__priceWrap">
                            <span className="DashBookCard__priceCurrent">₹ {offerPrice}</span>
                            <span className="DashBookCard__priceOriginal">₹ {price}</span>
                          </div>
                          <span className="DashBookCard__saveTag">
                            Save ₹ {price - offerPrice}
                          </span>
                        </>
                      ) : (
                        <div className="DashBookCard__priceWrap">
                          <span className="DashBookCard__priceCurrent">₹ {price}</span>
                        </div>
                      )}
                    </div>

                    {/* Stock & Sales Footer */}
                    <div className="DashBookCard__footer">
                      <div className="DashBookCard__stockInfo">
                        <span
                          className={`DashStockIndicator ${
                            isOut
                              ? "DashStockIndicator--out"
                              : isLowStock
                              ? "DashStockIndicator--low"
                              : "DashStockIndicator--in"
                          }`}
                        />
                        <small className="DashBookCard__stockText">
                          {isOut
                            ? "Out of Stock"
                            : isLowStock
                            ? `Only ${stock} left!`
                            : `${stock} available`}
                        </small>
                      </div>

                      <button
                        type="button"
                        className="DashBookCard__actionBtn"
                        onClick={() => navigate(`/book-posting?edit=${book._id || book.id}`)}
                        title="Edit Book Details in Book Posting"
                      >
                        <FiEdit3 /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="DashEmptyState">
              <FiBookOpen className="DashEmptyState__icon" />
              <h3>No books found under this filter</h3>
              <p>Try switching to another category tab or publish new titles.</p>
              <button
                type="button"
                className="DashHeader__btn DashHeader__btn--primary"
                onClick={() => navigate("/book-posting")}
              >
                <FiPlusCircle /> Publish Book
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          TIER 3: DISPATCH PIPELINE & GENRE DISTRIBUTION
      ======================================================== */}
      <section className="DashTwoColGrid">
        {/* Left Column: Order Fulfillment Pipeline */}
        <div className="DashCard DashPipelineCard">
          <div className="DashCardHeader">
            <div>
              <div className="DashSectionHeader__tag">
                <FiTruck /> LOGISTICS FULFILLMENT
              </div>
              <h3 className="DashCardTitle">Dispatch & Order Pipeline</h3>
              <p className="DashCardSubtitle">Real-time status of orders through fulfillment lifecycle</p>
            </div>
            <Link to="/orders" className="DashCardActionLink">
              Manage Hub <FiArrowUpRight />
            </Link>
          </div>

          {/* Multi-Segment Funnel Progression Bar */}
          <div className="DashPipelineBar">
            <div
              className="DashPipelineSegment DashPipelineSegment--placed"
              style={{
                width: `${analytics.totalOrders > 0 ? (analytics.pipeline.placed / analytics.totalOrders) * 100 : 0}%`,
              }}
              title={`Placed: ${analytics.pipeline.placed}`}
            />
            <div
              className="DashPipelineSegment DashPipelineSegment--processing"
              style={{
                width: `${analytics.totalOrders > 0 ? (analytics.pipeline.processing / analytics.totalOrders) * 100 : 0}%`,
              }}
              title={`Processing: ${analytics.pipeline.processing}`}
            />
            <div
              className="DashPipelineSegment DashPipelineSegment--shipped"
              style={{
                width: `${analytics.totalOrders > 0 ? (analytics.pipeline.shipped / analytics.totalOrders) * 100 : 0}%`,
              }}
              title={`Shipped: ${analytics.pipeline.shipped}`}
            />
            <div
              className="DashPipelineSegment DashPipelineSegment--outForDelivery"
              style={{
                width: `${
                  analytics.totalOrders > 0
                    ? (analytics.pipeline.outForDelivery / analytics.totalOrders) * 100
                    : 0
                }%`,
              }}
              title={`Out for Delivery: ${analytics.pipeline.outForDelivery}`}
            />
            <div
              className="DashPipelineSegment DashPipelineSegment--delivered"
              style={{
                width: `${analytics.totalOrders > 0 ? (analytics.pipeline.delivered / analytics.totalOrders) * 100 : 0}%`,
              }}
              title={`Delivered: ${analytics.pipeline.delivered}`}
            />
          </div>

          {/* Detailed Stage Tiles */}
          <div className="DashPipelineStagesGrid">
            {[
              {
                label: "Placed",
                count: analytics.pipeline.placed,
                icon: <FiPackage />,
                color: "blue",
              },
              {
                label: "Processing",
                count: analytics.pipeline.processing,
                icon: <FiClock />,
                color: "amber",
              },
              {
                label: "Shipped",
                count: analytics.pipeline.shipped,
                icon: <FiTruck />,
                color: "cyan",
              },
              {
                label: "Out for Delivery",
                count: analytics.pipeline.outForDelivery,
                icon: <FiZap />,
                color: "purple",
                isSpecial: true,
              },
              {
                label: "Delivered",
                count: analytics.pipeline.delivered,
                icon: <FiCheckCircle />,
                color: "green",
              },
              {
                label: "Cancelled",
                count: analytics.pipeline.cancelled,
                icon: <FiXCircle />,
                color: "rose",
              },
            ].map((stage) => (
              <div
                key={stage.label}
                className={`DashPipelineStageCard DashPipelineStageCard--${stage.color} ${
                  stage.isSpecial ? "DashPipelineStageCard--highlight" : ""
                }`}
                onClick={() => navigate("/orders")}
              >
                <div className="DashPipelineStageCard__top">
                  <span className="DashPipelineStageCard__icon">{stage.icon}</span>
                  <strong className="DashPipelineStageCard__count">{stage.count}</strong>
                </div>
                <span className="DashPipelineStageCard__label">{stage.label}</span>
                <span className="DashPipelineStageCard__pct">
                  {analytics.totalOrders > 0
                    ? Math.round((stage.count / analytics.totalOrders) * 100)
                    : 0}
                  % of total
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Category Market Share Donut Chart */}
        <div className="DashCard DashCategoryCard">
          <div className="DashCardHeader">
            <div>
              <div className="DashSectionHeader__tag">
                <FiLayers /> GENRE DISTRIBUTION
              </div>
              <h3 className="DashCardTitle">Catalog by Category</h3>
              <p className="DashCardSubtitle">Volume share across active literary genres</p>
            </div>
            {selectedCategory !== "All" && (
              <button
                type="button"
                className="DashResetCategoryBtn"
                onClick={() => setSelectedCategory("All")}
              >
                Reset
              </button>
            )}
          </div>

          <div className="DashDonutLayout">
            {/* SVG Donut Dial */}
            <div className="DashDonutWrapper">
              <svg viewBox="0 0 100 100" className="DashDonutSvg">
                {categoryChartData.segments.map((seg) => {
                  const isSelected = selectedCategory === seg.name;
                  return (
                    <circle
                      key={seg.name}
                      cx="50"
                      cy="50"
                      r="38"
                      stroke={seg.color}
                      strokeWidth={isSelected ? "14" : "10"}
                      fill="none"
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                      className={`DashDonutSlice ${
                        isSelected ? "DashDonutSlice--selected" : ""
                      }`}
                      onClick={() => setSelectedCategory(isSelected ? "All" : seg.name)}
                    />
                  );
                })}
              </svg>

              {/* Center KPI Gauge */}
              <div className="DashDonutCenter">
                <span className="DashDonutCount">
                  {selectedCategory === "All"
                    ? categoryChartData.totalCount
                    : categoryChartData.segments.find((s) => s.name === selectedCategory)?.count || 0}
                </span>
                <span className="DashDonutLabel">
                  {selectedCategory === "All" ? "Total Titles" : selectedCategory}
                </span>
              </div>
            </div>

            {/* Interactive Legend List */}
            <div className="DashCategoryLegend">
              {categoryChartData.segments.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <div
                    key={cat.name}
                    className={`DashCategoryLegendItem ${
                      isSelected ? "DashCategoryLegendItem--selected" : ""
                    }`}
                    onClick={() => setSelectedCategory(isSelected ? "All" : cat.name)}
                  >
                    <div className="DashCategoryLegendLeft">
                      <span className="DashCategoryDot" style={{ backgroundColor: cat.color }} />
                      <span className="DashCategoryName">{cat.name}</span>
                    </div>
                    <div className="DashCategoryLegendRight">
                      <span className="DashCategoryCount">{cat.count} bks</span>
                      <span className="DashCategoryPct">{cat.percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          TIER 5: LIVE ORDER STREAM TABLE
      ======================================================== */}
      <section className="DashSectionCard">
        <div className="DashCardHeader">
          <div>
            <div className="DashSectionHeader__tag">
              <FiShoppingCart /> LIVE TRANSACTION FEED
            </div>
            <h3 className="DashCardTitle">Recent Orders Stream</h3>
            <p className="DashCardSubtitle">Incoming client transactions with immediate dispatch status</p>
          </div>
          <Link to="/orders" className="DashCardActionLink">
            View All Orders <FiArrowUpRight />
          </Link>
        </div>

        <div className="DashOrdersTableWrap">
          <table className="DashOrdersTable">
            <thead>
              <tr>
                <th>Order Receipt</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Payment</th>
                <th>Lifecycle Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrdersList.length > 0 ? (
                recentOrdersList.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate("/orders")}
                    className="DashOrderRow"
                    title="Click to manage order"
                  >
                    <td>
                      <strong className="DashOrderId">{order.id}</strong>
                      <span className="DashOrderTime">{order.date}</span>
                    </td>
                    <td>
                      <span className="DashOrderCustomer">{order.customer}</span>
                      <small className="DashOrderItems">{order.itemsCount} item(s)</small>
                    </td>
                    <td>
                      <strong className="DashOrderAmount">{order.amount}</strong>
                    </td>
                    <td>
                      <span
                        className={`DashPayBadge DashPayBadge--${order.payment.toLowerCase()}`}
                      >
                        {order.payment}
                      </span>
                    </td>
                    <td>
                      <span className={`DashStatusBadge ${getStageBadgeClass(order.status)}`}>
                        <span className="DashStatusDot" />
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="DashOrderViewBtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/orders");
                        }}
                      >
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "36px 16px",
                      color: "var(--dash-text-muted)",
                      fontSize: "13.5px",
                    }}
                  >
                    No orders recorded yet. Fresh client transactions will appear here in real time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================
          TIER 6: QUICK OPERATIONAL SHORTCUTS HUB
      ======================================================== */}
      <section className="DashShortcutsHub">
        <div className="DashShortcutCard" onClick={() => navigate("/book-posting")}>
          <div className="DashShortcutIcon DashShortcutIcon--blue">
            <FiPlusCircle />
          </div>
          <div className="DashShortcutText">
            <h4>Publish New Book</h4>
            <p>Add fresh title, upload book cover, and set offer pricing</p>
          </div>
          <FiArrowUpRight className="DashShortcutArrow" />
        </div>

        <div className="DashShortcutCard" onClick={() => navigate("/orders")}>
          <div className="DashShortcutIcon DashShortcutIcon--purple">
            <FiTruck />
          </div>
          <div className="DashShortcutText">
            <h4>Fulfillment & Dispatches</h4>
            <p>Manage order lifecycle, track couriers and updates</p>
          </div>
          <FiArrowUpRight className="DashShortcutArrow" />
        </div>

        <div className="DashShortcutCard" onClick={() => navigate("/supports")}>
          <div className="DashShortcutIcon DashShortcutIcon--emerald">
            <FiMessageSquare />
          </div>
          <div className="DashShortcutText">
            <h4>Customer Supports Hub</h4>
            <p>Answer Contact Us, Need Help and Let's Talk inquiries</p>
          </div>
          <FiArrowUpRight className="DashShortcutArrow" />
        </div>

        <div className="DashShortcutCard" onClick={() => navigate("/coupons")}>
          <div className="DashShortcutIcon DashShortcutIcon--amber">
            <FiTag />
          </div>
          <div className="DashShortcutText">
            <h4>Promotional Coupons</h4>
            <p>Create discount campaigns and seasonal festive codes</p>
          </div>
          <FiArrowUpRight className="DashShortcutArrow" />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;