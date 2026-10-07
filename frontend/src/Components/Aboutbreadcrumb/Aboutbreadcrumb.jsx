import React from 'react'
import { FaChevronRight } from 'react-icons/fa'
import './AboutBreadcrumb.css'
import bgImage from '../../assets/aboutbreadcrumb.webp' 

const AboutBreadcrumb = () => {
  return (
    <section 
      className="about-breadcrumb" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="about-breadcrumb-container">
        <h1 className="about-breadcrumb-title">About US</h1>
        <nav className="about-breadcrumb-nav" aria-label="breadcrumb">
          <a href="/" className="about-breadcrumb-link">
            Home
          </a>
          <FaChevronRight className="about-breadcrumb-icon" />
          <span className="about-breadcrumb-active">About</span>
        </nav>
      </div>
    </section>
  )
}

export default AboutBreadcrumb