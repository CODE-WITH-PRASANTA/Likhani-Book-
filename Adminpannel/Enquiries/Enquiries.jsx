import React, { useState, useMemo } from 'react';
import './Enquiries.css';
import {
  FiMessageSquare,
  FiMail,
  FiClock,
  FiCheckCircle,
  FiDownload,
  FiSearch,
  FiCalendar,
  FiFilter,
  FiEye,
  FiCornerUpLeft,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX
} from 'react-icons/fi';

const initialEnquiriesData = [
  {
    id: 1,
    name: 'Rohan Mehta',
    email: 'rohan@gmail.com',
    phone: '+91 9876543210',
    type: 'Book Information',
    subject: 'Availability of Book',
    message: 'Is Castle The Sky available in hardcover?',
    date: 'Sep 10, 2024',
    time: '10:15 AM',
    rawDate: '2024-09-10',
    status: 'New'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya@gmail.com',
    phone: '+91 9123456780',
    type: 'Order Related',
    subject: 'Order Status',
    message: 'Can you tell me the status of my order #1234?',
    date: 'Sep 09, 2024',
    time: '04:20 PM',
    rawDate: '2024-09-09',
    status: 'In Progress'
  },
  {
    id: 3,
    name: 'Amit Kumar',
    email: 'amit@gmail.com',
    phone: '+91 9988776655',
    type: 'Price Query',
    subject: 'Discount on Bulk Order',
    message: 'Do you offer any discount for bulk purchase?',
    date: 'Sep 09, 2024',
    time: '12:05 PM',
    rawDate: '2024-09-09',
    status: 'New'
  },
  {
    id: 4,
    name: 'Sneha Patil',
    email: 'sneha@gmail.com',
    phone: '+91 8877665544',
    type: 'Product Suggestion',
    subject: 'Book Recommendation',
    message: 'Suggest some good books for children aged 10-12.',
    date: 'Sep 08, 2024',
    time: '03:45 PM',
    rawDate: '2024-09-08',
    status: 'Closed'
  },
  {
    id: 5,
    name: 'David John',
    email: 'david@gmail.com',
    phone: '+91 7766554433',
    type: 'Shipping',
    subject: 'Delivery Time',
    message: 'How long will it take to deliver to Mumbai?',
    date: 'Sep 08, 2024',
    time: '11:30 AM',
    rawDate: '2024-09-08',
    status: 'In Progress'
  },
  {
    id: 6,
    name: 'Neha Verma',
    email: 'neha@gmail.com',
    phone: '+91 7654321098',
    type: 'Return & Refund',
    subject: 'Return Policy',
    message: 'What is your return policy for books?',
    date: 'Sep 07, 2024',
    time: '05:10 PM',
    rawDate: '2024-09-07',
    status: 'New'
  },
  {
    id: 7,
    name: 'Arjun Rao',
    email: 'arjun@gmail.com',
    phone: '+91 7012345678',
    type: 'Payment Issue',
    subject: 'Payment Failed',
    message: 'My payment was failed but amount is deducted.',
    date: 'Sep 06, 2024',
    time: '02:25 PM',
    rawDate: '2024-09-06',
    status: 'In Progress'
  },
  {
    id: 8,
    name: 'Pooja Singh',
    email: 'pooja@gmail.com',
    phone: '+91 8123456789',
    type: 'Book Information',
    subject: 'ISBN Details',
    message: 'Can you share the ISBN for The Alchemist?',
    date: 'Sep 06, 2024',
    time: '10:40 AM',
    rawDate: '2024-09-06',
    status: 'New'
  },
  {
    id: 9,
    name: 'Karan Malhotra',
    email: 'karan@gmail.com',
    phone: '+91 9001234567',
    type: 'Other',
    subject: 'Gift Wrapping',
    message: 'Do you provide gift wrapping service?',
    date: 'Sep 05, 2024',
    time: '04:15 PM',
    rawDate: '2024-09-05',
    status: 'Closed'
  },
  {
    id: 10,
    name: 'Lisa Brown',
    email: 'lisa@gmail.com',
    phone: '+91 9988112233',
    type: 'Product Suggestion',
    subject: 'Best Selling Books',
    message: 'What are the current best selling books?',
    date: 'Sep 04, 2024',
    time: '11:05 AM',
    rawDate: '2024-09-04',
    status: 'New'
  },
  {
    id: 11,
    name: 'Vikram Sethi',
    email: 'vikram@gmail.com',
    phone: '+91 9811223344',
    type: 'Order Related',
    subject: 'Cancellation Request',
    message: 'I want to cancel my recent order.',
    date: 'Sep 03, 2024',
    time: '09:00 AM',
    rawDate: '2024-09-03',
    status: 'New'
  },
  {
    id: 12,
    name: 'Ananya Roy',
    email: 'ananya@gmail.com',
    phone: '+91 9722334455',
    type: 'Shipping',
    subject: 'Express Delivery',
    message: 'Is express delivery available for Bangalore?',
    date: 'Sep 02, 2024',
    time: '01:15 PM',
    rawDate: '2024-09-02',
    status: 'Closed'
  }
];

const Enquiries = () => {
  // Main Data States
  const [enquiries, setEnquiries] = useState(initialEnquiriesData);
  const [selectedIds, setSelectedIds] = useState([]);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRangeFilter, setDateRangeFilter] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Optimized for full visibility without overflow

  // Modal States
  const [viewModalData, setViewModalData] = useState(null);
  const [replyModalData, setReplyModalData] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('');

  // Compute Summary Statistics dynamically
  const stats = useMemo(() => {
    return {
      total: enquiries.length,
      newCount: enquiries.filter((e) => e.status === 'New').length,
      inProgressCount: enquiries.filter((e) => e.status === 'In Progress').length,
      closedCount: enquiries.filter((e) => e.status === 'Closed').length
    };
  }, [enquiries]);

  // Filtered Enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'All' || item.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesDate = !dateRangeFilter || item.rawDate === dateRangeFilter;

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [enquiries, searchQuery, typeFilter, statusFilter, dateRangeFilter]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage) || 1;
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEnquiries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEnquiries, currentPage, itemsPerPage]);

  // Select All Checkbox Handler
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(currentItems.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Individual Row Checkbox Handler
  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Delete Action
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      setEnquiries((prev) => prev.filter((item) => item.id !== id));
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('All');
    setStatusFilter('All');
    setDateRangeFilter('');
    setCurrentPage(1);
  };

  // CSV Export Functionality
  const handleExportCSV = () => {
    const headers = ['#', 'Name', 'Email', 'Phone', 'Type', 'Subject', 'Message', 'Date', 'Time', 'Status'];
    const rows = filteredEnquiries.map((item, index) => [
      index + 1,
      `"${item.name}"`,
      `"${item.email}"`,
      `"${item.phone}"`,
      `"${item.type}"`,
      `"${item.subject}"`,
      `"${item.message}"`,
      `"${item.date}"`,
      `"${item.time}"`,
      `"${item.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `enquiries_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper Badge Class for Enquiry Types
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'Book Information':
        return 'Enquiries-typeBadge--bookInfo';
      case 'Order Related':
        return 'Enquiries-typeBadge--order';
      case 'Price Query':
        return 'Enquiries-typeBadge--price';
      case 'Product Suggestion':
        return 'Enquiries-typeBadge--product';
      case 'Shipping':
        return 'Enquiries-typeBadge--shipping';
      case 'Return & Refund':
        return 'Enquiries-typeBadge--refund';
      case 'Payment Issue':
        return 'Enquiries-typeBadge--payment';
      default:
        return 'Enquiries-typeBadge--other';
    }
  };

  // Helper Status Badge Class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'New':
        return 'Enquiries-statusBadge--new';
      case 'In Progress':
        return 'Enquiries-statusBadge--inProgress';
      case 'Closed':
        return 'Enquiries-statusBadge--closed';
      default:
        return '';
    }
  };

  // Modal Submit (Reply/Status Update)
  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyModalData) return;

    setEnquiries((prev) =>
      prev.map((item) => (item.id === replyModalData.id ? { ...item, status: updatedStatus } : item))
    );

    alert(`Reply sent to ${replyModalData.email} and status updated to "${updatedStatus}"!`);
    setReplyModalData(null);
    setReplyMessage('');
  };

  return (
    <div className="Enquiries">
      {/* Page Top Header */}
      <div className="Enquiries-header">
        <div>
          <div className="Enquiries-titleRow">
            <div className="Enquiries-iconWrapper">
              <FiMessageSquare className="Enquiries-headerTitleIcon" />
            </div>
            <h1 className="Enquiries-title">Customer Enquiries</h1>
          </div>
          <p className="Enquiries-subtitle">
            Manage, respond to, and keep track of inquiries across your bookstore platform.
          </p>
        </div>
        <button className="Enquiries-exportBtn" onClick={handleExportCSV}>
          <FiDownload className="Enquiries-btnIcon" /> Export CSV
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="Enquiries-statsGrid">
        <div className="Enquiries-statCard Enquiries-statCard--blue">
          <div className="Enquiries-statIcon">
            <FiMessageSquare />
          </div>
          <div>
            <div className="Enquiries-statCount">{stats.total}</div>
            <div className="Enquiries-statLabel">Total Enquiries</div>
          </div>
        </div>

        <div className="Enquiries-statCard Enquiries-statCard--green">
          <div className="Enquiries-statIcon">
            <FiMail />
          </div>
          <div>
            <div className="Enquiries-statCount">{stats.newCount}</div>
            <div className="Enquiries-statLabel">New Enquiries</div>
          </div>
        </div>

        <div className="Enquiries-statCard Enquiries-statCard--orange">
          <div className="Enquiries-statIcon">
            <FiClock />
          </div>
          <div>
            <div className="Enquiries-statCount">{stats.inProgressCount}</div>
            <div className="Enquiries-statLabel">In Progress</div>
          </div>
        </div>

        <div className="Enquiries-statCard Enquiries-statCard--red">
          <div className="Enquiries-statIcon">
            <FiCheckCircle />
          </div>
          <div>
            <div className="Enquiries-statCount">{stats.closedCount}</div>
            <div className="Enquiries-statLabel">Closed</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="Enquiries-filterCard">
        <div className="Enquiries-searchGroup">
          <FiSearch className="Enquiries-searchIcon" />
          <input
            type="text"
            className="Enquiries-searchInput"
            placeholder="Search by customer, email, subject..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="Enquiries-filterControls">
          <div className="Enquiries-controlGroup">
            <label className="Enquiries-controlLabel">Enquiry Type</label>
            <select
              className="Enquiries-selectInput"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Types</option>
              <option value="Book Information">Book Information</option>
              <option value="Order Related">Order Related</option>
              <option value="Price Query">Price Query</option>
              <option value="Product Suggestion">Product Suggestion</option>
              <option value="Shipping">Shipping</option>
              <option value="Return & Refund">Return & Refund</option>
              <option value="Payment Issue">Payment Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="Enquiries-controlGroup">
            <label className="Enquiries-controlLabel">Status</label>
            <select
              className="Enquiries-selectInput"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="Enquiries-controlGroup">
            <label className="Enquiries-controlLabel">Date Range</label>
            <div className="Enquiries-dateInputWrapper">
              <FiCalendar className="Enquiries-dateIcon" />
              <input
                type="date"
                className="Enquiries-dateInput"
                value={dateRangeFilter}
                onChange={(e) => {
                  setDateRangeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <button className="Enquiries-resetBtn" onClick={handleResetFilters} title="Reset all filters">
            <FiFilter className="Enquiries-btnIcon" /> Reset
          </button>
        </div>
      </div>

      {/* Main Enquiries Table Card */}
      <div className="Enquiries-tableCard">
        <div className="Enquiries-tableResponsive">
          <table className="Enquiries-table">
            <thead>
              <tr>
                <th style={{ width: '38px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    className="Enquiries-checkbox"
                    checked={
                      currentItems.length > 0 &&
                      currentItems.every((item) => selectedIds.includes(item.id))
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ width: '45px' }}>#</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Message Preview</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'center', width: '110px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, idx) => (
                  <tr key={item.id} className={selectedIds.includes(item.id) ? 'Enquiries-rowSelected' : ''}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        className="Enquiries-checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectRow(item.id)}
                      />
                    </td>
                    <td className="Enquiries-textMuted">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="Enquiries-fontBold">{item.name}</td>
                    <td className="Enquiries-textMuted">{item.email}</td>
                    <td className="Enquiries-textMuted">{item.phone}</td>
                    <td>
                      <span className={`Enquiries-typeBadge ${getTypeBadgeClass(item.type)}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="Enquiries-fontMedium">{item.subject}</td>
                    <td className="Enquiries-messageCell" title={item.message}>
                      {item.message}
                    </td>
                    <td>
                      <div className="Enquiries-dateCell">
                        <span>{item.date}</span>
                        <span className="Enquiries-timeText">{item.time}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`Enquiries-statusBadge ${getStatusBadgeClass(item.status)}`}>
                        <span className="Enquiries-statusDot"></span>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="Enquiries-actionGroup">
                        <button
                          className="Enquiries-actionBtn Enquiries-actionBtn--view"
                          title="View Details"
                          onClick={() => setViewModalData(item)}
                        >
                          <FiEye />
                        </button>
                        <button
                          className="Enquiries-actionBtn Enquiries-actionBtn--reply"
                          title="Reply / Change Status"
                          onClick={() => {
                            setReplyModalData(item);
                            setUpdatedStatus(item.status);
                          }}
                        >
                          <FiCornerUpLeft />
                        </button>
                        <button
                          className="Enquiries-actionBtn Enquiries-actionBtn--delete"
                          title="Delete Enquiry"
                          onClick={() => handleDelete(item.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="Enquiries-emptyRow">
                    <p className="Enquiries-emptyText">No enquiries found matching your search criteria.</p>
                    <button className="Enquiries-inlineResetBtn" onClick={handleResetFilters}>
                      Clear Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="Enquiries-tableFooter">
          <div className="Enquiries-showingText">
            Showing{' '}
            <span>
              {filteredEnquiries.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}{' '}
              - {Math.min(currentPage * itemsPerPage, filteredEnquiries.length)}
            </span>{' '}
            of <span>{filteredEnquiries.length}</span> enquiries
          </div>

          <div className="Enquiries-pagination">
            <button
              className="Enquiries-pageBtn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <FiChevronLeft />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`Enquiries-pageBtn ${
                  currentPage === pageNum ? 'Enquiries-pageBtn--active' : ''
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              className="Enquiries-pageBtn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewModalData && (
        <div className="Enquiries-modalOverlay" onClick={() => setViewModalData(null)}>
          <div className="Enquiries-modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="Enquiries-modalHeader">
              <h3>Enquiry Details</h3>
              <button className="Enquiries-closeModalBtn" onClick={() => setViewModalData(null)}>
                <FiX />
              </button>
            </div>
            <div className="Enquiries-modalBody">
              <div className="Enquiries-modalGrid">
                <div className="Enquiries-modalDetailBox">
                  <span className="Enquiries-modalLabel">Customer Name</span>
                  <p className="Enquiries-modalVal">{viewModalData.name}</p>
                </div>
                <div className="Enquiries-modalDetailBox">
                  <span className="Enquiries-modalLabel">Email Address</span>
                  <p className="Enquiries-modalVal">{viewModalData.email}</p>
                </div>
                <div className="Enquiries-modalDetailBox">
                  <span className="Enquiries-modalLabel">Phone Number</span>
                  <p className="Enquiries-modalVal">{viewModalData.phone}</p>
                </div>
                <div className="Enquiries-modalDetailBox">
                  <span className="Enquiries-modalLabel">Enquiry Type</span>
                  <p className="Enquiries-modalVal">{viewModalData.type}</p>
                </div>
                <div className="Enquiries-modalDetailBox">
                  <span className="Enquiries-modalLabel">Date & Time</span>
                  <p className="Enquiries-modalVal">{viewModalData.date} at {viewModalData.time}</p>
                </div>
                <div className="Enquiries-modalDetailBox">
                  <span className="Enquiries-modalLabel">Current Status</span>
                  <p className="Enquiries-modalVal">{viewModalData.status}</p>
                </div>
              </div>
              <div className="Enquiries-modalMessage">
                <span className="Enquiries-modalLabel">Subject</span>
                <p className="Enquiries-subjectTxt">{viewModalData.subject}</p>
                <span className="Enquiries-modalLabel" style={{ marginTop: '12px', display: 'block' }}>
                  Full Message
                </span>
                <p className="Enquiries-msgTxt">{viewModalData.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPLY / EDIT STATUS MODAL */}
      {replyModalData && (
        <div className="Enquiries-modalOverlay" onClick={() => setReplyModalData(null)}>
          <div className="Enquiries-modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="Enquiries-modalHeader">
              <h3>Reply to {replyModalData.name}</h3>
              <button className="Enquiries-closeModalBtn" onClick={() => setReplyModalData(null)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleReplySubmit} className="Enquiries-modalBody">
              <div className="Enquiries-formGroup">
                <label className="Enquiries-formLabel">Update Status</label>
                <select
                  className="Enquiries-selectInput"
                  value={updatedStatus}
                  onChange={(e) => setUpdatedStatus(e.target.value)}
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="Enquiries-formGroup">
                <label className="Enquiries-formLabel">Reply Message</label>
                <textarea
                  className="Enquiries-textarea"
                  rows="4"
                  placeholder="Type your official response to the customer..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="Enquiries-modalFooter">
                <button
                  type="button"
                  className="Enquiries-cancelBtn"
                  onClick={() => setReplyModalData(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="Enquiries-submitBtn">
                  Send Response & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enquiries;