import React, { useState, useEffect } from "react";
import "./Footer.css";
import logoImg from "../../assets/booklogo.webp";

import {
  FiPhoneCall,
  FiMail,
  FiClock,
  FiMapPin,
  FiSend,
  FiChevronUp,
  FiChevronsRight,
  FiFacebook,
  FiTwitter,
  FiYoutube,
  FiLinkedin,
} from "react-icons/fi";

const Footer = () => {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      alert(`Subscribed successfully with: ${email}`);
      setEmail("");
    }
  };

  return (
    <footer className="footer-wrapper">
      <div className="footer-container">
        {/* ================= TOP CONTACT INFO BAR ================= */}
        <div className="footer-top-bar">
          {/* Call Us */}
          <div className="footer-contact-item">
            <div className="footer-contact-icon-box">
              <FiPhoneCall />
            </div>
            <div className="footer-contact-text">
              <span className="footer-contact-label">Call Us 7/24</span>
              <h4 className="footer-contact-value">
                <a href="tel:+2085550112">+208-555-0112</a>
              </h4>
            </div>
          </div>

          {/* Make a Quote */}
          <div className="footer-contact-item">
            <div className="footer-contact-icon-box">
              <FiMail />
            </div>
            <div className="footer-contact-text">
              <span className="footer-contact-label">Make a Quote</span>
              <h4 className="footer-contact-value">
                <a href="mailto:example@gmail.com">example@gmail.com</a>
              </h4>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="footer-contact-item">
            <div className="footer-contact-icon-box">
              <FiClock />
            </div>
            <div className="footer-contact-text">
              <span className="footer-contact-label">Opening Hour</span>
              <h4 className="footer-contact-value">Sunday - Fri: 9 AM - 6 PM</h4>
            </div>
          </div>

          {/* Location */}
          <div className="footer-contact-item">
            <div className="footer-contact-icon-box">
              <FiMapPin />
            </div>
            <div className="footer-contact-text">
              <span className="footer-contact-label">Location</span>
              <h4 className="footer-contact-value">4517 Washington Ave.</h4>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* ================= MAIN 4-COLUMN FOOTER CONTENT ================= */}
        <div className="footer-main-grid">
          {/* Column 1: Brand / Description / Socials */}
          <div className="footer-col footer-brand-col">
            <div className="footer-brand-header">
              <img
                src={logoImg}
                alt="Bookle Logo"
                className="footer-brand-logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <p className="footer-brand-description">
              Phasellus ultricies aliquam volutpat ullamcorper laoreet neque, a
              lacinia curabitur lacinia mollis.
            </p>

            {/* Social Icons */}
            <div className="footer-social-links">
              <a href="#facebook" aria-label="Facebook" className="footer-social-box">
                <FiFacebook />
              </a>
              <a href="#twitter" aria-label="Twitter" className="footer-social-box">
                <FiTwitter />
              </a>
              <a href="#youtube" aria-label="YouTube" className="footer-social-box">
                <FiYoutube />
              </a>
              <a href="#linkedin" aria-label="LinkedIn" className="footer-social-box">
                <FiLinkedin />
              </a>
            </div>

            {/* Decorative Paper Plane */}
            <div className="footer-paper-plane-wrapper">
              <svg className="footer-plane-trail" viewBox="0 0 160 50">
                <path
                  d="M0,35 Q 40,0 70,30 T 130,25"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.25)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>
              <div className="footer-paper-plane-icon">
                <FiSend />
              </div>
            </div>
          </div>

          {/* Column 2: Customer Support */}
          <div className="footer-col">
            <h3 className="footer-col-title">
              Customer Support
              <div className="footer-title-underline">
                <span className="footer-orange-bar"></span>
                <span className="footer-light-bar"></span>
              </div>
            </h3>
            <ul className="footer-links">
              <li>
                <a href="#store-list">
                  <FiChevronsRight className="footer-link-arrow" /> Store List
                </a>
              </li>
              <li>
                <a href="#opening-hours">
                  <FiChevronsRight className="footer-link-arrow" /> Opening Hours
                </a>
              </li>
              <li>
                <a href="#contact-us">
                  <FiChevronsRight className="footer-link-arrow" /> Contact Us
                </a>
              </li>
              <li>
                <a href="#return-policy">
                  <FiChevronsRight className="footer-link-arrow" /> Return Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="footer-col">
            <h3 className="footer-col-title">
              Categories
              <div className="footer-title-underline">
                <span className="footer-orange-bar"></span>
                <span className="footer-light-bar"></span>
              </div>
            </h3>
            <ul className="footer-links">
              <li>
                <a href="#novel-books">
                  <FiChevronsRight className="footer-link-arrow" /> Novel Books
                </a>
              </li>
              <li>
                <a href="#poetry-books">
                  <FiChevronsRight className="footer-link-arrow" /> Poetry Books
                </a>
              </li>
              <li>
                <a href="#political-books">
                  <FiChevronsRight className="footer-link-arrow" /> Political Books
                </a>
              </li>
              <li>
                <a href="#history-books">
                  <FiChevronsRight className="footer-link-arrow" /> History Books
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="footer-col">
            <h3 className="footer-col-title">
              Newsletter
              <div className="footer-title-underline">
                <span className="footer-orange-bar"></span>
                <span className="footer-light-bar"></span>
              </div>
            </h3>
            <p className="footer-newsletter-text">
              Sign up to our weekly newsletter to get the latest book releases and updates.
            </p>

            <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="footer-submit-btn"
              >
                <FiSend />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM COPYRIGHT BAR ================= */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-content">
          <p className="footer-copyright-text">
            &copy; {new Date().getFullYear()} All Rights Reserved by <span>Bookle</span>
          </p>

          {/* Payment Badges */}
          <div className="footer-payment-badges">
            <div className="footer-card-badge footer-visa">VISA</div>
            <div className="footer-card-badge footer-mastercard">
              <span className="footer-circle footer-red-circle"></span>
              <span className="footer-circle footer-yellow-circle"></span>
            </div>
            <div className="footer-card-badge footer-payoneer">
              Pay<span>oneer</span>
            </div>
            <div className="footer-card-badge footer-generic">
              <span className="footer-dots">••••</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Scroll-To-Top Button */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="footer-scroll-to-top-btn"
          aria-label="Back to Top"
        >
          <FiChevronUp />
        </button>
      )}
    </footer>
  );
};

export default Footer;