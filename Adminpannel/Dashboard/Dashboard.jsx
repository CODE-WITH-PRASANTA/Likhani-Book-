import React, { useState } from 'react';
import './Dashboard.css';
import {
  FiBookOpen,
  FiUsers,
  FiShoppingCart,
  FiDollarSign,
  FiCalendar,
  FiPlusCircle,
  FiEdit3,
  FiTrash2,
  FiUserPlus,
  FiEye,
  FiTrendingUp,
  FiClock,
  FiBook,
  FiFilter,
  FiChevronDown
} from 'react-icons/fi';

const Dashboard = () => {
  // 1. Calendar Date State & Popover Toggle
  const [selectedDate, setSelectedDate] = useState('2026-09-09');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // 2. Sales Overview Filter State & Dynamic Datasets
  const [salesTimeframe, setSalesTimeframe] = useState('Monthly');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const salesData = {
    Monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      points: [
        { x: 50, y: 150, val: 50 },
        { x: 125, y: 125, val: 100 },
        { x: 200, y: 105, val: 125 },
        { x: 275, y: 130, val: 90 },
        { x: 350, y: 75, val: 160 },
        { x: 450, y: 25, val: 210 }
      ],
      path: 'M 50,150 L 125,125 L 200,105 L 275,130 L 350,75 L 450,25',
      fillPath: 'M 50,150 L 125,125 L 200,105 L 275,130 L 350,75 L 450,25 L 450,170 L 50,170 Z'
    },
    Weekly: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      points: [
        { x: 50, y: 140, val: 60 },
        { x: 125, y: 90, val: 140 },
        { x: 200, y: 110, val: 110 },
        { x: 275, y: 60, val: 180 },
        { x: 350, y: 40, val: 200 },
        { x: 450, y: 80, val: 150 }
      ],
      path: 'M 50,140 L 125,90 L 200,110 L 275,60 L 350,40 L 450,80',
      fillPath: 'M 50,140 L 125,90 L 200,110 L 275,60 L 350,40 L 450,80 L 450,170 L 50,170 Z'
    },
    Yearly: {
      labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
      points: [
        { x: 50, y: 160, val: 300 },
        { x: 125, y: 130, val: 650 },
        { x: 200, y: 100, val: 950 },
        { x: 275, y: 70, val: 1400 },
        { x: 350, y: 45, val: 1850 },
        { x: 450, y: 20, val: 2400 }
      ],
      path: 'M 50,160 L 125,130 L 200,100 L 275,70 L 350,45 L 450,20',
      fillPath: 'M 50,160 L 125,130 L 200,100 L 275,70 L 350,45 L 450,20 L 450,170 L 50,170 Z'
    }
  };

  // 3. Category Filter State & Interactive Category Selection
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { name: 'Fiction', count: 42, color: '#3B82F6', dash: '90 150', offset: '0' },
    { name: 'Non-Fiction', count: 28, color: '#10B981', dash: '60 180', offset: '-90' },
    { name: 'Academic', count: 20, color: '#F59E0B', dash: '40 200', offset: '-150' },
    { name: 'Kids', count: 16, color: '#EF4444', dash: '30 210', offset: '-190' },
    { name: 'Self Help', count: 10, color: '#8B5CF6', dash: '20 220', offset: '-220' },
    { name: 'Others', count: 8, color: '#9CA3AF', dash: '15 225', offset: '-240' }
  ];

  // Stat Card Data
  const stats = [
    {
      title: 'Total Books',
      count: '124',
      change: '+12%',
      isPositive: true,
      icon: <FiBookOpen />,
      color: 'blue'
    },
    {
      title: 'Total Users',
      count: '856',
      change: '+8%',
      isPositive: true,
      icon: <FiUsers />,
      color: 'green'
    },
    {
      title: 'Total Orders',
      count: '342',
      change: '+15%',
      isPositive: true,
      icon: <FiShoppingCart />,
      color: 'purple'
    },
    {
      title: 'Total Revenue',
      count: '₹ 1,28,450',
      change: '+22%',
      isPositive: true,
      icon: <FiDollarSign />,
      color: 'orange'
    }
  ];

  // Books State
  const [books, setBooks] = useState([
    {
      id: 1,
      title: 'Atomic Habits',
      author: 'James Clear',
      category: 'Self Help',
      price: '₹ 499',
      stock: 25,
      status: 'Published',
      cover: 'https://m.media-amazon.com/images/I/81YkqyaFVEL._AC_UF1000,1000_QL80_.jpg'
    },
    {
      id: 2,
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      category: 'Fiction',
      price: '₹ 399',
      stock: 40,
      status: 'Published',
      cover: 'https://m.media-amazon.com/images/I/71aFt4+OTOL._AC_UF1000,1000_QL80_.jpg'
    },
    {
      id: 3,
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'Academic',
      price: '₹ 599',
      stock: 18,
      status: 'Published',
      cover: 'https://m.media-amazon.com/images/I/51E2055ZGUL._AC_UF1000,1000_QL80_.jpg'
    },
    {
      id: 4,
      title: 'Think Like a Monk',
      author: 'Jay Shetty',
      category: 'Self Help',
      price: '₹ 349',
      stock: 30,
      status: 'Published',
      cover: 'https://m.media-amazon.com/images/I/71g2ednj0JL._AC_UF1000,1000_QL80_.jpg'
    },
    {
      id: 5,
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      category: 'Fiction',
      price: '₹ 450',
      stock: 22,
      status: 'Published',
      cover: 'https://m.media-amazon.com/images/I/712cDO7d73L._AC_UF1000,1000_QL80_.jpg'
    }
  ]);

  // Filter books based on category selected
  const filteredBooks = selectedCategory === 'All'
    ? books
    : books.filter(b => b.category.toLowerCase() === selectedCategory.toLowerCase());

  // Recent Orders State
  const recentOrders = [
    { id: '#1024', customer: 'Rahul Sharma', booksCount: 2, amount: '₹ 897', status: 'Pending' },
    { id: '#1023', customer: 'Priya Singh', booksCount: 1, amount: '₹ 499', status: 'Processing' },
    { id: '#1022', customer: 'Amit Kumar', booksCount: 3, amount: '₹ 1,497', status: 'Shipped' },
    { id: '#1021', customer: 'Neha Verma', booksCount: 1, amount: '₹ 399', status: 'Delivered' },
    { id: '#1020', customer: 'Sohan Lal', booksCount: 2, amount: '₹ 1,098', status: 'Delivered' }
  ];

  // Activities
  const activities = [
    {
      id: 1,
      type: 'order',
      text: 'New order #1024 placed by Rahul Sharma',
      time: '2 hours ago',
      icon: <FiShoppingCart />,
      color: 'blue'
    },
    {
      id: 2,
      type: 'user',
      text: 'New user registered: Neha Verma',
      time: '4 hours ago',
      icon: <FiUsers />,
      color: 'green'
    },
    {
      id: 3,
      type: 'book',
      text: 'Book "Think Like a Monk" updated',
      time: '6 hours ago',
      icon: <FiBook />,
      color: 'purple'
    },
    {
      id: 4,
      type: 'order',
      text: 'New order #1023 placed by Priya Singh',
      time: '8 hours ago',
      icon: <FiShoppingCart />,
      color: 'blue'
    }
  ];

  const handleDeleteBook = (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      setBooks(books.filter((book) => book.id !== id));
    }
  };

  const handleEditBook = (title) => {
    alert(`Editing book: ${title}`);
  };

  const handleQuickAction = (actionName) => {
    alert(`Action clicked: ${actionName}`);
  };

  const currentChart = salesData[salesTimeframe];

  return (
    <div className="Dashboard">
      {/* Top Header with Interactive Calendar Picker */}
      <div className="Dashboard-header">
        <div>
          <h1 className="Dashboard-title">Dashboard</h1>
          <p className="Dashboard-subtitle">
            Welcome back! Here's what's happening with your book store.
          </p>
        </div>

        {/* Interactive Calendar Popover */}
        <div className="Dashboard-datePickerWrapper">
          <button
            type="button"
            className="Dashboard-dateBadge"
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
          >
            <FiCalendar className="Dashboard-dateIcon" />
            <span>{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <FiChevronDown className="Dashboard-dateChevron" />
          </button>

          {isDatePickerOpen && (
            <div className="Dashboard-dateDropdown">
              <label htmlFor="dashboard-date">Select Date Filter:</label>
              <input
                type="date"
                id="dashboard-date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setIsDatePickerOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="Dashboard-statsGrid">
        {stats.map((stat, idx) => (
          <div key={idx} className="Dashboard-statCard">
            <div className="Dashboard-statHeader">
              <div className={`Dashboard-statIcon Dashboard-statIcon--${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="Dashboard-statBody">
              <span className="Dashboard-statTitle">{stat.title}</span>
              <h2 className="Dashboard-statCount">{stat.count}</h2>
              <span className="Dashboard-statChange">
                <FiTrendingUp className="Dashboard-trendIcon" />
                {stat.change} <span className="Dashboard-statSub">from last month</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="Dashboard-mainGrid">
        {/* Left Column (Charts & Book List) */}
        <div className="Dashboard-leftCol">
          {/* Sales Overview + Category Breakdown Row */}
          <div className="Dashboard-chartsRow">
            {/* Dynamic Interactive Sales Overview Chart */}
            <div className="Dashboard-card Dashboard-salesCard">
              <div className="Dashboard-cardHeader">
                <div>
                  <h3 className="Dashboard-cardTitle">Sales Overview</h3>
                  <p className="Dashboard-cardSubtitle">{salesTimeframe} order breakdown</p>
                </div>
                {/* Timeframe Filter Buttons */}
                <div className="Dashboard-timeframeSelector">
                  {['Weekly', 'Monthly', 'Yearly'].map((tf) => (
                    <button
                      key={tf}
                      className={`Dashboard-timeframeBtn ${salesTimeframe === tf ? 'active' : ''}`}
                      onClick={() => setSalesTimeframe(tf)}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="Dashboard-chartContainer">
                <svg className="Dashboard-svgChart" viewBox="0 0 500 200">
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#E5E7EB" strokeDasharray="3 3" />
                  <line x1="40" y1="60" x2="480" y2="60" stroke="#E5E7EB" strokeDasharray="3 3" />
                  <line x1="40" y1="100" x2="480" y2="100" stroke="#E5E7EB" strokeDasharray="3 3" />
                  <line x1="40" y1="140" x2="480" y2="140" stroke="#E5E7EB" strokeDasharray="3 3" />

                  {/* Y Axis Labels */}
                  <text x="10" y="25" className="Dashboard-chartAxisText">200</text>
                  <text x="10" y="65" className="Dashboard-chartAxisText">150</text>
                  <text x="10" y="105" className="Dashboard-chartAxisText">100</text>
                  <text x="15" y="145" className="Dashboard-chartAxisText">50</text>
                  <text x="22" y="180" className="Dashboard-chartAxisText">0</text>

                  {/* Dynamic Area Fill & Path */}
                  <path d={currentChart.fillPath} fill="url(#salesGrad)" />
                  <path
                    d={currentChart.path}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Interactive Hover Data Dots */}
                  {currentChart.points.map((pt, idx) => (
                    <g key={idx}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredPoint === idx ? '6' : '4'}
                        fill="#3B82F6"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="Dashboard-chartDot"
                        onMouseEnter={() => setHoveredPoint(idx)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      {/* Tooltip on hover */}
                      {hoveredPoint === idx && (
                        <g>
                          <rect
                            x={pt.x - 25}
                            y={pt.y - 30}
                            width="50"
                            height="22"
                            rx="4"
                            fill="#1E293B"
                          />
                          <text
                            x={pt.x}
                            y={pt.y - 15}
                            fill="#ffffff"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {pt.val} orders
                          </text>
                        </g>
                      )}
                    </g>
                  ))}

                  {/* Dynamic X Axis Labels */}
                  {currentChart.labels.map((label, idx) => {
                    const xPositions = [42, 117, 190, 267, 340, 442];
                    return (
                      <text key={idx} x={xPositions[idx]} y="192" className="Dashboard-chartAxisText">
                        {label}
                      </text>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Books by Category Donut Chart with Category Interactivity */}
            <div className="Dashboard-card Dashboard-categoryCard">
              <div className="Dashboard-cardHeader">
                <h3 className="Dashboard-cardTitle">Books by Category</h3>
                {selectedCategory !== 'All' && (
                  <button
                    className="Dashboard-resetFilterBtn"
                    onClick={() => setSelectedCategory('All')}
                  >
                    Reset Filter
                  </button>
                )}
              </div>
              <div className="Dashboard-categoryBody">
                {/* SVG Donut Chart */}
                <div className="Dashboard-donutWrapper">
                  <svg viewBox="0 0 100 100" className="Dashboard-donutSvg">
                    {categories.map((cat) => (
                      <circle
                        key={cat.name}
                        cx="50"
                        cy="50"
                        r="38"
                        stroke={cat.color}
                        strokeWidth={selectedCategory === cat.name ? "15" : "12"}
                        fill="none"
                        strokeDasharray={cat.dash}
                        strokeDashoffset={cat.offset}
                        className={`Dashboard-donutSegment ${selectedCategory === cat.name ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.name)}
                      />
                    ))}
                  </svg>
                  <div className="Dashboard-donutCenter">
                    <span className="Dashboard-donutCount">
                      {selectedCategory === 'All'
                        ? 124
                        : categories.find(c => c.name === selectedCategory)?.count || 0}
                    </span>
                    <span className="Dashboard-donutLabel">
                      {selectedCategory === 'All' ? 'Total Books' : selectedCategory}
                    </span>
                  </div>
                </div>

                {/* Legend List with Filter Actions */}
                <div className="Dashboard-categoryLegend">
                  {categories.map((cat, idx) => (
                    <div
                      key={idx}
                      className={`Dashboard-legendItem ${selectedCategory === cat.name ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(selectedCategory === cat.name ? 'All' : cat.name)}
                      title={`Filter table by ${cat.name}`}
                    >
                      <div className="Dashboard-legendLeft">
                        <span className="Dashboard-legendDot" style={{ backgroundColor: cat.color }}></span>
                        <span className="Dashboard-legendName">{cat.name}</span>
                      </div>
                      <span className="Dashboard-legendVal">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Books Table (Filtered dynamically by Category) */}
          <div className="Dashboard-card Dashboard-booksCard">
            <div className="Dashboard-cardHeader">
              <div>
                <h3 className="Dashboard-cardTitle">
                  Recent Books {selectedCategory !== 'All' && `(${selectedCategory})`}
                </h3>
              </div>
              <button className="Dashboard-viewAllBtn" onClick={() => handleQuickAction('View All Books')}>
                View All
              </button>
            </div>
            <div className="Dashboard-tableResponsive">
              <table className="Dashboard-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Book Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th className="Dashboard-alignRight">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.length > 0 ? (
                    filteredBooks.map((book, index) => (
                      <tr key={book.id}>
                        <td className="Dashboard-textMuted">{index + 1}</td>
                        <td>
                          <div className="Dashboard-bookTitleCell">
                            <img src={book.cover} alt={book.title} className="Dashboard-bookCover" />
                            <span className="Dashboard-bookTitle">{book.title}</span>
                          </div>
                        </td>
                        <td className="Dashboard-textMuted">{book.author}</td>
                        <td className="Dashboard-textMuted">{book.category}</td>
                        <td className="Dashboard-fontMedium">{book.price}</td>
                        <td className="Dashboard-textMuted">{book.stock}</td>
                        <td>
                          <span className="Dashboard-statusBadge Dashboard-statusPublished">
                            {book.status}
                          </span>
                        </td>
                        <td className="Dashboard-alignRight">
                          <div className="Dashboard-actionBtns">
                            <button
                              className="Dashboard-actionBtn Dashboard-editBtn"
                              onClick={() => handleEditBook(book.title)}
                              title="Edit Book"
                            >
                              <FiEdit3 />
                            </button>
                            <button
                              className="Dashboard-actionBtn Dashboard-deleteBtn"
                              onClick={() => handleDeleteBook(book.id)}
                              title="Delete Book"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                        No books found in <strong>{selectedCategory}</strong> category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Quick Actions, Recent Orders, Recent Activity) */}
        <div className="Dashboard-rightCol">
          {/* Quick Actions */}
          <div className="Dashboard-card Dashboard-quickActionsCard">
            <div className="Dashboard-cardHeader">
              <h3 className="Dashboard-cardTitle">Quick Actions</h3>
            </div>
            <div className="Dashboard-actionGrid">
              <button
                className="Dashboard-quickBtn Dashboard-quickBtn--blue"
                onClick={() => handleQuickAction('Add New Book')}
              >
                <FiPlusCircle className="Dashboard-quickIcon" />
                <span>Add New Book</span>
              </button>
              <button
                className="Dashboard-quickBtn Dashboard-quickBtn--green"
                onClick={() => handleQuickAction('Manage Orders')}
              >
                <FiShoppingCart className="Dashboard-quickIcon" />
                <span>Manage Orders</span>
              </button>
              <button
                className="Dashboard-quickBtn Dashboard-quickBtn--purple"
                onClick={() => handleQuickAction('Add Author')}
              >
                <FiUserPlus className="Dashboard-quickIcon" />
                <span>Add Author</span>
              </button>
              <button
                className="Dashboard-quickBtn Dashboard-quickBtn--orange"
                onClick={() => handleQuickAction('View Users')}
              >
                <FiEye className="Dashboard-quickIcon" />
                <span>View Users</span>
              </button>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="Dashboard-card Dashboard-ordersCard">
            <div className="Dashboard-cardHeader">
              <h3 className="Dashboard-cardTitle">Recent Orders</h3>
              <button className="Dashboard-viewAllBtn" onClick={() => handleQuickAction('View All Orders')}>
                View All
              </button>
            </div>
            <div className="Dashboard-tableResponsive">
              <table className="Dashboard-table Dashboard-tableCompact">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Book(s)</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, idx) => (
                    <tr key={idx}>
                      <td className="Dashboard-fontMedium">{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.booksCount}</td>
                      <td className="Dashboard-fontMedium">{order.amount}</td>
                      <td>
                        <span
                          className={`Dashboard-orderStatus Dashboard-orderStatus--${order.status.toLowerCase()}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="Dashboard-card Dashboard-activityCard">
            <div className="Dashboard-cardHeader">
              <h3 className="Dashboard-cardTitle">Recent Activity</h3>
              <button className="Dashboard-viewAllBtn" onClick={() => handleQuickAction('View All Activities')}>
                View All
              </button>
            </div>
            <div className="Dashboard-activityList">
              {activities.map((act) => (
                <div key={act.id} className="Dashboard-activityItem">
                  <div className={`Dashboard-actIcon Dashboard-actIcon--${act.color}`}>
                    {act.icon}
                  </div>
                  <div className="Dashboard-actContent">
                    <p className="Dashboard-actText">{act.text}</p>
                    <span className="Dashboard-actTime">
                      <FiClock className="Dashboard-clockIcon" /> {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;