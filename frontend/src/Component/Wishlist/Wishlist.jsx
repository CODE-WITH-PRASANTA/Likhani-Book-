import React, { useState } from 'react';
import { IoCloseOutline, IoChevronUp } from 'react-icons/io5';
import './Wishlist.css';

// Import product images (replace paths with your actual image paths)
import product1 from "../../assets/b1.png";
import product2 from "../../assets/b2.png";
import product3 from "../../assets/b3.png";

const Wishlist = () => {
  // Sample initial state matching reference image
  const [items, setItems] = useState([
    {
      id: 1,
      name: 'Simple Things You To Save Book',
      image: product1,
      price: 30.00,
      stockStatus: 'In Stock',
      subtotal: 120.00,
    },
    {
      id: 2,
      name: 'Qple GPad With Retina Sisplay',
      image: product2,
      price: 39.00,
      stockStatus: 'In Stock',
      subtotal: 120.00,
    },
    {
      id: 3,
      name: 'Flovely And Unicom Erna',
      image: product3,
      price: 19.00,
      stockStatus: 'Out Of Stock',
      subtotal: 120.00,
    },
  ]);

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="Wishlist">
      <div className="Wishlist__container">
        <div className="Wishlist__table-wrapper">
          <table className="Wishlist__table">
            <thead>
              <tr className="Wishlist__header-row">
                <th className="Wishlist__th Wishlist__th--product">Product</th>
                <th className="Wishlist__th Wishlist__th--price">Price</th>
                <th className="Wishlist__th Wishlist__th--stock">Stock</th>
                <th className="Wishlist__th Wishlist__th--subtotal">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="Wishlist__row">
                  <td className="Wishlist__td Wishlist__td--product">
                    <button
                      className="Wishlist__remove-btn"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label="Remove item"
                    >
                      <IoCloseOutline />
                    </button>
                    <div className="Wishlist__image-wrapper">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="Wishlist__product-image"
                      />
                    </div>
                    <span className="Wishlist__product-name">{item.name}</span>
                  </td>

                  <td className="Wishlist__td Wishlist__td--price" data-label="Price">
                    ${item.price.toFixed(2)}
                  </td>

                  <td
                    className={`Wishlist__td Wishlist__td--stock ${
                      item.stockStatus === 'In Stock'
                        ? 'Wishlist__td--in-stock'
                        : 'Wishlist__td--out-stock'
                    }`}
                    data-label="Stock"
                  >
                    {item.stockStatus}
                  </td>

                  <td className="Wishlist__td Wishlist__td--subtotal" data-label="Subtotal">
                    ${item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

       
      </div>
    </div>
  );
};

export default Wishlist;