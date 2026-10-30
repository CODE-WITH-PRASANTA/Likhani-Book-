import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API, {
  getAdminUser,
  getAdminRefreshToken,
  clearAdminAuth,
} from "../../api/axios";
import "./Topbar.css";

import {
  LuMenu,
  LuSearch,
  LuBell,
  LuChevronDown,
  LuX,
  LuUserRound,
  LuLogOut,
  LuShieldCheck,
  LuBookOpen,
  LuArrowUpRight,
} from "react-icons/lu";

const DEFAULT_ADMIN_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80";

const Topbar = ({ onToggleSidebar }) => {
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(() => getAdminUser());

  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Load latest admin profile on mount
  useEffect(() => {
    let isMounted = true;
    const fetchCurrentAdmin = async () => {
      try {
        const { data } = await API.get("/admin/me");
        if (data.success && data.admin && isMounted) {
          setAdminUser(data.admin);
          const isLocal = !!localStorage.getItem("adminAccessToken");
          const storage = isLocal ? localStorage : sessionStorage;
          storage.setItem("adminUser", JSON.stringify(data.admin));
        }
      } catch (err) {
        // Fallback to local stored user
      }
    };

    fetchCurrentAdmin();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdowns on route changes
  useEffect(() => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Focus search input when mobile search opens
  useEffect(() => {
    if (isSearchOpen) {
      searchRef.current?.focus();
    }
  }, [isSearchOpen]);

  const handleProfileNavigation = () => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setIsSearchOpen(false);
    navigate("/my-profile");
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);

    try {
      const refreshToken = getAdminRefreshToken();
      await API.post("/admin/logout", { refreshToken });
    } catch (err) {
      console.warn("Logout note:", err.message);
    } finally {
      clearAdminAuth();
      navigate("/login", { replace: true });
    }
  };

  const toggleMobileSearch = () => {
    setIsSearchOpen((prev) => !prev);
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen((prev) => !prev);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
    setIsProfileOpen(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;

    navigate("/books", {
      state: { query },
    });
    setIsSearchOpen(false);
  };

  const avatarUrl = adminUser?.avatar || DEFAULT_ADMIN_AVATAR;
  const adminName = adminUser?.name || "Administrator";
  const adminRole = adminUser?.role || "Admin";
  const adminEmail = adminUser?.email || "admin@likhani.com";
  const [avatarError, setAvatarError] = useState(false);

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(adminName);
  const hasCustomAvatar = adminUser?.avatar && !avatarError;


  return (
    <header className="topbar">
      {/* Left Section */}
      <div className="topbar-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <LuMenu />
        </button>

        <div className="topbar-brand-mobile">
          <span className="topbar-brand-icon">
            <LuBookOpen />
          </span>
          <span>Likhani Books</span>
        </div>

        {/* Search Box */}
        <form
          className={`search-box ${isSearchOpen ? "search-open" : ""}`}
          onSubmit={handleSearchSubmit}
          role="search"
        >
          <LuSearch className="search-icon" />

          <input
            ref={searchRef}
            type="search"
            placeholder="Search books, orders, users..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="search-input"
            aria-label="Search books, orders and users"
          />

          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <LuX />
            </button>
          )}

          {isSearchOpen && (
            <button
              type="button"
              className="search-close-btn"
              onClick={toggleMobileSearch}
              aria-label="Close search"
            >
              <LuX />
            </button>
          )}
        </form>
      </div>

      {/* Right Section */}
      <div className="topbar-right">
        <button
          type="button"
          className="mobile-search-btn"
          onClick={toggleMobileSearch}
          aria-label="Open search"
          title="Search"
        >
          <LuSearch />
        </button>

        {/* Notifications */}
        <div className="topbar-notification-wrapper" ref={notificationRef}>
          <button
            type="button"
            className={`notification-btn ${isNotificationsOpen ? "active" : ""}`}
            onClick={toggleNotifications}
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
            aria-haspopup="true"
            title="Notifications"
          >
            <LuBell />
            <span className="notification-dot" />
          </button>

          {isNotificationsOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <div>
                  <h3>Notifications</h3>
                  <p>Your admin panel updates</p>
                </div>

                <span className="notification-header-icon">
                  <LuBell />
                </span>
              </div>

              <div className="notification-empty">
                <span className="notification-empty-icon">
                  <LuBell />
                </span>
                <strong>You&apos;re all caught up!</strong>
                <p>
                  Notifications will appear here when they are connected
                  to your application data.
                </p>
              </div>
            </div>
          )}
        </div>

        <span className="topbar-divider" />

        {/* Admin Profile */}
        <div className="user-profile-wrapper" ref={profileRef}>
          <button
            type="button"
            className={`user-profile ${isProfileOpen ? "active" : ""}`}
            onClick={toggleProfileDropdown}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <span className="avatar-wrapper">
              {hasCustomAvatar ? (
                <img
                  src={avatarUrl}
                  alt={adminName}
                  className="avatar"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="avatar-initials">{initials}</span>
              )}
              <span className="avatar-online-dot" />
            </span>

            <span className="user-profile-info">
              <span className="user-name">{adminName}</span>
              <span className="user-role-badge">
                <LuShieldCheck size={10} />
                <span>{adminRole}</span>
              </span>
            </span>

            <span className={`chevron-pill ${isProfileOpen ? "active" : ""}`}>
              <LuChevronDown
                className={`chevron-icon ${isProfileOpen ? "rotated" : ""}`}
              />
            </span>
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar-wrapper">
                  {hasCustomAvatar ? (
                    <img
                      src={avatarUrl}
                      alt={adminName}
                      className="dropdown-avatar"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="dropdown-avatar-initials">{initials}</span>
                  )}
                  <span className="avatar-online-dot" />
                </div>

                <div className="dropdown-header-info">
                  <p className="dropdown-user-name">{adminName}</p>
                  <p className="dropdown-user-email">{adminEmail}</p>

                  <span className="role-badge">
                    <LuShieldCheck />
                    {adminRole}
                  </span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <p className="dropdown-section-label">ACCOUNT</p>

              <ul className="dropdown-menu">
                <li>
                  <button
                    type="button"
                    className="dropdown-menu-link"
                    onClick={handleProfileNavigation}
                  >
                    <span className="dropdown-menu-icon">
                      <LuUserRound />
                    </span>

                    <span className="dropdown-menu-text">
                      <strong>My Profile</strong>
                      <small>Manage your personal details & security</small>
                    </span>

                    <LuArrowUpRight className="dropdown-menu-arrow" />
                  </button>
                </li>
              </ul>

              <div className="dropdown-divider" />

              <div className="dropdown-footer">
                <button
                  type="button"
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  <LuLogOut />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
