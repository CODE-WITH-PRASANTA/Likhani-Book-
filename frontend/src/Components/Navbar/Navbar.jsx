import React, { useEffect, useState, useCallback, useRef } from "react";
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

/* =========================================
   BOOK CATEGORIES
   - Items with `subs` open a side flyout.
   - Items with `to` and no subs are direct links.
   Sub links go to: /shop?category=<slug>&sub=<sub-slug>
========================================= */
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const categories = [
  {
    slug: "fiction",
    label: "Fiction",
    subs: [
      "Literary Fiction",
      "Mystery & Thriller",
      "Romance",
      "Sci-Fi & Fantasy",
      "Historical Fiction",
      "Horror",
    ],
  },
  {
    slug: "non-fiction",
    label: "Non-Fiction",
    subs: [
      "Biography & Memoir",
      "History & Politics",
      "Self-Help",
      "Business & Finance",
      "Science & Nature",
      "Philosophy",
    ],
  },
  {
    slug: "childrens-books",
    label: "Children's Books",
    subs: [
      "Picture Books",
      "Early Readers",
      "Story & Fairy Tales",
      "Activity Books",
      "Teen & Young Adult",
    ],
  },
  {
    slug: "academic",
    label: "Academic & Exams",
    subs: [
      "School Textbooks",
      "Engineering",
      "Medical",
      "Competitive Exams",
      "Reference & Dictionaries",
    ],
  },
  {
    slug: "comics",
    label: "Comics & Manga",
    subs: ["Manga", "Graphic Novels", "Superhero Comics", "Indian Comics"],
  },
  {
    slug: "bestsellers",
    label: "Bestsellers",
    tag: "Hot",
    subs: [
      "New Releases",
      "Top Rated",
      "Award Winners",
      "Staff Picks",
      "Box Sets",
    ],
  },
  {
    slug: "stationery",
    label: "Stationery & Gifts",
    subs: ["Notebooks & Journals", "Bookmarks", "Pens & Pencils", "Gift Cards"],
  },
  {
    slug: "blogs",
    label: "Blogs",
    to: "/blog",
    subs: [],
  },
];

/* Inline icons (stroke based, inherit currentColor) */
const iconPaths = {
  fiction: (
    <>
      <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
    </>
  ),
  "non-fiction": (
    <>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.3h6c0-1.1.4-1.8 1-2.3A7 7 0 0 0 12 2z" />
    </>
  ),
  "childrens-books": (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <path d="M9 9h.01M15 9h.01" />
    </>
  ),
  academic: (
    <>
      <path d="M22 10 12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c3 2 9 2 12 0v-5" />
    </>
  ),
  comics: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  bestsellers: (
    <>
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </>
  ),
  stationery: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  blogs: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h6" />
    </>
  ),
};

const CategoryIcon = ({ name, size = 19 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {iconPaths[name]}
  </svg>
);

const Chevron = ({ size = 14, className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const Caret = ({ size = 14 }) => (
  <svg
    className="nav-cat-caret"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const GridIcon = ({ size = 18 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
    <path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17" />
  </svg>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Category dropdown state
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(categories[0].slug);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState(null);

  const catWrapRef = useRef(null);
  const catTriggerRef = useRef(null);
  const hoverTimer = useRef(null);
  const openedByHover = useRef(false);

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

  // Close category dropdown on route change or when navbar mode switches
  useEffect(() => {
    setIsCatOpen(false);
  }, [location.pathname, isScrolled]);

  // Always start on the first category when the dropdown opens
  useEffect(() => {
    if (isCatOpen) setActiveCat(categories[0].slug);
  }, [isCatOpen]);

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

  // Close drawer / dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "Escape") return;

      if (isMobileMenuOpen) setIsMobileMenuOpen(false);

      if (isCatOpen) {
        setIsCatOpen(false);
        catTriggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen, isCatOpen]);

  // Close dropdown when clicking / tapping outside
  useEffect(() => {
    if (!isCatOpen) return;

    const handleOutside = (e) => {
      if (catWrapRef.current && !catWrapRef.current.contains(e.target)) {
        setIsCatOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [isCatOpen]);

  // Clear pending hover timer on unmount
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  const canHover = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const openCatHover = () => {
    if (!canHover()) return;
    clearTimeout(hoverTimer.current);
    if (!isCatOpen) openedByHover.current = true;
    setIsCatOpen(true);
  };

  const closeCatHover = () => {
    if (!canHover()) return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      openedByHover.current = false;
      setIsCatOpen(false);
    }, 240);
  };

  const toggleCat = () => {
    clearTimeout(hoverTimer.current);

    // A click right after a hover-open should keep the menu open
    if (openedByHover.current) {
      openedByHover.current = false;
      setIsCatOpen(true);
      return;
    }
    setIsCatOpen((prev) => !prev);
  };

  const handleNavClick = useCallback(
    (path) => {
      setIsMobileMenuOpen(false);
      setIsCatOpen(false);
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
      setIsCatOpen(false);
    }
  };

  const catLink = (cat, sub) => {
    if (cat.to && !sub) return cat.to;
    return sub
      ? `/shop?category=${cat.slug}&sub=${slugify(sub)}`
      : `/shop?category=${cat.slug}`;
  };

  const catTarget = (cat) => (cat.to ? cat.to : "/shop");

  const active = categories.find((c) => c.slug === activeCat) || categories[0];
  const hasFlyout = active.subs.length > 0;

  /* ---------- Desktop category dropdown ---------- */
  const categoryPanel = (
    <div
      id="category-panel"
      className={`cat-panel ${isCatOpen ? "cat-panel--open" : ""}`}
      onMouseEnter={openCatHover}
      onMouseLeave={closeCatHover}
      aria-hidden={!isCatOpen}
    >
      {/* Gold header - sits exactly over the trigger button */}
      <button
        type="button"
        className="cat-head"
        aria-expanded={isCatOpen}
        onClick={toggleCat}
        tabIndex={isCatOpen ? 0 : -1}
      >
        <span className="cat-head-label">
          <GridIcon />
          All Categories
        </span>
        <Caret />
      </button>

      <ul className="cat-list" aria-label="Book categories">
        {categories.map((cat, i) => (
          <li
            key={cat.slug}
            style={{ "--i": i }}
            onMouseEnter={() => setActiveCat(cat.slug)}
          >
            <Link
              to={catLink(cat)}
              className={`cat-list-item ${
                active.slug === cat.slug ? "is-active" : ""
              }`}
              onFocus={() => setActiveCat(cat.slug)}
              onClick={() => handleNavClick(catTarget(cat))}
            >
              <span className="cat-ico">
                <CategoryIcon name={cat.slug} />
              </span>
              <span className="cat-label">{cat.label}</span>
              {cat.tag && <em className="cat-tag">{cat.tag}</em>}
              {cat.subs.length > 0 && <Chevron className="cat-chevron" />}
            </Link>
          </li>
        ))}
      </ul>

      {/* Side flyout */}
      {hasFlyout && (
        <div className="cat-flyout" key={active.slug}>
          <div className="cat-flyout-title">{active.label}</div>

          <ul className="cat-sub-list">
            {active.subs.map((sub, i) => (
              <li key={sub} style={{ "--i": i }}>
                <Link
                  to={catLink(active, sub)}
                  className="cat-sub-link"
                  onClick={() => handleNavClick("/shop")}
                >
                  {sub}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to={catLink(active)}
            className="cat-view-all"
            onClick={() => handleNavClick("/shop")}
          >
            <span>View all {active.label}</span>
            <Chevron size={14} />
          </Link>
        </div>
      )}
    </div>
  );

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
              {/* Search + Category dropdown */}
              <div className="nav-search-wrap" ref={catWrapRef}>
                <form
                  onSubmit={handleSearchSubmit}
                  className="nav-search-bar"
                  role="search"
                >
                  <button
                    type="button"
                    ref={catTriggerRef}
                    className={`nav-search-category ${
                      isCatOpen ? "is-open" : ""
                    }`}
                    aria-label="Browse book categories"
                    aria-haspopup="true"
                    aria-expanded={isCatOpen}
                    aria-controls="category-panel"
                    onClick={toggleCat}
                    onMouseEnter={openCatHover}
                    onMouseLeave={closeCatHover}
                  >
                    <GridIcon size={17} />
                    <span>Categories</span>
                    <Caret size={13} />
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

                {categoryPanel}
              </div>

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
            /* Sticky Navigation Links (with Categories trigger) */
            <nav className="nav-links-menu" aria-label="Main Navigation">
              <div className="nav-cat-sticky" ref={catWrapRef}>
                <button
                  type="button"
                  ref={catTriggerRef}
                  className={`nav-cat-trigger ${isCatOpen ? "is-open" : ""}`}
                  aria-haspopup="true"
                  aria-expanded={isCatOpen}
                  aria-controls="category-panel"
                  onClick={toggleCat}
                  onMouseEnter={openCatHover}
                  onMouseLeave={closeCatHover}
                >
                  <GridIcon size={17} />
                  <span>All Categories</span>
                  <Caret size={13} />
                </button>

                {categoryPanel}
              </div>

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

            {/* Mobile categories accordion */}
            <div className={`drawer-cat ${mobileCatOpen ? "is-open" : ""}`}>
              <button
                type="button"
                className="drawer-cat-toggle"
                aria-expanded={mobileCatOpen}
                onClick={() => setMobileCatOpen((prev) => !prev)}
              >
                <span className="drawer-cat-toggle-label">
                  <GridIcon size={17} />
                  All Categories
                </span>
                <Chevron className="drawer-cat-caret" />
              </button>

              <div className="drawer-cat-body">
                <div className="drawer-cat-inner">
                  {categories.map((cat) => {
                    // Direct link item (no sub menu)
                    if (cat.subs.length === 0) {
                      return (
                        <Link
                          key={cat.slug}
                          to={catLink(cat)}
                          className="drawer-cat-row"
                          onClick={() => handleNavClick(catTarget(cat))}
                        >
                          <span className="drawer-cat-row-label">
                            <CategoryIcon name={cat.slug} size={17} />
                            {cat.label}
                          </span>
                        </Link>
                      );
                    }

                    const isSubOpen = mobileSubOpen === cat.slug;
                    return (
                      <div
                        key={cat.slug}
                        className={`drawer-cat-item ${
                          isSubOpen ? "is-open" : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="drawer-cat-row"
                          aria-expanded={isSubOpen}
                          onClick={() =>
                            setMobileSubOpen(isSubOpen ? null : cat.slug)
                          }
                        >
                          <span className="drawer-cat-row-label">
                            <CategoryIcon name={cat.slug} size={17} />
                            {cat.label}
                          </span>
                          <Chevron size={14} className="drawer-cat-caret" />
                        </button>

                        <div className="drawer-sub-body">
                          <ul className="drawer-sub-inner">
                            <li>
                              <Link
                                to={catLink(cat)}
                                className="drawer-sub-link drawer-sub-link--all"
                                onClick={() => handleNavClick("/shop")}
                              >
                                All {cat.label}
                              </Link>
                            </li>
                            {cat.subs.map((sub) => (
                              <li key={sub}>
                                <Link
                                  to={catLink(cat, sub)}
                                  className="drawer-sub-link"
                                  onClick={() => handleNavClick("/shop")}
                                >
                                  {sub}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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