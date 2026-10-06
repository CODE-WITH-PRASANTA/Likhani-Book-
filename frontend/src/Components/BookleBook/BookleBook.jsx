import React, { useState } from 'react';
import {
  FaStar,
  FaRegStar,
  FaShoppingBasket,
  FaArrowRight,
  FaCheck,
  FaFire,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import './BookleBook.css';

const PRODUCTS = [
  {
    id: 'p1',
    category: 'Design Low Book',
    title: 'Flovely And Unicom Erna',
    price: 30.0,
    originalPrice: 39.99,
    rating: 5,
    author: 'Albert',
    badge: null,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'p2',
    category: 'Design Low Book',
    title: 'Qple GPad With Retinay Sispla',
    price: 30.0,
    originalPrice: 39.99,
    rating: 5,
    author: 'Wilcon',
    badge: 'Hot',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'p3',
    category: 'Design Low Book',
    title: 'Simple Things You To Save BOOK',
    price: 30.0,
    originalPrice: 39.99,
    rating: 5,
    author: 'Wilcon',
    badge: null,
    image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'p4',
    category: 'Design Low Book',
    title: 'How Deal With Very Bad BOOK',
    price: 30.0,
    originalPrice: 39.99,
    rating: 5,
    author: 'Esther',
    badge: '-30%',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=85',
  },
];

const BookleBook = () => {
  const [addedItems, setAddedItems] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAddToCart = (id) => {
    if (addedItems[id]) return;
    setAddedItems((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === PRODUCTS.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? PRODUCTS.length - 1 : prev - 1));
  };

  const renderStars = (count) =>
    Array.from({ length: 5 }, (_, index) =>
      index < count ? (
        <FaStar key={index} className="bookle-book__star bookle-book__star--active" />
      ) : (
        <FaRegStar key={index} className="bookle-book__star" />
      )
    );

  return (
    <section className="bookle-book">
      <div className="bookle-book__wrapper">
        
        {/* SECTION HEADER */}
        <div className="bookle-book__header">
          <div>
            <h2 className="bookle-book__heading">Bookle Top Books</h2>
            <p className="bookle-book__subheading">This week's picks from the shelf</p>
          </div>
          <button type="button" className="bookle-book__explore-btn">
            Explore more <FaArrowRight className="bookle-book__explore-icon" />
          </button>
        </div>

        {/* MAIN GRID & BANNER LAYOUT */}
        <div className="bookle-book__main-grid">
          
          {/* PRODUCT CARDS LIST & MOBILE CONTAINER */}
          <div className="bookle-book__products-container">
            <div className="bookle-book__products-grid">
              {PRODUCTS.map((product, idx) => {
                const isAdded = Boolean(addedItems[product.id]);
                const isActiveMobile = idx === currentIndex;

                return (
                  <article 
                    className={`bookle-book__card ${isActiveMobile ? 'bookle-book__card--active-mobile' : ''}`} 
                    key={product.id}
                  >
                    <div className="bookle-book__media">
                      {product.badge && (
                        <span
                          className={`bookle-book__badge ${
                            product.badge === 'Hot'
                              ? 'bookle-book__badge--hot'
                              : 'bookle-book__badge--discount'
                          }`}
                        >
                          {product.badge === 'Hot' && (
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
                      <span className="bookle-book__category">{product.category}</span>
                      <h3 className="bookle-book__title" title={product.title}>
                        {product.title}
                      </h3>

                      <div className="bookle-book__price-row">
                        <span className="bookle-book__current-price">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="bookle-book__original-price">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="bookle-book__meta-row">
                        <div className="bookle-book__author-info">
                          <span className="bookle-book__avatar">{product.author.charAt(0)}</span>
                          <span className="bookle-book__author-text">{product.author}</span>
                        </div>
                        <div className="bookle-book__rating">{renderStars(product.rating)}</div>
                      </div>

                      <button
                        type="button"
                        className={`bookle-book__cart-btn ${
                          isAdded ? 'bookle-book__cart-btn--added' : ''
                        }`}
                        onClick={() => handleAddToCart(product.id)}
                      >
                        {isAdded ? (
                          <>
                            <FaCheck className="bookle-book__btn-icon" /> Added to cart
                          </>
                        ) : (
                          <>
                            <FaShoppingBasket className="bookle-book__btn-icon" /> Add to cart
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Mobile 1-by-1 Pagination Navigation Controls */}
            <div className="bookle-book__mobile-nav">
              <button type="button" className="bookle-book__nav-arrow" onClick={prevSlide} aria-label="Previous book">
                <FaChevronLeft />
              </button>
              <div className="bookle-book__dots">
                {PRODUCTS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`bookle-book__dot ${currentIndex === idx ? 'bookle-book__dot--active' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <button type="button" className="bookle-book__nav-arrow" onClick={nextSlide} aria-label="Next book">
                <FaChevronRight />
              </button>
            </div>
          </div>

          {/* RIGHT SIDE PROMO BANNER */}
          <div className="bookle-book__sidebar-banner">
            <div className="bookle-book__sidebar-content">
              <h3 className="bookle-book__sidebar-title">Find your next book</h3>
              <p className="bookle-book__sidebar-subtitle">Get 25% off your first order</p>
              <button type="button" className="bookle-book__btn-brass">
                <span>Shop now</span>
                <FaArrowRight className="bookle-book__btn-brass-icon" />
              </button>
            </div>
            <div className="bookle-book__sidebar-illustration">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=85"
                alt="Reader with books"
                className="bookle-book__sidebar-person"
              />
            </div>
          </div>
        </div>

        {/* FULL WIDTH BOTTOM PROMO BANNER */}
        <div className="bookle-book__promo-banner">
          <div className="bookle-book__promo-collage">
            <img
              src="https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=300&q=80"
              alt="Book cover, close crop"
              className="bookle-book__collage-img bookle-book__collage-img--1"
            />
            <img
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80"
              alt="Book cover, close crop"
              className="bookle-book__collage-img bookle-book__collage-img--2"
            />
          </div>

          <div className="bookle-book__promo-text-wrap">
            <h2 className="bookle-book__promo-heading">
              Get 25% off every category, this week only
            </h2>
            <button type="button" className="bookle-book__btn-brass bookle-book__btn-brass--dark">
              <span>Shop now</span>
              <FaArrowRight className="bookle-book__btn-brass-icon" />
            </button>
          </div>

          <div className="bookle-book__promo-right-person">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=85"
              alt="Reader with books"
              className="bookle-book__promo-person-img"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default BookleBook;