import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "../../assets/booklogo.webp";
import "./Navbar.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Shop", path: "/shop" },
    { label: "Blog", path: "/blog" },
    { label: "FAQ", path: "/faq" },
    { label: "Contact", path: "/contact" },
  ];

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`navbar-container ${
        isScrolled ? "is-sticky" : "is-default"
      }`}
    >
      <div className="navbar-inner">

        {/* Logo */}
        <div className="nav-brand">
          <Link to="/" className="nav-brand-link">
            <img
              src={logo}
              alt="Bookle Logo"
              className="nav-brand-img"
            />
          </Link>
        </div>

        {/* Default Navbar */}
        {!isScrolled ? (
          <div className="nav-default-center">

            {/* Search */}
            <div className="nav-search-bar">

              <button
                type="button"
                className="nav-search-category"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="17"
                  height="17"
                  fill="currentColor"
                >
                  <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" />
                </svg>

                <span>Categories</span>

                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <input
                type="text"
                placeholder="Search For books for keyword"
                className="nav-search-input"
              />

              <button
                type="button"
                className="nav-search-submit"
                aria-label="Search"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <circle cx="11" cy="11" r="7.5" />
                  <path d="m20 20-3.8-3.8" />
                </svg>
              </button>
            </div>

            {/* Contact */}
            <div className="nav-contact-info">

              <div className="nav-call-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>

              <div className="nav-call-details">
                <span className="nav-call-label">
                  Call Us Now
                </span>

                <a
                  href="tel:+2085550112"
                  className="nav-call-number"
                >
                  +208-555-0112
                </a>
              </div>

            </div>
          </div>
        ) : (
          /* Sticky Navigation */
          <nav className="nav-links-menu">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `nav-link-item ${
                    isActive ? "nav-link-item--active" : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right Actions */}
        <div className="nav-actions">

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="nav-round-btn"
            aria-label="Wishlist"
          >
            <span className="nav-badge">0</span>

            <svg
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="nav-round-btn"
            aria-label="Cart"
          >
            <span className="nav-badge">0</span>

            <svg
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </Link>

          {/* Mobile Menu */}
          <button
            type="button"
            className={`nav-menu-toggle ${
              isMobileMenuOpen ? "menu-open" : ""
            }`}
            aria-label="Toggle Menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() =>
              setIsMobileMenuOpen((prev) => !prev)
            }
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Signup */}
          {!isScrolled && (
            <Link
              to="/signup"
              className="nav-btn-signup"
            >
              Sign Up
            </Link>
          )}

        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`nav-drawer-menu ${
          isMobileMenuOpen
            ? "nav-drawer-menu--active"
            : ""
        }`}
      >
        <div className="nav-drawer-content">

          <div className="drawer-title">
            <span>Menu</span>

            <button
              type="button"
              onClick={closeMenu}
              className="drawer-close"
              aria-label="Close Menu"
            >
              ×
            </button>
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-drawer-link ${
                  isActive ? "active" : ""
                }`
              }
              onClick={closeMenu}
            >
              {item.label}
              <span>→</span>
            </NavLink>
          ))}

          <Link
            to="/wishlist"
            className="nav-drawer-link"
            onClick={closeMenu}
          >
            Wishlist
            <span>→</span>
          </Link>

          <Link
            to="/cart"
            className="nav-drawer-link"
            onClick={closeMenu}
          >
            Cart
            <span>→</span>
          </Link>

          {!isScrolled && (
            <Link
              to="/signup"
              className="nav-drawer-signup"
              onClick={closeMenu}
            >
              Sign Up
            </Link>
          )}

        </div>
      </div>
    </header>
  );
};

export default Navbar;