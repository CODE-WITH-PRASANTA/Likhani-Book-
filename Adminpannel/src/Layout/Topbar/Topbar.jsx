import React from 'react';
import './Topbar.css';

const Topbar = () => {
  return (
    <header className="topbar">
      {/* Search Bar */}
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search books, authors, ISBN..."
          className="search-input"
        />
      </div>

      {/* User Actions */}
      <div className="topbar-actions">
        <button className="icon-btn" title="Notifications">
          🔔<span className="notification-dot"></span>
        </button>
        <button className="icon-btn" title="Cart">
          🛒
        </button>
        <div className="user-profile">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="User Avatar"
            className="avatar"
          />
          <div className="user-info">
            <span className="user-name">Alex Johnson</span>
            <span className="user-role">Reader</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;