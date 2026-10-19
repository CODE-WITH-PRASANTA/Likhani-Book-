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
                    <button
                      type="submit"
                      className="ProfilePage__saveBtn"
                      disabled={submittingPersonal}
                    >
                      {submittingPersonal ? "SAVING..." : "SAVE"}
                    </button>
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
                    <button
                      type="submit"
                      className="ProfilePage__saveBtn"
                      disabled={submittingEmail}
                    >
                      {submittingEmail ? "SAVING..." : "SAVE"}
                    </button>
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
                    <button
                      type="submit"
                      className="ProfilePage__saveBtn"
                      disabled={submittingPhone}
                    >
                      {submittingPhone ? "SAVING..." : "SAVE"}
                    </button>
                  )}
                </div>
              </form>
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
