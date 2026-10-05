import React, { useState, useMemo, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {
  FiSearch,
  FiList,
  FiGrid,
  FiEdit,
  FiTrash2,
  FiUploadCloud,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiMessageSquare,
  FiRotateCcw,
  FiCheckCircle
} from 'react-icons/fi';
import './BlogPosting.css';

const INITIAL_BLOGS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500',
    title: 'Eu Parturient Dictumst Frames Quam Temper',
    category: 'Education',
    date: 'Mar 30, 2024',
    status: 'Published',
    slug: 'eu-parturient-dictumst',
    author: 'Admin',
    comments: 2,
    shortDescription: 'Suspendisse luctus feugiat dictum. Curabitur ipsum velit, viverra in...',
    description: '<p>Suspendisse luctus feugiat dictum. Curabitur ipsum velit, viverra in, gravida et arcu. Donec vulputate congue urna, nec scelerisque leo pretium vel.</p>',
    tags: ['Education', 'Learning']
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500',
    title: 'The Importance of Early Learning for Kids',
    category: 'Education',
    date: 'Mar 28, 2024',
    status: 'Published',
    slug: 'importance-of-early-learning',
    author: 'Admin',
    comments: 0,
    shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do...',
    description: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
    tags: ['Education', 'Kids']
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500',
    title: 'How Play Builds Stronger Minds',
    category: 'Education',
    date: 'Mar 25, 2024',
    status: 'Draft',
    slug: 'how-play-builds-stronger-minds',
    author: 'Admin',
    comments: 1,
    shortDescription: 'Dolor sit amet, consectetur adipiscing elit, sed do eiusmod...',
    description: '<p>Dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
    tags: ['Mind', 'Kids']
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500',
    title: 'Top 10 Adventure Destinations in 2024',
    category: 'Adventure',
    date: 'Mar 20, 2024',
    status: 'Published',
    slug: 'top-10-adventure-destinations-2024',
    author: 'Admin',
    comments: 3,
    shortDescription: 'Explore the most breathtaking places around the world...',
    description: '<p>Explore the most breathtaking places around the world featuring amazing mountain peaks and hiking trails.</p>',
    tags: ['Travel', 'Adventure']
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=500',
    title: 'Romantic Getaways for Couples',
    category: 'Romance',
    date: 'Mar 18, 2024',
    status: 'Published',
    slug: 'romantic-getaways-for-couples',
    author: 'Admin',
    comments: 4,
    shortDescription: 'Plan your dream vacation with your favorite person...',
    description: '<p>Plan your dream vacation with luxury resorts and private beaches carefully selected for couples.</p>',
    tags: ['Romance', 'Travel']
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
    title: 'Best Modern Fiction Books to Read',
    category: 'Modern Fiction',
    date: 'Mar 15, 2024',
    status: 'Published',
    slug: 'best-modern-fiction-books',
    author: 'Admin',
    comments: 2,
    shortDescription: 'A curated list of modern fiction books that captivate your mind...',
    description: '<p>A curated list of modern fiction novels written by bestseller authors in modern contemporary literature.</p>',
    tags: ['Books', 'Fiction']
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500',
    title: 'Building a Reading Habit in Daily Life',
    category: 'Contemporary',
    date: 'Mar 12, 2024',
    status: 'Draft',
    slug: 'building-a-reading-habit',
    author: 'Admin',
    comments: 0,
    shortDescription: 'Simple tips to make reading a effortless daily ritual...',
    description: '<p>Simple tips to make reading a natural part of your routine without feeling overwhelmed by pages.</p>',
    tags: ['Habits', 'Books']
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500',
    title: 'Travel Tips for First Time Travelers',
    category: 'Adventure',
    date: 'Mar 10, 2024',
    status: 'Published',
    slug: 'travel-tips-first-time-travelers',
    author: 'Admin',
    comments: 5,
    shortDescription: 'Everything you need to know before stepping on that plane...',
    description: '<p>Everything you need to know before embarking on your first international flight with ease and confidence.</p>',
    tags: ['Travel', 'Tips']
  }
];

const CATEGORIES = ['Education', 'Adventure', 'Romance', 'Modern Fiction', 'Contemporary', 'Lifestyle', 'Technology'];
const AUTHORS = ['Admin', 'John Doe', 'Sarah Smith', 'Editor Team'];
const ALL_TAGS = ['Education', 'Learning', 'Kids', 'Mind', 'Travel', 'Adventure', 'Romance', 'Books', 'Fiction', 'Habits', 'Tips', 'Tech'];

const BlogPosting = () => {
  const [blogs, setBlogs] = useState(INITIAL_BLOGS);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    featuredImage: null,
    imagePreview: '',
    category: '',
    author: 'Admin',
    tags: [],
    status: 'Published'
  });

  const fileInputRef = useRef(null);
  const itemsPerPage = 6;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateSlug = () => {
    if (!formData.title) return;
    const slugified = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({ ...prev, slug: slugified }));
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({ ...prev, description: content }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit.');
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
      author: 'Admin',
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
      setBlogs((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: formData.title,
                slug: formData.slug || item.slug,
                shortDescription: formData.shortDescription,
                description: formData.description,
                category: formData.category,
                author: formData.author,
                tags: formData.tags,
                status: formData.status,
                image: formData.imagePreview || item.image
              }
            : item
        )
      );
    } else {
      const newPost = {
        id: Date.now(),
        image: formData.imagePreview || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500',
        title: formData.title,
        category: formData.category,
        author: formData.author,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: formData.status,
        slug: formData.slug || 'untitled-slug',
        comments: 0,
        shortDescription: formData.shortDescription,
        description: formData.description,
        tags: formData.tags
      };
      setBlogs((prev) => [newPost, ...prev]);
    }

    handleReset();
  };

  const handleEdit = (blog) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title,
      slug: blog.slug || '',
      shortDescription: blog.shortDescription || '',
      description: blog.description || '',
      featuredImage: null,
      imagePreview: blog.image,
      category: blog.category,
      author: blog.author || 'Admin',
      tags: blog.tags || [],
      status: blog.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      setBlogs((prev) => prev.filter((item) => item.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
      if (editingId === id) handleReset();
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected blog post(s)?`)) {
      setBlogs((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      if (selectedIds.includes(editingId)) handleReset();
      setSelectedIds([]);
    }
  };

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === 'All Categories' || blog.category === selectedCategory;

      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Published' && blog.status === 'Published') ||
        (activeTab === 'Drafts' && blog.status === 'Draft') ||
        (activeTab === 'Trash' && blog.status === 'Trash');

      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [blogs, searchQuery, selectedCategory, activeTab]);

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage) || 1;
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBlogs.slice(start, start + itemsPerPage);
  }, [filteredBlogs, currentPage]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentIds = paginatedBlogs.map((blog) => blog.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    } else {
      const currentIds = paginatedBlogs.map((blog) => blog.id);
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllPageSelected =
    paginatedBlogs.length > 0 &&
    paginatedBlogs.every((blog) => selectedIds.includes(blog.id));

  const counts = useMemo(() => {
    return {
      all: blogs.length,
      published: blogs.filter((b) => b.status === 'Published').length,
      drafts: blogs.filter((b) => b.status === 'Draft').length,
      trash: blogs.filter((b) => b.status === 'Trash').length
    };
  }, [blogs]);

  const getCategoryClass = (category) => {
    switch (category) {
      case 'Education':
        return 'badge-education';
      case 'Adventure':
        return 'badge-adventure';
      case 'Romance':
        return 'badge-romance';
      case 'Modern Fiction':
        return 'badge-fiction';
      case 'Contemporary':
        return 'badge-contemporary';
      default:
        return 'badge-default';
    }
  };

  return (
    <div className="BlogPosting">
      {/* Page Header */}
      <div className="BlogPosting-header">
        <div>
          <h1 className="BlogPosting-title">Blog Posting</h1>
          <p className="BlogPosting-subtitle">Manage, add, edit or delete your blog posts</p>
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="BlogPosting-mainGrid">
        {/* Left Form Panel */}
        <div className="BlogPosting-formCard">
          <h2 className="BlogPosting-cardTitle">
            {editingId ? 'Edit Blog Post' : 'Add Blog Post'}
          </h2>

          <form onSubmit={handleSubmit} className="BlogPosting-form">
            <div className="BlogPosting-field">
              <label>Title <span>*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter blog title"
                required
              />
            </div>

            <div className="BlogPosting-field">
              <label>Slug <span>*</span></label>
              <div className="BlogPosting-slugInputGroup">
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
                  className="BlogPosting-btnGenerate"
                  onClick={handleGenerateSlug}
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="BlogPosting-field">
              <label>Short Description <span>*</span></label>
              <textarea
                name="shortDescription"
                rows="3"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Write a short description..."
                required
              />
            </div>

            <div className="BlogPosting-field">
              <label>Description <span>*</span></label>
              <div className="BlogPosting-editorWrapper">
                <Editor
                  apiKey="jeq7g2k84sqpi9364o8x9ptqf09aoesaq8jxmp49dl4sh57z"
                  value={formData.description}
                  onEditorChange={handleEditorChange}
                  init={{
                    height: 200,
                    menubar: false,
                    plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'],
                    toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | removeformat',
                    content_style: 'body { font-family:Inter,sans-serif; font-size:13px }'
                  }}
                />
              </div>
            </div>

            <div className="BlogPosting-field">
              <label>Featured Image <span>*</span></label>
              <div
                className="BlogPosting-dropzone"
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
                  <div className="BlogPosting-imagePreviewContainer">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="BlogPosting-imagePreview"
                    />
                    <p className="BlogPosting-uploadSubtext">Click to change image</p>
                  </div>
                ) : (
                  <>
                    <FiUploadCloud className="BlogPosting-uploadIcon" />
                    <p className="BlogPosting-uploadText">
                      <strong>Click to upload image</strong> or drag and drop
                    </p>
                    <p className="BlogPosting-uploadSubtext">JPG, PNG, WebP (Max 2MB)</p>
                  </>
                )}
              </div>
            </div>

            <div className="BlogPosting-row">
              <div className="BlogPosting-field">
                <label>Category <span>*</span></label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="BlogPosting-field">
                <label>Author <span>*</span></label>
                <select
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                >
                  {AUTHORS.map((auth) => (
                    <option key={auth} value={auth}>{auth}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="BlogPosting-field">
              <label>Tags</label>
              <div className="BlogPosting-tagSelector">
                <div className="BlogPosting-tagList">
                  {ALL_TAGS.map((tag) => {
                    const isSelected = formData.tags.includes(tag);
                    return (
                      <span
                        key={tag}
                        className={`BlogPosting-tagChip ${isSelected ? 'active' : ''}`}
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="BlogPosting-field">
              <label>Status <span>*</span></label>
              <div className="BlogPosting-radioGroup">
                <label className="BlogPosting-radioLabel">
                  <input
                    type="radio"
                    name="status"
                    value="Published"
                    checked={formData.status === 'Published'}
                    onChange={handleInputChange}
                  />
                  <span>Published</span>
                </label>
                <label className="BlogPosting-radioLabel">
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

            <div className="BlogPosting-formActions">
              <button
                type="button"
                className="BlogPosting-btnReset"
                onClick={handleReset}
              >
                <FiRotateCcw /> Reset
              </button>
              <button type="submit" className="BlogPosting-btnSubmit">
                <FiCheckCircle /> Submit
              </button>
            </div>
          </form>
        </div>

        {/* Right Listing Panel */}
        <div className="BlogPosting-listCard">
          {/* Tabs and Toolbar Header */}
          <div className="BlogPosting-toolbarHeader">
            <div className="BlogPosting-tabs">
              <button
                className={`BlogPosting-tab ${activeTab === 'All' ? 'active' : ''}`}
                onClick={() => { setActiveTab('All'); setCurrentPage(1); }}
              >
                All ({counts.all})
              </button>
              <button
                className={`BlogPosting-tab ${activeTab === 'Published' ? 'active' : ''}`}
                onClick={() => { setActiveTab('Published'); setCurrentPage(1); }}
              >
                Published ({counts.published})
              </button>
              <button
                className={`BlogPosting-tab ${activeTab === 'Drafts' ? 'active' : ''}`}
                onClick={() => { setActiveTab('Drafts'); setCurrentPage(1); }}
              >
                Drafts ({counts.drafts})
              </button>
              <button
                className={`BlogPosting-tab ${activeTab === 'Trash' ? 'active' : ''}`}
                onClick={() => { setActiveTab('Trash'); setCurrentPage(1); }}
              >
                Trash ({counts.trash})
              </button>
            </div>

            <div className="BlogPosting-actionsGroup">
              {selectedIds.length > 0 && (
                <button
                  className="BlogPosting-btnBulkDelete"
                  onClick={handleBulkDelete}
                >
                  <FiTrash2 /> Delete Selected ({selectedIds.length})
                </button>
              )}

              <div className="BlogPosting-searchBox">
                <FiSearch className="BlogPosting-searchIcon" />
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

              <select
                className="BlogPosting-categorySelect"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All Categories">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <div className="BlogPosting-viewToggle">
                <button
                  className={`BlogPosting-toggleBtn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <FiGrid />
                </button>
                <button
                  className={`BlogPosting-toggleBtn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="BlogPosting-grid">
              {paginatedBlogs.length > 0 ? (
                paginatedBlogs.map((blog) => (
                  <div key={blog.id} className="BlogPosting-card">
                    <div className="BlogPosting-cardImageWrapper">
                      <img src={blog.image} alt={blog.title} />
                      <span className="BlogPosting-cardDate">{blog.date}</span>
                      <span className={`BlogPosting-badge ${getCategoryClass(blog.category)}`}>
                        {blog.category}
                      </span>
                    </div>
                    <div className="BlogPosting-cardBody">
                      <h3 className="BlogPosting-cardTitle">{blog.title}</h3>
                      <p className="BlogPosting-cardDescription">{blog.shortDescription}</p>
                      
                      <div className="BlogPosting-cardMeta">
                        <span><FiUser /> By {blog.author}</span>
                        <span><FiMessageSquare /> {blog.comments} Comments</span>
                      </div>

                      <div className="BlogPosting-cardFooter">
                        <span className={`BlogPosting-statusTag ${blog.status.toLowerCase()}`}>
                          {blog.status}
                        </span>
                        <div className="BlogPosting-cardActions">
                          <button
                            className="BlogPosting-iconBtn edit"
                            onClick={() => handleEdit(blog)}
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                          <button
                            className="BlogPosting-iconBtn delete"
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
                <div className="BlogPosting-emptyState">No blogs found.</div>
              )}
            </div>
          ) : (
            /* List View Table */
            <div className="BlogPosting-tableWrapper">
              <table className="BlogPosting-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={isAllPageSelected}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>#</th>
                    <th>Thumbnail</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Comments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBlogs.length > 0 ? (
                    paginatedBlogs.map((blog, idx) => (
                      <tr key={blog.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(blog.id)}
                            onChange={() => handleSelectOne(blog.id)}
                          />
                        </td>
                        <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                        <td>
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="BlogPosting-tableThumb"
                          />
                        </td>
                        <td className="BlogPosting-titleCell">{blog.title}</td>
                        <td>
                          <span className={`BlogPosting-badge ${getCategoryClass(blog.category)}`}>
                            {blog.category}
                          </span>
                        </td>
                        <td>{blog.author}</td>
                        <td className="BlogPosting-dateText">{blog.date}</td>
                        <td>
                          <span className={`BlogPosting-statusTag ${blog.status.toLowerCase()}`}>
                            {blog.status}
                          </span>
                        </td>
                        <td>{blog.comments}</td>
                        <td>
                          <div className="BlogPosting-cardActions">
                            <button
                              className="BlogPosting-iconBtn edit"
                              onClick={() => handleEdit(blog)}
                              title="Edit"
                            >
                              <FiEdit />
                            </button>
                            <button
                              className="BlogPosting-iconBtn delete"
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
                      <td colSpan="10" className="BlogPosting-emptyState">
                        No blogs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="BlogPosting-pagination">
            <span className="BlogPosting-paginationInfo">
              Showing {filteredBlogs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredBlogs.length)} of {filteredBlogs.length} entries
            </span>

            <div className="BlogPosting-paginationControls">
              <button
                className="BlogPosting-pageBtn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <FiChevronLeft />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`BlogPosting-pageBtn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="BlogPosting-pageBtn"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPosting;