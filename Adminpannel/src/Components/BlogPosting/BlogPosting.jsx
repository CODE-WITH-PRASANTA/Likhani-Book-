import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
import API, { BASE_URL } from '../../api/axios';
import './BlogPosting.css';

const getImageUrl = (imagePath) => {
  if (!imagePath)
    return 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500';
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('blob:') ||
    imagePath.startsWith('data:')
  )
    return imagePath;
  return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const AUTHORS = ['Admin', 'John Doe', 'Sarah Smith', 'Editor Team'];
const ALL_TAGS = ['Education', 'Learning', 'Kids', 'Mind', 'Travel', 'Adventure', 'Romance', 'Books', 'Fiction', 'Habits', 'Tips', 'Tech'];

const BlogPosting = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  /* =========================================================
      FETCH CATEGORIES
  ========================================================= */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await API.get('/categories');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCategories(res.data.data.map((c) => c.name));
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  /* =========================================================
      FETCH BLOGS
  ========================================================= */
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/blogs', { params: { limit: 100 } });
      if (res.data?.success && Array.isArray(res.data.data)) {
        const fetched = res.data.data.map((b) => ({
          id: b._id || b.id,
          title: b.title,
          slug: b.slug,
          category: b.category,
          author: b.author || 'Admin',
          date: b.createdAt
            ? new Date(b.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            : 'Recently',
          status: b.status || 'Published',
          comments: b.comments || 0,
          shortDescription: b.shortDescription || '',
          description: b.description || '',
          tags: b.tags || [],
          image: b.image || ''
        }));
        setBlogs(fetched);
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchBlogs();
  }, [fetchCategories, fetchBlogs]);

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
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          featuredImage: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.category.trim()) {
      alert('Please fill out all required fields (Title and Category).');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || undefined,
        shortDescription: formData.shortDescription,
        description: formData.description,
        category: formData.category,
        author: formData.author || 'Admin',
        tags: formData.tags,
        status: formData.status,
        image: formData.imagePreview || ''
      };

      if (editingId) {
        await API.put(`/blogs/${editingId}`, payload);
      } else {
        await API.post('/blogs', payload);
      }

      await fetchBlogs();
      handleReset();
    } catch (err) {
      console.error('Failed to save blog:', err);
      alert(err.response?.data?.message || 'Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (blog) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      shortDescription: blog.shortDescription || '',
      description: blog.description || '',
      featuredImage: null,
      imagePreview: blog.image || '',
      category: blog.category || '',
      author: blog.author || 'Admin',
      tags: blog.tags || [],
      status: blog.status || 'Published'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await API.delete(`/blogs/${id}`);
        setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
        if (editingId === id) handleReset();
        await fetchBlogs();
      } catch (err) {
        console.error('Failed to delete blog:', err);
        alert(err.response?.data?.message || 'Failed to delete blog');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected blog post(s)?`)) {
      try {
        await API.post('/blogs/bulk-delete', { ids: selectedIds });
        if (selectedIds.includes(editingId)) handleReset();
        setSelectedIds([]);
        await fetchBlogs();
      } catch (err) {
        console.error('Failed to delete selected blogs:', err);
        alert(err.response?.data?.message || 'Failed to delete selected blogs');
      }
    }
  };

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const titleMatch = (blog.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      const catMatch = (blog.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = titleMatch || catMatch;

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
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                      'preview', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar:
                      'undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | removeformat',
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
                      src={getImageUrl(formData.imagePreview)}
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
                    <p className="BlogPosting-uploadSubtext">JPG, PNG, WebP (Max 5MB)</p>
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
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  {/* Fallback option if user types or custom category */}
                  {formData.category && !categories.includes(formData.category) && (
                    <option value={formData.category}>{formData.category}</option>
                  )}
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
                disabled={saving}
              >
                <FiRotateCcw /> Reset
              </button>
              <button
                type="submit"
                className="BlogPosting-btnSubmit"
                disabled={saving}
              >
                <FiCheckCircle /> {saving ? 'Saving...' : editingId ? 'Update Post' : 'Submit Post'}
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
                {categories.map((cat) => (
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
          {loading ? (
            <div className="BlogPosting-emptyState">Loading blogs...</div>
          ) : viewMode === 'grid' ? (
            <div className="BlogPosting-grid">
              {paginatedBlogs.length > 0 ? (
                paginatedBlogs.map((blog) => (
                  <div key={blog.id} className="BlogPosting-card">
                    <div className="BlogPosting-cardImageWrapper">
                      <img src={getImageUrl(blog.image)} alt={blog.title} />
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
                            src={getImageUrl(blog.image)}
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