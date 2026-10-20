import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShoppingBasket,
  FaArrowRight,
  FaCheck,
  FaFire,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./BookleBook.css";
import { fetchTopSellingBooks, fetchAllCatalogBooks } from "../../api/booksService";
import { addToCart as addShopToCart, useShopStore } from "../ShopMain/useShopStore";

const FALLBACK_PRODUCTS = [
  {
    id: "p1",
    category: "Design Low Book",
    title: "Flovely And Unicom Erna",
    price: 30,
    originalPrice: 39.99,
    author: "Albert",
    badge: null,
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "p2",
    category: "Design Low Book",
    title: "Qple GPad With Retinay Sispla",
    price: 30,
    originalPrice: 39.99,
    author: "Wilcon",
    badge: "Hot",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "p3",
    category: "Design Low Book",
    title: "Simple Things You To Save BOOK",
    price: 30,
    originalPrice: 39.99,
    author: "Wilcon",
    badge: null,
    image:
      "https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "p4",
    category: "Design Low Book",
    title: "How Deal With Very Bad BOOK",
    price: 30,
    originalPrice: 39.99,
    author: "Esther",
    badge: "-30%",
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=85",
  },
];

const BookleBook = () => {
  const navigate = useNavigate();
  useShopStore(); // subscribe to shop store updates

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef(null);
  const addedTimersRef = useRef({});

  useEffect(() => {
    let isMounted = true;
    const loadRealBooks = async () => {
      try {
        setLoading(true);
        // 1. Fetch top selling books first
        const topResult = await fetchTopSellingBooks(10);
        let list = Array.isArray(topResult?.books) ? [...topResult.books] : [];

        // Deduplicate books by title so visitors always see distinct books
        const uniqueList = [];
        const seenTitles = new Set();
        for (const item of list) {
          const key = (item.title || "").trim().toLowerCase();
          if (key && !seenTitles.has(key)) {
            seenTitles.add(key);
            uniqueList.push(item);
          }
        }
        list = uniqueList;

        // 2. If fewer than 4 books, supplement with catalog books from database
        if (list.length < 4) {
          const catalog = await fetchAllCatalogBooks();
          if (Array.isArray(catalog) && catalog.length > 0) {
            catalog.forEach((item) => {
              const key = (item.title || "").trim().toLowerCase();
              if (key && !seenTitles.has(key)) {
                seenTitles.add(key);
                list.push(item);
              }
            });
          }
        }

        if (isMounted) {
          if (list.length > 0) {
            // Keep the top 4 real books to maintain the clean 4-card shelf layout
            setBooks(list.slice(0, 4));
          } else {
            setBooks(FALLBACK_PRODUCTS);
          }
        }
      } catch (err) {
        console.error("Failed to load real books for BookleBook:", err);
        if (isMounted) setBooks(FALLBACK_PRODUCTS);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRealBooks();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }

      Object.values(addedTimersRef.current).forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, []);

  // Ensure currentIndex stays within bounds if books change
  useEffect(() => {
    if (books.length > 0 && currentIndex >= books.length) {
      setCurrentIndex(0);
    }
  }, [books.length, currentIndex]);

  const showToast = (message) => {
    setToastMessage(message);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    if (!product || !product.id) return;

    addShopToCart(product.id, 1);

    setAddedItems((prev) => ({
      ...prev,
      [product.id]: true,
    }));

    showToast(`"${product.title}" added to your cart!`);

    if (addedTimersRef.current[product.id]) {
      window.clearTimeout(addedTimersRef.current[product.id]);
    }

    addedTimersRef.current[product.id] = window.setTimeout(() => {
      setAddedItems((prev) => ({
        ...prev,
        [product.id]: false,
      }));

      delete addedTimersRef.current[product.id];
    }, 2000);
  };

  const nextSlide = () => {
    if (!books.length) return;
    setCurrentIndex((prev) =>
      prev >= books.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    if (!books.length) return;
    setCurrentIndex((prev) =>
      prev <= 0 ? books.length - 1 : prev - 1
    );
  };

  const handleExplore = () => {
    navigate("/shop");
  };

  const handleOpenBook = (id) => {
    if (id) {
      navigate(`/book/${id}`);
    }
  };

  return (
    <section className="bookle-book">
      {toastMessage && (
        <div
          className="bookle-book__toast"
          role="status"
          aria-live="polite"
        >
          <FaCheck />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bookle-book__wrapper">
        {/* SECTION HEADER */}
        <div className="bookle-book__header">
          <div className="bookle-book__header-copy">
            <span className="bookle-book__eyebrow">
              CURATED FOR READERS
            </span>

            <h2 className="bookle-book__heading">
              Bookle Top Books
            </h2>

            <p className="bookle-book__subheading">
              This week's picks from the shelf
            </p>
          </div>

          <button
            type="button"
            className="bookle-book__explore-btn"
            onClick={handleExplore}
          >
            Explore more
            <FaArrowRight className="bookle-book__explore-icon" />
          </button>
        </div>

        {/* MAIN GRID AND BANNER */}
        <div className="bookle-book__main-grid">
          <div
            className="bookle-book__products-container"
            id="bookle-book-products"
          >
            <div className="bookle-book__products-grid">
              {books.map((product, index) => {
                const isAdded = Boolean(addedItems[product.id]);
                const isActiveMobile = index === currentIndex;

                const displayBadge =
                  product.topSellingBadge ||
                  (product.isHighestSelling
                    ? "Top Selling"
                    : product.discount > 0
                    ? `-${product.discount}%`
                    : product.badge || null);

                const isHot =
                  displayBadge === "Hot" ||
                  displayBadge === "Top Selling" ||
                  displayBadge === "Best Seller";

                const formattedPrice = Number(product.price || 0).toFixed(2);
                const formattedOriginalPrice =
                  product.originalPrice && product.originalPrice > product.price
                    ? Number(product.originalPrice).toFixed(2)
                    : null;

                const authorName = product.author || "Lekhani Author";
                const authorInitial =
                  authorName.trim().charAt(0).toUpperCase() || "L";

                return (
                  <article
                    className={`bookle-book__card ${
                      isActiveMobile
                        ? "bookle-book__card--active-mobile"
                        : ""
                    }`}
                    key={product.id || index}
                  >
                    <div
                      className="bookle-book__media"
                      onClick={() => handleOpenBook(product.id)}
                      style={{ cursor: "pointer" }}
                      title="View book details"
                    >
                      {displayBadge && (
                        <span
                          className={`bookle-book__badge ${
                            isHot
                              ? "bookle-book__badge--hot"
                              : "bookle-book__badge--discount"
                          }`}
                        >
                          {isHot && (
                            <FaFire className="bookle-book__badge-icon" />
                          )}
                          {displayBadge}
                        </span>
                      )}

                      <div className="bookle-book__image-frame">
                        <img
                          src={
                            product.image ||
                            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80"
                          }
                          alt={product.title}
                          className="bookle-book__img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80";
                          }}
                        />
                      </div>
                    </div>

                    <div className="bookle-book__body">
                      <span className="bookle-book__category">
                        {product.category || product.genre || "Book"}
                      </span>

                      <h3
                        className="bookle-book__title"
                        title={product.title}
                        onClick={() => handleOpenBook(product.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {product.title}
                      </h3>

                      <div className="bookle-book__price-row">
                        <span className="bookle-book__current-price">
                          ₹{formattedPrice}
                        </span>

                        {formattedOriginalPrice && (
                          <span className="bookle-book__original-price">
                            ₹{formattedOriginalPrice}
                          </span>
                        )}
                      </div>

                      {/* AUTHOR DETAILS */}
                      <div className="bookle-book__meta-row">
                        <div className="bookle-book__author-info">
                          <span className="bookle-book__avatar">
                            {authorInitial}
                          </span>

                          <span className="bookle-book__author-text">
                            {authorName}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`bookle-book__cart-btn ${
                          isAdded
                            ? "bookle-book__cart-btn--added"
                            : ""
                        }`}
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={isAdded}
                      >
                        {isAdded ? (
                          <>
                            <FaCheck className="bookle-book__btn-icon" />
                            Added to cart
                          </>
                        ) : (
                          <>
                            <FaShoppingBasket className="bookle-book__btn-icon" />
                            Add to cart
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* MOBILE PAGINATION */}
            {books.length > 1 && (
              <div
                className="bookle-book__mobile-nav"
                aria-label="Book navigation"
              >
                <button
                  type="button"
                  className="bookle-book__nav-arrow"
                  onClick={prevSlide}
                  aria-label="Previous book"
                >
                  <FaChevronLeft />
                </button>

                <div className="bookle-book__dots">
                  {books.map((product, index) => (
                    <button
                      key={product.id || index}
                      type="button"
                      className={`bookle-book__dot ${
                        currentIndex === index
                          ? "bookle-book__dot--active"
                          : ""
                      }`}
                      onClick={() => setCurrentIndex(index)}
                      aria-label={`Go to slide ${index + 1}`}
                      aria-current={
                        currentIndex === index ? "true" : undefined
                      }
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="bookle-book__nav-arrow"
                  onClick={nextSlide}
                  aria-label="Next book"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR PROMO */}
          <aside className="bookle-book__sidebar-banner">
            <div className="bookle-book__sidebar-content">
              <span className="bookle-book__sidebar-eyebrow">
                A LITTLE SOMETHING FOR YOU
              </span>

              <h3 className="bookle-book__sidebar-title">
                Find your next book
              </h3>

              <p className="bookle-book__sidebar-subtitle">
                Get 25% off your first order
              </p>

              <button
                type="button"
                className="bookle-book__btn-brass"
                onClick={handleExplore}
              >
                <span>Shop now</span>
                <FaArrowRight className="bookle-book__btn-brass-icon" />
              </button>
            </div>

            <div className="bookle-book__sidebar-illustration">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=85"
                alt="Reader enjoying a book"
                className="bookle-book__sidebar-person"
                loading="lazy"
              />
            </div>
          </aside>
        </div>

        {/* FULL-WIDTH BOTTOM PROMO */}
        <div className="bookle-book__promo-banner">
          <div className="bookle-book__promo-collage">
            <img
              src="https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=300&q=80"
              alt="Book collection"
              className="bookle-book__collage-img bookle-book__collage-img--1"
              loading="lazy"
            />

            <img
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80"
              alt="Featured book"
              className="bookle-book__collage-img bookle-book__collage-img--2"
              loading="lazy"
            />
          </div>

          <div className="bookle-book__promo-text-wrap">
            <span className="bookle-book__eyebrow">
              THE WEEKLY READING EDIT
            </span>

            <h2 className="bookle-book__promo-heading">
              Get 25% off every category, this week only
            </h2>

            <button
              type="button"
              className="bookle-book__btn-brass bookle-book__btn-brass--dark"
              onClick={handleExplore}
            >
              <span>Shop now</span>
              <FaArrowRight className="bookle-book__btn-brass-icon" />
            </button>
          </div>

          <div className="bookle-book__promo-right-person">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=85"
              alt="Reader with books"
              className="bookle-book__promo-person-img"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookleBook;
