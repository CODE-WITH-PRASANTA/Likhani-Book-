import React, { useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import "./WishlistMain.css";

// Product Images
import product1 from "../../assets/b1.png";
import product2 from "../../assets/b2.png";
import product3 from "../../assets/b3.png";

const WishlistMain = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Simple Things You To Save Book",
      image: product1,
      price: 30.0,
      stockStatus: "In Stock",
      subtotal: 120.0,
    },
    {
      id: 2,
      name: "Qple GPad With Retina Sisplay",
      image: product2,
      price: 39.0,
      stockStatus: "In Stock",
      subtotal: 120.0,
    },
    {
      id: 3,
      name: "Flovely And Unicom Erna",
      image: product3,
      price: 19.0,
      stockStatus: "Out Of Stock",
      subtotal: 120.0,
    },
  ]);

  const handleRemoveItem = (id) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.id !== id)
    );
  };

  return (
    <section className="WishlistMain">
      <div className="WishlistMain__container">

        {items.length > 0 ? (
          <div className="WishlistMain__table-wrapper">
            <table className="WishlistMain__table">
              
              {/* Table Header */}
              <thead>
                <tr className="WishlistMain__header-row">
                  <th className="WishlistMain__th WishlistMain__th--product">
                    Product
                  </th>

                  <th className="WishlistMain__th WishlistMain__th--price">
                    Price
                  </th>

                  <th className="WishlistMain__th WishlistMain__th--stock">
                    Stock
                  </th>

                  <th className="WishlistMain__th WishlistMain__th--subtotal">
                    Subtotal
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="WishlistMain__row"
                  >
                    {/* Product */}
                    <td className="WishlistMain__td WishlistMain__td--product">
                      
                      <button
                        type="button"
                        className="WishlistMain__remove-btn"
                        onClick={() =>
                          handleRemoveItem(item.id)
                        }
                        aria-label={`Remove ${item.name}`}
                      >
                        <IoCloseOutline />
                      </button>

                      <div className="WishlistMain__image-wrapper">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="WishlistMain__product-image"
                        />
                      </div>

                      <span className="WishlistMain__product-name">
                        {item.name}
                      </span>
                    </td>

                    {/* Price */}
                    <td
                      className="WishlistMain__td WishlistMain__td--price"
                      data-label="Price"
                    >
                      ${item.price.toFixed(2)}
                    </td>

                    {/* Stock */}
                    <td
                      className={`WishlistMain__td WishlistMain__td--stock ${
                        item.stockStatus === "In Stock"
                          ? "WishlistMain__td--in-stock"
                          : "WishlistMain__td--out-stock"
                      }`}
                      data-label="Stock"
                    >
                      {item.stockStatus}
                    </td>

                    {/* Subtotal */}
                    <td
                      className="WishlistMain__td WishlistMain__td--subtotal"
                      data-label="Subtotal"
                    >
                      ${item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="WishlistMain__empty">
            <div className="WishlistMain__empty-icon">
              ♡
            </div>

            <h3 className="WishlistMain__empty-title">
              Your Wishlist Is Empty
            </h3>

            <p className="WishlistMain__empty-text">
              You haven't added any products to your wishlist yet.
            </p>
          </div>
        )}

      </div>
    </section>
  );
};

export default WishlistMain;