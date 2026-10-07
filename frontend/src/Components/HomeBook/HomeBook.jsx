import React, { useState, useRef, useEffect } from 'react';
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
  FaStar,
  FaRegStar,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaBookOpen,
} from 'react-icons/fa';
import './HomeBook.css';

const PERKS = [
  {
    id: 'returns',
    icon: <FaUndoAlt />,
    title: 'Return & Refund',
    subtitle: 'Money back guarantee',
  },
  {
    id: 'payment',
    icon: <FaShieldAlt />,
    title: 'Secure Payment',
    subtitle: '30% off by subscribing',
  },
  {
    id: 'support',
    icon: <FaHeadset />,
    title: 'Quality Support',
    subtitle: 'Always online 24/7',
  },
  {
    id: 'offers',
    icon: <FaTags />,
    title: 'Daily Offers',
    subtitle: '20% off by subscribing',
  },
];

const BOOKS = [
  {
    id: 'b1',
    genre: 'Design Journal',
    title: 'The Quiet Library',
    price: 19,
    originalPrice: null,
    discount: 12,
    hot: false,
    author: 'Albert',
    rating: 4,
    pages: 284,
    publisher: 'Parchment & Ink Press',
    description: 'An immersive dive into architectural silence and the tranquil acoustics of modern minimalist study spaces.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'b2',
    genre: "Children's Tale",
    title: 'Flovely & The Unicorn',
    price: 30,
    originalPrice: null,
    discount: null,
    hot: false,
    author: 'Alexander',
    rating: 4,
    pages: 142,
    publisher: 'Dreamweaver Books',
    description: 'A magical bedtime adventure following a brave little creature discovering enchanted mystical realms.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'b3',
    genre: 'Science Fiction',
    title: 'Simple Ways to Save Time',
    price: 30,
    originalPrice: 39.99,
    discount: 30,
    hot: true,
    author: 'Wilson',
    rating: 4,
    pages: 310,
    publisher: 'Chronos Media',
    description: 'Bending the fabric of daily routines through temporal optimization and visionary productivity methods.',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'b4',
    genre: 'Self Growth',
    title: 'How to Deal With Hard Days',
    price: 39,
    originalPrice: null,
    discount: null,
    hot: false,
    author: 'Esther',
    rating: 4,
    pages: 215,
    publisher: 'Serenity House',
    description: 'Reflective practices, emotional grounding exercises, and mental clarity frameworks for turbulent times.',
    image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'b5',
    genre: 'Nature Guide',
    title: 'Grow Your Own Flower',
    price: 29,
    originalPrice: null,
    discount: null,
    hot: false,
    author: 'Hawkins',
    rating: 4,
    pages: 198,
    publisher: 'Botanica Edit',
    description: 'Botanical blueprints for nurturing resilient flora and cultivating backyard sanctuaries from scratch.',
    image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'b6',
    genre: 'Architecture',
    title: 'Modern Minimalist Spaces',
    price: 45,
    originalPrice: 55.00,
    discount: 18,
    hot: true,
    author: 'Claire',
    rating: 5,
    pages: 340,
    publisher: 'Bauhaus Guild',
    description: 'An architectural gallery showcasing clean lines, natural illumination, and open architectural concepts.',
    image: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'b7',
    genre: 'Philosophy',
    title: 'Art of Mindful Living',
    price: 24,
    originalPrice: null,
    discount: null,
    hot: false,
    author: 'Marcus',
    rating: 5,
    pages: 260,
    publisher: 'Aura Publishing',
    description: 'Ancient stoic wisdom translated into actionable contemporary daily life balance and serenity.',
    image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'b8',
    genre: 'Culinary Arts',
    title: 'The Artisan Kitchen',
    price: 34,
    originalPrice: 42.00,
    discount: 15,
    hot: false,
    author: 'Juliet',
    rating: 4,
    pages: 312,
    publisher: 'Epicurean Books',
    description: 'Mastering homemade baking, fermented treasures, and wholesome seasonal ingredient pairing.',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=85',
  }
];

const RATING_MAX = 5;

const HomeBook = () => {
  const [wishlist, setWishlist] = useState({});
  const [addedMap, setAddedMap] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [modalBook, setModalBook] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const carouselRef = useRef(null);

  const toggleWishlist = (id) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (id) => {
    if (addedMap[id]) return;
    setAddedMap((prev) => ({ ...prev, [id]: true }));
    window.setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [id]: false }));
    }, 1800);
  };

  const handleShare = async (book) => {
    const shareData = {
      title: book.title,
      text: `Check out "${book.title}" by ${book.author} on Reading Shelf!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setToastMessage(`Link copied for "${book.title}"!`);
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        setToastMessage('Unable to copy link.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev === 0 ? BOOKS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev >= BOOKS.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!carouselRef.current) return;
    const carousel = carouselRef.current;
    const card = carousel.querySelector('.home-book__card');
    if (!card) return;

    const cardWidth = card.getBoundingClientRect().width;
    const carouselStyle = window.getComputedStyle(carousel);
    const gap = parseFloat(carouselStyle.columnGap) || parseFloat(carouselStyle.gap) || 0;
    const moveAmount = cardWidth + gap;

    carousel.scrollTo({
      left: currentPage * moveAmount,
      behavior: 'smooth',
    });
  }, [currentPage]);

  useEffect(() => {
    if (isPaused || modalBook) return;
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev >= BOOKS.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, modalBook]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= RATING_MAX; i += 1) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="home-book__star home-book__star--filled" />
        ) : (
          <FaRegStar key={i} className="home-book__star" />
        )
      );
    }
    return stars;
  };

  return (
    <section className="home-book">
      {/* Toast Notification for Sharing Fallback */}
      {toastMessage && (
        <div className="home-book__toast">
          <FaCheck className="home-book__toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ---------- trust / perks strip ---------- */}
      <div className="home-book__perks">
        {PERKS.map((perk) => (
          <div className="home-book__perk" key={perk.id}>
            <span className="home-book__perk-icon">{perk.icon}</span>
            <span className="home-book__perk-copy">
              <span className="home-book__perk-title">{perk.title}</span>
              <span className="home-book__perk-subtitle">{perk.subtitle}</span>
            </span>
          </div>
        ))}
      </div>

      {/* ---------- featured books carousel ---------- */}
      <div className="home-book__featured">
        <div className="home-book__featured-head">
          <h2 className="home-book__featured-title">Featured Books</h2>
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
            <button type="button" className="home-book__explore-btn">
              Explore More
              <FaArrowRight className="home-book__explore-icon" />
            </button>
          </div>
        </div>

        <div
          className="home-book__carousel-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="home-book__grid" ref={carouselRef}>
            {BOOKS.map((book) => {
              const isWished = Boolean(wishlist[book.id]);
              const isAdded = Boolean(addedMap[book.id]);

              return (
                <article className="home-book__card" key={book.id}>
                  <div className="home-book__card-media">
                    {book.hot && <span className="home-book__floating-dot" aria-hidden="true" />}

                    <div className="home-book__badges">
                      {book.hot && <span className="home-book__badge home-book__badge--hot">Hot</span>}
                      {book.discount && (
                        <span className="home-book__badge home-book__badge--sale">
                          -{book.discount}%
                        </span>
                      )}
                    </div>

                    <div className="home-book__cover-wrapper">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="home-book__cover-img"
                        loading="lazy"
                      />
                      <div className="home-book__cover-sheen" aria-hidden="true" />
                    </div>

                    <div className="home-book__quick-actions">
                      <button
                        type="button"
                        className={`home-book__quick-btn ${isWished ? 'home-book__quick-btn--active' : ''}`}
                        onClick={() => toggleWishlist(book.id)}
                        aria-pressed={isWished}
                        aria-label="Toggle wishlist"
                      >
                        {isWished ? <FaHeart /> : <FaRegHeart />}
                      </button>
                      <button
                        type="button"
                        className="home-book__quick-btn"
                        aria-label="Share book"
                        onClick={() => handleShare(book)}
                      >
                        <FaShareAlt />
                      </button>
                      <button
                        type="button"
                        className="home-book__quick-btn"
                        aria-label="Quick view"
                        onClick={() => setModalBook(book)}
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>

                  <div className="home-book__card-body">
                    <p className="home-book__genre">{book.genre}</p>
                    <h3 className="home-book__title">{book.title}</h3>

                    <p className="home-book__price">
                      <span className="home-book__price-current">₹{book.price.toFixed(2)}</span>
                      {book.originalPrice && (
                        <span className="home-book__price-original">
                          ₹{book.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </p>

                    <div className="home-book__meta">
                      <span className="home-book__author">
                        <span className="home-book__avatar">{book.author.charAt(0)}</span>
                        {book.author}
                      </span>
                      <span className="home-book__rating">{renderStars(book.rating)}</span>
                    </div>

                    <button
                      type="button"
                      className={`home-book__add-btn ${isAdded ? 'home-book__add-btn--added' : ''}`}
                      onClick={() => handleAddToCart(book.id)}
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
            })}
          </div>
        </div>

        {/* pagination dots */}
        <div className="home-book__pagination">
          {BOOKS.map((book, index) => (
            <button
              type="button"
              key={book.id}
              aria-label={`Go to slide ${index + 1}`}
              className={`home-book__pagination-dot ${
                currentPage === index ? 'home-book__pagination-dot--active' : ''
              }`}
              onClick={() => setCurrentPage(index)}
            />
          ))}
        </div>
      </div>

      {/* ---------- eye-catching premium quick view modal popup ---------- */}
      {modalBook && (
        <div className="hb-modal__backdrop" onClick={() => setModalBook(null)}>
          <div className="hb-modal__container" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="hb-modal__close-btn"
              onClick={() => setModalBook(null)}
              aria-label="Close dialog"
            >
              <FaTimes />
            </button>

            <div className="hb-modal__grid">
              {/* Left Side: Showcase Image */}
              <div className="hb-modal__media">
                <img src={modalBook.image} alt={modalBook.title} className="hb-modal__img" />
                <div className="hb-modal__sheen" />
              </div>

              {/* Right Side: Product Details & Form Actions */}
              <div className="hb-modal__content">
                <div className="hb-modal__badge-row">
                  <span className="hb-modal__genre-tag">{modalBook.genre}</span>
                  {modalBook.hot && <span className="hb-modal__hot-pill">Bestseller</span>}
                </div>

                <h2 className="hb-modal__title">{modalBook.title}</h2>

                <div className="hb-modal__author-rating">
                  <span className="hb-modal__author-name">
                    Written by <strong>{modalBook.author}</strong>
                  </span>
                  <div className="home-book__rating">{renderStars(modalBook.rating)}</div>
                </div>

                <div className="hb-modal__price-box">
                  <span className="hb-modal__current-price">₹{modalBook.price.toFixed(2)}</span>
                  {modalBook.originalPrice && (
                    <span className="hb-modal__orig-price">₹{modalBook.originalPrice.toFixed(2)}</span>
                  )}
                  {modalBook.discount && (
                    <span className="hb-modal__save-badge">Save {modalBook.discount}%</span>
                  )}
                </div>

                <p className="hb-modal__desc">{modalBook.description}</p>

                <div className="hb-modal__specs-grid">
                  <div className="hb-modal__spec-item">
                    <FaBookOpen className="hb-modal__spec-icon" />
                    <div>
                      <span className="hb-modal__spec-label">Length</span>
                      <span className="hb-modal__spec-val">{modalBook.pages} Pages</span>
                    </div>
                  </div>
                  <div className="hb-modal__spec-item">
                    <FaShieldAlt className="hb-modal__spec-icon" />
                    <div>
                      <span className="hb-modal__spec-label">Edition</span>
                      <span className="hb-modal__spec-val">{modalBook.publisher}</span>
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
                    <FaShoppingBasket /> Add To Cart — ₹{modalBook.price.toFixed(2)}
                  </button>
                  <button
                    type="button"
                    className={`hb-modal__wish-btn ${Boolean(wishlist[modalBook.id]) ? 'active' : ''}`}
                    onClick={() => toggleWishlist(modalBook.id)}
                    aria-label="Wishlist toggle"
                  >
                    {Boolean(wishlist[modalBook.id]) ? <FaHeart /> : <FaRegHeart />}
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