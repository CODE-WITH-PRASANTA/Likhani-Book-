import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Editor } from '@tinymce/tinymce-react';
import {
  FiBookOpen,
  FiRotateCcw,
  FiUploadCloud,
  FiPlus,
  FiSearch,
  FiFilter,
  FiList,
  FiGrid,
  FiEdit,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiCheck
} from 'react-icons/fi';
import './Shop.css';

const INITIAL_BOOKS = [
  {
    id: 1,
    title: 'Castle The Sky',
    author: 'Hayao Miyazaki',
    isbn: 'ISBN-908234',
    price: 499.00,
    stock: 50,
    category: 'Kids Toys',
    publishYear: 2024,
    shortDescription: 'An adventurous journey through floating islands and ancient secrets.',
    fullDescription: '<p>An adventurous journey through floating islands and ancient secrets that captivating readers of all ages.</p>',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150',
    pages: 320,
    format: 'Hardcover',
    language: 'English',
    tags: ['Adventure', 'Fantasy', 'Kids'],
    status: 'Active'
  },
  {
    id: 2,
    title: 'UX Research',
    author: 'John Doe',
    isbn: 'ISBN-443212',
    price: 899.50,
    stock: 30,
    category: 'Education',
    publishYear: 2023,
    shortDescription: 'Comprehensive guide to user experience methodologies.',
    fullDescription: '<p>Comprehensive guide to user experience methodologies and user-centered design practices.</p>',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=150',
    pages: 280,
    format: 'Paperback',
    language: 'English',
    tags: ['Design', 'Research', 'Tech'],
    status: 'Active'
  },
  {
    id: 3,
    title: 'A Flowely and Unicorn Enna',
    author: 'Sarah Smith',
    isbn: 'ISBN-789012',
    price: 350.00,
    stock: 20,
    category: 'Children',
    publishYear: 2024,
    shortDescription: 'A magical tale of friendship and wonder.',
    fullDescription: '<p>A magical tale of friendship and wonder set in a fantasy world full of vibrant creatures.</p>',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=150',
    pages: 150,
    format: 'Hardcover',
    language: 'English',
    tags: ['Magic', 'Kids', 'Story'],
    status: 'Active'
  },
  {
    id: 4,
    title: 'Enlight Yourself',
    author: 'Michael Brown',
    isbn: 'ISBN-112233',
    price: 650.00,
    stock: 15,
    category: 'Self Help',
    publishYear: 2022,
    shortDescription: 'Discover internal peace and mindfulness daily.',
    fullDescription: '<p>Discover internal peace and mindfulness daily with actionable steps and guidance.</p>',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150',
    pages: 210,
    format: 'Paperback',
    language: 'English',
    tags: ['Mindfulness', 'Life'],
    status: 'Inactive'
  },
  {
    id: 5,
    title: 'Grow Flower',
    author: 'Emma Watson',
    isbn: 'ISBN-556677',
    price: 420.00,
    stock: 40,
    category: 'Motivation',
    publishYear: 2023,
    shortDescription: 'Botanical guide to nurturing domestic gardens.',
    fullDescription: '<p>Botanical guide to nurturing domestic gardens and flourishing flora year-round.</p>',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=150',
    pages: 195,
    format: 'Paperback',
    language: 'Hindi',
    tags: ['Gardening', 'Nature'],
    status: 'Active'
  },
  {
    id: 6,
    title: 'The Midnight Library',
    author: 'Matt Haig',
    isbn: 'ISBN-998877',
    price: 599.00,
    stock: 25,
    category: 'Fiction',
    publishYear: 2020,
    shortDescription: 'Between life and death there is a library of infinite choices.',
    fullDescription: '<p>Between life and death there is a library containing endless options of the lives you could have lived.</p>',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=150',
    pages: 304,
    format: 'Hardcover',
    language: 'English',
    tags: ['Fiction', 'Bestseller'],
    status: 'Active'
  },
  {
    id: 7,
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: 'ISBN-334455',
    price: 799.00,
    stock: 18,
    category: 'Self Help',
    publishYear: 2018,
    shortDescription: 'An easy & proven way to build good habits & break bad ones.',
    fullDescription: '<p>Tiny Changes, Remarkable Results. An easy & proven way to build good habits & break bad ones.</p>',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=150',
    pages: 320,
    format: 'Hardcover',
    language: 'English',
    tags: ['Productivity', 'Habits'],
    status: 'Active'
  },
  {
    id: 8,
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    isbn: 'ISBN-778899',
    price: 299.00,
    stock: 12,
    category: 'Fiction',
    publishYear: 1988,
    shortDescription: 'A fable about following your dream.',
    fullDescription: '<p>Transformative story of Santiago, an Andalusian shepherd boy who yearns to travel in search of worldly treasure.</p>',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=150',
    pages: 208,
    format: 'Paperback',
    language: 'Hindi',
    tags: ['Novel', 'Classics'],
    status: 'Inactive'
  },
  {
    id: 9,
    title: 'Ikigai',
    author: 'Héctor García',
    isbn: 'ISBN-123123',
    price: 450.00,
    stock: 28,
    category: 'Philosophy',
    publishYear: 2016,
    shortDescription: 'The Japanese secret to a long and happy life.',
    fullDescription: '<p>Bring meaning and joy to every day by uncovering your own ikigai.</p>',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150',
    pages: 208,
    format: 'Hardcover',
    language: 'English',
    tags: ['Life', 'Japanese'],
    status: 'Active'
  },
  {
    id: 10,
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: 'ISBN-654321',
    price: 699.00,
    stock: 10,
    category: 'Science Fiction',
    publishYear: 1965,
    shortDescription: 'Set on the desert planet Arrakis, Dune is the story of Paul Atreides.',
    fullDescription: '<p>A mythic and emotionally charged hero journey concerning Arrakis and the spice melange.</p>',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=150',
    pages: 412,
    format: 'E-Book',
    language: 'English',
    tags: ['Sci-Fi', 'Classic'],
    status: 'Active'
  }
];

const CATEGORIES = ['Kids Toys', 'Education', 'Children', 'Self Help', 'Motivation', 'Fiction', 'Philosophy', 'Science Fiction'];
const AUTHORS = ['Hayao Miyazaki', 'John Doe', 'Sarah Smith', 'Michael Brown', 'Emma Watson', 'Matt Haig', 'James Clear', 'Paulo Coelho', 'Héctor García', 'Frank Herbert'];
const FORMATS = ['Hardcover', 'Paperback', 'E-Book', 'Audiobook'];
const LANGUAGES = ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi'];

const CustomSelect = ({ options, value, onChange, placeholder, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);

  const toggleDropdown = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleScrollOrResize = () => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };

    const handleClickOutside = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        if (!e.target.closest('.Shop-portalDropdownMenu')) {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`Shop-customSelectContainer ${className}`} ref={triggerRef}>
      <div className="Shop-customSelectTrigger" onClick={toggleDropdown}>
        <span>{value || placeholder}</span>
        <FiChevronDown className={`Shop-selectArrow ${isOpen ? 'open' : ''}`} />
      </div>

      {isOpen &&
        ReactDOM.createPortal(
          <ul
            className="Shop-portalDropdownMenu"
            style={{
              top: `${coords.top + 4}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`
            }}
          >
            {options.map((opt) => (
              <li
                key={typeof opt === 'string' ? opt : opt.value}
                className={`Shop-portalDropdownItem ${
                  value === (typeof opt === 'string' ? opt : opt.value) ? 'selected' : ''
                }`}
                onClick={() => handleSelect(typeof opt === 'string' ? opt : opt.value)}
              >
                {typeof opt === 'string' ? opt : opt.label}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
};

const Shop = () => {
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Staged filter values
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterAuthor, setFilterAuthor] = useState('All Authors');
  const [filterStatus, setFilterStatus] = useState('All Status');

  // Applied filter values
  const [appliedFilters, setAppliedFilters] = useState({
    category: 'All Categories',
    author: 'All Authors',
    status: 'All Status'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [viewingBook, setViewingBook] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    price: '',
    stock: '',
    category: '',
    publishYear: 2024,
    shortDescription: '',
    fullDescription: '',
    pages: '',
    format: '',
    language: '',
    tags: '',
    status: 'Active',
    images: []
  });

  const fileInputRef = useRef(null);
  const itemsPerPage = 6;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({ ...prev, fullDescription: content }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map((file) => URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      price: '',
      stock: '',
      category: '',
      publishYear: 2024,
      shortDescription: '',
      fullDescription: '',
      pages: '',
      format: '',
      language: '',
      tags: '',
      status: 'Active',
      images: []
    });
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.price) {
      alert('Please fill out all required fields.');
      return;
    }

    const tagArray = formData.tags
      ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const defaultImg = formData.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150';

    if (editingId) {
      setBooks((prev) =>
        prev.map((book) =>
          book.id === editingId
            ? {
                ...book,
                title: formData.title,
                author: formData.author,
                isbn: formData.isbn,
                price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock, 10) || 0,
                category: formData.category,
                publishYear: parseInt(formData.publishYear, 10) || 2024,
                shortDescription: formData.shortDescription,
                fullDescription: formData.fullDescription,
                pages: parseInt(formData.pages, 10) || 0,
                format: formData.format,
                language: formData.language,
                tags: tagArray.length ? tagArray : book.tags,
                status: formData.status,
                image: defaultImg
              }
            : book
        )
      );
    } else {
      const newBook = {
        id: Date.now(),
        title: formData.title,
        author: formData.author || 'Unknown Author',
        isbn: formData.isbn || `ISBN-${Math.floor(100000 + Math.random() * 900000)}`,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        category: formData.category,
        publishYear: parseInt(formData.publishYear, 10) || 2024,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        image: defaultImg,
        pages: parseInt(formData.pages, 10) || 100,
        format: formData.format || 'Hardcover',
        language: formData.language || 'English',
        tags: tagArray.length ? tagArray : ['New'],
        status: formData.status
      };
      setBooks((prev) => [newBook, ...prev]);
    }

    handleReset();
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      price: book.price,
      stock: book.stock,
      category: book.category,
      publishYear: book.publishYear,
      shortDescription: book.shortDescription || '',
      fullDescription: book.fullDescription || '',
      pages: book.pages || '',
      format: book.format || '',
      language: book.language || '',
      tags: book.tags ? book.tags.join(', ') : '',
      status: book.status,
      images: [book.image]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      setBooks((prev) => prev.filter((b) => b.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      if (editingId === id) handleReset();
    }
  };

  // Filter Trigger
  const handleApplyFilters = () => {
    setAppliedFilters({
      category: filterCategory,
      author: filterAuthor,
      status: filterStatus
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterCategory('All Categories');
    setFilterAuthor('All Authors');
    setFilterStatus('All Status');
    setAppliedFilters({
      category: 'All Categories',
      author: 'All Authors',
      status: 'All Status'
    });
    setCurrentPage(1);
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        appliedFilters.category === 'All Categories' || book.category === appliedFilters.category;

      const matchesAuthor =
        appliedFilters.author === 'All Authors' || book.author === appliedFilters.author;

      const matchesStatus =
        appliedFilters.status === 'All Status' || book.status === appliedFilters.status;

      return matchesSearch && matchesCategory && matchesAuthor && matchesStatus;
    });
  }, [books, searchQuery, appliedFilters]);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage) || 1;

  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBooks.slice(start, start + itemsPerPage);
  }, [filteredBooks, currentPage]);

  // Select All Handlers
  const isAllPageSelected =
    paginatedBooks.length > 0 &&
    paginatedBooks.every((book) => selectedIds.includes(book.id));

  const handleSelectAll = (e) => {
    const currentPageIds = paginatedBooks.map((b) => b.id);
    if (e.target.checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    } else {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    }
  };

  const handleSelectItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Kids Toys': return 'badge-pink';
      case 'Education': return 'badge-blue';
      case 'Children': return 'badge-green';
      case 'Self Help': return 'badge-yellow';
      case 'Motivation': return 'badge-purple';
      case 'Fiction': return 'badge-sky';
      case 'Philosophy': return 'badge-indigo';
      case 'Science Fiction': return 'badge-teal';
      default: return 'badge-gray';
    }
  };

  const getPaginationPages = () => {
    const delta = 1;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift('...');
    if (currentPage + delta < totalPages - 1) range.push('...');
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  return (
    <div className="Shop">
      <div className="Shop-header">
        <div className="Shop-headerTitle">
          <FiBookOpen className="Shop-titleIcon" />
          <div>
            <h1>Book Management</h1>
            <p>Add, edit or manage your books</p>
          </div>
        </div>
      </div>

      <div className="Shop-container">
        {/* Form Section */}
        <div className="Shop-formCard">
          <div className="Shop-formHeader">
            <h2>
              <FiBookOpen /> {editingId ? 'Edit Book' : 'Add / Edit Book'}
            </h2>
            <button type="button" className="Shop-btnReset" onClick={handleReset}>
              <FiRotateCcw /> Reset
            </button>
          </div>

          <form onSubmit={handleSubmit} className="Shop-form">
            <div className="Shop-field">
              <label>Book Title <span>*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter book title"
                required
              />
            </div>

            <div className="Shop-row">
              <div className="Shop-field">
                <label>Author Name <span>*</span></label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Enter author name"
                  required
                />
              </div>
              <div className="Shop-field">
                <label>ISBN / SKU <span>*</span></label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  placeholder="Enter ISBN or SKU"
                  required
                />
              </div>
            </div>

            <div className="Shop-row">
              <div className="Shop-field">
                <label>Price (₹) <span>*</span></label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="₹ 0.00"
                  required
                />
              </div>
              <div className="Shop-field">
                <label>Stock Quantity <span>*</span></label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="Shop-row">
              <div className="Shop-field">
                <label>Category <span>*</span></label>
                <CustomSelect
                  options={CATEGORIES}
                  value={formData.category}
                  onChange={(val) => handleCustomSelectChange('category', val)}
                  placeholder="Select category"
                />
              </div>
              <div className="Shop-field">
                <label>Publish Year <span>*</span></label>
                <input
                  type="number"
                  name="publishYear"
                  value={formData.publishYear}
                  onChange={handleInputChange}
                  placeholder="2024"
                  required
                />
              </div>
            </div>

            <div className="Shop-field">
              <label>Short Description <span>*</span></label>
              <textarea
                name="shortDescription"
                rows="2"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Enter short description..."
                required
              />
            </div>

            <div className="Shop-field">
              <label>Full Description <span>*</span></label>
              <div className="Shop-editorWrapper">
                <Editor
                  apiKey="jeq7g2k84sqpi9364o8x9ptqf09aoesaq8jxmp49dl4sh57z"
                  value={formData.fullDescription}
                  onEditorChange={handleEditorChange}
                  init={{
                    height: 180,
                    menubar: false,
                    plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'],
                    toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | removeformat',
                    content_style: 'body { font-family:Inter,sans-serif; font-size:13px }'
                  }}
                />
              </div>
            </div>

            <div className="Shop-field">
              <label>Book Images <span>*</span></label>
              <div className="Shop-imageUploadRow">
                <div
                  className="Shop-dropzone"
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    hidden
                  />
                  <FiUploadCloud className="Shop-uploadIcon" />
                  <p className="Shop-uploadText">
                    <strong>Click to upload images</strong>
                  </p>
                  <p className="Shop-uploadSubtext">JPG, PNG, WebP (Max 5MB)</p>
                </div>

                <div className="Shop-galleryPreview">
                  <span className="Shop-galleryTitle">Gallery Preview</span>
                  <div className="Shop-galleryGrid">
                    <div
                      className="Shop-addMoreBox"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <FiPlus />
                    </div>
                    {formData.images.map((img, idx) => (
                      <img key={idx} src={img} alt="Preview" className="Shop-galleryImg" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="Shop-rowTriple">
              <div className="Shop-field">
                <label>Pages</label>
                <input
                  type="number"
                  name="pages"
                  value={formData.pages}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div className="Shop-field">
                <label>Format <span>*</span></label>
                <CustomSelect
                  options={FORMATS}
                  value={formData.format}
                  onChange={(val) => handleCustomSelectChange('format', val)}
                  placeholder="Select format"
                />
              </div>
              <div className="Shop-field">
                <label>Language <span>*</span></label>
                <CustomSelect
                  options={LANGUAGES}
                  value={formData.language}
                  onChange={(val) => handleCustomSelectChange('language', val)}
                  placeholder="Select language"
                />
              </div>
            </div>

            <div className="Shop-field">
              <label>Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Enter tags (comma separated)"
              />
            </div>

            <div className="Shop-field">
              <label>Status</label>
              <div className="Shop-radioGroup">
                <label className="Shop-radioLabel">
                  <input
                    type="radio"
                    name="status"
                    value="Active"
                    checked={formData.status === 'Active'}
                    onChange={handleInputChange}
                  />
                  <span>Active</span>
                </label>
                <label className="Shop-radioLabel">
                  <input
                    type="radio"
                    name="status"
                    value="Inactive"
                    checked={formData.status === 'Inactive'}
                    onChange={handleInputChange}
                  />
                  <span>Inactive</span>
                </label>
              </div>
            </div>

            <div className="Shop-formFooter">
              <button type="submit" className="Shop-btnSave">
                <FiCheck /> Save Book
              </button>
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="Shop-listCard">
          <div className="Shop-listTopBar">
            <h2>All Books ({filteredBooks.length})</h2>

            <div className="Shop-viewToggleGroup">
              <button
                className={`Shop-btnToggle ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FiList /> <span className="Shop-toggleText">List</span>
              </button>
              <button
                className={`Shop-btnToggle ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid /> <span className="Shop-toggleText">Grid</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="Shop-filterRow">
            <div className="Shop-searchBox">
              <FiSearch className="Shop-searchIcon" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <CustomSelect
              options={['All Categories', ...CATEGORIES]}
              value={filterCategory}
              onChange={setFilterCategory}
              placeholder="Category"
              className="Shop-filterDropdown"
            />

            <CustomSelect
              options={['All Authors', ...AUTHORS]}
              value={filterAuthor}
              onChange={setFilterAuthor}
              placeholder="Author"
              className="Shop-filterDropdown"
            />

            <CustomSelect
              options={['All Status', 'Active', 'Inactive']}
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="Status"
              className="Shop-filterDropdown"
            />

            <div className="Shop-filterButtonGroup">
              <button className="Shop-btnFilter" onClick={handleApplyFilters}>
                <FiFilter /> Filter
              </button>
              <button className="Shop-btnFilterReset" onClick={handleResetFilters} title="Reset Filters">
                <FiRotateCcw />
              </button>
            </div>
          </div>

          {/* List View Table */}
          {viewMode === 'list' ? (
            <div className="Shop-tableWrapper">
              <table className="Shop-table">
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
                    <th>Book Info</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBooks.length > 0 ? (
                    paginatedBooks.map((book, idx) => (
                      <tr key={book.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(book.id)}
                            onChange={() => handleSelectItem(book.id)}
                          />
                        </td>
                        <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                        <td>
                          <div
                            className="Shop-bookInfo clickable"
                            onClick={() => setViewingBook(book)}
                            title="Click to view details"
                          >
                            <img src={book.image} alt={book.title} className="Shop-bookThumb" />
                            <div>
                              <div className="Shop-bookTitle">{book.title}</div>
                              <div className="Shop-bookAuthor">{book.author}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`Shop-badge ${getCategoryBadgeClass(book.category)}`}>
                            {book.category}
                          </span>
                        </td>
                        <td className="Shop-priceText">₹{book.price.toFixed(2)}</td>
                        <td>{book.stock}</td>
                        <td>
                          <span className={`Shop-statusTag ${book.status.toLowerCase()}`}>
                            {book.status}
                          </span>
                        </td>
                        <td>
                          <div className="Shop-actions">
                            <button
                              className="Shop-actionBtn edit"
                              onClick={() => handleEdit(book)}
                              title="Edit"
                            >
                              <FiEdit />
                            </button>
                            <button
                              className="Shop-actionBtn delete"
                              onClick={() => handleDelete(book.id)}
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
                      <td colSpan="8" className="Shop-empty">No books found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="Shop-grid">
              {paginatedBooks.length > 0 ? (
                paginatedBooks.map((book) => (
                  <div key={book.id} className="Shop-gridCard">
                    <div
                      className="Shop-gridImageWrapper clickable"
                      onClick={() => setViewingBook(book)}
                    >
                      <img src={book.image} alt={book.title} />
                      <span className={`Shop-badge ${getCategoryBadgeClass(book.category)}`}>
                        {book.category}
                      </span>
                    </div>
                    <div className="Shop-gridBody">
                      <div
                        className="Shop-gridTitle clickable"
                        onClick={() => setViewingBook(book)}
                      >
                        {book.title}
                      </div>
                      <div className="Shop-gridAuthor">By {book.author}</div>
                      <div className="Shop-gridPriceRow">
                        <span className="Shop-priceText">₹{book.price.toFixed(2)}</span>
                        <span className="Shop-gridStock">Stock: {book.stock}</span>
                      </div>
                      <div className="Shop-gridFooter">
                        <span className={`Shop-statusTag ${book.status.toLowerCase()}`}>
                          {book.status}
                        </span>
                        <div className="Shop-actions">
                          <button
                            className="Shop-actionBtn edit"
                            onClick={() => handleEdit(book)}
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                          <button
                            className="Shop-actionBtn delete"
                            onClick={() => handleDelete(book.id)}
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
                <div className="Shop-empty">No books found.</div>
              )}
            </div>
          )}

          {/* Responsive Pagination */}
          <div className="Shop-pagination">
            <span className="Shop-paginationInfo">
              Showing {filteredBooks.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredBooks.length)} of {filteredBooks.length}
            </span>

            {/* Desktop Pagination */}
            <div className="Shop-paginationControls desktop">
              <button
                className="Shop-pageBtn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <FiChevronLeft />
              </button>
              {getPaginationPages().map((page, index) =>
                page === '...' ? (
                  <span key={`dots-${index}`} className="Shop-paginationEllipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`Shop-pageBtn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="Shop-pageBtn"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <FiChevronRight />
              </button>
            </div>

            {/* Mobile Pagination */}
            <div className="Shop-paginationControls mobile">
              <button
                className="Shop-pageBtn mobileNav"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <FiChevronLeft /> Prev
              </button>
              <span className="Shop-mobilePageIndicator">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="Shop-pageBtn mobileNav"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Smooth Animated Modal */}
      {viewingBook && (
        <div className="Shop-modalOverlay" onClick={() => setViewingBook(null)}>
          <div className="Shop-modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="Shop-modalHeader">
              <h2>{viewingBook.title}</h2>
              <button className="Shop-modalClose" onClick={() => setViewingBook(null)}>
                &times;
              </button>
            </div>
            <div className="Shop-modalBody">
              <img src={viewingBook.image} alt={viewingBook.title} className="Shop-modalImg" />
              <p><strong>Author:</strong> {viewingBook.author}</p>
              <p><strong>ISBN / SKU:</strong> {viewingBook.isbn}</p>
              <p><strong>Category:</strong> {viewingBook.category}</p>
              <p><strong>Price:</strong> ₹{viewingBook.price.toFixed(2)}</p>
              <p><strong>Stock:</strong> {viewingBook.stock}</p>
              <p><strong>Publish Year:</strong> {viewingBook.publishYear}</p>
              <p><strong>Format:</strong> {viewingBook.format} | <strong>Language:</strong> {viewingBook.language} | <strong>Pages:</strong> {viewingBook.pages}</p>
              <p><strong>Short Description:</strong> {viewingBook.shortDescription}</p>
              <div>
                <strong>Full Description:</strong>
                <div
                  dangerouslySetInnerHTML={{ __html: viewingBook.fullDescription }}
                  className="Shop-modalDesc"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;