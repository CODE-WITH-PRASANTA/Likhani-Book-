import React from "react";
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
        <h1 className="AddToCartBreadcrumb-title">Add To Cart</h1>

        <nav
          className="AddToCartBreadcrumb-nav"
          aria-label="breadcrumb"
        >
          <a
            href="/"
            className="AddToCartBreadcrumb-link"
          >
            Home
          </a>

          <FaChevronRight className="AddToCartBreadcrumb-icon" />

          <span className="AddToCartBreadcrumb-active">
            Add To Cart
          </span>
        </nav>
      </div>
    </section>
  );
};

export default AddToCartBreadcrumb;