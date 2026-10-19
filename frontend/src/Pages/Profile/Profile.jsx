import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiUser, FiMail, FiPhone, FiLogOut, FiHeart, FiShoppingBag } from "react-icons/fi";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!currentUser) return null;

  return (
    <main className="ProfilePage">
      <div className="ProfilePage__container">
        {/* Top Header Card */}
        <div className="ProfilePage__header">
          <div className="ProfilePage__userMeta">
            <div className="ProfilePage__avatar">
              {(currentUser.name || currentUser.firstName || "U")[0].toUpperCase()}
            </div>
            <div className="ProfilePage__info">
              <h1>{currentUser.name}</h1>
              <p>{currentUser.email}</p>
            </div>
          </div>

          <div className="ProfilePage__actions">
            <Link
              to="/wishlist"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#f0f7fb",
                color: "#17547b",
                border: "1px solid #c2def0",
                borderRadius: "8px",
                padding: "10px 18px",
                fontSize: "13.5px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <FiHeart />
              Wishlist
            </Link>
            <button
              type="button"
              className="ProfilePage__logoutBtn"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="ProfilePage__card">
          <h2 className="ProfilePage__cardTitle">
            <FiUser />
            Account Information
          </h2>

          <div className="ProfilePage__grid">
            <div className="ProfilePage__field">
              <span className="ProfilePage__label">First Name</span>
              <div className="ProfilePage__value">{currentUser.firstName || currentUser.name?.split(" ")[0] || "-"}</div>
            </div>

            <div className="ProfilePage__field">
              <span className="ProfilePage__label">Last Name</span>
              <div className="ProfilePage__value">{currentUser.lastName || currentUser.name?.split(" ")[1] || "-"}</div>
            </div>

            <div className="ProfilePage__field">
              <span className="ProfilePage__label">Email Address</span>
              <div className="ProfilePage__value">{currentUser.email || "-"}</div>
            </div>

            <div className="ProfilePage__field">
              <span className="ProfilePage__label">Phone Number</span>
              <div className="ProfilePage__value">{currentUser.phone || "Not specified"}</div>
            </div>

            <div className="ProfilePage__field">
              <span className="ProfilePage__label">Account Type</span>
              <div className="ProfilePage__value">{currentUser.authProvider === "google" ? "Google Connected Account" : "Standard Email & Password"}</div>
            </div>

            <div className="ProfilePage__field">
              <span className="ProfilePage__label">Member Status</span>
              <div className="ProfilePage__value" style={{ color: "#0d8a54" }}>Active Reader</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
