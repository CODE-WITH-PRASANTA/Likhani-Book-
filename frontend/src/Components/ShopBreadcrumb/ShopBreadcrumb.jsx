import React from 'react'
import { FaChevronRight } from 'react-icons/fa'
import './ShopBreadcrumb.css'
import bgImage from '../../assets/likhani.webp' // Adjust the image path as needed

const ShopBreadcrumb = () => {
  return (
    <section 
      className="shop-breadcrumb" 
      style={{ backgroundImage: `url(${bgImage})` }}
      aria-label="Shop Banner and Breadcrumb"
    >
      {/* Optional overlay for enhanced text readability */}
      <div className="shop-breadcrumb-overlay"></div>

      <div className="shop-breadcrumb-container">
        <h1 className="shop-breadcrumb-title">Shop</h1>
        <nav className="shop-breadcrumb-nav" aria-label="breadcrumb">
          <a href="/" className="shop-breadcrumb-link">
            Home
          </a>
          <FaChevronRight className="shop-breadcrumb-icon" aria-hidden="true" />
          <span className="shop-breadcrumb-active" aria-current="page">
            Shop
          </span>
        </nav>
      </div>
    </section>
  )
}

export default ShopBreadcrumb