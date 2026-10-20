import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShoppingBasket,
  FaArrowRight,
  FaCheck,
  FaFire,
  FaChevronLeft,
  FaChevronRight,
  FaTag,
  FaTrophy,
} from "react-icons/fa";
import "./TopSelling.css";
import { fetchTopSellingBooks } from "../../api/booksService";
import { useShopStore, addToCart as addShopToCart } from "../ShopMain/useShopStore";

const FALLBACK_TOP_SELLING_BOOKS = [
  {
    id: "ts1",
    category: "Design",
    title: "How Deal With Very Bad BOOK",
    price: 30.0,
    originalPrice: 39.99,
    author: "Alexander",
    isHighestSelling: true,
    totalSold: 12,
    badge: "Top Selling",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "ts2",
    category: "Technology",
    title: "Qple GPad With Retina Sisplay",
    price: 30.0,
    originalPrice: 39.99,
    author: "Esther",
    totalSold: 8,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "ts3",
    category: "Literature",
    title: "The Silent Songbird",
    price: 30.0,
    originalPrice: 39.99,
    author: "Hawkins",
    totalSold: 6,
    badge: "hot",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "ts4",
    category: "Self-Help",
    title: "Simple Things You To Save BOOK",
    price: 30.0,
    originalPrice: 39.99,
    author: "Albert",
    totalSold: 5,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "ts5",
    category: "Business",
    title: "Startup Blueprint for Success",
    price: 30.0,
    originalPrice: 39.99,
    author: "Wilson",
    totalSold: 4,
    badge: "sale",
    image:
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "ts6",
    category: "Fiction",
    title: "Castle In The Sky Odyssey",
    price: 24.0,
    originalPrice: 32.0,
    author: "Marcus",
    totalSold: 3,
    badge: "hot",
    image:
      "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=85",
  },
];

const getItemsPerView = (width) => {
  if (width <= 450) return 1;
  if (width <= 650) return 2;
  if (width <= 900) return 3;
  if (width <= 1200) return 4;
  return 5;
};

const discountPercent = (price, originalPrice) =>
  Math.round((1 - price / originalPrice) * 100);

const TopSelling = ({ onExploreMore, onAddToCart }) => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedMap, setAddedMap] = useState({});
  const [itemsPerView, setItemsPerView] = useState(() =>
    typeof window !== "undefined" ? getItemsPerView(window.innerWidth) : 5
  );
  const [currentPage, setCurrentPage] = useState(0);

  const trackRef = useRef(null);
  const isSyncingScroll = useRef(false);
  const addedTimersRef = useRef({});

  // Fetch real top-selling books from backend
  useEffect(() => {
    let isMounted = true;
    const loadTopSelling = async () => {
      try {
        setLoading(true);
        const { books: fetchedBooks } = await fetchTopSellingBooks(12);
        if (isMounted) {
          if (Array.isArray(fetchedBooks) && fetchedBooks.length > 0) {
            setBooks(fetchedBooks);
          } else {
            setBooks(FALLBACK_TOP_SELLING_BOOKS);
          }
        }
      } catch (err) {
        console.error("Error loading top selling books:", err);
        if (isMounted) setBooks(FALLBACK_TOP_SELLING_BOOKS);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTopSelling();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil((books.length || 5) / itemsPerView)
  );
  const hasMultiplePages = totalPages > 1;

  const handleAddToCart = (book, e) => {
    if (e) e.stopPropagation();
    if (addedMap[book.id]) return;

    setAddedMap((prev) => ({ ...prev, [book.id]: true }));

    // Global store integration
    addShopToCart(book);

    if (onAddToCart) onAddToCart(book);

    if (addedTimersRef.current[book.id]) {
      clearTimeout(addedTimersRef.current[book.id]);
    }

    addedTimersRef.current[book.id] = setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [book.id]: false }));
      delete addedTimersRef.current[book.id];
    }, 1800);
  };

  const handleBookClick = (book) => {
    const bookId = book.id || book._id;
    if (bookId) {
      navigate(`/shop/${bookId}`);
    }
  };

  const handleExplore = () => {
    if (typeof onExploreMore === "function") {
      onExploreMore();
    } else {
      navigate("/shop?sort=best-selling");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView(window.innerWidth));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  useEffect(() => {
    return () => {
      Object.values(addedTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  const goToPage = useCallback(
    (index) => {
      const next = ((index % totalPages) + totalPages) % totalPages;
      setCurrentPage(next);
    },
    [totalPages]
  );

  const handlePrev = () => goToPage(currentPage - 1);
  const handleNext = () => goToPage(currentPage + 1);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    isSyncingScroll.current = true;
    track.scrollTo({
      left: currentPage * track.clientWidth,
      behavior: "smooth",
    });

    const clear = setTimeout(() => {
      isSyncingScroll.current = false;
    }, 500);

    return () => clearTimeout(clear);
  }, [currentPage, itemsPerView]);

  const handleScroll = () => {
    if (isSyncingScroll.current) return;

    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;

    const page = Math.round(track.scrollLeft / track.clientWidth);

    if (page !== currentPage) {
      setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handlePrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      handleNext();
    }
  };

  return (
    <section className="top-selling">
      <div className="top-selling__wrapper">
        <div className="top-selling__header">
          <div>
            <h2 className="top-selling__heading">Top Selling Books</h2>
          </div>

          <div className="top-selling__header-controls">
            {hasMultiplePages && (
              <div className="top-selling__arrows-group">
                <button
                  type="button"
                  className="top-selling__nav-arrow"
                  onClick={handlePrev}
                  aria-label="Show previous books"
                >
                  <FaChevronLeft />
                </button>

                <button
                  type="button"
                  className="top-selling__nav-arrow"
                  onClick={handleNext}
                  aria-label="Show next books"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}

            <button
              type="button"
              className="top-selling__explore-btn"
              onClick={handleExplore}
            >
              <span>Explore More</span>
              <FaArrowRight className="top-selling__explore-icon" />
            </button>
          </div>
        </div>

        <div
          className="top-selling__slider-container"
          ref={trackRef}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Top selling books"
        >
          <div className="top-selling__track">
            {loading ? (
              // Skeleton loading state
              Array.from({ length: itemsPerView }).map((_, idx) => (
                <article
                  className="top-selling__card top-selling__card--skeleton"
                  key={`skeleton-${idx}`}
                >
                  <div className="top-selling__media">
                    <div
                      className="top-selling__skeleton-pulse"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                  <div className="top-selling__body">
                    <div
                      className="top-selling__skeleton-pulse"
                      style={{ height: "12px", width: "45%", marginBottom: "8px" }}
                    />
                    <div
                      className="top-selling__skeleton-pulse"
                      style={{ height: "18px", width: "85%", marginBottom: "12px" }}
                    />
                    <div
                      className="top-selling__skeleton-pulse"
                      style={{ height: "20px", width: "50%", marginBottom: "16px" }}
                    />
                    <div
                      className="top-selling__skeleton-pulse"
                      style={{ height: "36px", width: "100%", borderRadius: "20px" }}
                    />
                  </div>
                </article>
              ))
            ) : (
              books.map((book, i) => {
                const isAdded = Boolean(addedMap[book.id]);
                const rawPrice = Number(book.price || 0);
                const rawOldPrice = book.originalPrice || book.oldPrice ? Number(book.originalPrice || book.oldPrice) : null;
                const percentOff =
                  rawOldPrice && rawOldPrice > rawPrice
                    ? discountPercent(rawPrice, rawOldPrice)
                    : book.discount || null;

                const isHighest = Boolean(book.isTopSelling);
                const isTopSeller = Boolean(book.isTopSelling || book.isBestSeller);

                return (
                  <article
                    className={`top-selling__card top-selling__card-clickable ${
                      isHighest ? "top-selling__card--highest" : ""
                    }`}
                    key={book.id || `ts-${i}`}
                    onClick={() => handleBookClick(book)}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} of ${books.length}`}
                  >
                    <div className="top-selling__media">
                      {/* Show Top Seller / Best Seller based strictly on active toggles */}
                      {book.isTopSelling ? (
                        <span className="top-selling__badge top-selling__badge--top-seller">
                          <FaFire className="top-selling__badge-icon" />
                          Top Seller
                        </span>
                      ) : book.isBestSeller ? (
                        <span className="top-selling__badge top-selling__badge--top-seller" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                          <FaTrophy className="top-selling__badge-icon" />
                          Best Seller
                        </span>
                      ) : (book.badge === "hot" || book.hot) ? (
                        <span className="top-selling__badge top-selling__badge--hot">
                          <FaFire className="top-selling__badge-icon" />
                          Hot
                        </span>
                      ) : percentOff !== null && percentOff > 0 ? (
                        <span className="top-selling__badge top-selling__badge--discount">
                          <FaTag className="top-selling__badge-icon" />
                          {`-${percentOff}%`}
                        </span>
                      ) : null}

                      <div className="top-selling__image-frame">
                        <img
                          src={book.image}
                          alt={book.title}
                          className="top-selling__img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80";
                          }}
                        />
                      </div>
                    </div>

                    <div className="top-selling__body">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                        <span className="top-selling__category">
                          {book.category}
                        </span>

                        {book.totalSold > 0 && (
                          <span className="top-selling__sold-chip" title={`${book.totalSold} total copies purchased`}>
                            🔥 {book.totalSold} sold
                          </span>
                        )}
                      </div>

                      <h3 className="top-selling__title" title={book.title}>
                        {book.title}
                      </h3>

                      <div className="top-selling__price-row">
                        <span className="top-selling__current-price">
                          ₹{rawPrice.toFixed(2)}
                        </span>

                        {rawOldPrice && rawOldPrice > rawPrice && (
                          <span className="top-selling__original-price">
                            ₹{rawOldPrice.toFixed(2)}
                          </span>
                        )}

                        {percentOff !== null && percentOff > 0 && (
                          <span className="top-selling__save-tag">
                            Save {percentOff}%
                          </span>
                        )}
                      </div>

                      <div className="top-selling__meta-row">
                        <div className="top-selling__author-info">
                          <span
                            className="top-selling__avatar"
                            aria-hidden="true"
                          >
                            {(book.author || "A").charAt(0).toUpperCase()}
                          </span>

                          <span className="top-selling__author-text">
                            {book.author}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`top-selling__cart-btn ${
                          isAdded ? "top-selling__cart-btn--added" : ""
                        }`}
                        onClick={(e) => handleAddToCart(book, e)}
                        aria-pressed={isAdded}
                      >
                        {isAdded ? (
                          <>
                            <FaCheck className="top-selling__btn-icon" />
                            Added
                          </>
                        ) : (
                          <>
                            <FaShoppingBasket className="top-selling__btn-icon" />
                            Add To Cart
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {hasMultiplePages && (
          <div
            className="top-selling__pagination"
            role="tablist"
            aria-label="Slide navigation"
          >
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                type="button"
                key={index}
                role="tab"
                aria-selected={currentPage === index}
                aria-label={`Go to slide group ${index + 1} of ${totalPages}`}
                className={`top-selling__dot ${
                  currentPage === index ? "top-selling__dot--active" : ""
                }`}
                onClick={() => goToPage(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopSelling;
