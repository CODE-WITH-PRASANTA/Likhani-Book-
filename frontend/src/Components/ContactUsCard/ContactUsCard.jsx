import React, { useState } from 'react'
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPlay,
  FaArrowRight,
} from 'react-icons/fa'
import './ContactUsCard.css'

// Image imported directly from assets folder as webp format
import customerSupportImg from '../../assets/16.webp'

const ContactUsCard = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const [isVideoOpen, setIsVideoOpen] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Please fill in all required fields.')
      return
    }
    alert(`Thank you, ${formData.name}! Your message has been sent.`)
    setFormData({ name: '', email: '', message: '' })
  }

  const toggleVideoModal = () => {
    setIsVideoOpen(!isVideoOpen)
  }

  return (
    <section className="ContactUsCard-wrapper">
      <div className="ContactUsCard-container">
        {/* Main Contact Section */}
        <div className="ContactUsCard-content-grid">
          {/* Left Card - Info & Support Image */}
          <div className="ContactUsCard-info-card">
            <div className="ContactUsCard-info-list">
              {/* Phone Block */}
              <div className="ContactUsCard-info-item">
                <div className="ContactUsCard-icon-wrapper">
                  <FaPhoneAlt className="ContactUsCard-icon" />
                </div>
                <div className="ContactUsCard-info-text">
                  <span>Call Us 7/24</span>
                  <h4>+208-555-0112</h4>
                </div>
              </div>

              {/* Email Block */}
              <div className="ContactUsCard-info-item">
                <div className="ContactUsCard-icon-wrapper">
                  <FaEnvelope className="ContactUsCard-icon" />
                </div>
                <div className="ContactUsCard-info-text">
                  <span>Make a Quote</span>
                  <h4>example@gmail.com</h4>
                </div>
              </div>

              {/* Location Block */}
              <div className="ContactUsCard-info-item">
                <div className="ContactUsCard-icon-wrapper">
                  <FaMapMarkerAlt className="ContactUsCard-icon" />
                </div>
                <div className="ContactUsCard-info-text">
                  <span>Location</span>
                  <h4>4517 Washington ave.</h4>
                </div>
              </div>
            </div>

            {/* Support Image with Play Button */}
            <div className="ContactUsCard-image-container">
              <img
                src={customerSupportImg}
                alt="Customer Support Representative"
                className="ContactUsCard-support-img"
              />
              <button
                type="button"
                className="ContactUsCard-play-btn"
                onClick={toggleVideoModal}
                aria-label="Play video"
              >
                <FaPlay className="ContactUsCard-play-icon" />
              </button>
            </div>
          </div>

          {/* Right Form - Ready To Get Started */}
          <div className="ContactUsCard-form-container">
            <h2 className="ContactUsCard-heading">Ready To Get Started?</h2>
            <p className="ContactUsCard-description">
              Nunc tincidunt cursus lectus ac semper. Aenean ullamcorper quis arcu
              molestie consequat. Interdum et malesuada fames ac ante ipsum primis in
              faucibus. Ut nec lobortis elit, eu ultrices justo. Fusce auctor erat est,
              non fringilla nibh tempus quis. Aenean dignissim
            </p>

            <form onSubmit={handleSubmit} className="ContactUsCard-form">
              <div className="ContactUsCard-input-row">
                <div className="ContactUsCard-field-group">
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

                <div className="ContactUsCard-field-group">
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

              <div className="ContactUsCard-field-group">
                <label htmlFor="message">Write Message*</label>
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

              <button type="submit" className="ContactUsCard-submit-btn">
                Send Message <FaArrowRight className="ContactUsCard-arrow-icon" />
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="ContactUsCard-map-container">
          <iframe
            title="Location Map"
            src="https://maps.google.com/maps?q=Level%2013/2%20Elizabeth%20St,%20Melbourne%20VIC%203000,%20Australia&t=&z=14&ie=UTF8&iwloc=&output=embed"
            className="ContactUsCard-map-iframe"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      {/* Video Modal Popup */}
      {isVideoOpen && (
        <div className="ContactUsCard-modal-overlay" onClick={toggleVideoModal}>
          <div className="ContactUsCard-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ContactUsCard-modal-close" onClick={toggleVideoModal}>
              &times;
            </button>
            <div className="ContactUsCard-video-wrapper">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Support Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ContactUsCard