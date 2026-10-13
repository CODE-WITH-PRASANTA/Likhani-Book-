
import React, { useState, useEffect, useRef } from "react";
import {
  FaShoppingBasket,
  FaArrowRight,
  FaCheck,
  FaFire,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./BookleBook.css";

const PRODUCTS = [
  {
    id: "p1",
    category: "Design Low Book",
    title: "Flovely And Unicom Erna",
    price: 30,
    originalPrice: 39.99,
    author: "Albert",
    badge: null,
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "p2",
    category: "Design Low Book",
    title: "Qple GPad With Retinay Sispla",
    price: 30,
    originalPrice: 39.99,
    author: "Wilcon",
    badge: "Hot",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "p3",
    category: "Design Low Book",
    title: "Simple Things You To Save BOOK",
    price: 30,
    originalPrice: 39.99,
    author: "Wilcon",
    badge: null,
    image:
      "https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "p4",
    category: "Design Low Book",
    title: "How Deal With Very Bad BOOK",
    price: 30,
    originalPrice: 39.99,
    author: "Esther",
    badge: "-30%",
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=85",
  },
];

const BookleBook = () => {
  const [addedItems, setAddedItems] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef(null);
  const addedTimersRef = useRef({});

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }

      Object.values(addedTimersRef.current).forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, []);

  const showToast = (message) => {
    setToastMessage(message);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  const handleAddToCart = (id) => {
    if (addedItems[id]) return;

    setAddedItems((prev) => ({
      ...prev,
      [id]: true,
    }));

    showToast("Book added to your cart!");

    if (addedTimersRef.current[id]) {
      window.clearTimeout(addedTimersRef.current[id]);
    }

    addedTimersRef.current[id] = window.setTimeout(() => {
      setAddedItems((prev) => ({
        ...prev,
        [id]: false,
      }));

      delete addedTimersRef.current[id];
    }, 2000);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === PRODUCTS.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? PRODUCTS.length - 1 : prev - 1
    );
  };

  const scrollToCollection = () => {
    document
      .getElementById("bookle-book-products")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <section className="bookle-book">
      {toastMessage && (
        <div
          className="bookle-book__toast"
          role="status"
          aria-live="polite"
        >
          <FaCheck />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bookle-book__wrapper">
        {/* SECTION HEADER */}
        <div className="bookle-book__header">
          <div className="bookle-book__header-copy">
            <span className="bookle-book__eyebrow">
              CURATED FOR READERS
            </span>

            <h2 className="bookle-book__heading">
              Bookle Top Books
            </h2>

            <p className="bookle-book__subheading">
              This week's picks from the shelf
            </p>
          </div>

          <button
            type="button"
            className="bookle-book__explore-btn"
            onClick={scrollToCollection}
          >
            Explore more
            <FaArrowRight className="bookle-book__explore-icon" />
          </button>
        </div>

        {/* MAIN GRID AND BANNER */}
        <div className="bookle-book__main-grid">
          <div
            className="bookle-book__products-container"
            id="bookle-book-products"
          >
            <div className="bookle-book__products-grid">
              {PRODUCTS.map((product, index) => {
                const isAdded = Boolean(addedItems[product.id]);
                const isActiveMobile = index === currentIndex;

                return (
                  <article
                    className={`bookle-book__card ${
                      isActiveMobile
                        ? "bookle-book__card--active-mobile"
                        : ""
                    }`}
                    key={product.id}
                  >
                    <div className="bookle-book__media">
                      {product.badge && (
                        <span
                          className={`bookle-book__badge ${
                            product.badge === "Hot"
                              ? "bookle-book__badge--hot"
                              : "bookle-book__badge--discount"
                          }`}
                        >
                          {product.badge === "Hot" && (
                            <FaFire className="bookle-book__badge-icon" />
                          )}

                          {product.badge}
                        </span>
                      )}

                      <div className="bookle-book__image-frame">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="bookle-book__img"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <div className="bookle-book__body">
                      <span className="bookle-book__category">
                        {product.category}
                      </span>

                      <h3
                        className="bookle-book__title"
                        title={product.title}
                      >
                        {product.title}
                      </h3>

                      <div className="bookle-book__price-row">
                        <span className="bookle-book__current-price">
                          ₹{product.price.toFixed(2)}
                        </span>

                        {product.originalPrice && (
                          <span className="bookle-book__original-price">
                            ₹{product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* AUTHOR DETAILS — RATING REMOVED */}
                      <div className="bookle-book__meta-row">
                        <div className="bookle-book__author-info">
                          <span className="bookle-book__avatar">
                            {product.author.charAt(0)}
                          </span>

                          <span className="bookle-book__author-text">
                            {product.author}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`bookle-book__cart-btn ${
                          isAdded
                            ? "bookle-book__cart-btn--added"
                            : ""
                        }`}
                        onClick={() => handleAddToCart(product.id)}
                        disabled={isAdded}
                      >
                        {isAdded ? (
                          <>
                            <FaCheck className="bookle-book__btn-icon" />
                            Added to cart
                          </>
                        ) : (
                          <>
                            <FaShoppingBasket className="bookle-book__btn-icon" />
                            Add to cart
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* MOBILE PAGINATION */}
            <div
              className="bookle-book__mobile-nav"
              aria-label="Book navigation"
            >
              <button
                type="button"
                className="bookle-book__nav-arrow"
                onClick={prevSlide}
                aria-label="Previous book"
              >
                <FaChevronLeft />
              </button>

              <div className="bookle-book__dots">
                {PRODUCTS.map((product, index) => (
                  <button
                    key={product.id}
                    type="button"
                    className={`bookle-book__dot ${
                      currentIndex === index
                        ? "bookle-book__dot--active"
                        : ""
                    }`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={
                      currentIndex === index ? "true" : undefined
                    }
                  />
                ))}
              </div>

              <button
                type="button"
                className="bookle-book__nav-arrow"
                onClick={nextSlide}
                aria-label="Next book"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>

          {/* RIGHT SIDEBAR PROMO */}
          <aside className="bookle-book__sidebar-banner">
            <div className="bookle-book__sidebar-content">
              <span className="bookle-book__sidebar-eyebrow">
                A LITTLE SOMETHING FOR YOU
              </span>

              <h3 className="bookle-book__sidebar-title">
                Find your next book
              </h3>

              <p className="bookle-book__sidebar-subtitle">
                Get 25% off your first order
              </p>

              <button
                type="button"
                className="bookle-book__btn-brass"
                onClick={scrollToCollection}
              >
                <span>Shop now</span>
                <FaArrowRight className="bookle-book__btn-brass-icon" />
              </button>
            </div>

            <div className="bookle-book__sidebar-illustration">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=85"
                alt="Reader enjoying a book"
                className="bookle-book__sidebar-person"
                loading="lazy"
              />
            </div>
          </aside>
        </div>

        {/* FULL-WIDTH BOTTOM PROMO */}
        <div className="bookle-book__promo-banner">
          <div className="bookle-book__promo-collage">
            <img
              src="https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=300&q=80"
              alt="Book collection"
              className="bookle-book__collage-img bookle-book__collage-img--1"
              loading="lazy"
            />

            <img
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80"
              alt="Featured book"
              className="bookle-book__collage-img bookle-book__collage-img--2"
              loading="lazy"
            />
          </div>

          <div className="bookle-book__promo-text-wrap">
            <span className="bookle-book__eyebrow">
              THE WEEKLY READING EDIT
            </span>

            <h2 className="bookle-book__promo-heading">
              Get 25% off every category, this week only
            </h2>

            <button
              type="button"
              className="bookle-book__btn-brass bookle-book__btn-brass--dark"
              onClick={scrollToCollection}
            >
              <span>Shop now</span>
              <FaArrowRight className="bookle-book__btn-brass-icon" />
            </button>
          </div>

          <div className="bookle-book__promo-right-person">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=85"
              alt="Reader with books"
              className="bookle-book__promo-person-img"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookleBook;
