import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FaCalendarAlt, FaUser, FaArrowRight, FaBookOpen, FaTimes } from 'react-icons/fa'
import API, { IMG_URL } from '../../api/axios'
import './BlogCard.css'

// Fallback images
import defaultImg1 from '../../assets/05.webp'
import defaultImg2 from '../../assets/06.webp'
import defaultImg3 from '../../assets/07.webp'
import defaultImg4 from '../../assets/08.webp'

const fallbackImages = [defaultImg1, defaultImg2, defaultImg3, defaultImg4]

const BlogCard = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const categoryQuery = searchParams.get('category') || ''

  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Fetch categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await API.get('/blogs/categories')
        if (res.data?.success) {
          setCategories(res.data.data || [])
        }
      } catch (err) {
        console.error('Failed to load categories in BlogCard:', err)
      }
    }
    loadCategories()
  }, [])

  // Fetch blogs dynamically from the backend with query params
  const fetchBlogs = async (page = 1) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = {
        page,
        limit: 8,
        status: 'Published',
        sort: 'latest',
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      if (categoryQuery.trim()) {
        params.category = categoryQuery.trim()
      }

      const res = await API.get('/blogs', { params })

      if (res.data?.success) {
        setBlogs(res.data.data || [])
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1)
          setCurrentPage(res.data.pagination.page || 1)
          setTotalCount(res.data.pagination.total || res.data.count || 0)
        }
      } else {
        setBlogs([])
      }
    } catch (err) {
      console.error('Failed to fetch blogs from backend:', err)
      setError('Unable to load blog articles from the server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Refetch when currentPage, search query, or category query changes
  useEffect(() => {
    fetchBlogs(currentPage)
  }, [currentPage, searchQuery, categoryQuery])

  // Clear active filters
  const handleClearFilter = () => {
    setSearchParams({})
    setCurrentPage(1)
  }

  // Resolve backend uploads vs external URLs vs fallback
  const getImageUrl = (imgPath, index = 0) => {
    if (!imgPath) return fallbackImages[index % fallbackImages.length]
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

  return (
    <section className="BlogCard-wrapper">
      <div className="BlogCard-container">
        {/* Dynamic Category Filter Pills */}
        {categories.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '24px',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => {
                const newParams = {}
                if (searchQuery) newParams.search = searchQuery
                setSearchParams(newParams)
                setCurrentPage(1)
              }}
              style={{
                padding: '7px 18px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: !categoryQuery ? '#0b556a' : '#e2e8f0',
                background: !categoryQuery ? '#0b556a' : '#ffffff',
                color: !categoryQuery ? '#ffffff' : '#475569',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              All Articles
            </button>
            {categories.map((cat, idx) => {
              const isActive = categoryQuery.toLowerCase() === cat.name.toLowerCase()
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const newParams = { category: cat.name }
                    if (searchQuery) newParams.search = searchQuery
                    setSearchParams(newParams)
                    setCurrentPage(1)
                  }}
                  style={{
                    padding: '7px 18px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: isActive ? '#0b556a' : '#e2e8f0',
                    background: isActive ? '#0b556a' : '#ffffff',
                    color: isActive ? '#ffffff' : '#475569',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{cat.name}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      opacity: isActive ? 0.9 : 0.6,
                    }}
                  >
                    ({cat.count})
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Active Filter Indicator */}
        {(searchQuery || categoryQuery) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '12px 20px',
              borderRadius: '8px',
              marginBottom: '28px',
            }}
          >
            <div style={{ fontSize: '14px', color: '#334155' }}>
              Showing results for:{' '}
              {searchQuery && (
                <span style={{ fontWeight: 700, color: '#0b556a', marginRight: '8px' }}>
                  Search: "{searchQuery}"
                </span>
              )}
              {categoryQuery && (
                <span style={{ fontWeight: 700, color: '#0b556a' }}>
                  Category: "{categoryQuery}"
                </span>
              )}
              {!isLoading && (
                <span style={{ color: '#64748b', marginLeft: '8px' }}>
                  ({totalCount} {totalCount === 1 ? 'article' : 'articles'} found)
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleClearFilter}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fee2e2',
                color: '#ef4444',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <FaTimes /> Clear Filter
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid #e2e8f0',
                borderTopColor: '#0b556a',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'blogCardSpin 0.8s linear infinite',
              }}
            />
            <p style={{ color: '#64748b', fontSize: '15px', fontWeight: 500 }}>
              Fetching latest blog articles...
            </p>
            <style>
              {`@keyframes blogCardSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
            </style>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            <p style={{ color: '#991b1b', marginBottom: '16px', fontWeight: 500 }}>{error}</p>
            <button
              type="button"
              onClick={() => fetchBlogs(currentPage)}
              style={{
                background: '#0b556a',
                color: '#fff',
                border: 'none',
                padding: '9px 20px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && blogs.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f0fdf4',
                color: '#0b556a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '26px',
              }}
            >
              <FaBookOpen />
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '18px', fontWeight: 700 }}>
              {searchQuery || categoryQuery ? 'No Matching Articles' : 'No Blog Posts Found'}
            </h3>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '14px' }}>
              {searchQuery || categoryQuery
                ? 'Try selecting a different category or clearing the current filter.'
                : "We haven't published any articles yet. Please check back later."}
            </p>
            {(searchQuery || categoryQuery) && (
              <button
                type="button"
                onClick={handleClearFilter}
                style={{
                  background: '#0b556a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                View All Articles
              </button>
            )}
          </div>
        )}

        {/* Dynamic Blog Grid */}
        {!isLoading && !error && blogs.length > 0 && (
          <div className="BlogCard-grid">
            {blogs.map((item, index) => {
              const fallback = fallbackImages[index % fallbackImages.length]
              const postImage = getImageUrl(item.image, index)
              const postCategory = item.category || 'Books Store'
              const postAuthor = item.author
                ? item.author.startsWith('By ')
                  ? item.author
                  : `By ${item.author}`
                : 'By Admin'
              const postDate = formatDate(item.createdAt || item.date)
              // Canonical blog detail URL using slug
              const detailUrl = `/blog/${item.slug || item._id}`

              return (
                <div className="BlogCard-card" key={item._id || item.id || index}>
                  <Link to={detailUrl} className="BlogCard-image-container" style={{ display: 'block' }}>
                    <img
                      src={postImage}
                      alt={item.title}
                      className="BlogCard-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = fallback
                      }}
                    />
                    <span className="BlogCard-badge">{postCategory}</span>
                  </Link>
                  <div className="BlogCard-content">
                    <div className="BlogCard-meta">
                      <span className="BlogCard-meta-item">
                        <FaCalendarAlt className="BlogCard-icon" />
                        {postDate}
                      </span>
                      <span className="BlogCard-meta-item">
                        <FaUser className="BlogCard-icon" />
                        {postAuthor}
                      </span>
                    </div>
                    <h3 className="BlogCard-title" title={item.title}>
                      <Link to={detailUrl} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {item.title}
                      </Link>
                    </h3>
                    {item.shortDescription && (
                      <p
                        style={{
                          fontSize: '13px',
                          color: '#64748b',
                          lineHeight: '1.45',
                          margin: '0 0 14px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.shortDescription}
                      </p>
                    )}
                    <Link to={detailUrl} className="BlogCard-readmore">
                      Read More <FaArrowRight className="BlogCard-arrow-icon" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Dynamic Pagination Section */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="BlogCard-pagination">
            <button
              className="BlogCard-page-btn BlogCard-prev"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`BlogCard-page-btn ${currentPage === pageNum ? 'BlogCard-active-page' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button
              className="BlogCard-page-btn BlogCard-next"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default BlogCard