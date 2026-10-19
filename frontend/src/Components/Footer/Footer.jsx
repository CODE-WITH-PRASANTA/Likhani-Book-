
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import logoImg from "../../assets/booklogo.webp";

import {
  FiPhoneCall,
  FiMail,
  FiClock,
  FiMapPin,
  FiSend,
  FiChevronsRight,
  FiFacebook,
  FiTwitter,
  FiYoutube,
  FiLinkedin,
  FiInstagram,
} from "react-icons/fi";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
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

    if (!email.trim()) return;

    alert(`Subscribed successfully with: ${email}`);
    setEmail("");
  };

  const customerLinks = [
    { label: "My Orders", href: "/orders" },
    { label: "Manage Addresses", href: "/addresses" },
    { label: "Contact Us", href: "/contact" },
    { label: "Return Policy", href: "/refund-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
  ];

  const categoryLinks = [
    { label: "Novel Books", href: "#novel-books" },
    { label: "Poetry Books", href: "#poetry-books" },
    { label: "Political Books", href: "#political-books" },
    { label: "History Books", href: "#history-books" },
    { label: "Children Books", href: "#children-books" },
    { label: "Science Books", href: "#science-books" },
    { label: "Self Help Books", href: "#self-help-books" },
  ];

  const renderLinks = (links) =>
    links.map((item) => (
      <li key={item.label}>
        {item.href.startsWith("/") ? (
          <Link to={item.href}>
            <FiChevronsRight className="footer-link-arrow" />
            <span>{item.label}</span>
          </Link>
        ) : (
          <a href={item.href}>
            <FiChevronsRight className="footer-link-arrow" />
            <span>{item.label}</span>
          </a>
        )}
      </li>
    ));

  return (
    <footer className="footer-wrapper">
      <div className="footer-container">
        <div className="footer-top-bar">
          <div className="footer-contact-item">
            <div className="footer-contact-icon-box">
              <FiPhoneCall />
            </div>

            <div className="footer-contact-text">
              <span className="footer-contact-label">Call Us 7/24</span>
              <h4 className="footer-contact-value">
                <a href="tel:+919692075298">+91 9692075298</a>
              </h4>
            </div>
          </div>

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

          <div className="footer-contact-item">
            <div className="footer-contact-icon-box">
              <FiClock />
            </div>

            <div className="footer-contact-text">
              <span className="footer-contact-label">Opening Hour</span>
              <h4 className="footer-contact-value">
                Sunday - Fri: 9 AM - 6 PM
              </h4>
            </div>
          </div>

          <div className="footer-contact-item">
            <div className="footer-contact-icon-box">
              <FiMapPin />
            </div>

            <div className="footer-contact-text">
              <span className="footer-contact-label">Location</span>
              <h4 className="footer-contact-value">
                Srikoruan Near Indoor Stadium, Gopalpur, Katak, Odisha.
              </h4>
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-main-grid">
          <div className="footer-col footer-brand-col">
            <Link to="/" className="footer-brand-header" aria-label="Lekhani Home">
              <img
                src={logoImg}
                alt="Lekhani emblem"
                className="footer-brand-logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <span className="footer-brand-copy">
                <span className="footer-brand-name">Lekhani</span>
                <span className="footer-brand-tagline">
                  BOOKS FOR A BETTER TOMORROW
                </span>
              </span>
            </Link>

            <p className="footer-brand-description">
              Discover stories, ideas, and knowledge with our carefully
              selected collection of books for every reader.
            </p>

            <div className="footer-social-links">
              <a
                href="#facebook"
                aria-label="Facebook"
                className="footer-social-box"
              >
                <FiFacebook />
              </a>

              <a
                href="#twitter"
                aria-label="Twitter"
                className="footer-social-box"
              >
                <FiTwitter />
              </a>

              <a
                href="#youtube"
                aria-label="YouTube"
                className="footer-social-box"
              >
                <FiYoutube />
              </a>

              <a
                href="#linkedin"
                aria-label="LinkedIn"
                className="footer-social-box"
              >
                <FiLinkedin />
              </a>

              <a
                href="#instagram"
                aria-label="Instagram"
                className="footer-social-box"
              >
                <FiInstagram />
              </a>
            </div>

            <div className="footer-paper-plane-wrapper" aria-hidden="true">
              <svg className="footer-plane-trail" viewBox="0 0 160 50">
                <path
                  d="M0,35 Q40,0 70,30 T130,25"
                  fill="none"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>

              <div className="footer-paper-plane-icon">
                <FiSend />
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">
              Customer Support
              <span className="footer-title-underline">
                <span className="footer-orange-bar" />
                <span className="footer-light-bar" />
              </span>
            </h3>

            <ul className="footer-links">
              {renderLinks(customerLinks)}
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">
              Categories
              <span className="footer-title-underline">
                <span className="footer-orange-bar" />
                <span className="footer-light-bar" />
              </span>
            </h3>

            <ul className="footer-links">
              {renderLinks(categoryLinks)}
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">
              Newsletter
              <span className="footer-title-underline">
                <span className="footer-orange-bar" />
                <span className="footer-light-bar" />
              </span>
            </h3>

            <p className="footer-newsletter-text">
              Sign up to our weekly newsletter to get the latest book releases
              and updates.
            </p>

            <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
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

      <div className="footer-bottom-bar">
        <div className="footer-bottom-content">
          <p className="footer-copyright-text">
            &copy; {new Date().getFullYear()} All Rights Reserved by{" "}
            <a
              href="https://prwebstock.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-company-link"
            >
              PR WEBSTOCK
            </a>
          </p>

          <nav className="footer-policy-links" aria-label="Legal policies">
            <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
            <span className="footer-policy-separator">|</span>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <span className="footer-policy-separator">|</span>
            <Link to="/refund-policy">Refund Policy</Link>
          </nav>
        </div>
      </div>

      {showTopBtn && (
        <button
          type="button"
          className="footer-scroll-to-top-btn"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <span className="footer-scroll-arrow">⌃</span>
        </button>
      )}
    </footer>
  );
};

export default Footer;
