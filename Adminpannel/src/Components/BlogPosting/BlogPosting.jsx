import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
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
  FiCheckCircle,
  FiFileText,
  FiTag,
  FiZap,
  FiX,
  FiLayers,
  FiGlobe
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

const SUGGESTED_TAGS = [
  'Books',
  'Reading',
  'Literature',
  'Education',
  'Kids',
  'Author Insights',
  'Novel',
  'Study Tips'
];

const BlogPosting = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const editIdParam = searchParams.get('edit') || searchParams.get('id');

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
    status: 'Published',
    pageTitle: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: ''
  });
  const [tagInput, setTagInput] = useState('');

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
          _id: b._id || b.id,
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
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchBlogs();
  }, [fetchCategories, fetchBlogs]);

  const slugify = (text) => {
    return (text || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-generate slug when post title is typed
      if (name === 'title') {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleGenerateSlug = () => {
    if (!formData.title) return;
    setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
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

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      featuredImage: null,
      imagePreview: ''
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddTag = (tagToAdd) => {
    const raw = (typeof tagToAdd === 'string' ? tagToAdd : tagInput || '').trim();
    if (!raw) return;

    const parts = raw
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setFormData((prev) => {
      const existing = Array.isArray(prev.tags) ? [...prev.tags] : [];
      parts.forEach((tag) => {
        if (!existing.some((t) => t.toLowerCase() === tag.toLowerCase())) {
          existing.push(tag);
        }
      });
      return { ...prev, tags: existing };
    });

    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tagToRemove)
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
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
      status: 'Published',
      pageTitle: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ''
    });
    setTagInput('');
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (editIdParam) {
      navigate('/blogs/create', { replace: true, state: {} });
    }
  };

  const handleEdit = useCallback((blog) => {
    if (!blog) return;
    setEditingId(blog.id || blog._id);
    setFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      shortDescription: blog.shortDescription || '',
      description: blog.description || '',
      featuredImage: null,
      imagePreview: blog.image || blog.imagePreview || '',
      category: blog.category || '',
      author: blog.author || 'Admin',
      tags: Array.isArray(blog.tags) ? blog.tags : [],
      status: blog.status || 'Published',
      pageTitle: blog.pageTitle || '',
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      metaKeywords: blog.metaKeywords || ''
    });
    const formSection = document.getElementById('blog-posting-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);


  // Auto-load blog if directed via ?edit=ID or navigation state
  useEffect(() => {
    const targetId = editIdParam || location.state?.editBlog?.id || location.state?.editBlog?._id;
    if (!targetId) return;

    // 1. Initial responsive fill if passed via state
    if (location.state?.editBlog) {
      handleEdit(location.state.editBlog);
    } else if (blogs.length > 0) {
      const found = blogs.find(
        (b) => String(b.id) === String(targetId) || String(b._id) === String(targetId)
      );
      if (found) {
        handleEdit(found);
      }
    }

    // 2. ALWAYS fetch fresh, complete blog document with all SEO & Meta fields directly from API
    let isMounted = true;
    API.get(`/blogs/${targetId}`)
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && res.data.data) {
          const b = res.data.data;
          handleEdit({
            id: b._id || b.id,
            _id: b._id || b.id,
            title: b.title || '',
            slug: b.slug || '',
            category: b.category || '',
            author: b.author || 'Admin',
            status: b.status || 'Published',
            shortDescription: b.shortDescription || '',
            description: b.description || '',
            tags: Array.isArray(b.tags) ? b.tags : [],
            image: b.image || '',
            pageTitle: b.pageTitle || '',
            metaTitle: b.metaTitle || '',
            metaDescription: b.metaDescription || '',
            metaKeywords: b.metaKeywords || ''
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load authoritative blog data for editing:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [editIdParam, location.state, handleEdit]);

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
        image: formData.imagePreview || '',
        pageTitle: (formData.pageTitle || '').trim(),
        metaTitle: (formData.metaTitle || '').trim(),
        metaDescription: (formData.metaDescription || '').trim(),
        metaKeywords: (formData.metaKeywords || '').trim()
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
      {/* FULL DIV: Blog Posting Form Section */}
      <section className="BlogPosting-formSection" id="blog-posting-form-section">
        <div className="BlogPosting-formCard">
          {/* Card Header */}
          <div className="BlogPosting-formCardHeader">
            <div className="BlogPosting-formCardHeaderLeft">
              <div className="BlogPosting-headerIconBadge">
                <FiFileText />
              </div>
              <div>
                <h2 className="BlogPosting-cardTitle">
                  {editingId ? 'Edit Blog Article' : 'Create New Blog Post'}
                </h2>
                <p className="BlogPosting-cardSubtitle">
                  {editingId
                    ? `Currently editing "${formData.title || 'Untitled'}". Update details and save changes.`
                    : 'Fill in the article details below to publish directly or save as a draft.'}
                </p>
              </div>
            </div>

            <div className="BlogPosting-formCardHeaderRight">
              <button
                type="button"
                className="BlogPosting-btnNavToManage"
                onClick={() => navigate('/blogs/management')}
                title="View All Blogs"
              >
                <FiList /> View All Blogs
              </button>
              {editingId && (
                <button
                  type="button"
                  className="BlogPosting-btnCancelEdit"
                  onClick={handleReset}
                >
                  <FiX /> Cancel Edit
                </button>
              )}
              <button
                type="button"
                className="BlogPosting-btnClearForm"
                onClick={handleReset}
                disabled={saving}
              >
                <FiRotateCcw /> Reset Form
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="BlogPosting-form">
            <div className="BlogPosting-studioLayout">
              {/* Left Column: Primary Content (Title, Slug, Excerpt, Rich Editor) */}
              <div className="BlogPosting-mainColumn">
                {/* Title */}
                <div className="BlogPosting-field">
                  <div className="BlogPosting-fieldHeader">
                    <label htmlFor="blog-title">
                      Post Title <span>*</span>
                    </label>
                    <span className="BlogPosting-charCounter">
                      {formData.title.length} characters
                    </span>
                  </div>
                  <input
                    id="blog-title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. 10 Timeless Classic Novels Every Reader Should Experience"
                    required
                    className="BlogPosting-inputTitle"
                  />
                </div>

                {/* Slug with Auto-generate indicator */}
                <div className="BlogPosting-field">
                  <div className="BlogPosting-fieldHeader">
                    <label htmlFor="blog-slug">
                      Permalink / Slug <span>*</span>
                    </label>
                    <span className="BlogPosting-autoSlugBadge">
                      ⚡ Auto-generated from title
                    </span>
                  </div>
                  <div className="BlogPosting-slugInputGroup">
                    <span className="BlogPosting-slugDomain">likhanibooks.com/blog/</span>
                    <input
                      id="blog-slug"
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="auto-generated-blog-slug"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div className="BlogPosting-field">
                  <div className="BlogPosting-fieldHeader">
                    <label htmlFor="blog-shortDescription">
                      Short Description / Excerpt <span>*</span>
                    </label>
                    <span
                      className={`BlogPosting-charCounter ${
                        formData.shortDescription.length > 250 ? 'warning' : ''
                      }`}
                    >
                      {formData.shortDescription.length} / 250 characters
                    </span>
                  </div>
                  <textarea
                    id="blog-shortDescription"
                    name="shortDescription"
                    rows="3"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    placeholder="Write a concise, engaging summary of this blog post for listings, social previews, and search engines..."
                    required
                  />
                </div>

                {/* Full Article Content (TinyMCE Rich Text Editor) */}
                <div className="BlogPosting-field BlogPosting-field--editor">
                  <div className="BlogPosting-fieldHeader">
                    <label>
                      Article Content (Rich Text) <span>*</span>
                    </label>
                    <span className="BlogPosting-fieldHint">
                      Format headings, lists, blockquotes, media, and typography
                    </span>
                  </div>
                  <div className="BlogPosting-editorWrapper">
                    <Editor
                      apiKey="jeq7g2k84sqpi9364o8x9ptqf09aoesaq8jxmp49dl4sh57z"
                      value={formData.description}
                      onEditorChange={handleEditorChange}
                      init={{
                        height: 380,
                        menubar: true,
                        plugins: [
                          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                          'preview', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                        ],
                        toolbar:
                          'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | blockquote code fullscreen | removeformat',
                        content_style:
                          'body { font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; padding: 12px; }'
                      }}
                    />
                  </div>
                </div>

                {/* SEO & Meta Information Box */}
                <div className="BlogPosting-seoBox">
                  <div className="BlogPosting-seoHeader">
                    <div className="BlogPosting-seoIconWrap">
                      <FiGlobe />
                    </div>
                    <div>
                      <h3 className="BlogPosting-seoTitle">SEO & Meta Information</h3>
                    </div>
                  </div>

                  <div className="BlogPosting-seoFields">
                    {/* Page Title & Meta Title in 2-column grid */}
                    <div className="BlogPosting-seoRow">
                      {/* Page Title */}
                      <div className="BlogPosting-field">
                        <div className="BlogPosting-fieldHeader">
                          <label htmlFor="blog-pageTitle">Page Title</label>
                        </div>
                        <input
                          id="blog-pageTitle"
                          type="text"
                          name="pageTitle"
                          value={formData.pageTitle}
                          onChange={handleInputChange}
                          placeholder="Page Title"
                          className="BlogPosting-seoInput"
                        />
                      </div>

                      {/* Meta Title */}
                      <div className="BlogPosting-field">
                        <div className="BlogPosting-fieldHeader">
                          <label htmlFor="blog-metaTitle">Meta Title</label>
                        </div>
                        <input
                          id="blog-metaTitle"
                          type="text"
                          name="metaTitle"
                          value={formData.metaTitle}
                          onChange={handleInputChange}
                          placeholder="Meta Title"
                          className="BlogPosting-seoInput"
                        />
                      </div>
                    </div>

                    {/* Meta Description */}
                    <div className="BlogPosting-field">
                      <div className="BlogPosting-fieldHeader">
                        <label htmlFor="blog-metaDescription">Meta Description</label>
                      </div>
                      <textarea
                        id="blog-metaDescription"
                        name="metaDescription"
                        rows="3"
                        value={formData.metaDescription}
                        onChange={handleInputChange}
                        placeholder="Meta Description"
                        className="BlogPosting-seoTextarea"
                      />
                    </div>

                    {/* Meta Keywords */}
                    <div className="BlogPosting-field">
                      <div className="BlogPosting-fieldHeader">
                        <label htmlFor="blog-metaKeywords">Meta Keywords</label>
                      </div>
                      <input
                        id="blog-metaKeywords"
                        type="text"
                        name="metaKeywords"
                        value={formData.metaKeywords}
                        onChange={handleInputChange}
                        placeholder="e.g. odia literature, best books, novel, reading list"
                        className="BlogPosting-seoInput"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Publishing Sidebar Settings */}
              <div className="BlogPosting-sidebarColumn">
                {/* Publishing Controls Card */}
                <div className="BlogPosting-widgetCard">
                  <h3 className="BlogPosting-widgetTitle">
                    <FiCheckCircle /> Publishing Settings
                  </h3>

                  {/* Status Radio Pills */}
                  <div className="BlogPosting-statusSelector">
                    <label
                      className={`BlogPosting-statusPill ${
                        formData.status === 'Published' ? 'active-published' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="Published"
                        checked={formData.status === 'Published'}
                        onChange={handleInputChange}
                      />
                      <span className="BlogPosting-statusDot published" />
                      <div>
                        <strong>Published</strong>
                        <small>Live on bookstore blog</small>
                      </div>
                    </label>

                    <label
                      className={`BlogPosting-statusPill ${
                        formData.status === 'Draft' ? 'active-draft' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="Draft"
                        checked={formData.status === 'Draft'}
                        onChange={handleInputChange}
                      />
                      <span className="BlogPosting-statusDot draft" />
                      <div>
                        <strong>Draft</strong>
                        <small>Save privately to edit later</small>
                      </div>
                    </label>
                  </div>

                  {/* Author Name */}
                  <div className="BlogPosting-widgetField">
                    <label htmlFor="blog-author">
                      Author Name <span>*</span>
                    </label>
                    <div className="BlogPosting-inputWithIcon">
                      <FiUser className="BlogPosting-fieldIcon" />
                      <input
                        id="blog-author"
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        placeholder="e.g. Admin or Author Name"
                        required
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="BlogPosting-widgetActions">
                    <button
                      type="submit"
                      className="BlogPosting-btnSubmitMain"
                      disabled={saving}
                    >
                      <FiCheckCircle />
                      {saving
                        ? 'Saving Post...'
                        : editingId
                        ? 'Update Blog Post'
                        : 'Publish Blog Post'}
                    </button>
                    <button
                      type="button"
                      className="BlogPosting-btnResetSecondary"
                      onClick={handleReset}
                      disabled={saving}
                    >
                      <FiRotateCcw /> Reset
                    </button>
                  </div>
                </div>

                {/* Featured Cover Image Card */}
                <div className="BlogPosting-widgetCard">
                  <div className="BlogPosting-widgetHeaderRow">
                    <h3 className="BlogPosting-widgetTitle">
                      <FiUploadCloud /> Featured Cover Image <span>*</span>
                    </h3>
                    {formData.imagePreview && (
                      <button
                        type="button"
                        className="BlogPosting-btnRemoveImage"
                        onClick={handleRemoveImage}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div
                    className={`BlogPosting-dropzone ${formData.imagePreview ? 'has-preview' : ''}`}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
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
                          alt="Cover Preview"
                          className="BlogPosting-imagePreview"
                        />
                        <div className="BlogPosting-previewHoverOverlay">
                          <span>Click to change cover image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="BlogPosting-dropzoneContent">
                        <div className="BlogPosting-uploadIconCircle">
                          <FiUploadCloud className="BlogPosting-uploadIcon" />
                        </div>
                        <p className="BlogPosting-uploadText">
                          <strong>Click to upload</strong> or drag & drop
                        </p>
                        <p className="BlogPosting-uploadSubtext">JPG, PNG, WebP (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category & Tags Card */}
                <div className="BlogPosting-widgetCard">
                  <h3 className="BlogPosting-widgetTitle">
                    <FiTag /> Category & Tags
                  </h3>

                  {/* Category Selection */}
                  <div className="BlogPosting-widgetField">
                    <label htmlFor="blog-category">
                      Category <span>*</span>
                    </label>
                    <select
                      id="blog-category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="BlogPosting-selectCategory"
                    >
                      <option value="" disabled>Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      {formData.category && !categories.includes(formData.category) && (
                        <option value={formData.category}>{formData.category}</option>
                      )}
                    </select>
                  </div>

                  {/* Tags Manager */}
                  <div className="BlogPosting-widgetField">
                    <label>Article Tags</label>
                    <div className="BlogPosting-tagInputGroup">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Type tag & press Enter..."
                      />
                      <button
                        type="button"
                        className="BlogPosting-btnTagAdd"
                        onClick={() => handleAddTag(tagInput)}
                      >
                        Add
                      </button>
                    </div>

                    {/* Tag Chips */}
                    <div className="BlogPosting-tagChipsContainer">
                      {formData.tags && formData.tags.length > 0 ? (
                        formData.tags.map((tag) => (
                          <span key={tag} className="BlogPosting-tagBadge">
                            #{tag}
                            <button
                              type="button"
                              className="BlogPosting-tagRemoveBtn"
                              onClick={() => handleRemoveTag(tag)}
                              title={`Remove ${tag}`}
                            >
                              ×
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="BlogPosting-noTagsText">
                          No tags added yet. Type above to add keywords.
                        </span>
                      )}
                    </div>

                    {/* Quick Suggested Tags */}
                    <div className="BlogPosting-suggestedTags">
                      <span className="suggested-label">Quick suggestions:</span>
                      <div className="BlogPosting-suggestedTagsList">
                        {SUGGESTED_TAGS.filter(
                          (t) =>
                            !(formData.tags || []).some(
                              (existing) => existing.toLowerCase() === t.toLowerCase()
                            )
                        )
                          .slice(0, 5)
                          .map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              className="BlogPosting-suggestedTagBtn"
                              onClick={() => handleAddTag(sug)}
                            >
                              + {sug}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* FULL DIV: Blog Listing & Management Section Below */}
      <section className="BlogPosting-listSection" id="blog-posting-list-section">
        <div className="BlogPosting-listCard">
          {/* Section Heading */}
          <div className="BlogPosting-listCardHeader">
            <div>
              <h2 className="BlogPosting-listSectionTitle">
                <FiLayers /> All Blog Posts
              </h2>
              <p className="BlogPosting-listSectionSubtitle">
                Browse, search, edit, or delete existing blog posts
              </p>
            </div>

            {selectedIds.length > 0 && (
              <button
                type="button"
                className="BlogPosting-btnBulkDelete"
                onClick={handleBulkDelete}
              >
                <FiTrash2 /> Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>

          {/* Tabs and Filter Toolbar */}
          <div className="BlogPosting-toolbarHeader">
            <div className="BlogPosting-tabs">
              <button
                className={`BlogPosting-tab ${activeTab === 'All' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('All');
                  setCurrentPage(1);
                }}
              >
                All ({counts.all})
              </button>
              <button
                className={`BlogPosting-tab ${activeTab === 'Published' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('Published');
                  setCurrentPage(1);
                }}
              >
                Published ({counts.published})
              </button>
              <button
                className={`BlogPosting-tab ${activeTab === 'Drafts' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('Drafts');
                  setCurrentPage(1);
                }}
              >
                Drafts ({counts.drafts})
              </button>
              <button
                className={`BlogPosting-tab ${activeTab === 'Trash' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('Trash');
                  setCurrentPage(1);
                }}
              >
                Trash ({counts.trash})
              </button>
            </div>

            <div className="BlogPosting-actionsGroup">
              <div className="BlogPosting-searchBox">
                <FiSearch className="BlogPosting-searchIcon" />
                <input
                  type="text"
                  placeholder="Search articles by title or category..."
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
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
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
            <div className="BlogPosting-emptyState">
              <div className="BlogPosting-spinner" />
              <p>Loading blogs...</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="BlogPosting-grid">
              {paginatedBlogs.length > 0 ? (
                paginatedBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className={`BlogPosting-card ${editingId === blog.id ? 'is-editing' : ''}`}
                  >
                    <div className="BlogPosting-cardImageWrapper">
                      <img src={getImageUrl(blog.image)} alt={blog.title} />
                      <span className="BlogPosting-cardDate">{blog.date}</span>
                      <span className={`BlogPosting-badge ${getCategoryClass(blog.category)}`}>
                        {blog.category}
                      </span>
                    </div>
                    <div className="BlogPosting-cardBody">
                      <h3 className="BlogPosting-cardTitle">{blog.title}</h3>
                      <p className="BlogPosting-cardDescription">
                        {blog.shortDescription || 'No description provided.'}
                      </p>

                      <div className="BlogPosting-cardMeta">
                        <span>
                          <FiUser /> By {blog.author}
                        </span>
                        <span>
                          <FiMessageSquare /> {blog.comments} Comments
                        </span>
                      </div>

                      <div className="BlogPosting-cardFooter">
                        <span className={`BlogPosting-statusTag ${blog.status.toLowerCase()}`}>
                          {blog.status}
                        </span>
                        <div className="BlogPosting-cardActions">
                          <button
                            className="BlogPosting-iconBtn edit"
                            onClick={() => handleEdit(blog)}
                            title="Edit this post"
                          >
                            <FiEdit />
                          </button>
                          <button
                            className="BlogPosting-iconBtn delete"
                            onClick={() => handleDelete(blog.id)}
                            title="Delete this post"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="BlogPosting-emptyState">
                  <FiFileText className="empty-icon" />
                  <p>No blog articles found matching your criteria.</p>
                </div>
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
                    <th>Cover</th>
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
                        <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                        <td>
                          <img
                            src={getImageUrl(blog.image)}
                            alt={blog.title}
                            className="BlogPosting-tableThumb"
                          />
                        </td>
                        <td className="BlogPosting-titleCell">
                          <strong>{blog.title}</strong>
                          {blog.slug && (
                            <span className="BlogPosting-tableSlug">/blog/{blog.slug}</span>
                          )}
                        </td>
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
                        No blog posts found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredBlogs.length > 0 && (
            <div className="BlogPosting-pagination">
              <span className="BlogPosting-paginationInfo">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredBlogs.length)} of {filteredBlogs.length}{' '}
                entries
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
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogPosting;