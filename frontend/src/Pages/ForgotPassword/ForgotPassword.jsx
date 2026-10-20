import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiAlertCircle,
  FiShield,
  FiKey,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import API from "../../api/axios";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Step 1: 'email' -> Step 2: 'otp' -> Step 3: 'password' -> Step 4: 'success'
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null); // { type: 'error' | 'success' | 'info', message: '', isNotFound?: boolean }
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpInputRef = useRef(null);

  // Countdown timer for Resend OTP (active during 'otp' step)
  useEffect(() => {
    let interval = null;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  // Focus OTP input when arriving at 'otp' step
  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 150);
    }
  }, [step]);

  // Auto redirect after success
  useEffect(() => {
    let timer = null;
    if (step === "success") {
      timer = setTimeout(() => {
        navigate("/login");
      }, 4000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [step, navigate]);

  // ==========================================
  // HANDLER: Step 1 - Send 6-digit OTP
  // ==========================================
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setAlertInfo(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setAlertInfo({
        type: "error",
        message: "Please enter your Gmail / email address.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setAlertInfo({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", { email: cleanEmail });
      if (res.data?.success) {
        setAlertInfo({
          type: "success",
          message: res.data.message || "A 6-digit verification code has been sent to your Gmail!",
        });
        setStep("otp");
        setResendTimer(60);
        setCanResend(false);
      } else {
        setAlertInfo({
          type: "error",
          message: res.data?.message || "Failed to send verification code. Please try again.",
        });
      }
    } catch (err) {
      console.error("Forgot password request error:", err);
      const serverMessage = err?.response?.data?.message;
      if (err?.response?.status === 404) {
        setAlertInfo({
          type: "error",
          message:
            serverMessage ||
            "No account found with this Gmail address. Please check your spelling or create a new account.",
          isNotFound: true,
        });
      } else {
        setAlertInfo({
          type: "error",
          message: serverMessage || "Could not reach the server. Please check your connection and try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // HANDLER: Resend OTP
  // ==========================================
  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;

    setAlertInfo(null);
    setIsLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      if (res.data?.success) {
        setAlertInfo({
          type: "success",
          message: "A fresh 6-digit verification code has been dispatched to your Gmail!",
        });
        setResendTimer(60);
        setCanResend(false);
      } else {
        setAlertInfo({
          type: "error",
          message: res.data?.message || "Failed to resend code. Please try again.",
        });
      }
    } catch (err) {
      setAlertInfo({
        type: "error",
        message: err?.response?.data?.message || "Error resending verification code.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // HANDLER: Step 2 - Verify OTP Code ONLY
  // ==========================================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setAlertInfo(null);

    const cleanOtp = otp.trim().replace(/\D/g, "");
    if (!cleanOtp || cleanOtp.length !== 6) {
      setAlertInfo({
        type: "error",
        message: "Please enter the complete 6-digit verification code sent to your Gmail.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await API.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
      });

      if (res.data?.success) {
        setAlertInfo({
          type: "success",
          message: "Verification code confirmed! Now enter your new password below.",
        });
        // Advance to step 3: New Password & Confirm Password
        setStep("password");
      } else {
        setAlertInfo({
          type: "error",
          message: res.data?.message || "Invalid or incorrect verification code. Please check and try again.",
        });
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setAlertInfo({
        type: "error",
        message:
          err?.response?.data?.message ||
          "Invalid or incorrect verification code. The code might have expired.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // HANDLER: Step 3 - Set New Password & Confirm
  // ==========================================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setAlertInfo(null);

    if (!newPassword || newPassword.length < 6) {
      setAlertInfo({
        type: "error",
        message: "Your new password must be at least 6 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertInfo({
        type: "error",
        message: "New password and Confirm password do not match.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await API.post("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        otp: otp.trim().replace(/\D/g, ""),
        newPassword,
        confirmPassword,
      });

      if (res.data?.success) {
        setStep("success");
      } else {
        setAlertInfo({
          type: "error",
          message: res.data?.message || "Failed to reset password. Please try again.",
        });
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setAlertInfo({
        type: "error",
        message:
          err?.response?.data?.message ||
          "Failed to reset password. The session may have expired. Please start over.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="ForgotPassword">
      <section className="ForgotPassword__section">
        {/* Ambient background spheres */}
        <div className="ForgotPassword__shape ForgotPassword__shape--top"></div>
        <div className="ForgotPassword__shape ForgotPassword__shape--left"></div>
        <div className="ForgotPassword__shape ForgotPassword__shape--right"></div>

        <div className="ForgotPassword__container">
          {/* ================= LEFT BRAND HERO ================= */}
          <div className="ForgotPassword__hero">
            <span className="ForgotPassword__eyebrow">ACCOUNT RECOVERY</span>

            <h1 className="ForgotPassword__heroTitle">
              Restore Access To
              <br />
              Your Reading
              <br />
              <span>Sanctuary</span>
            </h1>

            <div className="ForgotPassword__titleLine"></div>

            <p className="ForgotPassword__heroDesc">
              Don't worry, even the most avid readers occasionally misplace their keys.
              We'll send a secure 6-digit verification code directly to your registered Gmail address.
            </p>

            {/* Security Features */}
            <div className="ForgotPassword__features">
              <div className="ForgotPassword__feature">
                <div className="ForgotPassword__featureIcon ForgotPassword__featureIcon--blue">
                  <FiKey />
                </div>
                <div className="ForgotPassword__featureText">
                  <h3>Instant 6-Digit OTP</h3>
                  <p>Delivered within seconds to your Gmail inbox</p>
                </div>
              </div>

              <div className="ForgotPassword__feature">
                <div className="ForgotPassword__featureIcon ForgotPassword__featureIcon--green">
                  <FiShield />
                </div>
                <div className="ForgotPassword__featureText">
                  <h3>Verified Before Reset</h3>
                  <p>Step-by-step verification ensures zero unauthorized access</p>
                </div>
              </div>

              <div className="ForgotPassword__feature">
                <div className="ForgotPassword__featureIcon ForgotPassword__featureIcon--gold">
                  <FiClock />
                </div>
                <div className="ForgotPassword__featureText">
                  <h3>10-Minute Expiry</h3>
                  <p>Time-bound OTP prevents unauthorized tampering</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT FORM CARD ================= */}
          <div className="ForgotPassword__card">
            {/* STEPPER PROGRESS BAR */}
            {step !== "success" && (
              <div className="ForgotPassword__stepper">
                <div
                  className={`ForgotPassword__stepItem ${
                    step === "email" ? "is-active" : "is-done"
                  }`}
                >
                  <span className="ForgotPassword__stepNum">
                    {step === "email" ? "1" : "✓"}
                  </span>
                  <span className="ForgotPassword__stepLabel">Email</span>
                </div>

                <div className="ForgotPassword__stepDivider"></div>

                <div
                  className={`ForgotPassword__stepItem ${
                    step === "otp"
                      ? "is-active"
                      : step === "password" || step === "success"
                      ? "is-done"
                      : ""
                  }`}
                >
                  <span className="ForgotPassword__stepNum">
                    {step === "password" || step === "success" ? "✓" : "2"}
                  </span>
                  <span className="ForgotPassword__stepLabel">Verify OTP</span>
                </div>

                <div className="ForgotPassword__stepDivider"></div>

                <div
                  className={`ForgotPassword__stepItem ${
                    step === "password"
                      ? "is-active"
                      : step === "success"
                      ? "is-done"
                      : ""
                  }`}
                >
                  <span className="ForgotPassword__stepNum">
                    {step === "success" ? "✓" : "3"}
                  </span>
                  <span className="ForgotPassword__stepLabel">New Password</span>
                </div>
              </div>
            )}

            {/* =========================================================
                STEP 1: ENTER GMAIL ADDRESS
            ========================================================= */}
            {step === "email" && (
              <>
                <div className="ForgotPassword__cardHeader">
                  <div className="ForgotPassword__cardIcon">
                    <FiKey />
                  </div>
                  <h2 className="ForgotPassword__cardTitle">Forgot Password?</h2>
                  <p className="ForgotPassword__cardSubtitle">
                    Enter your registered email address to receive your 6-digit verification code.
                  </p>
                </div>

                {alertInfo && (
                  <div className={`ForgotPassword__alert ForgotPassword__alert--${alertInfo.type}`}>
                    {alertInfo.type === "success" ? (
                      <FiCheck className="ForgotPassword__alertIcon" />
                    ) : (
                      <FiAlertCircle className="ForgotPassword__alertIcon" />
                    )}
                    <div className="ForgotPassword__alertBody">
                      <p>{alertInfo.message}</p>
                      {alertInfo.isNotFound && (
                        <Link to="/signup" className="ForgotPassword__alertAction">
                          Create a new account &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendOtp} className="ForgotPassword__form" noValidate>
                  <div className="ForgotPassword__field">
                    <label className="ForgotPassword__label" htmlFor="forgot-email">
                      Gmail / Email Address <span className="ForgotPassword__required">*</span>
                    </label>
                    <div className="ForgotPassword__inputWrap">
                      <FiMail className="ForgotPassword__inputIcon" />
                      <input
                        id="forgot-email"
                        type="email"
                        className="ForgotPassword__input"
                        placeholder="you@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="ForgotPassword__btn ForgotPassword__btn--primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="ForgotPassword__spinner"></span>
                        Checking &amp; Sending OTP...
                      </>
                    ) : (
                      <>
                        Send 6-Digit OTP Code
                        <FiArrowRight />
                      </>
                    )}
                  </button>

                  <div className="ForgotPassword__footerLinks">
                    <Link to="/login" className="ForgotPassword__backLink">
                      <FiArrowLeft /> Back to Sign In
                    </Link>
                  </div>
                </form>
              </>
            )}

            {/* =========================================================
                STEP 2: ENTER OTP CODE ONLY (Verify OTP first!)
            ========================================================= */}
            {step === "otp" && (
              <>
                <div className="ForgotPassword__cardHeader">
                  <div className="ForgotPassword__cardIcon ForgotPassword__cardIcon--otp">
                    <FiShield />
                  </div>
                  <h2 className="ForgotPassword__cardTitle">Enter Verification Code</h2>
                  <p className="ForgotPassword__cardSubtitle">
                    We sent a 6-digit code to <strong style={{ color: "#0f172a" }}>{email}</strong>
                  </p>
                  <button
                    type="button"
                    className="ForgotPassword__changeEmailBtn"
                    onClick={() => {
                      setStep("email");
                      setAlertInfo(null);
                    }}
                  >
                    Change Email Address
                  </button>
                </div>

                {alertInfo && (
                  <div className={`ForgotPassword__alert ForgotPassword__alert--${alertInfo.type}`}>
                    {alertInfo.type === "success" ? (
                      <FiCheck className="ForgotPassword__alertIcon" />
                    ) : (
                      <FiAlertCircle className="ForgotPassword__alertIcon" />
                    )}
                    <div className="ForgotPassword__alertBody">
                      <p>{alertInfo.message}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="ForgotPassword__form" noValidate>
                  {/* 6-DIGIT OTP CODE INPUT */}
                  <div className="ForgotPassword__field">
                    <div className="ForgotPassword__labelRow">
                      <label className="ForgotPassword__label" htmlFor="otp-input">
                        6-Digit Verification Code <span className="ForgotPassword__required">*</span>
                      </label>
                      <button
                        type="button"
                        className={`ForgotPassword__resendBtn ${canResend ? "is-active" : "is-disabled"}`}
                        onClick={handleResendOtp}
                        disabled={!canResend || isLoading}
                      >
                        <FiRefreshCw className={isLoading ? "ForgotPassword__spinIcon" : ""} />
                        {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
                      </button>
                    </div>

                    <div className="ForgotPassword__otpBox">
                      <input
                        ref={otpInputRef}
                        id="otp-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        className="ForgotPassword__otpInput"
                        placeholder="• • • • • •"
                        value={otp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setOtp(val);
                        }}
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>
                    <span className="ForgotPassword__helpText">
                      Check your Gmail inbox for the 6-digit code. (Check spam if not in inbox)
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="ForgotPassword__btn ForgotPassword__btn--primary"
                    disabled={isLoading || otp.trim().length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <span className="ForgotPassword__spinner"></span>
                        Verifying Code...
                      </>
                    ) : (
                      <>
                        Verify OTP Code
                        <FiArrowRight />
                      </>
                    )}
                  </button>

                  <div className="ForgotPassword__footerLinks">
                    <button
                      type="button"
                      className="ForgotPassword__backLink"
                      onClick={() => {
                        setStep("email");
                        setAlertInfo(null);
                      }}
                    >
                      <FiArrowLeft /> Back to Email
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* =========================================================
                STEP 3: ENTER NEW PASSWORD & CONFIRM PASSWORD
                (Only shown AFTER OTP is successfully verified!)
            ========================================================= */}
            {step === "password" && (
              <>
                <div className="ForgotPassword__cardHeader">
                  <div className="ForgotPassword__cardIcon ForgotPassword__cardIcon--key">
                    <FiLock />
                  </div>
                  <h2 className="ForgotPassword__cardTitle">Create New Password</h2>
                  <p className="ForgotPassword__cardSubtitle">
                    Set a secure new password for <strong style={{ color: "#0f172a" }}>{email}</strong>
                  </p>
                </div>

                {alertInfo && (
                  <div className={`ForgotPassword__alert ForgotPassword__alert--${alertInfo.type}`}>
                    {alertInfo.type === "success" ? (
                      <FiCheck className="ForgotPassword__alertIcon" />
                    ) : (
                      <FiAlertCircle className="ForgotPassword__alertIcon" />
                    )}
                    <div className="ForgotPassword__alertBody">
                      <p>{alertInfo.message}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="ForgotPassword__form" noValidate>
                  {/* NEW PASSWORD */}
                  <div className="ForgotPassword__field">
                    <label className="ForgotPassword__label" htmlFor="new-password">
                      New Password <span className="ForgotPassword__required">*</span>
                    </label>
                    <div className="ForgotPassword__inputWrap">
                      <FiLock className="ForgotPassword__inputIcon" />
                      <input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        className="ForgotPassword__input"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isLoading}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="ForgotPassword__eyeBtn"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        aria-label="Toggle password visibility"
                      >
                        {showNewPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div className="ForgotPassword__field">
                    <label className="ForgotPassword__label" htmlFor="confirm-password">
                      Confirm New Password <span className="ForgotPassword__required">*</span>
                    </label>
                    <div className="ForgotPassword__inputWrap">
                      <FiLock className="ForgotPassword__inputIcon" />
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        className="ForgotPassword__input"
                        placeholder="Re-enter your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="ForgotPassword__eyeBtn"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="ForgotPassword__btn ForgotPassword__btn--primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="ForgotPassword__spinner"></span>
                        Saving New Password...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <FiArrowRight />
                      </>
                    )}
                  </button>

                  <div className="ForgotPassword__footerLinks">
                    <button
                      type="button"
                      className="ForgotPassword__backLink"
                      onClick={() => {
                        setStep("otp");
                        setAlertInfo(null);
                      }}
                    >
                      <FiArrowLeft /> Back to OTP Code
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* =========================================================
                STEP 4: SUCCESS CONFIRMATION
            ========================================================= */}
            {step === "success" && (
              <div className="ForgotPassword__successCard">
                <div className="ForgotPassword__successIconWrap">
                  <FiCheckCircle className="ForgotPassword__successIcon" />
                </div>
                <h2 className="ForgotPassword__successTitle">Password Reset Complete!</h2>
                <p className="ForgotPassword__successDesc">
                  Your password has been updated successfully. A confirmation email has been sent to{" "}
                  <strong>{email}</strong>.
                </p>
                <p className="ForgotPassword__successCountdown">
                  Redirecting to Sign In in a few seconds...
                </p>

                <button
                  type="button"
                  className="ForgotPassword__btn ForgotPassword__btn--primary"
                  onClick={() => navigate("/login")}
                >
                  Sign In Now <FiArrowRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ForgotPassword;
