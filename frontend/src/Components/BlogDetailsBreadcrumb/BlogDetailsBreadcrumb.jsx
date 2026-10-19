import React from 'react'
import { Link } from 'react-router-dom'
import { FaChevronRight } from 'react-icons/fa'
import './BlogDetailsBreadcrumb.css'
import bgImage from '../../assets/likhani.webp'

const BlogDetailsBreadcrumb = ({ title = 'Blog Details' }) => {
  return (
    <section 
      className="blog-breadcrumb" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="blog-breadcrumb-container">
        <h1 className="blog-breadcrumb-title">{title}</h1>
        <nav className="blog-breadcrumb-nav" aria-label="breadcrumb">
          <Link to="/" className="blog-breadcrumb-link">
            Home
          </Link>
          <FaChevronRight className="blog-breadcrumb-icon" />
          <Link to="/blog" className="blog-breadcrumb-link">
            Blog
          </Link>
          <FaChevronRight className="blog-breadcrumb-icon" />
          <span className="blog-breadcrumb-active">Blog Details</span>
        </nav>
      </div>
    </section>
  )
}

export default BlogDetailsBreadcrumb