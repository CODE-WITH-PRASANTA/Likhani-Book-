import React, { useState, useRef, useEffect } from 'react';
import { 
  FaStar, 
  FaRegStar, 
  FaQuoteLeft, 
  FaChevronLeft, 
  FaChevronRight 
} from 'react-icons/fa';
import './HomeReview.css';

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/testimonials`;
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

const formatImageUrl = (path) => {
  if (!path) return DEFAULT_AVATAR;
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const HomeReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef(null);

  /* ----------------------------------------------------
     FETCH ONLY DYNAMIC TESTIMONIALS FROM DATABASE API
  ---------------------------------------------------- */
  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/active`);
        const result = await response.json();

        if (isMounted) {
          if (result.success && Array.isArray(result.data)) {
            // Strictly real, active testimonials from the database
            const activeOnly = result.data.filter((item) => item.status === 'Active');
            setReviews(activeOnly);
          } else {
            setReviews([]);
          }
        }
      } catch (error) {
        console.error('Error fetching dynamic testimonials:', error);
        if (isMounted) setReviews([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalReviews = reviews.length;

  // Auto-slide 1 -> 2 -> 3 -> 1 -> 2 -> 3 continuously
  useEffect(() => {
    if (totalReviews <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalReviews);
    }, 3800);

    return () => clearInterval(timer);
  }, [totalReviews, isPaused]);

  // Smoothly scroll the carousel track to the active slide
  useEffect(() => {
    if (!trackRef.current || totalReviews <= 1) return;
    const track = trackRef.current;
    const cards = track.querySelectorAll('.home-review__card');
    if (!cards || !cards[currentIndex]) return;

    const targetCard = cards[currentIndex];
    track.scrollTo({
      left: targetCard.offsetLeft - track.offsetLeft,
      behavior: 'smooth',
    });
  }, [currentIndex, totalReviews]);

  const handlePrev = () => {
    if (totalReviews <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? totalReviews - 1 : prev - 1));
  };

  const handleNext = () => {
    if (totalReviews <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalReviews);
  };

  const renderStars = (count = 5) => {
    const num = Math.max(1, Math.min(5, Number(count) || 5));
    return Array.from({ length: 5 }, (_, index) =>
      index < num ? (
        <FaStar key={index} className="home-review__star home-review__star--active" />
      ) : (
        <FaRegStar key={index} className="home-review__star" />
      )
    );
  };

  if (loading) {
    return (
      <section className="home-review">
        <div className="home-review__wrapper">
          <div className="home-review__loading">
            <p>Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  // Do not render if no active testimonials in database
  if (totalReviews === 0) {
    return null;
  }

  return (
    <section className="home-review">
      <div className="home-review__wrapper">
        {/* ==========================================================
            SECTION HEADER & ARROWS
        ========================================================== */}
        <div className="home-review__header">
          <div className="home-review__title-group">
            <span className="home-review__subtitle">Testimonials</span>
            <h2 className="home-review__heading">What Our Client Say</h2>
          </div>

          {totalReviews > 1 && (
            <div className="home-review__nav-group">
              <button
                type="button"
                className="home-review__nav-btn"
                onClick={handlePrev}
                aria-label="Previous testimonial"
                title="Previous"
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                className="home-review__nav-btn"
                onClick={handleNext}
                aria-label="Next testimonial"
                title="Next"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>

        {/* ==========================================================
            TESTIMONIALS SLIDER TRACK
        ========================================================== */}
        <div
          className="home-review__carousel-container"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className={`home-review__track ${
              totalReviews === 1 ? 'home-review__track--single' : ''
            }`} 
            ref={trackRef}
          >
            {reviews.map((review, index) => {
              const accent = review.accentColor || '#0a3b49';
              const isActive = index === currentIndex;

              return (
                <article
                  className={`home-review__card ${
                    isActive ? 'home-review__card--active' : ''
                  }`}
                  key={review._id || index}
                  style={{
                    borderTopColor: accent,
                  }}
                >
                  <div className="home-review__card-inner">
                    <FaQuoteLeft
                      className="home-review__quote-icon"
                      style={{ color: accent }}
                    />

                    <p className="home-review__quote-text">
                      "{review.message}"
                    </p>

                    <div className="home-review__author-row">
                      <div className="home-review__author-info">
                        <div
                          className="home-review__avatar-wrap"
                          style={{ borderColor: accent }}
                        >
                          <img
                            src={formatImageUrl(review.profileImage)}
                            alt={review.clientName}
                            className="home-review__avatar"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_AVATAR;
                            }}
                          />
                        </div>
                        <div className="home-review__details">
                          <h4 className="home-review__author-name">
                            {review.clientName}
                          </h4>
                          <span className="home-review__author-role">
                            {review.designation}
                          </span>
                          <div className="home-review__rating">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>

                      {review.company && (
                        <div className="home-review__company-badge">
                          {review.logo ? (
                            <img
                              src={formatImageUrl(review.logo)}
                              alt={review.company}
                              style={{
                                height: '22px',
                                maxWidth: '70px',
                                objectFit: 'contain',
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="home-review__brand">
                              {review.company}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* ==========================================================
            PAGINATION DOTS (1, 2, 3...)
        ========================================================== */}
        {totalReviews > 1 && (
          <div className="home-review__pagination">
            {reviews.map((_, index) => (
              <button
                type="button"
                key={index}
                aria-label={`Slide ${index + 1}`}
                className={`home-review__dot ${
                  currentIndex === index ? 'home-review__dot--active' : ''
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeReview;