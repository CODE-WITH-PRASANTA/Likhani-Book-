import React, { useState, useRef, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaAward } from 'react-icons/fa';
import './HomeAuthor.css';

const AUTHORS = [
  {
    id: 'auth1',
    name: 'Shikhon Islam',
    booksCount: '07 Published Books',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=85',
  },
  {
    id: 'auth2',
    name: 'Kawser Ahmed',
    booksCount: '04 Published Books',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=85',
  },
  {
    id: 'auth3',
    name: 'Brooklyn Simmons',
    booksCount: '15 Published Books',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=85',
  },
  {
    id: 'auth4',
    name: 'Leslie Alexander',
    booksCount: '05 Published Books',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=85',
  },
  {
    id: 'auth5',
    name: 'Guy Hawkins',
    booksCount: '12 Published Books',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=85',
  },
  {
    id: 'auth6',
    name: 'Esther Howard',
    booksCount: '10 Published Books',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=85',
  },
];

const HomeAuthor = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef(null);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? AUTHORS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= AUTHORS.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const card = track.querySelector('.home-author__card');
    if (!card) return;

    const cardWidth = card.getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 24;

    track.scrollTo({
      left: currentIndex * (cardWidth + gap),
      behavior: 'smooth',
    });
  }, [currentIndex]);

  return (
    <section className="home-author">
      <div className="home-author__wrapper">
        
        {/* ==========================================================
            SECTION HEADER & SUBTITLE
        ========================================================== */}
        <div className="home-author__header">
          <h2 className="home-author__heading">Featured Author</h2>
          <p className="home-author__subtext">
            Interdum et malesuada fames ac ante ipsum primis in faucibus.<br />
            Donec at nulla nulla. Duis posuere ex lacus.
          </p>
        </div>

        {/* ==========================================================
            CAROUSEL WRAPPER WITH NAVIGATION ARROWS
        ========================================================== */}
        <div className="home-author__carousel-container">
          <button
            type="button"
            className="home-author__arrow home-author__arrow--left"
            onClick={handlePrev}
            aria-label="Previous author"
          >
            <ChevronLeftIcon />
          </button>

          <button
            type="button"
            className="home-author__arrow home-author__arrow--right"
            onClick={handleNext}
            aria-label="Next author"
          >
            <ChevronRightIcon />
          </button>

          <div className="home-author__track-overflow" ref={trackRef}>
            <div className="home-author__track">
              {AUTHORS.map((author, idx) => {
                const isActive = currentIndex === idx;

                return (
                  <article
                    className={`home-author__card ${isActive ? 'home-author__card--active' : ''}`}
                    key={author.id}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    {/* Laurel Wreath Avatar Frame */}
                    <div className="home-author__avatar-container">
                      <div className="home-author__wreath-ring">
                        {/* Wreath decoration vector simulation */}
                        <svg className="home-author__wreath-svg" viewBox="0 0 160 160">
                          <circle cx="80" cy="80" r="74" fill="none" stroke="#d4af37" strokeWidth="2" strokeDasharray="6 4" />
                        </svg>
                      </div>
                      <div className="home-author__image-wrap">
                        <img src={author.image} alt={author.name} className="home-author__img" loading="lazy" />
                      </div>
                    </div>

                    {/* Dotted Info Box */}
                    <div className={`home-author__info-box ${isActive ? 'home-author__info-box--active' : ''}`}>
                      <h3 className="home-author__name">{author.name}</h3>
                      <p className="home-author__books">{author.booksCount}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==========================================================
            PAGINATION DOTS
        ========================================================== */}
        <div className="home-author__pagination">
          {AUTHORS.map((_, index) => (
            <button
              type="button"
              key={index}
              aria-label={`Go to author slide ${index + 1}`}
              className={`home-author__dot ${currentIndex === index ? 'home-author__dot--active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

// Helper Icon Components for clean JSX
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default HomeAuthor;