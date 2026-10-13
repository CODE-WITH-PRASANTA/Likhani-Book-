import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./BookDetails.css";

/* =========================================================
   DATA
   ---------------------------------------------------------
   Put your real book photos inside:  public/images/
   using the file names below (or change the paths).
   If an image is missing, a premium designed book cover is
   shown automatically, so the page never looks empty.
========================================================= */

const book = {
  id: 101,
  title: "Osho Acharya Rajanisha Jiban O Darshan",
  author: "Pradeshi Barik",
  price: 425,
  category: "Odia Books",
  stock: true,
  description:
    "Explore the life, philosophy and teachings of Osho Acharya Rajanish through this thoughtful Odia book. A meaningful addition to your personal library and a wonderful choice for readers who enjoy philosophy and literature.",
  images: [
    "/images/osho-book.jpg",
    "/images/osho-book-back.jpg",
    "/images/osho-book-inside.jpg",
  ],
};

const VIEW_LABELS = ["Front cover", "Back cover", "Inside pages"];

const relatedBooks = [
  {
    id: 1,
    title: "Sei Sahasineemane",
    author: "Odia Library",
    category: "Biography",
    price: 290,
    image: "/images/sei-sahasineemane.jpg",
  },
  {
    id: 2,
    title: "Padmapatrre Jeevan",
    author: "Odia Library",
    category: "Literature",
    price: 600,
    image: "/images/padmapatre-jeevan.jpg",
  },
  {
    id: 3,
    title: "Sherlock Holmes Kahani Part-4",
    author: "Odia Library",
    category: "Fiction",
    price: 80,
    image: "/images/sherlock-holmes.jpg",
  },
  {
    id: 4,
    title: "Koutilya Arthashastra (Odia)",
    author: "Odia Library",
    category: "History",
    price: 150,
    image: "/images/koutilya-arthashastra.jpg",
  },
];

/* Cover colour themes - picked from the title so each book is unique */
const TONES = ["navy", "teal", "wine", "forest", "plum"];

const toneFor = (text = "") =>
  TONES[
    Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0) %
      TONES.length
  ];

/* =========================================================
   SMALL REUSABLE PIECES
========================================================= */

/* Shows the real image when it loads, otherwise the fallback */
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

/* Designed front cover (used when no photo is available) */
const CoverArt = ({ title, author, category, mini = false }) => (
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
const GalleryView = ({ index, mini = false }) => {
  const tone = toneFor(book.title);

  if (index === 0) {
    return (
      <CoverArt
        title={book.title}
        author={book.author}
        category={book.category}
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
          <p>{book.description}</p>
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
        <small>{book.title}</small>
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
   PAGE
========================================================= */

const BookDetails = () => {
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const showNotice = (message) => {
    window.clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 2500);
  };

  const addToCart = () => {
    setCartCount((previous) => previous + quantity);
    showNotice(
      `${quantity} ${quantity === 1 ? "book" : "books"} added to cart.`
    );
  };

  const toggleWishlist = () => {
    setIsWishlisted((previous) => !previous);
    showNotice(
      isWishlisted ? "Removed from your wishlist." : "Added to your wishlist."
    );
  };

  const shareBook = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: book.title,
          text: `Discover ${book.title} by ${book.author}.`,
          url: window.location.href,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        showNotice("Book link copied successfully.");
      } else {
        showNotice("Copy the current page URL to share this book.");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        showNotice("Unable to share the book right now.");
      }
    }
  };

  const openRelatedBook = (item) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/book-details/${item.id}`);
  };

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
            <Link to="/library">Library</Link>
            <span>&rsaquo;</span>
            <span className="BookDetails-current-crumb">{book.title}</span>
          </nav>

          <div className="BookDetails-product-layout">
            {/* ---------- Gallery ---------- */}
            <div className="BookDetails-gallery">
              <div className="BookDetails-thumbnails">
                {book.images.map((image, index) => (
                  <button
                    type="button"
                    key={image}
                    className={`BookDetails-thumbnail ${
                      activeImage === index
                        ? "BookDetails-thumbnail-active"
                        : ""
                    }`}
                    onClick={() => setActiveImage(index)}
                    aria-label={`View ${VIEW_LABELS[index]}`}
                    aria-pressed={activeImage === index}
                  >
                    <SmartImage
                      src={image}
                      alt={`${book.title} - ${VIEW_LABELS[index]}`}
                      className="BookDetails-thumb-image"
                      fallback={<GalleryView index={index} mini />}
                    />
                  </button>
                ))}
              </div>

              <div className="BookDetails-stage">
                <span className="BookDetails-stage-chip">
                  Reader&apos;s Collection
                </span>

                <div
                  className={`BookDetails-stage-book ${stageModifier}`}
                  key={activeImage}
                >
                  <SmartImage
                    src={book.images[activeImage]}
                    alt={`${book.title} - ${VIEW_LABELS[activeImage]}`}
                    className="BookDetails-cover-image"
                    fallback={<GalleryView index={activeImage} />}
                  />
                </div>

                <span className="BookDetails-stage-floor" aria-hidden="true" />

                <span className="BookDetails-stage-caption">
                  {VIEW_LABELS[activeImage]}
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

              <div className="BookDetails-rating">
                <span
                  className="BookDetails-stars"
                  aria-label="Rated 4.8 out of 5"
                >
                  &#9733;&#9733;&#9733;&#9733;&#9733;
                </span>
                <span className="BookDetails-rating-score">4.8</span>
                <span className="BookDetails-rating-muted">
                  (Reader favourite)
                </span>
                <span className="BookDetails-rating-divider" />
                <span
                  className={`BookDetails-stock ${
                    book.stock ? "" : "BookDetails-stock--out"
                  }`}
                >
                  <i />
                  {book.stock ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <div className="BookDetails-price-block">
                <span className="BookDetails-price">
                  &#8377;{book.price.toLocaleString("en-IN")}
                </span>
                <span className="BookDetails-tax">
                  Inclusive of applicable taxes
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
                    disabled={quantity >= 10}
                    onClick={() =>
                      setQuantity((previous) => Math.min(10, previous + 1))
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
                  {book.stock ? "ADD TO CART" : "OUT OF STOCK"}
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

              {cartCount > 0 && (
                <div className="BookDetails-cart-summary">
                  <span>&#10003;</span>
                  {cartCount} {cartCount === 1 ? "book" : "books"} added in
                  this session
                </div>
              )}

              <div className="BookDetails-benefits">
                <div className="BookDetails-benefit">
                  <span className="BookDetails-benefit-icon">
                    <BenefitIcon name="book" />
                  </span>
                  <div>
                    <strong>Genuine Books</strong>
                    <small>Quality reading</small>
                  </div>
                </div>

                <div className="BookDetails-benefit">
                  <span className="BookDetails-benefit-icon">
                    <BenefitIcon name="order" />
                  </span>
                  <div>
                    <strong>Easy Ordering</strong>
                    <small>Simple checkout</small>
                  </div>
                </div>

                <div className="BookDetails-benefit">
                  <span className="BookDetails-benefit-icon">
                    <BenefitIcon name="shield" />
                  </span>
                  <div>
                    <strong>Secure Shopping</strong>
                    <small>Shop with confidence</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended books */}
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
              <p>Curated recommendations from our library collection.</p>
            </div>

            <Link className="BookDetails-view-all" to="/library">
              View All Library <span>&rarr;</span>
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
                    <span>&#8377;{item.price.toLocaleString("en-IN")}</span>
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
    </main>
  );
};

export default BookDetails;