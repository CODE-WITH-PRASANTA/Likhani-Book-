import React, { useState } from 'react'
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUserAlt,
  FaArrowRight,
  FaDirections,
} from 'react-icons/fa'
import Swal from 'sweetalert2'
import API from '../../api/axios'
import './ContactUsCard.css'

const PHONE_DISPLAY = '+91 9692075298'
const PHONE_LINK = 'tel:+919692075298'
const EMAIL = 'example@gmail.com'
const ADDRESS = 'Srikoruan, Near Indoor Stadium, Gopalpur, Cuttack, Odisha - 753011'
const DIRECTIONS_URL =
  'https://www.google.com/maps/search/?api=1&query=Indoor+Stadium+Gopalpur+Cuttack+Odisha+753011'

const CONTACT_ITEMS = [
  {
    key: 'person',
    icon: FaUserAlt,
    label: 'Contact person',
    value: 'Nitish Shaw',
  },
  {
    key: 'phone',
    icon: FaPhoneAlt,
    label: 'Call us 24/7',
    value: PHONE_DISPLAY,
    href: PHONE_LINK,
  },
  {
    key: 'email',
    icon: FaEnvelope,
    label: 'Email us',
    value: EMAIL,
    href: `mailto:${EMAIL}`,
  },
  {
    key: 'location',
    icon: FaMapMarkerAlt,
    label: 'Visit us',
    value: ADDRESS,
  },
]

const ContactUsCard = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)

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
    const phone = formData.phone.trim()
    const message = formData.message.trim()

    if (!name || !email || !phone || !message) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all required fields.',
      })
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
      })
      return
    }

    const digitsOnly = phone.replace(/\D/g, '')
    if (digitsOnly.length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Phone Number',
        text: 'Please enter a valid 10-digit phone number.',
      })
      return
    }

    try {
      setLoading(true)

      // Post enquiry with customer's actual contact information
      await API.post('/enquiries', {
        name,
        email,
        phone,
        message,
        type: 'General Enquiry',
        subject: 'Website Contact Us Form',
        address: '',
      })

      Swal.fire({
        icon: 'success',
        title: 'Message Sent!',
        text: `Thank you, ${name}! Your enquiry has been received and our team will get back to you shortly.`,
        timer: 2500,
        showConfirmButton: false,
      })

      // Reset form on success
      setFormData({ name: '', email: '', phone: '', message: '' })
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

  return (
    <section className="ContactUsCard-wrapper">
      <div className="ContactUsCard-container">
        {/* Main Contact Section */}
        <div className="ContactUsCard-content-grid">
          {/* Left: contact details */}
          <aside className="ContactUsCard-info-card">
            <div className="ContactUsCard-info-head">
              <h3 className="ContactUsCard-info-title">Contact information</h3>
              <p className="ContactUsCard-info-subtitle">
                Reach us directly or send a message. We reply within one business day.
              </p>
            </div>

            <ul className="ContactUsCard-info-list">
              {CONTACT_ITEMS.map(({ key, icon: Icon, label, value, href }) => (
                <li key={key} className="ContactUsCard-info-item">
                  <div className="ContactUsCard-icon-wrapper">
                    <Icon className="ContactUsCard-icon" />
                  </div>
                  <div className="ContactUsCard-info-text">
                    <span>{label}</span>
                    {href ? (
                      <a href={href} className="ContactUsCard-info-value">
                        {value}
                      </a>
                    ) : (
                      <p className="ContactUsCard-info-value">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* Right: form */}
          <div className="ContactUsCard-form-container">
            <h2 className="ContactUsCard-heading">Ready to get started?</h2>
            <p className="ContactUsCard-description">
              Have a question or want to discuss a project? Fill in the form and we'll get back to you promptly.
            </p>

            <form onSubmit={handleSubmit} className="ContactUsCard-form">
              <div className="ContactUsCard-input-row">
                <div className="ContactUsCard-field-group">
                  <label htmlFor="name">Your name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="ContactUsCard-field-group">
                  <label htmlFor="email">Your email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="ContactUsCard-field-group">
                <label htmlFor="phone">Your phone number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter 10-digit phone number"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="ContactUsCard-field-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  placeholder="Tell us how we can help"
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
                <span>{loading ? 'Sending...' : 'Send message'}</span>
                <span className="ContactUsCard-arrow-wrap">
                  <FaArrowRight className="ContactUsCard-arrow-icon" />
                </span>
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
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>

          <div className="ContactUsCard-map-card">
            <p className="ContactUsCard-map-address">{ADDRESS}</p>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ContactUsCard-map-link"
            >
              <FaDirections />
              Get directions
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactUsCard