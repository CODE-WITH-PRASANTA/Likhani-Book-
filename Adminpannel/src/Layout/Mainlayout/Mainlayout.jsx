import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import './Mainlayout.css';

const Mainlayout = ({ children }) => {
  return (
    <div className="layout-container">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="layout-main">
        {/* Fixed or Sticky Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="content-area">
          {children || (
            <div className="placeholder-content">
              <h1>Welcome to BookHaven</h1>
              <p>Select a book or category to start reading!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Mainlayout;