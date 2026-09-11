import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import {
  LuLayoutDashboard, LuBook, LuFolder, LuShoppingCart,
  LuUsers, LuMessageSquare, LuTag, LuStar,
  LuSettings, LuBookOpen, LuMessageCircle, LuX, LuMenu
} from 'react-icons/lu';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <LuLayoutDashboard /> },
  { id: 'books', label: 'Books', path: '/books', icon: <LuBook /> },
  { id: 'categories', label: 'Categories', path: '/categories', icon: <LuFolder /> },
  { id: 'orders', label: 'Orders', path: '/orders', icon: <LuShoppingCart /> },
  { id: 'users', label: 'Users', path: '/users', icon: <LuUsers /> },
  { id: 'enquiries', label: 'Enquiries', path: '/enquiries', icon: <LuMessageSquare /> },
  { id: 'coupons', label: 'Coupons', path: '/coupons', icon: <LuTag /> },
  { id: 'reviews', label: 'Reviews', path: '/reviews', icon: <LuStar /> },
  { id: 'testimonials', label: 'Testimonials', path: '/testimonial', icon: <LuMessageCircle /> },
  { id: 'settings', label: 'Settings', path: '/settings', icon: <LuSettings /> }
];

const Sidebar = ({ isCollapsedProp = false, toggleSidebarProp }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Lock body scroll on mobile devices when the sidebar drawer is active
  useEffect(() => {
    if (isMobileOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  const handleCloseMobile = () => {
    setIsMobileOpen(false);
  };

  const handleItemClick = () => {
    if (window.innerWidth <= 768) {
      handleCloseMobile();
    }
  };

  const showExpandedContent = !isCollapsedProp || isMobileOpen;

  return (
    <>
      {/* Floating Toggle Button for Mobile View */}
      <button 
        type="button" 
        className="mobile-toggle-btn" 
        onClick={() => setIsMobileOpen((prev) => !prev)}
        aria-label="Toggle Navigation Menu"
      >
        <LuMenu />
      </button>

      {/* Dimmed backdrop overlay for mobile drawers */}
      {isMobileOpen && (
        <div 
          className="sidebar-overlay active" 
          onClick={handleCloseMobile} 
          aria-hidden="true"
        />
      )}

      <aside 
        className={`sidebar ${isCollapsedProp ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-header-left">
            <div className="brand-logo" aria-hidden="true">
              <LuBookOpen />
            </div>
            {showExpandedContent && (
              <div className="brand-info">
                <h2>Likhani Books</h2>
                <span>Admin Panel</span>
              </div>
            )}
          </div>

          {/* Close button visible inside mobile drawer */}
          <button 
            type="button" 
            className="sidebar-close-btn" 
            onClick={handleCloseMobile} 
            aria-label="Close Navigation Sidebar"
          >
            <LuX />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map(({ id, label, path, icon }) => (
              <li key={id}>
                <NavLink
                  to={path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleItemClick}
                  title={isCollapsedProp && !isMobileOpen ? label : ''}
                >
                  <span className="nav-icon" aria-hidden="true">{icon}</span>
                  {showExpandedContent && <span className="nav-label">{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Quote Card */}
        {showExpandedContent && (
          <div className="sidebar-footer">
            <div className="quote-box">
              <div className="quote-icon" aria-hidden="true"><LuBookOpen /></div>
              <p className="quote-text">"Books are a uniquely portable magic."</p>
              <span className="quote-author">— Stephen King</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;