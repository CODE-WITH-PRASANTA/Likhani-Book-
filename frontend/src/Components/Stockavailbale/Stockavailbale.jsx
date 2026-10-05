import React, { useState } from 'react';
import './Stockavailbale.css';
import { 
  FaStar, 
  FaShoppingBasket, 
  FaHeart, 
  FaCheck, 
  FaRegHeart, 
  FaExpandAlt 
} from 'react-icons/fa';

import bookImg1 from '../../assets/01.png'; 
import bookImg2 from '../../assets/02.png'; 
import bookImg3 from '../../assets/03.png'; 
import bookImg4 from '../../assets/04.png'; 
import bookImg5 from '../../assets/05.png'; 
const productImages = [
  bookImg1,
  bookImg2,
  bookImg3,
  bookImg4,
  bookImg5
];

const Stockavailbale = () => {
  // पहली इमेज डिफ़ॉल्ट रूप से लोड होगी
  const [selectedImage, setSelectedImage] = useState(productImages[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const unitPrice = 1299; // भारतीय रुपये (₹)

  const handleQuantityChange = (type) => {
    if (type === 'decrease') {
      if (quantity > 1) setQuantity(prev => prev - 1);
    } else {
      setQuantity(prev => prev + 1);
    }
  };

  const handleAddToCart = () => {
    const total = (unitPrice * quantity).toLocaleString('en-IN');
    setAlertMessage(`Added ${quantity} item(s) to cart! Total: ₹${total}`);
    setTimeout(() => setAlertMessage(""), 3000);
  };

  return (
    <div className="stock-available-wrapper">
      {alertMessage && <div className="cart-popup-toast">{alertMessage}</div>}

      <div className="product-details-container">
        
        {/* बायाँ भाग: इमेज गैलरी */}
        <div className="product-gallery-section">
          <div className="main-image-card">
            <img 
              src={selectedImage} 
              alt="Selected Book Cover" 
              className="featured-book-img" 
            />
          </div>

          {/* थंबनेल्स */}
          <div className="thumbnails-row">
            {productImages.map((imgSrc, index) => (
              <button
                key={index}
                className={`thumb-btn ${selectedImage === imgSrc ? 'active-thumb' : ''}`}
                onClick={() => setSelectedImage(imgSrc)}
              >
                <img src={imgSrc} alt={`Thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* दायाँ भाग: प्रोडक्ट विवरण */}
        <div className="product-info-section">
          <div className="title-availability-header">
            <h1 className="product-main-title">Castle The Sky</h1>
            <span className="stock-status-badge">Stock Availability.</span>
          </div>

          <div className="rating-review-row">
            <div className="stars-group">
              {[1, 2, 3, 4].map((star) => (
                <FaStar key={star} className="star-icon filled" />
              ))}
              <FaStar className="star-icon empty" />
            </div>
            <span className="customer-review-count">(1 Customer Reviews)</span>
          </div>

          <p className="product-description-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec pulvinar, tortor quis varius pretium est felis 
            scelerisque nulla, vitae placerat justo nunc a massa. Aenean nec montes vestibulum urna vel imperdiet ipsum. 
            Orci varius natoque penatibus et magnis dis ridiculus parturient montes.
          </p>

          <div className="product-price-row">
            <span className="current-inr-price">
              ₹{(unitPrice * quantity).toLocaleString('en-IN')}.00
            </span>
          </div>

          <div className="product-actions-toolbar">
            <div className="quantity-counter-box">
              <button 
                className="qty-btn" 
                onClick={() => handleQuantityChange('decrease')}
                disabled={quantity <= 1}
              >
                –
              </button>
              <span className="qty-number">{quantity}</span>
              <button 
                className="qty-btn" 
                onClick={() => handleQuantityChange('increase')}
              >
                +
              </button>
            </div>

            <button className="read-little-btn" onClick={() => alert("Preview opening...")}>
              Read A Little
            </button>

            <button className="add-cart-btn" onClick={handleAddToCart}>
              <span className="btn-inner">
                <FaShoppingBasket className="basket-icon" />
                Add To Cart
              </span>
            </button>

            <button 
              className={`action-circle-btn ${isWishlisted ? 'liked' : ''}`}
              onClick={() => setIsWishlisted(!isWishlisted)}
              title="Add to Wishlist"
            >
              {isWishlisted ? <FaHeart color="#ff5700" /> : <FaRegHeart />}
            </button>

            <button className="action-circle-btn" title="Expand View">
              <FaExpandAlt />
            </button>
          </div>

          <div className="product-meta-specs-box">
            <div className="meta-col">
              <div className="meta-item">
                <span className="meta-label">SKU:</span>
                <span className="meta-val">FTC1020B65D</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                <span className="meta-val">Kids Toys</span>
              </div>
            </div>

            <div className="meta-col">
              <div className="meta-item">
                <span className="meta-label">Tags:</span>
                <span className="meta-val">Design Low Book</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Format:</span>
                <span className="meta-val">Hardcover</span>
              </div>
            </div>

            <div className="meta-col">
              <div className="meta-item">
                <span className="meta-label">Total page:</span>
                <span className="meta-val">330</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Language:</span>
                <span className="meta-val">English</span>
              </div>
            </div>

            <div className="meta-col">
              <div className="meta-item">
                <span className="meta-label">Publish Years:</span>
                <span className="meta-val">2021</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Century:</span>
                <span className="meta-val">United States</span>
              </div>
            </div>
          </div>

          <div className="features-highlight-box">
            <div className="feature-item">
              <FaCheck className="check-icon" />
              <span>Free shipping orders from ₹1,500</span>
            </div>
            <div className="feature-item">
              <FaCheck className="check-icon" />
              <span>Mamaya Flash Discount: Starting at 30% Off</span>
            </div>
            <div className="feature-item">
              <FaCheck className="check-icon" />
              <span>30 days exchange & return</span>
            </div>
            <div className="feature-item">
              <FaCheck className="check-icon" />
              <span>Safe & Secure online shopping</span>
            </div>
          </div>

          <div className="available-on-container">
            <span className="available-title">Also Available On:</span>
            <div className="brand-logos-row">
              <div className="brand-logo-item">
                <svg className="customer-io-icon" viewBox="0 0 140 32" height="24" fill="none">
                  <circle cx="16" cy="16" r="12" fill="#FFE500" />
                  <path d="M4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16" stroke="#6C38FF" strokeWidth="4" strokeLinecap="round" />
                  <text x="36" y="21" fill="#1b2559" fontFamily="system-ui" fontSize="15" fontWeight="700">customer.io</text>
                </svg>
              </div>

              <div className="brand-logo-item">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png" 
                  alt="Amazon" 
                  className="partner-brand-img amazon-logo" 
                />
              </div>

              <div className="brand-logo-item">
                <div className="dropbox-wrapper">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="#0061FF">
                    <path d="M6 2l6 4-6 4-6-4 6-4zm12 0l6 4-6 4-6-4 6-4zM0 10l6 4-6 4 6 4-6-4zm24 0l-6 4 6 4-6 4 6-4zM6 18l6 4 6-4-6-4-6 4z" />
                  </svg>
                  <span className="dropbox-text">Dropbox</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Stockavailbale;