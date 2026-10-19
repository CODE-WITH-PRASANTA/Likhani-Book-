import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API, { BASE_URL } from "../../api/axios";
import defaultBookImg from "../../assets/05.webp";
import logo from "../../assets/booklogo.webp";
import "./Navbar.css";

const formatPrice = (value) =>
  value != null ? `₹${Number(value).toLocaleString("en-IN")}` : "";

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
   - Dynamically fetched from backend database only
========================================= */
const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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
    {iconPaths[name] || (
      <>
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10M6 10h10" />
      </>
    )}
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
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Category dropdown state
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [activeCat, setActiveCat] = useState("");
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState(null);

  // Fetch dynamic categories and books from backend
  useEffect(() => {
    let isMounted = true;
    const fetchNavData = async () => {
      try {
        const [catRes, bookRes, postingRes] = await Promise.allSettled([
          API.get("/categories"),
          API.get("/books", { params: { limit: 100, status: "Published" } }),
          API.get("/book-posting", { params: { limit: 100 } }),
        ]);

        let dbCats = [];
        if (catRes.status === "fulfilled" && catRes.value?.data?.data) {
          dbCats = catRes.value.data.data;
        }

        const rawBooks = [];
        if (bookRes.status === "fulfilled" && Array.isArray(bookRes.value?.data?.data)) {
          rawBooks.push(...bookRes.value.data.data);
        }
        if (postingRes.status === "fulfilled" && Array.isArray(postingRes.value?.data?.data)) {
          rawBooks.push(...postingRes.value.data.data);
        }

        // Deduplicate books by ID
        const bookMap = new Map();
        rawBooks.forEach((b) => {
          if (b && (b.status === "Published" || !b.status)) {
            const id = String(b._id || b.id);
            if (!bookMap.has(id)) {
              bookMap.set(id, {
                id,
                title: b.title,
                author: b.author || "Likhani Author",
                price: b.offerPrice || b.price,
                oldPrice: b.offerPrice && b.price > b.offerPrice ? b.price : null,
                category: b.category || "General",
                image: b.image
                  ? (b.image.startsWith("http") || b.image.startsWith("data:")
                      ? b.image
                      : `${BASE_URL}${b.image.startsWith("/") ? "" : "/"}${b.image}`)
                  : defaultBookImg,
              });
            }
          }
        });

        const dbBooks = Array.from(bookMap.values());

        // Dynamic categories map purely from real backend data
        const catMap = new Map();

        // 1. Backend database categories
        dbCats.forEach((c) => {
          const name = c.name?.trim();
          if (name) {
            const slug = slugify(name);
            catMap.set(slug, {
              slug,
              label: name,
              tag: c.color ? "New" : null,
              isDb: true,
            });
          }
        });

        // 2. Any categories from backend books
        dbBooks.forEach((b) => {
          if (b.category && b.category.trim()) {
            const slug = slugify(b.category);
            if (!catMap.has(slug)) {
              catMap.set(slug, {
                slug,
                label: b.category.trim(),
                isDb: true,
              });
            }
          }
        });

        // ONLY include categories that actually have at least 1 book
        const finalCategories = Array.from(catMap.values()).filter((cat) => {
          const catNorm = cat.label
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]/g, "");

          return dbBooks.some((book) => {
            if (!book.category) return false;
            const bNorm = book.category
              .toLowerCase()
              .trim()
              .replace(/&/g, "and")
              .replace(/[^a-z0-9]/g, "");
            return (
              bNorm === catNorm ||
              bNorm.includes(catNorm) ||
              catNorm.includes(bNorm)
            );
          });
        });

        if (isMounted) {
          setCategories(finalCategories);
          setAllBooks(dbBooks);
          if (finalCategories.length > 0) {
            setActiveCat(finalCategories[0].slug);
          } else {
            setActiveCat("");
          }
        }
      } catch (err) {
        console.error("Failed to load navbar categories or books:", err);
      }
    };

    fetchNavData();
    return () => {
      isMounted = false;
    };
  }, []);

  const catWrapRef = useRef(null);
  const catTriggerRef = useRef(null);
  const hoverTimer = useRef(null);
  const openedByHover = useRef(false);

  const location = useLocation();

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
    if (isCatOpen && categories.length > 0) setActiveCat(categories[0].slug);
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

  const catLink = (cat) => {
    if (cat.to) return cat.to;
    return `/shop?category=${encodeURIComponent(cat.label)}`;
  };

  const catTarget = (cat) => (cat.to ? cat.to : "/shop");

  const active =
    categories.find((c) => c.slug === activeCat) || categories[0] || {
      slug: "all",
      label: "All Books",
    };

  const activeCategoryBooks = useMemo(() => {
    if (!active || !active.label) return [];
    const activeLabelNorm = active.label
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]/g, "");

    return allBooks.filter((book) => {
      if (!book.category) return false;
      const bookCatNorm = book.category
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]/g, "");

      return (
        bookCatNorm === activeLabelNorm ||
        bookCatNorm.includes(activeLabelNorm) ||
        activeLabelNorm.includes(bookCatNorm)
      );
    });
  }, [active, allBooks]);

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

      {categories.length === 0 ? (
        <div className="cat-book-empty" style={{ padding: "30px 16px" }}>
          <p>No categories found in database</p>
        </div>
      ) : (
        <>
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
                  <Chevron className="cat-chevron" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Side flyout showing books under active category */}
          {active && active.label && (
            <div className="cat-flyout" key={active.slug}>
              <div className="cat-flyout-title">
                <span>{active.label}</span>
              </div>

              {activeCategoryBooks.length > 0 ? (
                <ul className="cat-sub-list">
                  {activeCategoryBooks.map((book, i) => (
                    <li key={book.id} style={{ "--i": i }}>
                      <Link
                        to={`/shop?category=${encodeURIComponent(book.category || active.label)}&search=${encodeURIComponent(book.title)}`}
                        className="cat-sub-link"
                        onClick={() => handleNavClick("/shop")}
                      >
                        {book.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="cat-book-empty">
                  <p>No books currently added in {active.label}</p>
                </div>
              )}
            </div>
          )}
        </>
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

            {/* Signup Button or User Menu (Hidden when sticky) */}
            {!isScrolled && (
              currentUser ? (
                <div className="nav-user-menu" ref={userMenuRef}>
                  <div
                    className="nav-user-trigger"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    role="button"
                    tabIndex={0}
                    title={`Logged in as ${currentUser.name || currentUser.email}`}
                  >
                    <div className="nav-user-avatar">
                      {(currentUser.name || currentUser.firstName || "U")[0]}
                    </div>
                    <span className="nav-user-name">
                      {currentUser.firstName || currentUser.name?.split(" ")[0] || "User"}
                    </span>
                    <span
                      className={`nav-user-caret ${
                        isUserMenuOpen ? "nav-user-caret--open" : ""
                      }`}
                      style={{ fontSize: "10px" }}
                    >
                      ▼
                    </span>
                  </div>

                  {isUserMenuOpen && (
                    <div className="nav-user-dropdown">
                      <div className="nav-user-header">
                        <strong style={{ fontSize: "14px", color: "#102a43", fontWeight: 700 }}>
                          {currentUser.name || "Reader"}
                        </strong>
                      </div>
                      <Link
                        to="/profile"
                        className="nav-user-item"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        className="nav-user-item"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                        <span>Wishlist</span>
                      </Link>
                      <Link
                        to="/cart"
                        className="nav-user-item"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="8" cy="21" r="1" />
                          <circle cx="19" cy="21" r="1" />
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                        <span>Shopping Cart</span>
                      </Link>
                      <button
                        type="button"
                        className="nav-user-item nav-user-item--logout"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          navigate("/login");
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/signup"
                  className="nav-btn-signup"
                  onClick={() => handleNavClick("/signup")}
                >
                  Sign Up
                </Link>
              )
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
                  {categories.length === 0 ? (
                    <div style={{ padding: "14px 18px", color: "#94a3b8", fontSize: "13px" }}>
                      No categories found
                    </div>
                  ) : (
                    categories.map((cat) => {
                      if (cat.to) {
                        return (
                          <Link
                            key={cat.slug}
                            to={cat.to}
                            className="drawer-cat-row"
                            onClick={() => handleNavClick(cat.to)}
                          >
                            <span className="drawer-cat-row-label">
                              <CategoryIcon name={cat.slug} size={17} />
                              {cat.label}
                            </span>
                          </Link>
                        );
                      }

                      const isSubOpen = mobileSubOpen === cat.slug;
                      const catLabelNorm = cat.label
                        .toLowerCase()
                        .trim()
                        .replace(/&/g, "and")
                        .replace(/[^a-z0-9]/g, "");

                      const catBooks = allBooks.filter((book) => {
                        if (!book.category) return false;
                        const bCat = book.category
                          .toLowerCase()
                          .trim()
                          .replace(/&/g, "and")
                          .replace(/[^a-z0-9]/g, "");
                        return (
                          bCat === catLabelNorm ||
                          bCat.includes(catLabelNorm) ||
                          catLabelNorm.includes(bCat)
                        );
                      });

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
                                  to={`/shop?category=${encodeURIComponent(cat.label)}`}
                                  className="drawer-sub-link drawer-sub-link--all"
                                  onClick={() => handleNavClick("/shop")}
                                >
                                  All in {cat.label} ({catBooks.length})
                                </Link>
                              </li>
                              {catBooks.slice(0, 4).map((b) => (
                                <li key={b.id}>
                                  <Link
                                    to={`/shop?category=${encodeURIComponent(cat.label)}&search=${encodeURIComponent(b.title)}`}
                                    className="drawer-sub-link"
                                    onClick={() => handleNavClick("/shop")}
                                  >
                                    {b.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })
                  )}
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

              {currentUser ? (
                <div
                  style={{
                    padding: "14px 16px",
                    background: "#f0f7fb",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "#17547b",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "14px",
                      }}
                    >
                      {(currentUser.name || currentUser.firstName || "U")[0]}
                    </div>
                    <div>
                      <strong style={{ fontSize: "14px", color: "#102a43", display: "block" }}>
                        {currentUser.name}
                      </strong>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="nav-drawer-link"
                    style={{ padding: "8px 0", color: "#17547b", fontWeight: 600 }}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleNavClick("/profile");
                    }}
                  >
                    <span>Profile</span>
                    <span className="drawer-arrow">&rarr;</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    style={{
                      background: "#c81e1e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/signup"
                  className="nav-drawer-signup"
                  onClick={() => handleNavClick("/signup")}
                >
                  Sign Up
                </Link>
              )}
            </nav>
          </div>
        </aside>
      </header>
    </>
  );
};

export default Navbar;