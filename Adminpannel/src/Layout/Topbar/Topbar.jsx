import React, { useState, useEffect, useRef } from 'react';
import './Topbar.css';
import {
  LuMenu,
  LuSearch,
  LuBell,
  LuChevronDown,
  LuX,
  LuUser,
  LuSettings,
  LuLogOut,
  LuShield
} from 'react-icons/lu';

const Topbar = ({ onToggleSidebar }) => {
  const [search, setSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef(null);

  const toggleMobileSearch = () => {
    setIsSearchOpen((prev) => !prev);
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="topbar">
      {/* Left Section: Sidebar Toggle & Search */}
      <div className="topbar-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar"
        >
          <LuMenu />
        </button>

        {/* Desktop & Mobile Search Box */}
        <div className={`search-box ${isSearchOpen ? 'search-open' : ''}`}>
          <LuSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search books, orders, users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {/* Close button for expanded mobile search */}
          {isSearchOpen && (
            <button
              type="button"
              className="search-close-btn"
              onClick={toggleMobileSearch}
              aria-label="Close Search"
            >
              <LuX />
            </button>
          )}
        </div>
      </div>

      {/* Right Section: Mobile Search Trigger, Notifications, & Profile */}
      <div className="topbar-right">
        {/* Mobile Search Icon Toggle */}
        <button
          type="button"
          className="mobile-search-btn"
          onClick={toggleMobileSearch}
          aria-label="Open Search"
        >
          <LuSearch />
        </button>

        {/* Notifications */}
        <button type="button" className="notification-btn" title="Notifications">
          <LuBell />
          <span className="badge">5</span>
        </button>

        {/* User Profile & Dropdown */}
        <div className="user-profile-wrapper" ref={profileRef}>
          <button
            type="button"
            className={`user-profile ${isProfileOpen ? 'active' : ''}`}
            onClick={toggleProfileDropdown}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Admin Avatar"
              className="avatar"
            />
            <span className="user-name">Admin</span>
            <LuChevronDown className={`chevron-icon ${isProfileOpen ? 'rotated' : ''}`} />
          </button>

          {/* Admin Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <p className="dropdown-user-name">Admin User</p>
                <p className="dropdown-user-email">admin@likhanibook.com</p>
                <span className="role-badge">Super Admin</span>
              </div>

              <div className="dropdown-divider"></div>

              <ul className="dropdown-menu">
                <li>
                  <a href="#profile" onClick={() => setIsProfileOpen(false)}>
                    <LuUser className="dropdown-icon" />
                    <span>My Profile</span>
                  </a>
                </li>
                <li>
                  <a href="#settings" onClick={() => setIsProfileOpen(false)}>
                    <LuSettings className="dropdown-icon" />
                    <span>Account Settings</span>
                  </a>
                </li>
                <li>
                  <a href="#security" onClick={() => setIsProfileOpen(false)}>
                    <LuShield className="dropdown-icon" />
                    <span>Security</span>
                  </a>
                </li>
              </ul>

              <div className="dropdown-divider"></div>

              <div className="dropdown-footer">
                <button
                  type="button"
                  className="logout-btn"
                  onClick={() => {
                    setIsProfileOpen(false);
                    // Add your logout logic here
                  }}
                >
                  <LuLogOut className="dropdown-icon" />
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