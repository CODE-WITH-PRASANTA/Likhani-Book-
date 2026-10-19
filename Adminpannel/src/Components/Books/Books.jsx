import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit3,
  Trash2,
  X,
  BookOpen,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  CircleCheck,
  CircleX,
  Info,
  Package,
  User,
  Hash,
  IndianRupee,
  Layers,
} from "lucide-react";

import API, { BASE_URL } from "../../api/axios";
import "./Books.css";

const getImageUrl = (imagePath) => {
  if (!imagePath)
    return "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=85";
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("blob:") ||
    imagePath.startsWith("data:")
  )
    return imagePath;
  return `${BASE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const Books = () => {
  /* =========================================================
     STATES
  ========================================================= */

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [stockFilter, setStockFilter] = useState("All Stock");
  const [sortFilter, setSortFilter] = useState("Sort By: Latest");
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });

  const [serverStats, setServerStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    outOfStock: 0,
  });

  const [selectedIds, setSelectedIds] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    author: "",
    category: "",
    price: "",
    stock: "",
    status: "Published",
    description: "",
    publisher: "",
    pages: "",
    language: "English",
    year: "",
    image: "",
  });

  const [errors, setErrors] = useState({});
  const ITEMS_PER_PAGE = 8;

  /* =========================================================
     API: FETCH DYNAMIC CATEGORIES
  ========================================================= */

  const fetchCategories = useCallback(async () => {
    try {
      const res = await API.get("/categories");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCategories(res.data.data.map((c) => c.name));
      }
    } catch (err) {
      console.error("Failed to load dynamic categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* =========================================================
     API: FETCH BOOKS WITH SEARCH, FILTER, SORT, PAGINATION
  ========================================================= */

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/books", {
        params: {
          search: searchTerm,
          category: categoryFilter,
          status: statusFilter,
          stock: stockFilter,
          sort: sortFilter,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        },
      });

      if (res.data?.success) {
        const fetched = (res.data.data || []).map((b) => ({
          ...b,
          id: b._id || b.id,
        }));
        setBooks(fetched);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
        if (res.data.stats) {
          setServerStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch books:", err);
    } finally {
      setLoading(false);
    }
  }, [
    searchTerm,
    categoryFilter,
    statusFilter,
    stockFilter,
    sortFilter,
    currentPage,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  /* =========================================================
     PAGINATION & SELECTION
  ========================================================= */

  const totalPages = pagination.totalPages || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const currentBooks = books;

  const currentBookIds = currentBooks.map((book) => book.id);

  const isAllSelected =
    currentBookIds.length > 0 &&
    currentBookIds.every((id) => selectedIds.includes(id));

  const isSomeSelected =
    currentBookIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((previous) =>
        previous.filter((id) => !currentBookIds.includes(id))
      );
    } else {
      setSelectedIds((previous) => [
        ...new Set([...previous, ...currentBookIds]),
      ]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalBooks = serverStats.total || 0;
  const publishedBooks = serverStats.published || 0;
  const draftBooks = serverStats.draft || 0;
  const outOfStockBooks = serverStats.outOfStock || 0;

  /* =========================================================
     FORM HANDLERS
  ========================================================= */

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((previous) => ({
        ...previous,
        image: "Please select a valid image.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        image: "Image must be less than 5MB.",
      }));
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setErrors((previous) => ({
      ...previous,
      image: "",
    }));
  };

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    setFormData({
      title: "",
      isbn: "",
      author: "",
      category: categories.length > 0 ? categories[0] : "",
      price: "",
      stock: "",
      status: "Published",
      description: "",
      publisher: "",
      pages: "",
      language: "English",
      year: new Date().getFullYear(),
      image: "",
    });

    setImageFile(null);
    setImagePreview("");
    setErrors({});
  };

  /* =========================================================
     OPEN MODALS
  ========================================================= */

  const openAddModal = () => {
    resetForm();
    setSelectedBook(null);
    setModalType("add");
  };

  const openViewModal = (book) => {
    setSelectedBook(book);
    setModalType("view");
  };

  const openEditModal = (book) => {
    setSelectedBook(book);

    setFormData({
      title: book.title || "",
      isbn: book.isbn || "",
      author: book.author || "",
      category: book.category || (categories[0] || ""),
      price: book.price !== undefined ? book.price : "",
      stock: book.stock !== undefined ? book.stock : "",
      status: book.status || "Published",
      description: book.description || "",
      publisher: book.publisher || "",
      pages: book.pages || "",
      language: book.language || "English",
      year: book.year || new Date().getFullYear(),
      image: book.image || "",
    });

    setImageFile(null);
    setImagePreview(book.image ? getImageUrl(book.image) : "");
    setErrors({});
    setModalType("edit");
  };

  const openDeleteModal = (book) => {
    setSelectedBook(book);
    setModalType("delete");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedBook(null);
    resetForm();
  };

  /* =========================================================
     VALIDATE FORM
  ========================================================= */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Book title is required.";
    }

    if (!formData.author?.trim()) {
      newErrors.author = "Author is required.";
    }

    if (!formData.category?.trim() && categories.length > 0) {
      newErrors.category = "Please select a category.";
    }

    if (
      formData.price === "" ||
      isNaN(Number(formData.price)) ||
      Number(formData.price) < 0
    ) {
      newErrors.price = "Enter a valid positive price.";
    }

    if (
      formData.stock === "" ||
      isNaN(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
      newErrors.stock = "Enter a valid stock number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* =========================================================
     API: ADD BOOK
  ========================================================= */

  const handleAddBook = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("isbn", formData.isbn.trim());
      payload.append("author", formData.author.trim());
      payload.append("category", formData.category || categories[0] || "General");
      payload.append("price", Number(formData.price));
      payload.append("stock", Number(formData.stock));
      payload.append("status", formData.status);
      payload.append("description", formData.description.trim());
      payload.append("publisher", formData.publisher.trim());
      payload.append("pages", Number(formData.pages) || 0);
      payload.append("language", formData.language.trim() || "English");
      payload.append("year", Number(formData.year) || new Date().getFullYear());

      if (imageFile) {
        payload.append("image", imageFile);
      } else if (formData.image) {
        payload.append("image", formData.image);
      }

      const res = await API.post("/books", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        closeModal();
        setCurrentPage(1);
        await fetchBooks();
      }
    } catch (err) {
      console.error("Create book error:", err);
      alert(err.response?.data?.message || "Failed to create book");
    }
  };

  /* =========================================================
     API: UPDATE BOOK
  ========================================================= */

  const handleUpdateBook = async (event) => {
    event.preventDefault();
    if (!validateForm() || !selectedBook) return;

    try {
      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("isbn", formData.isbn.trim());
      payload.append("author", formData.author.trim());
      payload.append("category", formData.category || categories[0] || "General");
      payload.append("price", Number(formData.price));
      payload.append("stock", Number(formData.stock));
      payload.append("status", formData.status);
      payload.append("description", formData.description.trim());
      payload.append("publisher", formData.publisher.trim());
      payload.append("pages", Number(formData.pages) || 0);
      payload.append("language", formData.language.trim() || "English");
      payload.append("year", Number(formData.year) || new Date().getFullYear());

      if (imageFile) {
        payload.append("image", imageFile);
      } else if (formData.image) {
        payload.append("image", formData.image);
      }

      const bookId = selectedBook.id || selectedBook._id;
      const res = await API.put(`/books/${bookId}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        closeModal();
        await fetchBooks();
      }
    } catch (err) {
      console.error("Update book error:", err);
      alert(err.response?.data?.message || "Failed to update book");
    }
  };

  /* =========================================================
     API: DELETE BOOK
  ========================================================= */

  const handleDeleteBook = async () => {
    if (!selectedBook) return;

    try {
      const bookId = selectedBook.id || selectedBook._id;
      const res = await API.delete(`/books/${bookId}`);

      if (res.data?.success) {
        setSelectedIds((previous) => previous.filter((id) => id !== bookId));
        closeModal();
        await fetchBooks();
      }
    } catch (err) {
      console.error("Delete book error:", err);
      alert(err.response?.data?.message || "Failed to delete book");
    }
  };

  /* =========================================================
     API: BULK DELETE
  ========================================================= */

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Permanently delete ${selectedIds.length} selected books?`)) return;

    try {
      const res = await API.post("/books/bulk-delete", { ids: selectedIds });
      if (res.data?.success) {
        setSelectedIds([]);
        await fetchBooks();
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert(err.response?.data?.message || "Failed to delete selected books");
    }
  };

  /* =========================================================
     API: STATUS TOGGLE
  ========================================================= */

  const toggleBookStatus = async (book) => {
    try {
      const bookId = book.id || book._id;
      const res = await API.patch(`/books/${bookId}/status`);
      if (res.data?.success) {
        await fetchBooks();
      }
    } catch (err) {
      console.error("Toggle status error:", err);
    }
  };

  /* =========================================================
     EXPORT CSV
  ========================================================= */

  const handleExport = () => {
    const headers = [
      "ID",
      "Book Title",
      "ISBN",
      "Author",
      "Category",
      "Price",
      "Stock",
      "Status",
    ];

    const rows = books.map((book) => [
      book.id,
      book.title,
      book.isbn,
      book.author,
      book.category,
      book.price,
      book.stock,
      book.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "books.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All Categories");
    setStatusFilter("All Status");
    setStockFilter("All Stock");
    setSortFilter("Sort By: Latest");
    setCurrentPage(1);
  };

  const previousPage = () => {
    setCurrentPage((page) => Math.max(1, page - 1));
  };

  const nextPage = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  return (
    <div className="Books">
      {/* HEADER */}
      <section className="Books__header">
        <div className="Books__headerLeft">
          <h1 className="Books__title">Books</h1>
          <p className="Books__subtitle">
            Manage your books. Add, edit or remove books from your store.
          </p>
        </div>

        <div className="Books__headerRight">
          <div className="Books__breadcrumb">
            <span>Dashboard</span>
            <span>›</span>
            <strong>Books</strong>
          </div>

          <button className="Books__addButton" onClick={openAddModal}>
            <Plus size={18} />
            Add Book
          </button>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="Books__stats">
        <div className="Books__statCard Books__statCard--blue">
          <div className="Books__statIcon">
            <BookOpen size={23} />
          </div>
          <div className="Books__statInfo">
            <span>Total Books</span>
            <strong>{totalBooks}</strong>
          </div>
          <BookOpen className="Books__statWatermark" />
        </div>

        <div className="Books__statCard Books__statCard--green">
          <div className="Books__statIcon">
            <CheckCircle2 size={23} />
          </div>
          <div className="Books__statInfo">
            <span>Published</span>
            <strong>{publishedBooks}</strong>
          </div>
          <BookOpen className="Books__statWatermark" />
        </div>

        <div className="Books__statCard Books__statCard--orange">
          <div className="Books__statIcon">
            <Clock3 size={23} />
          </div>
          <div className="Books__statInfo">
            <span>Draft</span>
            <strong>{draftBooks}</strong>
          </div>
          <BookOpen className="Books__statWatermark" />
        </div>

        <div className="Books__statCard Books__statCard--red">
          <div className="Books__statIcon">
            <AlertCircle size={23} />
          </div>
          <div className="Books__statInfo">
            <span>Out of Stock</span>
            <strong>{outOfStockBooks}</strong>
          </div>
          <BookOpen className="Books__statWatermark" />
        </div>
      </section>

      {/* TOOLBAR */}
      <section className="Books__toolbar">
        <div className="Books__filters">
          <div className="Books__search">
            <Search size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search books by title, author, ISBN..."
            />
            {searchTerm && (
              <button
                className="Books__searchClear"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="Books__filterSelect">
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown size={15} />
          </div>

          <div className="Books__filterSelect">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Status</option>
              <option>Published</option>
              <option>Draft</option>
              <option>Out of Stock</option>
            </select>
            <ChevronDown size={15} />
          </div>

          <div className="Books__filterSelect">
            <select
              value={stockFilter}
              onChange={(event) => {
                setStockFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Stock</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
            <ChevronDown size={15} />
          </div>

          <div className="Books__filterSelect Books__filterSelect--sort">
            <select
              value={sortFilter}
              onChange={(event) => {
                setSortFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option>Sort By: Latest</option>
              <option>Sort By: A-Z</option>
              <option>Sort By: Price Low</option>
              <option>Sort By: Price High</option>
              <option>Sort By: Stock</option>
            </select>
            <ChevronDown size={15} />
          </div>
        </div>

        <div className="Books__toolbarActions">
          {selectedIds.length > 0 && (
            <div className="Books__selectedCount">
              <CheckCircle2 size={15} />
              <span>{selectedIds.length} selected</span>
              <button
                onClick={handleBulkDelete}
                title="Delete selected"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#dc2626",
                  marginLeft: "4px",
                }}
              >
                <Trash2 size={13} />
              </button>
              <button onClick={clearSelection} title="Clear selection">
                <X size={13} />
              </button>
            </div>
          )}

          <button className="Books__exportButton" onClick={handleExport}>
            <Download size={16} />
            Export Excel
          </button>
        </div>
      </section>

      {/* TABLE */}
      <section className="Books__tableCard">
        <div className="Books__tableScroll">
          <table className="Books__table">
            <thead>
              <tr>
                <th className="Books__checkboxCell">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isSomeSelected;
                      }
                    }}
                    onChange={handleSelectAll}
                    aria-label="Select all books"
                  />
                </th>
                <th>#</th>
                <th>Image</th>
                <th>Book Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "40px" }}>
                    Loading books...
                  </td>
                </tr>
              ) : currentBooks.length > 0 ? (
                currentBooks.map((book, index) => (
                  <tr
                    key={book.id}
                    className={
                      selectedIds.includes(book.id)
                        ? "Books__rowSelected"
                        : ""
                    }
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(book.id)}
                        onChange={() => handleSelectOne(book.id)}
                      />
                    </td>

                    <td>
                      <span className="Books__number">
                        {startIndex + index + 1}
                      </span>
                    </td>

                    <td>
                      <div className="Books__bookImage">
                        <img
                          src={getImageUrl(book.image)}
                          alt={book.title}
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=85";
                          }}
                        />
                      </div>
                    </td>

                    <td>
                      <div className="Books__bookTitle">
                        <strong>{book.title}</strong>
                        <span>ISBN: {book.isbn || "N/A"}</span>
                      </div>
                    </td>

                    <td>
                      <span className="Books__author">{book.author}</span>
                    </td>

                    <td>
                      <span
                        className={`Books__category Books__category--${(book.category || "general")
                          .toLowerCase()
                          .replace(/[^a-z]/g, "-")}`}
                      >
                        {book.category}
                      </span>
                    </td>

                    <td>
                      <strong className="Books__price">
                        {formatPrice(book.price)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`Books__stock ${
                          book.stock === 0
                            ? "Books__stock--out"
                            : book.stock <= 10
                            ? "Books__stock--low"
                            : "Books__stock--good"
                        }`}
                      >
                        {book.stock}
                      </span>
                    </td>

                    <td>
                      <div className="Books__statusWrapper">
                        <span
                          className={`Books__status Books__status--${(book.status || "published")
                            .toLowerCase()
                            .replace(/\s/g, "-")}`}
                        >
                          {book.status}
                        </span>

                        <button
                          className={`Books__toggle ${
                            book.status === "Published"
                              ? "Books__toggle--active"
                              : "Books__toggle--inactive"
                          }`}
                          onClick={() => toggleBookStatus(book)}
                          title="Click to toggle status"
                        >
                          <span />
                        </button>
                      </div>
                    </td>

                    <td>
                      <div className="Books__actions">
                        <button
                          className="Books__action Books__action--view"
                          onClick={() => openViewModal(book)}
                          title="View Book"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="Books__action Books__action--edit"
                          onClick={() => openEditModal(book)}
                          title="Edit Book"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          className="Books__action Books__action--delete"
                          onClick={() => openDeleteModal(book)}
                          title="Delete Book"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="Books__empty">
                    <div className="Books__emptyContent">
                      <BookOpen size={40} />
                      <h3>No books found</h3>
                      <p>
                        Try changing your filters or add a new book to your store.
                      </p>
                      <button onClick={resetFilters}>Clear Filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}
        <div className="Books__tableFooter">
          <span>
            Showing {pagination.total === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + ITEMS_PER_PAGE, pagination.total)} of{" "}
            {pagination.total} books
          </span>

          <div className="Books__pagination">
            <button
              onClick={previousPage}
              disabled={safeCurrentPage === 1}
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  className={safeCurrentPage === page ? "Books__pageActive" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={nextPage}
              disabled={safeCurrentPage === totalPages}
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ADD / EDIT MODAL */}
      {(modalType === "add" || modalType === "edit") && (
        <div
          className="Books__overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="Books__formModal">
            <div className="Books__modalHeader">
              <div>
                <span className="Books__modalEyebrow">BOOK MANAGEMENT</span>
                <h2>{modalType === "add" ? "Add New Book" : "Edit Book"}</h2>
                <p>
                  {modalType === "add"
                    ? "Add a new book to your bookstore."
                    : "Update the book information below."}
                </p>
              </div>

              <button className="Books__closeButton" onClick={closeModal}>
                <X size={19} />
              </button>
            </div>

            <form
              className="Books__form"
              onSubmit={
                modalType === "add" ? handleAddBook : handleUpdateBook
              }
            >
              {/* IMAGE */}
              <div className="Books__formImageArea">
                <div className="Books__imagePreview">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Book Preview" />
                  ) : (
                    <>
                      <ImageIcon size={27} />
                      <span>Book Cover</span>
                    </>
                  )}
                </div>

                <div className="Books__uploadInfo">
                  <label className="Books__uploadButton">
                    <Upload size={15} />
                    {imagePreview ? "Change Cover" : "Upload Cover"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <span>JPG, PNG, WEBP • Max 5MB</span>
                  {errors.image && <small>{errors.image}</small>}
                </div>
              </div>

              {/* TITLE + ISBN */}
              <div className="Books__formGrid Books__formGrid--two">
                <div className="Books__field">
                  <label>
                    Book Title <b>*</b>
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter book title"
                  />
                  {errors.title && <small>{errors.title}</small>}
                </div>

                <div className="Books__field">
                  <label>ISBN</label>
                  <input
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    placeholder="978XXXXXXXXXX"
                  />
                  {errors.isbn && <small>{errors.isbn}</small>}
                </div>
              </div>

              {/* AUTHOR + CATEGORY */}
              <div className="Books__formGrid Books__formGrid--two">
                <div className="Books__field">
                  <label>
                    Author <b>*</b>
                  </label>
                  <input
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Author name"
                  />
                  {errors.author && <small>{errors.author}</small>}
                </div>

                <div className="Books__field">
                  <label>
                    Category <b>*</b>
                  </label>
                  <div className="Books__inputSelect">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={15} />
                  </div>
                  {errors.category && <small>{errors.category}</small>}
                </div>
              </div>

              {/* PRICE + STOCK + STATUS */}
              <div className="Books__formGrid Books__formGrid--three">
                <div className="Books__field">
                  <label>
                    Price (₹) <b>*</b>
                  </label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="any"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                  {errors.price && <small>{errors.price}</small>}
                </div>

                <div className="Books__field">
                  <label>
                    Stock <b>*</b>
                  </label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                  {errors.stock && <small>{errors.stock}</small>}
                </div>

                <div className="Books__field">
                  <label>Status</label>
                  <div className="Books__inputSelect">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option>Published</option>
                      <option>Draft</option>
                      <option>Out of Stock</option>
                    </select>
                    <ChevronDown size={15} />
                  </div>
                </div>
              </div>

              {/* PUBLISHER + PAGES + LANGUAGE + YEAR */}
              <div className="Books__formGrid Books__formGrid--four">
                <div className="Books__field">
                  <label>Publisher</label>
                  <input
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    placeholder="Publisher"
                  />
                </div>

                <div className="Books__field">
                  <label>Pages</label>
                  <input
                    name="pages"
                    type="number"
                    min="0"
                    value={formData.pages}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>

                <div className="Books__field">
                  <label>Language</label>
                  <input
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    placeholder="English"
                  />
                </div>

                <div className="Books__field">
                  <label>Year</label>
                  <input
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="2024"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="Books__field">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of the book..."
                />
              </div>

              <div className="Books__modalFooter">
                <button
                  type="button"
                  className="Books__cancelButton"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="Books__saveButton">
                  {modalType === "add" ? "Save Book" : "Update Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {modalType === "view" && selectedBook && (
        <div
          className="Books__overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="Books__viewModal">
            <div className="Books__viewModalHeader">
              <h3>Book Details</h3>
              <button className="Books__closeButton" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="Books__viewModalBody">
              <div className="Books__viewImage">
                <img
                  src={getImageUrl(selectedBook.image)}
                  alt={selectedBook.title}
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=85";
                  }}
                />
              </div>

              <div className="Books__viewInfo">
                <div className="Books__viewBadges">
                  <span
                    className={`Books__category Books__category--${(selectedBook.category || "general")
                      .toLowerCase()
                      .replace(/[^a-z]/g, "-")}`}
                  >
                    {selectedBook.category}
                  </span>
                  <span
                    className={`Books__status Books__status--${(selectedBook.status || "published")
                      .toLowerCase()
                      .replace(/\s/g, "-")}`}
                  >
                    {selectedBook.status}
                  </span>
                </div>

                <h2>{selectedBook.title}</h2>
                <p className="Books__viewAuthor">By {selectedBook.author}</p>

                <div className="Books__viewPriceRow">
                  <strong>{formatPrice(selectedBook.price)}</strong>
                  <span>•</span>
                  <span>{selectedBook.stock} in stock</span>
                </div>

                <div className="Books__viewGrid">
                  <div>
                    <label>ISBN</label>
                    <span>{selectedBook.isbn || "N/A"}</span>
                  </div>
                  <div>
                    <label>Publisher</label>
                    <span>{selectedBook.publisher || "N/A"}</span>
                  </div>
                  <div>
                    <label>Pages</label>
                    <span>{selectedBook.pages || "N/A"}</span>
                  </div>
                  <div>
                    <label>Language</label>
                    <span>{selectedBook.language || "English"}</span>
                  </div>
                  <div>
                    <label>Year</label>
                    <span>{selectedBook.year || "N/A"}</span>
                  </div>
                </div>

                {selectedBook.description && (
                  <div className="Books__viewDescription">
                    <label>Description</label>
                    <p>{selectedBook.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="Books__modalFooter">
              <button className="Books__cancelButton" onClick={closeModal}>
                Close
              </button>
              <button
                className="Books__saveButton"
                onClick={() => openEditModal(selectedBook)}
              >
                Edit Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modalType === "delete" && selectedBook && (
        <div
          className="Books__overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="Books__deleteModal">
            <div className="Books__deleteIcon">
              <AlertTriangle size={27} />
            </div>

            <h2>Delete Book?</h2>

            <p>
              You are about to permanently delete{" "}
              <strong>{selectedBook.title}</strong>. This action cannot be undone.
            </p>

            <div className="Books__deleteActions">
              <button className="Books__cancelButton" onClick={closeModal}>
                Cancel
              </button>

              <button
                className="Books__deleteButton"
                onClick={handleDeleteBook}
              >
                <Trash2 size={16} />
                Delete Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;