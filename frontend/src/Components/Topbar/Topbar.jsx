import React from 'react';
import './Topbar.css';

const Topbar = () => {
  return (
    <header className="topbar">
      <div className="topbar__container">
        {/* Left Section: Phone, Email, Hours */}
        <div className="topbar__left">
          <a href="tel:+20866660112" className="topbar__item topbar__link">
            <svg
              className="topbar__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>+208-6666-0112</span>
          </a>

          <span className="topbar__divider" />

          <a href="mailto:info@example.com" className="topbar__item topbar__link">
            <svg
              className="topbar__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span>info@example.com</span>
          </a>

          <span className="topbar__divider" />

          <div className="topbar__item">
            <svg
              className="topbar__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Sunday - Fri: 9 aM - 6 pM</span>
          </div>
        </div>

        {/* Right Section: Live Chat & Login */}
        <div className="topbar__right">
          <a href="#live-chat" className="topbar__item topbar__link">
            <svg
              className="topbar__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              <circle cx="16" cy="9" r="1" fill="currentColor" />
            </svg>
            <span>Live Chat</span>
          </a>

          <a href="#login" className="topbar__item topbar__link">
            <svg
              className="topbar__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
            </svg>
            <span>Login</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Topbar;