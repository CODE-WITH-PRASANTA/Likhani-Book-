import React, { useEffect, useState } from "react";
import "./FloatingSupport.css";

const FloatingSupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: null, message: "" });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const message = formData.message.trim();

    if (!name || !phone || !message) {
      setSubmitStatus({ success: false, message: "Please fill out all fields." });
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setSubmitStatus({ success: false, message: "Please enter a valid 10-digit mobile number." });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ success: null, message: "" });

    // Prepare SMS body
    const smsMessage =
      `Hello sir, I need help.\n\n` +
      `Name: ${name}\n` +
      `Mobile: +91 ${phone}\n` +
      `Message: ${message}`;

    const smsUrl = `sms:+919668892441?body=${encodeURIComponent(smsMessage)}`;

    // Show temporary success feedback before redirecting
    setSubmitStatus({
      success: true,
      message: "Opening SMS client...",
    });

    setFormData({ name: "", phone: "", message: "" });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsOpen(false);
      setSubmitStatus({ success: null, message: "" });
      window.location.href = smsUrl;
    }, 700);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSubmitStatus({ success: null, message: "" });
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("FloatingSupport__body--locked");
    } else {
      document.body.classList.remove("FloatingSupport__body--locked");
    }

    return () => {
      document.body.classList.remove("FloatingSupport__body--locked");
    };
  }, [isOpen]);

  return (
    <>
      {/* FLOATING SUPPORT BUTTON */}
      {!isOpen && (
        <button
          type="button"
          className="FloatingSupport"
          onClick={() => setIsOpen(true)}
          aria-label="Open customer support"
          title="Need Help?"
        >
          <span className="FloatingSupport__pulse"></span>
          <span className="FloatingSupport__icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 11.5C20 16.194 16.194 20 11.5 20C10.24 20 9.04 19.726 7.96 19.235L4 20L4.765 16.04C4.274 14.96 4 13.76 4 12.5C4 7.806 7.806 4 12.5 4C17.194 4 20 7.806 20 11.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M8 12H8.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M12 12H12.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M16 12H16.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      )}

      {/* POPUP BACKDROP */}
      {isOpen && (
        <div className="FloatingSupport__backdrop" onClick={handleClose}>
          <div className="FloatingSupport__popup" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="FloatingSupport__header">
              <div className="FloatingSupport__headerIcon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20 11.5C20 16.194 16.194 20 11.5 20C10.24 20 9.04 19.726 7.96 19.235L4 20L4.765 16.04C4.274 14.96 4 13.76 4 12.5C4 7.806 7.806 4 12.5 4C17.194 4 20 7.806 20 11.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M8 12H8.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M12 12H12.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M16 12H16.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>

              <div className="FloatingSupport__headerContent">
                <h3>Need Help?</h3>
                <p>Send us your details and we’ll help you.</p>
              </div>

              <button
                type="button"
                className="FloatingSupport__close"
                onClick={handleClose}
                aria-label="Close support form"
              >
                <span>&times;</span>
              </button>
            </div>

            {/* Notification Banner */}
            {submitStatus.message && (
              <div
                style={{
                  padding: "10px 14px",
                  margin: "12px 16px 0 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "500",
                  backgroundColor: submitStatus.success ? "#ecfdf5" : "#fef2f2",
                  color: submitStatus.success ? "#047857" : "#b91c1c",
                  border: `1px solid ${submitStatus.success ? "#a7f3d0" : "#fecaca"}`,
                }}
              >
                {submitStatus.message}
              </div>
            )}

            {/* Form */}
            <form className="FloatingSupport__form" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="FloatingSupport__field">
                <label htmlFor="support-name">Name</label>
                <div className="FloatingSupport__inputWrap">
                  <span className="FloatingSupport__inputIcon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M5 20C5.8 16.8 8.1 15 12 15C15.9 15 18.2 16.8 19 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="support-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    autoComplete="name"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="FloatingSupport__field">
                <label htmlFor="support-phone">Mobile Number</label>
                <div className="FloatingSupport__inputWrap">
                  <span className="FloatingSupport__countryCode">+91</span>
                  <input
                    id="support-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              {/* Message */}
              <div className="FloatingSupport__field">
                <label htmlFor="support-message">Message</label>
                <div className="FloatingSupport__textareaWrap">
                  <textarea
                    id="support-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows="4"
                    maxLength="500"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="FloatingSupport__counter">{formData.message.length}/500</div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="FloatingSupport__submit"
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.75 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}
              >
                <span>{isSubmitting ? "Redirecting..." : "Send Message"}</span>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <p className="FloatingSupport__privacy">
                Your information is used only to respond to your enquiry.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingSupport;