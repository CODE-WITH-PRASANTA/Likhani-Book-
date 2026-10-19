import React from "react";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import "./AddToCartBreadcrumb.css";
import bgImage from "../../assets/aboutbreadcrumb.webp";

const AddToCartBreadcrumb = () => {
  return (
    <section
      className="AddToCartBreadcrumb-section"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="AddToCartBreadcrumb-container">
        <h1 className="AddToCartBreadcrumb-title">Cart</h1>

        <nav
          className="AddToCartBreadcrumb-nav"
          aria-label="breadcrumb"
        >
          <Link
            to="/"
            className="AddToCartBreadcrumb-link"
          >
            Home
          </Link>

          <FaChevronRight className="AddToCartBreadcrumb-icon" />

          <span className="AddToCartBreadcrumb-active">
            Cart
          </span>
        </nav>
      </div>
    </section>
  );
};

export default AddToCartBreadcrumb;