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
  LuStore,
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

const shopSubItems = [
  {
    id: "shop",
    label: "Shop",
    path: "/shop",
    icon: LuShoppingCart,
  },
  {
    id: "categories",
    label: "Categories",
    path: "/categories",
    icon: LuFolder,
  },
];

const navigationGroups = [
  {
    title: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: LuLayoutDashboard,
      },
      {
        label: "Books",
        path: "/books",
        icon: LuBook,
      },
      {
        label: "Blogs",
        type: "dropdown",
        id: "blogs",
        icon: LuNewspaper,
      },
      {
        label: "Shop Management",
        type: "dropdown",
        id: "shop-management",
        icon: LuStore,
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        label: "Orders",
        path: "/orders",
        icon: LuShoppingCart,
      },
      {
        label: "Gallery",
        path: "/gallery",
        icon: LuGalleryHorizontal,
      },
      {
        label: "Users",
        path: "/users",
        icon: LuUsers,
      },
      {
        label: "Enquiries",
        path: "/enquiries",
        icon: LuMessageSquare,
      },
      {
        label: "Supports",
        path: "/supports",
        icon: LuMessageCircle,
      },
    ],
  },
  {
    title: "MARKETING",
    items: [
      {
        label: "Coupons",
        path: "/coupons",
        icon: LuTag,
      },
      {
        label: "Reviews",
        path: "/reviews",
        icon: LuStar,
      },
      {
        label: "Testimonials",
        path: "/testimonial",
        icon: LuMessageCircle,
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        label: "Settings",
        path: "/settings",
        icon: LuSettings,
      },
    ],
  },
];

const Sidebar = ({
  isCollapsedProp = false,
  toggleSidebarProp,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const location = useLocation();

  const isRouteActive = (paths) =>
    paths.some(
      (path) =>
        location.pathname === path ||
        location.pathname.startsWith(`${path}/`)
    );

  const isBlogRouteActive = isRouteActive([
    "/blogs",
  ]);

  const isShopRouteActive = isRouteActive([
    "/shop",
    "/categories",
  ]);

  const showExpandedContent =
    !isCollapsedProp || isMobileOpen;

  // Keep the relevant dropdown open on direct navigation.
  useEffect(() => {
    if (isBlogRouteActive) {
      setOpenDropdown("blogs");
    } else if (isShopRouteActive) {
      setOpenDropdown("shop-management");
    }
  }, [location.pathname, isBlogRouteActive, isShopRouteActive]);

  // Close the mobile sidebar after navigation.
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Lock background scrolling and support Escape on mobile.
  useEffect(() => {
    if (!isMobileOpen || window.innerWidth > 768) {
      return undefined;
    }

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

  const toggleDropdown = (dropdownId) => {
    // Expand the desktop sidebar before opening a submenu.
    if (
      isCollapsedProp &&
      !isMobileOpen &&
      toggleSidebarProp
    ) {
      toggleSidebarProp();
      setOpenDropdown(dropdownId);
      return;
    }

    setOpenDropdown((previous) =>
      previous === dropdownId ? null : dropdownId
    );
  };

  const renderDropdown = (
    item,
    subItems,
    isActive
  ) => {
    const Icon = item.icon;
    const isOpen = openDropdown === item.id;
    const submenuId = `premium-submenu-${item.id}`;

    return (
      <li
        key={item.id}
        className={`premium-nav-dropdown ${
          isOpen ? "dropdown-open" : ""
        }`}
      >
        <button
          type="button"
          className={`premium-nav-link premium-dropdown-trigger ${
            isActive ? "is-active" : ""
          }`}
          onClick={() => toggleDropdown(item.id)}
          aria-expanded={showExpandedContent && isOpen}
          aria-controls={submenuId}
          title={
            !showExpandedContent
              ? item.label
              : undefined
          }
        >
          <span className="premium-nav-icon">
            <Icon />
          </span>

          {showExpandedContent && (
            <>
              <span className="premium-nav-text">
                {item.label}
              </span>

              <LuChevronDown
                className={`premium-dropdown-chevron ${
                  isOpen ? "rotated" : ""
                }`}
              />
            </>
          )}
        </button>

        {showExpandedContent && (
          <div
            id={submenuId}
            className={`premium-submenu-wrapper ${
              isOpen ? "expanded" : ""
            }`}
            aria-hidden={!isOpen}
          >
            <ul className="premium-submenu-list">
              {subItems.map((subItem) => {
                const SubIcon = subItem.icon;

                return (
                  <li key={subItem.id}>
                    <NavLink
                      to={subItem.path}
                      end
                      tabIndex={isOpen ? 0 : -1}
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
  };

  const renderNavItem = (item) => {
    if (item.type === "dropdown") {
      if (item.id === "blogs") {
        return renderDropdown(
          item,
          blogSubItems,
          isBlogRouteActive
        );
      }

      if (item.id === "shop-management") {
        return renderDropdown(
          item,
          shopSubItems,
          isShopRouteActive
        );
      }
    }

    const Icon = item.icon;

    return (
      <li key={item.path} className="premium-nav-item">
        <NavLink
          to={item.path}
          end
          onClick={handleItemClick}
          title={
            !showExpandedContent
              ? item.label
              : undefined
          }
          className={({ isActive }) =>
            `premium-nav-link ${
              isActive ? "is-active" : ""
            }`
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
        onClick={() =>
          setIsMobileOpen((previous) => !previous)
        }
        aria-label={
          isMobileOpen ? "Close menu" : "Open menu"
        }
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
            <div
              className="premium-nav-group"
              key={group.title}
            >
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

        {toggleSidebarProp && (
          <div className="premium-sidebar-footer">
            <button
              type="button"
              className="premium-collapse-button"
              onClick={toggleSidebarProp}
              aria-label={
                isCollapsedProp
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              title={
                isCollapsedProp
                  ? "Expand sidebar"
                  : "Collapse sidebar"
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