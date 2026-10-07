import React, { useEffect, useMemo, useRef, useState } from "react";
import "./WishlistMain.css";

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

const CartIcon = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
  </Icon>
);

const BellIcon = (p) => (
  <Icon {...p}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
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

const GridIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Icon>
);

const ListIcon = (p) => (
  <Icon {...p}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <circle cx="3.5" cy="6" r="1" />
    <circle cx="3.5" cy="12" r="1" />
    <circle cx="3.5" cy="18" r="1" />
  </Icon>
);

const HeartIcon = (p) => (
  <Icon {...p}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
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

const ArrowRightIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </Icon>
);

/* =========================================================
   DATA
========================================================= */

const initialWishlist = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=85",
    price: 350,
    oldPrice: 599,
    rating: 4.8,
    reviews: "2.4K",
    discount: 42,
    badge: "Bestseller",
    badgeType: "orange",
    stock: true,
    stockText: "Only 5 left!",
    low: true,
  },
  {
    id: 2,
    title: "Ikigai",
    author: "Héctor García",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=85",
    price: 299,
    oldPrice: 499,
    rating: 4.7,
    reviews: "1.2K",
    discount: 40,
    badge: "New Arrival",
    badgeType: "blue",
    stock: true,
    stockText: "Ready to ship",
  },
  {
    id: 3,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=500&q=85",
    price: 320,
    oldPrice: 550,
    rating: 4.6,
    reviews: "1.8K",
    discount: 42,
    badge: "Trending",
    badgeType: "green",
    stock: true,
    stockText: "Ready to ship",
  },
  {
    id: 4,
    title: "Deep Work",
    author: "Cal Newport",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=85",
    price: 310,
    oldPrice: 499,
    rating: 4.5,
    reviews: "900",
    discount: 38,
    badge: "Popular",
    badgeType: "purple",
    stock: false,
    stockText: "Get an alert when it returns",
  },
  {
    id: 5,
    title: "The Alchemist",
    author: "Paulo Coelho",
    image:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=500&q=85",
    price: 275,
    oldPrice: 450,
    rating: 4.8,
    reviews: "3.1K",
    discount: 39,
    badge: "Classic",
    badgeType: "orange",
    stock: true,
    stockText: "Ready to ship",
  },
  {
    id: 6,
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    image:
      "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=500&q=85",
    price: 299,
    oldPrice: 499,
    rating: 4.7,
    reviews: "4.2K",
    discount: 40,
    badge: "Bestseller",
    badgeType: "orange",
    stock: true,
    stockText: "Only 3 left!",
    low: true,
  },
  {
    id: 7,
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    image:
      "https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=500&q=85",
    price: 249,
    oldPrice: 399,
    rating: 4.6,
    reviews: "2.7K",
    discount: 38,
    badge: "Popular",
    badgeType: "purple",
    stock: true,
    stockText: "Ready to ship",
  },
  {
    id: 8,
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    image:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=85",
    price: 399,
    oldPrice: 650,
    rating: 4.8,
    reviews: "1.9K",
    discount: 39,
    badge: "Editor's Pick",
    badgeType: "green",
    stock: true,
    stockText: "Ready to ship",
  },
  {
    id: 9,
    title: "Can't Hurt Me",
    author: "David Goggins",
    image:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=500&q=85",
    price: 349,
    oldPrice: 599,
    rating: 4.9,
    reviews: "3.8K",
    discount: 42,
    badge: "Trending",
    badgeType: "green",
    stock: true,
    stockText: "Ready to ship",
  },
  {
    id: 10,
    title: "Atomic Focus",
    author: "Chris Bailey",
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=500&q=85",
    price: 289,
    oldPrice: 449,
    rating: 4.5,
    reviews: "870",
    discount: 36,
    badge: "New",
    badgeType: "blue",
    stock: true,
    stockText: "Ready to ship",
  },
  {
    id: 11,
    title: "The Power of Now",
    author: "Eckhart Tolle",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=85",
    price: 319,
    oldPrice: 499,
    rating: 4.7,
    reviews: "2.2K",
    discount: 36,
    badge: "Popular",
    badgeType: "purple",
    stock: false,
    stockText: "Get an alert when it returns",
  },
  {
    id: 12,
    title: "Do Epic Shit",
    author: "Ankur Warikoo",
    image:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=500&q=85",
    price: 299,
    oldPrice: 499,
    rating: 4.6,
    reviews: "1.6K",
    discount: 40,
    badge: "Indian Bestseller",
    badgeType: "orange",
    stock: true,
    stockText: "Ready to ship",
  },
];

const ITEMS_PER_PAGE = 8;

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

/* =========================================================
   COMPONENT
========================================================= */

const WishlistMain = () => {
  const [wishlistItems, setWishlistItems] = useState(initialWishlist);
  const [selectedItems, setSelectedItems] = useState([]);
  const [cartIds, setCartIds] = useState([]);
  const [notifyIds, setNotifyIds] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const contentRef = useRef(null);

  /* ---------- toast ---------- */

  const showToast = (message, undo = null) => {
    clearTimeout(toastTimer.current);
    setToast({ message, undo });
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  };

  const closeToast = () => {
    clearTimeout(toastTimer.current);
    setToast(null);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /* ---------- sorting & pagination ---------- */

  const sortedItems = useMemo(() => {
    const items = [...wishlistItems];

    switch (sortBy) {
      case "price-low":
        return items.sort((a, b) => a.price - b.price);
      case "price-high":
        return items.sort((a, b) => b.price - a.price);
      case "rating":
        return items.sort((a, b) => b.rating - a.rating);
      case "discount":
        return items.sort((a, b) => b.discount - a.discount);
      case "name":
        return items.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return items;
    }
  }, [wishlistItems, sortBy]);

  const totalPages = Math.max(Math.ceil(sortedItems.length / ITEMS_PER_PAGE), 1);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedItems.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedItems, currentPage]);

  const currentPageIds = currentItems.map((item) => item.id);

  const allCurrentSelected =
    currentItems.length > 0 &&
    currentPageIds.every((id) => selectedItems.includes(id));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  /* ---------- selection ---------- */

  const handleSingleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedItems((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedItems((prev) => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  /* ---------- remove ---------- */

  const handleRemove = (id) => {
    const index = wishlistItems.findIndex((item) => item.id === id);
    const product = wishlistItems[index];
    if (!product) return;

    const wasSelected = selectedItems.includes(id);

    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItems((prev) => prev.filter((x) => x !== id));

    showToast(`"${product.title}" removed from wishlist.`, () => {
      setWishlistItems((prev) => {
        const copy = [...prev];
        copy.splice(Math.min(index, copy.length), 0, product);
        return copy;
      });
      if (wasSelected) setSelectedItems((prev) => [...prev, id]);
    });
  };

  const handleRemoveSelected = () => {
    if (!selectedItems.length) return;

    const previousItems = wishlistItems;
    const previousSelected = selectedItems;
    const count = selectedItems.length;

    setWishlistItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
    setSelectedItems([]);

    showToast(
      `${count} ${count === 1 ? "book" : "books"} removed from wishlist.`,
      () => {
        setWishlistItems(previousItems);
        setSelectedItems(previousSelected);
      }
    );
  };

  /* ---------- cart & notify ---------- */

  const handleAddToCart = (product) => {
    if (cartIds.includes(product.id)) {
      showToast(`"${product.title}" is already in your cart.`);
      return;
    }

    setCartIds((prev) => [...prev, product.id]);
    showToast(`"${product.title}" added to cart.`);
  };

  const handleAddSelectedToCart = () => {
    const toAdd = wishlistItems.filter(
      (item) =>
        selectedItems.includes(item.id) &&
        item.stock &&
        !cartIds.includes(item.id)
    );

    if (!toAdd.length) {
      showToast("Select in-stock books that are not in your cart yet.");
      return;
    }

    setCartIds((prev) => [...prev, ...toAdd.map((item) => item.id)]);
    showToast(`${toAdd.length} ${toAdd.length === 1 ? "book" : "books"} added to cart.`);
  };

  const handleNotify = (product) => {
    if (notifyIds.includes(product.id)) {
      setNotifyIds((prev) => prev.filter((id) => id !== product.id));
      showToast(`Stock alert turned off for "${product.title}".`);
      return;
    }

    setNotifyIds((prev) => [...prev, product.id]);
    showToast(`We will notify you when "${product.title}" is back in stock.`);
  };

  /* ---------- pagination ---------- */

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);

    if (contentRef.current) {
      const top =
        contentRef.current.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  /* ---------- helpers ---------- */

  const renderStars = (rating) => {
    const full = Math.round(rating);
    return (
      <span className="WishlistMain__stars" aria-label={`Rated ${rating} out of 5`}>
        {"★".repeat(full)}
        <span className="WishlistMain__emptyStar">{"★".repeat(5 - full)}</span>
      </span>
    );
  };

  const renderActionButton = (product, variant) => {
    const prefix = variant === "card" ? "WishlistMain__card" : "WishlistMain__";

    if (product.stock) {
      const inCart = cartIds.includes(product.id);
      return (
        <button
          type="button"
          className={`${prefix}${variant === "card" ? "Cart" : "cartButton"} ${
            inCart ? "is-done" : ""
          }`}
          onClick={() => handleAddToCart(product)}
        >
          {inCart ? <CheckIcon size={19} /> : <CartIcon size={19} />}
          {inCart ? "Added to cart" : "Add to cart"}
        </button>
      );
    }

    const notified = notifyIds.includes(product.id);
    return (
      <button
        type="button"
        className={`${prefix}${variant === "card" ? "Notify" : "notifyButton"} ${
          notified ? "is-done" : ""
        }`}
        onClick={() => handleNotify(product)}
      >
        {notified ? <CheckIcon size={19} /> : <BellIcon size={19} />}
        {notified ? "We will notify you" : "Notify me"}
      </button>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <nav className="WishlistMain__pagination" aria-label="Pagination">
        <button
          type="button"
          className="WishlistMain__pageButton"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeftIcon size={20} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            type="button"
            key={page}
            className={`WishlistMain__pageButton ${
              currentPage === page ? "is-active" : ""
            }`}
            aria-current={currentPage === page ? "page" : undefined}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          className="WishlistMain__pageButton"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRightIcon size={20} />
        </button>
      </nav>
    );
  };

  const rangeStart = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, sortedItems.length);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="WishlistMain">
      <div className="WishlistMain__container" ref={contentRef}>
        {wishlistItems.length > 0 ? (
          <>
            {/* ===================== TOOLBAR ===================== */}

            <div className="WishlistMain__toolbar">
              <div className="WishlistMain__toolbarLeft">
                <label className="WishlistMain__selectAll">
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={handleSelectAll}
                  />
                  <span>
                    Select all
                    <em>
                      {wishlistItems.length}{" "}
                      {wishlistItems.length === 1 ? "book" : "books"}
                    </em>
                  </span>
                </label>

                <div className="WishlistMain__bulk">
                  <button
                    type="button"
                    className="WishlistMain__bulkCart"
                    disabled={!selectedItems.length}
                    onClick={handleAddSelectedToCart}
                  >
                    <CartIcon size={19} />
                    <span>Add selected to cart</span>
                  </button>

                  <button
                    type="button"
                    className="WishlistMain__removeSelected"
                    disabled={!selectedItems.length}
                    onClick={handleRemoveSelected}
                  >
                    <TrashIcon size={19} />
                    <span>Delete selected</span>
                    {selectedItems.length > 0 && (
                      <b>{selectedItems.length}</b>
                    )}
                  </button>
                </div>
              </div>

              <div className="WishlistMain__toolbarRight">
                <label className="WishlistMain__sort">
                  <span>Sort by</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="newest">Date added</option>
                    <option value="price-low">Price: low to high</option>
                    <option value="price-high">Price: high to low</option>
                    <option value="rating">Highest rated</option>
                    <option value="discount">Biggest discount</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </label>

                <div className="WishlistMain__viewSwitch" role="group" aria-label="View mode">
                  <button
                    type="button"
                    className={`WishlistMain__viewButton ${
                      viewMode === "grid" ? "is-active" : ""
                    }`}
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                  >
                    <GridIcon size={21} />
                  </button>

                  <button
                    type="button"
                    className={`WishlistMain__viewButton ${
                      viewMode === "list" ? "is-active" : ""
                    }`}
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    aria-pressed={viewMode === "list"}
                  >
                    <ListIcon size={21} />
                  </button>
                </div>
              </div>
            </div>

            {/* ===================== LIST VIEW ===================== */}

            {viewMode === "list" && (
              <div className="WishlistMain__listWrapper">
                <div className="WishlistMain__tableHeader">
                  <span>Product</span>
                  <span>Price</span>
                  <span>Stock status</span>
                  <span>Action</span>
                </div>

                <div className="WishlistMain__list">
                  {currentItems.map((product) => (
                    <article
                      className={`WishlistMain__listItem ${
                        selectedItems.includes(product.id) ? "is-selected" : ""
                      }`}
                      key={product.id}
                    >
                      <div className="WishlistMain__product">
                        <label
                          className="WishlistMain__checkbox"
                          aria-label={`Select ${product.title}`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(product.id)}
                            onChange={() => handleSingleSelect(product.id)}
                          />
                        </label>

                        <div className="WishlistMain__imageBox">
                          <img src={product.image} alt={product.title} loading="lazy" />
                        </div>

                        <div className="WishlistMain__productInfo">
                          <h3 title={product.title}>{product.title}</h3>
                          <p className="WishlistMain__author">by {product.author}</p>

                          <div className="WishlistMain__rating">
                            {renderStars(product.rating)}
                            <span>
                              {product.rating} ({product.reviews})
                            </span>
                          </div>

                          <span
                            className={`WishlistMain__badge WishlistMain__badge--${product.badgeType}`}
                          >
                            {product.badge}
                          </span>
                        </div>
                      </div>

                      <div className="WishlistMain__cell WishlistMain__price" data-label="Price">
                        <strong>{formatPrice(product.price)}</strong>
                        <div>
                          <del>{formatPrice(product.oldPrice)}</del>
                          <span>{product.discount}% off</span>
                        </div>
                      </div>

                      <div className="WishlistMain__cell WishlistMain__stock" data-label="Stock status">
                        <span
                          className={`WishlistMain__stockBadge ${
                            product.stock
                              ? "WishlistMain__stockBadge--available"
                              : "WishlistMain__stockBadge--out"
                          }`}
                        >
                          <i>
                            {product.stock ? <CheckIcon size={12} /> : <CloseIcon size={12} />}
                          </i>
                          {product.stock ? "In stock" : "Out of stock"}
                        </span>

                        <small
                          className={
                            product.low
                              ? "is-low"
                              : product.stock
                              ? ""
                              : "WishlistMain__notifyText"
                          }
                        >
                          {product.stockText}
                        </small>
                      </div>

                      <div className="WishlistMain__actions">
                        <button
                          type="button"
                          className="WishlistMain__delete"
                          onClick={() => handleRemove(product.id)}
                          aria-label={`Delete ${product.title} from wishlist`}
                          title="Delete"
                        >
                          <TrashIcon size={21} />
                          <span>Delete</span>
                        </button>

                        {renderActionButton(product, "list")}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* ===================== GRID VIEW ===================== */}

            {viewMode === "grid" && (
              <div className="WishlistMain__grid">
                {currentItems.map((product) => (
                  <article
                    className={`WishlistMain__card ${
                      selectedItems.includes(product.id) ? "is-selected" : ""
                    }`}
                    key={product.id}
                  >
                    <div className="WishlistMain__cardImage">
                      <label
                        className="WishlistMain__cardCheckbox"
                        aria-label={`Select ${product.title}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(product.id)}
                          onChange={() => handleSingleSelect(product.id)}
                        />
                      </label>

                      <button
                        type="button"
                        className="WishlistMain__cardRemove"
                        onClick={() => handleRemove(product.id)}
                        aria-label={`Delete ${product.title} from wishlist`}
                        title="Delete"
                      >
                        <TrashIcon size={19} />
                      </button>

                      <img src={product.image} alt={product.title} loading="lazy" />

                      <span
                        className={`WishlistMain__cardBadge WishlistMain__cardBadge--${product.badgeType}`}
                      >
                        {product.badge}
                      </span>
                    </div>

                    <div className="WishlistMain__cardContent">
                      <h3 title={product.title}>{product.title}</h3>
                      <p className="WishlistMain__cardAuthor">by {product.author}</p>

                      <div className="WishlistMain__cardRating">
                        {renderStars(product.rating)}
                        <span>
                          {product.rating} ({product.reviews})
                        </span>
                      </div>

                      <div className="WishlistMain__cardPrice">
                        <strong>{formatPrice(product.price)}</strong>
                        <del>{formatPrice(product.oldPrice)}</del>
                        <span>{product.discount}% off</span>
                      </div>

                      <div
                        className={`WishlistMain__cardStock ${
                          product.stock
                            ? product.low
                              ? "WishlistMain__cardStock--low"
                              : "WishlistMain__cardStock--available"
                            : "WishlistMain__cardStock--out"
                        }`}
                      >
                        <i>
                          {product.stock ? <CheckIcon size={13} /> : <CloseIcon size={13} />}
                        </i>
                        {product.stock ? product.stockText : "Currently unavailable"}
                      </div>

                      {renderActionButton(product, "card")}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* ===================== PAGINATION ===================== */}

            <div className="WishlistMain__bottom">
              <p>
                Showing <strong>{rangeStart}</strong> to <strong>{rangeEnd}</strong> of{" "}
                <strong>{sortedItems.length}</strong> books
              </p>

              {renderPagination()}
            </div>
          </>
        ) : (
          /* ===================== EMPTY ===================== */
          <div className="WishlistMain__empty">
            <div className="WishlistMain__emptyIcon">
              <HeartIcon size={48} />
            </div>

            <h2>Your wishlist is empty</h2>

            <p>
              You haven't saved any books yet. Explore the collection and tap
              the heart on any book to keep it here.
            </p>

            <button
              type="button"
              className="WishlistMain__shopButton"
              onClick={() => {
                window.location.href = "/shop";
              }}
            >
              Explore books
              <ArrowRightIcon size={20} />
            </button>
          </div>
        )}
      </div>

      {/* ===================== TOAST ===================== */}

      {toast && (
        <div className="WishlistMain__toast" role="status">
          <CheckIcon size={20} />
          <p>{toast.message}</p>

          {toast.undo && (
            <button
              type="button"
              className="WishlistMain__toastUndo"
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
            className="WishlistMain__toastClose"
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

export default WishlistMain;