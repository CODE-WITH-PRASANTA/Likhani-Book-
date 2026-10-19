import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiGift,
  FiHeart,
  FiPackage,
  FiSmile,
  FiArrowRight,
  FiCheck,
  FiBookOpen,
} from "react-icons/fi";
import API from "../../api/axios";
import GoogleModal from "../GoogleModal/GoogleModal";
import { useAuth } from "../../context/AuthContext";
import "./SignUp.css";

const SignUp = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must contain at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreeTerms) {
      newErrors.terms = "Please accept the Terms & Conditions";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError("");

      const res = await API.post("/auth/register", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (res.data?.success) {
        login(res.data.user, res.data.token);

        setSignupSuccess(true);
        setTimeout(() => {
          navigate("/");
        }, 1200);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setServerError(
        err.response?.data?.message || "Failed to create account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    setIsGoogleModalOpen(true);
  };

  // Safe fallback to prevent reference errors during browser caching / HMR
  const handleFacebookSignup = () => {};

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <main className="SignUp">
      <section className="SignUp__section">
        <div className="SignUp__backgroundShape SignUp__backgroundShape--top"></div>
        <div className="SignUp__backgroundShape SignUp__backgroundShape--left"></div>
        <div className="SignUp__backgroundShape SignUp__backgroundShape--right"></div>

        <div className="SignUp__container">
          {/* ================= LEFT CONTENT ================= */}
          <div className="SignUp__content">
            <span className="SignUp__eyebrow">
              WELCOME TO LEKHANI
            </span>

            <h1 className="SignUp__title">
              Join Our
              <br />
              Book Lover
              <br />
              <span>Community</span>
            </h1>

            <div className="SignUp__titleLine"></div>

            <p className="SignUp__description">
              Create your account to explore thousands of books,
              get exclusive offers, save your wishlist and enjoy a
              personalized shopping experience.
            </p>

            <div className="SignUp__features">
              {/* Feature 1 */}
              <div className="SignUp__feature">
                <div className="SignUp__featureIcon SignUp__featureIcon--blue">
                  <FiGift />
                </div>

                <div className="SignUp__featureContent">
                  <h3>Exclusive Offers</h3>
                  <p>Get special discounts and deals</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="SignUp__feature">
                <div className="SignUp__featureIcon SignUp__featureIcon--red">
                  <FiHeart />
                </div>

                <div className="SignUp__featureContent">
                  <h3>Save Your Wishlist</h3>
                  <p>Keep your favorite books</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="SignUp__feature">
                <div className="SignUp__featureIcon SignUp__featureIcon--green">
                  <FiPackage />
                </div>

                <div className="SignUp__featureContent">
                  <h3>Track Your Orders</h3>
                  <p>Easy order tracking</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="SignUp__feature">
                <div className="SignUp__featureIcon SignUp__featureIcon--gold">
                  <FiSmile />
                </div>

                <div className="SignUp__featureContent">
                  <h3>Personalized Experience</h3>
                  <p>Recommendations just for you</p>
                </div>
              </div>
            </div>

            {/* Decorative Book */}
            <div className="SignUp__bookDecoration">
              <div className="SignUp__book SignUp__book--one">
                Good Ideas Start
                <br />
                With Great Books
              </div>

              <div className="SignUp__book SignUp__book--two">
                LEKHANI
              </div>

              <div className="SignUp__book SignUp__book--three"></div>
            </div>

            <div className="SignUp__sparkle SignUp__sparkle--one"></div>
            <div className="SignUp__sparkle SignUp__sparkle--two"></div>
            <div className="SignUp__sparkle SignUp__sparkle--three"></div>
          </div>

          {/* ================= SIGNUP CARD ================= */}
          <div className="SignUp__card">
            <div className="SignUp__cardHeader">
              <div className="SignUp__cardIcon">
                <FiBookOpen />
              </div>

              <h2 className="SignUp__cardTitle">
                Create Your Account
              </h2>

              <p className="SignUp__cardSubtitle">
                Join us today and start your book journey
              </p>
            </div>

            <form
              className="SignUp__form"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* First + Last Name */}
              <div className="SignUp__row">
                <div className="SignUp__fieldGroup">
                  <div
                    className={`SignUp__inputWrapper ${
                      errors.firstName
                        ? "SignUp__inputWrapper--error"
                        : ""
                    }`}
                  >
                    <FiUser className="SignUp__inputIcon" />

                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name *"
                      value={formData.firstName}
                      onChange={handleChange}
                      autoComplete="given-name"
                    />
                  </div>

                  {errors.firstName && (
                    <span className="SignUp__error">
                      {errors.firstName}
                    </span>
                  )}
                </div>

                <div className="SignUp__fieldGroup">
                  <div
                    className={`SignUp__inputWrapper ${
                      errors.lastName
                        ? "SignUp__inputWrapper--error"
                        : ""
                    }`}
                  >
                    <FiUser className="SignUp__inputIcon" />

                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name *"
                      value={formData.lastName}
                      onChange={handleChange}
                      autoComplete="family-name"
                    />
                  </div>

                  {errors.lastName && (
                    <span className="SignUp__error">
                      {errors.lastName}
                    </span>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="SignUp__fieldGroup">
                <div
                  className={`SignUp__inputWrapper ${
                    errors.email
                      ? "SignUp__inputWrapper--error"
                      : ""
                  }`}
                >
                  <FiMail className="SignUp__inputIcon" />

                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address *"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>

                {errors.email && (
                  <span className="SignUp__error">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Phone */}
              <div className="SignUp__fieldGroup">
                <div
                  className={`SignUp__inputWrapper ${
                    errors.phone
                      ? "SignUp__inputWrapper--error"
                      : ""
                  }`}
                >
                  <FiPhone className="SignUp__inputIcon" />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number *"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength="10"
                    autoComplete="tel"
                  />
                </div>

                {errors.phone && (
                  <span className="SignUp__error">
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="SignUp__fieldGroup">
                <div
                  className={`SignUp__inputWrapper ${
                    errors.password
                      ? "SignUp__inputWrapper--error"
                      : ""
                  }`}
                >
                  <FiLock className="SignUp__inputIcon" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password *"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="SignUp__passwordButton"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {errors.password && (
                  <span className="SignUp__error">
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="SignUp__fieldGroup">
                <div
                  className={`SignUp__inputWrapper ${
                    errors.confirmPassword
                      ? "SignUp__inputWrapper--error"
                      : ""
                  }`}
                >
                  <FiLock className="SignUp__inputIcon" />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    placeholder="Confirm Password *"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="SignUp__passwordButton"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff />
                    ) : (
                      <FiEye />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <span className="SignUp__error">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              {/* Terms */}
              <div className="SignUp__termsArea">
                <label className="SignUp__terms">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) =>
                      setAgreeTerms(e.target.checked)
                    }
                  />

                  <span className="SignUp__customCheckbox">
                    {agreeTerms && <FiCheck />}
                  </span>

                  <span className="SignUp__termsText">
                    I agree to the{" "}
                    <button
                      type="button"
                      className="SignUp__termsLink"
                      onClick={() =>
                        alert("Terms & Conditions")
                      }
                    >
                      Terms & Conditions
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      className="SignUp__termsLink"
                      onClick={() =>
                        alert("Privacy Policy")
                      }
                    >
                      Privacy Policy
                    </button>
                    .
                  </span>
                </label>

                {errors.terms && (
                  <span className="SignUp__error SignUp__error--terms">
                    {errors.terms}
                  </span>
                )}
              </div>

              {serverError && (
                <div
                  style={{
                    padding: "10px 14px",
                    marginBottom: "14px",
                    borderRadius: "8px",
                    background: "#fde8e8",
                    color: "#c81e1e",
                    fontSize: "12px",
                    fontWeight: "500",
                    border: "1px solid #f8b4b4",
                  }}
                >
                  {serverError}
                </div>
              )}

              {signupSuccess && (
                <div
                  style={{
                    padding: "10px 14px",
                    marginBottom: "14px",
                    borderRadius: "8px",
                    background: "#def7ec",
                    color: "#03543f",
                    fontSize: "12px",
                    fontWeight: "500",
                    border: "1px solid #bcf0da",
                  }}
                >
                  Account created successfully! Redirecting to Lekhani Book...
                </div>
              )}

              {/* Create Account */}
              <button
                type="submit"
                className="SignUp__submitButton"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="SignUp__loader"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <FiArrowRight />
                  </>
                )}
              </button>

              {/* OR */}
              <div className="SignUp__divider">
                <span></span>
                <p>OR</p>
                <span></span>
              </div>

              {/* Social Buttons */}
              <div className="SignUp__socialButtons">
                <button
                  type="button"
                  className="SignUp__socialButton"
                  onClick={handleGoogleSignup}
                >
                  <svg
                    className="SignUp__googleSvg"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Login */}
              <div className="SignUp__login">
                <span>Already have an account?</span>
                <Link to="/login" className="SignUp__loginLink">
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Google Sign In Modal */}
      <GoogleModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={() => {
          navigate("/");
        }}
      />
    </main>
  );
};

export default SignUp;