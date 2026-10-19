import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API, { BASE_URL } from "../../api/axios";
import "./ShopMain.css";

import {
  FaSearch,
  FaShoppingBasket,
  FaHeart,
  FaRegHeart,
  FaArrowUp,
  FaArrowRight,
  FaThLarge,
  FaList,
  FaTimes,
  FaSlidersH,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaBookOpen,
} from "react-icons/fa";

import {
  SHOP_PATH,
  formatPrice,
} from "./shopData";
import { useShopStore, useToast, toggleWishlist, addToCart } from "./useShopStore";

const sortOptions = [
  "Default Sorting",
  "Sort By Popularity",
  "Sort By Latest",
  "Price: Low To High",
  "Price: High To Low",
];

const PRICE_MIN = 100;
const PRICE_MAX = 5000;
const ITEMS_PER_PAGE = 8;

const handleImageError = (event) => {
  event.currentTarget.style.visibility = "hidden";
  event.currentTarget.parentNode.classList.add("is-broken");
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ShopMain = () => {
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlSearch = searchParams.get("search");

  /* ---------- filters ---------- */
  const [searchTerm, setSearchTerm] = useState(urlSearch || "");
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || "All Categories");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [priceMin, setPriceMin] = useState(PRICE_MIN);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);

  /* ---------- backend books & categories ---------- */
  const [backendBooks, setBackendBooks] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchBackendData = async () => {
      try {
        const [booksRes, postingRes, catsRes] = await Promise.allSettled([
          API.get("/books", { params: { limit: 100, status: "Published" } }),
          API.get("/book-posting", { params: { limit: 100 } }),
          API.get("/categories"),
        ]);

        const rawList = [];
        if (booksRes.status === "fulfilled" && Array.isArray(booksRes.value?.data?.data)) {
          rawList.push(...booksRes.value.data.data);
        }
        if (postingRes.status === "fulfilled" && Array.isArray(postingRes.value?.data?.data)) {
          rawList.push(...postingRes.value.data.data);
        }

        const map = new Map();
        rawList.forEach((b) => {
          if (b && (b.status === "Published" || !b.status)) {
            const id = String(b._id || b.id);
            if (!map.has(id)) {
              map.set(id, {
                id,
                sku: b.isbn ? `ISBN-${b.isbn}` : `LKH-${id.slice(-4)}`,
                title: b.title,
                author: b.author || "Likhani Author",
                price: b.offerPrice || b.price,
                oldPrice: b.offerPrice && b.price > b.offerPrice ? b.price : null,
                category: b.category,
                hot: b.featured || false,
                image: b.image
                  ? (b.image.startsWith("http") || b.image.startsWith("data:")
                      ? b.image
                      : `${BASE_URL}${b.image.startsWith("/") ? "" : "/"}${b.image}`)
                  : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80",
                imageLarge: b.image
                  ? (b.image.startsWith("http") || b.image.startsWith("data:")
                      ? b.image
                      : `${BASE_URL}${b.image.startsWith("/") ? "" : "/"}${b.image}`)
                  : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1000&auto=format&fit=crop&q=80",
                inStock: b.stock > 0,
                onSale: Boolean(b.offerPrice && b.price > b.offerPrice),
                popularity: 90,
                latestDate: b.createdAt || new Date().toISOString(),
                description: b.description || "",
                discount:
                  b.offerPrice && b.price > b.offerPrice
                    ? Math.round(((b.price - b.offerPrice) / b.price) * 100)
                    : 0,
              });
            }
          }
        });

        if (isMounted) {
          setBackendBooks(Array.from(map.values()));
        }

        if (catsRes.status === "fulfilled" && catsRes.value?.data?.data && isMounted) {
          setDbCategories(catsRes.value.data.data.map((c) => c.name).filter(Boolean));
        }
      } catch (err) {
        console.error("Failed to fetch backend shop data:", err);
      }
    };
    fetchBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state if URL search params change
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
    if (urlSearch !== null && urlSearch !== undefined) {
      setSearchTerm(urlSearch);
    }
  }, [urlCategory, urlSearch]);

  const allProducts = useMemo(() => {
    return backendBooks;
  }, [backendBooks]);

  const displayCategories = useMemo(() => {
    const list = ["All Categories"];
    const seen = new Set(["all categories"]);
    backendBooks.forEach((b) => {
      if (b.category && b.category.trim()) {
        const trimmed = b.category.trim();
        const lower = trimmed.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push(trimmed);
        }
      }
    });
    return list;
  }, [backendBooks]);

  /* ---------- ui ---------- */
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  /* ---------- shop state (shared with details page) ---------- */
  const { wishlist, cart, cartCount } = useShopStore();
  const [toast, showToast] = useToast();
  const topRef = useRef(null);

  /* ---------- category count helper ---------- */
  const getCategoryCount = useCallback(
    (catName) => {
      if (catName === "All Categories") return allProducts.length;
      const target = catName
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]/g, "");
      return allProducts.filter((p) => {
        if (!p.category) return false;
        const pCat = p.category
          .toLowerCase()
          .trim()
          .replace(/&/g, "and")
          .replace(/[^a-z0-9]/g, "");
        return pCat === target || pCat.includes(target) || target.includes(pCat);
      }).length;
    },
    [allProducts]
  );

  /* ---------- wishlist & cart ---------- */

  const handleWishlist = (product) => {
    const added = toggleWishlist(product.id);
    showToast(
      added
        ? `"${product.title}" added to wishlist.`
        : `"${product.title}" removed from wishlist.`,
      added ? "love" : "info"
    );
  };

  const handleAddToCart = (product) => {
    if (!product.inStock) return;
    addToCart(product.id, 1);
    showToast(`"${product.title}" added to cart.`);
  };

  /* ---------- filter helpers ---------- */

  const activeFilterCount =
    (selectedCategory !== "All Categories" ? 1 : 0) +
    (searchTerm.trim() ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (onSaleOnly ? 1 : 0) +
    (wishlistOnly ? 1 : 0) +
    (priceMin !== PRICE_MIN || priceMax !== PRICE_MAX ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory("All Categories");
    setSearchTerm("");
    setInStockOnly(false);
    setOnSaleOnly(false);
    setWishlistOnly(false);
    setPriceMin(PRICE_MIN);
    setPriceMax(PRICE_MAX);
    setSelectedSort(sortOptions[0]);
  };

  /* ---------- filtering & sorting ---------- */

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    const search = searchTerm.trim().toLowerCase();
    if (search) {
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(search) ||
          p.category?.toLowerCase().includes(search)
      );
    }

    if (selectedCategory && selectedCategory !== "All Categories") {
      const targetCat = selectedCategory
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]/g, "");
      result = result.filter((p) => {
        if (!p.category) return false;
        const pCat = p.category
          .toLowerCase()
          .trim()
          .replace(/&/g, "and")
          .replace(/[^a-z0-9]/g, "");
        return pCat === targetCat || pCat.includes(targetCat) || targetCat.includes(pCat);
      });
    }

    if (inStockOnly) result = result.filter((p) => p.inStock);
    if (onSaleOnly) result = result.filter((p) => p.onSale);
    if (wishlistOnly) result = result.filter((p) => wishlist.includes(p.id));

    result = result.filter((p) => p.price >= priceMin && p.price <= priceMax);

    switch (selectedSort) {
      case "Sort By Popularity":
        result.sort((a, b) => b.popularity - a.popularity);
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

  /* ---------- drawer, scroll lock, scroll top ---------- */

  useEffect(() => {
    if (!filtersOpen) return undefined;

    document.body.style.overflow = "hidden";
    const onKey = (event) => event.key === "Escape" && setFiltersOpen(false);
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
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
      <div className="ShopMain__layout">
        {/* drawer overlay (mobile) */}
        <div
          className={`ShopMain__drawerOverlay ${filtersOpen ? "is-open" : ""}`}
          onClick={() => setFiltersOpen(false)}
        />

        {/* ===================== SIDEBAR ===================== */}
        <aside className={`ShopMain__sidebar ${filtersOpen ? "is-open" : ""}`}>
          <div className="ShopMain__drawerHeader">
            <h2>Filters</h2>
            <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
              <FaTimes />
            </button>
          </div>

          <div className="ShopMain__sidebarScroll">
            {/* Search */}
            <div className="ShopMain__block">
              <h3 className="ShopMain__blockTitle">Search</h3>
              <div className="ShopMain__search">
                <FaSearch className="ShopMain__searchIcon" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search books"
                  aria-label="Search books"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="ShopMain__searchClear"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="ShopMain__block">
              <h3 className="ShopMain__blockTitle">Categories</h3>
              <ul className="ShopMain__categoryList">
                {displayCategories.map((category) => {
                  const active =
                    selectedCategory?.toLowerCase().trim() ===
                    category.toLowerCase().trim();
                  return (
                    <li key={category}>
                      <button
                        type="button"
                        className={`ShopMain__categoryBtn ${active ? "is-active" : ""}`}
                        onClick={() => setSelectedCategory(category)}
                        aria-pressed={active}
                      >
                        <span className="ShopMain__categoryName">{category}</span>
                        <span className="ShopMain__categoryCount">
                          {getCategoryCount(category)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Availability */}
            <div className="ShopMain__block">
              <h3 className="ShopMain__blockTitle">Availability</h3>
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
            <div className="ShopMain__block">
              <h3 className="ShopMain__blockTitle">Price range</h3>

              <div className="ShopMain__priceSlider">
                <div className="ShopMain__sliderBg" />
                <div
                  className="ShopMain__sliderFill"
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
                  className="ShopMain__rangeInput"
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
                  className="ShopMain__rangeInput"
                />
              </div>

              <div className="ShopMain__priceValues">
                <span>{formatPrice(priceMin)}</span>
                <i aria-hidden="true" />
                <span>{formatPrice(priceMax)}</span>
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
              Reset
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
        <main className="ShopMain__content" ref={topRef}>
          {/* Top bar */}
          <div className="ShopMain__topBar">
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

              <span className="ShopMain__results">
                Showing <strong>{rangeStart}–{rangeEnd}</strong> of{" "}
                <strong>{filteredProducts.length}</strong> books
              </span>
            </div>

            <div className="ShopMain__topControls">
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
                <select value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}>
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <div className="ShopMain__viewIcons" role="group" aria-label="View mode">
                <button
                  type="button"
                  className={viewMode === "list" ? "is-active" : ""}
                  onClick={() => setViewMode("list")}
                  title="List view"
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                >
                  <FaList />
                </button>
                <button
                  type="button"
                  className={viewMode === "grid" ? "is-active" : ""}
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
            className={`ShopMain__products ${
              viewMode === "list" ? "ShopMain__products--list" : "ShopMain__products--grid"
            }`}
          >
            {currentProducts.length === 0 ? (
              <div className="ShopMain__empty">
                <div className="ShopMain__emptyIcon">
                  <FaBookOpen />
                </div>
                <h3>No books found</h3>
                <p>Try changing or clearing your filters to see more books.</p>
                <button type="button" className="ShopMain__emptyBtn" onClick={resetFilters}>
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
                    className={`ShopMain__card ${viewMode === "list" ? "is-list" : ""}`}
                  >
                    {/* Cover */}
                    <div className="ShopMain__media">
                      <div className="ShopMain__badges">
                        {product.hot && (
                          <span className="ShopMain__badge ShopMain__badge--hot">Bestseller</span>
                        )}
                        {product.discount > 0 && (
                          <span className="ShopMain__badge ShopMain__badge--sale">
                            -{product.discount}%
                          </span>
                        )}
                        {!product.inStock && (
                          <span className="ShopMain__badge ShopMain__badge--out">Sold out</span>
                        )}
                      </div>

                      <button
                        type="button"
                        className={`ShopMain__heart ${liked ? "is-liked" : ""}`}
                        onClick={() => handleWishlist(product)}
                        aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                        aria-pressed={liked}
                      >
                        {liked ? <FaHeart /> : <FaRegHeart />}
                      </button>

                      <div className="ShopMain__cover">
                        <img
                          src={product.image}
                          alt=""
                          loading="lazy"
                          onError={handleImageError}
                        />
                      </div>

                      <span className="ShopMain__viewHint">
                        View details <FaArrowRight />
                      </span>
                    </div>

                    {/* Info */}
                    <div className="ShopMain__info">
                      <span className="ShopMain__category">{product.category}</span>

                      <h3 className="ShopMain__title">
                        <Link
                          to={`${SHOP_PATH}/${product.id}`}
                          className="ShopMain__titleLink"
                        >
                          {product.title}
                        </Link>
                      </h3>

                      <p className="ShopMain__excerpt">{product.description}</p>

                      <div className="ShopMain__priceRow">
                        <span className="ShopMain__price">{formatPrice(product.price)}</span>
                        {product.oldPrice && (
                          <span className="ShopMain__oldPrice">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className={`ShopMain__addBtn ${inCart ? "is-added" : ""}`}
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                      >
                        {inCart ? <FaCheck /> : <FaShoppingBasket />}
                        {!product.inStock
                          ? "Out of stock"
                          : inCart
                          ? `In cart (${inCart})`
                          : "Add to cart"}
                      </button>
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
                className="ShopMain__pageBtn"
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
                      className={`ShopMain__pageBox ${currentPage === page ? "is-active" : ""}`}
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
                className="ShopMain__pageBtn ShopMain__pageBtn--next"
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

      {/* Scroll to top */}
      <button
        type="button"
        className={`ShopMain__scrollTop ${showScrollTop ? "is-visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        <FaArrowUp />
      </button>

      {/* Toast */}
      {toast && (
        <div className={`ShopMain__toast is-${toast.type}`} role="status">
          {toast.type === "love" ? <FaHeart /> : <FaCheck />}
          <p>{toast.message}</p>
        </div>
      )}
    </section>
  );
};

export default ShopMain;