import React from "react";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import "./WishlistBreadcrumb.css";

import bgImage from "../../assets/aboutbreadcrumb.webp";

const WishlistBreadcrumb = () => {
  return (
    <section
      className="wishlist-breadcrumb"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* Overlay */}
      <div className="wishlist-breadcrumb-overlay"></div>

      {/* Content */}
      <div className="wishlist-breadcrumb-container">
        <h1 className="wishlist-breadcrumb-title">
          Wishlist
        </h1>

        <nav
          className="wishlist-breadcrumb-nav"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="wishlist-breadcrumb-link"
          >
            Home
          </Link>

          <FaChevronRight
            className="wishlist-breadcrumb-icon"
            aria-hidden="true"
          />

          <span className="wishlist-breadcrumb-active">
            Wishlist
          </span>
        </nav>
      </div>
    </section>
  );
};

export default WishlistBreadcrumb;