import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiBookOpen,
  FiArrowRight,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiCompass,
  FiPackage,
  FiHeart,
  FiAward,
} from "react-icons/fi";
import API from "../../api/axios";
import GoogleModal from "../GoogleModal/GoogleModal";
import { launchGoogleAuth } from "../../utils/googleAuth";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const { currentUser, login, logout } = useAuth();

  const [formData, setFormData] = useState({
    identifier: localStorage.getItem("lekhani_user_remember") || "",
    password: "",
    rememberMe: !!localStorage.getItem("lekhani_user_remember"),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginAlert, setLoginAlert] = useState(() => {
    if (location.state?.from) {
      return {
        type: "info",
        message: "Please sign in to proceed to checkout.",
      };
    }
    return null;
  });
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

    if (!formData.identifier.trim()) {
      newErrors.identifier = "Email or phone number is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setLoginAlert(null);

    try {
      const res = await API.post("/auth/login", {
        identifier: formData.identifier.trim(),
        password: formData.password,
      });

      if (res.data?.success) {
        login(res.data.user, res.data.token);

        if (formData.rememberMe) {
          localStorage.setItem("lekhani_user_remember", formData.identifier.trim());
        } else {
          localStorage.removeItem("lekhani_user_remember");
        }

        setLoginAlert({
          type: "success",
          message: `Welcome back, ${res.data.user?.name || "Reader"}! Signing you in...`,
        });

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          "Unable to sign in. Please verify your credentials and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    launchGoogleAuth({
      onSuccess: () => {
        navigate(from, { replace: true });
      },
      onError: (err) => {
        setLoginAlert({
          type: "error",
          message: err?.response?.data?.message || err?.message || "Google sign-in failed. Please try again.",
        });
      },
      onFallback: () => {
        setIsGoogleModalOpen(true);
      },
    });
  };

  const handleForgotPassword = () => {
    alert("Password reset instructions will be sent to your registered email.");
  };

  return (
    <main className="Login">
      <section className="Login__section">
        {/* Background shapes */}
        <div className="Login__backgroundShape Login__backgroundShape--top"></div>
        <div className="Login__backgroundShape Login__backgroundShape--left"></div>
        <div className="Login__backgroundShape Login__backgroundShape--right"></div>

        <div className="Login__container">
          {/* ================= LEFT CONTENT ================= */}
          <div className="Login__content">
            <span className="Login__eyebrow">WELCOME BACK TO LEKHANI</span>

            <h1 className="Login__title">
              Sign In To
              <br />
              Your Reading
              <br />
              <span>Sanctuary</span>
            </h1>

            <div className="Login__titleLine"></div>

            <p className="Login__description">
              Rekindle your literary passion. Access your saved wishlist, track
              ongoing deliveries, and discover handpicked book recommendations
              crafted specifically for you.
            </p>

            {/* Feature Highlights */}
            <div className="Login__features">
              <div className="Login__feature">
                <div className="Login__featureIcon Login__featureIcon--blue">
                  <FiCompass />
                </div>
                <div className="Login__featureContent">
                  <h3>Seamless Reading</h3>
                  <p>Pick up right where you left off</p>
                </div>
              </div>

              <div className="Login__feature">
                <div className="Login__featureIcon Login__featureIcon--green">
                  <FiPackage />
                </div>
                <div className="Login__featureContent">
                  <h3>Track Deliveries</h3>
                  <p>Real-time updates on book parcels</p>
                </div>
              </div>

              <div className="Login__feature">
                <div className="Login__featureIcon Login__featureIcon--red">
                  <FiHeart />
                </div>
                <div className="Login__featureContent">
                  <h3>Saved Wishlist</h3>
                  <p>Keep favorite titles at your fingertips</p>
                </div>
              </div>

              <div className="Login__feature">
                <div className="Login__featureIcon Login__featureIcon--gold">
                  <FiAward />
                </div>
                <div className="Login__featureContent">
                  <h3>Member Privileges</h3>
                  <p>Exclusive deals and reader discounts</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= LOGIN CARD ================= */}
          <div className="Login__card">
            <div className="Login__cardHeader">
              <div className="Login__cardIcon">
                <FiBookOpen />
              </div>
              <h2 className="Login__cardTitle">Welcome Back</h2>
              <p className="Login__cardSubtitle">
                Sign in with your email or phone to continue
              </p>
            </div>

            {loginAlert && (
              <div className={`Login__alert Login__alert--${loginAlert.type}`}>
                {loginAlert.type === "success" ? (
                  <FiCheck />
                ) : loginAlert.type === "info" ? (
                  <FiInfo />
                ) : (
                  <FiAlertCircle />
                )}
                <span>{loginAlert.message}</span>
              </div>
            )}

            {currentUser ? (
              <div style={{ textAlign: "center", padding: "20px 10px 10px" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "#12598f",
                    color: "#ffffff",
                    fontSize: "24px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    boxShadow: "0 6px 18px rgba(18, 89, 143, 0.25)",
                  }}
                >
                  {(currentUser.name || currentUser.firstName || "U")[0].toUpperCase()}
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: "20px", color: "#101c34", fontWeight: 700 }}>
                  {currentUser.name}
                </h3>
                <p style={{ margin: "0 0 8px", fontSize: "13.5px", color: "#6b798f" }}>
                  {currentUser.email}
                </p>
                <div style={{ margin: "0 auto 24px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 12px",
                      borderRadius: "15px",
                      background: "#def7ec",
                      color: "#03543f",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    Role: {currentUser.role || "User"}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "280px", margin: "0 auto" }}>
                  {from && from !== "/" ? (
                    <button
                      type="button"
                      className="Login__submitButton"
                      style={{ margin: 0, justifyContent: "center" }}
                      onClick={() => navigate(from)}
                    >
                      {from === "/cart" ? "Proceed to Checkout / Cart" : "Continue"}
                      <FiArrowRight />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="Login__submitButton"
                      style={{ margin: 0, justifyContent: "center" }}
                      onClick={() => navigate("/")}
                    >
                      Go to Homepage
                      <FiArrowRight />
                    </button>
                  )}
                  <button
                    type="button"
                    style={{
                      background: "#fff",
                      border: "1px solid #e54d4d",
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#e54d4d",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => logout()}
                  >
                    Sign In with Different Account
                  </button>
                </div>
              </div>
            ) : (
              <form className="Login__form" onSubmit={handleSubmit} noValidate>
              {/* Email / Identifier */}
              <div className="Login__fieldGroup">
                <div
                  className={`Login__inputWrapper ${
                    errors.identifier ? "Login__inputWrapper--error" : ""
                  }`}
                >
                  <FiMail className="Login__inputIcon" />
                  <input
                    type="text"
                    name="identifier"
                    placeholder="Email Address or Phone *"
                    value={formData.identifier}
                    onChange={handleChange}
                    autoComplete="username"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.identifier && (
                  <span className="Login__error">{errors.identifier}</span>
                )}
              </div>

              {/* Password */}
              <div className="Login__fieldGroup">
                <div
                  className={`Login__inputWrapper ${
                    errors.password ? "Login__inputWrapper--error" : ""
                  }`}
                >
                  <FiLock className="Login__inputIcon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password *"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="Login__passwordButton"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="Login__error">{errors.password}</span>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="Login__optionsRow">
                <label className="Login__rememberMe">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span className="Login__customCheckbox">
                    {formData.rememberMe && <FiCheck />}
                  </span>
                  <span className="Login__rememberMeText">Remember me</span>
                </label>

                <button
                  type="button"
                  className="Login__forgotLink"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="Login__submitButton"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="Login__loader"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <FiArrowRight />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="Login__divider">
                <span></span>
                <p>OR</p>
                <span></span>
              </div>

              {/* Social Login Button: Continue with Google */}
              <div className="Login__socialButtons">
                <button
                  type="button"
                  className="Login__socialButton"
                  onClick={handleGoogleLogin}
                >
                  <svg
                    className="Login__googleSvg"
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

              {/* Switch to SignUp */}
              <div className="Login__signUpPrompt">
                <span>Don't have an account?</span>
                <Link to="/signup" state={location.state} className="Login__signUpLink">
                  Create Account
                </Link>
              </div>
            </form>
            )}
          </div>
        </div>
      </section>

      <GoogleModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={() => {
          navigate(from, { replace: true });
        }}
      />
    </main>
  );
};

export default Login;
