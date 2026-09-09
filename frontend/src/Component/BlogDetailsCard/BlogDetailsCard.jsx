import React, { useState } from 'react'
import {
  FaUser,
  FaComments,
  FaTag,
  FaSearch,
  FaCalendarAlt,
  FaQuoteRight,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaStar,
  FaRegStar,
  FaArrowRight,
} from 'react-icons/fa'
import './BlogDetailsCard.css'

// Import WebP assets
import mainHeroImg from '../../assets/16.webp'
import galleryImg1 from '../../assets/05.webp'
import galleryImg2 from '../../assets/08.webp'
import recentPost1 from '../../assets/11.webp'
import recentPost2 from '../../assets/12.webp'
import recentPost3 from '../../assets/13.webp'
import userAvatar1 from '../../assets/14.webp'
import userAvatar2 from '../../assets/12.webp'

const BlogDetailsCard = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [comments, setComments] = useState([
    {
      id: 1,
      name: 'Leslie Alexander',
      date: 'March 20, 2024 at 2:37 pm',
      avatar: userAvatar1,
      rating: 5,
      comment:
        'Neque porro est qui dolorem ipsum quia quaed inventor veritatis et quasi architecto var sed efficitur turpis gilla sed sit amet finibus eros. Lorem Ipsum is simply dummy',
    },
    {
      id: 2,
      name: 'Alex Flores',
      date: 'March 20, 2024 at 2:37 pm',
      avatar: userAvatar2,
      rating: 4,
      comment:
        'Neque porro est qui dolorem ipsum quia quaed inventor veritatis et quasi architecto var sed efficitur turpis gilla sed sit amet finibus eros. Lorem Ipsum is simply dummy',
    },
  ])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    rating: 5,
  })

  // Event handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePostComment = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Please fill out all required fields.')
      return
    }

    const newComment = {
      id: Date.now(),
      name: formData.name,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }) + ' at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: userAvatar1,
      rating: formData.rating,
      comment: formData.message,
    }

    setComments((prev) => [...prev, newComment])
    setFormData({ name: '', email: '', message: '', rating: 5 })
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      alert(`Searching for: ${searchQuery}`)
    }
  }

  return (
    <section className="BlogDetailsCard-wrapper">
      <div className="BlogDetailsCard-container">
        {/* Main Content Left Column */}
        <div className="BlogDetailsCard-main">
          {/* Main Hero Card */}
          <div className="BlogDetailsCard-hero">
            <div className="BlogDetailsCard-image-box">
              <img
                src={mainHeroImg}
                alt="Main Blog Banner"
                className="BlogDetailsCard-hover-img"
              />
            </div>
            <div className="BlogDetailsCard-hero-meta">
              <span>
                <FaUser className="BlogDetailsCard-meta-icon" /> By Admin
              </span>
              <span>
                <FaComments className="BlogDetailsCard-meta-icon" />{' '}
                {comments.length} Comments
              </span>
              <span>
                <FaTag className="BlogDetailsCard-meta-icon" /> Book Store
              </span>
            </div>
          </div>

          {/* Title & Paragraphs */}
          <article className="BlogDetailsCard-article">
            <h1 className="BlogDetailsCard-title">
              Eu Parturient Dictumst Frames Quam Temper
            </h1>
            <p className="BlogDetailsCard-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur et ipsum ut volutpat. Morbi a mollis felis. Nam consectetur lectus vel lorem facilisis, quis viverra purus pharetra. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce dui lacus, tempor a metus vel, varius rhoncus nunc. Suspendisse luctus feugiat dictum. Curabitur ipsum velit, viverra in pretium eget, molestie maximus magna. Aliquam elementum vel turpis non bibendum. Cras in consequat neque.
            </p>
            <p className="BlogDetailsCard-text">
              Nunc tincidunt cursus lectus ac semper. Aenean ullamcorper quis arcu molestie consequat. Interdum et malesuada fames ac ante ipsum primis in faucibus. Ut nec lobortis elit, eu ultrices justo. Fusce auctor erat est, non fringilla nibh tempus quis. Aenean dignissim turpis ut interdum interdum. Nam molestie sed ex non tempus. Donec sodales aliquam orci non imperdiet. Quisque tempus dolor id nisi blandit tempor ut id lacus. Aliquam mattis tempor posuere. Sed ut sollicitudin velit.
            </p>
            <p className="BlogDetailsCard-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur et ipsum ut volutpat. Morbi a mollis felis. Nam consectetur lectus vel lorem facilisis, quis viverra purus pharetra. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce dui lacus, tempor a metus vel, varius rhoncus nunc. Suspendisse luctus feugiat dictum. Curabitur ipsum velit, viverra in pretium eget, molestie maximus magna. Aliquam elementum vel turpis non bibendum. Cras in consequat neque.
            </p>

            {/* Gallery Section */}
            <div className="BlogDetailsCard-gallery">
              <div className="BlogDetailsCard-gallery-item">
                <img
                  src={galleryImg1}
                  alt="Gallery Item 1"
                  className="BlogDetailsCard-hover-img"
                />
              </div>
              <div className="BlogDetailsCard-gallery-item">
                <img
                  src={galleryImg2}
                  alt="Gallery Item 2"
                  className="BlogDetailsCard-hover-img"
                />
              </div>
            </div>

            <p className="BlogDetailsCard-text">
              Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, made of owl the quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure and dolor in reprehenderit.Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, made of owl the quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure and dolor in reprehenderit.
            </p>

            {/* Quote Box */}
            <blockquote className="BlogDetailsCard-quote">
              <p>
                Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit. Mauris Efficitur Et Ipsum Ut Volutpat. Morbi A Mollis Felis. Nam Consectetur Lectus Vel Lorem Facilisis, Quis Viverra Purus Pharetra. Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit. Fusce Dui Lacus, Tempor A Metus Vel, Varius Rhoncus Nunc. Suspendisse Luctus Feugiat Dictum. Curabitur Ipsum Velit, Viverra In Pretium Eget, Molestie Maximus Magna. Aliquam Elementum Vel Turpis Non Bibendum.
              </p>
              <FaQuoteRight className="BlogDetailsCard-quote-icon" />
            </blockquote>

            <p className="BlogDetailsCard-text">
              Nunc tincidunt cursus lectus ac semper. Aenean ullamcorper quis arcu molestie consequat. Interdum et malesuada fames ac ante ipsum primis in faucibus. Ut nec lobortis elit, eu ultrices justo. Fusce auctor erat est, non fringilla nibh tempus quis. Aenean dignissim turpis ut interdum interdum. Nam molestie sed ex non tempus. Donec sodales aliquam orci non imperdiet. Quisque tempus dolor id nisi blandit tempor ut id lacus. Aliquam mattis tempor posuere.
            </p>

            {/* Tags & Social Share */}
            <div className="BlogDetailsCard-share-bar">
              <div className="BlogDetailsCard-tags-container">
                <span className="BlogDetailsCard-share-label">Tags:</span>
                <button className="BlogDetailsCard-tag-btn">Adventure</button>
                <button className="BlogDetailsCard-tag-btn">Education</button>
                <button className="BlogDetailsCard-tag-btn">Store</button>
              </div>
              <div className="BlogDetailsCard-social-container">
                <span className="BlogDetailsCard-share-label">Share:</span>
                <a href="#facebook" className="BlogDetailsCard-social-icon">
                  <FaFacebookF />
                </a>
                <a href="#twitter" className="BlogDetailsCard-social-icon">
                  <FaTwitter />
                </a>
                <a href="#linkedin" className="BlogDetailsCard-social-icon">
                  <FaLinkedinIn />
                </a>
              </div>
            </div>
          </article>

          {/* Comments List */}
          <div className="BlogDetailsCard-comments-section">
            <h2 className="BlogDetailsCard-section-heading">
              {comments.length < 10 ? `0${comments.length}` : comments.length} Comments
            </h2>

            <div className="BlogDetailsCard-comments-list">
              {comments.map((item) => (
                <div className="BlogDetailsCard-comment-item" key={item.id}>
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="BlogDetailsCard-avatar"
                  />
                  <div className="BlogDetailsCard-comment-content">
                    <div className="BlogDetailsCard-comment-header">
                      <div>
                        <h4 className="BlogDetailsCard-comment-author">
                          {item.name}
                        </h4>
                        <span className="BlogDetailsCard-comment-date">
                          {item.date}
                        </span>
                      </div>
                      <div className="BlogDetailsCard-rating-stars">
                        {[...Array(5)].map((_, i) =>
                          i < item.rating ? (
                            <FaStar key={i} className="BlogDetailsCard-star-filled" />
                          ) : (
                            <FaRegStar key={i} className="BlogDetailsCard-star-empty" />
                          )
                        )}
                      </div>
                    </div>
                    <p className="BlogDetailsCard-comment-text">{item.comment}</p>
                    <button className="BlogDetailsCard-reply-btn">Reply</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave a Comment Form */}
          <div className="BlogDetailsCard-form-section">
            <h2 className="BlogDetailsCard-section-heading">Leave A Comments</h2>
            <form onSubmit={handlePostComment} className="BlogDetailsCard-form">
              <div className="BlogDetailsCard-form-row">
                <div className="BlogDetailsCard-field-group">
                  <label htmlFor="name">Your Name*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="BlogDetailsCard-field-group">
                  <label htmlFor="email">Your Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="BlogDetailsCard-field-group">
                <label htmlFor="message">Message*</label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  placeholder="Write Message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="BlogDetailsCard-submit-btn">
                Post Comment <FaArrowRight />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Right Column */}
        <aside className="BlogDetailsCard-sidebar">
          {/* Search Widget */}
          <div className="BlogDetailsCard-widget">
            <h3 className="BlogDetailsCard-widget-title">Search</h3>
            <form onSubmit={handleSearchSubmit} className="BlogDetailsCard-search-box">
              <input
                type="text"
                placeholder="Search here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">
                <FaSearch />
              </button>
            </form>
          </div>

          {/* Categories Widget */}
          <div className="BlogDetailsCard-widget">
            <h3 className="BlogDetailsCard-widget-title">Categories</h3>
            <ul className="BlogDetailsCard-category-list">
              <li>
                <span>Adventure</span> <span>(5)</span>
              </li>
              <li>
                <span>Education</span> <span>(3)</span>
              </li>
              <li className="BlogDetailsCard-category-active">
                <span>Romance</span> <span>(6)</span>
              </li>
              <li>
                <span>Modern Fiction</span> <span>(2)</span>
              </li>
              <li>
                <span>Contemporary</span> <span>(4)</span>
              </li>
              <li>
                <span>Art & Literature</span> <span>(7)</span>
              </li>
            </ul>
          </div>

          {/* Recent Posts Widget */}
          <div className="BlogDetailsCard-widget">
            <h3 className="BlogDetailsCard-widget-title">Recent Post</h3>
            <div className="BlogDetailsCard-recent-posts">
              <div className="BlogDetailsCard-recent-item">
                <div className="BlogDetailsCard-recent-img">
                  <img src={recentPost1} alt="Recent 1" className="BlogDetailsCard-hover-img" />
                </div>
                <div className="BlogDetailsCard-recent-info">
                  <span><FaCalendarAlt /> 18 Dec, 2024</span>
                  <h5>Top 10 Tarot Decks For The Tarot World Summit</h5>
                </div>
              </div>

              <div className="BlogDetailsCard-recent-item">
                <div className="BlogDetailsCard-recent-img">
                  <img src={recentPost2} alt="Recent 2" className="BlogDetailsCard-hover-img" />
                </div>
                <div className="BlogDetailsCard-recent-info">
                  <span><FaCalendarAlt /> Mar 20, 2024</span>
                  <h5>Eu Parturient Dictumst Fames Quam Tempor</h5>
                </div>
              </div>

              <div className="BlogDetailsCard-recent-item">
                <div className="BlogDetailsCard-recent-img">
                  <img src={recentPost3} alt="Recent 3" className="BlogDetailsCard-hover-img" />
                </div>
                <div className="BlogDetailsCard-recent-info">
                  <span><FaCalendarAlt /> Mar 10, 2024</span>
                  <h5>Students Intelligence In Education In Building..</h5>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Tags Widget */}
          <div className="BlogDetailsCard-widget">
            <h3 className="BlogDetailsCard-widget-title">Tags</h3>
            <div className="BlogDetailsCard-sidebar-tags">
              <span>Romance</span>
              <span>Books</span>
              <span>Tips & Tricks</span>
              <span>Adventure</span>
              <span>Education</span>
              <span>Store</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default BlogDetailsCard