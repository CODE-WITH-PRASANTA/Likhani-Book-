import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import './Mainlayout.css';

const Mainlayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <Sidebar
        isCollapsedProp={isSidebarCollapsed}
        toggleSidebarProp={toggleSidebar}
      />

      {/* Main Area Workspace */}
      <div className={`layout-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <Topbar
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Dynamic Page Content */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Mainlayout;