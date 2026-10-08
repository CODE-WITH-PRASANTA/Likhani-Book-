import React, { useState, useRef, useEffect } from 'react';
import { 
  FaStar, 
  FaRegStar, 
  FaQuoteLeft, 
  FaChevronLeft, 
  FaChevronRight,
  FaBuilding
} from 'react-icons/fa';
import './HomeReview.css';

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/testimonials`;

// Fallback avatar if client didn't upload any picture
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

const formatImageUrl = (path) => {
  if (!path) return DEFAULT_AVATAR;
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  return `${BASE_URL}${path}`;
};

const HomeReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef(null);

  /* ----------------------------------------------------
     FETCH TESTIMONIALS FROM BACKEND
  ---------------------------------------------------- */
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Uses the active endpoint (or falls back to standard route)
        const response = await fetch(`${API_URL}/active`);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          // If you use general endpoint, filter active items here:
          const activeOnly = result.data.filter((item) => item.status === 'Active');
          setReviews(activeOnly);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const totalReviews = reviews.length;

  const handlePrev = () => {
    if (totalReviews === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? totalReviews - 1 : prev - 1));
  };

  const handleNext = () => {
    if (totalReviews === 0) return;
    setCurrentIndex((prev) => (prev >= totalReviews - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!trackRef.current || totalReviews === 0) return;
    const track = trackRef.current;
    const card = track.querySelector('.home-review__card');
    if (!card) return;

    const cardWidth = card.getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 24;

    track.scrollTo({
      left: currentIndex * (cardWidth + gap),
      behavior: 'smooth',
    });
  }, [currentIndex, totalReviews]);

  const renderStars = (count = 5) => {
    return Array.from({ length: 5 }, (_, index) => (
      index < count ? (
        <FaStar key={index} className="home-review__star home-review__star--active" />
      ) : (
        <FaRegStar key={index} className="home-review__star" />
      )
    ));
  };

  if (loading) {
    return (
      <section className="home-review">
        <div className="home-review__wrapper">
          <div className="home-review__loading" style={{ textAlign: 'center', padding: '40px 0' }}>
            <p>Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (totalReviews === 0) {
    return null; // Don't render section if there are no active testimonials
  }

  return (
    <section className="home-review">
      <div className="home-review__wrapper">
        
        {/* ==========================================================
            SECTION HEADER & CONTROLS
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
                aria-label="Previous review"
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                className="home-review__nav-btn"
                onClick={handleNext}
                aria-label="Next review"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>

        {/* ==========================================================
            TESTIMONIALS SLIDER TRACK
        ========================================================== */}
        <div className="home-review__carousel-container">
          <div className="home-review__track" ref={trackRef}>
            {reviews.map((review) => (
              <article 
                className="home-review__card" 
                key={review._id}
                style={{
                  borderTop: review.accentColor ? `3px solid ${review.accentColor}` : undefined
                }}
              >
                <div className="home-review__card-inner">
                  <FaQuoteLeft 
                    className="home-review__quote-icon" 
                    style={{ color: review.accentColor || undefined }} 
                  />
                  <p className="home-review__quote-text">"{review.message}"</p>

                  <div className="home-review__author-row">
                    <div className="home-review__author-info">
                      <div className="home-review__avatar-wrap">
                        <img 
                          src={formatImageUrl(review.profileImage)} 
                          alt={review.clientName} 
                          className="home-review__avatar" 
                          loading="lazy" 
                        />
                      </div>
                      <div className="home-review__details">
                        <h4 className="home-review__author-name">{review.clientName}</h4>
                        <span className="home-review__author-role">{review.designation}</span>
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
                            style={{ height: '22px', maxWidth: '70px', objectFit: 'contain' }} 
                          />
                        ) : (
                          <span className="home-review__brand">{review.company}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ==========================================================
            PAGINATION DOTS
        ========================================================== */}
        {totalReviews > 1 && (
          <div className="home-review__pagination">
            {reviews.map((_, index) => (
              <button
                type="button"
                key={index}
                aria-label={`Go to review slide ${index + 1}`}
                className={`home-review__dot ${currentIndex === index ? 'home-review__dot--active' : ''}`}
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