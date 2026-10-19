import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import API, { BASE_URL } from "../../api/axios";
import {
  useShopStore,
  addToCart as addToCartGlobal,
  toggleWishlist as toggleWishlistGlobal,
} from "../ShopMain/useShopStore";
import { slugify } from "../ShopMain/ShopMain";
import "./BookDetails.css";

/* Cover colour themes - picked from the title so each book is unique */
const TONES = ["navy", "teal", "wine", "forest", "plum"];

const toneFor = (text = "") =>
  TONES[
    Array.from(String(text)).reduce((sum, char) => sum + char.charCodeAt(0), 0) %
      TONES.length
  ];

const normalizeImageUrl = (img) => {
  if (!img || typeof img !== "string") {
    return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80";
  }
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
    return img;
  }
  const clean = img.startsWith("/") ? img : `/${img}`;
  return `${BASE_URL}${clean}`;
};

const formatBook = (raw) => {
  if (!raw) return null;
  const id = String(raw._id || raw.id || "");
  const numericPrice = Number(raw.price) || 0;
  const numericOffer = Number(raw.offerPrice) || 0;
  const hasOffer = numericOffer > 0 && numericOffer < numericPrice;
  const finalPrice = hasOffer ? numericOffer : numericPrice;
  const oldPrice = hasOffer ? numericPrice : null;
  const discount = hasOffer
    ? Math.round(((numericPrice - numericOffer) / numericPrice) * 100)
    : 0;

  let images = [];
  if (Array.isArray(raw.images) && raw.images.length > 0) {
    images = raw.images.filter(Boolean).map(normalizeImageUrl);
  }
  if (!images.length && raw.image) {
    images = [normalizeImageUrl(raw.image)];
  }
  if (!images.length) {
    images = ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80"];
  }

  // Ensure 3 views for 3D stage
  if (images.length === 1) {
    images = [images[0], images[0], images[0]];
  } else if (images.length === 2) {
    images = [images[0], images[1], images[0]];
  }

  return {
    id,
    title: raw.title || "Untitled Book",
    author: raw.author || "Likhani Author",
    category: raw.category || "General",
    price: finalPrice,
    oldPrice: oldPrice,
    discount: discount,
    stock: raw.stock === undefined || raw.stock === null ? true : Number(raw.stock) > 0,
    stockCount: Math.max(Number(raw.stock) || 0, 0),
    description:
      raw.description ||
      "Explore the profound insights and narrative of this exceptional book. A wonderful addition to your personal library and a timeless choice for passionate readers.",
    images: images,
    image: images[0],
    sku: raw.isbn ? `ISBN-${raw.isbn}` : `LKH-${id.slice(-6).toUpperCase()}`,
    isbn: raw.isbn || `978-${Math.abs(Array.from(raw.title || "book").reduce((sum, ch) => sum + ch.charCodeAt(0), 1048291048))}`,
    publisher: raw.publisher || "Lekhani Publications",
    pages: Number(raw.pages) || 284,
    language: raw.language || "English",
    year: Number(raw.year) || 2024,
    format: raw.format || "Paperback",
    featured: Boolean(raw.featured),
  };
};

const VIEW_LABELS = ["Front cover", "Back cover", "Inside pages"];

/* Shows real image when loaded, otherwise fallback */
const SmartImage = ({ src, alt, className = "", fallback = null }) => {
  const [status, setStatus] = useState("loading");
  const imgRef = useRef(null);

  useEffect(() => {
    setStatus("loading");
    const node = imgRef.current;
    if (node && node.complete) {
      setStatus(node.naturalWidth > 0 ? "loaded" : "error");
    }
  }, [src]);

  return (
    <>
      {status !== "loaded" && fallback}
      {status !== "error" && (
        <img
          ref={imgRef}
          className={`BookDetails-smart-img ${className} ${
            status === "loaded" ? "is-loaded" : ""
          }`}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
    </>
  );
};

/* Designed front cover fallback */
const CoverArt = ({ title = "", author = "", category = "", mini = false }) => (
  <div
    className={`BookDetails-art BookDetails-art--${toneFor(title)} ${
      mini ? "BookDetails-art--mini" : ""
    }`}
    role="img"
    aria-label={`${title} book cover`}
  >
    <span className="BookDetails-art-spine" />
    <div className="BookDetails-art-body">
      <small className="BookDetails-art-top">{category}</small>
      <span className="BookDetails-art-ornament">&#10070;</span>
      <strong className="BookDetails-art-title">{title}</strong>
      <span className="BookDetails-art-rule" />
      <small className="BookDetails-art-author">{author}</small>
    </div>
  </div>
);

/* Gallery fallbacks: front / back / inside pages */
const GalleryView = ({ index, currentBook, mini = false }) => {
  const title = currentBook?.title || "Book";
  const tone = toneFor(title);

  if (index === 0) {
    return (
      <CoverArt
        title={currentBook?.title}
        author={currentBook?.author}
        category={currentBook?.category}
        mini={mini}
      />
    );
  }

  if (index === 1) {
    return (
      <div
        className={`BookDetails-art BookDetails-art--${tone} BookDetails-art--back ${
          mini ? "BookDetails-art--mini" : ""
        }`}
        role="img"
        aria-label="Back cover"
      >
        <span className="BookDetails-art-spine BookDetails-art-spine--back" />
        <div className="BookDetails-back-body">
          <small>About this book</small>
          <p>{currentBook?.description}</p>
          <span className="BookDetails-barcode" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`BookDetails-inside ${mini ? "BookDetails-inside--mini" : ""}`}
      role="img"
      aria-label="Inside pages"
    >
      <div className="BookDetails-page BookDetails-page--left">
        <small>{currentBook?.title}</small>
        <span className="BookDetails-page-ornament">&#10070;</span>
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="BookDetails-page BookDetails-page--right">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
};

const BenefitIcon = ({ name }) => {
  const paths = {
    book: (
      <>
        <path d="M4 19.5V5.5A2.5 2.5 0 0 1 6.5 3H20v14H6.5A2.5 2.5 0 0 0 4 19.5Z" />
        <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
        <path d="m9 9.5 2 2 3.5-3.5" />
      </>
    ),
    order: (
      <>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const BookDetails = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialBook = location.state?.product ? formatBook(location.state.product) : null;
  const [book, setBook] = useState(initialBook);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(!initialBook);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("specs");
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef(null);

  const { wishlist, cart } = useShopStore();
  const isWishlisted = book ? wishlist.includes(book.id) : false;
  const inCartQty = book ? (cart[book.id] || 0) : 0;

  const showNotice = (message) => {
    window.clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 3000);
  };

  useEffect(() => {
    let isMounted = true;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchBookData = async () => {
      try {
        const [booksRes, postingRes] = await Promise.allSettled([
          API.get("/books", { params: { limit: 100 } }),
          API.get("/book-posting", { params: { limit: 100 } }),
        ]);

        const allRaw = [];
        if (booksRes.status === "fulfilled" && Array.isArray(booksRes.value?.data?.data)) {
          allRaw.push(...booksRes.value.data.data);
        }
        if (postingRes.status === "fulfilled" && Array.isArray(postingRes.value?.data?.data)) {
          allRaw.push(...postingRes.value.data.data);
        }

        const idParam = searchParams.get("id");
        const targetSlug = slug ? String(slug).toLowerCase().trim() : "";

        // Find the matched book
        let found = allRaw.find((item) => {
          if (!item) return false;
          const itemId = String(item._id || item.id || "");
          const itemTitle = String(item.title || "");
          const itemSlug = slugify(itemTitle);
          return (
            (targetSlug && itemSlug === targetSlug) ||
            (targetSlug && itemId === targetSlug) ||
            (idParam && itemId === idParam) ||
            (targetSlug && itemTitle.toLowerCase() === decodeURIComponent(targetSlug).toLowerCase())
          );
        });

        if (!found && location.state?.product) {
          found = location.state.product;
        }

        if (isMounted) {
          if (found) {
            const formatted = formatBook(found);
            setBook(formatted);

            // Related books: same category or others
            const others = allRaw
              .filter((item) => String(item._id || item.id) !== formatted.id)
              .map(formatBook)
              .filter(Boolean);

            const sameCategory = others.filter((o) => o.category === formatted.category);
            const otherCategories = others.filter((o) => o.category !== formatted.category);
            const combined = [...sameCategory, ...otherCategories].slice(0, 4);
            setRelatedBooks(combined);
          } else if (allRaw.length > 0) {
            const first = formatBook(allRaw[0]);
            setBook(first);
            setRelatedBooks(allRaw.slice(1, 5).map(formatBook).filter(Boolean));
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load book details:", err);
        if (isMounted) setLoading(false);
      }
    };

    fetchBookData();

    return () => {
      isMounted = false;
      window.clearTimeout(noticeTimer.current);
    };
  }, [slug, searchParams]);

  const addToCart = () => {
    if (!book || !book.stock) return;
    addToCartGlobal(book.id, quantity);
    showNotice(
      `${quantity} ${quantity === 1 ? "book" : "books"} "${book.title}" added to cart.`
    );
  };

  const toggleWishlist = () => {
    if (!book) return;
    const added = toggleWishlistGlobal(book.id);
    showNotice(
      added
        ? `"${book.title}" added to your wishlist.`
        : `"${book.title}" removed from your wishlist.`
    );
  };

  const shareBook = async () => {
    if (!book) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: book.title,
          text: `Discover "${book.title}" by ${book.author} on Lekhani Books.`,
          url: window.location.href,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        showNotice("Book link copied to clipboard!");
      } else {
        showNotice("Copy current URL to share this book.");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        showNotice("Unable to share the book right now.");
      }
    }
  };

  const openRelatedBook = (item) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const bookSlug = slugify(item.title) || item.id;
    navigate(`/shop/${bookSlug}`, { state: { product: item } });
  };

  if (loading && !book) {
    return (
      <main className="BookDetails">
        <div className="BookDetails-container" style={{ padding: "80px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#102f4b" }}>
            Loading book details...
          </div>
        </div>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="BookDetails">
        <div className="BookDetails-container" style={{ padding: "80px 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", color: "#102f4b", marginBottom: "16px" }}>Book Not Found</h2>
          <p style={{ color: "#687f91", marginBottom: "28px" }}>
            The requested book could not be found or may have been removed.
          </p>
          <Link
            to="/shop"
            style={{
              display: "inline-block",
              background: "#102f4b",
              color: "#fff",
              padding: "12px 28px",
              borderRadius: "30px",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            &larr; Back to Shop Catalog
          </Link>
        </div>
      </main>
    );
  }

  const stageModifier =
    activeImage === 1
      ? "BookDetails-stage-book--flat"
      : activeImage === 2
      ? "BookDetails-stage-book--wide"
      : "";

  return (
    <main className="BookDetails">
      {notice && (
        <div className="BookDetails-notice" role="status">
          <span aria-hidden="true">&#10003;</span>
          {notice}
        </div>
      )}

      {/* Breadcrumb + product */}
      <section className="BookDetails-main-section">
        <div className="BookDetails-container">
          <nav className="BookDetails-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>&rsaquo;</span>
            <Link to="/shop">Shop</Link>
            {book.category && (
              <>
                <span>&rsaquo;</span>
                <Link to={`/shop?category=${encodeURIComponent(book.category)}`}>
                  {book.category}
                </Link>
              </>
            )}
            <span>&rsaquo;</span>
            <span className="BookDetails-current-crumb">{book.title}</span>
          </nav>

          <div className="BookDetails-product-layout">
            {/* ---------- Gallery ---------- */}
            <div className="BookDetails-gallery">
              <div className="BookDetails-thumbnails">
                {book.images.map((img, index) => (
                  <button
                    type="button"
                    key={`${img}-${index}`}
                    className={`BookDetails-thumbnail ${
                      activeImage === index ? "BookDetails-thumbnail-active" : ""
                    }`}
                    onClick={() => setActiveImage(index)}
                    aria-label={`View ${VIEW_LABELS[index] || `Image ${index + 1}`}`}
                    aria-pressed={activeImage === index}
                  >
                    <SmartImage
                      src={img}
                      alt={`${book.title} - ${VIEW_LABELS[index] || `Image ${index + 1}`}`}
                      className="BookDetails-thumb-image"
                      fallback={<GalleryView index={index} currentBook={book} mini />}
                    />
                  </button>
                ))}
              </div>

              <div className="BookDetails-stage">
                <span className="BookDetails-stage-chip">
                  {book.featured ? "Featured Bestseller" : "Reader's Collection"}
                </span>

                <div
                  className={`BookDetails-stage-book ${stageModifier}`}
                  key={activeImage}
                >
                  <SmartImage
                    src={book.images[activeImage]}
                    alt={`${book.title} - ${VIEW_LABELS[activeImage] || "Cover"}`}
                    className="BookDetails-cover-image"
                    fallback={<GalleryView index={activeImage} currentBook={book} />}
                  />
                </div>

                <span className="BookDetails-stage-floor" aria-hidden="true" />

                <span className="BookDetails-stage-caption">
                  {VIEW_LABELS[activeImage] || `View ${activeImage + 1}`}
                </span>
              </div>
            </div>

            {/* ---------- Information ---------- */}
            <div className="BookDetails-information">
              <div className="BookDetails-category-label">
                <span />
                {book.category}
              </div>

              <h1 className="BookDetails-title">{book.title}</h1>

              <p className="BookDetails-author">
                by <strong>{book.author}</strong>
              </p>

              <div className="BookDetails-stock-row">
                <span
                  className={`BookDetails-stock ${
                    book.stock ? "" : "BookDetails-stock--out"
                  }`}
                >
                  <i />
                  {book.stock
                    ? `In Stock (${book.stockCount} available)`
                    : "Out of Stock"}
                </span>
              </div>

              <div className="BookDetails-price-block">
                <div className="BookDetails-price-row">
                  <span className="BookDetails-price">
                    &#8377;{Number(book.price || 0).toLocaleString("en-IN")}
                  </span>
                  {book.oldPrice && (
                    <span className="BookDetails-old-price">
                      &#8377;{Number(book.oldPrice).toLocaleString("en-IN")}
                    </span>
                  )}
                  {book.discount > 0 && (
                    <span className="BookDetails-discount-badge">
                      -{book.discount}% OFF
                    </span>
                  )}
                </div>
                <span className="BookDetails-tax">
                  Inclusive of all applicable taxes &bull; SKU: {book.sku}
                </span>
              </div>

              <p className="BookDetails-description">{book.description}</p>

              <div className="BookDetails-purchase-row">
                <div className="BookDetails-quantity">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() =>
                      setQuantity((previous) => Math.max(1, previous - 1))
                    }
                    aria-label="Decrease quantity"
                  >
                    &minus;
                  </button>

                  <span aria-live="polite">{quantity}</span>

                  <button
                    type="button"
                    disabled={quantity >= Math.min(10, book.stockCount || 10)}
                    onClick={() =>
                      setQuantity((previous) =>
                        Math.min(Math.min(10, book.stockCount || 10), previous + 1)
                      )
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="BookDetails-add-cart"
                  onClick={addToCart}
                  disabled={!book.stock}
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 4h2l2.5 11h10L21 8H6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="10" cy="19" r="1.5" fill="currentColor" />
                    <circle cx="18" cy="19" r="1.5" fill="currentColor" />
                  </svg>
                  {!book.stock
                    ? "OUT OF STOCK"
                    : inCartQty > 0
                    ? `ADD MORE (${inCartQty} in cart)`
                    : "ADD TO CART"}
                </button>

                <button
                  type="button"
                  className={`BookDetails-icon-button ${
                    isWishlisted ? "BookDetails-wishlisted" : ""
                  }`}
                  onClick={toggleWishlist}
                  aria-label={
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                  aria-pressed={isWishlisted}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
                      fill={isWishlisted ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  className="BookDetails-icon-button BookDetails-share-button"
                  onClick={shareBook}
                  aria-label="Share book"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle
                      cx="18"
                      cy="5"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <circle
                      cx="6"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <circle
                      cx="18"
                      cy="19"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="m8.7 10.5 6.6-4m-6.6 7 6.6 4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                  </svg>
                </button>
              </div>

              {inCartQty > 0 && (
                <div className="BookDetails-cart-summary">
                  <span>&#10003;</span>
                  {inCartQty} {inCartQty === 1 ? "book" : "books"} currently in your shopping cart
                </div>
              )}

              <div className="BookDetails-benefits">
                <div className="BookDetails-benefit">
                  <span className="BookDetails-benefit-icon">
                    <BenefitIcon name="book" />
                  </span>
                  <div>
                    <strong>Genuine Books</strong>
                    <small>100% authentic editions</small>
                  </div>
                </div>

                <div className="BookDetails-benefit">
                  <span className="BookDetails-benefit-icon">
                    <BenefitIcon name="order" />
                  </span>
                  <div>
                    <strong>Fast Delivery</strong>
                    <small>Direct to your doorstep</small>
                  </div>
                </div>

                <div className="BookDetails-benefit">
                  <span className="BookDetails-benefit-icon">
                    <BenefitIcon name="shield" />
                  </span>
                  <div>
                    <strong>Secure Checkout</strong>
                    <small>Protected payment</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Book Details & Specifications Tabs */}
      <section className="BookDetails-details-section">
        <div className="BookDetails-container">
          <div className="BookDetails-tabs-nav">
            <button
              type="button"
              className={`BookDetails-tab-btn ${activeTab === "specs" ? "is-active" : ""}`}
              onClick={() => setActiveTab("specs")}
            >
              Book Specifications
            </button>
            <button
              type="button"
              className={`BookDetails-tab-btn ${activeTab === "description" ? "is-active" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Synopsis & Overview
            </button>
            <button
              type="button"
              className={`BookDetails-tab-btn ${activeTab === "shipping" ? "is-active" : ""}`}
              onClick={() => setActiveTab("shipping")}
            >
              Delivery & Returns
            </button>
          </div>

          <div className="BookDetails-tab-content">
            {activeTab === "specs" && (
              <div className="BookDetails-specs-panel">
                <div className="BookDetails-panel-header">
                  <h3 className="BookDetails-panel-title">Book Specifications & Attributes</h3>
                  <p className="BookDetails-panel-subtitle">
                    Complete catalog details for edition authentication and reference.
                  </p>
                </div>

                <div className="BookDetails-specs-grid">
                  <div className="BookDetails-spec-card">
                    <span className="BookDetails-spec-key">Book Title</span>
                    <strong className="BookDetails-spec-value">{book.title}</strong>
                  </div>
                  <div className="BookDetails-spec-card">
                    <span className="BookDetails-spec-key">Author</span>
                    <strong className="BookDetails-spec-value">{book.author}</strong>
                  </div>
                  <div className="BookDetails-spec-card">
                    <span className="BookDetails-spec-key">Category / Genre</span>
                    <strong className="BookDetails-spec-value">{book.category}</strong>
                  </div>
                  <div className="BookDetails-spec-card">
                    <span className="BookDetails-spec-key">Publisher</span>
                    <strong className="BookDetails-spec-value">{book.publisher}</strong>
                  </div>
                  <div className="BookDetails-spec-card">
                    <span className="BookDetails-spec-key">Binding / Format</span>
                    <strong className="BookDetails-spec-value">{book.format}</strong>
                  </div>
                  <div className="BookDetails-spec-card">
                    <span className="BookDetails-spec-key">Language</span>
                    <strong className="BookDetails-spec-value">{book.language}</strong>
                  </div>
                  <div className="BookDetails-spec-card">
                    <span className="BookDetails-spec-key">Page Count</span>
                    <strong className="BookDetails-spec-value">{book.pages} Pages</strong>
                  </div>
                  <div className="BookDetails-spec-card">
                    <span className="BookDetails-spec-key">Publication Year</span>
                    <strong className="BookDetails-spec-value">{book.year}</strong>
                  </div>
                  <div className="BookDetails-spec-card">
                    <span className="BookDetails-spec-key">ISBN Identifier</span>
                    <strong className="BookDetails-spec-value">{book.isbn}</strong>
                  </div>
                  <div className="BookDetails-spec-card">
                    <span className="BookDetails-spec-key">Catalog SKU</span>
                    <strong className="BookDetails-spec-value">{book.sku}</strong>
                  </div>
                  <div className="BookDetails-spec-card">
                    <span className="BookDetails-spec-key">Stock Availability</span>
                    <strong className="BookDetails-spec-value">
                      {book.stock ? (
                        <span className="BookDetails-spec-stock in-stock">
                          In Stock ({book.stockCount} units available)
                        </span>
                      ) : (
                        <span className="BookDetails-spec-stock out-stock">
                          Out of Stock
                        </span>
                      )}
                    </strong>
                  </div>
                  <div className="BookDetails-spec-card">
                    <span className="BookDetails-spec-key">Country of Origin</span>
                    <strong className="BookDetails-spec-value">India</strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "description" && (
              <div className="BookDetails-overview-panel">
                <div className="BookDetails-panel-header">
                  <h3 className="BookDetails-panel-title">About "{book.title}"</h3>
                  <p className="BookDetails-panel-subtitle">Written by {book.author}</p>
                </div>

                <div className="BookDetails-description-full">
                  <p>{book.description}</p>
                </div>

                <div className="BookDetails-feature-highlights">
                  <div className="BookDetails-feature-item">
                    <span className="BookDetails-feature-icon">&#9733;</span>
                    <div>
                      <strong>Compelling Narrative</strong>
                      <p>Carefully crafted prose that informs, inspires, and engages readers.</p>
                    </div>
                  </div>
                  <div className="BookDetails-feature-item">
                    <span className="BookDetails-feature-icon">&#10003;</span>
                    <div>
                      <strong>Authentic Edition</strong>
                      <p>Guaranteed authentic print with clear typography and premium binding.</p>
                    </div>
                  </div>
                  <div className="BookDetails-feature-item">
                    <span className="BookDetails-feature-icon">&#10084;</span>
                    <div>
                      <strong>Reader Favourite</strong>
                      <p>Highly recommended by readers in the {book.category} genre.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="BookDetails-shipping-panel">
                <div className="BookDetails-panel-header">
                  <h3 className="BookDetails-panel-title">Shipping, Delivery & Returns</h3>
                  <p className="BookDetails-panel-subtitle">Safe doorstep delivery and customer guarantees.</p>
                </div>

                <div className="BookDetails-policy-grid">
                  <div className="BookDetails-policy-card">
                    <h4>Standard Delivery (3-5 Days)</h4>
                    <p>Free delivery on all orders above &#8377;499. Flat &#8377;49 shipping on smaller orders.</p>
                  </div>
                  <div className="BookDetails-policy-card">
                    <h4>Same-Day / Next-Day Dispatch</h4>
                    <p>Orders placed before 2 PM are processed and handed over to courier partners within 24 hours.</p>
                  </div>
                  <div className="BookDetails-policy-card">
                    <h4>7 Days Return & Replacement</h4>
                    <p>Hassle-free return or replacement if the book arrives damaged, defective, or misprinted.</p>
                  </div>
                  <div className="BookDetails-policy-card">
                    <h4>Tamper-Proof Packaging</h4>
                    <p>Every book is double-wrapped with protective bubble cushioning and waterproof outer bag.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recommended books */}
      {relatedBooks.length > 0 && (
        <section className="BookDetails-related-section">
          <div className="BookDetails-container">
            <div className="BookDetails-related-heading">
              <div>
                <span className="BookDetails-related-eyebrow">
                  MORE TO DISCOVER
                </span>
                <h2 className="BookDetails-related-title">
                  You Might Also <em>Like</em>
                </h2>
                <p>Curated recommendations from our {book.category} collection.</p>
              </div>

              <Link className="BookDetails-view-all" to="/shop">
                View All Books <span>&rarr;</span>
              </Link>
            </div>

            <div className="BookDetails-related-grid">
              {relatedBooks.map((item) => (
                <article className="BookDetails-related-card" key={item.id}>
                  <button
                    type="button"
                    className="BookDetails-related-image-wrap"
                    onClick={() => openRelatedBook(item)}
                    aria-label={`View ${item.title}`}
                  >
                    <span className="BookDetails-related-book">
                      <SmartImage
                        src={item.image}
                        alt={item.title}
                        className="BookDetails-related-image"
                        fallback={
                          <CoverArt
                            title={item.title}
                            author={item.author}
                            category={item.category}
                          />
                        }
                      />
                    </span>
                    <span className="BookDetails-related-overlay">
                      View Book <span>&nearr;</span>
                    </span>
                  </button>

                  <div className="BookDetails-related-info">
                    <span className="BookDetails-related-category">
                      {item.category}
                    </span>
                    <h3>{item.title}</h3>
                    <div className="BookDetails-related-bottom">
                      <span>&#8377;{Number(item.price).toLocaleString("en-IN")}</span>
                      <button
                        type="button"
                        onClick={() => openRelatedBook(item)}
                        aria-label={`Explore ${item.title}`}
                      >
                        &rarr;
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default BookDetails;