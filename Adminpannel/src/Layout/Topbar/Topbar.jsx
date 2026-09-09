import React, { useState } from 'react';
import './Topbar.css';
import { LuMenu, LuSearch, LuBell, LuChevronDown } from 'react-icons/lu';

const Topbar = ({ onToggleSidebar }) => {
  const [search, setSearch] = useState('');

  return (
    <header className="topbar">
      <div className="topbar-left">
        

        {/* Search Box */}
        <div className="search-box">
          <LuSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search books, orders, users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="topbar-right">
        {/* Notifications */}
        <button type="button" className="notification-btn" title="Notifications">
          <LuBell />
          <span className="badge">5</span>
        </button>

        {/* User Profile */}
        <div className="user-profile">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Admin"
            className="avatar"
          />
          <span className="user-name">Admin</span>
          <LuChevronDown className="chevron-icon" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;