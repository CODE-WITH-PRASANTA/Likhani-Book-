import React, { useState, useEffect } from 'react';
import { 
  FaHeart, 
  FaEye, 
  FaShoppingBasket, 
  FaStar, 
  FaStarHalfAlt, 
  FaRegStar,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import './Relatedproduct.css';

// डमी डेटा (रेफ़रेंस इमेज के अनुसार)
const productsData = [
  {
    id: 1,
    category: 'Design Low Book',
    title: 'Qple GPad With Retina Sisplay',
    price: '$30.00',
    oldPrice: '$39.99',
    author: 'Hawkins',
    authorImg: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
    coverImg: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    tag: 'Hot',
    discount: null,
    rating: 5,
  },
  {
    id: 2,
    category: 'Design Low Book',
    title: 'Simple Things You To Save BOOK',
    price: '$30.00',
    oldPrice: '$39.99',
    author: '(Author) Albert',
    authorImg: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80',
    coverImg: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    tag: null,
    discount: null,
    rating: 4,
  },
  {
    id: 3,
    category: 'Design Low Book',
    title: 'Simple Things You To Save BOOK',
    price: '$30.00',
    oldPrice: '$39.99',
    author: 'Wilson',
    authorImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
    coverImg: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
    tag: 'Hot',
    discount: '-30%',
    rating: 4,
  },
  {
    id: 4,
    category: 'Design Low Book',
    title: 'How Deal With Very Bad BOOK',
    price: '$30.00',
    oldPrice: '$39.99',
    author: 'Alexander',
    authorImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
    coverImg: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
    tag: null,
    discount: null,
    rating: 4,
  },
  {
    id: 5,
    category: 'Design Low Book',
    title: 'Qple GPad With Retina Sisplay',
    price: '$30.00',
    oldPrice: '$39.99',
    author: 'Esther',
    authorImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
    coverImg: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=400&q=80',
    tag: null,
    discount: null,
    rating: 4,
  },
  {
    id: 6,
    category: 'Design Low Book',
    title: 'Creative Art & Modern Design',
    price: '$28.00',
    oldPrice: '$35.00',
    author: 'Sophia',
    authorImg: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80',
    coverImg: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80',
    tag: 'Hot',
    discount: '-15%',
    rating: 5,
  },
  {
    id: 7,
    category: 'Design Low Book',
    title: 'Thinking in Fast Architecture',
    price: '$32.00',
    oldPrice: '$42.00',
    author: 'Liam',
    authorImg: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80',
    coverImg: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&q=80',
    tag: null,
    discount: null,
    rating: 4,
  }
];

const Relatedproduct = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(5);
  const [isPaused, setIsPaused] = useState(false);

  // स्क्रीन साइज़ के अनुसार कार्ड्स की संख्या सेट करना
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 576) {
        setVisibleCards(1);
      } else if (window.innerWidth < 768) {
        setVisibleCards(2);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(3);
      } else if (window.innerWidth < 1280) {
        setVisibleCards(4);
      } else {
        setVisibleCards(5);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, productsData.length - visibleCards);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // 1-1 करके धीरे-धीरे ऑटो-स्लाइड
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 3500); // 3.5 सेकंड में अगला 1 कार्ड स्लाइड होगा

    return () => clearInterval(interval);
  }, [currentIndex, maxIndex, isPaused]);

  return (
    <section className="related-products-section">
      {/* हेडर */}
      <div className="section-header">
        <h2 className="section-title">Related Products</h2>
        <p className="section-subtitle">
          Interdum et malesuada fames ac ante ipsum primis in faucibus.
        </p>
        <p className="section-subtitle">
          Donec at nulla nulla. Duis posuere ex lacus
        </p>
      </div>

      {/* कैरोसेल कंटेनर */}
      <div 
        className="carousel-wrapper"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <button className="nav-btn prev-btn" onClick={prevSlide} aria-label="Previous">
          <FaChevronLeft />
        </button>

        <div className="carousel-viewport">
          <div 
            className="carousel-track"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`
            }}
          >
            {productsData.map((item) => (
              <div 
                key={item.id} 
                className="product-card-container"
                style={{ flex: `0 0 ${100 / visibleCards}%` }}
              >
                <div className="product-card">
                  {/* इमेज बॉक्स */}
                  <div className="image-box">
                    {item.tag && <span className="tag-badge hot-badge">{item.tag}</span>}
                    {item.discount && <span className="tag-badge discount-badge">{item.discount}</span>}
                    
                    <img 
                      src={item.coverImg} 
                      alt={item.title} 
                      className="product-img" 
                    />

                    {/* होवर एक्शन आइकन्स */}
                    <div className="hover-actions">
                      <button className="action-btn" title="Wishlist">
                        <FaHeart />
                      </button>
                      <button className="action-btn" title="Quick View">
                        <FaEye />
                      </button>
                    </div>
                  </div>

                  {/* उत्पाद विवरण */}
                  <div className="card-info">
                    <span className="category-label">{item.category}</span>
                    <h3 className="product-name">{item.title}</h3>

                    <div className="price-box">
                      <span className="current-price">{item.price}</span>
                      <span className="old-price">{item.oldPrice}</span>
                    </div>

                    {/* ऑथर और स्टार रेटिंग */}
                    <div className="author-rating-row">
                      <div className="author-details">
                        <img src={item.authorImg} alt={item.author} className="author-avatar" />
                        <span className="author-name">{item.author}</span>
                      </div>
                      <div className="star-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < item.rating ? 'star filled' : 'star empty'} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* Add to Cart बटन (लेफ्ट टू राइट ऑरेंज इफ़ेक्ट) */}
                    <button className="add-to-cart-btn">
                      <span className="btn-content">
                        <FaShoppingBasket className="cart-icon" />
                        Add To Cart
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="nav-btn next-btn" onClick={nextSlide} aria-label="Next">
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
};

export default Relatedproduct;