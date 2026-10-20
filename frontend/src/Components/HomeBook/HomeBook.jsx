
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaHeadset,
  FaTags,
  FaUndoAlt,
  FaArrowRight,
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaEye,
  FaShoppingBasket,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaBookOpen,
} from "react-icons/fa";
import "./HomeBook.css";
import { fetchFeaturedBooks } from "../../api/booksService";
import {
  useShopStore,
  toggleWishlist as toggleShopWishlist,
  addToCart as addShopToCart,
} from "../ShopMain/useShopStore";

const PERKS = [
  {
    id: "returns",
    icon: <FaUndoAlt />,
    title: "Return & Refund",
    subtitle: "Money back guarantee",
  },
  {
    id: "payment",
    icon: <FaShieldAlt />,
    title: "Secure Payment",
    subtitle: "Safe and secure checkout",
  },
  {
    id: "support",
    icon: <FaHeadset />,
    title: "Quality Support",
    subtitle: "Always online 24/7",
  },
  {
    id: "offers",
    icon: <FaTags />,
    title: "Daily Offers",
    subtitle: "Special offers for readers",
  },
];

const FALLBACK_BOOKS = [
  {
    id: "b1",
    genre: "Design Journal",
    title: "The Quiet Library",
    price: 19,
    originalPrice: null,
    discount: 12,
    hot: false,
    author: "Albert",
    pages: 284,
    publisher: "Parchment & Ink Press",
    description:
      "An immersive dive into architectural silence and the tranquil acoustics of modern minimalist study spaces.",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "b2",
    genre: "Children's Tale",
    title: "Flovely & The Unicorn",
    price: 30,
    originalPrice: null,
    discount: null,
    hot: false,
    author: "Alexander",
    pages: 142,
    publisher: "Dreamweaver Books",
    description:
      "A magical bedtime adventure following a brave little creature discovering enchanted mystical realms.",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "b3",
    genre: "Science Fiction",
    title: "Simple Ways to Save Time",
    price: 30,
    originalPrice: 39.99,
    discount: 30,
    hot: true,
    author: "Wilson",
    pages: 310,
    publisher: "Chronos Media",
    description:
      "Bending the fabric of daily routines through temporal optimization and visionary productivity methods.",
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "b4",
    genre: "Self Growth",
    title: "How to Deal With Hard Days",
    price: 39,
    originalPrice: null,
    discount: null,
    hot: false,
    author: "Esther",
    pages: 215,
    publisher: "Serenity House",
    description:
      "Reflective practices, emotional grounding exercises, and mental clarity frameworks for turbulent times.",
    image:
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "b5",
    genre: "Nature Guide",
    title: "Grow Your Own Flower",
    price: 29,
    originalPrice: null,
    discount: null,
    hot: false,
    author: "Hawkins",
    pages: 198,
    publisher: "Botanica Edit",
    description:
      "Botanical blueprints for nurturing resilient flora and cultivating backyard sanctuaries from scratch.",
    image:
      "https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "b6",
    genre: "Architecture",
    title: "Modern Minimalist Spaces",
    price: 45,
    originalPrice: 55,
    discount: 18,
    hot: true,
    author: "Claire",
    pages: 340,
    publisher: "Bauhaus Guild",
    description:
      "An architectural gallery showcasing clean lines, natural illumination, and open architectural concepts.",
    image:
      "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "b7",
    genre: "Philosophy",
    title: "Art of Mindful Living",
    price: 24,
    originalPrice: null,
    discount: null,
    hot: false,
    author: "Marcus",
    pages: 260,
    publisher: "Aura Publishing",
    description:
      "Ancient stoic wisdom translated into actionable contemporary daily life balance and serenity.",
    image:
      "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "b8",
    genre: "Culinary Arts",
    title: "The Artisan Kitchen",
    price: 34,
    originalPrice: 42,
    discount: 15,
    hot: false,
    author: "Juliet",
    pages: 312,
    publisher: "Epicurean Books",
    description:
      "Mastering homemade baking, fermented treasures, and wholesome seasonal ingredient pairing.",
    image:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=85",
  },
];

const HomeBook = () => {
  const navigate = useNavigate();
  const { wishlist: shopWishlist } = useShopStore();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedMap, setAddedMap] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [modalBook, setModalBook] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const carouselRef = useRef(null);
  const toastTimerRef = useRef(null);

  const showToast = (message) => {
    setToastMessage(message);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Fetch dynamic featured books toggled from Admin Panel
  useEffect(() => {
    let isMounted = true;
    const loadFeatured = async () => {
      try {
        setLoading(true);
        const data = await fetchFeaturedBooks();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setBooks(data);
          } else {
            setBooks(FALLBACK_BOOKS);
          }
        }
      } catch (err) {
        console.error("Failed to load featured books:", err);
        if (isMounted) setBooks(FALLBACK_BOOKS);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!modalBook) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setModalBook(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [modalBook]);

  const toggleWishlist = (id) => {
    const willBeAdded = toggleShopWishlist(id);
    showToast(
      willBeAdded
        ? "Book added to your wishlist."
        : "Book removed from your wishlist."
    );
  };

  const handleAddToCart = (id) => {
    if (addedMap[id]) return;

    addShopToCart(id, 1);
    setAddedMap((prev) => ({
      ...prev,
      [id]: true,
    }));

    showToast("Book added to your cart.");

    window.setTimeout(() => {
      setAddedMap((prev) => ({
        ...prev,
        [id]: false,
      }));
    }, 1800);
  };

  const handleShare = async (book) => {
    const shareData = {
      title: book.title,
      text: `Check out "${book.title}" by ${book.author} on Lekhani Books!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== "AbortError") {
          showToast("Unable to share this book.");
        }
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(`Link copied for "${book.title}"!`);
    } catch {
      showToast("Unable to copy the link.");
    }
  };

  const handlePrevious = () => {
    if (!books.length) return;
    setCurrentPage((prev) =>
      prev === 0 ? books.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (!books.length) return;
    setCurrentPage((prev) =>
      prev >= books.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const firstCard = carousel.querySelector(".home-book__card");
    if (!firstCard) return;

    const cardWidth = firstCard.getBoundingClientRect().width;
    const styles = window.getComputedStyle(carousel);
    const gap =
      parseFloat(styles.columnGap) || parseFloat(styles.gap) || 0;

    carousel.scrollTo({
      left: currentPage * (cardWidth + gap),
      behavior: "smooth",
    });
  }, [currentPage]);

  useEffect(() => {
    if (isPaused || modalBook || !books.length) return;

    const interval = window.setInterval(() => {
      setCurrentPage((prev) =>
        prev >= books.length - 1 ? 0 : prev + 1
      );
    }, 4500);

    return () => window.clearInterval(interval);
  }, [isPaused, modalBook, books.length]);

  return (
    <section className="home-book">
      {toastMessage && (
        <div className="home-book__toast" role="status" aria-live="polite">
          <FaCheck className="home-book__toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="home-book__perks">
        {PERKS.map((perk) => (
          <div className="home-book__perk" key={perk.id}>
            <span className="home-book__perk-icon">{perk.icon}</span>

            <span className="home-book__perk-copy">
              <span className="home-book__perk-title">{perk.title}</span>
              <span className="home-book__perk-subtitle">
                {perk.subtitle}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="home-book__featured">
        <div className="home-book__featured-head">
          <div>
            <span className="home-book__eyebrow">OUR COLLECTION</span>
            <h2 className="home-book__featured-title">
              Featured Books
            </h2>
          </div>

          <div className="home-book__featured-controls">
            <button
              type="button"
              className="home-book__carousel-arrow"
              onClick={handlePrevious}
              aria-label="Previous book"
            >
              <FaChevronLeft />
            </button>

            <button
              type="button"
              className="home-book__carousel-arrow"
              onClick={handleNext}
              aria-label="Next book"
            >
              <FaChevronRight />
            </button>

            <button
              type="button"
              className="home-book__explore-btn"
              onClick={() => navigate("/shop")}
            >
              Explore More
              <FaArrowRight className="home-book__explore-icon" />
            </button>
          </div>
        </div>

        <div
          className="home-book__carousel-wrapper"
          id="home-book-collection"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsPaused(false);
            }
          }}
        >
          <div className="home-book__grid" ref={carouselRef}>
            {loading ? (
              // Loading skeleton state
              Array.from({ length: 4 }).map((_, idx) => (
                <article className="home-book__card home-book__card--skeleton" key={`skel-${idx}`}>
                  <div className="home-book__card-media" style={{ background: "#e2e8f0", minHeight: "260px" }} />
                  <div className="home-book__card-body">
                    <div style={{ height: "14px", width: "40%", background: "#e2e8f0", borderRadius: "4px", marginBottom: "8px" }} />
                    <div style={{ height: "18px", width: "80%", background: "#e2e8f0", borderRadius: "4px", marginBottom: "12px" }} />
                    <div style={{ height: "16px", width: "30%", background: "#e2e8f0", borderRadius: "4px" }} />
                  </div>
                </article>
              ))
            ) : books.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#64748b" }}>
                <p>No featured books available at the moment. Please check back soon!</p>
              </div>
            ) : (
              books.map((book) => {
                const isWished =
                  Array.isArray(shopWishlist) &&
                  (shopWishlist.includes(book.id) || shopWishlist.includes(String(book.id)));
                const isAdded = Boolean(addedMap[book.id]);
                const displayPrice = Number(book.price || 0);
                const displayOldPrice = book.originalPrice || book.oldPrice ? Number(book.originalPrice || book.oldPrice) : null;

                return (
                  <article className="home-book__card" key={book.id}>
                    <div className="home-book__card-media">
                      <div className="home-book__badges">
                        {book.isHighestSelling || book.badge === "Top Selling" ? (
                          <span
                            className="home-book__badge home-book__badge--hot"
                            style={{
                              background: "linear-gradient(135deg, #f59e0b, #ea580c, #dc2626)",
                              fontWeight: 800,
                              boxShadow: "0 4px 14px rgba(234, 88, 12, 0.4)",
                            }}
                          >
                            🔥 Top Selling
                          </span>
                        ) : book.hot ? (
                          <span className="home-book__badge home-book__badge--hot">
                            Bestseller
                          </span>
                        ) : null}

                        {book.discount ? (
                          <span className="home-book__badge home-book__badge--sale">
                            -{book.discount}%
                          </span>
                        ) : null}
                      </div>

                      <div className="home-book__cover-wrapper" onClick={() => setModalBook(book)} style={{ cursor: "pointer" }}>
                        <img
                          src={book.image}
                          alt={`Cover of ${book.title}`}
                          className="home-book__cover-img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=85";
                          }}
                        />
                        <div
                          className="home-book__cover-sheen"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="home-book__quick-actions">
                        <button
                          type="button"
                          className={`home-book__quick-btn ${
                            isWished
                              ? "home-book__quick-btn--active"
                              : ""
                          }`}
                          onClick={() => toggleWishlist(book.id)}
                          aria-pressed={isWished}
                          aria-label={
                            isWished
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                        >
                          {isWished ? <FaHeart style={{ color: "#dc2626" }} /> : <FaRegHeart />}
                        </button>

                        <button
                          type="button"
                          className="home-book__quick-btn"
                          aria-label={`Share ${book.title}`}
                          onClick={() => handleShare(book)}
                        >
                          <FaShareAlt />
                        </button>

                        <button
                          type="button"
                          className="home-book__quick-btn"
                          aria-label={`Quick view ${book.title}`}
                          onClick={() => setModalBook(book)}
                        >
                          <FaEye />
                        </button>
                      </div>
                    </div>

                    <div className="home-book__card-body">
                      <p className="home-book__genre">{book.genre || book.category || "Literature"}</p>
                      <h3
                        className="home-book__title"
                        onClick={() => setModalBook(book)}
                        style={{ cursor: "pointer" }}
                        title={book.title}
                      >
                        {book.title}
                      </h3>

                      <p className="home-book__price">
                        <span className="home-book__price-current">
                          ₹{displayPrice.toFixed(2)}
                        </span>

                        {displayOldPrice && displayOldPrice > displayPrice && (
                          <span className="home-book__price-original">
                            ₹{displayOldPrice.toFixed(2)}
                          </span>
                        )}
                      </p>

                      <div className="home-book__meta">
                        <span className="home-book__author">
                          <span className="home-book__avatar">
                            {(book.author || "A").charAt(0).toUpperCase()}
                          </span>
                          {book.author || "Author"}
                        </span>
                      </div>

                      <button
                        type="button"
                        className={`home-book__add-btn ${
                          isAdded ? "home-book__add-btn--added" : ""
                        }`}
                        onClick={() => handleAddToCart(book.id)}
                        disabled={isAdded}
                      >
                        {isAdded ? (
                          <>
                            <FaCheck className="home-book__add-icon" />
                            Added
                          </>
                        ) : (
                          <>
                            <FaShoppingBasket className="home-book__add-icon" />
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

        <div className="home-book__pagination" aria-label="Book carousel pages">
          {books.map((book, index) => (
            <button
              type="button"
              key={book.id || `dot-${index}`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentPage === index ? "true" : undefined}
              className={`home-book__pagination-dot ${
                currentPage === index
                  ? "home-book__pagination-dot--active"
                  : ""
              }`}
              onClick={() => setCurrentPage(index)}
            />
          ))}
        </div>
      </div>

      {modalBook && (
        <div
          className="hb-modal__backdrop"
          onClick={() => setModalBook(null)}
        >
          <div
            className="hb-modal__container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hb-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="hb-modal__close-btn"
              onClick={() => setModalBook(null)}
              aria-label="Close dialog"
            >
              <FaTimes />
            </button>

            <div className="hb-modal__grid">
              <div className="hb-modal__media">
                <img
                  src={modalBook.image}
                  alt={`Cover of ${modalBook.title}`}
                  className="hb-modal__img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=85";
                  }}
                />
                <div className="hb-modal__sheen" />
              </div>

              <div className="hb-modal__content">
                <div className="hb-modal__badge-row">
                  <span className="hb-modal__genre-tag">
                    {modalBook.genre || modalBook.category}
                  </span>

                  {modalBook.hot ? (
                    <span className="hb-modal__hot-pill">
                      Bestseller
                    </span>
                  ) : null}
                </div>

                <h2 className="hb-modal__title" id="hb-modal-title">
                  {modalBook.title}
                </h2>

                <div className="hb-modal__author-info">
                  <span className="hb-modal__author-name">
                    Written by <strong>{modalBook.author}</strong>
                  </span>
                </div>

                <div className="hb-modal__price-box">
                  <span className="hb-modal__current-price">
                    ₹{Number(modalBook.price || 0).toFixed(2)}
                  </span>

                  {(modalBook.originalPrice || modalBook.oldPrice) && (
                    <span className="hb-modal__orig-price">
                      ₹{Number(modalBook.originalPrice || modalBook.oldPrice).toFixed(2)}
                    </span>
                  )}

                  {modalBook.discount ? (
                    <span className="hb-modal__save-badge">
                      Save {modalBook.discount}%
                    </span>
                  ) : null}
                </div>

                <p className="hb-modal__desc">
                  {modalBook.description}
                </p>

                <div className="hb-modal__specs-grid">
                  <div className="hb-modal__spec-item">
                    <FaBookOpen className="hb-modal__spec-icon" />
                    <div>
                      <span className="hb-modal__spec-label">
                        Length
                      </span>
                      <span className="hb-modal__spec-val">
                        {modalBook.pages || 240} Pages
                      </span>
                    </div>
                  </div>

                  <div className="hb-modal__spec-item">
                    <FaShieldAlt className="hb-modal__spec-icon" />
                    <div>
                      <span className="hb-modal__spec-label">
                        Publisher
                      </span>
                      <span className="hb-modal__spec-val">
                        {modalBook.publisher || "Lekhani Publications"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hb-modal__footer-actions">
                  <button
                    type="button"
                    className="hb-modal__buy-btn"
                    onClick={() => {
                      handleAddToCart(modalBook.id);
                      setModalBook(null);
                    }}
                  >
                    <FaShoppingBasket />
                    Add To Cart — ₹{Number(modalBook.price || 0).toFixed(2)}
                  </button>

                  <button
                    type="button"
                    className={`hb-modal__wish-btn ${
                      Array.isArray(shopWishlist) && shopWishlist.includes(modalBook.id) ? "active" : ""
                    }`}
                    onClick={() => toggleWishlist(modalBook.id)}
                    aria-label="Toggle wishlist"
                    aria-pressed={Boolean(Array.isArray(shopWishlist) && shopWishlist.includes(modalBook.id))}
                  >
                    {Array.isArray(shopWishlist) && shopWishlist.includes(modalBook.id) ? (
                      <FaHeart style={{ color: "#dc2626" }} />
                    ) : (
                      <FaRegHeart />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomeBook;

