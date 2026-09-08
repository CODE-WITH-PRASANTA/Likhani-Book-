import React, { useState } from 'react';
import './CartPage.css';

// React Icons
import { RxCross2 } from 'react-icons/rx';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { IoChevronUp } from 'react-icons/io5';

// Product Image imports (Replace paths with your actual asset locations)
import bookImg1 from "../../assets/b1.png";
import bookImg2 from "../../assets/b2.png";
import bookImg3 from "../../assets/b3.png";

const initialCart = [
  {
    id: 1,
    name: 'Simple Things You To Save Book',
    price: 30.0,
    quantity: 4,
    image: bookImg1,
  },
  {
    id: 2,
    name: 'Qple GPad With Retina Sisplay',
    price: 30.0,
    quantity: 4,
    image: bookImg2,
  },
  {
    id: 3,
    name: 'Flovely And Unicom Erna',
    price: 30.0,
    quantity: 4,
    image: bookImg3,
  },
];

const CartPage = () => {
  const [cartItems, setCartItems] = useState(initialCart);
  const [coupon, setCoupon] = useState('');

  // Handle Quantity Change
  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Remove Item
  const removeItem = (id) => {
    setCartItems(prev => prev.filter((item) => item.id !== id));
  };

  // Scroll to Top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate Totals
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="CartPage">
      <div className="CartPage-container">
        {/* Main Cart Content */}
        <div className="CartPage-left">
          {/* Cart Table Header */}
          <div className="CartPage-header">
            <div className="CartPage-col-product">Product</div>
            <div className="CartPage-col-price">Price</div>
            <div className="CartPage-col-quantity">Quantity</div>
            <div className="CartPage-col-subtotal">Subtotal</div>
          </div>

          {/* Cart Items List */}
          <div className="CartPage-list">
            {cartItems.map((item) => (
              <div key={item.id} className="CartPage-item">
                <div className="CartPage-col-product">
                  <button
                    className="CartPage-remove-btn"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                  >
                    <RxCross2 />
                  </button>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="CartPage-product-img"
                  />
                  <span className="CartPage-product-title">{item.name}</span>
                </div>

                <div className="CartPage-col-price CartPage-price-text">
                  ${item.price.toFixed(2)}
                </div>

                <div className="CartPage-col-quantity">
                  <div className="CartPage-quantity-box">
                    <button
                      className="CartPage-qty-btn"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <FiMinus />
                    </button>
                    <span className="CartPage-qty-value">{item.quantity}</span>
                    <button
                      className="CartPage-qty-btn"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <div className="CartPage-col-subtotal CartPage-subtotal-text">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Coupon and Update Cart Controls */}
          <div className="CartPage-actions">
            <div className="CartPage-coupon-box">
              <input
                type="text"
                placeholder="Coupon Code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="CartPage-coupon-input"
              />
              <button className="CartPage-btn CartPage-btn-slide CartPage-apply-btn">
                <span>Apply</span>
              </button>
            </div>
            <button className="CartPage-btn CartPage-update-btn">
              Update Cart
            </button>
          </div>
        </div>

        {/* Cart Total Summary */}
        <div className="CartPage-right">
          <div className="CartPage-summary-card">
            <h3 className="CartPage-summary-title">Cart Total</h3>

            <div className="CartPage-summary-row">
              <span>Subtotal:</span>
              <span className="CartPage-summary-value">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="CartPage-summary-row">
              <span>Shipping:</span>
              <span className="CartPage-summary-value CartPage-free-text">
                Free
              </span>
            </div>

            <div className="CartPage-summary-row CartPage-total-row">
              <span>Total:</span>
              <span className="CartPage-total-value">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <button className="CartPage-btn CartPage-btn-slide CartPage-checkout-btn">
              <span>Proceed To Checkout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll To Top Button */}
      <button
        className="CartPage-scroll-top-btn"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <IoChevronUp />
      </button>
    </div>
  );
};

export default CartPage;