import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';
import {
  LuLayoutDashboard, LuBook, LuFolder, LuShoppingCart,
  LuUsers, LuMessageSquare, LuTag, LuStar,
  LuSettings, LuBookOpen, LuMessageCircle, LuX, LuMenu,
  LuGalleryHorizontal, LuNewspaper, LuPenTool, LuListTree,
  LuChevronDown
} from 'react-icons/lu';

const blogSubItems = [
  { id: 'blog-management', label: 'Blog Management', path: '/blogs/management', icon: <LuListTree /> },
  { id: 'blog-posting', label: 'Blog Posting', path: '/blogs/create', icon: <LuPenTool /> }
];

const Sidebar = ({ isCollapsedProp = false, toggleSidebarProp }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Check if current route is within the blogs section
  const isBlogRouteActive = location.pathname.startsWith('/blogs');
  const [isBlogsOpen, setIsBlogsOpen] = useState(isBlogRouteActive);

  // Keep blogs open if user navigates to a blog sub-route
  useEffect(() => {
    if (isBlogRouteActive) {
      setIsBlogsOpen(true);
    }
  }, [location.pathname, isBlogRouteActive]);

  // Lock body scroll on mobile devices when drawer is active
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

  const toggleBlogsDropdown = (e) => {
    e.preventDefault();
    if (isCollapsedProp && !isMobileOpen && toggleSidebarProp) {
      toggleSidebarProp();
    }
    setIsBlogsOpen((prev) => !prev);
  };

  const showExpandedContent = !isCollapsedProp || isMobileOpen;

  return (
    <>
      {/* Floating Toggle Button for Mobile */}
      <button 
        type="button" 
        className="mobile-toggle-btn" 
        onClick={() => setIsMobileOpen((prev) => !prev)}
        aria-label="Toggle Navigation Menu"
      >
        <LuMenu />
      </button>

      {/* Dimmed backdrop overlay for mobile */}
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
            {/* Dashboard */}
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleItemClick}
                title={!showExpandedContent ? 'Dashboard' : ''}
              >
                <span className="nav-icon"><LuLayoutDashboard /></span>
                {showExpandedContent && <span className="nav-label">Dashboard</span>}
              </NavLink>
            </li>

            {/* Books */}
            <li>
              <NavLink
                to="/books"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleItemClick}
                title={!showExpandedContent ? 'Books' : ''}
              >
                <span className="nav-icon"><LuBook /></span>
                {showExpandedContent && <span className="nav-label">Books</span>}
              </NavLink>
            </li>

            {/* Blogs Dropdown Menu (Directly Below Books) */}
            <li className={`nav-dropdown-item ${isBlogsOpen ? 'open' : ''} ${isBlogRouteActive ? 'parent-active' : ''}`}>
              <button
                type="button"
                className={`nav-link nav-dropdown-btn ${isBlogRouteActive ? 'active' : ''}`}
                onClick={toggleBlogsDropdown}
                aria-expanded={isBlogsOpen}
                title={!showExpandedContent ? 'Blogs' : ''}
              >
                <span className="nav-icon"><LuNewspaper /></span>
                {showExpandedContent && (
                  <>
                    <span className="nav-label">Blogs</span>
                    <span className={`dropdown-arrow ${isBlogsOpen ? 'rotated' : ''}`}>
                      <LuChevronDown />
                    </span>
                  </>
                )}
              </button>

              {/* Sub-menu: Blog Management & Blog Posting */}
              {showExpandedContent && (
                <div className={`nav-submenu-wrapper ${isBlogsOpen ? 'expanded' : ''}`}>
                  <ul className="nav-submenu">
                    {blogSubItems.map(({ id, label, path, icon }) => (
                      <li key={id}>
                        <NavLink
                          to={path}
                          className={({ isActive }) => `nav-sub-link ${isActive ? 'sub-active' : ''}`}
                          onClick={handleItemClick}
                        >
                          <span className="nav-sub-icon">{icon}</span>
                          <span className="nav-sub-label">{label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>

            {/* Shop */}
            <li>
              <NavLink
                to="/shop"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleItemClick}
                title={!showExpandedContent ? 'Shop' : ''}
              >
                <span className="nav-icon"><LuShoppingCart /></span>
                {showExpandedContent && <span className="nav-label">Shop</span>}
              </NavLink>
            </li>

            {/* Categories */}
            <li>
              <NavLink
                to="/categories"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleItemClick}
                title={!showExpandedContent ? 'Categories' : ''}
              >
                <span className="nav-icon"><LuFolder /></span>
                {showExpandedContent && <span className="nav-label">Categories</span>}
              </NavLink>
            </li>

            {/* Orders */}
            <li>
              <NavLink
                to="/orders"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleItemClick}
                title={!showExpandedContent ? 'Orders' : ''}
              >
                <span className="nav-icon"><LuShoppingCart /></span>
                {showExpandedContent && <span className="nav-label">Orders</span>}
              </NavLink>
            </li>

            {/* Gallery */}
            <li>
              <NavLink
                to="/gallery"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleItemClick}
                title={!showExpandedContent ? 'Gallery' : ''}
              >
                <span className="nav-icon"><LuGalleryHorizontal /></span>
                {showExpandedContent && <span className="nav-label">Gallery</span>}
              </NavLink>
            </li>

            {/* Users */}
            <li>
              <NavLink
                to="/users"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleItemClick}
                title={!showExpandedContent ? 'Users' : ''}
              >
                <span className="nav-icon"><LuUsers /></span>
                {showExpandedContent && <span className="nav-label">Users</span>}
              </NavLink>
            </li>

            {/* Enquiries */}
            <li>
              <NavLink
                to="/enquiries"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleItemClick}
                title={!showExpandedContent ? 'Enquiries' : ''}
              >
                <span className="nav-icon"><LuMessageSquare /></span>
                {showExpandedContent && <span className="nav-label">Enquiries</span>}
              </NavLink>
            </li>

            {/* Supports */}
            <li>
              <NavLink
                to="/supports"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleItemClick}
                title={!showExpandedContent ? 'Supports' : ''}
              >
                <span className="nav-icon"><LuMessageCircle /></span>
                {showExpandedContent && <span className="nav-label">Supports</span>}
              </NavLink>
            </li>

            {/* Coupons */}
            <li>
              <NavLink
                to="/coupons"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleItemClick}
                title={!showExpandedContent ? 'Coupons' : ''}
              >
                <span className="nav-icon"><LuTag /></span>
                {showExpandedContent && <span className="nav-label">Coupons</span>}
              </NavLink>
            </li>

            {/* Reviews */}
            <li>
              <NavLink
                to="/reviews"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleItemClick}
                title={!showExpandedContent ? 'Reviews' : ''}
              >
                <span className="nav-icon"><LuStar /></span>
                {showExpandedContent && <span className="nav-label">Reviews</span>}
              </NavLink>
            </li>

            {/* Testimonials */}
            <li>
              <NavLink
                to="/testimonial"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleItemClick}
                title={!showExpandedContent ? 'Testimonials' : ''}
              >
                <span className="nav-icon"><LuMessageCircle /></span>
                {showExpandedContent && <span className="nav-label">Testimonials</span>}
              </NavLink>
            </li>

            {/* Settings */}
            <li>
              <NavLink
                to="/settings"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleItemClick}
                title={!showExpandedContent ? 'Settings' : ''}
              >
                <span className="nav-icon"><LuSettings /></span>
                {showExpandedContent && <span className="nav-label">Settings</span>}
              </NavLink>
            </li>
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