import React, { useEffect, useState } from "react";
import {
  FaStar,
  FaRegStar,
  FaShoppingBasket,
  FaArrowRight,
  FaCheck,
  FaHeart,
  FaRegHeart,
  FaExpandArrowsAlt,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import "./RatingBook.css";

const RATED_BOOKS = [
  {
    id: "rb1",
    category: "Design Low Book",
    title: "Simple Things You To Save BOOK",
    price: 30.0,
    rating: 4,
    author: "Wilson",
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=85",
    description:
      "A beautifully designed book collection for readers who love simple ideas, creativity and meaningful stories.",
  },
  {
    id: "rb2",
    category: "Design Low Book",
    title: "How Deal With Very Bad BOOK",
    price: 39.0,
    rating: 4,
    author: "Wilson",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=85",
    description:
      "Explore practical ideas and inspiring stories designed to help you deal with challenging situations.",
  },
  {
    id: "rb3",
    category: "Design Low Book",
    title: "Qple GPad With Retina Sisplay",
    price: 30.0,
    rating: 4,
    author: "Wilson",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=85",
    description:
      "A modern reading experience packed with useful information, ideas and creative inspiration.",
  },
  {
    id: "rb4",
    category: "Design Low Book",
    title: "Flovely And Unicorn Erna",
    price: 19.0,
    rating: 4,
    author: "Wilson",
    image:
      "https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=600&q=85",
    description:
      "A charming book for readers who enjoy imagination, fantasy and beautifully illustrated stories.",
  },
  {
    id: "rb5",
    category: "Design Low Book",
    title: "Castle In The Sky",
    price: 16.0,
    rating: 4,
    author: "Wilson",
    image:
      "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=85",
    description:
      "Step into an unforgettable world of stories, adventure and imagination with this beautiful book.",
  },
  {
    id: "rb6",
    category: "Design Low Book",
    title: "The Hidden Mystery Behind",
    price: 30.0,
    rating: 4,
    author: "Wilson",
    image:
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=85",
    description:
      "Discover hidden ideas, mysteries and stories through an engaging reading experience.",
  },
];

const RatingBook = () => {
  const [wishlist, setWishlist] = useState({});
  const [addedMap, setAddedMap] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);

  const toggleWishlist = (id) => {
    setWishlist((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddToCart = (id) => {
    if (addedMap[id]) return;

    setAddedMap((prev) => ({
      ...prev,
      [id]: true,
    }));

    setTimeout(() => {
      setAddedMap((prev) => ({
        ...prev,
        [id]: false,
      }));
    }, 1800);
  };

  const openProductPreview = (book) => {
    setSelectedBook(book);
    setModalQuantity(1);
    document.body.classList.add("rating-book-modal-open");
  };

  const closeProductPreview = () => {
    setSelectedBook(null);
    document.body.classList.remove("rating-book-modal-open");
  };

  const openViewAll = () => {
    setIsViewAllOpen(true);
    document.body.classList.add("rating-book-modal-open");
  };

  const closeViewAll = () => {
    setIsViewAllOpen(false);
    document.body.classList.remove("rating-book-modal-open");
  };

  const closeAllModals = () => {
    setSelectedBook(null);
    setIsViewAllOpen(false);
    document.body.classList.remove("rating-book-modal-open");
  };

  useEffect(() => {
    return () => {
      document.body.classList.remove("rating-book-modal-open");
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeAllModals();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  });

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === RATED_BOOKS.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? RATED_BOOKS.length - 1 : prev - 1
    );
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) =>
      index < rating ? (
        <FaStar
          key={index}
          className="rating-book__star rating-book__star--active"
        />
      ) : (
        <FaRegStar key={index} className="rating-book__star" />
      )
    );
  };

  const ProductCard = ({ book, isModal = false }) => {
    const isWished = Boolean(wishlist[book.id]);
    const isAdded = Boolean(addedMap[book.id]);

    return (
      <article
        className={`rating-book__card ${
          isModal ? "rating-book__card--modal" : ""
        }`}
      >
        <div className="rating-book__media">
          <div className="rating-book__img-frame">
            <img
              src={book.image}
              alt={book.title}
              className="rating-book__img"
              loading="lazy"
            />
          </div>

          <div className="rating-book__quick-actions">
            <button
              type="button"
              className={`rating-book__quick-btn ${
                isWished ? "rating-book__quick-btn--active" : ""
              }`}
              onClick={() => toggleWishlist(book.id)}
              aria-label="Add to wishlist"
            >
              {isWished ? <FaHeart /> : <FaRegHeart />}
            </button>

            <button
              type="button"
              className="rating-book__quick-btn"
              onClick={() => openProductPreview(book)}
              aria-label="Expand product"
            >
              <FaExpandArrowsAlt />
            </button>

            <button
              type="button"
              className="rating-book__quick-btn"
              onClick={() => openProductPreview(book)}
              aria-label="Quick preview"
            >
              <FaEye />
            </button>
          </div>
        </div>

        <div className="rating-book__content">
          <span className="rating-book__genre">{book.category}</span>

          <h3
            className="rating-book__title"
            title={book.title}
          >
            {book.title}
          </h3>

          <div className="rating-book__price-row">
            <span className="rating-book__price">
              ₹{book.price.toFixed(2)}
            </span>
          </div>

          <div className="rating-book__author-rating">
            <div className="rating-book__author-wrap">
              <span className="rating-book__avatar">
                {book.author.charAt(0)}
              </span>

              <span className="rating-book__author-name">
                {book.author}
              </span>
            </div>

            <div className="rating-book__stars">
              {renderStars(book.rating)}
            </div>
          </div>

          <button
            type="button"
            className={`rating-book__cart-btn ${
              isAdded ? "rating-book__cart-btn--added" : ""
            }`}
            onClick={() => handleAddToCart(book.id)}
          >
            {isAdded ? (
              <>
                <FaCheck className="rating-book__btn-icon" />
                Added
              </>
            ) : (
              <>
                <FaShoppingBasket className="rating-book__btn-icon" />
                Add To Cart
              </>
            )}
          </button>
        </div>
      </article>
    );
  };

  return (
    <>
      <section className="rating-book">
        <div className="rating-book__wrapper">
          {/* HEADER */}
          <div className="rating-book__header">
            <div className="rating-book__heading-area">
              <span className="rating-book__eyebrow">
                CUSTOMER FAVORITES
              </span>

              <h2 className="rating-book__heading">
                Top Rating Books
              </h2>

              <p className="rating-book__subtitle">
                Discover books loved by our readers.
              </p>
            </div>

            <button
              type="button"
              className="rating-book__view-more-btn"
              onClick={openViewAll}
            >
              <span>View More</span>
              <FaArrowRight className="rating-book__arrow-icon" />
            </button>
          </div>

          {/* PRODUCT GRID */}
          <div className="rating-book__grid-container">
            <div className="rating-book__grid">
              {RATED_BOOKS.map((book, idx) => (
                <div
                  className={`rating-book__mobile-item ${
                    idx === currentIndex
                      ? "rating-book__mobile-item--active"
                      : ""
                  }`}
                  key={book.id}
                >
                  <ProductCard book={book} />
                </div>
              ))}
            </div>

            {/* MOBILE NAVIGATION */}
            <div className="rating-book__mobile-nav">
              <button
                type="button"
                className="rating-book__nav-arrow"
                onClick={prevSlide}
                aria-label="Previous book"
              >
                <FaChevronLeft />
              </button>

              <div className="rating-book__dots">
                {RATED_BOOKS.map((book, idx) => (
                  <button
                    key={book.id}
                    type="button"
                    className={`rating-book__dot ${
                      currentIndex === idx
                        ? "rating-book__dot--active"
                        : ""
                    }`}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                className="rating-book__nav-arrow"
                onClick={nextSlide}
                aria-label="Next book"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          VIEW MORE MODAL
      ===================================================== */}
      {isViewAllOpen && (
        <div
          className="rating-book__overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeViewAll();
            }
          }}
        >
          <div className="rating-book__view-modal">
            <div className="rating-book__view-modal-header">
              <div>
                <span className="rating-book__modal-eyebrow">
                  EXPLORE OUR COLLECTION
                </span>

                <h2>Top Rating Books</h2>

                <p>
                  Browse our most loved books and find your next
                  favorite read.
                </p>
              </div>

              <button
                type="button"
                className="rating-book__modal-close"
                onClick={closeViewAll}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="rating-book__view-grid">
              {RATED_BOOKS.map((book) => (
                <ProductCard
                  key={book.id}
                  book={book}
                  isModal
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PRODUCT QUICK VIEW MODAL
      ===================================================== */}
      {selectedBook && (
        <div
          className="rating-book__overlay rating-book__overlay--product"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeProductPreview();
            }
          }}
        >
          <div className="rating-book__product-modal">
            <button
              type="button"
              className="rating-book__product-close"
              onClick={closeProductPreview}
              aria-label="Close product"
            >
              <FaTimes />
            </button>

            <div className="rating-book__product-image">
              <img
                src={selectedBook.image}
                alt={selectedBook.title}
              />

              <div className="rating-book__product-badge">
                TOP RATED
              </div>
            </div>

            <div className="rating-book__product-details">
              <span className="rating-book__product-category">
                {selectedBook.category}
              </span>

              <h2>{selectedBook.title}</h2>

              <div className="rating-book__product-rating">
                <div className="rating-book__stars">
                  {renderStars(selectedBook.rating)}
                </div>

                <span>4.0 / 5.0</span>
              </div>

              <div className="rating-book__product-author">
                <span className="rating-book__avatar">
                  {selectedBook.author.charAt(0)}
                </span>

                <div>
                  <small>Written by</small>
                  <strong>{selectedBook.author}</strong>
                </div>
              </div>

              <p className="rating-book__product-description">
                {selectedBook.description}
              </p>

              <div className="rating-book__product-price">
                ₹{selectedBook.price.toFixed(2)}
              </div>

              <div className="rating-book__product-actions">
                <div className="rating-book__quantity">
                  <button
                    type="button"
                    onClick={() =>
                      setModalQuantity((prev) =>
                        Math.max(1, prev - 1)
                      )
                    }
                  >
                    <FaMinus />
                  </button>

                  <span>{modalQuantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setModalQuantity((prev) => prev + 1)
                    }
                  >
                    <FaPlus />
                  </button>
                </div>

                <button
                  type="button"
                  className={`rating-book__modal-cart ${
                    addedMap[selectedBook.id]
                      ? "rating-book__modal-cart--added"
                      : ""
                  }`}
                  onClick={() =>
                    handleAddToCart(selectedBook.id)
                  }
                >
                  {addedMap[selectedBook.id] ? (
                    <>
                      <FaCheck />
                      Added To Cart
                    </>
                  ) : (
                    <>
                      <FaShoppingBasket />
                      Add To Cart
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className={`rating-book__modal-wishlist ${
                    wishlist[selectedBook.id]
                      ? "rating-book__modal-wishlist--active"
                      : ""
                  }`}
                  onClick={() =>
                    toggleWishlist(selectedBook.id)
                  }
                  aria-label="Wishlist"
                >
                  {wishlist[selectedBook.id] ? (
                    <FaHeart />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RatingBook;