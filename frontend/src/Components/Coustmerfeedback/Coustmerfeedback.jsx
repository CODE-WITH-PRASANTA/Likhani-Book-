import React, { useState, useEffect } from 'react';
import API, { IMG_URL } from '../../api/axios';
import './Coustmerfeedback.css';

const Coustmerfeedback = () => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reviews dynamically from the backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const res = await API.get('/reviews', {
          params: {
            limit: 20,
            sort: 'latest',
          },
        });

        if (res.data?.success && res.data.data?.length > 0) {
          const backendReviews = res.data.data.map((r, index) => {
            const avatar = r.userImage && r.userImage.trim()
              ? (r.userImage.startsWith('http') ? r.userImage : `${IMG_URL}${r.userImage.startsWith('/') ? '' : '/'}${r.userImage}`)
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(r.user || 'Reader')}&background=eaf3ff&color=1674e8&bold=true`;

            const bookCover = r.bookImage && r.bookImage.trim()
              ? (r.bookImage.startsWith('http') ? r.bookImage : `${IMG_URL}${r.bookImage.startsWith('/') ? '' : '/'}${r.bookImage}`)
              : null;

            return {
              id: r._id || r.id || `rev-${index}`,
              quote: r.comment && r.comment.trim() ? r.comment.trim() : "An insightful and inspiring book review from our community reader.",
              name: r.user || "Verified Reader",
              role: r.book ? `Reader of "${r.book}"` : "Verified Reader",
              rating: Math.min(Math.max(Number(r.rating) || 5, 1), 5),
              avatar: avatar,
              company: r.book || "Lekhani Book",
              companyLogo: bookCover,
              accentColor: index % 2 === 0 ? "teal" : "black",
              hasTopBorder: index % 3 === 0,
            };
          });

          setReviews(backendReviews);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error("Failed to fetch customer reviews for feedback section:", err);
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Screen displays 3 cards at a time
  const visibleCards = 3;
  const maxIndex = Math.max(0, reviews.length - visibleCards);

  // Smooth auto-sliding (every 3.5 seconds)
  useEffect(() => {
    if (isPaused || maxIndex <= 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, maxIndex]);

  if (!isLoading && reviews.length === 0) {
    return null;
  }

  return (
    <section className="feedback-section">
      {/* Header */}
      <div className="feedback-header">
        <h2 className="feedback-title">Customer Feedback</h2>
        <p className="feedback-subtitle">
          Interdum et malesuada fames ac ante ipsum primis in faucibus.
          <br />
          Donec at nulla nulla. Duis posuere ex lacus
        </p>
      </div>

      {/* Slider Viewport */}
      <div 
        className="feedback-carousel-viewport"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className="feedback-slider-track"
          style={{
            transform: `translateX(calc(-${currentIndex} * (100% / 3 + 24px / 3)))`
          }}
        >
          {reviews.map((item, index) => (
            <div 
              key={item.id || index} 
              className={`feedback-card ${item.hasTopBorder ? 'has-orange-border' : ''}`}
            >
              <p className="feedback-quote">{item.quote}</p>
              
              <div className="feedback-footer">
                {/* User Avatar with cut-out background */}
                <div className={`avatar-container accent-${item.accentColor}`}>
                  <div className="corner-cutout"></div>
                  <img 
                    src={item.avatar} 
                    alt={item.name} 
                    className="avatar-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'Reader')}&background=eaf3ff&color=1674e8&bold=true`;
                    }}
                  />
                </div>

                {/* Author Info & Star Rating */}
                <div className="author-details">
                  <h4 className="author-name">{item.name}</h4>
                  <span className="author-role">{item.role}</span>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        className={`star ${star <= item.rating ? 'filled' : 'empty'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {/* Company Logo or Book Cover */}
                <div className="company-logo-wrap">
                  <img 
                    src={item.companyLogo} 
                    alt={item.company} 
                    className="company-logo" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      {maxIndex > 0 && (
        <div className="feedback-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
            <button
              key={dotIdx}
              className={`dot ${currentIndex === dotIdx ? 'active' : ''}`}
              onClick={() => setCurrentIndex(dotIdx)}
              aria-label={`Go to review ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Coustmerfeedback;