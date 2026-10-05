import React from 'react'
import { FaChevronRight } from 'react-icons/fa'
import './BlogDetailsBreadcrumb.css'
import bgImage from '../../assets/likhani.webp' // Adjust the image path as needed

const BlogDetailsBreadcrumb = () => {
  return (
    <section 
      className="blog-breadcrumb" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="blog-breadcrumb-container">
        <h1 className="blog-breadcrumb-title">Blog Details</h1>
        <nav className="blog-breadcrumb-nav" aria-label="breadcrumb">
          <a href="/" className="blog-breadcrumb-link">
            Home
          </a>
          <FaChevronRight className="blog-breadcrumb-icon" />
          <span className="blog-breadcrumb-active">Blog Details</span>
        </nav>
      </div>
    </section>
  )
}

export default BlogDetailsBreadcrumb