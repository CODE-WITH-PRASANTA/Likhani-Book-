import React, { useState } from 'react';
import { 
  FaStar, 
  FaRegStar, 
  FaShoppingBasket, 
  FaArrowRight, 
  FaCheck, 
  FaHeart, 
  FaRegHeart, 
  FaExpandArrowsAlt, 
  FaEye,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import './RatingBook.css';

const RATED_BOOKS = [
  {
    id: 'rb1',
    category: 'Design Low Book',
    title: 'Simple Things You To Save BOOK',
    price: 30.00,
    rating: 4,
    author: 'Wilson',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'rb2',
    category: 'Design Low Book',
    title: 'How Deal With Very Bad BOOK',
    price: 39.00,
    rating: 4,
    author: 'Wilson',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'rb3',
    category: 'Design Low Book',
    title: 'Qple GPad With Retina Sisplay',
    price: 30.00,
    rating: 4,
    author: 'Wilson',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'rb4',
    category: 'Design Low Book',
    title: 'Flovely And Unicorn Erna',
    price: 19.00,
    rating: 4,
    author: 'Wilson',
    image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'rb5',
    category: 'Design Low Book',
    title: 'Castle In The Sky',
    price: 16.00,
    rating: 4,
    author: 'Wilson',
    image: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'rb6',
    category: 'Design Low Book',
    title: 'The Hidden Mystery Behind',
    price: 30.00,
    rating: 4,
    author: 'Wilson',
    image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=85',
  },
];

const RatingBook = () => {
  const [wishlist, setWishlist] = useState({});
  const [addedMap, setAddedMap] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const toggleWishlist = (id) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (id) => {
    if (addedMap[id]) return;
    setAddedMap((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [id]: false }));
    }, 1800);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === RATED_BOOKS.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? RATED_BOOKS.length - 1 : prev - 1));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      index < rating ? (
        <FaStar key={index} className="rating-book__star rating-book__star--active" />
      ) : (
        <FaRegStar key={index} className="rating-book__star" />
      )
    ));
  };

  return (
    <section className="rating-book">
      <div className="rating-book__wrapper">
        
        {/* HEADER & VIEW MORE BUTTON */}
        <div className="rating-book__header">
          <h2 className="rating-book__heading">Top Rating Books</h2>
          <button type="button" className="rating-book__view-more-btn">
            View More <FaArrowRight className="rating-book__arrow-icon" />
          </button>
        </div>

        {/* CARDS GRID / MOBILE SLIDER */}
        <div className="rating-book__grid-container">
          <div className="rating-book__grid">
            {RATED_BOOKS.map((book, idx) => {
              const isWished = Boolean(wishlist[book.id]);
              const isAdded = Boolean(addedMap[book.id]);
              const isActiveMobile = idx === currentIndex;

              return (
                <article 
                  className={`rating-book__card ${isActiveMobile ? 'rating-book__card--active-mobile' : ''}`} 
                  key={book.id}
                >
                  <div className="rating-book__media">
                    <div className="rating-book__img-frame">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="rating-book__img"
                        loading="lazy"
                      />
                    </div>
                    
                    <div className="rating-book__quick-actions">
                      <button
                        type="button"
                        className={`rating-book__quick-btn ${isWished ? 'rating-book__quick-btn--active' : ''}`}
                        onClick={() => toggleWishlist(book.id)}
                        aria-label="Wishlist toggle"
                      >
                        {isWished ? <FaHeart /> : <FaRegHeart />}
                      </button>
                      <button type="button" className="rating-book__quick-btn" aria-label="Expand view">
                        <FaExpandArrowsAlt />
                      </button>
                      <button type="button" className="rating-book__quick-btn" aria-label="Quick preview">
                        <FaEye />
                      </button>
                    </div>
                  </div>

                  <div className="rating-book__content">
                    <span className="rating-book__genre">{book.category}</span>
                    <h3 className="rating-book__title" title={book.title}>{book.title}</h3>
                    
                    <div className="rating-book__price-row">
                      <span className="rating-book__price">${book.price.toFixed(2)}</span>
                    </div>

                    <div className="rating-book__author-rating">
                      <div className="rating-book__author-wrap">
                        <span className="rating-book__avatar">{book.author.charAt(0)}</span>
                        <span className="rating-book__author-name">{book.author}</span>
                      </div>
                      <div className="rating-book__stars">
                        {renderStars(book.rating)}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`rating-book__cart-btn ${isAdded ? 'rating-book__cart-btn--added' : ''}`}
                      onClick={() => handleAddToCart(book.id)}
                    >
                      {isAdded ? (
                        <>
                          <FaCheck className="rating-book__btn-icon" /> Added
                        </>
                      ) : (
                        <>
                          <FaShoppingBasket className="rating-book__btn-icon" /> Add To Cart
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Mobile Navigation Controls */}
          <div className="rating-book__mobile-nav">
            <button type="button" className="rating-book__nav-arrow" onClick={prevSlide} aria-label="Previous book">
              <FaChevronLeft />
            </button>
            <div className="rating-book__dots">
              {RATED_BOOKS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`rating-book__dot ${currentIndex === idx ? 'rating-book__dot--active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button type="button" className="rating-book__nav-arrow" onClick={nextSlide} aria-label="Next book">
              <FaChevronRight />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default RatingBook;