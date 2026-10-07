import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FaStar,
  FaRegStar,
  FaShoppingBasket,
  FaArrowRight,
  FaCheck,
  FaFire,
  FaChevronLeft,
  FaChevronRight,
  FaTag,
} from 'react-icons/fa';
import './TopSelling.css';

const TOP_SELLING_BOOKS = [
  {
    id: 'ts1',
    category: 'Design low book',
    title: 'How Deal With Very Bad BOOK',
    price: 30.0,
    originalPrice: 39.99,
    rating: 5,
    author: 'Alexander',
    badge: null,
    image:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'ts2',
    category: 'Design low book',
    title: 'Qple GPad With Retina Sisplay',
    price: 30.0,
    originalPrice: 39.99,
    rating: 5,
    author: 'Esther',
    badge: null,
    image:
      'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'ts3',
    category: 'Design low book',
    title: 'Qple GPad With Retina Sisplay',
    price: 30.0,
    originalPrice: 39.99,
    rating: 5,
    author: 'Hawkins',
    badge: 'hot',
    image:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'ts4',
    category: 'Design low book',
    title: 'Simple Things You To Save BOOK',
    price: 30.0,
    originalPrice: 39.99,
    rating: 5,
    author: 'Albert',
    badge: null,
    image:
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'ts5',
    category: 'Design low book',
    title: 'Simple Things You To Save BOOK',
    price: 30.0,
    originalPrice: 39.99,
    rating: 4,
    author: 'Wilson',
    badge: 'sale',
    image:
      'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'ts6',
    category: 'Design low book',
    title: 'Castle In The Sky Odyssey',
    price: 24.0,
    originalPrice: 32.0,
    rating: 5,
    author: 'Marcus',
    badge: 'hot',
    image:
      'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=85',
  },
];

// Mirrors the breakpoints defined in TopSelling.css so page-based
// navigation always lines up exactly with the visible cards.
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
  const [addedMap, setAddedMap] = useState({});
  const [itemsPerView, setItemsPerView] = useState(() =>
    typeof window !== 'undefined' ? getItemsPerView(window.innerWidth) : 5
  );
  const [currentPage, setCurrentPage] = useState(0);

  const trackRef = useRef(null);
  const isSyncingScroll = useRef(false);

  const totalPages = Math.max(1, Math.ceil(TOP_SELLING_BOOKS.length / itemsPerView));
  const hasMultiplePages = totalPages > 1;

  /* ----------------------------------------------------------------
      Cart feedback — guarded so a rapid double-click can't double fire.
  ---------------------------------------------------------------- */
  const handleAddToCart = (book) => {
    if (addedMap[book.id]) return;
    setAddedMap((prev) => ({ ...prev, [book.id]: true }));
    if (onAddToCart) onAddToCart(book);
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [book.id]: false }));
    }, 1800);
  };

  /* ----------------------------------------------------------------
      Keep itemsPerView (and totalPages) in sync with the viewport.
  ---------------------------------------------------------------- */
  useEffect(() => {
    const handleResize = () => setItemsPerView(getItemsPerView(window.innerWidth));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const goToPage = useCallback(
    (index) => {
      const next = ((index % totalPages) + totalPages) % totalPages;
      setCurrentPage(next);
    },
    [totalPages]
  );

  const handlePrev = () => goToPage(currentPage - 1);
  const handleNext = () => goToPage(currentPage + 1);

  /* ----------------------------------------------------------------
      Scroll the track by its own width per page — this stays correct
      at every breakpoint instead of a fixed, once-measured card width.
  ---------------------------------------------------------------- */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    isSyncingScroll.current = true;
    track.scrollTo({ left: currentPage * track.clientWidth, behavior: 'smooth' });
    const clear = setTimeout(() => {
      isSyncingScroll.current = false;
    }, 500);
    return () => clearTimeout(clear);
  }, [currentPage]);

  /* ----------------------------------------------------------------
      Manual drag/swipe/scroll gets read back into currentPage so the
      dots and arrows never fall out of sync with what's on screen.
  ---------------------------------------------------------------- */
  const handleScroll = () => {
    if (isSyncingScroll.current) return;
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const page = Math.round(track.scrollLeft / track.clientWidth);
    if (page !== currentPage) {
      setCurrentPage(Math.min(page, totalPages - 1));
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlePrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleNext();
    }
  };

  const renderStars = (count) =>
    Array.from({ length: 5 }, (_, index) =>
      index < count ? (
        <FaStar key={index} className="top-selling__star top-selling__star--active" />
      ) : (
        <FaRegStar key={index} className="top-selling__star" />
      )
    );

  return (
    <section className="top-selling">
      <div className="top-selling__wrapper">
        {/* ==========================================================
            SECTION HEADER & CONTROLS
        ========================================================== */}
        <div className="top-selling__header">
          <h2 className="top-selling__heading">Top Selling Books</h2>

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
              onClick={onExploreMore}
            >
              <span>Explore More</span>
              <FaArrowRight className="top-selling__explore-icon" />
            </button>
          </div>
        </div>

        {/* ==========================================================
            SLIDER TRACK
        ========================================================== */}
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
            {TOP_SELLING_BOOKS.map((book, i) => {
              const isAdded = Boolean(addedMap[book.id]);
              const percentOff =
                book.originalPrice && book.originalPrice > book.price
                  ? discountPercent(book.price, book.originalPrice)
                  : null;

              return (
                <article
                  className="top-selling__card"
                  key={book.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${TOP_SELLING_BOOKS.length}`}
                >
                  <div className="top-selling__media">
                    {book.badge === 'hot' && (
                      <span className="top-selling__badge top-selling__badge--hot">
                        <FaFire className="top-selling__badge-icon" />
                        Hot
                      </span>
                    )}
                    {book.badge === 'sale' && percentOff !== null && (
                      <span className="top-selling__badge top-selling__badge--discount">
                        <FaTag className="top-selling__badge-icon" />
                        {`-${percentOff}%`}
                      </span>
                    )}

                    <div className="top-selling__image-frame">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="top-selling__img"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="top-selling__body">
                    <span className="top-selling__category">{book.category}</span>
                    <h3 className="top-selling__title" title={book.title}>
                      {book.title}
                    </h3>

                    <div className="top-selling__price-row">
                      <span className="top-selling__current-price">
                        ₹{book.price.toFixed(2)}
                      </span>
                      {book.originalPrice && (
                        <span className="top-selling__original-price">
                          ₹{book.originalPrice.toFixed(2)}
                        </span>
                      )}
                      {percentOff !== null && (
                        <span className="top-selling__save-tag">Save {percentOff}%</span>
                      )}
                    </div>

                    <div className="top-selling__meta-row">
                      <div className="top-selling__author-info">
                        <span className="top-selling__avatar" aria-hidden="true">
                          {book.author.charAt(0)}
                        </span>
                        <span className="top-selling__author-text">{book.author}</span>
                      </div>
                      <div
                        className="top-selling__rating"
                        aria-label={`Rated ${book.rating} out of 5`}
                      >
                        {renderStars(book.rating)}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`top-selling__cart-btn ${
                        isAdded ? 'top-selling__cart-btn--added' : ''
                      }`}
                      onClick={() => handleAddToCart(book)}
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
            })}
          </div>
        </div>

        {/* ==========================================================
            PROGRESS-RAIL PAGINATION
        ========================================================== */}
        {hasMultiplePages && (
          <div className="top-selling__pagination" role="tablist" aria-label="Slide navigation">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                type="button"
                key={index}
                role="tab"
                aria-selected={currentPage === index}
                aria-label={`Go to slide group ${index + 1} of ${totalPages}`}
                className={`top-selling__dot ${
                  currentPage === index ? 'top-selling__dot--active' : ''
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