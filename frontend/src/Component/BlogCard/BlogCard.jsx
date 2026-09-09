import React, { useState } from 'react'
import { FaCalendarAlt, FaUser, FaArrowRight } from 'react-icons/fa'
import './BlogCard.css'

// Importing WebP images from src/assets
import img1 from '../../assets/05.webp'
import img2 from '../../assets/06.webp'
import img3 from '../../assets/07.webp'
import img4 from '../../assets/08.webp'
import img5 from '../../assets/09.webp'
import img6 from '../../assets/10.webp'
import img7 from '../../assets/11.webp'
import img8 from '../../assets/12.webp'
import img9 from '../../assets/13.webp'
import img10 from '../../assets/14.webp'
import img11 from '../../assets/15.webp'
import img12 from '../../assets/16.webp'

const blogData = [
  // Page 1 Cards
  {
    id: 1,
    category: 'Books Store',
    image: img1,
    date: 'Feb 10, 2024',
    author: 'By Admin',
    title: 'Top 5 Tarot Decks For The Tarot World Summit',
  },
  {
    id: 2,
    category: 'Educations',
    image: img2,
    date: 'Mar 20, 2024',
    author: 'By Admin',
    title: 'Behind The Scenes With Author Victoria Aveyard',
  },
  {
    id: 3,
    category: 'Romance',
    image: img3,
    date: 'Jun 14, 2024',
    author: 'By Admin',
    title: "Tiny Emporium: Playful Picks For Kids' Delightful Days.",
  },
  {
    id: 4,
    category: 'Activities',
    image: img4,
    date: 'Mar 12, 2024',
    author: 'By Admin',
    title: 'Eu Parturient Dictumst Fames Quam Tempor',
  },
  // Page 2 Cards
  {
    id: 5,
    category: 'Books Store',
    image: img5,
    date: 'Feb 10, 2024',
    author: 'By Admin',
    title: 'How To Keep Children Safe Online In Simple Steps',
  },
  {
    id: 6,
    category: 'Activities',
    image: img6,
    date: 'Mar 20, 2024',
    author: 'By Admin',
    title: 'That Jerk Form Finance Really Threw Me',
  },
  {
    id: 7,
    category: 'Adventure',
    image: img7,
    date: 'Jun 14, 2024',
    author: 'By Admin',
    title: 'Students Intelligence In Education Building Resilient',
  },
  {
    id: 8,
    category: 'Books Store',
    image: img8,
    date: 'Mar 12, 2024',
    author: 'By Admin',
    title: 'From Without Content Style Without',
  },
  // Page 3 Cards
  {
    id: 9,
    category: 'Romance',
    image: img9,
    date: 'Feb 10, 2024',
    author: 'By Admin',
    title: 'All Inclusive Ultimate Circle Island Day With Lunch',
  },
  {
    id: 10,
    category: 'Adventure',
    image: img10,
    date: 'Mar 20, 2024',
    author: 'By Admin',
    title: "Playful Picks Paradise: Kids' Essentials With Dash.",
  },
  {
    id: 11,
    category: 'Educations',
    image: img11,
    date: 'Jun 14, 2024',
    author: 'By Admin',
    title: "Tiny Emporium: Playful Picks For Kids' Delightful Days.",
  },
  {
    id: 12,
    category: 'Books Store',
    image: img12,
    date: 'Mar 12, 2024',
    author: 'By Admin',
    title: 'Top 10 Tarot Decks For The Tarot World Summit',
  },
]

const BlogCard = () => {
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <section className="BlogCard-wrapper">
      <div className="BlogCard-container">
        <div className="BlogCard-grid">
          {blogData.map((item) => (
            <div className="BlogCard-card" key={item.id}>
              <div className="BlogCard-image-container">
                <img
                  src={item.image}
                  alt={item.title}
                  className="BlogCard-image"
                />
                <span className="BlogCard-badge">{item.category}</span>
              </div>
              <div className="BlogCard-content">
                <div className="BlogCard-meta">
                  <span className="BlogCard-meta-item">
                    <FaCalendarAlt className="BlogCard-icon" />
                    {item.date}
                  </span>
                  <span className="BlogCard-meta-item">
                    <FaUser className="BlogCard-icon" />
                    {item.author}
                  </span>
                </div>
                <h3 className="BlogCard-title">{item.title}</h3>
                <a href="#readmore" className="BlogCard-readmore">
                  Read More <FaArrowRight className="BlogCard-arrow-icon" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Section */}
        <div className="BlogCard-pagination">
          <button
            className="BlogCard-page-btn BlogCard-prev"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className={`BlogCard-page-btn ${currentPage === 1 ? 'BlogCard-active-page' : ''}`}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          <button
            className={`BlogCard-page-btn ${currentPage === 2 ? 'BlogCard-active-page' : ''}`}
            onClick={() => setCurrentPage(2)}
          >
            2
          </button>
          <button
            className={`BlogCard-page-btn ${currentPage === 3 ? 'BlogCard-active-page' : ''}`}
            onClick={() => setCurrentPage(3)}
          >
            3
          </button>
          <span className="BlogCard-dots">...</span>
          <button
            className="BlogCard-page-btn BlogCard-next"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, 3))}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

export default BlogCard