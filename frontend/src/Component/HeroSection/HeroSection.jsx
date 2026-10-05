import React, { useRef, useEffect, useCallback } from 'react';
import { FaArrowRight, FaStar } from 'react-icons/fa';
import bookStackImg from "../../assets/Bookhome.webp";
import readerGirlImg from "../../assets/home girl.webp";
import './HeroSection.css';

const HeroSection = () => {
  const visualRef = useRef(null);
  const frameRef = useRef(null);
  const targetTilt = useRef({ x: 0, y: 0 });
  const currentTilt = useRef({ x: 0, y: 0 });

  // Smoothly animate the 3D tilt / orbit rotation / multi-layer parallax toward
  // the mouse target every frame — this is what gives the visual its depth ("4D") feel.
  const animate = useCallback(() => {
    const el = visualRef.current;
    if (el) {
      const ease = 0.08;
      currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * ease;
      currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * ease;

      const { x, y } = currentTilt.current;
      el.style.setProperty('--tiltX', `${x.toFixed(2)}deg`);
      el.style.setProperty('--tiltY', `${y.toFixed(2)}deg`);
      el.style.setProperty('--orbitSpin', `${(x * 3.2).toFixed(2)}deg`);
      el.style.setProperty('--parallaxX', `${(y * -1.6).toFixed(2)}px`);
      el.style.setProperty('--parallaxY', `${(x * 1.6).toFixed(2)}px`);
    }
    frameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) return undefined;

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate]);

  const handleMouseMove = (e) => {
    const el = visualRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    targetTilt.current = { x: px * 16, y: py * -16 };
  };

  const handleMouseLeave = () => {
    targetTilt.current = { x: 0, y: 0 };
  };

  return (
    <section className="hero-section">
      <span className="hero-section__grain" aria-hidden="true" />
      <span className="hero-section__frame" aria-hidden="true" />

      <div className="hero-section__decor" aria-hidden="true">
        <span className="hero-section__dots hero-section__dots--top" />
        <span className="hero-section__dots hero-section__dots--bottom" />
        <span className="hero-section__glow hero-section__glow--one" />
        <span className="hero-section__glow hero-section__glow--two" />
      </div>

      <div className="hero-section__container">
        <div className="hero-section__content">
          <div className="hero-section__eyebrow-row">
            <span className="hero-section__eyebrow-line" />
            <p className="hero-section__eyebrow">Up to 30% off this week</p>
          </div>

          <h1 className="hero-section__title">
            Get your next great read
            <br />
            without paying full price
          </h1>

          <p className="hero-section__subtitle">
            Thousands of titles, hand-picked shelves, and prices that make
            starting your next chapter an easy decision.
          </p>

          <div className="hero-section__actions">
            <button type="button" className="hero-section__cta">
              <span className="hero-section__cta-label">Shop Now</span>
              <FaArrowRight className="hero-section__cta-icon" />
            </button>
            <a href="#catalog" className="hero-section__ghost-link">
              Browse Catalog
            </a>
          </div>
        </div>

        <div
          className="hero-section__visual"
          ref={visualRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <span className="hero-section__ring hero-section__ring--outer" aria-hidden="true">
            <span className="hero-section__ring-dot" />
          </span>
          <span className="hero-section__ring hero-section__ring--inner" aria-hidden="true" />
          <span className="hero-section__blob" aria-hidden="true">
            <span className="hero-section__blob-sheen" />
          </span>

          <div className="hero-section__figure">
            <img
              src={readerGirlImg}
              alt="Reader holding an open book"
              className="hero-section__figure-img"
              loading="eager"
            />
          </div>

          <div className="hero-section__stack" aria-hidden="false">
            <img
              src={bookStackImg}
              alt="Stack of colorful books"
              className="hero-section__stack-img"
              loading="lazy"
            />
          </div>

          <div className="hero-section__chip">
            <span className="hero-section__chip-stars">
              <FaStar /> 4.9
            </span>
            <span className="hero-section__chip-divider" />
            <span className="hero-section__chip-text">12k+ happy readers</span>
          </div>

          <span className="hero-section__spark hero-section__spark--one" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L13.6 9.4L21 11L13.6 12.6L12 20L10.4 12.6L3 11L10.4 9.4L12 2Z"
                fill="currentColor"
              />
            </svg>
          </span>

          <span className="hero-section__plane" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 4L3 11.5L10.5 13.5M21 4L15.5 21L10.5 13.5M21 4L10.5 13.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hero-section__plane-trail" />
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;