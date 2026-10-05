import React from 'react'
import { FaChevronRight } from 'react-icons/fa'
import './Shopdetailsbreadcrumb.css'
import bgImage from '../../assets/aboutbreadcrumb.webp' 

const Shopdetailsbreadcrumb = ({ 
  title = "Shop Details", 
  productName = "Shop Details" 
}) => {
  return (
    <section 
      className="shop-details-breadcrumb" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="shop-details-breadcrumb-container">
        <h1 className="shop-details-breadcrumb-title">{title}</h1>
        <nav className="shop-details-breadcrumb-nav" aria-label="breadcrumb">
          <a href="/" className="shop-details-breadcrumb-link">
            Home
          </a>
          <FaChevronRight className="shop-details-breadcrumb-icon" />
          <a href="/shopdefault" className="shop-details-breadcrumb-link">
            Shop
          </a>
          <FaChevronRight className="shop-details-breadcrumb-icon" />
          <span className="shop-details-breadcrumb-active">{productName}</span>
        </nav>
      </div>
    </section>
  )
}

export default Shopdetailsbreadcrumb