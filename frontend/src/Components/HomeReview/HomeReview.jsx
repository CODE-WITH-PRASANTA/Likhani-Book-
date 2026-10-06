import React, { useState, useRef, useEffect } from 'react';
import { 
  FaStar, 
  FaRegStar, 
  FaQuoteLeft, 
  FaChevronLeft, 
  FaChevronRight 
} from 'react-icons/fa';
import './HomeReview.css';

const REVIEWS = [
  {
    id: 'rev1',
    quote: 'The Art of Possibility by Rosamund Stone Zander and Benjamin Zander is a transformative read that challenges conventional thinking and opens up new possibilities. As a reader, I found myself profoundly inspired.',
    name: 'Ronald Richards',
    role: 'Marketing Coordinator',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=85',
    company: 'Envato',
    highlightBorder: false,
  },
  {
    id: 'rev2',
    quote: 'From the very first chapter, the authors engage readers with inspiring stories and practical insights. Benjamin Zander experiences as a conductor bring a unique perspective to leadership and creative growth.',
    name: 'Eleanor Vance',
    role: 'Creative Director',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85',
    company: 'Amazon',
    highlightBorder: true,
  },
  {
    id: 'rev3',
    quote: 'One of the most powerful takeaways from this book is the emphasis on adopting a mindset of abundance and connection. The idea that we can choose to see opportunities rather than limitations is a game-changer.',
    name: 'Marcus Sterling',
    role: 'Product Strategist',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85',
    company: 'Google',
    highlightBorder: false,
  },
  {
    id: 'rev4',
    quote: 'An absolute masterpiece of personal development. It reshaped how our entire team handles challenges and communicates under pressure. Truly a recommended read for all professionals.',
    name: 'Sophia Loren',
    role: 'Senior Editor',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=85',
    company: 'Netflix',
    highlightBorder: false,
  },
];

// Duplicate list for seamless infinite marquee loop
const EXTENDED_REVIEWS = [...REVIEWS, ...REVIEWS];

const HomeReview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef(null);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? REVIEWS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= REVIEWS.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const card = track.querySelector('.home-review__card');
    if (!card) return;

    const cardWidth = card.getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 24;

    track.scrollTo({
      left: currentIndex * (cardWidth + gap),
      behavior: 'smooth',
    });
  }, [currentIndex]);

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, index) => (
      index < count ? (
        <FaStar key={index} className="home-review__star home-review__star--active" />
      ) : (
        <FaRegStar key={index} className="home-review__star" />
      )
    ));
  };

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
        </div>

        {/* ==========================================================
            TESTIMONIALS SLIDER TRACK
        ========================================================== */}
        <div className="home-review__carousel-container">
          <div className="home-review__track" ref={trackRef}>
            {EXTENDED_REVIEWS.map((review, idx) => (
              <article 
                className={`home-review__card ${review.highlightBorder ? 'home-review__card--highlight' : ''}`} 
                key={`${review.id}-${idx}`}
              >
                <div className="home-review__card-inner">
                  <FaQuoteLeft className="home-review__quote-icon" />
                  <p className="home-review__quote-text">"{review.quote}"</p>

                  <div className="home-review__author-row">
                    <div className="home-review__author-info">
                      <div className="home-review__avatar-wrap">
                        <img src={review.avatar} alt={review.name} className="home-review__avatar" loading="lazy" />
                      </div>
                      <div className="home-review__details">
                        <h4 className="home-review__author-name">{review.name}</h4>
                        <span className="home-review__author-role">{review.role}</span>
                        <div className="home-review__rating">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>

                    <div className="home-review__company-badge">
                      <span className="home-review__brand">{review.company}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ==========================================================
            PAGINATION DOTS
        ========================================================== */}
        <div className="home-review__pagination">
          {REVIEWS.map((_, index) => (
            <button
              type="button"
              key={index}
              aria-label={`Go to review slide ${index + 1}`}
              className={`home-review__dot ${currentIndex === index ? 'home-review__dot--active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default HomeReview;