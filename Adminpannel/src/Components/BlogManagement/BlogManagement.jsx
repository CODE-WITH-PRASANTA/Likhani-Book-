import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaFilter,
  FaList,
  FaThLarge,
  FaEye,
  FaPencilAlt,
  FaTrashAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaPlus,
  FaCalendarAlt,
  FaUser,
  FaTag
} from 'react-icons/fa';
import API, { BASE_URL } from '../../api/axios';
import './BlogManagement.css';

const getImageUrl = (imagePath) => {
  if (!imagePath)
    return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=80';
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('blob:') ||
    imagePath.startsWith('data:')
  )
    return imagePath;
  return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const BlogManagement = () => {
  const navigate = useNavigate();

  // Data States
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

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
          _id: b._id || b.id,
          title: b.title || '',
          slug: b.slug || '',
          category: b.category || '',
          author: b.author || 'Admin',
          date: b.createdAt
            ? new Date(b.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            : 'Recently',
          status: b.status || 'Published',
          shortDescription: b.shortDescription || '',
          description: b.description || '',
          tags: Array.isArray(b.tags) ? b.tags : [],
          image: b.image || '',
          pageTitle: b.pageTitle || '',
          metaTitle: b.metaTitle || '',
          metaDescription: b.metaDescription || '',
          metaKeywords: b.metaKeywords || ''
        }));
        setBlogs(fetched);
      }
    } catch (err) {
      console.error('Failed to load blogs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchBlogs();
  }, [fetchCategories, fetchBlogs]);

  // Action: Navigate to Blog Posting / Creation Studio for Editing
  const handleEdit = (blog) => {
    navigate(`/blogs/create?edit=${blog.id}`, { state: { editBlog: blog } });
  };

  // Action: Delete Single Blog
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await API.delete(`/blogs/${id}`);
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        if (viewingBlog && viewingBlog.id === id) setViewingBlog(null);
        await fetchBlogs();
      } catch (err) {
        console.error('Failed to delete blog:', err);
        alert(err.response?.data?.message || 'Failed to delete blog');
      }
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected blog(s)?`)) {
      try {
        await API.post('/blogs/bulk-delete', { ids: selectedIds });
        setSelectedIds([]);
        if (viewingBlog && selectedIds.includes(viewingBlog.id)) setViewingBlog(null);
        await fetchBlogs();
      } catch (err) {
        console.error('Failed to bulk delete blogs:', err);
        alert(err.response?.data?.message || 'Failed to delete selected blogs');
      }
    }
  };

  // Select Logic
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
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (blog.title || '').toLowerCase().includes(q) ||
        (blog.category || '').toLowerCase().includes(q) ||
        (blog.author || '').toLowerCase().includes(q);

      const matchesCat = filterCategory ? blog.category === filterCategory : true;
      const matchesStatus = filterStatus ? blog.status === filterStatus : true;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [blogs, searchQuery, filterCategory, filterStatus]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBlogs = useMemo(() => {
    return filteredBlogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBlogs, startIndex, itemsPerPage]);

  const counts = useMemo(() => {
    return {
      all: blogs.length,
      published: blogs.filter((b) => b.status === 'Published').length,
      drafts: blogs.filter((b) => b.status === 'Draft').length
    };
  }, [blogs]);

  return (
    <div className="BlogManagement">
      {/* Header */}
      <div className="BlogManagement-header">
        <div className="BlogManagement-headerLeft">
          <p className="BlogManagement-breadcrumb">
            Dashboard <span>&gt;</span> Blogs <span>&gt;</span> Blog Management
          </p>
          <h1>Blog Management</h1>
          <p className="BlogManagement-subtitle">
            View, filter, search, preview, and manage all your published and draft articles
          </p>
        </div>

        <div className="BlogManagement-headerRight">
          <div className="BlogManagement-statsPills">
            <div className="BlogManagement-statPill">
              <span className="stat-label">Total Posts</span>
              <span className="stat-value">{counts.all}</span>
            </div>
            <div className="BlogManagement-statPill published">
              <span className="stat-label">Published</span>
              <span className="stat-value">{counts.published}</span>
            </div>
            <div className="BlogManagement-statPill draft">
              <span className="stat-label">Drafts</span>
              <span className="stat-value">{counts.drafts}</span>
            </div>
          </div>

          <button
            type="button"
            className="BlogManagement-btnCreateNew"
            onClick={() => navigate('/blogs/create')}
          >
            <FaPlus /> Add New Blog Post
          </button>
        </div>
      </div>

      {/* FULL WIDTH LIST CARD - NO FORM */}
      <div className="BlogManagement-container">
        <div className="BlogManagement-listCard">
          {/* List Header Toolbar */}
          <div className="BlogManagement-listHeader">
            <div className="BlogManagement-listTitleGroup">
              <h2>All Blog Articles ({filteredBlogs.length})</h2>
              {(filterCategory || filterStatus || searchQuery) && (
                <span className="BlogManagement-filterNotice">Filtered results active</span>
              )}
            </div>

            <div className="BlogManagement-controls">
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  className="BlogManagement-btnBulkDelete"
                  onClick={handleBulkDelete}
                >
                  <FaTrashAlt /> Delete Selected ({selectedIds.length})
                </button>
              )}

              {/* Search Box */}
              <div className="BlogManagement-searchBox">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search by title, author, category..."
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
                  type="button"
                  className={`BlogManagement-filterBtn ${
                    filterCategory || filterStatus ? 'active' : ''
                  }`}
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <FaFilter /> Filters {filterCategory || filterStatus ? '(Active)' : ''}
                </button>

                {showFilterDropdown && (
                  <div className="BlogManagement-filterDropdown">
                    <div className="BlogManagement-filterItem">
                      <label>Category</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => {
                          setFilterCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="BlogManagement-filterItem">
                      <label>Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => {
                          setFilterStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Statuses</option>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className="BlogManagement-clearFilterBtn"
                      onClick={() => {
                        setFilterCategory('');
                        setFilterStatus('');
                        setShowFilterDropdown(false);
                        setCurrentPage(1);
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="BlogManagement-viewToggle">
                <button
                  type="button"
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  title="Table List View"
                >
                  <FaList />
                </button>
                <button
                  type="button"
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  title="Grid Cards View"
                >
                  <FaThLarge />
                </button>
              </div>
            </div>
          </div>

          {/* Table View */}
          {loading ? (
            <div className="BlogManagement-loadingState">
              <div className="BlogManagement-spinner" />
              <p>Loading blog posts...</p>
            </div>
          ) : viewMode === 'list' ? (
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
                    <th>Cover</th>
                    <th>Title & Excerpt</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBlogs.length > 0 ? (
                    paginatedBlogs.map((blog, idx) => (
                      <tr
                        key={blog.id}
                        className={selectedIds.includes(blog.id) ? 'selected-row' : ''}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(blog.id)}
                            onChange={() => handleSelectOne(blog.id)}
                          />
                        </td>
                        <td>{startIndex + idx + 1}</td>
                        <td>
                          <img
                            src={getImageUrl(blog.image)}
                            alt={blog.title}
                            className="BlogManagement-tableImg"
                          />
                        </td>
                        <td className="BlogManagement-titleCell">
                          <strong>{blog.title}</strong>
                          {blog.shortDescription && (
                            <p className="BlogManagement-tableExcerpt">
                              {blog.shortDescription}
                            </p>
                          )}
                          {blog.slug && (
                            <span className="BlogManagement-tableSlug">/blog/{blog.slug}</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`BlogManagement-catBadge ${(blog.category || '')
                              .toLowerCase()
                              .replace(/\s+/g, '-')}`}
                          >
                            {blog.category}
                          </span>
                        </td>
                        <td>{blog.author}</td>
                        <td className="BlogManagement-dateCell">{blog.date}</td>
                        <td>
                          <span
                            className={`BlogManagement-statusBadge ${(
                              blog.status || ''
                            ).toLowerCase()}`}
                          >
                            {blog.status}
                          </span>
                        </td>
                        <td>
                          <div className="BlogManagement-actionGroup">
                            <button
                              type="button"
                              className="BlogManagement-actionBtn view"
                              onClick={() => setViewingBlog(blog)}
                              title="Quick View"
                            >
                              <FaEye />
                            </button>
                            <button
                              type="button"
                              className="BlogManagement-actionBtn edit"
                              onClick={() => handleEdit(blog)}
                              title="Edit in Blog Posting"
                            >
                              <FaPencilAlt />
                            </button>
                            <button
                              type="button"
                              className="BlogManagement-actionBtn delete"
                              onClick={() => handleDelete(blog.id)}
                              title="Delete Post"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="BlogManagement-emptyRow">
                        No blog posts found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="BlogManagement-gridWrapper">
              {paginatedBlogs.length > 0 ? (
                paginatedBlogs.map((blog) => (
                  <div key={blog.id} className="BlogManagement-gridCard">
                    <div className="BlogManagement-gridCardImg">
                      <img src={getImageUrl(blog.image)} alt={blog.title} />
                      <span
                        className={`BlogManagement-statusBadge ${(
                          blog.status || ''
                        ).toLowerCase()}`}
                      >
                        {blog.status}
                      </span>
                    </div>
                    <div className="BlogManagement-gridCardBody">
                      <div className="BlogManagement-gridCardHeader">
                        <span
                          className={`BlogManagement-catBadge ${(blog.category || '')
                            .toLowerCase()
                            .replace(/\s+/g, '-')}`}
                        >
                          {blog.category}
                        </span>
                        <span className="BlogManagement-gridDate">{blog.date}</span>
                      </div>

                      <h3>{blog.title}</h3>
                      <p className="BlogManagement-gridDesc">
                        {blog.shortDescription || 'No description provided.'}
                      </p>

                      <div className="BlogManagement-gridCardFooter">
                        <span className="BlogManagement-gridAuthor">
                          <FaUser /> {blog.author}
                        </span>

                        <div className="BlogManagement-actionGroup">
                          <button
                            type="button"
                            className="BlogManagement-actionBtn view"
                            onClick={() => setViewingBlog(blog)}
                            title="Quick View"
                          >
                            <FaEye />
                          </button>
                          <button
                            type="button"
                            className="BlogManagement-actionBtn edit"
                            onClick={() => handleEdit(blog)}
                            title="Edit in Blog Posting"
                          >
                            <FaPencilAlt />
                          </button>
                          <button
                            type="button"
                            className="BlogManagement-actionBtn delete"
                            onClick={() => handleDelete(blog.id)}
                            title="Delete"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="BlogManagement-emptyGrid">
                  <p>No blog posts found matching your criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* Footer & Pagination */}
          <div className="BlogManagement-paginationContainer">
            <span className="BlogManagement-showingText">
              Showing {filteredBlogs.length === 0 ? 0 : startIndex + 1} to{' '}
              {Math.min(startIndex + itemsPerPage, filteredBlogs.length)} of {filteredBlogs.length} posts
            </span>

            {filteredBlogs.length > 0 && (
              <div className="BlogManagement-pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <FaChevronLeft />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={currentPage === page ? 'active' : ''}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewingBlog && (
        <div className="BlogManagement-modalOverlay" onClick={() => setViewingBlog(null)}>
          <div className="BlogManagement-modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="BlogManagement-modalHeader">
              <h3>Article Details</h3>
              <button
                type="button"
                className="BlogManagement-modalCloseBtn"
                onClick={() => setViewingBlog(null)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="BlogManagement-modalBody">
              <div className="BlogManagement-modalImgWrapper">
                <img
                  src={getImageUrl(viewingBlog.image)}
                  alt={viewingBlog.title}
                  className="BlogManagement-modalImg"
                />
              </div>

              <h2>{viewingBlog.title}</h2>

              <div className="BlogManagement-modalMeta">
                <span
                  className={`BlogManagement-catBadge ${(viewingBlog.category || '')
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                >
                  {viewingBlog.category}
                </span>
                <span>
                  <FaCalendarAlt /> {viewingBlog.date}
                </span>
                <span>
                  <FaUser /> {viewingBlog.author}
                </span>
                <span
                  className={`BlogManagement-statusBadge ${(
                    viewingBlog.status || ''
                  ).toLowerCase()}`}
                >
                  {viewingBlog.status}
                </span>
              </div>

              {viewingBlog.slug && (
                <p className="BlogManagement-modalSlug">
                  <strong>URL Slug:</strong> /blog/{viewingBlog.slug}
                </p>
              )}

              {viewingBlog.shortDescription && (
                <div className="BlogManagement-modalExcerpt">
                  <strong>Excerpt:</strong>
                  <p>{viewingBlog.shortDescription}</p>
                </div>
              )}

              <div className="BlogManagement-modalContentWrapper">
                <strong>Article Content:</strong>
                <div
                  className="BlogManagement-modalContentArea"
                  dangerouslySetInnerHTML={{ __html: viewingBlog.description }}
                />
              </div>

              {viewingBlog.tags && viewingBlog.tags.length > 0 && (
                <div className="BlogManagement-modalTags">
                  <strong>Tags:</strong>
                  <div className="BlogManagement-tagsList">
                    {viewingBlog.tags.map((t) => (
                      <span key={t} className="BlogManagement-tagChip">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="BlogManagement-modalFooter">
              <button
                type="button"
                className="BlogManagement-modalBtnEdit"
                onClick={() => {
                  const b = viewingBlog;
                  setViewingBlog(null);
                  handleEdit(b);
                }}
              >
                <FaPencilAlt /> Edit This Article in Studio
              </button>
              <button
                type="button"
                className="BlogManagement-modalBtnClose"
                onClick={() => setViewingBlog(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;