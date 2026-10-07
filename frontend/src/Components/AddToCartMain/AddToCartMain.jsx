import React, { useEffect, useMemo, useRef, useState } from "react";
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

/* =========================================================
   CONSTANTS & HELPERS
========================================================= */

const FREE_SHIPPING_LIMIT = 999;
const SHIPPING_FEE = 49;
const MAX_QTY = 10;
const COUPON_CODE = "BOOK10";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const getVisibleCount = () => {
  if (typeof window === "undefined") return 4;
  const width = window.innerWidth;
  if (width >= 1200) return 4;
  if (width >= 900) return 3;
  if (width >= 600) return 2;
  return 1;
};

const initialCart = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=85",
    price: 350,
    oldPrice: 599,
    discount: 42,
    rating: 4.8,
    reviews: "2.4K",
    badge: "Bestseller",
    quantity: 1,
    selected: true,
  },
  {
    id: 2,
    title: "Ikigai",
    author: "Héctor García",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=85",
    price: 299,
    oldPrice: 499,
    discount: 40,
    rating: 4.7,
    reviews: "1.2K",
    badge: "New Arrival",
    quantity: 2,
    selected: true,
  },
  {
    id: 3,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=500&q=85",
    price: 320,
    oldPrice: 550,
    discount: 42,
    rating: 4.6,
    reviews: "1.8K",
    badge: "Trending",
    quantity: 1,
    selected: true,
  },
];

const initialRecommendations = [
  {
    id: 101,
    title: "Deep Work",
    author: "Cal Newport",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=85",
    price: 310,
    oldPrice: 499,
    rating: 4.5,
    reviews: "900",
    liked: false,
  },
  {
    id: 102,
    title: "The Alchemist",
    author: "Paulo Coelho",
    image:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=85",
    price: 275,
    oldPrice: 450,
    rating: 4.8,
    reviews: "3.1K",
    liked: false,
  },
  {
    id: 103,
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    image:
      "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=400&q=85",
    price: 299,
    oldPrice: 499,
    rating: 4.7,
    reviews: "4.2K",
    liked: false,
  },
  {
    id: 104,
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    image:
      "https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=400&q=85",
    price: 249,
    oldPrice: 399,
    rating: 4.6,
    reviews: "2.7K",
    liked: false,
  },
  {
    id: 105,
    title: "Can't Hurt Me",
    author: "David Goggins",
    image:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=400&q=85",
    price: 349,
    oldPrice: 599,
    rating: 4.9,
    reviews: "3.8K",
    liked: false,
  },
  {
    id: 106,
    title: "The Power of Now",
    author: "Eckhart Tolle",
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=85",
    price: 319,
    oldPrice: 499,
    rating: 4.7,
    reviews: "2.2K",
    liked: false,
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const AddToCartMain = () => {
  const [cartItems, setCartItems] = useState(initialCart);
  const [savedItems, setSavedItems] = useState([]);
  const [recommendations, setRecommendations] = useState(
    initialRecommendations
  );

  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");

  const [recommendationStart, setRecommendationStart] = useState(0);
  const [visibleCount, setVisibleCount] = useState(getVisibleCount);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

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
        (total, item) => total + item.oldPrice * item.quantity,
        0
      ),
    [selectedItems]
  );

  const productDiscount = Math.max(originalTotal - subtotal, 0);
  const couponDiscount = couponApplied ? Math.round(subtotal * 0.1) : 0;

  const shipping =
    selectedItems.length === 0 || subtotal >= FREE_SHIPPING_LIMIT
      ? 0
      : SHIPPING_FEE;

  const grandTotal = Math.max(subtotal + shipping - couponDiscount, 0);

  const totalSavings = productDiscount + couponDiscount;

  const allSelected =
    cartItems.length > 0 && cartItems.every((item) => item.selected);

  const freeShippingLeft = Math.max(FREE_SHIPPING_LIMIT - subtotal, 0);
  const freeShippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_LIMIT) * 100,
    100
  );

  /* ---------- quantity ---------- */

  const updateQuantity = (id, change) => {
    setCartItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, Math.min(MAX_QTY, item.quantity + change)),
            }
          : item
      )
    );
  };

  /* ---------- selection ---------- */

  const toggleSelected = (id) => {
    setCartItems((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleSelectAll = () => {
    const nextValue = !allSelected;
    setCartItems((previous) =>
      previous.map((item) => ({ ...item, selected: nextValue }))
    );
  };

  /* ---------- delete ---------- */

  const deleteItem = (id) => {
    const index = cartItems.findIndex((item) => item.id === id);
    const product = cartItems[index];
    if (!product) return;

    setCartItems((previous) => previous.filter((item) => item.id !== id));

    showToast(`"${product.title}" deleted from cart.`, () =>
      setCartItems((previous) => {
        const copy = [...previous];
        copy.splice(Math.min(index, copy.length), 0, product);
        return copy;
      })
    );
  };

  const deleteSelected = () => {
    if (!selectedItems.length) return;

    const removed = cartItems.filter((item) => item.selected);
    const previousCart = cartItems;

    setCartItems((previous) => previous.filter((item) => !item.selected));

    showToast(
      `${removed.length} ${
        removed.length === 1 ? "item" : "items"
      } deleted from cart.`,
      () => setCartItems(previousCart)
    );
  };

  /* ---------- save for later ---------- */

  const saveForLater = (id) => {
    const product = cartItems.find((item) => item.id === id);
    if (!product) return;

    setCartItems((previous) => previous.filter((item) => item.id !== id));
    setSavedItems((previous) => [
      ...previous.filter((item) => item.id !== id),
      { ...product, selected: true },
    ]);

    showToast(`"${product.title}" saved for later.`);
  };

  const moveSavedToCart = (id) => {
    const product = savedItems.find((item) => item.id === id);
    if (!product) return;

    setSavedItems((previous) => previous.filter((item) => item.id !== id));
    setCartItems((previous) => [...previous, { ...product, selected: true }]);

    showToast(`"${product.title}" moved to cart.`);
  };

  const deleteSaved = (id) => {
    setSavedItems((previous) => previous.filter((item) => item.id !== id));
  };

  /* ---------- coupon ---------- */

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();

    if (!code) {
      setCouponApplied(false);
      setCouponMessage("Please enter a coupon code.");
      return;
    }

    if (!selectedItems.length) {
      setCouponApplied(false);
      setCouponMessage("Select at least one item to use a coupon.");
      return;
    }

    if (code === COUPON_CODE) {
      setCouponApplied(true);
      setCouponMessage("Coupon applied. You get 10% off.");
    } else {
      setCouponApplied(false);
      setCouponMessage(`Invalid coupon. Try ${COUPON_CODE}.`);
    }
  };

  const removeCoupon = () => {
    setCoupon("");
    setCouponApplied(false);
    setCouponMessage("");
  };

  /* ---------- checkout / navigation ---------- */

  const handleCheckout = () => {
    if (!selectedItems.length) {
      showToast("Select at least one book to checkout.");
      return;
    }

    showToast(
      `Proceeding to checkout with ${itemCount} ${
        itemCount === 1 ? "item" : "items"
      }. Total ${formatPrice(grandTotal)}.`
    );

    // Replace with your route, e.g. navigate("/checkout")
  };

  const continueShopping = () => {
    window.location.href = "/shop";
  };

  /* ---------- recommendations ---------- */

  const toggleRecommendationLike = (id) => {
    setRecommendations((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, liked: !item.liked } : item
      )
    );
  };

  const addRecommendationToCart = (product) => {
    setCartItems((previous) => {
      const existing = previous.find((item) => item.title === product.title);

      if (existing) {
        return previous.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, MAX_QTY),
                selected: true,
              }
            : item
        );
      }

      return [
        ...previous,
        {
          ...product,
          discount: Math.round(
            ((product.oldPrice - product.price) / product.oldPrice) * 100
          ),
          badge: "Recommended",
          quantity: 1,
          selected: true,
        },
      ];
    });

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

  /* ---------- stars ---------- */

  const renderStars = (rating) => {
    const fullStars = Math.round(rating);

    return (
      <span
        className="AddToCartMain__stars"
        aria-label={`Rated ${rating} out of 5`}
      >
        {"★".repeat(fullStars)}
        <span className="AddToCartMain__emptyStar">
          {"★".repeat(5 - fullStars)}
        </span>
      </span>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="AddToCartMain">
      <div className="AddToCartMain__container">
        {cartItems.length > 0 ? (
          <div className="AddToCartMain__layout">
            {/* ===================== CART ===================== */}

            <div className="AddToCartMain__cartBox">
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
                {cartItems.map((item) => (
                  <article
                    className={`AddToCartMain__cartItem ${
                      item.selected ? "" : "is-unselected"
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

                      <div className="AddToCartMain__productImage">
                        <img src={item.image} alt={item.title} loading="lazy" />
                      </div>

                      <div className="AddToCartMain__productInfo">
                        <h3 title={item.title}>{item.title}</h3>
                        <p>by {item.author}</p>

                        <div className="AddToCartMain__rating">
                          {renderStars(item.rating)}
                          <span>
                            {item.rating} ({item.reviews})
                          </span>
                        </div>

                        <span className="AddToCartMain__badge">
                          {item.badge}
                        </span>
                      </div>
                    </div>

                    {/* PRICE */}
                    <div
                      className="AddToCartMain__cell AddToCartMain__price"
                      data-label="Price"
                    >
                      <strong>{formatPrice(item.price)}</strong>
                      <del>{formatPrice(item.oldPrice)}</del>
                      <span>{item.discount}% off</span>
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
                ))}
              </div>
            </div>

            {/* ================= ORDER SUMMARY ================= */}

            <aside className="AddToCartMain__summary">
              <div className="AddToCartMain__summaryHeader">
                <div className="AddToCartMain__summaryIcon">₹</div>
                <h2>Order summary</h2>
              </div>

              {/* Free shipping progress */}
              {selectedItems.length > 0 && (
                <div className="AddToCartMain__shipping">
                  <div className="AddToCartMain__shippingText">
                    <TruckIcon size={20} />
                    {freeShippingLeft > 0 ? (
                      <p>
                        Add <strong>{formatPrice(freeShippingLeft)}</strong>{" "}
                        more for free shipping
                      </p>
                    ) : (
                      <p>
                        <strong>You get free shipping</strong> on this order
                      </p>
                    )}
                  </div>

                  <div className="AddToCartMain__progress">
                    <div style={{ width: `${freeShippingProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="AddToCartMain__summaryRows">
                <div>
                  <span>Items ({itemCount})</span>
                  <strong>{formatPrice(originalTotal)}</strong>
                </div>

                <div>
                  <span>Product discount</span>
                  <strong className="AddToCartMain__discount">
                    − {formatPrice(productDiscount)}
                  </strong>
                </div>

                {couponApplied && (
                  <div>
                    <span>Coupon ({COUPON_CODE})</span>
                    <strong className="AddToCartMain__discount">
                      − {formatPrice(couponDiscount)}
                    </strong>
                  </div>
                )}

                <div>
                  <span>Shipping</span>
                  <strong
                    className={shipping === 0 ? "AddToCartMain__free" : ""}
                  >
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </strong>
                </div>
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
                    placeholder="Enter coupon code"
                    value={coupon}
                    disabled={couponApplied}
                    onChange={(event) => setCoupon(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !couponApplied) {
                        applyCoupon();
                      }
                    }}
                  />

                  {couponApplied ? (
                    <button
                      type="button"
                      className="is-remove"
                      onClick={removeCoupon}
                    >
                      Remove
                    </button>
                  ) : (
                    <button type="button" onClick={applyCoupon}>
                      Apply
                    </button>
                  )}
                </div>

                {couponMessage && (
                  <p
                    className={
                      couponApplied
                        ? "AddToCartMain__couponSuccess"
                        : "AddToCartMain__couponError"
                    }
                  >
                    {couponMessage}
                  </p>
                )}

                <small>
                  Try <strong>{COUPON_CODE}</strong> for 10% extra discount.
                </small>
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

            <button
              type="button"
              className="AddToCartMain__shopButton"
              onClick={continueShopping}
            >
              Explore books
              <ArrowRightIcon size={20} />
            </button>
          </div>
        )}

        {/* ================= SAVED FOR LATER ================= */}

        {savedItems.length > 0 && (
          <section className="AddToCartMain__saved">
            <h2>
              Saved for later <span>({savedItems.length})</span>
            </h2>

            <div className="AddToCartMain__savedList">
              {savedItems.map((item) => (
                <article className="AddToCartMain__savedItem" key={item.id}>
                  <div className="AddToCartMain__savedImage">
                    <img src={item.image} alt={item.title} loading="lazy" />
                  </div>

                  <div className="AddToCartMain__savedInfo">
                    <h3>{item.title}</h3>
                    <p>by {item.author}</p>

                    <div className="AddToCartMain__savedPrice">
                      <strong>{formatPrice(item.price)}</strong>
                      <del>{formatPrice(item.oldPrice)}</del>
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
              ))}
            </div>
          </section>
        )}

        {/* ================= RECOMMENDATIONS ================= */}

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
              const off = Math.round(
                ((product.oldPrice - product.price) / product.oldPrice) * 100
              );

              return (
                <article
                  className="AddToCartMain__recommendationCard"
                  key={product.id}
                >
                  <div className="AddToCartMain__recommendationImage">
                    <img src={product.image} alt={product.title} loading="lazy" />
                    <span className="AddToCartMain__offTag">{off}% off</span>
                  </div>

                  <div className="AddToCartMain__recommendationInfo">
                    <h3 title={product.title}>{product.title}</h3>
                    <p>{product.author}</p>

                    <div className="AddToCartMain__recommendationRating">
                      {renderStars(product.rating)}
                      <span>
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    <div className="AddToCartMain__recommendationBottom">
                      <div>
                        <strong>{formatPrice(product.price)}</strong>
                        <del>{formatPrice(product.oldPrice)}</del>
                      </div>

                      <button
                        type="button"
                        aria-label={
                          product.liked
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                        className={product.liked ? "AddToCartMain__liked" : ""}
                        onClick={() => toggleRecommendationLike(product.id)}
                      >
                        <HeartIcon filled={product.liked} size={20} />
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
    </section>
  );
};

export default AddToCartMain;