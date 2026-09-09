import React, { useState } from 'react';
import './Sidebar.css';
import { 
  LuLayoutDashboard, 
  LuBook, 
  LuFolder, 
  LuShoppingCart, 
  LuUsers, 
  LuMessageSquare, 
  LuTag, 
  LuStar, 
  LuSettings,
  LuBookOpen,
  LuMenu // 3-bar toggle icon
} from 'react-icons/lu';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <LuLayoutDashboard /> },
  { id: 'books', label: 'Books', icon: <LuBook /> },
  { id: 'categories', label: 'Categories', icon: <LuFolder /> },
  { id: 'orders', label: 'Orders', icon: <LuShoppingCart /> },
  { id: 'users', label: 'Users', icon: <LuUsers /> },
  { id: 'enquiries', label: 'Enquiries', icon: <LuMessageSquare /> },
  { id: 'coupons', label: 'Coupons', icon: <LuTag /> },
  { id: 'reviews', label: 'Reviews', icon: <LuStar /> },
  { id: 'settings', label: 'Settings', icon: <LuSettings /> },
];

const Sidebar = ({ isCollapsedProp, toggleSidebarProp }) => {
  // Local state to manage collapse/expand internally
  const [isCollapsed, setIsCollapsed] = useState(isCollapsedProp || false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Toggle function that handles both internal state and external parent callback if provided
  const handleToggle = () => {
    setIsCollapsed((prev) => !prev);
    if (toggleSidebarProp) {
      toggleSidebarProp();
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-header-left">
          <div className="brand-logo">
            <LuBookOpen />
          </div>
          {!isCollapsed && (
            <div className="brand-info">
              <h2>Likhani Books</h2>
              <span>Admin Panel</span>
            </div>
          )}
        </div>

        {/* 3-Bar Toggle Button */}
        <button 
          className="toggle-btn" 
          onClick={handleToggle}
          aria-label="Toggle Sidebar"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <LuMenu />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Quote */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="quote-box">
            <div className="quote-icon">
              <LuBookOpen />
            </div>
            <p className="quote-text">
              "Books are a uniquely portable magic."
            </p>
            <span className="quote-author">— Stephen King</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;