import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useShopStore,
  addToCart,
  decrementCart,
  updateCartQty,
  toggleWishlist,
  syncWithCatalog,
} from "../ShopMain/useShopStore";
import { fetchAllCatalogBooks } from "../../api/booksService";
import { slugify } from "../ShopMain/ShopMain";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import CheckoutModal from "../CheckoutModal/CheckoutModal";
import AddressPickerModal from "../AddressPickerModal/AddressPickerModal";
import { fetchUserAddresses } from "../../api/addressService";
import "./AddToCartMain.css";

/* =========================================================
   ICONS (inline SVG – no extra packages needed)
========================================================= */

const Icon = ({ children, size = 20, fill = "none", ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

const TrashIcon = (p) => (
  <Icon {...p}>
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </Icon>
);

const HeartIcon = ({ filled, ...p }) => (
  <Icon fill={filled ? "currentColor" : "none"} {...p}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
  </Icon>
);

const BookmarkIcon = (p) => (
  <Icon {...p}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </Icon>
);

const LockIcon = (p) => (
  <Icon {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Icon>
);

const ArrowLeftIcon = (p) => (
  <Icon {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </Icon>
);

const ArrowRightIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </Icon>
);

const ChevronLeftIcon = (p) => (
  <Icon {...p}>
    <path d="M15 18l-6-6 6-6" />
  </Icon>
);

const ChevronRightIcon = (p) => (
  <Icon {...p}>
    <path d="M9 18l6-6-6-6" />
  </Icon>
);

const PlusIcon = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

const MinusIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12h14" />
  </Icon>
);

const CartIcon = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
  </Icon>
);

const TagIcon = (p) => (
  <Icon {...p}>
    <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7" cy="7" r="1.2" />
  </Icon>
);

const TruckIcon = (p) => (
  <Icon {...p}>
    <path d="M1 3h15v13H1z" />
    <path d="M16 8h4l3 3v5h-7z" />
    <circle cx="5.5" cy="18.5" r="2" />
    <circle cx="18.5" cy="18.5" r="2" />
  </Icon>
);

const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="M20 6L9 17l-5-5" />
  </Icon>
);

const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Icon>
);

const ShieldIcon = (p) => (
  <Icon {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </Icon>
);

const MapPinIcon = (p) => (
  <Icon {...p}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

const PackageIcon = (p) => (
  <Icon {...p}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </Icon>
);

/* =========================================================
   CONSTANTS & HELPERS
========================================================= */

const MAX_QTY = 10;

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

const getVisibleCount = () => {
  if (typeof window === "undefined") return 4;
  const width = window.innerWidth;
  if (width >= 1200) return 4;
  if (width >= 900) return 3;
  if (width >= 600) return 2;
  return 1;
};

/* =========================================================
   COMPONENT
========================================================= */

const AddToCartMain = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const { cart, wishlist } = useShopStore();
  const [catalogBooks, setCatalogBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Flipkart-style delivery address state
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const [unselectedIds, setUnselectedIds] = useState(new Set());
  const [savedForLaterIds, setSavedForLaterIds] = useState(() => {
    try {
      const raw = localStorage.getItem("likhani-saved-later");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState({ text: "", type: "" });
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const [recommendationStart, setRecommendationStart] = useState(0);
  const [visibleCount, setVisibleCount] = useState(getVisibleCount);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Sync savedForLater
  useEffect(() => {
    try {
      localStorage.setItem("likhani-saved-later", JSON.stringify(savedForLaterIds));
    } catch { }
  }, [savedForLaterIds]);

  // Load saved delivery addresses for logged in user
  useEffect(() => {
    if (currentUser) {
      let active = true;
      fetchUserAddresses().then((addrs) => {
        if (active && Array.isArray(addrs)) {
          setUserAddresses(addrs);
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0] || null;
          setSelectedAddress((prev) => prev || defaultAddr);
        }
      });
      return () => {
        active = false;
      };
    } else {
      setUserAddresses([]);
      setSelectedAddress(null);
    }
  }, [currentUser]);

  // Fetch catalog books
  useEffect(() => {
    let active = true;
    fetchAllCatalogBooks().then((books) => {
      if (active) {
        setCatalogBooks(books || []);
        setLoading(false);
        if (Array.isArray(books) && books.length > 0) {
          syncWithCatalog(books.map((b) => b.id));
        }
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Fetch active coupons from backend
  useEffect(() => {
    let isMounted = true;
    const fetchActiveCoupons = async () => {
      try {
        const res = await API.get("/coupons/active");
        if (isMounted && res.data?.success && Array.isArray(res.data.data)) {
          setAvailableCoupons(res.data.data);
        }
      } catch (err) {
        console.warn("Could not load active coupons:", err?.message);
      }
    };
    fetchActiveCoupons();
    return () => {
      isMounted = false;
    };
  }, []);

  // Derive cart items
  const cartItems = useMemo(() => {
    const bookMap = new Map(catalogBooks.map((b) => [String(b.id), b]));
    return Object.entries(cart)
      .map(([id, qty]) => {
        const book = bookMap.get(String(id));
        if (!book || qty <= 0) return null;
        return {
          ...book,
          quantity: qty,
          selected: !unselectedIds.has(String(id)),
        };
      })
      .filter(Boolean);
  }, [catalogBooks, cart, unselectedIds]);

  // Derive saved for later items
  const savedItems = useMemo(() => {
    const bookMap = new Map(catalogBooks.map((b) => [String(b.id), b]));
    return savedForLaterIds
      .map((id) => bookMap.get(String(id)))
      .filter(Boolean);
  }, [catalogBooks, savedForLaterIds]);

  // Derive recommendations from real books not in cart and not saved
  const recommendations = useMemo(() => {
    return catalogBooks
      .filter((b) => !cart[b.id] && !savedForLaterIds.includes(String(b.id)))
      .slice(0, 12);
  }, [catalogBooks, cart, savedForLaterIds]);

  /* ---------- responsive slider count ---------- */

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxStart = Math.max(recommendations.length - visibleCount, 0);

  useEffect(() => {
    setRecommendationStart((previous) => Math.min(previous, maxStart));
  }, [maxStart]);

  /* ---------- toast ---------- */

  const showToast = (message, undo = null) => {
    clearTimeout(toastTimer.current);
    setToast({ message, undo });
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const closeToast = () => {
    clearTimeout(toastTimer.current);
    setToast(null);
  };

  /* ---------- derived values ---------- */

  const selectedItems = useMemo(
    () => cartItems.filter((item) => item.selected),
    [cartItems]
  );

  const itemCount = useMemo(
    () => selectedItems.reduce((total, item) => total + item.quantity, 0),
    [selectedItems]
  );

  const subtotal = useMemo(
    () =>
      selectedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [selectedItems]
  );

  const originalTotal = useMemo(
    () =>
      selectedItems.reduce(
        (total, item) => total + (item.oldPrice || item.price) * item.quantity,
        0
      ),
    [selectedItems]
  );

  const productDiscount = Math.max(originalTotal - subtotal, 0);

  // Dynamic coupon discount based on backend validated coupon
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || !selectedItems.length) return 0;
    if (appliedCoupon.minimumPurchase && subtotal < appliedCoupon.minimumPurchase) {
      return 0;
    }
    return Math.min(
      Math.round((subtotal * appliedCoupon.discountPercent) / 100),
      subtotal
    );
  }, [appliedCoupon, subtotal, selectedItems.length]);

  const grandTotal = Math.max(subtotal - couponDiscount, 0);

  const totalSavings = productDiscount + couponDiscount;

  const allSelected =
    cartItems.length > 0 && cartItems.every((item) => item.selected);

  // Re-verify coupon minimum purchase when subtotal or items change
  useEffect(() => {
    if (appliedCoupon && selectedItems.length > 0) {
      if (appliedCoupon.minimumPurchase && subtotal < appliedCoupon.minimumPurchase) {
        setCouponMessage({
          text: `Coupon "${appliedCoupon.code}" requires minimum purchase of ₹${appliedCoupon.minimumPurchase} (add ₹${appliedCoupon.minimumPurchase - subtotal} more).`,
          type: "error",
        });
      } else {
        const currentDiscount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
        setCouponMessage({
          text: `Coupon "${appliedCoupon.code}" applied! You save ₹${currentDiscount.toLocaleString("en-IN")} (${appliedCoupon.discountPercent}% off).`,
          type: "success",
        });
      }
    }
  }, [subtotal, appliedCoupon, selectedItems.length]);

  /* ---------- quantity ---------- */

  const updateQuantity = (id, change) => {
    if (change > 0) {
      addToCart(id, change);
    } else {
      decrementCart(id, Math.abs(change));
    }
  };

  /* ---------- selection ---------- */

  const toggleSelected = (id) => {
    const strId = String(id);
    setUnselectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(strId)) next.delete(strId);
      else next.add(strId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setUnselectedIds(new Set(cartItems.map((item) => String(item.id))));
    } else {
      setUnselectedIds(new Set());
    }
  };

  /* ---------- delete ---------- */

  const deleteItem = (id) => {
    const product = cartItems.find((item) => String(item.id) === String(id));
    updateCartQty(id, 0);
    if (product) {
      showToast(`"${product.title}" removed from cart.`);
    }
  };

  const deleteSelected = () => {
    if (!selectedItems.length) return;
    const count = selectedItems.length;
    selectedItems.forEach((item) => updateCartQty(item.id, 0));
    showToast(`${count} ${count === 1 ? "item" : "items"} removed from cart.`);
  };

  /* ---------- save for later ---------- */

  const saveForLater = (id) => {
    const product = cartItems.find((item) => String(item.id) === String(id));
    updateCartQty(id, 0);
    setSavedForLaterIds((previous) => [
      ...previous.filter((x) => String(x) !== String(id)),
      String(id),
    ]);
    if (product) {
      showToast(`"${product.title}" saved for later.`);
    }
  };

  const moveSavedToCart = (id) => {
    const product = savedItems.find((item) => String(item.id) === String(id));
    setSavedForLaterIds((previous) => previous.filter((x) => String(x) !== String(id)));
    addToCart(id, 1);
    if (product) {
      showToast(`"${product.title}" moved to cart.`);
    }
  };

  const deleteSaved = (id) => {
    setSavedForLaterIds((previous) => previous.filter((item) => String(item) !== String(id)));
  };

  /* ---------- backend coupon validation & application ---------- */

  const applyCoupon = async (codeOverride = null) => {
    const targetCode = (typeof codeOverride === "string" ? codeOverride : coupon).trim().toUpperCase();

    if (!targetCode) {
      setCouponMessage({ text: "Please enter a coupon code.", type: "error" });
      return;
    }

    if (!selectedItems.length || subtotal <= 0) {
      setCouponMessage({ text: "Please select at least one item before applying a coupon.", type: "error" });
      return;
    }

    try {
      setCouponLoading(true);
      setCouponMessage({ text: "", type: "" });

      const res = await API.post("/coupons/validate", {
        code: targetCode,
        cartTotal: subtotal,
      });

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setAppliedCoupon(data);
        setCoupon(data.code);
        setCouponMessage({
          text: res.data.message || `Coupon "${data.code}" applied! You get ${data.discountPercent}% off.`,
          type: "success",
        });
        showToast(`Coupon "${data.code}" applied: ${data.discountPercent}% off!`);
      } else {
        setAppliedCoupon(null);
        setCouponMessage({
          text: res.data?.message || "Failed to apply coupon.",
          type: "error",
        });
      }
    } catch (err) {
      setAppliedCoupon(null);
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.status === 404
          ? `Coupon "${targetCode}" is invalid.`
          : "Could not validate coupon. Please try again.");
      setCouponMessage({ text: errorMsg, type: "error" });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    const code = appliedCoupon?.code || coupon;
    setCoupon("");
    setAppliedCoupon(null);
    setCouponMessage({ text: "", type: "" });
    if (code) {
      showToast(`Coupon "${code}" removed.`);
    }
  };

  /* ---------- checkout / navigation ---------- */

  const handleCheckout = () => {
    if (!selectedItems.length) {
      showToast("Select at least one book to checkout.");
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    setIsCheckoutModalOpen(true);
  };

  const handleOrderSuccess = (order) => {
    selectedItems.forEach((item) => updateCartQty(item.id, 0));
    setAppliedCoupon(null);
    setCoupon("");
    showToast(`Order #${order.receipt || order.id} placed successfully!`);
  };

  const continueShopping = () => {
    navigate("/shop");
  };

  /* ---------- recommendations ---------- */

  const toggleRecommendationLike = (id) => {
    toggleWishlist(id);
  };

  const addRecommendationToCart = (product) => {
    addToCart(product.id, 1);
    showToast(`"${product.title}" added to cart.`);
  };

  const nextRecommendations = () =>
    setRecommendationStart((previous) => Math.min(previous + 1, maxStart));

  const previousRecommendations = () =>
    setRecommendationStart((previous) => Math.max(previous - 1, 0));

  const visibleRecommendations = recommendations.slice(
    recommendationStart,
    recommendationStart + visibleCount
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="AddToCartMain">
      <div className="AddToCartMain__container">
        {loading ? (
          <div className="AddToCartMain__empty" style={{ minHeight: "360px" }}>
            <div className="AddToCartMain__emptyIcon" style={{ animation: "pulse 1.5s infinite" }}>
              <CartIcon size={44} />
            </div>
            <h2>Loading your cart...</h2>
            <p>Please wait a moment while we fetch your cart items.</p>
          </div>
        ) : cartItems.length > 0 ? (
          <div className="AddToCartMain__layout">
            {/* ===================== CART ===================== */}

            <div className="AddToCartMain__cartBox">
              {/* Flipkart-Style Delivery Address Bar */}
              <div className="AddToCartMain__deliveryBar">
                <div className="AddToCartMain__deliveryBarLeft">
                  <div className="AddToCartMain__deliveryPinIcon">
                    <MapPinIcon size={22} />
                  </div>
                  <div className="AddToCartMain__deliveryInfo">
                    {currentUser ? (
                      selectedAddress ? (
                        <>
                          <div className="AddToCartMain__deliveryTitleRow">
                            <span className="AddToCartMain__deliveryTo">Deliver to:</span>
                            <strong className="AddToCartMain__deliveryName">
                              {selectedAddress.name}, {selectedAddress.pincode}
                            </strong>
                            <span
                              className={`AddToCartMain__deliveryBadge AddToCartMain__deliveryBadge--${
                                selectedAddress.addressType?.toLowerCase() || "home"
                              }`}
                            >
                              {selectedAddress.addressType?.toUpperCase() || "HOME"}
                            </span>
                            {selectedAddress.isDefault && (
                              <span className="AddToCartMain__deliveryBadgeDefault">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="AddToCartMain__deliveryFullAddress">
                            {selectedAddress.street}
                            {selectedAddress.locality ? `, ${selectedAddress.locality}` : ""}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                          </p>
                        </>
                      ) : (
                        <div className="AddToCartMain__deliveryTitleRow">
                          <span className="AddToCartMain__deliveryTo">
                            No delivery address added yet. Add an address to proceed.
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="AddToCartMain__deliveryTitleRow">
                        <span className="AddToCartMain__deliveryTo">
                          Log in to select a delivery address and enjoy seamless checkout.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="AddToCartMain__deliveryBarRight">
                  {currentUser ? (
                    <div className="AddToCartMain__deliveryActions">
                      <Link
                        to="/orders"
                        className="AddToCartMain__ordersHeaderLink"
                        title="View your previous orders"
                      >
                        <PackageIcon size={16} />
                        <span>My Orders</span>
                      </Link>
                      <button
                        type="button"
                        className="AddToCartMain__changeAddressBtn"
                        onClick={() => {
                          if (userAddresses.length === 0) {
                            navigate("/addresses");
                          } else {
                            setIsAddressPickerOpen(true);
                          }
                        }}
                      >
                        {selectedAddress ? "Change" : "Add Address"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="AddToCartMain__changeAddressBtn"
                      onClick={() => navigate("/login", { state: { from: "/cart" } })}
                    >
                      Login
                    </button>
                  )}
                </div>
              </div>

              <div className="AddToCartMain__cartToolbar">
                <label className="AddToCartMain__selectAll">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                  <span>
                    Select all
                    <em>
                      {cartItems.length}{" "}
                      {cartItems.length === 1 ? "item" : "items"}
                    </em>
                  </span>
                </label>

                <button
                  type="button"
                  className="AddToCartMain__deleteSelected"
                  onClick={deleteSelected}
                  disabled={!selectedItems.length}
                >
                  <TrashIcon size={19} />
                  <span>Delete selected</span>
                </button>
              </div>

              <div className="AddToCartMain__cartHeader">
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Subtotal</span>
                <span>Action</span>
              </div>

              <div className="AddToCartMain__cartItems">
                {cartItems.map((item) => {
                  const bookSlug = slugify(item.title) || item.id;
                  const detailsUrl = `/shop/${bookSlug}`;

                  return (
                    <article
                      className={`AddToCartMain__cartItem ${item.selected ? "" : "is-unselected"
                        }`}
                      key={item.id}
                    >
                      {/* PRODUCT */}
                      <div className="AddToCartMain__product">
                        <label
                          className="AddToCartMain__checkbox"
                          aria-label={`Select ${item.title}`}
                        >
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleSelected(item.id)}
                          />
                        </label>

                        <Link to={detailsUrl} className="AddToCartMain__productImage">
                          <img src={item.image} alt={item.title} loading="lazy" />
                        </Link>

                        <div className="AddToCartMain__productInfo">
                          <Link to={detailsUrl} style={{ textDecoration: "none", color: "inherit" }}>
                            <h3 title={item.title}>{item.title}</h3>
                          </Link>
                          <p>by {item.author}</p>
                          {item.badge && (
                            <span className="AddToCartMain__badge">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* PRICE */}
                      <div
                        className="AddToCartMain__cell AddToCartMain__price"
                        data-label="Price"
                      >
                        <strong>{formatPrice(item.price)}</strong>
                        {item.oldPrice && item.oldPrice > item.price && (
                          <>
                            <del>{formatPrice(item.oldPrice)}</del>
                            {item.discount > 0 && <span>{item.discount}% off</span>}
                          </>
                        )}
                      </div>

                      {/* QUANTITY */}
                      <div
                        className="AddToCartMain__cell"
                        data-label="Quantity"
                      >
                        <div className="AddToCartMain__quantity">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            disabled={item.quantity <= 1}
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <MinusIcon size={16} />
                          </button>

                          <span aria-live="polite">{item.quantity}</span>

                          <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled={item.quantity >= MAX_QTY}
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <PlusIcon size={16} />
                          </button>
                        </div>
                      </div>

                      {/* SUBTOTAL */}
                      <div
                        className="AddToCartMain__cell AddToCartMain__subtotal"
                        data-label="Subtotal"
                      >
                        {formatPrice(item.price * item.quantity)}
                      </div>

                      {/* ACTIONS */}
                      <div className="AddToCartMain__actions">
                        <button
                          type="button"
                          className="AddToCartMain__save"
                          onClick={() => saveForLater(item.id)}
                        >
                          <span>
                            <BookmarkIcon size={20} />
                          </span>
                          <small>Save for later</small>
                        </button>

                        <button
                          type="button"
                          className="AddToCartMain__delete"
                          onClick={() => deleteItem(item.id)}
                        >
                          <span>
                            <TrashIcon size={20} />
                          </span>
                          <small>Delete</small>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* ================= ORDER SUMMARY ================= */}

            <aside className="AddToCartMain__summary">
              <div className="AddToCartMain__summaryHeader">
                <div className="AddToCartMain__summaryIcon">₹</div>
                <h2>Order summary</h2>
              </div>

              <div className="AddToCartMain__summaryRows">
                <div className="AddToCartMain__summaryItemsContainer">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="AddToCartMain__summaryItemRow">
                      <span className="AddToCartMain__summaryItemName" title={item.title}>
                        {item.title}
                        {item.quantity > 1 ? ` (×${item.quantity})` : ""}
                      </span>
                      <strong>
                        {formatPrice((item.oldPrice || item.price) * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div>
                  <span>Product discount</span>
                  <strong className="AddToCartMain__discount">
                    − {formatPrice(productDiscount)}
                  </strong>
                </div>

                {appliedCoupon && couponDiscount > 0 && (
                  <div>
                    <span>Coupon ({appliedCoupon.code})</span>
                    <strong className="AddToCartMain__discount">
                      − {formatPrice(couponDiscount)}
                    </strong>
                  </div>
                )}
              </div>

              <div className="AddToCartMain__total">
                <div>
                  <span>
                    Total <small>(incl. GST)</small>
                  </span>
                  <strong>{formatPrice(grandTotal)}</strong>
                </div>

                {totalSavings > 0 && (
                  <p className="AddToCartMain__savings">
                    You are saving {formatPrice(totalSavings)} on this order
                  </p>
                )}
              </div>

              <button
                type="button"
                className="AddToCartMain__checkout"
                onClick={handleCheckout}
                disabled={!selectedItems.length}
              >
                <LockIcon size={20} />
                Proceed to checkout
              </button>

              <button
                type="button"
                className="AddToCartMain__continue"
                onClick={continueShopping}
              >
                <ArrowLeftIcon size={20} />
                Continue shopping
              </button>

              {/* COUPON */}
              <div className="AddToCartMain__coupon">
                <div className="AddToCartMain__couponTitle">
                  <div>
                    <TagIcon size={20} />
                  </div>

                  <div>
                    <strong>Apply coupon code</strong>
                    <span>Save more on your order</span>
                  </div>
                </div>

                <div className="AddToCartMain__couponInput">
                  <input
                    type="text"
                    placeholder="Enter coupon code (e.g. BKPADUM3)"
                    value={coupon}
                    disabled={Boolean(appliedCoupon) || couponLoading}
                    onChange={(event) => {
                      setCoupon(event.target.value.toUpperCase());
                      if (couponMessage.text && !appliedCoupon) {
                        setCouponMessage({ text: "", type: "" });
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !appliedCoupon && !couponLoading) {
                        applyCoupon();
                      }
                    }}
                  />

                  {appliedCoupon ? (
                    <button
                      type="button"
                      className="is-remove"
                      onClick={removeCoupon}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => applyCoupon()}
                      disabled={couponLoading || !coupon.trim()}
                    >
                      {couponLoading ? "Checking..." : "Apply"}
                    </button>
                  )}
                </div>

                {couponMessage.text && (
                  <p
                    className={
                      couponMessage.type === "success"
                        ? "AddToCartMain__couponSuccess"
                        : "AddToCartMain__couponError"
                    }
                  >
                    {couponMessage.text}
                  </p>
                )}

                {/* AVAILABLE ACTIVE COUPONS FROM BACKEND */}
                {availableCoupons.length > 0 && !appliedCoupon && (
                  <div className="AddToCartMain__availableCoupons">
                    <small>Available coupons:</small>
                    <div className="AddToCartMain__couponPills">
                      {availableCoupons.slice(0, 3).map((c) => (
                        <button
                          key={c.id || c.code}
                          type="button"
                          className="AddToCartMain__couponPill"
                          title={`Valid till ${c.endDate}. Min purchase: ₹${c.minimumPurchase}`}
                          onClick={() => {
                            setCoupon(c.code);
                            applyCoupon(c.code);
                          }}
                        >
                          <strong>{c.code}</strong> ({c.discountPercent}% OFF)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="AddToCartMain__secure">
                <ShieldIcon size={19} />
                <span>Secure payments and easy returns</span>
              </div>
            </aside>
          </div>
        ) : (
          /* ===================== EMPTY ===================== */
          <div className="AddToCartMain__empty">
            <div className="AddToCartMain__emptyIcon">
              <CartIcon size={44} />
            </div>

            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any books to your cart yet.</p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "16px" }}>
              <Link
                to="/shop"
                className="AddToCartMain__shopButton"
                style={{ textDecoration: "none" }}
              >
                Explore books
                <ArrowRightIcon size={20} />
              </Link>
              {currentUser && (
                <Link
                  to="/orders"
                  className="AddToCartMain__shopButton"
                  style={{
                    textDecoration: "none",
                    background: "#f0f7fb",
                    color: "#12598f",
                    border: "1px solid #c2def0",
                  }}
                >
                  <PackageIcon size={18} />
                  View Past Orders
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ================= SAVED FOR LATER ================= */}

        {savedItems.length > 0 && (
          <section className="AddToCartMain__saved">
            <h2>
              Saved for later <span>({savedItems.length})</span>
            </h2>

            <div className="AddToCartMain__savedList">
              {savedItems.map((item) => {
                const bookSlug = slugify(item.title) || item.id;
                const detailsUrl = `/shop/${bookSlug}`;

                return (
                  <article className="AddToCartMain__savedItem" key={item.id}>
                    <Link to={detailsUrl} className="AddToCartMain__savedImage">
                      <img src={item.image} alt={item.title} loading="lazy" />
                    </Link>

                    <div className="AddToCartMain__savedInfo">
                      <Link to={detailsUrl} style={{ textDecoration: "none", color: "inherit" }}>
                        <h3>{item.title}</h3>
                      </Link>
                      <p>by {item.author}</p>

                      <div className="AddToCartMain__savedPrice">
                        <strong>{formatPrice(item.price)}</strong>
                        {item.oldPrice && item.oldPrice > item.price && (
                          <del>{formatPrice(item.oldPrice)}</del>
                        )}
                      </div>

                      <div className="AddToCartMain__savedActions">
                        <button
                          type="button"
                          className="AddToCartMain__moveToCart"
                          onClick={() => moveSavedToCart(item.id)}
                        >
                          <CartIcon size={18} />
                          Move to cart
                        </button>

                        <button
                          type="button"
                          className="AddToCartMain__savedDelete"
                          aria-label={`Delete ${item.title}`}
                          onClick={() => deleteSaved(item.id)}
                        >
                          <TrashIcon size={19} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= RECOMMENDATIONS ================= */}

        {recommendations.length > 0 && (
          <section className="AddToCartMain__recommendations">
            <div className="AddToCartMain__recommendationTop">
              <div>
                <span className="AddToCartMain__eyebrow">Curated for you</span>
                <h2>You may also like</h2>
              </div>

              <div className="AddToCartMain__recommendationControls">
                <button
                  type="button"
                  className="AddToCartMain__sliderArrow"
                  aria-label="Previous books"
                  onClick={previousRecommendations}
                  disabled={recommendationStart === 0}
                >
                  <ChevronLeftIcon size={22} />
                </button>

                <button
                  type="button"
                  className="AddToCartMain__sliderArrow"
                  aria-label="Next books"
                  onClick={nextRecommendations}
                  disabled={recommendationStart >= maxStart}
                >
                  <ChevronRightIcon size={22} />
                </button>

                <button
                  type="button"
                  className="AddToCartMain__viewAll"
                  onClick={continueShopping}
                >
                  View all
                  <ArrowRightIcon size={18} />
                </button>
              </div>
            </div>

            <div
              className="AddToCartMain__recommendationGrid"
              style={{ "--cols": visibleCount }}
            >
              {visibleRecommendations.map((product) => {
                const bookSlug = slugify(product.title) || product.id;
                const detailsUrl = `/shop/${bookSlug}`;
                const isLiked = wishlist.includes(String(product.id));
                const off =
                  product.discount ||
                  (product.oldPrice && product.oldPrice > product.price
                    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                    : 0);

                return (
                  <article
                    className="AddToCartMain__recommendationCard"
                    key={product.id}
                  >
                    <Link to={detailsUrl} className="AddToCartMain__recommendationImage">
                      <img src={product.image} alt={product.title} loading="lazy" />
                      {off > 0 && <span className="AddToCartMain__offTag">{off}% off</span>}
                    </Link>

                    <div className="AddToCartMain__recommendationInfo">
                      <Link to={detailsUrl} style={{ textDecoration: "none", color: "inherit" }}>
                        <h3 title={product.title}>{product.title}</h3>
                      </Link>
                      <p>{product.author}</p>

                      <div className="AddToCartMain__recommendationBottom">
                        <div>
                          <strong>{formatPrice(product.price)}</strong>
                          {product.oldPrice && product.oldPrice > product.price && (
                            <del>{formatPrice(product.oldPrice)}</del>
                          )}
                        </div>

                        <button
                          type="button"
                          aria-label={
                            isLiked
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                          className={isLiked ? "AddToCartMain__liked" : ""}
                          onClick={() => toggleRecommendationLike(product.id)}
                        >
                          <HeartIcon filled={isLiked} size={20} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="AddToCartMain__recommendationAdd"
                        onClick={() => addRecommendationToCart(product)}
                      >
                        <PlusIcon size={18} />
                        Add to cart
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* ===================== TOAST ===================== */}

      {toast && (
        <div className="AddToCartMain__toast" role="status">
          <CheckIcon size={20} />
          <p>{toast.message}</p>

          {toast.undo && (
            <button
              type="button"
              className="AddToCartMain__toastUndo"
              onClick={() => {
                toast.undo();
                closeToast();
              }}
            >
              Undo
            </button>
          )}

          <button
            type="button"
            className="AddToCartMain__toastClose"
            aria-label="Dismiss"
            onClick={closeToast}
          >
            <CloseIcon size={18} />
          </button>
        </div>
      )}

      {/* Flipkart-Style Address Picker Modal */}
      <AddressPickerModal
        isOpen={isAddressPickerOpen}
        onClose={() => setIsAddressPickerOpen(false)}
        addresses={userAddresses}
        selectedAddressId={selectedAddress?._id}
        onSelectAddress={(addr) => setSelectedAddress(addr)}
        onAddressListUpdated={(updated) => {
          setUserAddresses(updated);
          const current = updated.find((a) => a.isDefault) || updated[0];
          setSelectedAddress(current);
        }}
      />

      {/* Razorpay Checkout & Payment Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        items={selectedItems}
        subtotal={subtotal}
        discount={couponDiscount}
        couponCode={appliedCoupon?.code || ""}
        grandTotal={grandTotal}
        currentUser={currentUser}
        selectedAddress={selectedAddress}
        onOrderSuccess={handleOrderSuccess}
      />
    </section>
  );
};

export default AddToCartMain;