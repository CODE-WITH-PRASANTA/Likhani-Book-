import React, { useState, useMemo, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {
  FiSearch,
  FiFilter,
  FiList,
  FiGrid,
  FiEye,
  FiEdit,
  FiTrash2,
  FiUploadCloud,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import './BlogManagement.css';

const INITIAL_BLOGS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=150',
    title: 'Eu Parturient Dictumst Frames Quam Temper',
    category: 'Education',
    date: 'Mar 30, 2024',
    status: 'Published',
    slug: 'eu-parturient-dictumst',
    shortDescription: 'A detailed article on modern educational frameworks and learning strategies.',
    content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>',
    tags: ['Education', 'Learning']
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=150',
    title: 'The Importance of Early Learning for Kids',
    category: 'Education',
    date: 'Mar 28, 2024',
    status: 'Published',
    slug: 'importance-early-learning',
    shortDescription: 'Exploring foundational cognitive development methods in early childhood.',
    content: '<p>Early childhood learning lays the groundwork for lifelong success...</p>',
    tags: ['Education', 'Kids']
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=150',
    title: 'How Play Builds Stronger Minds',
    category: 'Education',
    date: 'Mar 25, 2024',
    status: 'Draft',
    slug: 'how-play-builds-stronger-minds',
    shortDescription: 'Understanding the biological impact of recreational learning on mind growth.',
    content: '<p>Play stimulates brain development and creative problem solving...</p>',
    tags: ['Mind', 'Kids']
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=150',
    title: 'Top 10 Adventure Destinations in 2024',
    category: 'Adventure',
    date: 'Mar 20, 2024',
    status: 'Published',
    slug: 'top-10-adventure-destinations-2024',
    shortDescription: 'Discover scenic mountains, hiking trails, and thrilling spots worldwide.',
    content: '<p>Adventure awaits across these breathtaking locations...</p>',
    tags: ['Travel', 'Adventure']
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=150',
    title: 'Romantic Getaways for Couples',
    category: 'Romance',
    date: 'Mar 18, 2024',
    status: 'Published',
    slug: 'romantic-getaways-for-couples',
    shortDescription: 'Plan your ultimate romantic escape with these carefully curated destinations.',
    content: '<p>Plan your couple trip with our luxury list...</p>',
    tags: ['Romance', 'Travel']
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150',
    title: 'Best Modern Fiction Books to Read',
    category: 'Modern Fiction',
    date: 'Mar 15, 2024',
    status: 'Published',
    slug: 'best-modern-fiction-books',
    shortDescription: 'A roundup of top contemporary fiction novels grabbing readers’ attention.',
    content: '<p>Dive into contemporary literary masterpieces...</p>',
    tags: ['Books', 'Fiction']
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=150',
    title: 'Building a Reading Habit in Daily Life',
    category: 'Contemporary',
    date: 'Mar 12, 2024',
    status: 'Draft',
    slug: 'building-a-reading-habit',
    shortDescription: 'Practical routines to help you consume more books consistently every day.',
    content: '<p>Set realistic goals and build effective daily habits...</p>',
    tags: ['Habits', 'Books']
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=150',
    title: 'Travel Tips for First Time Travelers',
    category: 'Adventure',
    date: 'Mar 10, 2024',
    status: 'Published',
    slug: 'travel-tips-first-time-travelers',
    shortDescription: 'Key advice on packing, navigation, safety, and budget management abroad.',
    content: '<p>Everything you need to know before stepping on that plane...</p>',
    tags: ['Travel', 'Tips']
  }
];

const CATEGORIES = ['Education', 'Adventure', 'Romance', 'Modern Fiction', 'Contemporary', 'Lifestyle', 'Technology'];
const ALL_TAGS = ['Education', 'Learning', 'Kids', 'Mind', 'Travel', 'Adventure', 'Romance', 'Books', 'Fiction', 'Habits', 'Tips', 'Tech'];

const BlogManagement = () => {
  // State
  const [blogs, setBlogs] = useState(INITIAL_BLOGS);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBlog, setSelectedBlog] = useState(null); // Modal view
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    featuredImage: null,
    imagePreview: '',
    category: '',
    tags: [],
    status: 'Published'
  });

  const fileInputRef = useRef(null);
  const itemsPerPage = 8;

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateSlug = () => {
    if (!formData.title) return;
    const generated = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({ ...prev, slug: generated }));
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({ ...prev, description: content }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB max limit.');
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        featuredImage: file,
        imagePreview: previewUrl
      }));
    }
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag]
      };
    });
  };

  const handleReset = () => {
    setFormData({
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      featuredImage: null,
      imagePreview: '',
      category: '',
      tags: [],
      status: 'Published'
    });
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      alert('Please fill out all required fields.');
      return;
    }

    if (editingId) {
      // Update existing
      setBlogs((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: formData.title,
                slug: formData.slug || item.slug,
                shortDescription: formData.shortDescription,
                content: formData.description,
                category: formData.category,
                tags: formData.tags,
                status: formData.status,
                image: formData.imagePreview || item.image
              }
            : item
        )
      );
    } else {
      // Create new
      const newPost = {
        id: Date.now(),
        image: formData.imagePreview || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=150',
        title: formData.title,
        category: formData.category,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: formData.status,
        slug: formData.slug || 'untitled-slug',
        shortDescription: formData.shortDescription,
        content: formData.description,
        tags: formData.tags
      };
      setBlogs((prev) => [newPost, ...prev]);
    }

    handleReset();
  };

  // Actions
  const handleEdit = (blog) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      shortDescription: blog.shortDescription || '',
      description: blog.content || '',
      featuredImage: null,
      imagePreview: blog.image,
      category: blog.category,
      tags: blog.tags || [],
      status: blog.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      setBlogs((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) handleReset();
    }
  };

  // Search & Filter Logic
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || blog.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [blogs, searchQuery, filterCategory]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage) || 1;
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBlogs.slice(start, start + itemsPerPage);
  }, [filteredBlogs, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Category Badge Styles
  const getCategoryClass = (category) => {
    switch (category) {
      case 'Education':
        return 'badge-blue';
      case 'Adventure':
        return 'badge-green';
      case 'Romance':
        return 'badge-pink';
      case 'Modern Fiction':
        return 'badge-purple';
      case 'Contemporary':
        return 'badge-orange';
      default:
        return 'badge-gray';
    }
  };

  return (
    <div className="BlogManagement">
      {/* Header Breadcrumb */}
      <div className="BlogManagement-header">
        <h1 className="BlogManagement-title">Blog Management</h1>
        <p className="BlogManagement-breadcrumb">Dashboard &gt; Blog Management</p>
      </div>

      {/* Main Grid Content */}
      <div className="BlogManagement-container">
        {/* Left Form Column */}
        <div className="BlogManagement-formCard">
          <h2 className="BlogManagement-cardTitle">
            {editingId ? 'Edit Blog Post' : 'Add / Edit Blog Post'}
          </h2>

          <form onSubmit={handleSubmit} className="BlogManagement-form">
            {/* Title */}
            <div className="BlogManagement-field">
              <label>
                Title <span>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter blog title"
                required
              />
            </div>

            {/* Slug */}
            <div className="BlogManagement-field">
              <label>
                Slug <span>*</span>
              </label>
              <div className="BlogManagement-slugInputGroup">
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="enter-blog-slug"
                  required
                />
                <button
                  type="button"
                  className="BlogManagement-btnGenerate"
                  onClick={handleGenerateSlug}
                >
                  Generate
                </button>
              </div>
            </div>

            {/* Short Description (Replaced Excerpt) */}
            <div className="BlogManagement-field">
              <label>
                Short Description <span>*</span>
              </label>
              <textarea
                name="shortDescription"
                rows="3"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Write a short description..."
                required
              />
            </div>

            {/* Description / TinyMCE Editor (Replaced Content) */}
            <div className="BlogManagement-field">
              <label>
                Description <span>*</span>
              </label>
              <div className="BlogManagement-editorWrapper">
                <Editor
                  apiKey="no-api-key" // Replace with your TinyMCE API key if available
                  value={formData.description}
                  onEditorChange={handleEditorChange}
                  init={{
                    height: 220,
                    menubar: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                    ],
                    toolbar:
                      'undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | removeformat',
                    content_style: 'body { font-family:Inter,sans-serif; font-size:14px }'
                  }}
                />
              </div>
            </div>

            {/* Featured Image */}
            <div className="BlogManagement-field">
              <label>
                Featured Image <span>*</span>
              </label>
              <div
                className="BlogManagement-dropzone"
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  hidden
                />
                {formData.imagePreview ? (
                  <div className="BlogManagement-imagePreviewContainer">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="BlogManagement-imagePreview"
                    />
                    <p className="BlogManagement-uploadSubtext">Click to change image</p>
                  </div>
                ) : (
                  <>
                    <FiUploadCloud className="BlogManagement-uploadIcon" />
                    <p className="BlogManagement-uploadText">
                      <strong>Click to upload image</strong> or drag and drop
                    </p>
                    <p className="BlogManagement-uploadSubtext">JPG, PNG, WebP (Max 2MB)</p>
                  </>
                )}
              </div>
            </div>

            {/* Category & Tags Row */}
            <div className="BlogManagement-row">
              <div className="BlogManagement-field">
                <label>
                  Category <span>*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="BlogManagement-field">
                <label>Tags</label>
                <div className="BlogManagement-tagSelector">
                  <div className="BlogManagement-tagList">
                    {ALL_TAGS.map((tag) => {
                      const isSelected = formData.tags.includes(tag);
                      return (
                        <span
                          key={tag}
                          className={`BlogManagement-tagChip ${isSelected ? 'active' : ''}`}
                          onClick={() => handleTagToggle(tag)}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Radio Buttons */}
            <div className="BlogManagement-field">
              <label>
                Status <span>*</span>
              </label>
              <div className="BlogManagement-radioGroup">
                <label className="BlogManagement-radioLabel">
                  <input
                    type="radio"
                    name="status"
                    value="Published"
                    checked={formData.status === 'Published'}
                    onChange={handleInputChange}
                  />
                  <span>Published</span>
                </label>
                <label className="BlogManagement-radioLabel">
                  <input
                    type="radio"
                    name="status"
                    value="Draft"
                    checked={formData.status === 'Draft'}
                    onChange={handleInputChange}
                  />
                  <span>Draft</span>
                </label>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="BlogManagement-formActions">
              <button
                type="button"
                className="BlogManagement-btnReset"
                onClick={handleReset}
              >
                Reset
              </button>
              <button type="submit" className="BlogManagement-btnSubmit">
                Submit
              </button>
            </div>
          </form>
        </div>

        {/* Right Table/Grid Column */}
        <div className="BlogManagement-listCard">
          {/* Top Controls */}
          <div className="BlogManagement-listHeader">
            <h2 className="BlogManagement-cardTitle">All Blog Posts</h2>

            <div className="BlogManagement-toolbar">
              {/* Search Box */}
              <div className="BlogManagement-searchBox">
                <FiSearch className="BlogManagement-searchIcon" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Filter Dropdown */}
              <div className="BlogManagement-filterWrapper">
                <button
                  className="BlogManagement-btnFilter"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <FiFilter /> Filter
                </button>
                {isFilterOpen && (
                  <div className="BlogManagement-filterMenu">
                    <div
                      className={`BlogManagement-filterItem ${filterCategory === 'All' ? 'active' : ''}`}
                      onClick={() => {
                        setFilterCategory('All');
                        setIsFilterOpen(false);
                      }}
                    >
                      All Categories
                    </div>
                    {CATEGORIES.map((cat) => (
                      <div
                        key={cat}
                        className={`BlogManagement-filterItem ${filterCategory === cat ? 'active' : ''}`}
                        onClick={() => {
                          setFilterCategory(cat);
                          setIsFilterOpen(false);
                        }}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* View Toggle */}
              <div className="BlogManagement-viewToggle">
                <button
                  className={`BlogManagement-toggleBtn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <FiList />
                </button>
                <button
                  className={`BlogManagement-toggleBtn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <FiGrid />
                </button>
              </div>
            </div>
          </div>

          {/* List View Table */}
          {viewMode === 'list' ? (
            <div className="BlogManagement-tableWrapper">
              <table className="BlogManagement-table">
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" />
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
                  {paginatedBlogs.length > 0 ? (
                    paginatedBlogs.map((blog, idx) => (
                      <tr key={blog.id}>
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                        <td>
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="BlogManagement-tableImage"
                          />
                        </td>
                        <td className="BlogManagement-titleCell">{blog.title}</td>
                        <td>
                          <span
                            className={`BlogManagement-badge ${getCategoryClass(blog.category)}`}
                          >
                            {blog.category}
                          </span>
                        </td>
                        <td className="BlogManagement-dateCell">{blog.date}</td>
                        <td>
                          <span
                            className={`BlogManagement-statusBadge ${blog.status.toLowerCase()}`}
                          >
                            {blog.status}
                          </span>
                        </td>
                        <td>
                          <div className="BlogManagement-actions">
                            <button
                              className="BlogManagement-actionBtn view"
                              onClick={() => setSelectedBlog(blog)}
                              title="View"
                            >
                              <FiEye />
                            </button>
                            <button
                              className="BlogManagement-actionBtn edit"
                              onClick={() => handleEdit(blog)}
                              title="Edit"
                            >
                              <FiEdit />
                            </button>
                            <button
                              className="BlogManagement-actionBtn delete"
                              onClick={() => handleDelete(blog.id)}
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="BlogManagement-empty">
                        No blogs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View Cards */
            <div className="BlogManagement-grid">
              {paginatedBlogs.length > 0 ? (
                paginatedBlogs.map((blog) => (
                  <div key={blog.id} className="BlogManagement-gridCard">
                    <div className="BlogManagement-gridImageWrapper">
                      <img src={blog.image} alt={blog.title} />
                      <span
                        className={`BlogManagement-badge ${getCategoryClass(blog.category)}`}
                      >
                        {blog.category}
                      </span>
                    </div>
                    <div className="BlogManagement-gridBody">
                      <span className="BlogManagement-dateCell">{blog.date}</span>
                      <h3 className="BlogManagement-gridTitle">{blog.title}</h3>
                      <p className="BlogManagement-gridDesc">{blog.shortDescription}</p>
                      <div className="BlogManagement-gridFooter">
                        <span
                          className={`BlogManagement-statusBadge ${blog.status.toLowerCase()}`}
                        >
                          {blog.status}
                        </span>
                        <div className="BlogManagement-actions">
                          <button
                            className="BlogManagement-actionBtn view"
                            onClick={() => setSelectedBlog(blog)}
                            title="View"
                          >
                            <FiEye />
                          </button>
                          <button
                            className="BlogManagement-actionBtn edit"
                            onClick={() => handleEdit(blog)}
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                          <button
                            className="BlogManagement-actionBtn delete"
                            onClick={() => handleDelete(blog.id)}
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="BlogManagement-empty">No blogs found.</p>
              )}
            </div>
          )}

          {/* Pagination Footer */}
          <div className="BlogManagement-pagination">
            <span className="BlogManagement-paginationInfo">
              Showing{' '}
              {filteredBlogs.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}{' '}
              to {Math.min(currentPage * itemsPerPage, filteredBlogs.length)} of{' '}
              {filteredBlogs.length} posts
            </span>

            <div className="BlogManagement-paginationControls">
              <button
                className="BlogManagement-pageBtn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FiChevronLeft />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`BlogManagement-pageBtn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="BlogManagement-pageBtn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedBlog && (
        <div className="BlogManagement-modalOverlay" onClick={() => setSelectedBlog(null)}>
          <div className="BlogManagement-modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="BlogManagement-modalHeader">
              <h2>{selectedBlog.title}</h2>
              <button
                className="BlogManagement-modalClose"
                onClick={() => setSelectedBlog(null)}
              >
                &times;
              </button>
            </div>
            <div className="BlogManagement-modalBody">
              <img
                src={selectedBlog.image}
                alt={selectedBlog.title}
                className="BlogManagement-modalImg"
              />
              <p>
                <strong>Category:</strong> {selectedBlog.category}
              </p>
              <p>
                <strong>Date:</strong> {selectedBlog.date}
              </p>
              <p>
                <strong>Status:</strong> {selectedBlog.status}
              </p>
              <p>
                <strong>Short Description:</strong> {selectedBlog.shortDescription}
              </p>
              <div>
                <strong>Description:</strong>
                <div
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                  style={{ marginTop: '5px' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;