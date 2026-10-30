import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LuUserRound,
  LuMail,
  LuShieldCheck,
  LuCamera,
  LuSave,
  LuPlus,
  LuPencil,
  LuSearch,
  LuRefreshCw,
  LuUsers,
  LuBookOpen,
  LuMapPin,
  LuX,
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuLoaderCircle,
  LuCircleAlert,
  LuPhone,
  LuKeyRound,
  LuLock,
  LuEye,
  LuEyeOff,
  LuSend,
} from "react-icons/lu";

import API, { BASE_URL, getAdminUser, setAdminAuth } from "../../api/axios";
import "./MyProfile.css";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

const INITIAL_FORM = {
  fullName: "",
  email: "",
  username: "",
  role: "Admin",
  phone: "",
  homeLocation: "",
  bio: "",
};

const getAvatarUrl = (path) => {
  if (!path) return DEFAULT_AVATAR;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const MyProfile = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [avatarFile, setAvatarFile] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  // Admin list for management table
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // OTP & Forgot Password Section State
  const [securityTab, setSecurityTab] = useState("otp"); // "otp" | "direct"
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpInput, setOtpInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);
  const ITEMS_PER_PAGE = 5;

  const releasePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => releasePreview();
  }, [releasePreview]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // =========================================================
  // 1. FETCH CURRENT ADMIN PROFILE & ADMIN LIST
  // =========================================================

  const fetchProfileAndAdmins = useCallback(async () => {
    setFetching(true);
    setError("");

    try {
      // 1. Fetch current logged-in admin's profile
      const meRes = await API.get("/admin/me");
      if (meRes.data?.success && meRes.data?.admin) {
        const me = meRes.data.admin;
        setAdminUser(me);
        setEditingId(me.id || me._id);
        setFormData({
          fullName: me.name || "",
          email: me.email || "",
          username: me.username || "",
          role: me.role || "Admin",
          phone: me.phone || "",
          homeLocation: me.location || "",
          bio: me.bio || "",
        });
        setAvatar(getAvatarUrl(me.avatar));

        // Update stored admin auth so topbar syncs
        const isLocal = !!localStorage.getItem("adminAccessToken");
        const storage = isLocal ? localStorage : sessionStorage;
        storage.setItem("adminUser", JSON.stringify(me));
      }

      // 2. Fetch all admins for the overview table
      try {
        const usersRes = await API.get("/admin/users");
        if (usersRes.data?.success && Array.isArray(usersRes.data.admins)) {
          setAdmins(usersRes.data.admins);
        }
      } catch (err) {
        console.warn("Could not load full admin list:", err.message);
      }
    } catch (err) {
      console.error("Error fetching profile details:", err);
      // Fallback to local stored user
      const localUser = getAdminUser();
      if (localUser) {
        setAdminUser(localUser);
        setFormData({
          fullName: localUser.name || "",
          email: localUser.email || "",
          username: localUser.username || "",
          role: localUser.role || "Admin",
          phone: localUser.phone || "",
          homeLocation: localUser.location || "",
          bio: localUser.bio || "",
        });
        setAvatar(getAvatarUrl(localUser.avatar));
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to connect to the server. Please verify backend connection."
        );
      }
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileAndAdmins();
  }, [fetchProfileAndAdmins]);

  // =========================================================
  // 2. PROFILE IMAGE UPLOAD
  // =========================================================

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Your profile image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    releasePreview();
    const preview = URL.createObjectURL(file);
    previewUrlRef.current = preview;

    setAvatarFile(file);
    setAvatar(preview);
    setError("");
  };

  // =========================================================
  // 3. INPUT CHANGE HANDLER
  // =========================================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  // =========================================================
  // 4. SUBMIT / UPDATE PROFILE DETAILS
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError("Admin name and email address are required.");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.fullName.trim());
      payload.append("email", formData.email.trim());
      payload.append("username", formData.username.trim());
      payload.append("role", formData.role);
      payload.append("phone", formData.phone.trim());
      payload.append("location", formData.homeLocation.trim());
      payload.append("bio", formData.bio.trim());

      if (avatarFile) {
        payload.append("avatarFile", avatarFile);
      }

      const res = await API.put("/admin/me", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { data } = res;
      if (data.success && data.admin) {
        const updated = data.admin;
        setAdminUser(updated);
        setNotice("Profile updated successfully!");

        // Update local storage so topbar avatar/name updates instantly
        const isLocal = !!localStorage.getItem("adminAccessToken");
        const storage = isLocal ? localStorage : sessionStorage;
        storage.setItem("adminUser", JSON.stringify(updated));

        releasePreview();
        setAvatar(getAvatarUrl(updated.avatar));
        setAvatarFile(null);

        // Update admin in admin list
        setAdmins((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a))
        );
      } else {
        throw new Error(data.message || "Unable to save profile.");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // 5. OTP FORGOT / RESET PASSWORD HANDLERS
  // =========================================================

  // Send OTP to admin email
  const handleSendOtp = async () => {
    const targetEmail = formData.email.trim() || adminUser?.email;
    if (!targetEmail) {
      setError("Please ensure your admin email is filled in.");
      return;
    }

    setError("");
    setNotice("");
    setOtpSending(true);

    try {
      const res = await API.post("/admin/forgot-password", {
        email: targetEmail,
      });

      if (res.data?.success) {
        setOtpSent(true);
        setOtpCountdown(60); // 60s cooldown
        setNotice(
          res.data.message ||
            `A 6-digit OTP verification code has been dispatched to ${targetEmail}.`
        );
      } else {
        setError(res.data?.message || "Failed to dispatch OTP code.");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to send OTP code. Please check backend email configuration."
      );
    } finally {
      setOtpSending(false);
    }
  };

  // Submit OTP + New Password to reset password
  const handleResetWithOtp = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!otpInput || otpInput.trim().length !== 6) {
      setError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await API.post("/admin/reset-password", {
        email: formData.email.trim() || adminUser?.email,
        otp: otpInput.trim(),
        newPassword,
        confirmPassword,
      });

      if (res.data?.success) {
        setNotice(
          "Password reset successfully! Your new password is now active."
        );
        setOtpInput("");
        setNewPassword("");
        setConfirmPassword("");
        setOtpSent(false);
      } else {
        setError(res.data?.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid or expired OTP code. Please request a new one."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // Direct Password Change (with current password)
  const handleDirectPasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await API.put("/admin/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.data?.success) {
        setNotice("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(res.data?.message || "Failed to change password.");
      }
    } catch (err) {
      console.error("Direct change password error:", err);
      setError(
        err.response?.data?.message || "Incorrect current password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // Reset form to latest saved admin
  const handleResetForm = () => {
    if (adminUser) {
      setFormData({
        fullName: adminUser.name || "",
        email: adminUser.email || "",
        username: adminUser.username || "",
        role: adminUser.role || "Admin",
        phone: adminUser.phone || "",
        homeLocation: adminUser.location || "",
        bio: adminUser.bio || "",
      });
      setAvatar(getAvatarUrl(adminUser.avatar));
      setAvatarFile(null);
      setError("");
    }
  };

  // Filter admins for table
  const filteredAdmins = admins.filter((admin) => {
    const q = searchTerm.trim().toLowerCase();
    return (
      (admin.name || "").toLowerCase().includes(q) ||
      (admin.email || "").toLowerCase().includes(q) ||
      (admin.role || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const currentAdmins = filteredAdmins.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  return (
    <main className="myprofile-page-wrapper">
      {/* =================================================
          PAGE BANNER
      ================================================= */}
      <section className="myprofile-banner">
        <div className="myprofile-banner-content">
          <div className="myprofile-breadcrumb">
            <LuBookOpen />
            <span>Admin Panel</span>
            <span className="myprofile-breadcrumb-separator">/</span>
            <span>My Profile</span>
          </div>

          <div className="myprofile-banner-heading">
            <div>
              <span className="myprofile-eyebrow">ACCOUNT MANAGEMENT</span>
              <h1>My Profile</h1>
              <p>
                Manage your bookstore administrator details, security credentials,
                and profile information.
              </p>
            </div>

            <div className="myprofile-banner-icon">
              <LuUserRound />
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN CONTENT CONTAINER
      ================================================= */}
      <div className="myprofile-content-container">
        {/* Error Alert */}
        {error && (
          <div className="myprofile-alert myprofile-alert-error" role="alert">
            <LuCircleAlert />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <LuX />
            </button>
          </div>
        )}

        {/* Success Notice */}
        {notice && (
          <div
            className="myprofile-alert myprofile-alert-success"
            role="status"
          >
            <LuCheck />
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <LuX />
            </button>
          </div>
        )}

        {/* =================================================
            CARD 1: PERSONAL INFORMATION & ACCOUNT DETAILS
        ================================================= */}
        <section className="myprofile-card">
          <div className="myprofile-card-topline">
            <div className="myprofile-section-icon">
              <LuUserRound />
            </div>
            <div>
              <h2>Personal Information</h2>
              <p>Update your administrator profile details.</p>
            </div>

            <span className="myprofile-secure-badge">
              <LuShieldCheck />
              Secure profile
            </span>
          </div>

          {/* Profile Summary with Avatar */}
          <div className="myprofile-profile-summary">
            <div className="myprofile-avatar-wrapper">
              <img
                src={avatar}
                alt="Administrator profile"
                className="myprofile-avatar-img"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = DEFAULT_AVATAR;
                }}
              />

              <button
                type="button"
                className="myprofile-edit-badge-btn"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload profile image"
                title="Change profile image"
              >
                <LuCamera />
              </button>

              <input
                ref={fileInputRef}
                className="myprofile-file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
              />
            </div>

            <div className="myprofile-heading-group">
              <h3>{formData.fullName || "Bookstore Administrator"}</h3>
              <p>{formData.email || "Add your email address"}</p>
              <span className="myprofile-role-badge">
                <LuShieldCheck />
                {formData.role || "Administrator"}
              </span>
            </div>

            <span className="myprofile-avatar-hint">
              JPG, PNG or WebP · Max 5 MB
            </span>
          </div>

          {/* Account Details Form */}
          <form onSubmit={handleSubmit} className="myprofile-form">
            <div className="myprofile-form-heading">
              <h3>Account Details</h3>
              <p>Fields marked with * are required.</p>
            </div>

            <div className="myprofile-form-grid">
              {/* Admin Name */}
              <div className="myprofile-form-group">
                <label htmlFor="fullName" className="myprofile-label">
                  Admin Name <span>*</span>
                </label>
                <div className="myprofile-input-wrap">
                  <LuUserRound />
                  <input
                    id="fullName"
                    className="myprofile-input"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter administrator name"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="myprofile-form-group">
                <label htmlFor="email" className="myprofile-label">
                  Email Address <span>*</span>
                </label>
                <div className="myprofile-input-wrap">
                  <LuMail />
                  <input
                    id="email"
                    className="myprofile-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="admin@likhanibooks.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="myprofile-form-group">
                <label htmlFor="username" className="myprofile-label">
                  Username
                </label>
                <div className="myprofile-input-wrap">
                  <LuUserRound />
                  <input
                    id="username"
                    className="myprofile-input"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="admin_username"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="myprofile-form-group">
                <label htmlFor="phone" className="myprofile-label">
                  Phone Number
                </label>
                <div className="myprofile-input-wrap">
                  <LuPhone />
                  <input
                    id="phone"
                    className="myprofile-input"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="myprofile-form-group">
                <label htmlFor="role" className="myprofile-label">
                  Administrator Role
                </label>
                <div className="myprofile-input-wrap">
                  <LuShieldCheck />
                  <select
                    id="role"
                    className="myprofile-input"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="Admin">Admin</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                    <option value="Editor">Editor</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="myprofile-form-group">
                <label htmlFor="homeLocation" className="myprofile-label">
                  Location
                </label>
                <div className="myprofile-input-wrap">
                  <LuMapPin />
                  <input
                    id="homeLocation"
                    className="myprofile-input"
                    type="text"
                    name="homeLocation"
                    value={formData.homeLocation}
                    onChange={handleInputChange}
                    placeholder="City, State"
                    autoComplete="address-level2"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="myprofile-form-group myprofile-form-group-full">
                <label htmlFor="bio" className="myprofile-label">
                  About the Administrator
                </label>
                <textarea
                  id="bio"
                  className="myprofile-textarea"
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Write a short introduction about your role at Likhani Books..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="myprofile-form-action-row">
              <button
                type="button"
                className="myprofile-cancel-btn"
                onClick={handleResetForm}
                disabled={loading}
              >
                <LuRefreshCw />
                Reset
              </button>

              <button
                type="submit"
                className="myprofile-update-btn"
                disabled={loading}
              >
                {loading ? (
                  <LuLoaderCircle className="myprofile-spinner" />
                ) : (
                  <LuSave />
                )}
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        {/* =================================================
            CARD 2: SECURITY & OTP-BASED FORGOT / RESET PASSWORD
        ================================================= */}
        <section className="myprofile-card myprofile-security-card">
          <div className="myprofile-card-topline">
            <div className="myprofile-section-icon">
              <LuKeyRound />
            </div>
            <div>
              <h2>Password & Security</h2>
              <p>Reset or update your administrator portal password.</p>
            </div>

            <span className="myprofile-secure-badge">
              <LuLock />
              Encrypted
            </span>
          </div>

          {/* Mode Tabs: OTP Reset vs Direct Password Change */}
          <div className="myprofile-tab-pills">
            <button
              type="button"
              className={`myprofile-tab-pill ${
                securityTab === "otp" ? "active" : ""
              }`}
              onClick={() => {
                setSecurityTab("otp");
                setError("");
              }}
            >
              <LuMail style={{ display: "inline", marginRight: 6 }} />
              OTP Password Reset
            </button>
            <button
              type="button"
              className={`myprofile-tab-pill ${
                securityTab === "direct" ? "active" : ""
              }`}
              onClick={() => {
                setSecurityTab("direct");
                setError("");
              }}
            >
              <LuLock style={{ display: "inline", marginRight: 6 }} />
              Direct Password Change
            </button>
          </div>

          {securityTab === "otp" ? (
            /* ==============================================
               OTP-BASED FORGOT / RESET PASSWORD FORM
            ============================================== */
            <form onSubmit={handleResetWithOtp} className="myprofile-form">
              <div className="myprofile-form-heading">
                <h3>OTP-Based Password Reset</h3>
                <p>
                  Receive a secure 6-digit numeric OTP to your email address (
                  <strong>{formData.email || "admin@likhani.com"}</strong>) to
                  authorize your password update.
                </p>
              </div>

              <div className="myprofile-form-grid">
                {/* Email Display & Send OTP Button */}
                <div className="myprofile-form-group myprofile-form-group-full">
                  <label className="myprofile-label">Verified Admin Email</label>
                  <div className="myprofile-otp-row">
                    <div className="myprofile-input-wrap" style={{ flex: 1 }}>
                      <LuMail />
                      <input
                        className="myprofile-input"
                        type="email"
                        value={formData.email}
                        readOnly
                        disabled
                        style={{ background: "#f8fafc", color: "#475569" }}
                      />
                    </div>

                    <button
                      type="button"
                      className="myprofile-send-otp-btn"
                      onClick={handleSendOtp}
                      disabled={otpSending || otpCountdown > 0}
                    >
                      {otpSending ? (
                        <LuLoaderCircle className="myprofile-spinner" />
                      ) : (
                        <LuSend />
                      )}
                      {otpSending
                        ? "Sending OTP..."
                        : otpCountdown > 0
                        ? `Resend in ${otpCountdown}s`
                        : otpSent
                        ? "Resend 6-Digit OTP"
                        : "Send 6-Digit OTP Code"}
                    </button>
                  </div>
                </div>

                {/* 6-Digit OTP Input */}
                <div className="myprofile-form-group">
                  <label htmlFor="otp-input" className="myprofile-label">
                    6-Digit Verification OTP <span>*</span>
                  </label>
                  <div className="myprofile-input-wrap">
                    <LuKeyRound />
                    <input
                      id="otp-input"
                      className="myprofile-input myprofile-otp-input"
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otpInput}
                      onChange={(e) =>
                        setOtpInput(
                          e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
                        )
                      }
                      required
                    />
                  </div>
                </div>

                {/* Password visibility toggle */}
                <div className="myprofile-form-group">
                  <label className="myprofile-label">Password Visibility</label>
                  <button
                    type="button"
                    className="myprofile-cancel-btn"
                    style={{ width: "100%", height: 48, justifyContent: "center" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <LuEyeOff /> : <LuEye />}
                    <span>{showPassword ? "Hide Passwords" : "Show Passwords"}</span>
                  </button>
                </div>

                {/* New Password */}
                <div className="myprofile-form-group">
                  <label htmlFor="new-password" className="myprofile-label">
                    New Password <span>*</span> (min 6 chars)
                  </label>
                  <div className="myprofile-input-wrap">
                    <LuLock />
                    <input
                      id="new-password"
                      className="myprofile-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new strong password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="myprofile-form-group">
                  <label htmlFor="confirm-password" className="myprofile-label">
                    Confirm New Password <span>*</span>
                  </label>
                  <div className="myprofile-input-wrap">
                    <LuLock />
                    <input
                      id="confirm-password"
                      className="myprofile-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit OTP Reset */}
              <div className="myprofile-form-action-row">
                <button
                  type="submit"
                  className="myprofile-update-btn"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <LuLoaderCircle className="myprofile-spinner" />
                  ) : (
                    <LuShieldCheck />
                  )}
                  {passwordLoading
                    ? "Verifying OTP & Updating..."
                    : "Verify OTP & Reset Password"}
                </button>
              </div>
            </form>
          ) : (
            /* ==============================================
               DIRECT PASSWORD CHANGE FORM
            ============================================== */
            <form
              onSubmit={handleDirectPasswordChange}
              className="myprofile-form"
            >
              <div className="myprofile-form-heading">
                <h3>Direct Password Change</h3>
                <p>Enter your existing password to verify and set a new password.</p>
              </div>

              <div className="myprofile-form-grid">
                {/* Current Password */}
                <div className="myprofile-form-group myprofile-form-group-full">
                  <label htmlFor="cur-pass" className="myprofile-label">
                    Current Password <span>*</span>
                  </label>
                  <div className="myprofile-input-wrap">
                    <LuLock />
                    <input
                      id="cur-pass"
                      className="myprofile-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="myprofile-form-group">
                  <label htmlFor="dir-new-pass" className="myprofile-label">
                    New Password <span>*</span> (min 6 chars)
                  </label>
                  <div className="myprofile-input-wrap">
                    <LuLock />
                    <input
                      id="dir-new-pass"
                      className="myprofile-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="myprofile-form-group">
                  <label htmlFor="dir-conf-pass" className="myprofile-label">
                    Confirm Password <span>*</span>
                  </label>
                  <div className="myprofile-input-wrap">
                    <LuLock />
                    <input
                      id="dir-conf-pass"
                      className="myprofile-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="myprofile-form-action-row">
                <button
                  type="button"
                  className="myprofile-cancel-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <LuEyeOff /> : <LuEye />}
                  <span>{showPassword ? "Hide Passwords" : "Show Passwords"}</span>
                </button>

                <button
                  type="submit"
                  className="myprofile-update-btn"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <LuLoaderCircle className="myprofile-spinner" />
                  ) : (
                    <LuSave />
                  )}
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* =================================================
            CARD 3: ADMINISTRATOR PROFILES OVERVIEW TABLE
        ================================================= */}
        <section className="myprofile-table-card">
          <div className="myprofile-table-header-row">
            <div className="myprofile-table-title-wrap">
              <div className="myprofile-section-icon">
                <LuUsers />
              </div>
              <div>
                <h2 className="myprofile-table-title-text">
                  Administrator Directory
                </h2>
                <p>View registered system administrators.</p>
              </div>
            </div>

            <button
              type="button"
              className="myprofile-add-new-btn"
              onClick={fetchProfileAndAdmins}
            >
              <LuRefreshCw />
              Refresh Directory
            </button>
          </div>

          <div className="myprofile-table-toolbar">
            <div className="myprofile-search-wrap">
              <LuSearch />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, email or role..."
                aria-label="Search admins"
              />
            </div>
          </div>

          <div className="myprofile-table-wrapper">
            <table className="myprofile-table">
              <thead className="myprofile-thead">
                <tr>
                  <th className="myprofile-th">#</th>
                  <th className="myprofile-th">Administrator</th>
                  <th className="myprofile-th">Email Address</th>
                  <th className="myprofile-th">Role</th>
                  <th className="myprofile-th">Phone / Location</th>
                  <th className="myprofile-th">Status</th>
                </tr>
              </thead>

              <tbody className="myprofile-tbody">
                {fetching ? (
                  <tr>
                    <td colSpan="6" className="myprofile-empty-row">
                      <LuLoaderCircle className="myprofile-spinner" />
                      Loading administrator profiles...
                    </td>
                  </tr>
                ) : currentAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="myprofile-empty-row">
                      <LuUsers />
                      <strong>No administrators found</strong>
                      <span>
                        {searchTerm
                          ? "Try another search term."
                          : "No admin records found."}
                      </span>
                    </td>
                  </tr>
                ) : (
                  currentAdmins.map((admin, index) => (
                    <tr
                      key={admin.id || admin._id}
                      className={
                        (adminUser?.id === admin.id ||
                          adminUser?._id === admin._id)
                          ? "myprofile-tr myprofile-tr-active"
                          : "myprofile-tr"
                      }
                    >
                      <td className="myprofile-td myprofile-td-muted">
                        {(safePage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>

                      <td className="myprofile-td">
                        <div className="myprofile-cell-user">
                          <img
                            src={getAvatarUrl(admin.avatar)}
                            alt={admin.name}
                            className="myprofile-cell-avatar"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_AVATAR;
                            }}
                          />
                          <div>
                            <strong>{admin.name}</strong>
                            <small>@{admin.username || "admin"}</small>
                          </div>
                        </div>
                      </td>

                      <td className="myprofile-td">{admin.email}</td>

                      <td className="myprofile-td">
                        <span className="myprofile-role-pill">
                          {admin.role || "Admin"}
                        </span>
                      </td>

                      <td className="myprofile-td myprofile-td-muted">
                        {admin.phone || admin.location || "—"}
                      </td>

                      <td className="myprofile-td">
                        <span
                          className={`myprofile-status-pill ${
                            (admin.status || "Active").toLowerCase() ===
                            "active"
                              ? "myprofile-status-active"
                              : "myprofile-status-inactive"
                          }`}
                        >
                          {admin.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="myprofile-table-footer">
              <span className="myprofile-pagination-info">
                Showing {Math.min((safePage - 1) * ITEMS_PER_PAGE + 1, filteredAdmins.length)} to{" "}
                {Math.min(safePage * ITEMS_PER_PAGE, filteredAdmins.length)} of{" "}
                {filteredAdmins.length} administrators
              </span>

              <div className="myprofile-pagination">
                <button
                  type="button"
                  className="myprofile-page-arrow"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  <LuChevronLeft />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`myprofile-page-btn ${
                      safePage === i + 1 ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  type="button"
                  className="myprofile-page-arrow"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={safePage === totalPages}
                >
                  <LuChevronRight />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default MyProfile;
