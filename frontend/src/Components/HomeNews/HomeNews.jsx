import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FaCalendarAlt,
  FaUser,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaBookmark,
} from 'react-icons/fa';
import './HomeNews.css';

const NEWS_ITEMS = [
  {
    id: 'news1',
    category: 'Activities',
    date: 'Feb 10, 2024',
    author: 'Admin',
    title: 'Montes Suspendisse Massa Curae Malesuada',
    image:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=85',
    href: '#',
  },
  {
    id: 'news2',
    category: 'Activities',
    date: 'Mar 20, 2024',
    author: 'Admin',
    title: 'Playful Picks Paradise: Kids Essentials With Dash.',
    image:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=85',
    href: '#',
  },
  {
    id: 'news3',
    category: 'Activities',
    date: 'Jun 14, 2024',
    author: 'Admin',
    title: "Tiny Emporium: Playful Picks For Kids' Delightful Days.",
    image:
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=85',
    href: '#',
  },
  {
    id: 'news4',
    category: 'Activities',
    date: 'Mar 12, 2024',
    author: 'Admin',
    title: 'Eu Parturient Dictumst Fames Quam Tempor',
    image:
      'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=600&q=85',
    href: '#',
  },
  {
    id: 'news5',
    category: 'Activities',
    date: 'Apr 05, 2024',
    author: 'Admin',
    title: 'Mastering Reading Habits in Modern Digital Age',
    image:
      'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=85',
    href: '#',
  },
  {
    id: 'news6',
    category: 'Activities',
    date: 'May 19, 2024',
    author: 'Admin',
    title: 'The Secret World of Classic Architectural Libraries',
    image:
      'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=85',
    href: '#',
  },
];

const AUTOPLAY_MS = 5000;

// Mirrors the breakpoints defined in HomeNews.css so the JS "pages"
// always line up exactly with what the grid is visually showing.
const getItemsPerView = (width) => {
  if (width <= 540) return 1;
  if (width <= 900) return 2;
  if (width <= 1200) return 3;
  return 4;
};

const HomeNews = ({ onSelectArticle }) => {
  const [itemsPerView, setItemsPerView] = useState(() =>
    typeof window !== 'undefined' ? getItemsPerView(window.innerWidth) : 4
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const trackRef = useRef(null);
  const resumeTimeoutRef = useRef(null);
  const isSyncingScroll = useRef(false);

  const totalPages = Math.max(1, Math.ceil(NEWS_ITEMS.length / itemsPerView));
  const hasMultiplePages = totalPages > 1;

  /* ----------------------------------------------------------------
     Keep itemsPerView (and therefore totalPages) in sync with the
     viewport so page-based navigation always matches the visible grid.
  ---------------------------------------------------------------- */
  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView(window.innerWidth));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  /* ----------------------------------------------------------------
     Navigation helpers
  ---------------------------------------------------------------- */
  const goToPage = useCallback(
    (index) => {
      const next = ((index % totalPages) + totalPages) % totalPages;
      setCurrentPage(next);
      setProgressKey((k) => k + 1);
    },
    [totalPages]
  );

  const handlePrev = () => goToPage(currentPage - 1);
  const handleNext = () => goToPage(currentPage + 1);

  const pauseThenResume = useCallback(() => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), 3500);
  }, []);

  /* ----------------------------------------------------------------
     Autoplay
  ---------------------------------------------------------------- */
  useEffect(() => {
    if (isPaused || !hasMultiplePages) return undefined;
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
      setProgressKey((k) => k + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [isPaused, totalPages, hasMultiplePages]);

  /* ----------------------------------------------------------------
     Keep the scroll position of the track synced to currentPage.
     Scrolling by the container's own width means a "page" always
     matches exactly one row of visible cards, at every breakpoint.
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
     If the person drags/swipes the track manually, read the resulting
     scroll position back into currentPage so dots & arrows stay honest.
  ---------------------------------------------------------------- */
  const handleScroll = () => {
    if (isSyncingScroll.current) return;
    pauseThenResume();
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const page = Math.round(track.scrollLeft / track.clientWidth);
    if (page !== currentPage) {
      setCurrentPage(Math.min(page, totalPages - 1));
      setProgressKey((k) => k + 1);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      pauseThenResume();
      handlePrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      pauseThenResume();
      handleNext();
    }
  };

  return (
    <section className="home-news">
      <div className="home-news__wrapper">
        {/* ==========================================================
            SECTION HEADER
        ========================================================== */}
        <div className="home-news__header">
          <div className="home-news__header-text">
            <h2 className="home-news__heading">Our Latest News</h2>
            <p className="home-news__subtext">
              Interdum et malesuada fames ac ante ipsum primis in faucibus.
              Donec at nulla nulla. Duis posuere ex lacus.
            </p>
          </div>
          <div className="home-news__count" aria-hidden="true">
            <span className="home-news__count-number">
              {String(NEWS_ITEMS.length).padStart(2, '0')}
            </span>
            <span className="home-news__count-label">
              stories
              <br />
              this month
            </span>
          </div>
        </div>

        {/* ==========================================================
            CAROUSEL
        ========================================================== */}
        <div
          className="home-news__carousel-container"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          {hasMultiplePages && (
            <>
              <button
                type="button"
                className="home-news__arrow home-news__arrow--left"
                onClick={() => {
                  pauseThenResume();
                  handlePrev();
                }}
                aria-label="Show previous stories"
              >
                <FaChevronLeft />
              </button>

              <button
                type="button"
                className="home-news__arrow home-news__arrow--right"
                onClick={() => {
                  pauseThenResume();
                  handleNext();
                }}
                aria-label="Show next stories"
              >
                <FaChevronRight />
              </button>
            </>
          )}

          <div
            className="home-news__track-overflow"
            ref={trackRef}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label="Latest news"
          >
            <div className="home-news__track">
              {NEWS_ITEMS.map((item, i) => (
                <article
                  className="home-news__card"
                  key={item.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${NEWS_ITEMS.length}`}
                >
                  <div className="home-news__media">
                    <span className="home-news__category-badge">
                      <FaBookmark className="home-news__category-icon" />
                      {item.category}
                    </span>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="home-news__img"
                      loading="lazy"
                    />
                    <span className="home-news__media-veil" aria-hidden="true" />
                  </div>

                  <div className="home-news__body">
                    <div className="home-news__meta-info">
                      <span className="home-news__meta-item">
                        <FaCalendarAlt className="home-news__meta-icon" />
                        {item.date}
                      </span>
                      <span className="home-news__meta-divider" aria-hidden="true" />
                      <span className="home-news__meta-item">
                        <FaUser className="home-news__meta-icon" />
                        {item.author}
                      </span>
                    </div>

                    <h3 className="home-news__title" title={item.title}>
                      {item.title}
                    </h3>

                    <a
                      className="home-news__read-more-btn"
                      href={item.href}
                      onClick={(e) => {
                        if (onSelectArticle) {
                          e.preventDefault();
                          onSelectArticle(item);
                        }
                      }}
                    >
                      <span>Read More</span>
                      <FaArrowRight className="home-news__read-icon" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* ==========================================================
            PROGRESS RAIL (replaces plain dots)
        ========================================================== */}
        {hasMultiplePages && (
          <div className="home-news__pagination" role="tablist" aria-label="Slide navigation">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                type="button"
                key={index}
                role="tab"
                aria-selected={currentPage === index}
                aria-label={`Go to slide group ${index + 1} of ${totalPages}`}
                className={`home-news__dot ${
                  currentPage === index ? 'home-news__dot--active' : ''
                }`}
                onClick={() => {
                  pauseThenResume();
                  goToPage(index);
                }}
              >
                {currentPage === index && !isPaused && (
                  <span
                    key={progressKey}
                    className="home-news__dot-fill"
                    style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeNews;