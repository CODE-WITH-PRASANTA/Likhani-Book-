import React from 'react';
import './Discount.css';


import booksBannerImg from '../../assets/book-shape.png'; 
import studentGirlImg from '../../assets/girl-shape-2.png';  

const Discount = () => {
  return (
    <section className="discount-banner-wrapper">
      <div className="discount-container">
        
       
        <div className="bg-decorations">
          <span className="star star-1">✦</span>
          <span className="star star-2">✦</span>
          <span className="star star-3">✦</span>
          <span className="paper-plane">✈</span>
          <svg className="dotted-path" viewBox="0 0 200 200" fill="none">
            <path
              d="M10,180 C80,120 120,60 190,10"
              stroke="#6b9ebd"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
          </svg>
        </div>

        {/* बायाँ भाग: बुक्स इमेज */}
        <div className="discount-left-books">
          <img 
            src={booksBannerImg} 
            alt="Books Collection" 
            className="books-img" 
          />
        </div>

        {/* मध्य भाग: टेक्स्ट और बटन */}
        <div className="discount-center-content">
          <h2 className="discount-title">
            Get 25% Discount In All<br />Kind Of Super Selling
          </h2>
          
          <button className="shop-now-btn">
            <span className="btn-text">
              Shop Now <span className="arrow">→</span>
            </span>
          </button>
        </div>

        {/* दायाँ भाग: फ्लोटिंग गर्ल इमेज */}
        <div className="discount-right-girl">
          <img 
            src={studentGirlImg} 
            alt="Student Girl with Books" 
            className="girl-img floating-animation" 
          />
        </div>

      </div>
    </section>
  );
};

export default Discount;