import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import './Mainlayout.css';

const Mainlayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="layout-container">
      {/* Sidebar Navigation */}
      <Sidebar isCollapsed={isSidebarCollapsed} />

      {/* Main Area Workspace */}
      <div className="layout-main">
        {/* Pass state and toggle function to Topbar */}
        <Topbar onToggleSidebar={toggleSidebar} />

        {/* Dynamic Page Content */}
        <main className="content-area">
          {children || (
            <div className="placeholder-card">
              <h1>Welcome to Likhani Books</h1>
              <p>Select a book or category to start managing your store!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Mainlayout;