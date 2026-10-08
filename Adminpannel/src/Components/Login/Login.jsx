import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiArrowRight,
  FiBookOpen,
  FiBookmark,
  FiShield,
  FiFeather,
} from "react-icons/fi";

import "./Login.css";
import likhaniImage from "../../assets/login.png";

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.identifier === "likhani" &&
      formData.password === "12345"
    ) {
      sessionStorage.setItem("isAdminAuthenticated", "true");

      setIsSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 2500);
    } else {
      setErrorMessage(
        "Invalid credentials. Please check your login details."
      );
    }
  };

  return (
    <div className="Login-container">

      {/* =================================================
          SUCCESS OVERLAY
      ================================================= */}

      {isSuccess && (
        <div className="Login-success-overlay">

          <div className="Login-success-card">

            <div className="Login-success-icon-wrapper">
              <FiCheckCircle
                size={76}
                className="Login-success-icon"
              />
            </div>

            <span className="Login-success-badge">
              <FiShield size={14} />
              Secure Login
            </span>

            <h1 className="Login-success-title">
              LOGIN SUCCESSFUL
            </h1>

            <p className="Login-success-subtitle">
              Welcome to the Likhani Books Admin Portal
            </p>

            <p className="Login-success-text">
              Opening your bookstore dashboard...
            </p>

            <div className="Login-success-loader">
              <span />
            </div>

          </div>

        </div>
      )}

      {/* =================================================
          MAIN LOGIN CARD
      ================================================= */}

      <div
        className={`Login-card-wrapper ${
          isSuccess ? "Login-blur" : ""
        }`}
      >

        {/* =================================================
            LEFT BRAND / BOOK SECTION
        ================================================= */}

        <div
          className="Login-brand-section"
          style={{
            backgroundImage: `
              linear-gradient(
                135deg,
                rgba(18, 30, 49, 0.85),
                rgba(24, 43, 73, 0.70),
                rgba(10, 17, 30, 0.80)
              ),
              url(${likhaniImage})
            `,
          }}
        >

          {/* Decorative elements */}

          <div className="Login-brand-glow Login-brand-glow-one" />
          <div className="Login-brand-glow Login-brand-glow-two" />

          {/* =================================================
              BRAND HEADER
          ================================================= */}

          <div className="Login-brand-header">

            <div className="Login-logo-container">

              <div className="Login-logo-badge">
                <FiFeather className="Login-logo-leaf" />
              </div>

              <div className="Login-logo-text-group">

                <h2 className="Login-brand-title">
                  Likhani
                </h2>

                <span className="Login-brand-subtitle">
                  BOOKS & PUBLISHING
                </span>

                <p className="Login-brand-tagline">
                  Read • Discover • Inspire
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              HERO CONTENT
          ================================================= */}

          <div className="Login-hero-content">

            <span className="Login-hero-badge">
              <FiBookOpen size={14} />
              Likhani Library & Store Admin
            </span>

            <h1 className="Login-hero-heading">
              Great Stories.
              <br />

              <span className="Login-hero-highlight">
                Endless Knowledge.
              </span>
            </h1>

            <p className="Login-hero-description">
              Manage your book inventory, author publications, customer orders,
              curated editions, and reader community from one centralized
              administration dashboard.
            </p>

            {/* BOOK VALUES */}

            <div className="Login-values">

              <div className="Login-value-item">
                <span className="Login-value-icon">
                  <FiBookmark />
                </span>

                <div>
                  <strong>Curated Catalog</strong>
                  <small>Timeless books & literature</small>
                </div>
              </div>

              <div className="Login-value-item">
                <span className="Login-value-icon">
                  <FiShield />
                </span>

                <div>
                  <strong>Protected Archives</strong>
                  <small>Secure admin & author access</small>
                </div>
              </div>

            </div>

          </div>

          {/* =================================================
              BRAND FOOTER
          ================================================= */}

          <div className="Login-hero-footer">

            <div className="Login-footer-line" />

            <p className="Login-handwritten">
              From The Written Word
              <br />
              To Every Reader's Hands
              <FiFeather className="Login-footer-leaf" />
            </p>

          </div>

        </div>

        {/* =================================================
            RIGHT LOGIN FORM
        ================================================= */}

        <div className="Login-form-section">

          {/* TOP BRAND MARK */}

          <div className="Login-mobile-brand">

            <div className="Login-mobile-logo">
              <FiBookOpen />
            </div>

            <span>Likhani Books</span>

          </div>

          {/* USER / ICON */}

          <div className="Login-avatar-container">

            <div className="Login-avatar-3d">

              <FiBookOpen
                size={25}
              />

            </div>

          </div>

          {/* FORM HEADER */}

          <div className="Login-form-header">

            <span className="Login-welcome-label">
              PORTAL ADMINISTRATION
            </span>

            <h2>
              Welcome Back
            </h2>

            <p>
              Sign in to your Likhani administrator portal to oversee
              books, reader orders, and library collections.
            </p>

          </div>

          {/* ERROR */}

          {errorMessage && (
            <div className="Login-error-badge">
              {errorMessage}
            </div>
          )}

          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="Login-form"
          >

            {/* IDENTIFIER */}

            <div className="Login-input-wrapper">

              <label
                htmlFor="identifier"
                className="Login-input-label"
              >
                Admin Email or Username
              </label>

              <div className="Login-input-group">

                <FiMail
                  className="Login-input-icon"
                  size={18}
                />

                <input
                  id="identifier"
                  type="text"
                  name="identifier"
                  placeholder="Enter your username (likhani)"
                  value={formData.identifier}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="Login-input-wrapper">

              <label
                htmlFor="password"
                className="Login-input-label"
              >
                Password
              </label>

              <div className="Login-input-group">

                <FiLock
                  className="Login-input-icon"
                  size={18}
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="Login-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiEye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* OPTIONS */}

            <div className="Login-form-options">

              <label className="Login-checkbox-label">

                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />

                <span>
                  Remember me
                </span>

              </label>

              <a
                href="#forgot"
                className="Login-forgot-link"
              >
                Forgot Password?
              </a>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="Login-submit-btn"
            >

              <span>
                Enter Dashboard
              </span>

              <FiArrowRight
                size={19}
              />

            </button>

          </form>

          {/* SECURITY INFO */}

          <div className="Login-security-note">

            <FiShield size={15} />

            <span>
              Your portal session is encrypted and protected with secure authentication.
            </span>

          </div>

          {/* COPYRIGHT */}

          <div className="Login-copyright">
            © {new Date().getFullYear()} Likhani Books & Publications. All rights reserved.
          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;