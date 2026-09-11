import React from 'react'
import { FaChevronRight } from 'react-icons/fa'
import './DefaultBreadcrumb.css'
import defaultBg from '../../assets/aboutbreadcrumb.webp' 

const DefaultBreadcrumb = ({
  title = "Shop default",
  activePage = "shop default",
  linkText = "Home",
  linkHref = "/",
  bgImage = defaultBg
}) => {
  return (
    <section 
      className="default-breadcrumb" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="default-breadcrumb-container">
        <h1 className="default-breadcrumb-title">{title}</h1>
        <nav className="default-breadcrumb-nav" aria-label="breadcrumb">
          <a href={linkHref} className="default-breadcrumb-link">
            {linkText}
          </a>
          <FaChevronRight className="default-breadcrumb-icon" />
          <span className="default-breadcrumb-active">{activePage}</span>
        </nav>
      </div>
    </section>
  )
}

export default DefaultBreadcrumb