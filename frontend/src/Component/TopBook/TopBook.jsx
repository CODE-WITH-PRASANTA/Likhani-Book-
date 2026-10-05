import React, { useState, useRef, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './TopBook.css';

const CATEGORIES = [
  {
    id: 'c1',
    number: '01',
    title: 'Romance Books',
    count: 80,
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'c2',
    number: '02',
    title: 'Design Low Book',
    count: 6,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'c3',
    number: '03',
    title: 'Safe Home',
    count: 5,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'c4',
    number: '04',
    title: 'Grow Flower',
    count: 7,
    image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'c5',
    number: '05',
    title: 'Adventure Book',
    count: 4,
    image: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'c6',
    number: '06',
    title: 'Science Fiction',
    count: 22,
    image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'c7',
    number: '07',
    title: 'Philosophy Guide',
    count: 14,
    image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=85',
  },
];

const TopBook = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef(null);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? CATEGORIES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === CATEGORIES.length - 1 ? 0 : prev + 1));
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
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === CATEGORIES.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

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
            {CATEGORIES.map((cat, idx) => (
              <div
                className={`top-book__item ${currentIndex === idx ? 'top-book__item--active' : ''}`}
                key={cat.id}
                onClick={() => setCurrentIndex(idx)}
              >
                <div className="top-book__circle-box">
                  <span className="top-book__badge-num">{cat.number}</span>
                  <div className="top-book__image-wrap">
                    <img src={cat.image} alt={cat.title} className="top-book__img" loading="lazy" />
                  </div>
                </div>
                <h3 className="top-book__title">
                  {cat.title} ({cat.count})
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