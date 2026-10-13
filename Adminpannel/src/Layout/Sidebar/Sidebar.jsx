
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  LuMessageCircle,
  LuX,
  LuMenu,
  LuGalleryHorizontal,
  LuNewspaper,
  LuPenTool,
  LuListTree,
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";

import "./Sidebar.css";

const blogSubItems = [
  {
    id: "blog-management",
    label: "Blog Management",
    path: "/blogs/management",
    icon: LuListTree,
  },
  {
    id: "blog-posting",
    label: "Blog Posting",
    path: "/blogs/create",
    icon: LuPenTool,
  },
];

const navigationGroups = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LuLayoutDashboard },
      { label: "Books", path: "/books", icon: LuBook },
      { label: "Blogs", type: "dropdown", icon: LuNewspaper },
      { label: "Shop", path: "/shop", icon: LuShoppingCart },
      { label: "Categories", path: "/categories", icon: LuFolder },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { label: "Orders", path: "/orders", icon: LuShoppingCart },
      { label: "Gallery", path: "/gallery", icon: LuGalleryHorizontal },
      { label: "Users", path: "/users", icon: LuUsers },
      { label: "Enquiries", path: "/enquiries", icon: LuMessageSquare },
      { label: "Supports", path: "/supports", icon: LuMessageCircle },
    ],
  },
  {
    title: "MARKETING",
    items: [
      { label: "Coupons", path: "/coupons", icon: LuTag },
      { label: "Reviews", path: "/reviews", icon: LuStar },
      { label: "Testimonials", path: "/testimonial", icon: LuMessageCircle },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Settings", path: "/settings", icon: LuSettings },
    ],
  },
];

const Sidebar = ({
  isCollapsedProp = false,
  toggleSidebarProp,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isBlogsOpen, setIsBlogsOpen] = useState(false);

  const location = useLocation();

  const isBlogRouteActive =
    location.pathname === "/blogs" ||
    location.pathname.startsWith("/blogs/");

  const showExpandedContent =
    !isCollapsedProp || isMobileOpen;

  useEffect(() => {
    if (isBlogRouteActive) {
      setIsBlogsOpen(true);
    }
  }, [isBlogRouteActive]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileOpen || window.innerWidth > 768) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobileOpen]);

  const handleItemClick = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(false);
    }
  };

  const toggleBlogsDropdown = () => {
    if (isCollapsedProp && !isMobileOpen && toggleSidebarProp) {
      toggleSidebarProp();
      setIsBlogsOpen(true);
      return;
    }

    setIsBlogsOpen((previous) => !previous);
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;

    if (item.type === "dropdown") {
      return (
        <li key={item.label} className="premium-nav-dropdown">
          <button
            type="button"
            className={`premium-nav-link premium-dropdown-trigger ${
              isBlogRouteActive ? "is-active" : ""
            }`}
            onClick={toggleBlogsDropdown}
            aria-expanded={showExpandedContent && isBlogsOpen}
            aria-controls="premium-blog-submenu"
            title={!showExpandedContent ? "Blogs" : undefined}
          >
            <span className="premium-nav-icon">
              <Icon />
            </span>

            {showExpandedContent && (
              <>
                <span className="premium-nav-text">Blogs</span>
                <LuChevronDown
                  className={`premium-dropdown-chevron ${
                    isBlogsOpen ? "rotated" : ""
                  }`}
                />
              </>
            )}
          </button>

          {showExpandedContent && (
            <div
              id="premium-blog-submenu"
              className={`premium-submenu-wrapper ${
                isBlogsOpen ? "expanded" : ""
              }`}
            >
              <ul className="premium-submenu-list">
                {blogSubItems.map((subItem) => {
                  const SubIcon = subItem.icon;

                  return (
                    <li key={subItem.id}>
                      <NavLink
                        to={subItem.path}
                        onClick={handleItemClick}
                        className={({ isActive }) =>
                          `premium-submenu-link ${
                            isActive ? "sub-active" : ""
                          }`
                        }
                      >
                        <SubIcon />
                        <span>{subItem.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </li>
      );
    }

    return (
      <li key={item.path} className="premium-nav-item">
        <NavLink
          to={item.path}
          end
          onClick={handleItemClick}
          title={!showExpandedContent ? item.label : undefined}
          className={({ isActive }) =>
            `premium-nav-link ${isActive ? "is-active" : ""}`
          }
        >
          <span className="premium-nav-icon">
            <Icon />
          </span>

          {showExpandedContent && (
            <span className="premium-nav-text">
              {item.label}
            </span>
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <>
      <button
        type="button"
        className="premium-mobile-toggle"
        onClick={() => setIsMobileOpen((previous) => !previous)}
        aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileOpen}
      >
        {isMobileOpen ? <LuX /> : <LuMenu />}
      </button>

      {isMobileOpen && (
        <div
          className="premium-sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`premium-sidebar ${
          isCollapsedProp ? "collapsed" : ""
        } ${isMobileOpen ? "mobile-open" : ""}`}
        aria-label="Admin sidebar"
      >
        <div className="premium-sidebar-brand">
          <div className="premium-brand-content">
            <div className="premium-brand-icon">
              <LuBookOpen />
            </div>

            {showExpandedContent && (
              <div className="premium-brand-details">
                <h2>Likhani Books</h2>
                <div className="premium-brand-subtitle">
                  <span className="premium-brand-dot" />
                  ADMIN DASHBOARD
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="premium-sidebar-mobile-close"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <LuX />
          </button>
        </div>

        <nav
          className="premium-sidebar-navigation"
          aria-label="Main navigation"
        >
          {navigationGroups.map((group) => (
            <div className="premium-nav-group" key={group.title}>
              {showExpandedContent ? (
                <div className="premium-nav-group-title">
                  <span>{group.title}</span>
                  <span className="premium-group-line" />
                </div>
              ) : (
                <div className="premium-collapsed-divider" />
              )}

              <ul className="premium-nav-list">
                {group.items.map(renderNavItem)}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom cards removed intentionally. */}
        {toggleSidebarProp && (
          <div className="premium-sidebar-footer">
            <button
              type="button"
              className="premium-collapse-button"
              onClick={toggleSidebarProp}
              aria-label={
                isCollapsedProp ? "Expand sidebar" : "Collapse sidebar"
              }
              title={
                isCollapsedProp ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              {isCollapsedProp ? (
                <LuChevronRight />
              ) : (
                <LuChevronLeft />
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
