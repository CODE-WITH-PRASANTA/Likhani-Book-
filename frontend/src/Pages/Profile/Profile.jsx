import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMapPin,
  FiPackage,
  FiHeart,
  FiShoppingBag,
  FiLogOut,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
  FiX,
  FiLock,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiKey,
  FiShield,
  FiMail,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser, logout, isAuthenticated } = useAuth();

  // Field states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Edit mode toggles (Flipkart style: each block can be edited individually)
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);

  // Status & feedback
  const [submittingPersonal, setSubmittingPersonal] = useState(false);
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [submittingPhone, setSubmittingPhone] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [errors, setErrors] = useState({});
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  // Password & Security Reset states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Reset via Email OTP states
  const [resetMethod, setResetMethod] = useState("direct"); // "direct" | "otp"
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Sync state from currentUser
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/profile" } });
      return;
    }

    if (currentUser) {
      const parts = (currentUser.name || "").trim().split(" ");
      const fName = currentUser.firstName || parts[0] || "";
      const lName =
        currentUser.lastName || parts.slice(1).join(" ") || "";

      setFirstName(fName);
      setLastName(lName);
      setGender(currentUser.gender || "Male");
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
    }
  }, [currentUser, isAuthenticated, navigate]);

  const showToast = (text, type = "success") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 3800);
  };

  // ================= SAVE PERSONAL INFO =================
  const handleSavePersonal = async (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmittingPersonal(true);
      setErrors({});

      const response = await API.put("/auth/profile", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
      });

      if (response.data?.success) {
        updateUser(response.data.user);
        setEditingPersonal(false);
        showToast("Personal Information updated successfully!", "success");
      } else {
        throw new Error(response.data?.message || "Failed to update personal information.");
      }
    } catch (err) {
      console.error("Update personal info error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Could not update personal information.";
      showToast(errMsg, "error");
    } finally {
      setSubmittingPersonal(false);
    }
  };

  const handleCancelPersonal = () => {
    const parts = (currentUser.name || "").trim().split(" ");
    setFirstName(currentUser.firstName || parts[0] || "");
    setLastName(currentUser.lastName || parts.slice(1).join(" ") || "");
    setGender(currentUser.gender || "Male");
    setErrors({});
    setEditingPersonal(false);
  };

  // ================= SAVE EMAIL =================
  const handleSaveEmail = async (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmittingEmail(true);
      setErrors({});

      const response = await API.put("/auth/profile", {
        email: email.trim().toLowerCase(),
      });

      if (response.data?.success) {
        updateUser(response.data.user);
        setEditingEmail(false);
        showToast("Email address updated successfully!", "success");
      } else {
        throw new Error(response.data?.message || "Failed to update email address.");
      }
    } catch (err) {
      console.error("Update email error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Could not update email address.";
      showToast(errMsg, "error");
    } finally {
      setSubmittingEmail(false);
    }
  };

  const handleCancelEmail = () => {
    setEmail(currentUser.email || "");
    setErrors({});
    setEditingEmail(false);
  };

  // ================= SAVE MOBILE PHONE =================
  const handleSavePhone = async (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    if (!phone.trim()) {
      newErrors.phone = "Mobile number is required.";
    } else if (!/^[0-9]{10}$/.test(phone.trim().replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit mobile number.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmittingPhone(true);
      setErrors({});

      const response = await API.put("/auth/profile", {
        phone: phone.trim(),
      });

      if (response.data?.success) {
        updateUser(response.data.user);
        setEditingPhone(false);
        showToast("Mobile number updated successfully!", "success");
      } else {
        throw new Error(response.data?.message || "Failed to update mobile number.");
      }
    } catch (err) {
      console.error("Update phone error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Could not update mobile number.";
      showToast(errMsg, "error");
    } finally {
      setSubmittingPhone(false);
    }
  };

  const handleCancelPhone = () => {
    setPhone(currentUser.phone || "");
    setErrors({});
    setEditingPhone(false);
  };

  // ================= FIELD RESET HANDLERS =================
  const handleResetPersonalFields = () => {
    const parts = (currentUser?.name || "").trim().split(" ");
    setFirstName(currentUser?.firstName || parts[0] || "");
    setLastName(currentUser?.lastName || parts.slice(1).join(" ") || "");
    setGender(currentUser?.gender || "Male");
    setErrors((prev) => ({ ...prev, firstName: undefined, lastName: undefined }));
    showToast("Personal details reset to saved values.", "info");
  };

  const handleResetEmailFields = () => {
    setEmail(currentUser?.email || "");
    setErrors((prev) => ({ ...prev, email: undefined }));
    showToast("Email address reset to saved value.", "info");
  };

  const handleResetPhoneFields = () => {
    setPhone(currentUser?.phone || "");
    setErrors((prev) => ({ ...prev, phone: undefined }));
    showToast("Phone number reset to saved value.", "info");
  };

  // ================= PASSWORD RESET HANDLERS =================
  const handleResetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordErrors({});
    setOtpCode("");
    setOtpSent(false);
    showToast("Password form reset.", "info");
  };

  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    const newErrs = {};

    if (currentUser?.authProvider !== "google" && !currentPassword) {
      newErrs.currentPassword = "Current password is required.";
    }
    if (!newPassword || newPassword.length < 6) {
      newErrs.newPassword = "Password must be at least 6 characters.";
    }
    if (newPassword !== confirmPassword) {
      newErrs.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrs).length > 0) {
      setPasswordErrors(newErrs);
      return;
    }

    try {
      setSubmittingPassword(true);
      setPasswordErrors({});
      const res = await API.put("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.data?.success) {
        showToast(res.data.message || "Password updated successfully!", "success");
        handleResetPasswordForm();
      } else {
        throw new Error(res.data?.message || "Failed to update password.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to update password.";
      showToast(msg, "error");
      setPasswordErrors({ form: msg });
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleSendOtpForReset = async () => {
    const targetEmail = currentUser?.email || email;
    if (!targetEmail) {
      showToast("No email associated with this account.", "error");
      return;
    }
    try {
      setSendingOtp(true);
      const res = await API.post("/auth/forgot-password", { email: targetEmail });
      if (res.data?.success) {
        setOtpSent(true);
        showToast(`Verification OTP sent to ${targetEmail}`, "success");
      } else {
        throw new Error(res.data?.message || "Failed to send OTP.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to send reset OTP.";
      showToast(msg, "error");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPasswordWithOtp = async (e) => {
    if (e) e.preventDefault();
    const newErrs = {};
    if (!otpCode || otpCode.trim().length !== 6) {
      newErrs.otpCode = "Please enter the 6-digit verification code.";
    }
    if (!newPassword || newPassword.length < 6) {
      newErrs.newPassword = "New password must be at least 6 characters.";
    }
    if (newPassword !== confirmPassword) {
      newErrs.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrs).length > 0) {
      setPasswordErrors(newErrs);
      return;
    }

    try {
      setVerifyingOtp(true);
      setPasswordErrors({});
      const targetEmail = currentUser?.email || email;
      const res = await API.post("/auth/reset-password", {
        email: targetEmail,
        otp: otpCode.trim(),
        newPassword,
        confirmPassword,
      });

      if (res.data?.success) {
        showToast(
          "Password reset successfully! Confirmation email sent.",
          "success"
        );
        handleResetPasswordForm();
      } else {
        throw new Error(res.data?.message || "Failed to reset password.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to reset password.";
      showToast(msg, "error");
      setPasswordErrors({ form: msg });
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (!currentUser) return null;

  return (
    <main className="ProfilePage">
      <div className="ProfilePage__container">
        {/* Breadcrumb Navigation */}
        <div className="ProfilePage__breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/profile">My Account</Link>
          <span>/</span>
          <span className="ProfilePage__breadcrumbCurrent">Profile Information</span>
        </div>

        {/* Global Toast */}
        {feedback && (
          <div className={`ProfilePage__toast ProfilePage__toast--${feedback.type}`}>
            {feedback.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="ProfilePage__layout">
          {/* ================= LEFT SIDEBAR (Flipkart Account Style) ================= */}
          <aside className="ProfilePage__sidebar">
            {/* User Greeting Card */}
            <div className="ProfilePage__userCard">
              <div className="ProfilePage__userAvatar">
                {(currentUser.name || currentUser.firstName || "U")[0].toUpperCase()}
              </div>
              <div className="ProfilePage__userMeta">
                <span className="ProfilePage__hello">Hello,</span>
                <strong className="ProfilePage__userName">
                  {currentUser.name || `${firstName} ${lastName}`.trim() || "Reader"}
                </strong>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="ProfilePage__nav">
              <div className="ProfilePage__navSection">
                <span className="ProfilePage__navSectionTitle">ACCOUNT SETTINGS</span>
                <Link
                  to="/profile"
                  className="ProfilePage__navLink ProfilePage__navLink--active"
                >
                  <FiUser />
                  <span>Profile Information</span>
                </Link>
                <a
                  href="#security-reset"
                  className="ProfilePage__navLink"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("security-reset")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <FiLock />
                  <span>Reset & Security</span>
                </a>
                <Link to="/addresses" className="ProfilePage__navLink">
                  <FiMapPin />
                  <span>Manage Addresses</span>
                </Link>
              </div>

              <div className="ProfilePage__navSection">
                <span className="ProfilePage__navSectionTitle">MY STUFF</span>
                <Link to="/orders" className="ProfilePage__navLink">
                  <FiPackage />
                  <span>My Orders</span>
                </Link>
                <Link to="/wishlist" className="ProfilePage__navLink">
                  <FiHeart />
                  <span>My Wishlist</span>
                </Link>
                <Link to="/cart" className="ProfilePage__navLink">
                  <FiShoppingBag />
                  <span>My Cart</span>
                </Link>
              </div>

              <div className="ProfilePage__navSection">
                <button
                  type="button"
                  className="ProfilePage__logoutBtn"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* ================= RIGHT CONTENT AREA ================= */}
          <section className="ProfilePage__content">
            {/* SECTION 1: PERSONAL INFORMATION */}
            <div className="ProfilePage__section">
              <div className="ProfilePage__sectionHeader">
                <h2 className="ProfilePage__sectionTitle">Personal Information</h2>
                {!editingPersonal ? (
                  <button
                    type="button"
                    className="ProfilePage__editAction"
                    onClick={() => setEditingPersonal(true)}
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ProfilePage__cancelAction"
                    onClick={handleCancelPersonal}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSavePersonal} className="ProfilePage__form">
                <div className="ProfilePage__row">
                  <div className="ProfilePage__inputGroup">
                    <input
                      type="text"
                      className={`ProfilePage__input ${
                        errors.firstName ? "ProfilePage__input--error" : ""
                      }`}
                      placeholder="First Name"
                      value={firstName}
                      disabled={!editingPersonal}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    {errors.firstName && (
                      <span className="ProfilePage__errorMsg">{errors.firstName}</span>
                    )}
                  </div>

                  <div className="ProfilePage__inputGroup">
                    <input
                      type="text"
                      className={`ProfilePage__input ${
                        errors.lastName ? "ProfilePage__input--error" : ""
                      }`}
                      placeholder="Last Name"
                      value={lastName}
                      disabled={!editingPersonal}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    {errors.lastName && (
                      <span className="ProfilePage__errorMsg">{errors.lastName}</span>
                    )}
                  </div>

                  {editingPersonal && (
                    <div className="ProfilePage__actionBtnGroup">
                      <button
                        type="submit"
                        className="ProfilePage__saveBtn"
                        disabled={submittingPersonal}
                      >
                        {submittingPersonal ? "SAVING..." : "SAVE"}
                      </button>
                      <button
                        type="button"
                        className="ProfilePage__resetBtn"
                        onClick={handleResetPersonalFields}
                        title="Reset fields to saved values"
                      >
                        <FiRefreshCw />
                        <span>RESET</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* GENDER SELECTION (Flipkart Style) */}
                <div className="ProfilePage__genderWrap">
                  <span className="ProfilePage__genderLabel">Your Gender</span>
                  <div className="ProfilePage__genderOptions">
                    <label
                      className={`ProfilePage__radioLabel ${
                        !editingPersonal ? "ProfilePage__radioLabel--disabled" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={gender === "Male"}
                        disabled={!editingPersonal}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      <span className="ProfilePage__radioCustom"></span>
                      <span>Male</span>
                    </label>

                    <label
                      className={`ProfilePage__radioLabel ${
                        !editingPersonal ? "ProfilePage__radioLabel--disabled" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={gender === "Female"}
                        disabled={!editingPersonal}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      <span className="ProfilePage__radioCustom"></span>
                      <span>Female</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* SECTION 2: EMAIL ADDRESS */}
            <div className="ProfilePage__section">
              <div className="ProfilePage__sectionHeader">
                <h2 className="ProfilePage__sectionTitle">Email Address</h2>
                {!editingEmail ? (
                  <button
                    type="button"
                    className="ProfilePage__editAction"
                    onClick={() => setEditingEmail(true)}
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ProfilePage__cancelAction"
                    onClick={handleCancelEmail}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveEmail} className="ProfilePage__form">
                <div className="ProfilePage__row">
                  <div className="ProfilePage__inputGroup ProfilePage__inputGroup--wide">
                    <input
                      type="email"
                      className={`ProfilePage__input ${
                        errors.email ? "ProfilePage__input--error" : ""
                      }`}
                      placeholder="Email Address"
                      value={email}
                      disabled={!editingEmail}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && (
                      <span className="ProfilePage__errorMsg">{errors.email}</span>
                    )}
                  </div>

                  {editingEmail && (
                    <div className="ProfilePage__actionBtnGroup">
                      <button
                        type="submit"
                        className="ProfilePage__saveBtn"
                        disabled={submittingEmail}
                      >
                        {submittingEmail ? "SAVING..." : "SAVE"}
                      </button>
                      <button
                        type="button"
                        className="ProfilePage__resetBtn"
                        onClick={handleResetEmailFields}
                        title="Reset email to saved value"
                      >
                        <FiRefreshCw />
                        <span>RESET</span>
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* SECTION 3: MOBILE NUMBER */}
            <div className="ProfilePage__section">
              <div className="ProfilePage__sectionHeader">
                <h2 className="ProfilePage__sectionTitle">Mobile Number</h2>
                {!editingPhone ? (
                  <button
                    type="button"
                    className="ProfilePage__editAction"
                    onClick={() => setEditingPhone(true)}
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ProfilePage__cancelAction"
                    onClick={handleCancelPhone}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSavePhone} className="ProfilePage__form">
                <div className="ProfilePage__row">
                  <div className="ProfilePage__inputGroup ProfilePage__inputGroup--wide">
                    <input
                      type="tel"
                      className={`ProfilePage__input ${
                        errors.phone ? "ProfilePage__input--error" : ""
                      }`}
                      placeholder="Mobile Number"
                      value={phone}
                      disabled={!editingPhone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    {errors.phone && (
                      <span className="ProfilePage__errorMsg">{errors.phone}</span>
                    )}
                  </div>

                  {editingPhone && (
                    <div className="ProfilePage__actionBtnGroup">
                      <button
                        type="submit"
                        className="ProfilePage__saveBtn"
                        disabled={submittingPhone}
                      >
                        {submittingPhone ? "SAVING..." : "SAVE"}
                      </button>
                      <button
                        type="button"
                        className="ProfilePage__resetBtn"
                        onClick={handleResetPhoneFields}
                        title="Reset phone to saved value"
                      >
                        <FiRefreshCw />
                        <span>RESET</span>
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* SECTION 4: PASSWORD RESET & SECURITY */}
            <div className="ProfilePage__section" id="security-reset">
              <div className="ProfilePage__sectionHeader">
                <div className="ProfilePage__securityHeaderWrap">
                  <div className="ProfilePage__securityIconBox">
                    <FiLock />
                  </div>
                  <div>
                    <h2 className="ProfilePage__sectionTitle">Reset & Change Password</h2>
                    <p className="ProfilePage__sectionSubtitle">
                      Update your login password or request a 6-digit verification code to reset it securely.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mode switch: Direct change vs Email OTP */}
              <div className="ProfilePage__methodTabs">
                <button
                  type="button"
                  className={`ProfilePage__methodTab ${
                    resetMethod === "direct" ? "ProfilePage__methodTab--active" : ""
                  }`}
                  onClick={() => {
                    setResetMethod("direct");
                    setPasswordErrors({});
                  }}
                >
                  <FiKey />
                  <span>Direct Password Change</span>
                </button>
                <button
                  type="button"
                  className={`ProfilePage__methodTab ${
                    resetMethod === "otp" ? "ProfilePage__methodTab--active" : ""
                  }`}
                  onClick={() => {
                    setResetMethod("otp");
                    setPasswordErrors({});
                  }}
                >
                  <FiMail />
                  <span>Reset via Email OTP</span>
                </button>
              </div>

              {passwordErrors.form && (
                <div className="ProfilePage__passwordAlert">
                  <FiAlertCircle />
                  <span>{passwordErrors.form}</span>
                </div>
              )}

              {/* TAB 1: DIRECT PASSWORD CHANGE */}
              {resetMethod === "direct" && (
                <form onSubmit={handleChangePassword} className="ProfilePage__passwordForm">
                  {currentUser?.authProvider !== "google" && (
                    <div className="ProfilePage__passwordField">
                      <label className="ProfilePage__fieldLabel">Current Password</label>
                      <div className="ProfilePage__passwordInputWrap">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          className={`ProfilePage__input ${
                            passwordErrors.currentPassword ? "ProfilePage__input--error" : ""
                          }`}
                          placeholder="Enter your current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="ProfilePage__eyeToggleBtn"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                        >
                          {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <span className="ProfilePage__errorMsg">
                          {passwordErrors.currentPassword}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="ProfilePage__passwordGrid">
                    <div className="ProfilePage__passwordField">
                      <label className="ProfilePage__fieldLabel">New Password</label>
                      <div className="ProfilePage__passwordInputWrap">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className={`ProfilePage__input ${
                            passwordErrors.newPassword ? "ProfilePage__input--error" : ""
                          }`}
                          placeholder="At least 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="ProfilePage__eyeToggleBtn"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <span className="ProfilePage__errorMsg">{passwordErrors.newPassword}</span>
                      )}
                    </div>

                    <div className="ProfilePage__passwordField">
                      <label className="ProfilePage__fieldLabel">Confirm New Password</label>
                      <div className="ProfilePage__passwordInputWrap">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className={`ProfilePage__input ${
                            passwordErrors.confirmPassword ? "ProfilePage__input--error" : ""
                          }`}
                          placeholder="Re-enter new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="ProfilePage__eyeToggleBtn"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <span className="ProfilePage__errorMsg">
                          {passwordErrors.confirmPassword}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ProfilePage__passwordActions">
                    <button
                      type="submit"
                      className="ProfilePage__saveBtn"
                      disabled={submittingPassword}
                    >
                      {submittingPassword ? "UPDATING..." : "UPDATE PASSWORD"}
                    </button>
                    <button
                      type="button"
                      className="ProfilePage__resetBtn"
                      onClick={handleResetPasswordForm}
                      title="Clear and reset password inputs"
                    >
                      <FiRefreshCw />
                      <span>RESET FORM</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: RESET VIA EMAIL OTP */}
              {resetMethod === "otp" && (
                <div className="ProfilePage__otpFlow">
                  <div className="ProfilePage__otpNotice">
                    <FiShield />
                    <div>
                      <strong>Secure OTP Verification</strong>
                      <p>
                        We will send a 6-digit verification code to{" "}
                        <strong>{currentUser?.email || email}</strong> to confirm your identity before resetting your password.
                      </p>
                    </div>
                  </div>

                  {!otpSent ? (
                    <div className="ProfilePage__otpSendWrap">
                      <button
                        type="button"
                        className="ProfilePage__sendOtpBtn"
                        onClick={handleSendOtpForReset}
                        disabled={sendingOtp}
                      >
                        {sendingOtp ? (
                          <>
                            <FiRefreshCw className="ProfilePage__spinIcon" />
                            <span>SENDING CODE...</span>
                          </>
                        ) : (
                          <>
                            <FiMail />
                            <span>SEND 6-DIGIT OTP CODE</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleResetPasswordWithOtp} className="ProfilePage__passwordForm">
                      <div className="ProfilePage__passwordField">
                        <div className="ProfilePage__otpPromptHeader">
                          <label className="ProfilePage__fieldLabel">Enter 6-Digit OTP Code</label>
                          <button
                            type="button"
                            className="ProfilePage__resendOtpBtn"
                            onClick={handleSendOtpForReset}
                            disabled={sendingOtp}
                          >
                            Resend Code
                          </button>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          className={`ProfilePage__input ProfilePage__input--otp ${
                            passwordErrors.otpCode ? "ProfilePage__input--error" : ""
                          }`}
                          placeholder="e.g. 583920"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        />
                        {passwordErrors.otpCode && (
                          <span className="ProfilePage__errorMsg">{passwordErrors.otpCode}</span>
                        )}
                      </div>

                      <div className="ProfilePage__passwordGrid">
                        <div className="ProfilePage__passwordField">
                          <label className="ProfilePage__fieldLabel">New Password</label>
                          <div className="ProfilePage__passwordInputWrap">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              className={`ProfilePage__input ${
                                passwordErrors.newPassword ? "ProfilePage__input--error" : ""
                              }`}
                              placeholder="At least 6 characters"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              className="ProfilePage__eyeToggleBtn"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              aria-label={showNewPassword ? "Hide password" : "Show password"}
                            >
                              {showNewPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                          {passwordErrors.newPassword && (
                            <span className="ProfilePage__errorMsg">
                              {passwordErrors.newPassword}
                            </span>
                          )}
                        </div>

                        <div className="ProfilePage__passwordField">
                          <label className="ProfilePage__fieldLabel">Confirm New Password</label>
                          <div className="ProfilePage__passwordInputWrap">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              className={`ProfilePage__input ${
                                passwordErrors.confirmPassword ? "ProfilePage__input--error" : ""
                              }`}
                              placeholder="Re-enter new password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              className="ProfilePage__eyeToggleBtn"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                          {passwordErrors.confirmPassword && (
                            <span className="ProfilePage__errorMsg">
                              {passwordErrors.confirmPassword}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ProfilePage__passwordActions">
                        <button
                          type="submit"
                          className="ProfilePage__saveBtn"
                          disabled={verifyingOtp}
                        >
                          {verifyingOtp ? "VERIFYING & RESETTING..." : "RESET PASSWORD NOW"}
                        </button>
                        <button
                          type="button"
                          className="ProfilePage__resetBtn"
                          onClick={handleResetPasswordForm}
                          title="Reset OTP inputs"
                        >
                          <FiRefreshCw />
                          <span>RESET FORM</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 4: FAQS (Flipkart Style) */}
            <div className="ProfilePage__faqs">
              <h3 className="ProfilePage__faqsTitle">Frequently Asked Questions</h3>

              <div className="ProfilePage__faqItem">
                <h4>What happens when I update my email address (or mobile number)?</h4>
                <p>
                  Your login email id (or mobile number) changes, likewise. You will
                  receive all your book order confirmations, shipment updates, and
                  customer support notifications on this updated address.
                </p>
              </div>

              <div className="ProfilePage__faqItem">
                <h4>
                  When will my Lekhani account be updated with the new email address (or
                  mobile number)?
                </h4>
                <p>
                  It happens instantly as soon as you save the changes. Your saved
                  addresses and shopping history remain intact.
                </p>
              </div>

              <div className="ProfilePage__faqItem">
                <h4>
                  What happens to my existing Lekhani account when I update my email
                  address (or mobile number)?
                </h4>
                <p>
                  Updating your email address or mobile number doesn't invalidate your
                  account. Your cart, wishlists, and order receipts will continue to be
                  safely accessible under your account.
                </p>
              </div>
            </div>

            {/* SECTION 5: ACCOUNT ACTIONS */}
            <div className="ProfilePage__deactivateWrap">
              <button
                type="button"
                className="ProfilePage__deactivateBtn"
                onClick={() => setShowDeactivateModal(true)}
              >
                Deactivate Account
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* DEACTIVATE ACCOUNT CONFIRMATION MODAL */}
      {showDeactivateModal && (
        <div
          className="ProfilePage__modalBackdrop"
          onClick={() => setShowDeactivateModal(false)}
        >
          <div
            className="ProfilePage__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ProfilePage__modalHeader">
              <div className="ProfilePage__modalWarning">
                <FiAlertTriangle />
              </div>
              <h3>Deactivate Account</h3>
              <button
                type="button"
                className="ProfilePage__modalClose"
                onClick={() => setShowDeactivateModal(false)}
              >
                <FiX />
              </button>
            </div>

            <p className="ProfilePage__modalText">
              Are you sure you want to log out and deactivate your active session? You can
              always reactivate your Lekhani account simply by logging back in with your
              credentials.
            </p>

            <div className="ProfilePage__modalActions">
              <button
                type="button"
                className="ProfilePage__modalCancelBtn"
                onClick={() => setShowDeactivateModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ProfilePage__modalConfirmBtn"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Deactivate & Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Profile;
