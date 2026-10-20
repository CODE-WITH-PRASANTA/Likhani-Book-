import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFeaturedAuthors } from '../../api/booksService';
import './FeatureAuthor.css';

// Fallback authors if API returns empty list
const DEFAULT_AUTHORS = [
  {
    id: 1,
    name: "Brooklyn Simmons",
    books: "15 Published Books",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    name: "Leslie Alexander",
    books: "05 Published Books",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    name: "Guy Hawkins",
    books: "12 Published Books",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: 4,
    name: "Esther Howard",
    books: "10 Published Books",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: 5,
    name: "Shikhon Islam",
    books: "07 Published Books",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: 6,
    name: "Kawser Ahmed",
    books: "04 Published Books",
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: 7,
    name: "Eleanor Pena",
    books: "09 Published Books",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: 8,
    name: "Cody Fisher",
    books: "11 Published Books",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80"
  },
];

// Golden Laurel Wreath SVG Icon
const LaurelWreathSVG = () => (
  <svg 
    className="laurel-wreath-icon" 
    viewBox="0 0 160 160" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left Branch */}
    <g fill="#c99738">
      <path d="M72,150 C40,146 16,118 16,80 C16,56 28,34 46,20" stroke="#c99738" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M44,22 C41,20 37,25 39,28 C43,33 49,27 44,22 Z" />
      <path d="M33,36 C29,33 26,39 28,42 C33,48 39,41 33,36 Z" />
      <path d="M24,53 C20,51 18,57 20,61 C26,67 31,59 24,53 Z" />
      <path d="M19,73 C15,72 14,79 17,82 C23,88 28,80 19,73 Z" />
      <path d="M19,94 C16,94 15,101 19,104 C26,108 30,100 19,94 Z" />
      <path d="M26,114 C23,115 24,122 28,124 C36,127 39,118 26,114 Z" />
      <path d="M39,132 C36,134 39,141 43,141 C52,143 53,134 39,132 Z" />
      <path d="M57,144 C55,146 60,152 64,151 C73,151 72,142 57,144 Z" />
    </g>
    {/* Right Branch */}
    <g fill="#c99738">
      <path d="M88,150 C120,146 144,118 144,80 C144,56 132,34 114,20" stroke="#c99738" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M116,22 C119,20 123,25 121,28 C117,33 111,27 116,22 Z" />
      <path d="M127,36 C131,33 134,39 132,42 C127,48 121,41 127,36 Z" />
      <path d="M136,53 C140,51 142,57 140,61 C134,67 129,59 136,53 Z" />
      <path d="M141,73 C145,72 146,79 143,82 C137,88 132,80 141,73 Z" />
      <path d="M141,94 C144,94 145,101 141,104 C134,108 130,100 141,94 Z" />
      <path d="M134,114 C137,115 136,122 132,124 C124,127 121,118 134,114 Z" />
      <path d="M121,132 C124,134 121,141 117,141 C108,143 107,134 121,132 Z" />
      <path d="M103,144 C105,146 100,152 96,151 C87,151 88,142 103,144 Z" />
    </g>
  </svg>
);

const FeatureAuthor = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState(DEFAULT_AUTHORS);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [stepPx, setStepPx] = useState(0);
  const trackRef = useRef(null);

  // Fetch real authors dynamically from backend
  useEffect(() => {
    let isMounted = true;
    const loadAuthors = async () => {
      try {
        setLoading(true);
        const data = await fetchFeaturedAuthors();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setAuthors(data);
          } else {
            setAuthors(DEFAULT_AUTHORS);
          }
        }
      } catch (err) {
        console.error("Failed to load featured authors:", err);
        if (isMounted) setAuthors(DEFAULT_AUTHORS);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAuthors();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute exact sliding step (card width + 20px gap) on resize and author load
  useEffect(() => {
    const updateStep = () => {
      if (!trackRef.current) return;
      const firstCard = trackRef.current.querySelector('.author-card');
      if (firstCard) {
        const width = firstCard.getBoundingClientRect().width;
        setStepPx(width + 20); // 20px gap
      }
    };

    updateStep();
    window.addEventListener('resize', updateStep);
    return () => window.removeEventListener('resize', updateStep);
  }, [authors.length]);

  // Determine visible count based on window width
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 6;
    if (window.innerWidth <= 400) return 1;
    if (window.innerWidth <= 600) return 2;
    if (window.innerWidth <= 850) return 3;
    if (window.innerWidth <= 1150) return 4;
    return 6;
  };

  const visibleCards = getVisibleCount();
  const maxIndex = Math.max(0, authors.length - visibleCards);

  // Auto-slide every 3.5 seconds (paused on hover)
  useEffect(() => {
    if (isPaused || maxIndex <= 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused, maxIndex]);

  const handleAuthorClick = (authorName) => {
    if (authorName) {
      navigate(`/shop?search=${encodeURIComponent(authorName)}`);
    }
  };

  return (
    <section className="featured-author-section">
      {/* Header section */}
      <div className="author-header">
        <h2 className="author-title">Featured Author</h2>
        <p className="author-subtitle">
          Discover distinguished authors and their published literary works in our collection.
          <br />
          Explore titles, philosophy, and stories written for avid readers.
        </p>
      </div>

      {/* Carousel viewport */}
      <div 
        className="author-carousel-viewport"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className="author-slider-track"
          ref={trackRef}
          style={{
            transform: stepPx > 0 ? `translateX(-${currentIndex * stepPx}px)` : 'translateX(0px)'
          }}
        >
          {authors.map((author, index) => (
            <div 
              key={author.id || index} 
              className="author-card"
              onClick={() => handleAuthorClick(author.name)}
              title={`View books by ${author.name}`}
              style={{ cursor: 'pointer' }}
            >
              {/* Golden laurel wreath and circular avatar */}
              <div className="author-avatar-wrapper">
                <LaurelWreathSVG />
                <div className="author-img-container">
                  <img 
                    src={author.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"} 
                    alt={author.name} 
                    className="author-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
                    }}
                  />
                </div>
              </div>

              {/* Dashed info box */}
              <div className="author-info-box">
                <h4 className="author-name">{author.name}</h4>
                <p className="author-books">{author.books}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureAuthor;