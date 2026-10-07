import React, { useState } from 'react';
import './TestimonialManagement.css';
import { 
  FaPlus, FaSearch, FaList, FaThLarge, FaEye, FaPencilAlt, 
  FaTrashAlt, FaSave, FaUndo, FaStar, FaRegStar, 
  FaImage, FaUser, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';

const initialTestimonials = [
  {
    id: 1,
    clientName: 'Ronald Richards',
    designation: 'Marketing Coordinator',
    company: 'Envato',
    logo: 'https://via.placeholder.com/40',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    rating: 4,
    message: 'One of the most powerful takeaways...',
    status: 'Active',
    accentColor: '#f97316'
  },
  {
    id: 2,
    clientName: 'Dianne Russell',
    designation: 'Project Manager',
    company: 'Amazon',
    logo: 'https://via.placeholder.com/40',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    message: 'The idea that we can choose to see...',
    status: 'Active',
    accentColor: '#3b82f6'
  },
  {
    id: 3,
    clientName: 'Jenny Wilson',
    designation: 'Product Designer',
    company: 'Google',
    logo: 'https://via.placeholder.com/40',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    rating: 4,
    message: 'This book changed my perspective...',
    status: 'Active',
    accentColor: '#10b981'
  },
  {
    id: 4,
    clientName: 'Albert Flores',
    designation: 'CEO',
    company: 'Meta',
    logo: 'https://via.placeholder.com/40',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    rating: 4,
    message: 'A truly inspiring read that challenges...',
    status: 'Active',
    accentColor: '#1e293b'
  },
  {
    id: 5,
    clientName: 'Kristin Watson',
    designation: 'Marketing Head',
    company: 'Netflix',
    logo: 'https://via.placeholder.com/40',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    rating: 4,
    message: 'Practical insights and real-world examples...',
    status: 'Inactive',
    accentColor: '#6366f1'
  },
  {
    id: 6,
    clientName: 'Marvin McKinney',
    designation: 'Founder',
    company: 'Spotify',
    logo: 'https://via.placeholder.com/40',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    message: 'A must-read for anyone looking to grow...',
    status: 'Active',
    accentColor: '#10b981'
  },
  {
    id: 7,
    clientName: 'Courtenay Henry',
    designation: 'Team Lead',
    company: 'Apple',
    logo: 'https://via.placeholder.com/40',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    rating: 4,
    message: 'Simple yet powerful lessons for life...',
    status: 'Active',
    accentColor: '#f97316'
  },
  {
    id: 8,
    clientName: 'Jerome Bell',
    designation: 'Entrepreneur',
    company: 'Adobe',
    logo: 'https://via.placeholder.com/40',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    rating: 4,
    message: 'Helped me see opportunities in...',
    status: 'Active',
    accentColor: '#3b82f6'
  }
];

const availableColors = ['#1e293b', '#0284c7', '#f97316', '#6366f1', '#22c55e'];

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [viewingModalData, setViewingModalData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    designation: '',
    company: '',
    logo: null,
    profileImage: null,
    rating: 4,
    message: '',
    accentColor: '#f97316',
    status: 'Active'
  });

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Image Uploads
  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, [field]: imageUrl }));
    }
  };

  // Form Submission (Add or Edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.designation) {
      alert('Please fill out required fields!');
      return;
    }

    if (editingId) {
      setTestimonials(testimonials.map(item => 
        item.id === editingId ? { ...formData, id: editingId } : item
      ));
      setEditingId(null);
    } else {
      const newItem = {
        ...formData,
        id: Date.now(),
        profileImage: formData.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
      };
      setTestimonials([newItem, ...testimonials]);
    }
    handleReset();
  };

  // Edit Action
  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
  };

  // Delete Action
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      setTestimonials(testimonials.filter(item => item.id !== id));
      if (editingId === id) handleReset();
    }
  };

  // Reset Form
  const handleReset = () => {
    setEditingId(null);
    setFormData({
      clientName: '',
      designation: '',
      company: '',
      logo: null,
      profileImage: null,
      rating: 4,
      message: '',
      accentColor: '#f97316',
      status: 'Active'
    });
  };

  // Filtering Logic
  const filteredTestimonials = testimonials.filter(item => {
    const matchesSearch = item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="TestimonialManagement">
      {/* Header */}
      <header className="TestimonialManagement-header">
        <div>
          <h2>Testimonial Management</h2>
          <p>Add, edit or manage client testimonials</p>
        </div>
        <button className="TestimonialManagement-addBtn" onClick={handleReset}>
          <FaPlus /> Add New Testimonial
        </button>
      </header>

      {/* Main Content Area */}
      <div className="TestimonialManagement-container">
        {/* Left Panel - Form */}
        <div className="TestimonialManagement-card TestimonialManagement-formCard">
          <h3>{editingId ? 'Edit Testimonial' : 'Add / Edit Testimonial'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="TestimonialManagement-group">
              <label>Client Name <span>*</span></label>
              <input 
                type="text" 
                name="clientName" 
                placeholder="Enter client name" 
                value={formData.clientName} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className="TestimonialManagement-group">
              <label>Designation <span>*</span></label>
              <input 
                type="text" 
                name="designation" 
                placeholder="Enter designation (e.g. Marketing Coordinator)" 
                value={formData.designation} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className="TestimonialManagement-group">
              <label>Company / Logo</label>
              <input 
                type="text" 
                name="company" 
                placeholder="Enter company name (e.g. Envato, Amazon)" 
                value={formData.company} 
                onChange={handleInputChange} 
              />
            </div>

            {/* Logo Upload Dropzone */}
            <div className="TestimonialManagement-uploadBox">
              <input 
                type="file" 
                id="logoUpload" 
                accept="image/*" 
                onChange={(e) => handleImageUpload(e, 'logo')} 
                hidden 
              />
              <label htmlFor="logoUpload">
                <FaImage className="TestimonialManagement-uploadIcon" />
                <div>
                  <strong>{formData.logo ? 'Change Company Logo' : 'Upload Company Logo'}</strong>
                  <p>PNG, JPG, SVG (Max 2MB)</p>
                </div>
              </label>
            </div>

            {/* Profile Image Upload Dropzone */}
            <div className="TestimonialManagement-group">
              <label>Profile Image <span>*</span></label>
              <div className="TestimonialManagement-uploadBox">
                <input 
                  type="file" 
                  id="profileUpload" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'profileImage')} 
                  hidden 
                />
                <label htmlFor="profileUpload">
                  <FaUser className="TestimonialManagement-uploadIcon" />
                  <div>
                    <strong>{formData.profileImage ? 'Change Client Image' : 'Upload Client Image'}</strong>
                    <p>JPG, PNG (Max 2MB)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Rating */}
            <div className="TestimonialManagement-group">
              <label>Rating <span>*</span></label>
              <div className="TestimonialManagement-ratingSelect">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    style={{ cursor: 'pointer' }}
                  >
                    {star <= formData.rating ? (
                      <FaStar className="TestimonialManagement-star active" />
                    ) : (
                      <FaRegStar className="TestimonialManagement-star" />
                    )}
                  </span>
                ))}
                <span className="TestimonialManagement-ratingText">{formData.rating} out of 5</span>
              </div>
            </div>

            {/* Testimonial Message */}
            <div className="TestimonialManagement-group">
              <label>Testimonial Message <span>*</span></label>
              <textarea 
                rows="3" 
                name="message" 
                placeholder="Write client testimonial here..." 
                value={formData.message} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            {/* Color Accent Picker */}
            <div className="TestimonialManagement-group">
              <label>Triangle Color / Accent <span>*</span></label>
              <div className="TestimonialManagement-colorPicker">
                {availableColors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    className={`TestimonialManagement-colorDot ${formData.accentColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, accentColor: color }))}
                  />
                ))}
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="TestimonialManagement-formActions">
              <button type="button" className="TestimonialManagement-btnReset" onClick={handleReset}>
                <FaUndo /> Reset
              </button>
              <button type="submit" className="TestimonialManagement-btnSave">
                <FaSave /> {editingId ? 'Update Testimonial' : 'Save Testimonial'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel - Data Display */}
        <div className="TestimonialManagement-card TestimonialManagement-listCard">
          {/* Controls Bar */}
          <div className="TestimonialManagement-controls">
            <h3>All Testimonials ({filteredTestimonials.length})</h3>
            <div className="TestimonialManagement-viewToggle">
              <button 
                className={viewMode === 'list' ? 'active' : ''} 
                onClick={() => setViewMode('list')}
              >
                <FaList /> List View
              </button>
              <button 
                className={viewMode === 'grid' ? 'active' : ''} 
                onClick={() => setViewMode('grid')}
              >
                <FaThLarge /> Grid View
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="TestimonialManagement-filterBar">
            <div className="TestimonialManagement-searchBox">
              <FaSearch />
              <input 
                type="text" 
                placeholder="Search testimonials..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="TestimonialManagement-statusSelect"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* LIST VIEW */}
          {viewMode === 'list' ? (
            <div className="TestimonialManagement-tableWrapper">
              <table className="TestimonialManagement-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" /></th>
                    <th>#</th>
                    <th>Client</th>
                    <th>Message (Short)</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTestimonials.map((item, index) => (
                    <tr key={item.id}>
                      <td><input type="checkbox" /></td>
                      <td>{index + 1}</td>
                      <td>
                        <div className="TestimonialManagement-clientCell">
                          <img src={item.profileImage} alt={item.clientName} className="TestimonialManagement-avatar" />
                          <div>
                            <div className="TestimonialManagement-clientName">{item.clientName}</div>
                            <div className="TestimonialManagement-clientRole">{item.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td className="TestimonialManagement-msgCell">{item.message}</td>
                      <td>
                        <div className="TestimonialManagement-tableRating">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star}>
                              {star <= item.rating ? (
                                <FaStar className="TestimonialManagement-star active" />
                              ) : (
                                <FaRegStar className="TestimonialManagement-star" />
                              )}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`TestimonialManagement-badge ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="TestimonialManagement-actionBtns">
                          <button 
                            className="view" 
                            title="View" 
                            onClick={() => setViewingModalData(item)}
                          >
                            <FaEye />
                          </button>
                          <button 
                            className="edit" 
                            title="Edit" 
                            onClick={() => handleEdit(item)}
                          >
                            <FaPencilAlt />
                          </button>
                          <button 
                            className="delete" 
                            title="Delete" 
                            onClick={() => handleDelete(item.id)}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTestimonials.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                        No testimonials found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* GRID VIEW */
            <div className="TestimonialManagement-grid">
              {filteredTestimonials.map((item) => (
                <div 
                  className="TestimonialManagement-gridCard" 
                  key={item.id}
                  style={{ borderTop: `4px solid ${item.accentColor || '#3b82f6'}` }}
                >
                  <div className="TestimonialManagement-gridHeader">
                    <img src={item.profileImage} alt={item.clientName} className="TestimonialManagement-avatar" />
                    <div>
                      <h4>{item.clientName}</h4>
                      <p>{item.designation}</p>
                    </div>
                  </div>
                  <p className="TestimonialManagement-gridMsg">"{item.message}"</p>
                  <div className="TestimonialManagement-gridFooter">
                    <div className="TestimonialManagement-tableRating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star}>
                          {star <= item.rating ? (
                            <FaStar className="TestimonialManagement-star active" />
                          ) : (
                            <FaRegStar className="TestimonialManagement-star" />
                          )}
                        </span>
                      ))}
                    </div>
                    <div className="TestimonialManagement-actionBtns">
                      <button className="view" onClick={() => setViewingModalData(item)}><FaEye /></button>
                      <button className="edit" onClick={() => handleEdit(item)}><FaPencilAlt /></button>
                      <button className="delete" onClick={() => handleDelete(item.id)}><FaTrashAlt /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Pagination */}
          <div className="TestimonialManagement-pagination">
            <span>Showing 1 to {filteredTestimonials.length} of {testimonials.length} testimonials</span>
            <div className="TestimonialManagement-pageBtns">
              <button disabled><FaChevronLeft /></button>
              <button className="active">1</button>
              <button>2</button>
              <button><FaChevronRight /></button>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewingModalData && (
        <div className="TestimonialManagement-modalBackdrop" onClick={() => setViewingModalData(null)}>
          <div className="TestimonialManagement-modal" onClick={e => e.stopPropagation()}>
            <div className="TestimonialManagement-modalHeader">
              <h3>Testimonial Details</h3>
              <button onClick={() => setViewingModalData(null)}>&times;</button>
            </div>
            <div className="TestimonialManagement-modalBody">
              <img src={viewingModalData.profileImage} alt="profile" className="TestimonialManagement-modalAvatar" />
              <h4>{viewingModalData.clientName}</h4>
              <p className="role">{viewingModalData.designation}</p>
              <div className="rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star}>
                    {star <= viewingModalData.rating ? (
                      <FaStar className="TestimonialManagement-star active" />
                    ) : (
                      <FaRegStar className="TestimonialManagement-star" />
                    )}
                  </span>
                ))}
              </div>
              <p className="message">"{viewingModalData.message}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialManagement;