import React, { useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {
  FaSearch,
  FaFilter,
  FaList,
  FaThLarge,
  FaEye,
  FaPencilAlt,
  FaTrashAlt,
  FaImage,
  FaChevronLeft,
  FaChevronRight,
  FaTimes
} from 'react-icons/fa';
import './BlogManagement.css';

const INITIAL_BLOGS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=150&q=80',
    title: 'Eu Parturient Dictumst Frames Quam Temper',
    slug: 'eu-parturient-dictumst-frames-quam-temper',
    category: 'Education',
    date: 'Mar 30, 2024',
    status: 'Published',
    shortDescription: 'Comprehensive look at modern framing and learning methods.',
    description: '<p>Eu Parturient Dictumst Frames Quam Temper content goes here...</p>',
    tags: ['Learning', 'Study']
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=150&q=80',
    title: 'The Importance of Early Learning for Kids',
    slug: 'the-importance-of-early-learning-for-kids',
    category: 'Education',
    date: 'Mar 28, 2024',
    status: 'Published',
    shortDescription: 'Why early child development plays a critical role in lifelong learning.',
    description: '<p>The Importance of Early Learning for Kids content goes here...</p>',
    tags: ['Kids', 'Education']
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=150&q=80',
    title: 'How Play Builds Stronger Minds',
    slug: 'how-play-builds-stronger-minds',
    category: 'Education',
    date: 'Mar 25, 2024',
    status: 'Draft',
    shortDescription: 'Exploring the cognitive benefits of play-based activities.',
    description: '<p>How Play Builds Stronger Minds content goes here...</p>',
    tags: ['Mind', 'Play']
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=150&q=80',
    title: 'Top 10 Adventure Destinations in 2024',
    slug: 'top-10-adventure-destinations-in-2024',
    category: 'Adventure',
    date: 'Mar 20, 2024',
    status: 'Published',
    shortDescription: 'Unveiling the best spots for thrilling outdoor pursuits worldwide.',
    description: '<p>Top 10 Adventure Destinations in 2024 content goes here...</p>',
    tags: ['Travel', 'Adventure']
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=150&q=80',
    title: 'Romantic Getaways for Couples',
    slug: 'romantic-getaways-for-couples',
    category: 'Romance',
    date: 'Mar 18, 2024',
    status: 'Published',
    shortDescription: 'Escape to tranquil resorts and memorable intimate destinations.',
    description: '<p>Romantic Getaways for Couples content goes here...</p>',
    tags: ['Couples', 'Travel']
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=150&q=80',
    title: 'Best Modern Fiction Books to Read',
    slug: 'best-modern-fiction-books-to-read',
    category: 'Modern Fiction',
    date: 'Mar 15, 2024',
    status: 'Published',
    shortDescription: 'A curated list of contemporary masterpieces that inspire.',
    description: '<p>Best Modern Fiction Books to Read content goes here...</p>',
    tags: ['Books', 'Fiction']
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=150&q=80',
    title: 'Building a Reading Habit in Daily Life',
    slug: 'building-a-reading-habit-in-daily-life',
    category: 'Contemporary',
    date: 'Mar 12, 2024',
    status: 'Draft',
    shortDescription: 'Simple strategies to integrate 30 minutes of reading daily.',
    description: '<p>Building a Reading Habit in Daily Life content goes here...</p>',
    tags: ['Reading', 'Habits']
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=150&q=80',
    title: 'Travel Tips for First Time Travelers',
    slug: 'travel-tips-for-first-time-travelers',
    category: 'Adventure',
    date: 'Mar 10, 2024',
    status: 'Published',
    shortDescription: 'Essential packing, safety, and itinerary guidance for novices.',
    description: '<p>Travel Tips for First Time Travelers content goes here...</p>',
    tags: ['Travel', 'Tips']
  }
];

const CATEGORY_OPTIONS = ['Education', 'Adventure', 'Romance', 'Modern Fiction', 'Contemporary'];
const TAG_OPTIONS = ['Learning', 'Study', 'Kids', 'Mind', 'Play', 'Travel', 'Adventure', 'Books', 'Reading', 'Tips'];

const BlogManagement = () => {
  // Data States
  const [blogs, setBlogs] = useState(INITIAL_BLOGS);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [status, setStatus] = useState('Published');
  const [imagePreview, setImagePreview] = useState(null);

  // View & Filter States
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // View Modal State
  const [viewingBlog, setViewingBlog] = useState(null);

  // File Input Ref
  const fileInputRef = useRef(null);

  // Helper: Slug Generator
  const handleGenerateSlug = () => {
    if (title) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Tag Handling
  const handleTagSelect = (e) => {
    const val = e.target.value;
    if (val && !selectedTags.includes(val)) {
      setSelectedTags([...selectedTags, val]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  // Image Upload Handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Reset Form
  const handleResetForm = () => {
    setTitle('');
    setSlug('');
    setShortDescription('');
    setDescription('');
    setCategory('');
    setSelectedTags([]);
    setStatus('Published');
    setImagePreview(null);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Create or Update Blog
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Title is required');

    const blogData = {
      id: editingId || Date.now(),
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      category: category || 'Education',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status,
      shortDescription,
      description,
      tags: selectedTags,
      image: imagePreview || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=150&q=80'
    };

    if (editingId) {
      setBlogs(blogs.map((b) => (b.id === editingId ? blogData : b)));
    } else {
      setBlogs([blogData, ...blogs]);
    }

    handleResetForm();
  };

  // Action: Edit
  const handleEdit = (blog) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setSlug(blog.slug);
    setShortDescription(blog.shortDescription || '');
    setDescription(blog.description || '');
    setCategory(blog.category);
    setSelectedTags(blog.tags || []);
    setStatus(blog.status);
    setImagePreview(blog.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Action: Delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setBlogs(blogs.filter((b) => b.id !== id));
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  // Checkbox Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedBlogs.map((b) => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Filtering Data
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          blog.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory ? blog.category === filterCategory : true;
    const matchesStatus = filterStatus ? blog.status === filterStatus : true;
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="BlogManagement">
      {/* Header */}
      <div className="BlogManagement-header">
        <h1>Blog Management</h1>
        <p className="BlogManagement-breadcrumb">
          Dashboard <span>&gt;</span> Blog Management
        </p>
      </div>

      <div className="BlogManagement-container">
        {/* Left Column: Form */}
        <div className="BlogManagement-formCard">
          <h2>{editingId ? 'Edit Blog Post' : 'Add / Edit Blog Post'}</h2>

          <form onSubmit={handleSubmit}>
            <div className="BlogManagement-formGroup">
              <label>Title <span>*</span></label>
              <input
                type="text"
                placeholder="Enter blog title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="BlogManagement-formGroup">
              <label>Slug <span>*</span></label>
              <div className="BlogManagement-slugInputGroup">
                <input
                  type="text"
                  placeholder="enter-blog-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
                <button type="button" className="BlogManagement-generateBtn" onClick={handleGenerateSlug}>
                  Generate
                </button>
              </div>
            </div>

            <div className="BlogManagement-formGroup">
              <label>Short Description <span>*</span></label>
              <textarea
                placeholder="Write a short description..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="BlogManagement-formGroup">
              <label>Description <span>*</span></label>
              <Editor
                apiKey="jeq7g2k84sqpi9364o8x9ptqf09aoesaq8jxmp49dl4sh57z"
                value={description}
                init={{
                  height: 200,
                  menubar: false,
                  plugins: ['advlist autolink lists link image charmap print preview anchor', 'searchreplace visualblocks code fullscreen'],
                  toolbar: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image'
                }}
                onEditorChange={(content) => setDescription(content)}
              />
            </div>

            <div className="BlogManagement-formGroup">
              <label>Featured Image <span>*</span></label>
              <div
                className="BlogManagement-uploadBox"
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="BlogManagement-previewImage" />
                ) : (
                  <>
                    <FaImage className="BlogManagement-uploadIcon" />
                    <p className="BlogManagement-uploadText">
                      <strong>Click to upload image</strong> or drag and drop
                    </p>
                    <p className="BlogManagement-uploadHint">JPG, PNG, WebP (Max 2MB)</p>
                  </>
                )}
              </div>
            </div>

            <div className="BlogManagement-formRow">
              <div className="BlogManagement-formGroup">
                <label>Category <span>*</span></label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="BlogManagement-formGroup">
                <label>Tags</label>
                <select value="" onChange={handleTagSelect}>
                  <option value="">Select or type tags</option>
                  {TAG_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <div className="BlogManagement-tagsList">
                  {selectedTags.map((t) => (
                    <span key={t} className="BlogManagement-tagChip">
                      {t}
                      <FaTimes onClick={() => handleRemoveTag(t)} />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="BlogManagement-formGroup">
              <label>Status <span>*</span></label>
              <div className="BlogManagement-radioGroup">
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Published"
                    checked={status === 'Published'}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  Published
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Draft"
                    checked={status === 'Draft'}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  Draft
                </label>
              </div>
            </div>

            <div className="BlogManagement-formActions">
              <button type="button" className="BlogManagement-resetBtn" onClick={handleResetForm}>
                Reset
              </button>
              <button type="submit" className="BlogManagement-submitBtn">
                Submit
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: List / Grid Display */}
        <div className="BlogManagement-listCard">
          <div className="BlogManagement-listHeader">
            <h2>All Blog Posts</h2>

            <div className="BlogManagement-controls">
              <div className="BlogManagement-searchBox">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="BlogManagement-filterWrapper">
                <button
                  className="BlogManagement-filterBtn"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <FaFilter /> Filter
                </button>

                {showFilterDropdown && (
                  <div className="BlogManagement-filterDropdown">
                    <div className="BlogManagement-filterItem">
                      <label>Category</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="BlogManagement-filterItem">
                      <label>Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="">All Statuses</option>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>

                    <button
                      className="BlogManagement-clearFilterBtn"
                      onClick={() => {
                        setFilterCategory('');
                        setFilterStatus('');
                        setShowFilterDropdown(false);
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              <div className="BlogManagement-viewToggle">
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                >
                  <FaList />
                </button>
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                >
                  <FaThLarge />
                </button>
              </div>
            </div>
          </div>

          {/* Table View */}
          {viewMode === 'list' ? (
            <div className="BlogManagement-tableWrapper">
              <table className="BlogManagement-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          paginatedBlogs.length > 0 &&
                          paginatedBlogs.every((b) => selectedIds.includes(b.id))
                        }
                      />
                    </th>
                    <th>#</th>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBlogs.map((blog, idx) => (
                    <tr key={blog.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(blog.id)}
                          onChange={() => handleSelectOne(blog.id)}
                        />
                      </td>
                      <td>{startIndex + idx + 1}</td>
                      <td>
                        <img src={blog.image} alt={blog.title} className="BlogManagement-tableImg" />
                      </td>
                      <td className="BlogManagement-titleCell">{blog.title}</td>
                      <td>
                        <span className={`BlogManagement-catBadge ${blog.category.toLowerCase().replace(/\s+/g, '-')}`}>
                          {blog.category}
                        </span>
                      </td>
                      <td>{blog.date}</td>
                      <td>
                        <span className={`BlogManagement-statusBadge ${blog.status.toLowerCase()}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td>
                        <div className="BlogManagement-actionGroup">
                          <button
                            className="BlogManagement-actionBtn view"
                            onClick={() => setViewingBlog(blog)}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="BlogManagement-actionBtn edit"
                            onClick={() => handleEdit(blog)}
                          >
                            <FaPencilAlt />
                          </button>
                          <button
                            className="BlogManagement-actionBtn delete"
                            onClick={() => handleDelete(blog.id)}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="BlogManagement-gridWrapper">
              {paginatedBlogs.map((blog) => (
                <div key={blog.id} className="BlogManagement-gridCard">
                  <div className="BlogManagement-gridCardImg">
                    <img src={blog.image} alt={blog.title} />
                    <span className={`BlogManagement-statusBadge ${blog.status.toLowerCase()}`}>
                      {blog.status}
                    </span>
                  </div>
                  <div className="BlogManagement-gridCardBody">
                    <span className={`BlogManagement-catBadge ${blog.category.toLowerCase().replace(/\s+/g, '-')}`}>
                      {blog.category}
                    </span>
                    <h3>{blog.title}</h3>
                    <p className="BlogManagement-gridDate">{blog.date}</p>
                    <p className="BlogManagement-gridDesc">{blog.shortDescription}</p>

                    <div className="BlogManagement-actionGroup">
                      <button
                        className="BlogManagement-actionBtn view"
                        onClick={() => setViewingBlog(blog)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="BlogManagement-actionBtn edit"
                        onClick={() => handleEdit(blog)}
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        className="BlogManagement-actionBtn delete"
                        onClick={() => handleDelete(blog.id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer & Pagination */}
          <div className="BlogManagement-paginationContainer">
            <span className="BlogManagement-showingText">
              Showing {filteredBlogs.length === 0 ? 0 : startIndex + 1} to{' '}
              {Math.min(startIndex + itemsPerPage, filteredBlogs.length)} of {filteredBlogs.length} posts
            </span>

            <div className="BlogManagement-pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <FaChevronLeft />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={currentPage === page ? 'active' : ''}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewingBlog && (
        <div className="BlogManagement-modalOverlay" onClick={() => setViewingBlog(null)}>
          <div className="BlogManagement-modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="BlogManagement-modalHeader">
              <h3>View Blog Post</h3>
              <button onClick={() => setViewingBlog(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="BlogManagement-modalBody">
              <img src={viewingBlog.image} alt={viewingBlog.title} className="BlogManagement-modalImg" />
              <h2>{viewingBlog.title}</h2>
              <div className="BlogManagement-modalMeta">
                <span className={`BlogManagement-catBadge ${viewingBlog.category.toLowerCase().replace(/\s+/g, '-')}`}>
                  {viewingBlog.category}
                </span>
                <span>{viewingBlog.date}</span>
                <span className={`BlogManagement-statusBadge ${viewingBlog.status.toLowerCase()}`}>
                  {viewingBlog.status}
                </span>
              </div>
              <p><strong>Slug:</strong> {viewingBlog.slug}</p>
              <p><strong>Short Description:</strong> {viewingBlog.shortDescription}</p>
              <div>
                <strong>Description:</strong>
                <div
                  className="BlogManagement-modalContentArea"
                  dangerouslySetInnerHTML={{ __html: viewingBlog.description }}
                />
              </div>
              {viewingBlog.tags && viewingBlog.tags.length > 0 && (
                <div className="BlogManagement-tagsList" style={{ marginTop: '10px' }}>
                  {viewingBlog.tags.map((t) => (
                    <span key={t} className="BlogManagement-tagChip">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;