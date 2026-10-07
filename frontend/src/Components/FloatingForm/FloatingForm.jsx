import React, {
  useEffect,
  useState,
} from "react";

import Swal from "sweetalert2";

import API from "../../api/axios";

import "./FloatingForm.css";

import bookImage from "../../assets/booklogo.webp";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

const FloatingForm = ({
  isOpen: controlledIsOpen,
  onClose,
}) => {
  const [internalOpen, setInternalOpen] =
    useState(true);

  const [formData, setFormData] =
    useState(EMPTY_FORM);

  const [status, setStatus] =
    useState("idle");

  const [isClosing, setIsClosing] =
    useState(false);

  const isControlled =
    controlledIsOpen !== undefined;

  const isVisible = isControlled
    ? controlledIsOpen
    : internalOpen;

  // =====================================================
  // BODY SCROLL
  // =====================================================

  useEffect(() => {
    if (!isVisible) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isVisible]);

  // =====================================================
  // ESCAPE
  // =====================================================

  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isVisible, status]);

  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose = (force = false) => {
    if (
      status === "submitting" &&
      !force
    ) {
      return;
    }

    setIsClosing(true);

    setTimeout(() => {
      if (!isControlled) {
        setInternalOpen(false);
      }

      setIsClosing(false);
      setStatus("idle");

      if (typeof onClose === "function") {
        onClose();
      }
    }, 300);
  };

  // =====================================================
  // CHANGE
  // =====================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (status === "submitting") {
      return;
    }

    const name =
      formData.name.trim();

    const email =
      formData.email.trim();

    const phone =
      formData.phone.trim();

    const address =
      formData.address.trim();

    // ===================================================
    // VALIDATION
    // ===================================================

    if (
      !name ||
      !email ||
      !phone ||
      !address
    ) {
      Swal.fire({
        icon: "warning",
        title: "Please fill all fields",
        text: "All fields are required.",
        confirmButtonText: "Okay",
        confirmButtonColor: "#176b8d",
      });

      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonText: "Okay",
        confirmButtonColor: "#176b8d",
      });

      return;
    }

    const phoneDigits =
      phone.replace(/\D/g, "");

    if (phoneDigits.length < 10) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Phone Number",
        text: "Please enter a valid phone number.",
        confirmButtonText: "Okay",
        confirmButtonColor: "#176b8d",
      });

      return;
    }

    try {
      setStatus("submitting");

      // =================================================
      // SEND TO MONGODB THROUGH BACKEND
      // =================================================

      const payload = {
        name,
        email,
        phone,
        address,

        type: "General Enquiry",

        subject: "Website Enquiry",

        message:
          `Customer enquiry submitted from website. ` +
          `Address: ${address}`,
      };

      const response = await API.post(
        "/enquiries",
        payload
      );

      console.log(
        "ENQUIRY CREATED:",
        response.data
      );

      // =================================================
      // GOOGLE ADS CONVERSION
      // =================================================

      if (
        typeof window.trackContactConversion ===
        "function"
      ) {
        window.trackContactConversion(
          response.data?.enquiry?._id
        );
      }

      // =================================================
      // RESET
      // =================================================

      setFormData(EMPTY_FORM);

      // =================================================
      // SUCCESS
      // =================================================

      Swal.fire({
        icon: "success",
        title: "Thank You!",
        text: "Your details have been submitted successfully.",
        timer: 1800,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });

      setTimeout(() => {
        handleClose(true);
      }, 250);
    } catch (error) {
      console.error(
        "ENQUIRY SUBMISSION ERROR:",
        error
      );

      setStatus("idle");

      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text:
          error?.response?.data?.message ||
          "Unable to submit your enquiry. Please try again.",
        confirmButtonText: "Try Again",
        confirmButtonColor: "#176b8d",
      });
    }
  };

  // =====================================================
  // HIDDEN
  // =====================================================

  if (!isVisible) {
    return null;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className={`likhani-overlay ${
        isClosing
          ? "likhani-overlay-closing"
          : ""
      }`}
      onClick={() => handleClose()}
    >
      <div
        className={`likhani-card ${
          isClosing
            ? "likhani-card-closing"
            : ""
        }`}
        onClick={(event) =>
          event.stopPropagation()
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="likhani-form-title"
      >
        <div className="likhani-orb likhani-orb-one" />
        <div className="likhani-orb likhani-orb-two" />

        <div className="likhani-grid-pattern" />

        <button
          type="button"
          className="likhani-close"
          onClick={() => handleClose()}
          disabled={
            status === "submitting"
          }
          aria-label="Close form"
        >
          <span />
          <span />
        </button>

        <div className="likhani-main">

          <div className="likhani-top">

            <div className="likhani-brand">

              <div className="likhani-brand-logo">
                <img
                  src={bookImage}
                  alt="Likhani Books"
                />
              </div>

              <div className="likhani-brand-text">
                <strong>
                  Likhani Books
                </strong>

                <span>
                  READ · DISCOVER · INSPIRE
                </span>
              </div>

            </div>

            <div className="likhani-mini-visual">

              <div className="likhani-mini-ring ring-one" />

              <div className="likhani-mini-ring ring-two" />

              <div className="likhani-mini-book book-blue">
                BOOK
              </div>

              <div className="likhani-mini-book book-gold">
                READ
              </div>

              <div className="likhani-mini-image">
                <img
                  src={bookImage}
                  alt="Book Logo"
                />
              </div>

              <span className="likhani-mini-star star-left">
                ✦
              </span>

              <span className="likhani-mini-star star-right">
                ✦
              </span>

            </div>

          </div>

          <div className="likhani-heading">

            <div className="likhani-eyebrow">
              <span className="likhani-eyebrow-line" />

              <span>
                WE'D LOVE TO HEAR FROM YOU
              </span>
            </div>

            <h2 id="likhani-form-title">
              Let’s <span>Talk.</span>
            </h2>

            <p>
              Share your details with us
              and our team will get back
              to you shortly.
            </p>

          </div>

          <form
            className="likhani-form"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* NAME */}

            <div className="likhani-field">

              <label htmlFor="likhani-name">
                Your Name
                <em>*</em>
              </label>

              <div className="likhani-input">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                  />

                  <path d="M4 21c0-4 3.2-7 8-7s8 3 8 7" />
                </svg>

                <input
                  id="likhani-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  autoComplete="name"
                  disabled={
                    status === "submitting"
                  }
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="likhani-field">

              <label htmlFor="likhani-email">
                Email Address
                <em>*</em>
              </label>

              <div className="likhani-input">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />

                  <path d="m3 7 9 6 9-6" />
                </svg>

                <input
                  id="likhani-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={
                    status === "submitting"
                  }
                />

              </div>

            </div>

            {/* PHONE */}

            <div className="likhani-field">

              <label htmlFor="likhani-phone">
                Phone Number
                <em>*</em>
              </label>

              <div className="likhani-input">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
                </svg>

                <input
                  id="likhani-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  inputMode="tel"
                  disabled={
                    status === "submitting"
                  }
                />

              </div>

            </div>

            {/* ADDRESS */}

            <div className="likhani-field">

              <label htmlFor="likhani-address">
                Address
                <em>*</em>
              </label>

              <div className="likhani-input">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M20 10c0 5.5-8 12-8 12S4 15.5 4 10a8 8 0 1 1 16 0Z" />

                  <circle
                    cx="12"
                    cy="10"
                    r="2.5"
                  />
                </svg>

                <input
                  id="likhani-address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  autoComplete="street-address"
                  disabled={
                    status === "submitting"
                  }
                />

              </div>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="likhani-submit"
              disabled={
                status === "submitting"
              }
            >
              {status === "idle" ? (
                <>
                  <span>
                    Send My Details
                  </span>

                  <span className="likhani-arrow">
                    →
                  </span>
                </>
              ) : (
                <>
                  <span className="likhani-spinner" />

                  <span>
                    Submitting...
                  </span>
                </>
              )}
            </button>

            <div className="likhani-security">
              <span>
                🔒 Your information stays
                private & secure
              </span>
            </div>

          </form>

          <div className="likhani-bottom-accent">
            <span />
            <span />
            <span />
            <span />
          </div>

        </div>
      </div>
    </div>
  );
};

export default FloatingForm;