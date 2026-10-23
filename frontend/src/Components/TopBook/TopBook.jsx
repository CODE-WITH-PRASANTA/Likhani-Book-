import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { fetchTopCategories } from '../../api/booksService';
import './TopBook.css';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=85';

const TopBook = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

  // Fetch dynamic top-selling categories from database
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchTopCategories();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
          } else {
            setCategories([]);
          }
        }
      } catch (err) {
        console.error('Failed to load top categories from database:', err);
        if (isMounted) setCategories([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalItems = categories.length;

  const handlePrev = () => {
    if (totalItems === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
  };

  const handleNext = () => {
    if (totalItems === 0) return;
    setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
  };

  const handleCategoryClick = (catTitle) => {
    if (!catTitle) return;
    navigate(`/shop?category=${encodeURIComponent(catTitle)}`);
  };

  useEffect(() => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const card = track.querySelector('.top-book__item');
    if (!card) return;

    const cardWidth = card.getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 24;

    track.scrollTo({
      left: currentIndex * (cardWidth + gap),
      behavior: 'smooth',
    });
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused || totalItems <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, totalItems]);

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <section className="top-book">
      <div className="top-book__wrapper">
        <div className="top-book__border-frame">
          <div className="top-book__header-badge">
            <h2 className="top-book__heading">Top Categories Book</h2>
          </div>

          <button
            type="button"
            className="top-book__arrow top-book__arrow--left"
            onClick={handlePrev}
            aria-label="Previous category"
          >
            <FaChevronLeft />
          </button>

          <button
            type="button"
            className="top-book__arrow top-book__arrow--right"
            onClick={handleNext}
            aria-label="Next category"
          >
            <FaChevronRight />
          </button>

          <div
            className="top-book__track"
            ref={trackRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {categories.map((cat, idx) => (
              <div
                className={`top-book__item ${
                  currentIndex === idx ? 'top-book__item--active' : ''
                }`}
                key={cat.id || idx}
                onClick={() => handleCategoryClick(cat.title)}
                title={`Explore ${cat.title} books (${cat.count || 0} available)`}
              >
                <div className="top-book__circle-box">
                  <span className="top-book__badge-num">
                    {cat.number || String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="top-book__image-wrap">
                    <img
                      src={cat.image || FALLBACK_IMG}
                      alt={cat.title}
                      className="top-book__img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMG;
                      }}
                    />
                  </div>
                </div>
                <h3 className="top-book__title">
                  {cat.title} ({cat.count ?? 0})
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopBook;