
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Topbar.css";

import {
  LuMenu,
  LuSearch,
  LuBell,
  LuChevronDown,
  LuX,
  LuUserRound,
  LuSettings,
  LuLogOut,
  LuShieldCheck,
  LuBookOpen,
  LuArrowUpRight,
} from "react-icons/lu";

const ADMIN_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80";

const Topbar = ({ onToggleSidebar }) => {
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Close menus when clicking outside.
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

  // Close dropdowns when navigating to another route.
  useEffect(() => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Focus the search input when mobile search opens.
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

  const handleSettingsNavigation = () => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    navigate("/settings");
  };

  const handleSecurityNavigation = () => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    navigate("/settings");
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);

    sessionStorage.removeItem("isAdminAuthenticated");
    localStorage.removeItem("isAdminAuthenticated");

    // Keep unrelated application storage intact.
    navigate("/login", { replace: true });
  };

  const toggleMobileSearch = () => {
    setIsSearchOpen((previous) => !previous);
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen((previous) => !previous);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((previous) => !previous);
    setIsProfileOpen(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) return;

    // Pass the search query to the destination page.
    // The destination page must read location.state.query
    // and implement the actual search.
    navigate("/books", {
      state: { query },
    });

    setIsSearchOpen(false);
  };

  return (
    <header className="topbar">
      {/* Left section */}
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

        {/* Desktop and expanded mobile search */}
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

      {/* Right section */}
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
            className={`notification-btn ${
              isNotificationsOpen ? "active" : ""
            }`}
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

        {/* Admin profile */}
        <div className="user-profile-wrapper" ref={profileRef}>
          <button
            type="button"
            className={`user-profile ${
              isProfileOpen ? "active" : ""
            }`}
            onClick={toggleProfileDropdown}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <span className="avatar-wrapper">
              <img
                src={ADMIN_AVATAR}
                alt="Admin"
                className="avatar"
              />
              <span className="avatar-online-dot" />
            </span>

            <span className="user-profile-info">
              <span className="user-name">Admin</span>
              <span className="user-role">Super Admin</span>
            </span>

            <LuChevronDown
              className={`chevron-icon ${
                isProfileOpen ? "rotated" : ""
              }`}
            />
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar-wrapper">
                  <img
                    src={ADMIN_AVATAR}
                    alt=""
                    className="dropdown-avatar"
                  />
                  <span className="avatar-online-dot" />
                </div>

                <div className="dropdown-header-info">
                  <p className="dropdown-user-name">Admin User</p>
                  <p className="dropdown-user-email">
                    admin@likhanibooks.com
                  </p>

                  <span className="role-badge">
                    <LuShieldCheck />
                    Super Admin
                  </span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <p className="dropdown-section-label">
                ACCOUNT
              </p>

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
                      <small>Manage your personal details</small>
                    </span>

                    <LuArrowUpRight className="dropdown-menu-arrow" />
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className="dropdown-menu-link"
                    onClick={handleSettingsNavigation}
                  >
                    <span className="dropdown-menu-icon">
                      <LuSettings />
                    </span>

                    <span className="dropdown-menu-text">
                      <strong>Account Settings</strong>
                      <small>Manage your preferences</small>
                    </span>

                    <LuArrowUpRight className="dropdown-menu-arrow" />
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className="dropdown-menu-link"
                    onClick={handleSecurityNavigation}
                  >
                    <span className="dropdown-menu-icon">
                      <LuShieldCheck />
                    </span>

                    <span className="dropdown-menu-text">
                      <strong>Security</strong>
                      <small>Account security settings</small>
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
