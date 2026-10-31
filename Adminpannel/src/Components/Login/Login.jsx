import React, { useState, useEffect } from "react";
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
  FiLogIn,
  FiKey,
  FiArrowLeft,
  FiSend,
} from "react-icons/fi";

import API, { setAdminAuth } from "../../api/axios";
import "./Login.css";
import likhaniImage from "../../assets/login.png";

const Login = () => {
  const [mode, setMode] = useState("login"); // "login" | "forgot"

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
    rememberMe: true,
  });

  // Forgot Password / OTP state
  const [forgotData, setForgotData] = useState({
    identifier: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successTitle, setSuccessTitle] = useState("LOGIN SUCCESSFUL");
  const [successSubtitle, setSuccessSubtitle] = useState(
    "Welcome to the Likhani Books Admin Portal"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successBanner, setSuccessBanner] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Cooldown timer for OTP resend
  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setTimeout(() => setOtpCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  // =====================================================
  // INPUT HANDLERS
  // =====================================================

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const handleForgotChange = (e) => {
    const { name, value } = e.target;
    setForgotData((prev) => ({
      ...prev,
      [name]: name === "otp" ? value.replace(/[^0-9]/g, "").slice(0, 6) : value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  // =====================================================
  // SEND OTP HANDLER (FORGOT PASSWORD)
  // =====================================================

  const handleSendForgotOtp = async () => {
    if (!forgotData.identifier.trim()) {
      setErrorMessage("Please enter your admin email or username first.");
      return;
    }

    setErrorMessage("");
    setSuccessBanner("");
    setIsLoading(true);

    try {
      const res = await API.post("/admin/forgot-password", {
        identifier: forgotData.identifier.trim(),
      });

      if (res.data?.success) {
        setOtpSent(true);
        setOtpCooldown(60);
        setSuccessBanner(
          res.data.message ||
            "A 6-digit OTP code has been sent to your admin email."
        );
      } else {
        setErrorMessage(res.data?.message || "Failed to send OTP.");
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          "Could not send OTP. Please check your email and connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // SUBMIT HANDLER
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessBanner("");
    setIsLoading(true);

    try {
      if (mode === "login") {
        const payload = {
          identifier: loginData.identifier.trim(),
          password: loginData.password,
        };

        const res = await API.post("/admin/login", payload);
        const { data } = res;

        if (data.success && data.accessToken) {
          setAdminAuth({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            admin: data.admin,
            rememberMe: loginData.rememberMe,
          });

          setSuccessTitle("LOGIN SUCCESSFUL");
          setSuccessSubtitle(
            `Welcome back, ${data.admin?.name || "Administrator"}`
          );
          setIsSuccess(true);

          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 1400);
        } else {
          setErrorMessage(data.message || "Invalid credentials.");
        }
      } else if (mode === "forgot") {
        if (!forgotData.otp || forgotData.otp.length !== 6) {
          setErrorMessage("Please enter the 6-digit OTP sent to your email.");
          setIsLoading(false);
          return;
        }

        if (!forgotData.newPassword || forgotData.newPassword.length < 6) {
          setErrorMessage("New password must be at least 6 characters.");
          setIsLoading(false);
          return;
        }

        if (forgotData.newPassword !== forgotData.confirmPassword) {
          setErrorMessage("Passwords do not match.");
          setIsLoading(false);
          return;
        }

        const res = await API.post("/admin/reset-password", {
          identifier: forgotData.identifier.trim(),
          otp: forgotData.otp.trim(),
          newPassword: forgotData.newPassword,
          confirmPassword: forgotData.confirmPassword,
        });

        if (res.data?.success) {
          setSuccessBanner(
            "Password reset successful! Please log in with your new password."
          );
          setMode("login");
          setLoginData((prev) => ({
            ...prev,
            identifier: forgotData.identifier,
            password: "",
          }));
          setForgotData({
            identifier: "",
            otp: "",
            newPassword: "",
            confirmPassword: "",
          });
          setOtpSent(false);
        } else {
          setErrorMessage(res.data?.message || "Failed to reset password.");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      const serverMessage =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred. Please verify your connection.";
      setErrorMessage(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Login-container">
      {/* SUCCESS OVERLAY */}
      {isSuccess && (
        <div className="Login-success-overlay">
          <div className="Login-success-card">
            <div className="Login-success-icon-wrapper">
              <FiCheckCircle size={48} className="Login-success-icon" />
            </div>

            <span className="Login-success-badge">
              <FiShield size={13} />
              Secure Authentication
            </span>

            <h1 className="Login-success-title">{successTitle}</h1>
            <p className="Login-success-subtitle">{successSubtitle}</p>
            <p className="Login-success-text">Entering bookstore dashboard...</p>

            <div className="Login-success-loader">
              <span />
            </div>
          </div>
        </div>
      )}

      {/* MAIN CARD */}
      <div className={`Login-card-wrapper ${isSuccess ? "Login-blur" : ""}`}>
        {/* LEFT BRAND SECTION */}
        <div
          className="Login-brand-section"
          style={{
            backgroundImage: `
              linear-gradient(
                135deg,
                rgba(11, 21, 38, 0.88),
                rgba(15, 28, 46, 0.78),
                rgba(7, 13, 22, 0.85)
              ),
              url(${likhaniImage})
            `,
          }}
        >
          <div className="Login-brand-glow Login-brand-glow-one" />
          <div className="Login-brand-glow Login-brand-glow-two" />

          {/* BRAND HEADER */}
          <div className="Login-brand-header">
            <div className="Login-logo-container">
              <div className="Login-logo-badge">
                <FiFeather className="Login-logo-leaf" />
              </div>

              <div className="Login-logo-text-group">
                <h2 className="Login-brand-title">Likhani</h2>
                <span className="Login-brand-subtitle">BOOKS & PUBLISHING</span>
                <p className="Login-brand-tagline">Read • Discover • Inspire</p>
              </div>
            </div>
          </div>

          {/* HERO CONTENT */}
          <div className="Login-hero-content">
            <span className="Login-hero-badge">
              <FiBookOpen size={12} />
              Likhani Library & Store Admin
            </span>

            <h1 className="Login-hero-heading">
              Great Stories.
              <br />
              <span className="Login-hero-highlight">Endless Knowledge.</span>
            </h1>

            <p className="Login-hero-description">
              Manage your book inventory, author publications, customer orders,
              and bookstore operations from one unified administration portal.
            </p>

            {/* MINI VALUE PILLS */}
            <div className="Login-values">
              <div className="Login-value-item">
                <span className="Login-value-icon">
                  <FiBookmark size={13} />
                </span>
                <div>
                  <strong>Curated Catalog</strong>
                  <small>Timeless literature</small>
                </div>
              </div>

              <div className="Login-value-item">
                <span className="Login-value-icon">
                  <FiShield size={13} />
                </span>
                <div>
                  <strong>Protected Archives</strong>
                  <small>Secure admin access</small>
                </div>
              </div>
            </div>
          </div>

          {/* BRAND FOOTER */}
          <div className="Login-hero-footer">
            <div className="Login-footer-line" />
            <p className="Login-handwritten">
              From The Written Word To Every Reader's Hands
              <FiFeather className="Login-footer-leaf" />
            </p>
          </div>
        </div>

        {/* RIGHT FORM SECTION */}
        <div className="Login-form-section">
          {/* USER / ICON */}
          <div className="Login-avatar-container">
            <div className="Login-avatar-3d">
              {mode === "forgot" ? <FiKey size={20} /> : <FiBookOpen size={20} />}
            </div>
          </div>

          {/* FORM HEADER */}
          <div className="Login-form-header">
            <span className="Login-welcome-label">PORTAL ADMINISTRATION</span>
            <h2>
              {mode === "login"
                ? "Welcome Back"
                : "Reset Admin Password"}
            </h2>
            <p>
              {mode === "login"
                ? "Sign in with your verified administrator credentials to access your control panel."
                : "Enter your admin email to receive a 6-digit OTP verification code."}
            </p>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="Login-error-badge">{errorMessage}</div>
          )}

          {/* SUCCESS BANNER */}
          {successBanner && (
            <div
              className="Login-error-badge"
              style={{
                color: "#065f46",
                background: "#ecfdf5",
                borderColor: "#a7f3d0",
              }}
            >
              {successBanner}
            </div>
          )}

          {/* AUTH FORM */}
          <form onSubmit={handleSubmit} className="Login-form">
            {mode === "forgot" ? (
              <>
                {/* FORGOT PASSWORD FORM */}
                <div className="Login-input-wrapper">
                  <label htmlFor="forgot-email" className="Login-input-label">
                    Admin Email or Username *
                  </label>
                  <div className="Login-input-group">
                    <FiMail className="Login-input-icon" size={15} />
                    <input
                      id="forgot-email"
                      type="text"
                      name="identifier"
                      placeholder="admin@likhani.com"
                      value={forgotData.identifier}
                      onChange={handleForgotChange}
                      required
                    />
                  </div>
                </div>

                {/* Send OTP Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>
                    {otpSent ? "OTP sent to your email" : "Click to send verification code"}
                  </span>
                  <button
                    type="button"
                    onClick={handleSendForgotOtp}
                    disabled={isLoading || otpCooldown > 0}
                    style={{
                      background: "#1e3a5f",
                      color: "#fff",
                      border: "none",
                      padding: "5px 11px",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      opacity: otpCooldown > 0 ? 0.65 : 1,
                    }}
                  >
                    <FiSend size={11} />
                    {otpCooldown > 0
                      ? `Resend in ${otpCooldown}s`
                      : otpSent
                      ? "Resend OTP"
                      : "Send OTP"}
                  </button>
                </div>

                {/* OTP code input */}
                <div className="Login-input-wrapper">
                  <label htmlFor="forgot-otp" className="Login-input-label">
                    6-Digit Verification OTP *
                  </label>
                  <div className="Login-input-group">
                    <FiKey className="Login-input-icon" size={15} />
                    <input
                      id="forgot-otp"
                      type="text"
                      name="otp"
                      placeholder="• • • • • •"
                      value={forgotData.otp}
                      onChange={handleForgotChange}
                      maxLength={6}
                      style={{ letterSpacing: 4, fontWeight: "bold", textAlign: "center" }}
                      required
                    />
                  </div>
                </div>

                {/* New Password & Confirm Password */}
                <div className="Login-two-col">
                  <div className="Login-input-wrapper">
                    <label htmlFor="forgot-new-pass" className="Login-input-label">
                      New Password *
                    </label>
                    <div className="Login-input-group">
                      <FiLock className="Login-input-icon" size={15} />
                      <input
                        id="forgot-new-pass"
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="Min 6 chars"
                        value={forgotData.newPassword}
                        onChange={handleForgotChange}
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div className="Login-input-wrapper">
                    <label htmlFor="forgot-conf-pass" className="Login-input-label">
                      Confirm Password *
                    </label>
                    <div className="Login-input-group">
                      <FiLock className="Login-input-icon" size={15} />
                      <input
                        id="forgot-conf-pass"
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Re-enter password"
                        value={forgotData.confirmPassword}
                        onChange={handleForgotChange}
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    type="button"
                    className="Login-password-toggle"
                    style={{ position: "static", width: "auto", height: "auto", gap: 3 }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    <span style={{ fontSize: "0.7rem", marginLeft: 4 }}>
                      {showPassword ? "Hide" : "Show"} passwords
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMessage("");
                      setSuccessBanner("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#1e3a5f",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.72rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <FiArrowLeft size={13} /> Back to Sign In
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* SIGN IN FORM */}
                <div className="Login-input-wrapper">
                  <label htmlFor="login-identifier" className="Login-input-label">
                    Admin Email or Username
                  </label>
                  <div className="Login-input-group">
                    <FiMail className="Login-input-icon" size={15} />
                    <input
                      id="login-identifier"
                      type="text"
                      name="identifier"
                      placeholder="Enter admin email or username"
                      value={loginData.identifier}
                      onChange={handleLoginChange}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                <div className="Login-input-wrapper">
                  <label htmlFor="login-password" className="Login-input-label">
                    Password
                  </label>
                  <div className="Login-input-group">
                    <FiLock className="Login-input-icon" size={15} />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="Login-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password"
                    >
                      {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="Login-form-options">
                  <label className="Login-checkbox-label">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={loginData.rememberMe}
                      onChange={handleLoginChange}
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    className="Login-forgot-link"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => {
                      setMode("forgot");
                      setErrorMessage("");
                      setSuccessBanner("");
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="Login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="Login-spinner" />
              ) : (
                <>
                  <span>
                    {mode === "login"
                      ? "Enter Dashboard"
                      : "Verify OTP & Reset Password"}
                  </span>
                  <FiArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* SECURITY NOTE & COPYRIGHT */}
          <div className="Login-security-note">
            <FiShield size={13} />
            <span>Protected by JWT authentication with access & refresh tokens.</span>
          </div>

          <div className="Login-copyright">
            © {new Date().getFullYear()} Likhani Books & Publications. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
