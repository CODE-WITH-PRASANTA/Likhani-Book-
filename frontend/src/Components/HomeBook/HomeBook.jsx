
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

const HomeBook = () => {
  const navigate = useNavigate();
  const { wishlist: shopWishlist } = useShopStore();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedMap, setAddedMap] = useState({});
  const [modalBook, setModalBook] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
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
            setBooks([]);
          }
        }
      } catch (err) {
        console.error("Failed to load featured books:", err);
        if (isMounted) setBooks([]);
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

      {(loading || books.length > 0) && (
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
              className="home-book__explore-btn"
              onClick={() => navigate("/shop")}
            >
              Explore More
              <FaArrowRight className="home-book__explore-icon" />
            </button>
          </div>
        </div>

        <div className="home-book__carousel-wrapper" id="home-book-collection">
          <div className="home-book__grid">
            {loading ? (
              // Loading skeleton state (2 rows x 4 columns = 8 cards)
              Array.from({ length: 8 }).map((_, idx) => (
                <article className="home-book__card home-book__card--skeleton" key={`skel-${idx}`}>
                  <div className="home-book__card-media" style={{ background: "#e2e8f0", minHeight: "220px" }} />
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
              books.slice(0, 8).map((book) => {
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

      </div>
      )}

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

