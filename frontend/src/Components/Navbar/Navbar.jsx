import React, { useEffect, useState, useCallback } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/booklogo.webp";
import "./Navbar.css";

const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Shop", path: "/shop" },
  { label: "Blog", path: "/blog" },
  { label: "FAQ", path: "/faq" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();

  // Optimized sticky scroll listener with requestAnimationFrame
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 80);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top smoothly on route changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  // Lock background scroll when mobile drawer is opened
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const handleNavClick = useCallback(
    (path) => {
      setIsMobileMenuOpen(false);
      if (location.pathname === path) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }
    },
    [location.pathname]
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/shop?search=${encodeURIComponent(query)}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header
        className={`navbar-container ${
          isScrolled ? "is-sticky" : "is-default"
        }`}
      >
        <div className="navbar-inner">
          {/* Logo */}
          <div className="nav-brand">
            <Link
              to="/"
              className="nav-brand-link"
              onClick={() => handleNavClick("/")}
              aria-label="Bookle Home"
            >
              <img
                src={logo}
                alt="Bookle Logo"
                className="nav-brand-img"
                width="140"
                height="40"
              />
            </Link>
          </div>

          {/* Center: Search & Contact OR Sticky Nav Menu */}
          {!isScrolled ? (
            <div className="nav-default-center">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="nav-search-bar" role="search">
                <button
                  type="button"
                  className="nav-search-category"
                  aria-label="Select Category"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    fill="currentColor"
                    aria-hidden="true"
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
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                <input
                  type="search"
                  placeholder="Search for books or keywords..."
                  className="nav-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <button
                  type="submit"
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
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7.5" />
                    <path d="m20 20-3.8-3.8" />
                  </svg>
                </button>
              </form>

              {/* Contact Block */}
              <div className="nav-contact-info">
                <div className="nav-call-icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>

                <div className="nav-call-details">
                  <span className="nav-call-label">Call Us Now</span>
                  <a href="tel:+919692075298" className="nav-call-number">
                    +91 9692075298
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Sticky Navigation Links */
            <nav className="nav-links-menu" aria-label="Main Navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `nav-link-item ${isActive ? "nav-link-item--active" : ""}`
                  }
                  onClick={() => handleNavClick(item.path)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Right Action Buttons */}
          <div className="nav-actions">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="nav-round-btn"
              aria-label="View Wishlist"
              onClick={() => handleNavClick("/wishlist")}
            >
              <span className="nav-badge">0</span>
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                aria-hidden="true"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="nav-round-btn"
              aria-label="View Shopping Cart"
              onClick={() => handleNavClick("/cart")}
            >
              <span className="nav-badge">0</span>
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                aria-hidden="true"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </Link>

            {/* Signup Button (Hidden when sticky) */}
            {!isScrolled && (
              <Link
                to="/signup"
                className="nav-btn-signup"
                onClick={() => handleNavClick("/signup")}
              >
                Sign Up
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className={`nav-menu-toggle ${
                isMobileMenuOpen ? "menu-open" : ""
              }`}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Mobile Backdrop */}
        <div
          className={`nav-drawer-backdrop ${
            isMobileMenuOpen ? "nav-drawer-backdrop--active" : ""
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Mobile Drawer */}
        <aside
          className={`nav-drawer-menu ${
            isMobileMenuOpen ? "nav-drawer-menu--active" : ""
          }`}
          aria-label="Mobile Navigation"
        >
          <div className="nav-drawer-content">
            <div className="drawer-title">
              <span>Menu</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="drawer-close"
                aria-label="Close menu"
              >
                &times;
              </button>
            </div>

            <nav className="drawer-nav-list">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `nav-drawer-link ${isActive ? "active" : ""}`
                  }
                  onClick={() => handleNavClick(item.path)}
                >
                  <span>{item.label}</span>
                  <span className="drawer-arrow">&rarr;</span>
                </NavLink>
              ))}

              <Link
                to="/wishlist"
                className="nav-drawer-link"
                onClick={() => handleNavClick("/wishlist")}
              >
                <span>Wishlist</span>
                <span className="drawer-arrow">&rarr;</span>
              </Link>

              <Link
                to="/cart"
                className="nav-drawer-link"
                onClick={() => handleNavClick("/cart")}
              >
                <span>Cart</span>
                <span className="drawer-arrow">&rarr;</span>
              </Link>

              <Link
                to="/signup"
                className="nav-drawer-signup"
                onClick={() => handleNavClick("/signup")}
              >
                Sign Up
              </Link>
            </nav>
          </div>
        </aside>
      </header>
    </>
  );
};

export default Navbar;