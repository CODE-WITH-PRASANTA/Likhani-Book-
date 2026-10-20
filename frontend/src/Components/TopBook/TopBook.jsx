import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { fetchTopCategories } from '../../api/booksService';
import './TopBook.css';

const DEFAULT_FALLBACK_CATEGORIES = [
  {
    id: 'c1',
    number: '01',
    title: 'Fiction',
    count: 2,
    totalSold: 5,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'c2',
    number: '02',
    title: 'Demohhh',
    count: 2,
    totalSold: 1,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'c3',
    number: '03',
    title: 'Business & Finance',
    count: 3,
    totalSold: 0,
    image: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'c4',
    number: '04',
    title: 'Fiction & Literature',
    count: 3,
    totalSold: 0,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'c5',
    number: '05',
    title: 'History & Philosophy',
    count: 3,
    totalSold: 0,
    image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'c6',
    number: '06',
    title: 'Science & Technology',
    count: 3,
    totalSold: 0,
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'c7',
    number: '07',
    title: 'Self-Help & Wellness',
    count: 3,
    totalSold: 0,
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=85',
  },
];

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=85';

const TopBook = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(DEFAULT_FALLBACK_CATEGORIES);
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
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to load top categories from database:', err);
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