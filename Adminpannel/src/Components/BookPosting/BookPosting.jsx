import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import {
  FaPlus,
  FaRedo,
  FaUpload,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCheck,
  FaBookOpen,
  FaImage,
  FaFilter,
  FaExclamationTriangle,
  FaBoxOpen,
  FaShareAlt,
  FaLink,
  FaCopy,
  FaWhatsapp,
  FaFacebookF,
  FaTwitter,
  FaTelegramPlane,
  FaEnvelope,
  FaTag,
  FaArrowLeft,
} from "react-icons/fa";
import API, { BASE_URL } from "../../api/axios";
import "./BookPosting.css";

const getImageUrl = (imagePath) => {
  if (!imagePath)
    return "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=500&q=80";
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("blob:") ||
    imagePath.startsWith("data:")
  )
    return imagePath;
  return `${BASE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const BookPosting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editHandledRef = useRef(null);

  /* =========================================================
      CONSTANTS
  ========================================================= */

  const ITEMS_PER_PAGE = 6;

  const emptyForm = {
    title: "",
    isbn: "",
    author: "",
    category: "",
    price: "",
    offerPrice: "",
    stock: "",
    status: true,
    featured: false,
    isTopSelling: false,
    isBestSeller: false,
    publisher: "",
    pages: "",
    language: "English",
    year: new Date().getFullYear(),
    description: "",
  };

  /* =========================================================
      STATES
  ========================================================= */

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedImages, setSelectedImages] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState({ open: false, type: "", book: null });
  const [editingId, setEditingId] = useState(null);
  const [floatExpanded, setFloatExpanded] = useState(true);

  /* =========================================================
      API FETCH CATEGORIES & BOOKS
  ========================================================= */

  const fetchCategories = useCallback(async () => {
    try {
      const res = await API.get("/categories");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCategories(res.data.data.map((c) => c.name));
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/book-posting", { params: { limit: 50 } });
      if (res.data?.success) {
        const fetched = (res.data.data || []).map((b) => ({
          ...b,
          id: b._id || b.id,
          status: b.status === "Published",
          isTopSelling: Boolean(b.isTopSelling),
          isBestSeller: Boolean(b.isBestSeller),
          images: b.images && b.images.length > 0 ? b.images : b.image ? [b.image] : [],
        }));
        setBooks(fetched);
      }
    } catch (err) {
      console.error("Failed to fetch books:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, [fetchCategories, fetchBooks]);


  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [linkCopied, setLinkCopied] = useState(false);

  const fileInputRef = useRef(null);
  const toastTimer = useRef(null);
  const copyTimer = useRef(null);
  const shareInputRef = useRef(null);

  /* =========================================================
      TOAST
  ========================================================= */

  const showToast = (message, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);

    setToast({ show: true, message, type });

    toastTimer.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  /* =========================================================
      HELPERS
  ========================================================= */

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  const hasOffer = (book) =>
    Number(book.offerPrice) > 0 &&
    Number(book.offerPrice) < Number(book.price);

  const getDiscountPercent = (book) =>
    hasOffer(book)
      ? Math.round(
        ((Number(book.price) - Number(book.offerPrice)) /
          Number(book.price)) *
        100
      )
      : 0;

  const getFinalPrice = (book) =>
    hasOffer(book) ? book.offerPrice : book.price;

  // Live savings preview shown under the offer field
  const offerPreview = useMemo(() => {
    const price = Number(formData.price);
    const offer = Number(formData.offerPrice);

    if (!formData.offerPrice) return null;

    if (!price) {
      return { valid: false, text: "Enter the book price first." };
    }

    if (offer >= price) {
      return {
        valid: false,
        text: "Offer price must be lower than the book price.",
      };
    }

    return {
      valid: true,
      text: `Customers save ${formatPrice(price - offer)} (${Math.round(
        ((price - offer) / price) * 100
      )}% off)`,
    };
  }, [formData.price, formData.offerPrice]);

  /* =========================================================
      FORM INPUT
  ========================================================= */

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =========================================================
      IMAGE UPLOAD
      Images are stored as data URLs so they keep working after
      the form is reset (blob URLs would be revoked).
  ========================================================= */

  const readFileAsDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    if (!files.length) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        showToast(`${file.name} is not a valid image`, "error");
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast(`${file.name} is larger than 5MB`, "error");
        return false;
      }

      return true;
    });

    if (!validFiles.length) return;

    try {
      const previews = await Promise.all(
        validFiles.map(async (file) => ({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          preview: await readFileAsDataURL(file),
        }))
      );

      setSelectedImages((prev) => [...prev, ...previews]);
    } catch (error) {
      showToast("Failed to load image", "error");
    }
  };

  const removeSelectedImage = (id) => {
    setSelectedImages((prev) => prev.filter((item) => item.id !== id));
  };

  /* =========================================================
      RESET FORM
  ========================================================= */

  const resetForm = () => {
    setFormData(emptyForm);
    setSelectedImages([]);
    setEditingId(null);
    editHandledRef.current = null;
    if (searchParams.get("edit") || searchParams.get("id")) {
      navigate("/book-posting", { replace: true });
    }
  };

  /* =========================================================
      ADD / UPDATE BOOK
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast("Book title is required", "error");
      return;
    }

    if (!formData.category.trim()) {
      showToast("Please select a category", "error");
      return;
    }

    if (formData.price === "" || Number(formData.price) <= 0) {
      showToast("Enter a valid price", "error");
      return;
    }

    if (
      formData.offerPrice !== "" &&
      Number(formData.offerPrice) >= Number(formData.price)
    ) {
      showToast("Offer price must be lower than the book price", "error");
      return;
    }

    if (formData.stock === "" || Number(formData.stock) < 0) {
      showToast("Enter the stock available", "error");
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        isbn: formData.isbn ? formData.isbn.trim() : "",
        author: formData.author.trim(),
        category: formData.category,
        price: Number(formData.price),
        offerPrice: formData.offerPrice ? Number(formData.offerPrice) : null,
        stock: Number(formData.stock),
        status: formData.status ? "Published" : "Draft",
        featured: formData.featured,
        isTopSelling: formData.isTopSelling,
        isBestSeller: formData.isBestSeller,
        publisher: formData.publisher ? formData.publisher.trim() : "",
        pages: formData.pages !== "" ? Number(formData.pages) : 0,
        language: formData.language ? formData.language.trim() : "English",
        year: formData.year !== "" ? Number(formData.year) : new Date().getFullYear(),
        description: formData.description,
        image: selectedImages[0]?.preview || "",
        images: selectedImages.map((item) => item.preview),
      };

      if (editingId) {
        await API.put(`/book-posting/${editingId}`, payload);
        showToast("Book updated successfully");
      } else {
        await API.post("/book-posting", payload);
        showToast("Book added successfully");
      }

      await fetchBooks();
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      console.error("Book save error:", err);
      showToast(err.response?.data?.message || "Failed to save book", "error");
    }
  };

  /* =========================================================
      EDIT
  ========================================================= */

  const handleEdit = useCallback((book) => {
    if (!book) return;
    const bId = book.id || book._id;
    setEditingId(bId);

    setFormData({
      title: book.title || "",
      isbn: book.isbn || "",
      author: book.author || "",
      category: book.category || "",
      price: book.price !== undefined && book.price !== null ? book.price : "",
      offerPrice: book.offerPrice !== undefined && book.offerPrice !== null ? book.offerPrice : "",
      stock: book.stock !== undefined && book.stock !== null ? book.stock : "",
      status: book.status === true || book.status === "Published",
      featured: Boolean(book.featured),
      isTopSelling: Boolean(book.isTopSelling),
      isBestSeller: Boolean(book.isBestSeller),
      publisher: book.publisher || "",
      pages: book.pages !== undefined && book.pages !== null ? book.pages : "",
      language: book.language || "English",
      year: book.year !== undefined && book.year !== null ? book.year : new Date().getFullYear(),
      description: book.description || "",
    });

    const bookImages =
      book.images && book.images.length > 0
        ? book.images
        : book.image
          ? [book.image]
          : [];

    setSelectedImages(
      bookImages.map((src, index) => ({
        id: `existing-${bId}-${index}`,
        preview: src,
      }))
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast(`Loaded "${book.title || "Book"}" for editing`);
  }, []);

  /* =========================================================
      AUTO LOAD EDIT BOOK FROM NAVIGATION OR QUERY PARAM
  ========================================================= */

  useEffect(() => {
    const editQueryId = searchParams.get("edit") || searchParams.get("id");
    const passedBook = location.state?.editBook;
    const targetId =
      editQueryId ||
      location.state?.bookId ||
      (passedBook ? passedBook.id || passedBook._id : null);

    if (!targetId) return;
    if (editHandledRef.current === targetId) return;

    if (passedBook) {
      editHandledRef.current = targetId;
      handleEdit(passedBook);
      return;
    }

    const foundInList = books.find(
      (b) => String(b.id || b._id) === String(targetId)
    );
    if (foundInList) {
      editHandledRef.current = targetId;
      handleEdit(foundInList);
      return;
    }

    // Direct fetch by ID from API
    API.get(`/book-posting/${targetId}`)
      .then((res) => {
        if (res.data?.success && res.data.data) {
          editHandledRef.current = targetId;
          handleEdit(res.data.data);
        }
      })
      .catch(() => {
        API.get(`/books/${targetId}`)
          .then((res) => {
            if (res.data?.success && res.data.data) {
              editHandledRef.current = targetId;
              handleEdit(res.data.data);
            }
          })
          .catch((err) => {
            console.error("Failed to load book for editing:", err);
          });
      });
  }, [location.state, searchParams, books, handleEdit]);

  /* =========================================================
      DELETE
  ========================================================= */

  const confirmDelete = async () => {
    if (!modal.book) return;
    const deletedId = modal.book.id || modal.book._id;

    try {
      await API.delete(`/book-posting/${deletedId}`);
      setSelectedBooks((prev) => prev.filter((id) => id !== deletedId));
      if (editingId === deletedId) resetForm();
      closeModal();
      await fetchBooks();
      showToast("Book deleted successfully");
    } catch (err) {
      console.error("Delete book error:", err);
      showToast("Failed to delete book", "error");
    }
  };

  /* =========================================================
      TOGGLES
  ========================================================= */

  const toggleStatus = async (id) => {
    try {
      await API.patch(`/book-posting/${id}/status`);
      await fetchBooks();
      showToast("Status updated");
    } catch (err) {
      console.error("Status toggle error:", err);
      showToast("Failed to update status", "error");
    }
  };

  const toggleFeatured = async (id) => {
    try {
      await API.patch(`/book-posting/${id}/featured`);
      await fetchBooks();
      showToast("Featured status updated");
    } catch (err) {
      console.error("Featured toggle error:", err);
      showToast("Failed to update featured status", "error");
    }
  };

  const toggleTopSelling = async (id) => {
    try {
      await API.patch(`/book-posting/${id}/top-selling`);
      await fetchBooks();
      showToast("Top Selling status updated");
    } catch (err) {
      console.error("Top Selling toggle error:", err);
      showToast("Failed to update Top Selling status", "error");
    }
  };

  const toggleBestSeller = async (id) => {
    try {
      await API.patch(`/book-posting/${id}/best-seller`);
      await fetchBooks();
      showToast("Best Seller status updated");
    } catch (err) {
      console.error("Best Seller toggle error:", err);
      showToast("Failed to update Best Seller status", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedBooks.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedBooks.length} book posting(s)?`)) return;
    try {
      await API.post("/book-posting/bulk-delete", { ids: selectedBooks });
      setSelectedBooks([]);
      await fetchBooks();
      showToast("Selected books deleted successfully");
    } catch (err) {
      console.error("Bulk delete error:", err);
      showToast("Failed to delete selected books", "error");
    }
  };

  /* =========================================================
      SEARCH / FILTER
  ========================================================= */

  const filteredBooks = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return books.filter((book) => {
      const searchMatch =
        book.title.toLowerCase().includes(term) ||
        (book.author || "").toLowerCase().includes(term);

      const categoryMatch =
        categoryFilter === "All Categories" ||
        book.category === categoryFilter;

      return searchMatch && categoryMatch;
    });
  }, [books, searchTerm, categoryFilter]);

  /* =========================================================
      PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBooks.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentBooks = filteredBooks.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  /* =========================================================
      SELECT ALL
  ========================================================= */

  const currentPageIds = currentBooks.map((book) => book.id);

  const allCurrentSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedBooks.includes(id));

  const handleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedBooks((prev) =>
        prev.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      setSelectedBooks((prev) => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedBooks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  /* =========================================================
      MODAL
  ========================================================= */

  const openModal = (type, book = null) => {
    setModal({ open: true, type, book });
  };

  const closeModal = () => {
    setModal({ open: false, type: "", book: null });
    setLinkCopied(false);
  };

  useEffect(() => {
    if (!modal.open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal.open]);

  /* =========================================================
      SHARE
  ========================================================= */

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const publishedCount = books.filter((book) => book.status).length;

  const shareTitle = "BookPosting – Book Collection";

  const shareText = `Explore our book collection on BookPosting: ${publishedCount} books available, including Odia and Hindi literature.`;

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleShareClick = () => {
    setLinkCopied(false);
    openModal("share");
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
    } catch (error) {
      // The user closing the share sheet is not an error
      if (error && error.name !== "AbortError") {
        showToast("Could not open the share sheet", "error");
      }
    }
  };

  const handleCopyLink = async () => {
    let copied = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        copied = true;
      }
    } catch (error) {
      copied = false;
    }

    if (!copied) {
      try {
        const input = shareInputRef.current;
        if (input) {
          input.focus();
          input.select();
          input.setSelectionRange(0, 99999);
          copied = document.execCommand("copy");
        }
      } catch (error) {
        copied = false;
      }
    }

    if (copied) {
      setLinkCopied(true);
      showToast("Link copied to clipboard");

      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setLinkCopied(false), 2200);
    } else {
      showToast("Copy failed. Please copy the link manually.", "error");
    }
  };

  const shareTargets = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: <FaWhatsapp />,
      url: `https://wa.me/?text=${encodeURIComponent(
        `${shareText} ${shareUrl}`
      )}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: <FaFacebookF />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
    },
    {
      key: "twitter",
      label: "Twitter",
      icon: <FaTwitter />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      key: "telegram",
      label: "Telegram",
      icon: <FaTelegramPlane />,
      url: `https://t.me/share/url?url=${encodeURIComponent(
        shareUrl
      )}&text=${encodeURIComponent(shareText)}`,
    },
    {
      key: "email",
      label: "Email",
      icon: <FaEnvelope />,
      url: `mailto:?subject=${encodeURIComponent(
        shareTitle
      )}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
    },
  ];

  const handleShareTarget = (target) => {
    if (target.key === "email") {
      window.location.href = target.url;
      return;
    }

    window.open(target.url, "_blank", "noopener,noreferrer");
  };

  const shareThumbs = books
    .filter((book) => book.status && book.images?.[0])
    .slice(0, 3);

  /* =========================================================
      EXPORT CSV
  ========================================================= */

  const exportCSV = () => {
    if (!books.length) {
      showToast("No books available", "error");
      return;
    }

    const headers = [
      "Title",
      "Author",
      "Category",
      "Price",
      "Offer Price",
      "Discount %",
      "Stock Available",
      "Status",
      "Featured",
      "Publisher",
      "Pages",
      "Language",
      "Year",
    ];

    const rows = books.map((book) => [
      book.title,
      book.author,
      book.category,
      book.price,
      book.offerPrice,
      getDiscountPercent(book) || "",
      book.stock,
      book.status ? "Published" : "Unpublished",
      book.featured ? "Yes" : "No",
      book.publisher || "",
      book.pages || 0,
      book.language || "English",
      book.year || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "bookposting-books-list.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast("Books exported successfully");
  };

  /* =========================================================
      RENDER
  ========================================================= */

  return (
    <div className="BookPosting">
      {/* HEADER */}
      <div className="BookPosting-header">
        <div className="BookPosting-headerLeft">
          <div className="BookPosting-headerIcon">
            <FaBookOpen />
          </div>

          <div>
            <h1>Add / Manage Books</h1>
            <p>Add new books, manage categories, offers, stock and more.</p>
          </div>
        </div>

        <div className="BookPosting-headerRight">
          <div className="BookPosting-breadcrumb">
            Dashboard
            <FaChevronRight />
            Books / Products
          </div>
        </div>
      </div>

      {/* ADD / EDIT BOOK FORM */}
      <section className="BookPosting-formCard">
        <div className="BookPosting-cardHeader">
          <div className="BookPosting-cardTitle">
            <span className="BookPosting-cardIcon">
              {editingId ? <FaEdit /> : <FaPlus />}
            </span>

            <h2>{editingId ? "Edit Book Details" : "Add New Book"}</h2>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {editingId && (
              <button
                type="button"
                className="BookPosting-clearButton"
                onClick={() => navigate("/books")}
                style={{
                  background: "#f1f5f9",
                  color: "#334155",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FaArrowLeft />
                Back to Books
              </button>
            )}

            <button
              type="button"
              className="BookPosting-clearButton"
              onClick={resetForm}
            >
              <FaRedo />
              {editingId ? "Cancel Edit" : "Clear Form"}
            </button>
          </div>
        </div>

        <form className="BookPosting-form" onSubmit={handleSubmit}>
          {/* ROW 1 */}
          <div className="BookPosting-formGrid">
            <div className="BookPosting-field">
              <label>
                Book Title <span>*</span>
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter book title"
              />
            </div>

            <div className="BookPosting-field">
              <label>Author</label>

              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Enter author name"
              />
            </div>

            <div className="BookPosting-field">
              <label>
                Category <span>*</span>
              </label>

              <div className="BookPosting-selectWrapper">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={!formData.category ? "BookPosting-placeholder" : ""}
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="BookPosting-field">
              <label>
                Price (₹) <span>*</span>
              </label>

              <input
                type="number"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
              />
            </div>
          </div>

          {/* ROW 2 */}
          <div className="BookPosting-formGrid">
            <div className="BookPosting-field">
              <label>Discount on Offer (₹)</label>

              <div className="BookPosting-inputIcon">
                <FaTag />
                <input
                  type="number"
                  min="0"
                  name="offerPrice"
                  value={formData.offerPrice}
                  onChange={handleInputChange}
                  placeholder="Offer price e.g. 399"
                />
              </div>

              <small
                className={`BookPosting-hint ${offerPreview
                    ? offerPreview.valid
                      ? "BookPosting-hintSuccess"
                      : "BookPosting-hintError"
                    : ""
                  }`}
              >
                {offerPreview
                  ? offerPreview.text
                  : "Leave empty if there is no offer."}
              </small>
            </div>

            <div className="BookPosting-field">
              <label>
                Stock Available <span>*</span>
              </label>

              <input
                type="number"
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="Copies available"
              />

              <small className="BookPosting-hint">
                Number of copies ready to ship.
              </small>
            </div>

            <div className="BookPosting-field">
              <label>Status</label>

              <div className="BookPosting-selectWrapper">
                <select
                  name="status"
                  value={formData.status ? "published" : "unpublished"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value === "published",
                    }))
                  }
                >
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </div>
            </div>

            <div className="BookPosting-field">
              <label>Featured Book</label>

              <div className="BookPosting-selectWrapper">
                <select
                  name="featured"
                  value={formData.featured ? "yes" : "no"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      featured: e.target.value === "yes",
                    }))
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>

            <div className="BookPosting-field">
              <label>Top Selling Book</label>

              <div className="BookPosting-selectWrapper">
                <select
                  name="isTopSelling"
                  value={formData.isTopSelling ? "yes" : "no"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isTopSelling: e.target.value === "yes",
                    }))
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes (Show Top Seller badge)</option>
                </select>
              </div>
            </div>

            <div className="BookPosting-field">
              <label>Best Seller Book</label>

              <div className="BookPosting-selectWrapper">
                <select
                  name="isBestSeller"
                  value={formData.isBestSeller ? "yes" : "no"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isBestSeller: e.target.value === "yes",
                    }))
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes (Show Best Seller badge)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ROW 3 - ISBN, PUBLISHER, PAGES, LANGUAGE, YEAR */}
          <div className="BookPosting-formGrid">
            <div className="BookPosting-field">
              <label>ISBN</label>

              <input
                type="text"
                name="isbn"
                value={formData.isbn || ""}
                onChange={handleInputChange}
                placeholder="e.g. 978-0-123456-47-2"
              />
            </div>

            <div className="BookPosting-field">
              <label>Publisher</label>

              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleInputChange}
                placeholder="Publisher"
              />
            </div>

            <div className="BookPosting-field">
              <label>Pages</label>

              <input
                type="number"
                min="0"
                name="pages"
                value={formData.pages}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>

            <div className="BookPosting-field">
              <label>Language</label>

              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                placeholder="English"
              />
            </div>

            <div className="BookPosting-field">
              <label>Year</label>

              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                placeholder={new Date().getFullYear().toString()}
              />
            </div>
          </div>

          {/* DESCRIPTION + IMAGES */}
          <div className="BookPosting-bottomGrid">
            <div className="BookPosting-descriptionSection">
              <div className="BookPosting-labelRow">
                <label>Description</label>

                <span className="BookPosting-descriptionHint">
                  Rich text editor
                </span>
              </div>

              <div className="BookPosting-editorWrapper">
                <Editor
                  apiKey="czj65v9x2uy3y9jz7l7xmjpm3hnnass9rwcy9zhzx46lxpis"
                  value={formData.description}
                  onEditorChange={(content) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: content,
                    }))
                  }
                  init={{
                    height: 260,
                    menubar: true,
                    branding: false,
                    resize: true,
                    plugins:
                      "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount",
                    toolbar:
                      "undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | table | removeformat | fullscreen",
                    content_style:
                      "body { font-family: Inter, Arial, sans-serif; font-size:14px; line-height:1.7; padding:12px; }",
                    placeholder:
                      "Write a detailed description about the book...",
                  }}
                />
              </div>
            </div>

            <div className="BookPosting-imageSection">
              <div className="BookPosting-labelRow">
                <label>Book Images</label>

                <span className="BookPosting-imageHint">
                  JPG, PNG, WebP • Max 5MB
                </span>
              </div>

              <div className="BookPosting-imageUploadArea">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  hidden
                />

                <button
                  type="button"
                  className="BookPosting-uploadBox"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaImage />

                  <strong>Click to upload images</strong>

                  <span>Multiple images allowed</span>
                </button>

                {selectedImages.map((image) => (
                  <div className="BookPosting-imagePreview" key={image.id}>
                    <img src={getImageUrl(image.preview)} alt="Book preview" />

                    <button
                      type="button"
                      onClick={() => removeSelectedImage(image.id)}
                      aria-label="Remove image"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="BookPosting-addMoreImage"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaPlus />
                  <span>Add More</span>
                </button>
              </div>
            </div>
          </div>

          {/* FORM ACTIONS */}
          <div className="BookPosting-formActions">
            <button type="submit" className="BookPosting-submitButton">
              <FaUpload />

              {editingId ? "Update Book" : "Add Book"}
            </button>
          </div>
        </form>
      </section>

      {/* BOOK LIST */}
      <section className="BookPosting-listCard">
        <div className="BookPosting-listHeader">
          <div className="BookPosting-listTitle">
            <span>
              <FaBookOpen />
            </span>

            <div>
              <h2>
                Books List
                <small>({filteredBooks.length})</small>
              </h2>

              <p>Manage your books and publishing status</p>
            </div>
          </div>

          <div className="BookPosting-listTools">
            <div className="BookPosting-searchBox">
              <FaSearch />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search books..."
              />
            </div>

            <div className="BookPosting-filterBox">
              <FaFilter />

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
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
            </div>

            <button
              type="button"
              className="BookPosting-exportButton"
              onClick={exportCSV}
            >
              <FaDownload />
              Export
            </button>
          </div>
        </div>

        {/* SELECTED BAR */}
        {selectedBooks.length > 0 && (
          <div className="BookPosting-selectionBar">
            <div>
              <FaCheck />
              {selectedBooks.length} book
              {selectedBooks.length > 1 ? "s" : ""} selected
            </div>

            <button type="button" onClick={() => setSelectedBooks([])}>
              Clear selection
            </button>
            <button
              type="button"
              style={{
                marginLeft: "10px",
                color: "#ef4444",
                border: "1px solid #fee2e2",
                background: "#fef2f2",
                borderRadius: "6px",
                padding: "4px 10px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "12px",
              }}
              onClick={handleBulkDelete}
            >
              Delete selected
            </button>
          </div>
        )}

        {/* TABLE */}
        <div className="BookPosting-tableWrapper">
          <table className="BookPosting-table">
            <thead>
              <tr>
                <th className="BookPosting-checkboxColumn">
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={handleSelectAll}
                  />
                </th>

                <th>#</th>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price / Offer</th>
                <th>Stock Available</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Top Selling</th>
                <th>Best Seller</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentBooks.length > 0 ? (
                currentBooks.map((book, index) => (
                  <tr
                    key={book.id}
                    className={
                      selectedBooks.includes(book.id)
                        ? "BookPosting-selectedRow"
                        : ""
                    }
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedBooks.includes(book.id)}
                        onChange={() => handleSelectOne(book.id)}
                      />
                    </td>

                    <td>
                      <span className="BookPosting-rowNumber">
                        {startIndex + index + 1}
                      </span>
                    </td>

                    <td>
                      <div className="BookPosting-tableImage">
                        {book.images?.[0] ? (
                          <img src={getImageUrl(book.images[0])} alt={book.title} />
                        ) : (
                          <FaImage />
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="BookPosting-bookInfo">
                        <strong>{book.title}</strong>

                        <span>{book.author || "Unknown Author"}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`BookPosting-categoryBadge ${book.category === "Odia Literature" ||
                            book.category === "Hindi Literature"
                            ? "BookPosting-categoryRegional"
                            : ""
                          }`}
                      >
                        {book.category}
                      </span>
                    </td>

                    <td>
                      <div className="BookPosting-price">
                        <strong>{formatPrice(getFinalPrice(book))}</strong>

                        {hasOffer(book) && (
                          <>
                            <del>{formatPrice(book.price)}</del>
                            <em className="BookPosting-offerBadge">
                              {getDiscountPercent(book)}% OFF
                            </em>
                          </>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`BookPosting-stock ${book.stock === 0
                            ? "BookPosting-outStock"
                            : book.stock <= 5
                              ? "BookPosting-lowStock"
                              : ""
                          }`}
                      >
                        {book.stock === 0
                          ? "Out of stock"
                          : book.stock <= 5
                            ? `${book.stock} left`
                            : book.stock}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`BookPosting-toggle ${book.status ? "BookPosting-toggleActive" : ""
                          }`}
                        onClick={() => toggleStatus(book.id)}
                        aria-label="Toggle status"
                      >
                        <span />
                      </button>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`BookPosting-toggle ${book.featured ? "BookPosting-toggleFeatured" : ""
                          }`}
                        onClick={() => toggleFeatured(book.id)}
                        aria-label="Toggle featured"
                      >
                        <span />
                      </button>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`BookPosting-toggle ${book.isTopSelling ? "BookPosting-toggleTopSelling" : ""
                          }`}
                        onClick={() => toggleTopSelling(book.id)}
                        title={book.isTopSelling ? "Top Selling (Active) - Click to deactivate" : "Inactive - Click to activate Top Selling"}
                        aria-label="Toggle top selling"
                      >
                        <span />
                      </button>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`BookPosting-toggle ${book.isBestSeller ? "BookPosting-toggleBestSeller" : ""
                          }`}
                        onClick={() => toggleBestSeller(book.id)}
                        title={book.isBestSeller ? "Best Seller (Active) - Click to deactivate" : "Inactive - Click to activate Best Seller"}
                        aria-label="Toggle best seller"
                      >
                        <span />
                      </button>
                    </td>

                    <td>
                      <div className="BookPosting-actions">
                        <button
                          type="button"
                          className="BookPosting-actionButton BookPosting-viewAction"
                          title="View"
                          onClick={() => openModal("view", book)}
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="BookPosting-actionButton BookPosting-editAction"
                          title="Edit"
                          onClick={() => handleEdit(book)}
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          className="BookPosting-actionButton BookPosting-deleteAction"
                          title="Delete"
                          onClick={() => openModal("delete", book)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="BookPosting-emptyState">
                    <FaBoxOpen />
                    <strong>No books found</strong>
                    <span>Try changing your search or category filter.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="BookPosting-pagination">
          <div className="BookPosting-paginationInfo">
            Showing{" "}
            <strong>{filteredBooks.length === 0 ? 0 : startIndex + 1}</strong>–
            <strong>
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredBooks.length)}
            </strong>{" "}
            of <strong>{filteredBooks.length}</strong> results
          </div>

          <div className="BookPosting-paginationControls">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              <FaChevronLeft />
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  className={currentPage === page ? "BookPosting-pageActive" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
            >
              Next
              <FaChevronRight />
            </button>
          </div>

          <div className="BookPosting-perPage">{ITEMS_PER_PAGE} per page</div>
        </div>
      </section>

      {/* VIEW MODAL */}
      {modal.open && modal.type === "view" && modal.book && (
        <div className="BookPosting-modalOverlay" onClick={closeModal}>
          <div
            className="BookPosting-modal BookPosting-viewModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="BookPosting-modalHeader">
              <div>
                <span className="BookPosting-modalIcon">
                  <FaEye />
                </span>

                <div>
                  <h3>Book Details</h3>
                  <p>Complete information about this book</p>
                </div>
              </div>

              <button type="button" onClick={closeModal} aria-label="Close">
                <FaTimes />
              </button>
            </div>

            <div className="BookPosting-viewContent">
              <div className="BookPosting-viewImages">
                {modal.book.images?.length > 0 ? (
                  modal.book.images.map((image, index) => (
                    <img
                      src={getImageUrl(image)}
                      alt={`${modal.book.title}-${index}`}
                      key={index}
                    />
                  ))
                ) : (
                  <div className="BookPosting-noImage">No Image</div>
                )}
              </div>

              <div className="BookPosting-viewDetails">
                <div className="BookPosting-viewTitleRow">
                  <div>
                    <span className="BookPosting-viewCategory">
                      {modal.book.category}
                    </span>

                    <h2>{modal.book.title}</h2>

                    <p>By {modal.book.author || "Unknown Author"}</p>
                  </div>

                  {hasOffer(modal.book) && (
                    <div className="BookPosting-viewOffer">
                      <FaTag />
                      {getDiscountPercent(modal.book)}% OFF
                    </div>
                  )}
                </div>

                <div className="BookPosting-viewGrid">
                  <div>
                    <span>Price</span>
                    <strong>
                      {formatPrice(getFinalPrice(modal.book))}
                      {hasOffer(modal.book) && (
                        <del>{formatPrice(modal.book.price)}</del>
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Stock Available</span>
                    <strong>{modal.book.stock}</strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>
                      {modal.book.status ? "Published" : "Unpublished"}
                    </strong>
                  </div>

                  <div>
                    <span>Featured</span>
                    <strong>{modal.book.featured ? "Yes" : "No"}</strong>
                  </div>

                  <div>
                    <span>Publisher</span>
                    <strong>{modal.book.publisher || "N/A"}</strong>
                  </div>

                  <div>
                    <span>Pages</span>
                    <strong>{modal.book.pages || 0}</strong>
                  </div>

                  <div>
                    <span>Language</span>
                    <strong>{modal.book.language || "English"}</strong>
                  </div>

                  <div>
                    <span>Year</span>
                    <strong>{modal.book.year || "N/A"}</strong>
                  </div>
                </div>

                <div className="BookPosting-viewDescription">
                  <h4>Description</h4>

                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        modal.book.description ||
                        "<p>No description available.</p>",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="BookPosting-modalFooter">
              <button
                type="button"
                className="BookPosting-modalClose"
                onClick={closeModal}
              >
                Close
              </button>

              <button
                type="button"
                className="BookPosting-modalEdit"
                onClick={() => {
                  handleEdit(modal.book);
                  closeModal();
                }}
              >
                <FaEdit />
                Edit Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modal.open && modal.type === "delete" && modal.book && (
        <div className="BookPosting-modalOverlay" onClick={closeModal}>
          <div
            className="BookPosting-modal BookPosting-deleteModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="BookPosting-deleteIcon">
              <FaExclamationTriangle />
            </div>

            <h3>Delete this book?</h3>

            <p>
              Are you sure you want to delete{" "}
              <strong>"{modal.book.title}"</strong>? This action cannot be
              undone.
            </p>

            <div className="BookPosting-deleteActions">
              <button
                type="button"
                onClick={closeModal}
                className="BookPosting-cancelDelete"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="BookPosting-confirmDelete"
              >
                <FaTrash />
                Delete Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {modal.open && modal.type === "share" && (
        <div className="BookPosting-modalOverlay" onClick={closeModal}>
          <div
            className="BookPosting-modal BookPosting-shareModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="BookPosting-modalHeader">
              <div>
                <span className="BookPosting-modalIcon">
                  <FaShareAlt />
                </span>

                <div>
                  <h3>Share Book Collection</h3>
                  <p>Invite readers to explore your books</p>
                </div>
              </div>

              <button type="button" onClick={closeModal} aria-label="Close">
                <FaTimes />
              </button>
            </div>

            <div className="BookPosting-shareBody">
              <div className="BookPosting-sharePreview">
                <div className="BookPosting-shareThumbs">
                  {shareThumbs.length > 0 ? (
                    shareThumbs.map((book, index) => (
                      <img
                        key={book.id}
                        src={getImageUrl(book.images[0])}
                        alt={book.title}
                        style={{ zIndex: shareThumbs.length - index }}
                      />
                    ))
                  ) : (
                    <span className="BookPosting-shareThumbEmpty">
                      <FaBookOpen />
                    </span>
                  )}
                </div>

                <div className="BookPosting-shareInfo">
                  <strong>{shareTitle}</strong>
                  <span>
                    {publishedCount} published book
                    {publishedCount === 1 ? "" : "s"} • Odia & Hindi literature
                    included
                  </span>
                </div>
              </div>

              <label className="BookPosting-shareLabel">Page link</label>

              <div className="BookPosting-shareLink">
                <FaLink />

                <input
                  ref={shareInputRef}
                  type="text"
                  readOnly
                  value={shareUrl}
                  onFocus={(e) => e.target.select()}
                />

                <button
                  type="button"
                  className={linkCopied ? "BookPosting-copied" : ""}
                  onClick={handleCopyLink}
                >
                  {linkCopied ? <FaCheck /> : <FaCopy />}
                  {linkCopied ? "Copied" : "Copy"}
                </button>
              </div>

              <label className="BookPosting-shareLabel">Share via</label>

              <div className="BookPosting-shareGrid">
                {shareTargets.map((target) => (
                  <button
                    key={target.key}
                    type="button"
                    className={`BookPosting-shareTarget BookPosting-share-${target.key}`}
                    onClick={() => handleShareTarget(target)}
                  >
                    <span>{target.icon}</span>
                    {target.label}
                  </button>
                ))}
              </div>

              {canNativeShare && (
                <button
                  type="button"
                  className="BookPosting-nativeShare"
                  onClick={handleNativeShare}
                >
                  <FaShareAlt />
                  Share using your device
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast.show && (
        <div
          className={`BookPosting-toast ${toast.type === "error" ? "BookPosting-toastError" : ""
            }`}
          role="status"
        >
          <div className="BookPosting-toastIcon">
            {toast.type === "error" ? <FaExclamationTriangle /> : <FaCheck />}
          </div>

          <span>{toast.message}</span>
        </div>
      )}

      {/* FLOATING ACTION TOOLBAR / CHATBOT-STYLE WIDGET (BOTTOM-RIGHT) */}
      {editingId && (
        <div className="BookPosting-floatingWidget">
          {/* TOOLTIP ON HOVER (WHEN COLLAPSED) */}
          {!floatExpanded && (
            <div className="BookPosting-floatingTooltip">
              <span>✏️ Editing Mode Active</span>
              <small>{formData.title ? `"${formData.title.slice(0, 24)}${formData.title.length > 24 ? '...' : ''}"` : "Click to view options"}</small>
            </div>
          )}

          {floatExpanded ? (
            <div className="BookPosting-floatingDock">
              <div className="BookPosting-floatingDockHeader">
                <div className="BookPosting-floatingDockTitle">
                  <span className="BookPosting-dockPulse" />
                  <FaEdit className="BookPosting-dockEditIcon" />
                  <strong>Editing Book</strong>
                </div>

                <button
                  type="button"
                  className="BookPosting-dockCloseBtn"
                  onClick={() => setFloatExpanded(false)}
                  title="Minimize floating widget"
                  aria-label="Minimize"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="BookPosting-floatingDockBody">
                <div className="BookPosting-dockBookInfo">
                  <span className="BookPosting-dockBookLabel">Currently Editing</span>
                  <p className="BookPosting-dockBookTitle" title={formData.title}>
                    📖 {formData.title || "Untitled Book"}
                  </p>
                  {formData.author && (
                    <span className="BookPosting-dockBookAuthor">
                      Author: {formData.author}
                    </span>
                  )}
                </div>

                <div className="BookPosting-dockActions">
                  <button
                    type="button"
                    className="BookPosting-dockBtn BookPosting-dockBtn--back"
                    onClick={() => navigate("/books")}
                    title="Return to books list"
                  >
                    <FaArrowLeft /> Books List
                  </button>

                  <button
                    type="button"
                    className="BookPosting-dockBtn BookPosting-dockBtn--cancel"
                    onClick={resetForm}
                    title="Discard changes and clear form"
                  >
                    <FaRedo /> Cancel Edit
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="BookPosting-floatingLauncher"
              onClick={() => setFloatExpanded(true)}
              title="Editing Mode Active - Click to view details"
              aria-label="Expand editing toolbar"
            >
              <span className="BookPosting-launcherPulse" />
              <FaEdit />
              <span className="BookPosting-launcherBadge">1</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookPosting;