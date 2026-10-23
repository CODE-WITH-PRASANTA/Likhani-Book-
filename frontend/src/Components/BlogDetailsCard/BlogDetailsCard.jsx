import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  FaUser,
  FaComments,
  FaTag,
  FaSearch,
  FaCalendarAlt,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaArrowRight,
  FaArrowLeft,
} from 'react-icons/fa'
import API, { IMG_URL } from '../../api/axios'
import './BlogDetailsCard.css'

// Fallback assets
import mainHeroImg from '../../assets/16.webp'
import recentPost1 from '../../assets/11.webp'
import recentPost2 from '../../assets/12.webp'
import recentPost3 from '../../assets/13.webp'

const BlogDetailsCard = () => {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const blogId = searchParams.get('id')
  const blogSlugParam = searchParams.get('slug')
  const targetIdentifier = slug || blogSlugParam || blogId

  const [currentBlog, setCurrentBlog] = useState(null)
  const [recentBlogs, setRecentBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Search & Comment states
  const [searchQuery, setSearchQuery] = useState('')
  const [comments, setComments] = useState([])
  const [submittingComment, setSubmittingComment] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [commentSuccess, setCommentSuccess] = useState('')
  const [commentError, setCommentError] = useState('')

  // Helper to resolve image URLs
  const getImageUrl = (imgPath, fallback = mainHeroImg) => {
    if (!imgPath) return fallback
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('data:')) {
      return imgPath
    }
    return `${IMG_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`
  }

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  // Fetch current blog, dynamic categories, and recent posts in parallel with fail-safe completion
  useEffect(() => {
    let cancelled = false

    // Safety timeout: ensure loading state is cleared even on slow network
    const safetyTimer = setTimeout(() => {
      if (!cancelled) {
        setIsLoading(false)
      }
    }, 3500)

    const loadData = async () => {
      try {
        setIsLoading(true)
        setNotFound(false)

        const [blogResult, catResult, recentResult, commentsResult] = await Promise.allSettled([
          targetIdentifier
            ? API.get(`/blogs/${encodeURIComponent(targetIdentifier)}`)
            : API.get('/blogs', { params: { limit: 1, status: 'Published' } }),
          API.get('/blogs/categories'),
          API.get('/blogs', { params: { limit: 4, status: 'Published', sort: 'latest' } }),
          targetIdentifier
            ? API.get(`/comments/blog/${encodeURIComponent(targetIdentifier)}`)
            : Promise.resolve({ data: { success: true, data: [] } }),
        ])

        if (cancelled) return

        // 1. Process blog details
        let fetchedBlog = null
        if (blogResult.status === 'fulfilled' && blogResult.value?.data?.success) {
          const resData = blogResult.value.data.data
          fetchedBlog = Array.isArray(resData) ? resData[0] : resData
        }

        if (fetchedBlog) {
          setCurrentBlog(fetchedBlog)
          setNotFound(false)
        } else {
          setNotFound(true)
        }

        // 2. Process dynamic categories
        if (catResult.status === 'fulfilled' && catResult.value?.data?.success) {
          setCategories(catResult.value.data.data || [])
        }

        // 3. Process recent blogs
        if (recentResult.status === 'fulfilled' && recentResult.value?.data?.success) {
          const list = recentResult.value.data.data || []
          setRecentBlogs(list.filter((b) => b._id !== fetchedBlog?._id))
        }

        // 4. Process comments strictly for this blog
        if (commentsResult.status === 'fulfilled' && commentsResult.value?.data?.success) {
          setComments(commentsResult.value.data.data || [])
        }
      } catch (err) {
        console.error('Error in blog details loader:', err)
        if (!cancelled) setNotFound(true)
      } finally {
        clearTimeout(safetyTimer)
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
      clearTimeout(safetyTimer)
    }
  }, [targetIdentifier])

  // Dynamically set document title and meta tags based on current blog data
  useEffect(() => {
    if (currentBlog) {
      const pageTitleText =
        currentBlog.pageTitle || currentBlog.metaTitle || currentBlog.title || 'Blog Post'
      document.title = `${pageTitleText} | Lekhani Books`

      const setMetaTag = (attrName, attrVal, content) => {
        if (!content) return
        let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`)
        if (!tag) {
          tag = document.createElement('meta')
          tag.setAttribute(attrName, attrVal)
          document.head.appendChild(tag)
        }
        tag.setAttribute('content', content)
      }

      setMetaTag(
        'name',
        'description',
        currentBlog.metaDescription || currentBlog.shortDescription || currentBlog.title
      )
      setMetaTag(
        'name',
        'keywords',
        currentBlog.metaKeywords || (Array.isArray(currentBlog.tags) ? currentBlog.tags.join(', ') : '')
      )
      setMetaTag('property', 'og:title', currentBlog.metaTitle || currentBlog.title)
      setMetaTag(
        'property',
        'og:description',
        currentBlog.metaDescription || currentBlog.shortDescription
      )
    }
  }, [currentBlog])

  // Form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (commentError) setCommentError('')
  }

  // Handle post comment with API integration and validation
  const handlePostComment = async (e) => {
    e.preventDefault()
    setCommentSuccess('')
    setCommentError('')

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setCommentError('Please fill out all required fields.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      setCommentError('Please enter a valid email address.')
      return
    }

    const blogIdentifier = currentBlog?.slug || currentBlog?._id || targetIdentifier
    if (!blogIdentifier) {
      setCommentError('Unable to identify article. Please refresh the page.')
      return
    }

    try {
      setSubmittingComment(true)
      const res = await API.post(`/comments/blog/${encodeURIComponent(blogIdentifier)}`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      })

      if (res.data?.success) {
        setFormData({ name: '', email: '', message: '' })
        setCommentSuccess(
          res.data?.message ||
            'Thank you! Your comment has been submitted as a draft and will appear on the blog once approved by admin.'
        )
        setTimeout(() => setCommentSuccess(''), 8000)
      } else {
        setCommentError(res.data?.message || 'Failed to post comment.')
      }
    } catch (err) {
      console.error('Comment posting error:', err)
      const errorMsg =
        err.response?.data?.message ||
        'Unable to post comment. Please try again later.'
      setCommentError(errorMsg)
    } finally {
      setSubmittingComment(false)
    }
  }

  // Handle sidebar search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/blog?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Handle category click
  const handleCategoryClick = (categoryName) => {
    navigate(`/blog?category=${encodeURIComponent(categoryName)}`)
  }

  // Render Loading
  if (isLoading) {
    return (
      <section className="BlogDetailsCard-wrapper">
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div
            style={{
              width: '45px',
              height: '45px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#0b556a',
              borderRadius: '50%',
              margin: '0 auto 18px',
              animation: 'blogDetailsSpin 0.8s linear infinite',
            }}
          />
          <p style={{ color: '#64748b', fontSize: '16px', fontWeight: 500 }}>
            Loading blog post...
          </p>
          <style>
            {`@keyframes blogDetailsSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
          </style>
        </div>
      </section>
    )
  }

  // Render Not Found
  if (notFound || !currentBlog) {
    return (
      <section className="BlogDetailsCard-wrapper">
        <div
          style={{
            maxWidth: '600px',
            margin: '80px auto',
            textAlign: 'center',
            padding: '40px 24px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <h2 style={{ fontSize: '24px', color: '#0d2c44', marginBottom: '12px', fontWeight: 700 }}>
            Blog Post Not Found
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
            The requested article could not be located. It might have been updated or removed.
          </p>
          <Link
            to="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#0b556a',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            <FaArrowLeft /> Back to All Blogs
          </Link>
        </div>
      </section>
    )
  }

  const postImage = getImageUrl(currentBlog.image, mainHeroImg)
  const postAuthor = currentBlog.author
    ? currentBlog.author.startsWith('By ')
      ? currentBlog.author
      : `By ${currentBlog.author}`
    : 'By Admin'
  const postCategory = currentBlog.category || 'General'
  const postTitle = currentBlog.title || 'Untitled Post'

  return (
    <section className="BlogDetailsCard-wrapper">
      <div className="BlogDetailsCard-container">
        {/* Main Content Left Column */}
        <div className="BlogDetailsCard-main">
          {/* Main Hero Card */}
          <div className="BlogDetailsCard-hero">
            <div className="BlogDetailsCard-image-box">
              <img
                src={postImage}
                alt={postTitle}
                className="BlogDetailsCard-hover-img"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = mainHeroImg
                }}
              />
            </div>
            <div className="BlogDetailsCard-hero-meta">
              <span>
                <FaUser className="BlogDetailsCard-meta-icon" /> {postAuthor}
              </span>
              <span>
                <FaComments className="BlogDetailsCard-meta-icon" /> {comments.length} Comments
              </span>
              <span>
                <FaTag className="BlogDetailsCard-meta-icon" /> {postCategory}
              </span>
              {currentBlog.createdAt && (
                <span>
                  <FaCalendarAlt className="BlogDetailsCard-meta-icon" /> {formatDate(currentBlog.createdAt)}
                </span>
              )}
            </div>
          </div>

          {/* Article Body */}
          <article className="BlogDetailsCard-article">
            <h1 className="BlogDetailsCard-title">{postTitle}</h1>

            {/* Short Description */}
            {currentBlog.shortDescription && (
              <p
                style={{
                  fontSize: '17px',
                  fontWeight: 500,
                  color: '#334155',
                  lineHeight: '1.7',
                  marginBottom: '24px',
                  borderLeft: '4px solid #0b556a',
                  paddingLeft: '16px',
                  background: '#f8fafc',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  borderRadius: '0 8px 8px 0',
                }}
              >
                {currentBlog.shortDescription}
              </p>
            )}

            {/* Full Content */}
            {currentBlog.description ? (
              <div
                className="BlogDetailsCard-text"
                dangerouslySetInnerHTML={{ __html: currentBlog.description }}
                style={{ lineHeight: '1.8', color: '#475569', marginBottom: '28px', fontSize: '1rem' }}
              />
            ) : (
              <p className="BlogDetailsCard-text" style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                No additional description provided for this article.
              </p>
            )}

            {/* Tags & Social Share */}
            <div className="BlogDetailsCard-share-bar">
              <div className="BlogDetailsCard-tags-container">
                <span className="BlogDetailsCard-share-label">Tags:</span>
                {Array.isArray(currentBlog.tags) && currentBlog.tags.length > 0 ? (
                  currentBlog.tags.map((t, idx) => (
                    <button
                      key={idx}
                      className="BlogDetailsCard-tag-btn"
                      type="button"
                      onClick={() => navigate(`/blog?search=${encodeURIComponent(t)}`)}
                      title={`Search blogs tagged with ${t}`}
                    >
                      {t}
                    </button>
                  ))
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{postCategory}</span>
                )}
              </div>
              <div className="BlogDetailsCard-social-container">
                <span className="BlogDetailsCard-share-label">Share:</span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="BlogDetailsCard-social-icon"
                  aria-label="Facebook"
                >
                  <FaFacebookF />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(postTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="BlogDetailsCard-social-icon"
                  aria-label="Twitter"
                >
                  <FaTwitter />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="BlogDetailsCard-social-icon"
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn />
                </a>
              </div>
            </div>

            {/* Dynamic Meta & SEO Information Box */}
            {(currentBlog.pageTitle ||
              currentBlog.metaTitle ||
              currentBlog.metaDescription ||
              currentBlog.metaKeywords) && (
              <div className="BlogDetailsCard-seo-panel">
                <div className="BlogDetailsCard-seo-panel-header">
                  <FaTag className="BlogDetailsCard-seo-icon" />
                  <h4>Article Meta & SEO Information</h4>
                </div>
                <div className="BlogDetailsCard-seo-grid">
                  {currentBlog.pageTitle && (
                    <div className="BlogDetailsCard-seo-row">
                      <span className="BlogDetailsCard-seo-label">Page Title:</span>
                      <span className="BlogDetailsCard-seo-value">{currentBlog.pageTitle}</span>
                    </div>
                  )}
                  {currentBlog.metaTitle && (
                    <div className="BlogDetailsCard-seo-row">
                      <span className="BlogDetailsCard-seo-label">Meta Title:</span>
                      <span className="BlogDetailsCard-seo-value">{currentBlog.metaTitle}</span>
                    </div>
                  )}
                  {currentBlog.metaDescription && (
                    <div className="BlogDetailsCard-seo-row">
                      <span className="BlogDetailsCard-seo-label">Meta Description:</span>
                      <span className="BlogDetailsCard-seo-value">
                        {currentBlog.metaDescription}
                      </span>
                    </div>
                  )}
                  {currentBlog.metaKeywords && (
                    <div className="BlogDetailsCard-seo-row">
                      <span className="BlogDetailsCard-seo-label">Meta Keywords:</span>
                      <div className="BlogDetailsCard-keywords-wrap">
                        {currentBlog.metaKeywords.split(',').map((kw, i) => (
                          <span key={i} className="BlogDetailsCard-keyword-chip">
                            #{kw.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </article>

          {/* Comments Section */}
          <div className="BlogDetailsCard-comments-section">
            <h2 className="BlogDetailsCard-section-heading">
              {comments.length < 10 ? `0${comments.length}` : comments.length} Comments
            </h2>

            {comments.length === 0 ? (
              <p style={{ color: '#64748b', fontStyle: 'italic', marginBottom: '30px' }}>
                No comments yet. Be the first to share your thoughts on this article!
              </p>
            ) : (
              <div className="BlogDetailsCard-comments-list">
                {comments.map((item) => (
                  <div key={item._id || item.id} className="BlogDetailsCard-comment-item">
                    <div className="BlogDetailsCard-comment-body">
                      <div className="BlogDetailsCard-comment-header">
                        <div>
                          <h4 className="BlogDetailsCard-commenter-name">{item.name}</h4>
                          <span className="BlogDetailsCard-comment-date">
                            {formatDate(item.createdAt || item.date)}
                          </span>
                        </div>
                      </div>
                      <p className="BlogDetailsCard-comment-text">{item.message || item.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Form */}
            <h2 className="BlogDetailsCard-section-heading">Leave A Comment</h2>
            {commentSuccess && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  fontSize: '14px',
                }}
              >
                {commentSuccess}
              </div>
            )}
            {commentError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  fontSize: '14px',
                }}
              >
                {commentError}
              </div>
            )}
            <form onSubmit={handlePostComment} className="BlogDetailsCard-form">
              <div className="BlogDetailsCard-form-row">
                <div className="BlogDetailsCard-field-group">
                  <label htmlFor="name">Your Name*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={submittingComment}
                    required
                  />
                </div>
                <div className="BlogDetailsCard-field-group">
                  <label htmlFor="email">Your Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={submittingComment}
                    required
                  />
                </div>
              </div>

              <div className="BlogDetailsCard-field-group">
                <label htmlFor="message">Message*</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Write your comment..."
                  value={formData.message}
                  onChange={handleInputChange}
                  disabled={submittingComment}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="BlogDetailsCard-submit-btn"
                disabled={submittingComment}
                style={{
                  opacity: submittingComment ? 0.7 : 1,
                  cursor: submittingComment ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingComment ? 'Posting Comment...' : 'Post Comment'} <FaArrowRight />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Right Column */}
        <aside className="BlogDetailsCard-sidebar">
          {/* Search Widget */}
          <div className="BlogDetailsCard-widget">
            <h3 className="BlogDetailsCard-widget-title">Search</h3>
            <form onSubmit={handleSearchSubmit} className="BlogDetailsCard-search-box">
              <input
                type="text"
                placeholder="Search blog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" aria-label="Search">
                <FaSearch />
              </button>
            </form>
          </div>

          {/* Dynamic Categories Widget */}
          <div className="BlogDetailsCard-widget">
            <h3 className="BlogDetailsCard-widget-title">Categories</h3>
            <ul className="BlogDetailsCard-category-list">
              {categories.length > 0 ? (
                categories.map((cat, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleCategoryClick(cat.name)}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    title={`Browse all blogs in ${cat.name}`}
                  >
                    <span>{cat.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>({cat.count})</span>
                  </li>
                ))
              ) : (
                <li style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  <span>No categories available</span>
                </li>
              )}
            </ul>
          </div>

          {/* Dynamic Recent Posts Widget */}
          <div className="BlogDetailsCard-widget">
            <h3 className="BlogDetailsCard-widget-title">Recent Posts</h3>
            <div className="BlogDetailsCard-recent-posts">
              {recentBlogs.length > 0 ? (
                recentBlogs.map((post, idx) => {
                  const fallback = [recentPost1, recentPost2, recentPost3][idx % 3]
                  const postUrl = `/blog/${post.slug || post._id}`
                  return (
                    <Link
                      key={post._id || idx}
                      to={postUrl}
                      className="BlogDetailsCard-recent-item"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div className="BlogDetailsCard-recent-img">
                        <img
                          src={getImageUrl(post.image, fallback)}
                          alt={post.title}
                          className="BlogDetailsCard-hover-img"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = fallback
                          }}
                        />
                      </div>
                      <div className="BlogDetailsCard-recent-info">
                        <span>
                          <FaCalendarAlt /> {formatDate(post.createdAt)}
                        </span>
                        <h5>{post.title}</h5>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                  No other recent articles found.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default BlogDetailsCard