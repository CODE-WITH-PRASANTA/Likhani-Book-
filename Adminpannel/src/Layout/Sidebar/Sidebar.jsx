import React from 'react';
import './Sidebar.css';

const navItems = [
  { id: 1, name: 'Home', icon: '🏠' },
  { id: 2, name: 'Discover', icon: '🔍' },
  { id: 3, name: 'My Library', icon: '📚' },
  { id: 4, name: 'Favorites', icon: '❤️' },
];

const categories = [
  { id: 1, name: 'Fiction', count: 124 },
  { id: 2, name: 'Non-Fiction', count: 85 },
  { id: 3, name: 'Sci-Fi & Fantasy', count: 62 },
  { id: 4, name: 'Biography', count: 41 },
  { id: 5, name: 'Self-Help', count: 95 },
  { id: 6, name: 'History', count: 38 },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>📖 BookHaven</h2>
      </div>

      <nav className="sidebar-section">
        <span className="section-title">MENU</span>
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.id} className="nav-item">
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-name">{item.name}</span>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-section">
        <span className="section-title">CATEGORIES</span>
        <ul className="category-list">
          {categories.map((cat) => (
            <li key={cat.id} className="category-item">
              <span>{cat.name}</span>
              <span className="category-badge">{cat.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;