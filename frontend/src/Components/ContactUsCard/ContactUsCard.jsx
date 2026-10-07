import React, { useState } from 'react'
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUserAlt,
  FaPlay,
  FaArrowRight,
} from 'react-icons/fa'
import Swal from 'sweetalert2'
import API from '../../api/axios'
import './ContactUsCard.css'

// Image imported directly from assets folder as webp format
import customerSupportImg from '../../assets/16.webp'

const ContactUsCard = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const name = formData.name.trim()
    const email = formData.email.trim()
    const message = formData.message.trim()

    if (!name || !email || !message) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all required fields.',
      })
      return
    }

    try {
      setLoading(true)

      // Post enquiry directly to the backend endpoint
      await API.post('/enquiries', {
        name,
        email,
        message,
        type: 'General Enquiry',
        subject: 'Website Contact Us Form',
        phone: '+91 9692075298',
        address: 'Srikoruan, Near Indoor Stadium, Gopalpur, Cuttack, Odisha - 753011',
      })

      Swal.fire({
        icon: 'success',
        title: 'Message Sent!',
        text: `Thank you, ${name}! Your enquiry has been received and our team will get back to you shortly.`,
        timer: 2500,
        showConfirmButton: false,
      })

      // Reset form on success
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      console.error('SUBMIT ENQUIRY ERROR:', error)
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text:
          error?.response?.data?.message ||
          'Something went wrong while sending your enquiry. Please try again.',
      })
    } finally {
      setLoading(false)
    }
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
              {/* Contact Person Block */}
              <div className="ContactUsCard-info-item">
                <div className="ContactUsCard-icon-wrapper">
                  <FaUserAlt className="ContactUsCard-icon" />
                </div>
                <div className="ContactUsCard-info-text">
                  <span>Contact Person</span>
                  <h4>Nitish Shaw</h4>
                </div>
              </div>

              {/* Phone Block */}
              <div className="ContactUsCard-info-item">
                <div className="ContactUsCard-icon-wrapper">
                  <FaPhoneAlt className="ContactUsCard-icon" />
                </div>
                <div className="ContactUsCard-info-text">
                  <span>Call Us 24/7</span>
                  <h4>
                    <a
                      href="tel:+919692075298"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      +91 9692075298
                    </a>
                  </h4>
                </div>
              </div>

              {/* Email Block */}
              <div className="ContactUsCard-info-item">
                <div className="ContactUsCard-icon-wrapper">
                  <FaEnvelope className="ContactUsCard-icon" />
                </div>
                <div className="ContactUsCard-info-text">
                  <span>Make a Quote</span>
                  <h4>
                    <a
                      href="mailto:example@gmail.com"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      example@gmail.com
                    </a>
                  </h4>
                </div>
              </div>

              {/* Location Block */}
              <div className="ContactUsCard-info-item">
                <div className="ContactUsCard-icon-wrapper">
                  <FaMapMarkerAlt className="ContactUsCard-icon" />
                </div>
                <div className="ContactUsCard-info-text">
                  <span>Location</span>
                  <h4>Srikoruan, Near Indoor Stadium, Gopalpur, Cuttack, Odisha - 753011</h4>
                </div>
              </div>
            </div>

            {/* Support Image with Play Button */}
            <div className="ContactUsCard-image-container">
              <img
                src={customerSupportImg}
                alt="Customer Support Representative"
                className="ContactUsCard-support-img"
                loading="lazy"
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
              Have questions or want to discuss a project? Reach out directly or fill out the form below, and we'll get back to you promptly.
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
                    disabled={loading}
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
                    disabled={loading}
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
                  disabled={loading}
                ></textarea>
              </div>

              <button
                type="submit"
                className="ContactUsCard-submit-btn"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}{' '}
                <FaArrowRight className="ContactUsCard-arrow-icon" />
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="ContactUsCard-map-container">
          <iframe
            title="Location Map"
            src="https://maps.google.com/maps?q=Indoor%20Stadium%2C%20Gopalpur%2C%20Cuttack%2C%20Odisha%20753011&t=&z=15&ie=UTF8&iwloc=&output=embed"
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
          <div
            className="ContactUsCard-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="ContactUsCard-modal-close"
              onClick={toggleVideoModal}
            >
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