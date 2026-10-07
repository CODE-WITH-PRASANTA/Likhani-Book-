import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./ShopMain.css";

import {
  FaSearch,
  FaStar,
  FaShoppingBasket,
  FaHeart,
  FaRegHeart,
  FaEye,
  FaThLarge,
  FaList,
  FaArrowUp,
  FaTimes,
  FaSlidersH,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaMinus,
  FaPlus,
  FaBookOpen,
} from "react-icons/fa";

/* =========================================================
   PRODUCT DATA
========================================================= */

const categoriesList = [
  "All Categories",
  "Arts & Photography",
  "Biographies & Memoirs",
  "Christian Books & Bibles",
  "Research & Publishing Guides",
  "Sports & Outdoors",
  "Food & Drink",
];

const categoryBlurbs = {
  "Arts & Photography":
    "A beautifully produced guide to creative practice, visual storytelling and the ideas behind great work. Perfect for students, makers and curious readers.",
  "Biographies & Memoirs":
    "Real stories, honest reflections and hard-won lessons from remarkable lives. An engaging read that stays with you long after the last page.",
  "Christian Books & Bibles":
    "A thoughtful companion for faith, reflection and daily devotion, written with clarity and a calm, encouraging voice.",
  "Research & Publishing Guides":
    "A clear, practical reference that breaks complex ideas into steps you can use right away, whether you study, write or build.",
  "Sports & Outdoors":
    "Practical advice, training insight and inspiring stories for people who love to move, explore and push their limits.",
  "Food & Drink":
    "Approachable recipes and kitchen know-how, with step-by-step guidance that makes cooking at home a pleasure.",
};

const imageUrl = (id) =>
  `https://images.unsplash.com/${id}?w=600&auto=format&fit=crop&q=80`;

/*
  Row format:
  [id, title, price, oldPrice, rating, starGroup, reviews, categoryIndex,
   hot, imageId, inStock, onSale, popularity, latestDate]
*/
const rawProducts = [
  [1, "Simple Things You Save BOOK", 499, null, 3.4, 3, 25, 1, true, "photo-1544947950-fa07a98d237f", true, true, 95, "2026-03-01"],
  [2, "How Deal With Very Bad BOOK", 649, null, 4.2, 4, 24, 2, false, "photo-1512820790803-83ca734da794", true, true, 88, "2026-02-15"],
  [3, "The Hidden Mystery Behind", 520, 699, 4.8, 5, 35, 1, false, "photo-1543002588-bfa74002ed7e", true, false, 92, "2026-01-20"],
  [4, "Qple GPad With Retina Display", 3499, 4200, 3.4, 3, 25, 3, false, "photo-1497633762265-9d179a990aa6", true, true, 70, "2026-04-10"],
  [5, "Flovely And Unicorn Erna", 380, null, 5.0, 5, 35, 4, false, "photo-1532012164546-f432f2e3777f", true, true, 85, "2026-04-01"],
  [6, "Castle In The Sky", 299, null, 4.5, 4, 24, 5, false, "photo-1516979187457-637abb4f9353", true, true, 99, "2026-04-14"],
  [7, "The Art of Creative Thinking", 1150, 1400, 4.9, 5, 35, 1, true, "photo-1495640388908-05fa85288e61", true, true, 97, "2026-03-25"],
  [8, "Mastering Modern UX Design", 1890, null, 4.1, 4, 24, 4, false, "photo-1507842229451-79b1be886a20", true, true, 91, "2026-04-05"],
  [9, "Mindset: The New Psychology", 750, null, 3.2, 3, 15, 2, false, "photo-1491841573634-28140fc7ced7", true, false, 80, "2026-02-28"],
  [10, "The Ultimate Guide to Nutrition", 550, 750, 2.3, 2, 2, 6, false, "photo-1490645935967-10de6ba17061", true, true, 76, "2026-01-15"],
  [11, "Extreme Outdoor Adventures", 2400, null, 4.7, 5, 35, 5, false, "photo-1519681393784-d120267933ba", false, false, 89, "2026-03-12"],
  [12, "Collector's Ancient Scriptures", 4500, 5200, 4.0, 4, 24, 3, true, "photo-1457369804613-52c61a468e7d", true, true, 94, "2026-04-18"],
  [13, "Quick Italian Pasta Cooking", 420, null, 1.8, 1, 1, 6, false, "photo-1551183053-bf91a1d81141", true, false, 65, "2026-02-10"],
  [14, "The Historical Chronicles", 2890, null, 3.5, 3, 15, 2, false, "photo-1463320726281-696a485928c7", true, true, 83, "2026-03-30"],
  [15, "Contemporary Architectural Forms", 1650, 1999, 4.6, 5, 35, 1, false, "photo-1486406146926-c627a92ad1ab", true, true, 96, "2026-04-08"],
  [16, "Philosophy of Living Well", 890, null, 2.8, 2, 2, 4, false, "photo-1524995997946-a1c2e315a42f", true, false, 74, "2026-01-29"],
  [17, "The Psychology of Money", 399, 499, 4.9, 5, 35, 2, true, "photo-1592496431122-2349e0fbc666", true, true, 98, "2026-04-12"],
  [18, "Atomic Habits & Daily Routines", 540, 650, 5.0, 5, 35, 4, false, "photo-1544716278-ca5e3f4abd8c", true, true, 99, "2026-03-18"],
  [19, "Street Food Culinary Secrets", 699, null, 4.2, 4, 24, 6, false, "photo-1555396273-367ea4eb4db5", true, true, 81, "2026-02-22"],
  [20, "Mountaineering Survival Handbook", 1350, 1700, 3.4, 3, 15, 5, false, "photo-1526778548025-fa2f459cd5c1", true, false, 79, "2026-03-05"],
  [21, "Vintage Cinema Posters Volume 1", 2100, null, 4.4, 4, 24, 1, true, "photo-1518709268805-4e9042af9f23", true, true, 93, "2026-04-09"],
  [22, "Ancient Faith and Medieval Saints", 1250, 1500, 3.8, 4, 24, 3, false, "photo-1476275466078-4007374efbbe", true, true, 84, "2026-01-18"],
  [23, "Minimalist Typography in Practice", 1590, null, 4.8, 5, 35, 1, false, "photo-1513475382585-d06e58bcb0e0", true, true, 90, "2026-04-15"],
  [24, "Life in the Shadows of Titans", 820, null, 3.1, 3, 15, 2, false, "photo-1497633762265-9d179a990aa6", true, false, 73, "2026-02-04"],
  [25, "Baking Artisan Bread at Home", 799, 999, 4.7, 5, 35, 6, false, "photo-1509440159596-0249088772ff", true, true, 92, "2026-03-22"],
  [26, "Marathon Training & Endurance", 1100, null, 4.3, 4, 24, 5, false, "photo-1461896836934-ffe607ba8211", true, true, 87, "2026-04-03"],
  [27, "Sacred Texts & Devotionals", 950, null, 4.9, 5, 35, 3, true, "photo-1505664194779-8beaceb93744", true, true, 95, "2026-03-14"],
  [28, "Scientific Research Methods 2026", 2800, 3200, 3.9, 4, 24, 4, false, "photo-1456513080510-7bf3a84b82f8", true, false, 86, "2026-02-18"],
  [29, "Color Theory for Visual Artists", 1450, null, 4.6, 5, 35, 1, false, "photo-1513364776144-60967b0f800f", true, true, 94, "2026-04-02"],
  [30, "Memoirs of an Himalayan Guide", 680, 850, 4.5, 4, 24, 2, false, "photo-1506744038136-46273834b3fb", true, true, 88, "2026-03-27"],
  [31, "Mastering French Pastries", 1199, null, 4.8, 5, 35, 6, true, "photo-1509440159596-0249088772ff", true, true, 96, "2026-04-11"],
  [32, "The Champion's Mindset in Sports", 890, null, 3.3, 3, 15, 5, false, "photo-1517649763962-0c623266ddc0", true, true, 82, "2026-02-14"],
].map(
  ([id, title, price, oldPrice, rating, starGroup, reviews, cat, hot, img, inStock, onSale, popularity, latestDate]) => ({
    id,
    title,
    price,
    oldPrice,
    rating,
    starGroup,
    reviews,
    category: categoriesList[cat],
    hot,
    image: imageUrl(img),
    inStock,
    onSale,
    popularity,
    latestDate,
    discount: oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0,
  })
);

const reviewOptions = [
  { stars: 5, count: 35 },
  { stars: 4, count: 24 },
  { stars: 3, count: 15 },
  { stars: 2, count: 2 },
  { stars: 1, count: 1 },
];

const sortOptions = [
  "Default Sorting",
  "Sort By Popularity",
  "Sort By Average Rating",
  "Sort By Latest",
  "Price: Low To High",
  "Price: High To Low",
];

const PRICE_MIN = 100;
const PRICE_MAX = 5000;
const ITEMS_PER_PAGE = 8;

const MOBILE_ITEMS_PER_PAGE = 4;

const formatPrice = (value) => `₹${value.toLocaleString("en-IN")}`;

const handleImageError = (event) => {
  event.currentTarget.style.visibility = "hidden";
  event.currentTarget.parentNode.classList.add("is-broken");
};

/* =========================================================
   SMALL PIECES
========================================================= */

const Stars = ({ rating }) => {
  const full = Math.round(rating);
  return (
    <span className="ShopMain__starRow" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <FaStar
          key={n}
          className={n <= full ? "is-filled" : "is-empty"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ShopMain = () => {
  /* ---------- filters ---------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [priceMin, setPriceMin] = useState(PRICE_MIN);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);

  /* ---------- ui ---------- */
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  /* ---------- shop state ---------- */
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState({});
  const [quickViewId, setQuickViewId] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const topRef = useRef(null);
  const closeBtnRef = useRef(null);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((total, qty) => total + qty, 0),
    [cart]
  );

  /* ---------- toast ---------- */

  const showToast = useCallback((message, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /* ---------- wishlist & cart ---------- */

  const toggleWishlist = (product) => {
    const exists = wishlist.includes(product.id);

    setWishlist((prev) =>
      exists ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );

    showToast(
      exists
        ? `"${product.title}" removed from wishlist.`
        : `"${product.title}" added to wishlist.`,
      exists ? "info" : "love"
    );
  };

  const addToCart = (product, qty = 1) => {
    if (!product.inStock) return;

    setCart((prev) => ({
      ...prev,
      [product.id]: Math.min((prev[product.id] || 0) + qty, 10),
    }));

    showToast(
      `${qty > 1 ? `${qty} × ` : ""}"${product.title}" added to cart.`
    );
  };

  /* ---------- filter handlers ---------- */

  const toggleReview = (stars) => {
    setSelectedReviews((prev) =>
      prev.includes(stars) ? prev.filter((s) => s !== stars) : [...prev, stars]
    );
  };

  const activeFilterCount =
    (selectedCategory !== "All Categories" ? 1 : 0) +
    (searchTerm.trim() ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (onSaleOnly ? 1 : 0) +
    (wishlistOnly ? 1 : 0) +
    (priceMin !== PRICE_MIN || priceMax !== PRICE_MAX ? 1 : 0) +
    (selectedReviews.length ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory("All Categories");
    setSearchTerm("");
    setInStockOnly(false);
    setOnSaleOnly(false);
    setWishlistOnly(false);
    setPriceMin(PRICE_MIN);
    setPriceMax(PRICE_MAX);
    setSelectedReviews([]);
    setSelectedSort(sortOptions[0]);
  };

  /* ---------- filtering & sorting ---------- */

  const filteredProducts = useMemo(() => {
    let result = [...rawProducts];

    const search = searchTerm.trim().toLowerCase();
    if (search) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search)
      );
    }

    if (selectedCategory !== "All Categories") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (inStockOnly) result = result.filter((p) => p.inStock);
    if (onSaleOnly) result = result.filter((p) => p.onSale);
    if (wishlistOnly) result = result.filter((p) => wishlist.includes(p.id));

    result = result.filter((p) => p.price >= priceMin && p.price <= priceMax);

    if (selectedReviews.length) {
      result = result.filter((p) => selectedReviews.includes(p.starGroup));
    }

    switch (selectedSort) {
      case "Sort By Popularity":
        result.sort((a, b) => b.popularity - a.popularity);
        break;
      case "Sort By Average Rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "Sort By Latest":
        result.sort((a, b) => new Date(b.latestDate) - new Date(a.latestDate));
        break;
      case "Price: Low To High":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Price: High To Low":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  }, [
    searchTerm,
    selectedCategory,
    inStockOnly,
    onSaleOnly,
    wishlistOnly,
    wishlist,
    priceMin,
    priceMax,
    selectedReviews,
    selectedSort,
  ]);

  /* ---------- pagination ---------- */

  const totalPages = Math.max(Math.ceil(filteredProducts.length / ITEMS_PER_PAGE), 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedCategory,
    inStockOnly,
    onSaleOnly,
    wishlistOnly,
    priceMin,
    priceMax,
    selectedReviews,
    selectedSort,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);

    if (topRef.current) {
      const top = topRef.current.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    const sorted = [...pages]
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);

    const withGaps = [];
    sorted.forEach((page, index) => {
      if (index > 0 && page - sorted[index - 1] > 1) withGaps.push("gap");
      withGaps.push(page);
    });
    return withGaps;
  }, [currentPage, totalPages]);

  /* ---------- quick view ---------- */

  const quickViewIndex = filteredProducts.findIndex((p) => p.id === quickViewId);
  const quickViewProduct =
    quickViewIndex >= 0
      ? filteredProducts[quickViewIndex]
      : rawProducts.find((p) => p.id === quickViewId) || null;

  const openQuickView = (product) => {
    setQuantity(1);
    setQuickViewId(product.id);
  };

  const closeQuickView = useCallback(() => setQuickViewId(null), []);

  const stepQuickView = useCallback(
    (direction) => {
      if (quickViewIndex < 0 || filteredProducts.length < 2) return;
      const next =
        (quickViewIndex + direction + filteredProducts.length) %
        filteredProducts.length;
      setQuantity(1);
      setQuickViewId(filteredProducts[next].id);
    },
    [quickViewIndex, filteredProducts]
  );

  useEffect(() => {
    if (!quickViewId) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") closeQuickView();
      if (event.key === "ArrowLeft") stepQuickView(-1);
      if (event.key === "ArrowRight") stepQuickView(1);
    };

    window.addEventListener("keydown", onKey);
    if (closeBtnRef.current) closeBtnRef.current.focus();

    return () => window.removeEventListener("keydown", onKey);
  }, [quickViewId, closeQuickView, stepQuickView]);

  /* ---------- drawer, scroll lock, scroll top ---------- */

  useEffect(() => {
    const locked = Boolean(quickViewId) || filtersOpen;
    const previous = document.body.style.overflow;
    document.body.style.overflow = locked ? "hidden" : previous || "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [quickViewId, filtersOpen]);

  useEffect(() => {
    if (!filtersOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && setFiltersOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- slider geometry ---------- */

  const sliderLeft = ((priceMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const sliderRight = 100 - ((priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const rangeStart = filteredProducts.length ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="ShopMain" aria-label="Shop catalog">
      <div className="ShopMain__main-layout">
        {/* ============ FILTER DRAWER OVERLAY (mobile) ============ */}
        <div
          className={`ShopMain__drawerOverlay ${filtersOpen ? "is-open" : ""}`}
          onClick={() => setFiltersOpen(false)}
        />

        {/* ===================== SIDEBAR ===================== */}
        <aside className={`ShopMain__sidebar ${filtersOpen ? "is-open" : ""}`}>
          <div className="ShopMain__drawerHeader">
            <h2>Filters</h2>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close filters"
            >
              <FaTimes />
            </button>
          </div>

          <div className="ShopMain__sidebarScroll">
            {/* Search */}
            <div className="ShopMain__sidebar-block">
              <h3 className="ShopMain__sidebar-heading">Search</h3>
              <div className="ShopMain__search-box">
                <input
                  type="text"
                  placeholder="Search books..."
                  aria-label="Search books"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm ? (
                  <button
                    type="button"
                    className="ShopMain__search-clear"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <FaTimes />
                  </button>
                ) : (
                  <FaSearch className="ShopMain__search-icon" aria-hidden="true" />
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="ShopMain__sidebar-block">
              <h3 className="ShopMain__sidebar-heading">Categories</h3>
              <div className="ShopMain__category-list">
                {categoriesList.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`ShopMain__category-btn ${
                      selectedCategory === category
                        ? "ShopMain__category-btn--active"
                        : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="ShopMain__sidebar-block">
              <h3 className="ShopMain__sidebar-heading">Availability</h3>

              <div className="ShopMain__switchList">
                {[
                  ["In stock only", inStockOnly, setInStockOnly],
                  ["On sale", onSaleOnly, setOnSaleOnly],
                  ["My wishlist only", wishlistOnly, setWishlistOnly],
                ].map(([label, value, setter]) => (
                  <label className="ShopMain__switch" key={label}>
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => setter((prev) => !prev)}
                    />
                    <i aria-hidden="true" />
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="ShopMain__sidebar-block">
              <h3 className="ShopMain__sidebar-heading">Filter by price</h3>

              <div className="ShopMain__price-slider">
                <div className="ShopMain__slider-bg" />
                <div
                  className="ShopMain__slider-highlight"
                  style={{ left: `${sliderLeft}%`, right: `${sliderRight}%` }}
                />
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step="50"
                  value={priceMin}
                  aria-label="Minimum price"
                  onChange={(e) =>
                    setPriceMin(Math.min(Number(e.target.value), priceMax - 100))
                  }
                  className="ShopMain__range-input"
                />
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step="50"
                  value={priceMax}
                  aria-label="Maximum price"
                  onChange={(e) =>
                    setPriceMax(Math.max(Number(e.target.value), priceMin + 100))
                  }
                  className="ShopMain__range-input"
                />
              </div>

              <div className="ShopMain__price-values">
                <span>{formatPrice(priceMin)}</span>
                <span className="ShopMain__price-dash" />
                <span>{formatPrice(priceMax)}</span>
              </div>
            </div>

            {/* Reviews */}
            <div className="ShopMain__sidebar-block">
              <h3 className="ShopMain__sidebar-heading">By review</h3>
              <div className="ShopMain__review-list">
                {reviewOptions.map((option) => (
                  <label key={option.stars} className="ShopMain__review-row">
                    <input
                      type="checkbox"
                      checked={selectedReviews.includes(option.stars)}
                      onChange={() => toggleReview(option.stars)}
                      className="ShopMain__review-checkbox"
                    />
                    <Stars rating={option.stars} />
                    <span className="ShopMain__review-count">({option.count})</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="ShopMain__drawerFooter">
            <button
              type="button"
              className="ShopMain__resetBtn"
              onClick={resetFilters}
              disabled={!activeFilterCount && selectedSort === sortOptions[0]}
            >
              Reset filters
            </button>

            <button
              type="button"
              className="ShopMain__applyBtn"
              onClick={() => setFiltersOpen(false)}
            >
              Show {filteredProducts.length} results
            </button>
          </div>
        </aside>

        {/* ===================== PRODUCTS ===================== */}
        <main className="ShopMain__products-content" ref={topRef}>
          {/* Top bar */}
          <div className="ShopMain__top-filter-bar">
            <div className="ShopMain__topLeft">
              <button
                type="button"
                className="ShopMain__filterToggle"
                onClick={() => setFiltersOpen(true)}
              >
                <FaSlidersH />
                Filters
                {activeFilterCount > 0 && <b>{activeFilterCount}</b>}
              </button>

              <span className="ShopMain__results-text">
                Showing <strong>{rangeStart}–{rangeEnd}</strong> of{" "}
                <strong>{filteredProducts.length}</strong> results
              </span>
            </div>

            <div className="ShopMain__top-controls">
              <button
                type="button"
                className={`ShopMain__chip ${wishlistOnly ? "is-active" : ""}`}
                onClick={() => setWishlistOnly((prev) => !prev)}
                aria-pressed={wishlistOnly}
                title="Show wishlist only"
              >
                <FaHeart />
                <span>Wishlist</span>
                <b>{wishlist.length}</b>
              </button>

              <div className="ShopMain__chip ShopMain__chip--static" title="Items in cart">
                <FaShoppingBasket />
                <span>Cart</span>
                <b>{cartCount}</b>
              </div>

              <label className="ShopMain__sort">
                <span className="ShopMain__srOnly">Sort products</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <div className="ShopMain__view-icons" role="group" aria-label="View mode">
                <button
                  type="button"
                  className={`ShopMain__view-toggle-btn ${
                    viewMode === "list" ? "ShopMain__view-toggle-btn--active" : ""
                  }`}
                  onClick={() => setViewMode("list")}
                  title="List view"
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                >
                  <FaList />
                </button>
                <button
                  type="button"
                  className={`ShopMain__view-toggle-btn ${
                    viewMode === "grid" ? "ShopMain__view-toggle-btn--active" : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                >
                  <FaThLarge />
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          <div
            className={`ShopMain__products-container ${
              viewMode === "list"
                ? "ShopMain__products-container--list"
                : "ShopMain__products-container--grid"
            }`}
          >
            {currentProducts.length === 0 ? (
              <div className="ShopMain__no-products">
                <div className="ShopMain__noIcon">
                  <FaBookOpen />
                </div>
                <h3>No books found</h3>
                <p>Try changing or clearing your filters to see more books.</p>
                <button type="button" className="ShopMain__reset-btn" onClick={resetFilters}>
                  Reset all filters
                </button>
              </div>
            ) : (
              currentProducts.map((product) => {
                const liked = wishlist.includes(product.id);
                const inCart = cart[product.id] || 0;

                return (
                  <article
                    key={product.id}
                    className={`ShopMain__product-card ${
                      viewMode === "list" ? "ShopMain__product-card--list" : ""
                    }`}
                  >
                    <div className="ShopMain__image-container">
                      <div className="ShopMain__badge-group">
                        {product.hot && (
                          <span className="ShopMain__badge ShopMain__badge--hot">Hot</span>
                        )}
                        {product.discount > 0 && (
                          <span className="ShopMain__badge ShopMain__badge--discount">
                            -{product.discount}%
                          </span>
                        )}
                        {!product.inStock && (
                          <span className="ShopMain__badge ShopMain__badge--out">
                            Sold out
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className={`ShopMain__heart ${liked ? "is-liked" : ""}`}
                        onClick={() => toggleWishlist(product)}
                        aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                        aria-pressed={liked}
                        title={liked ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        {liked ? <FaHeart /> : <FaRegHeart />}
                      </button>

                      <button
                        type="button"
                        className="ShopMain__imageButton"
                        onClick={() => openQuickView(product)}
                        aria-label={`Quick view ${product.title}`}
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          className="ShopMain__product-image"
                          loading="lazy"
                          onError={handleImageError}
                        />
                      </button>

                      <div className="ShopMain__hover-overlay">
                        <button
                          type="button"
                          className="ShopMain__quickBtn"
                          onClick={() => openQuickView(product)}
                        >
                          <FaEye />
                          Quick view
                        </button>
                      </div>
                    </div>

                    <div className="ShopMain__product-info">
                      <span className="ShopMain__product-category">{product.category}</span>

                      <h4 className="ShopMain__product-title" title={product.title}>
                        {product.title}
                      </h4>

                      <div className="ShopMain__rating">
                        <Stars rating={product.rating} />
                        <span>
                          {product.rating.toFixed(1)} ({product.reviews})
                        </span>
                      </div>

                      <div className="ShopMain__price-tag">
                        <span className="ShopMain__current-price">
                          {formatPrice(product.price)}
                        </span>
                        {product.oldPrice && (
                          <span className="ShopMain__old-price">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>

                      <div className="ShopMain__cardActions">
                        <button
                          type="button"
                          className={`ShopMain__add-cart-btn ${inCart ? "is-added" : ""}`}
                          onClick={() => addToCart(product)}
                          disabled={!product.inStock}
                        >
                          {inCart ? <FaCheck /> : <FaShoppingBasket />}
                          {!product.inStock
                            ? "Out of stock"
                            : inCart
                            ? `In cart (${inCart})`
                            : "Add to cart"}
                        </button>

                        <button
                          type="button"
                          className="ShopMain__eyeBtn"
                          onClick={() => openQuickView(product)}
                          aria-label={`View ${product.title}`}
                          title="Quick view"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="ShopMain__pagination" aria-label="Pagination">
              <button
                type="button"
                className="ShopMain__pagination-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
                <span>Previous</span>
              </button>

              <div className="ShopMain__pageNumbers">
                {pageNumbers.map((page, index) =>
                  page === "gap" ? (
                    <span key={`gap-${index}`} className="ShopMain__pageGap">
                      …
                    </span>
                  ) : (
                    <button
                      type="button"
                      key={page}
                      className={`ShopMain__pagination-box ${
                        currentPage === page ? "ShopMain__pagination-box--active" : ""
                      }`}
                      aria-current={currentPage === page ? "page" : undefined}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                className="ShopMain__pagination-btn ShopMain__pagination-btn--next"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span>Next</span>
                <FaChevronRight />
              </button>
            </nav>
          )}
        </main>
      </div>

      {/* ===================== QUICK VIEW MODAL ===================== */}
      {quickViewProduct && (
        <div
          className="ShopMain__modalBackdrop"
          onClick={closeQuickView}
          role="presentation"
        >
          <div
            className="ShopMain__modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${quickViewProduct.title} quick view`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="ShopMain__modalClose"
              onClick={closeQuickView}
              ref={closeBtnRef}
              aria-label="Close quick view"
            >
              <FaTimes />
            </button>

            <div className="ShopMain__modalImage">
              <div className="ShopMain__modalImageFrame">
                <img
                  key={quickViewProduct.id}
                  src={quickViewProduct.image.replace("w=600", "w=900")}
                  alt={quickViewProduct.title}
                  onError={handleImageError}
                />
              </div>

              <div className="ShopMain__modalBadges">
                {quickViewProduct.hot && (
                  <span className="ShopMain__badge ShopMain__badge--hot">Hot</span>
                )}
                {quickViewProduct.discount > 0 && (
                  <span className="ShopMain__badge ShopMain__badge--discount">
                    -{quickViewProduct.discount}%
                  </span>
                )}
              </div>

              {filteredProducts.length > 1 && quickViewIndex >= 0 && (
                <>
                  <button
                    type="button"
                    className="ShopMain__modalNav ShopMain__modalNav--prev"
                    onClick={() => stepQuickView(-1)}
                    aria-label="Previous book"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    type="button"
                    className="ShopMain__modalNav ShopMain__modalNav--next"
                    onClick={() => stepQuickView(1)}
                    aria-label="Next book"
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>

            <div className="ShopMain__modalBody">
              <span className="ShopMain__product-category">
                {quickViewProduct.category}
              </span>

              <h2>{quickViewProduct.title}</h2>

              <div className="ShopMain__rating ShopMain__rating--large">
                <Stars rating={quickViewProduct.rating} />
                <span>
                  {quickViewProduct.rating.toFixed(1)} ({quickViewProduct.reviews} reviews)
                </span>
              </div>

              <div className="ShopMain__modalPrice">
                <strong>{formatPrice(quickViewProduct.price)}</strong>
                {quickViewProduct.oldPrice && (
                  <>
                    <del>{formatPrice(quickViewProduct.oldPrice)}</del>
                    <span>Save {quickViewProduct.discount}%</span>
                  </>
                )}
              </div>

              <p className="ShopMain__modalText">
                {categoryBlurbs[quickViewProduct.category]}
              </p>

              <div
                className={`ShopMain__stockLine ${
                  quickViewProduct.inStock ? "is-in" : "is-out"
                }`}
              >
                <i>{quickViewProduct.inStock ? <FaCheck /> : <FaTimes />}</i>
                {quickViewProduct.inStock ? "In stock and ready to ship" : "Currently out of stock"}
              </div>

              <div className="ShopMain__modalActions">
                <div className="ShopMain__qty">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <FaMinus />
                  </button>
                  <span aria-live="polite">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    disabled={quantity >= 10}
                    aria-label="Increase quantity"
                  >
                    <FaPlus />
                  </button>
                </div>

                <button
                  type="button"
                  className="ShopMain__modalAdd"
                  onClick={() => addToCart(quickViewProduct, quantity)}
                  disabled={!quickViewProduct.inStock}
                >
                  <FaShoppingBasket />
                  Add to cart
                </button>

                <button
                  type="button"
                  className={`ShopMain__modalHeart ${
                    wishlist.includes(quickViewProduct.id) ? "is-liked" : ""
                  }`}
                  onClick={() => toggleWishlist(quickViewProduct)}
                  aria-label={
                    wishlist.includes(quickViewProduct.id)
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                  aria-pressed={wishlist.includes(quickViewProduct.id)}
                >
                  {wishlist.includes(quickViewProduct.id) ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>

              {cart[quickViewProduct.id] > 0 && (
                <p className="ShopMain__modalCartNote">
                  <FaCheck /> {cart[quickViewProduct.id]} in your cart
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TOAST ===================== */}
      {toast && (
        <div className={`ShopMain__cart-notification is-${toast.type}`} role="status">
          {toast.type === "love" ? <FaHeart /> : <FaCheck />}
          <p>{toast.message}</p>
        </div>
      )}

    </section>
  );
};

export default ShopMain;