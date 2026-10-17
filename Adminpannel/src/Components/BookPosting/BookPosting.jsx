import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "react-icons/fa";
import "./BookPosting.css";

const BookPosting = () => {
  /* =========================================================
      CONSTANTS
  ========================================================= */

  const ITEMS_PER_PAGE = 6;

  const emptyForm = {
    title: "",
    author: "",
    category: "",
    price: "",
    offerPrice: "",
    stock: "",
    status: true,
    featured: false,
    description: "",
  };

  const defaultBooks = [
    {
      id: 1,
      title: "Simple Things You Say",
      author: "Rupi Kaur",
      category: "Arts & Photography",
      price: 499,
      offerPrice: "",
      stock: 25,
      status: true,
      featured: true,
      description:
        "A beautiful collection of thoughts, poetry and meaningful reflections.",
      images: [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80",
      ],
    },
    {
      id: 2,
      title: "How Deal With Very Big Problems",
      author: "Steve Blank",
      category: "Biographies & Memoirs",
      price: 649,
      offerPrice: "",
      stock: 24,
      status: true,
      featured: false,
      description:
        "A practical guide to understanding complex problems and creating meaningful solutions.",
      images: [
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=500&q=80",
      ],
    },
    {
      id: 3,
      title: "The Hidden Mystery Book",
      author: "John Doe",
      category: "Arts & Photography",
      price: 699,
      offerPrice: 520,
      stock: 35,
      status: true,
      featured: true,
      description:
        "Explore hidden mysteries through an engaging and beautifully written story.",
      images: [
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80",
      ],
    },
    {
      id: 4,
      title: "Qple GPad With Retina Display",
      author: "Sam Wilson",
      category: "Christian Books & Bibles",
      price: 4200,
      offerPrice: 3499,
      stock: 25,
      status: true,
      featured: false,
      description:
        "A modern technology guide covering productivity, creativity and digital learning.",
      images: [
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80",
      ],
    },
    {
      id: 5,
      title: "Castle In The Sky",
      author: "Emily Stone",
      category: "Sports & Outdoors",
      price: 299,
      offerPrice: "",
      stock: 4,
      status: true,
      featured: false,
      description:
        "A fascinating adventure filled with imagination, courage and discovery.",
      images: [
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=500&q=80",
      ],
    },
    {
      id: 6,
      title: "The Art of Creative Thinking",
      author: "David Miller",
      category: "Arts & Photography",
      price: 1400,
      offerPrice: 1150,
      stock: 18,
      status: true,
      featured: true,
      description:
        "Learn practical techniques for improving creativity and developing innovative ideas.",
      images: [
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80",
      ],
    },
    {
      id: 7,
      title: "Modern Publishing Guide",
      author: "Michael Green",
      category: "Research & Publishing Guides",
      price: 380,
      offerPrice: "",
      stock: 15,
      status: true,
      featured: false,
      description:
        "A complete introduction to modern publishing methods and digital publishing.",
      images: [
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=500&q=80",
      ],
    },
    {
      id: 8,
      title: "Creative Photography",
      author: "James Anderson",
      category: "Arts & Photography",
      price: 850,
      offerPrice: "",
      stock: 12,
      status: true,
      featured: false,
      description:
        "Learn photography composition, lighting and storytelling techniques.",
      images: [
        "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=80",
      ],
    },
    {
      id: 9,
      title: "Chha Mana Atha Guntha",
      author: "Fakir Mohan Senapati",
      category: "Odia Literature",
      price: 350,
      offerPrice: 280,
      stock: 30,
      status: true,
      featured: true,
      description:
        "A classic of Odia literature that explores land, power and the lives of ordinary people.",
      images: [
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=500&q=80",
      ],
    },
    {
      id: 10,
      title: "Godaan",
      author: "Premchand",
      category: "Hindi Literature",
      price: 275,
      offerPrice: "",
      stock: 40,
      status: true,
      featured: false,
      description:
        "A timeless Hindi novel on rural life, hardship and dignity.",
      images: [
        "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=500&q=80",
      ],
    },
  ];

  const categories = [
    "Arts & Photography",
    "Biographies & Memoirs",
    "Christian Books & Bibles",
    "Research & Publishing Guides",
    "Sports & Outdoors",
    "Food & Drink",
    "Odia Literature",
    "Hindi Literature",
  ];

  /* =========================================================
      STATES
  ========================================================= */

  const [books, setBooks] = useState(defaultBooks);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedImages, setSelectedImages] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState({ open: false, type: "", book: null });
  const [editingId, setEditingId] = useState(null);

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
  };

  /* =========================================================
      ADD / UPDATE BOOK
  ========================================================= */

  const handleSubmit = (e) => {
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

    const bookData = {
      ...formData,
      title: formData.title.trim(),
      author: formData.author.trim(),
      price: Number(formData.price),
      offerPrice: formData.offerPrice ? Number(formData.offerPrice) : "",
      stock: Number(formData.stock),
      images: selectedImages.map((item) => item.preview),
    };

    if (editingId) {
      setBooks((prev) =>
        prev.map((book) =>
          book.id === editingId ? { ...book, ...bookData } : book
        )
      );

      showToast("Book updated successfully");
    } else {
      setBooks((prev) => [{ id: Date.now(), ...bookData }, ...prev]);

      showToast("Book added successfully");
    }

    resetForm();
    setCurrentPage(1);
  };

  /* =========================================================
      EDIT
  ========================================================= */

  const handleEdit = (book) => {
    setEditingId(book.id);

    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      price: book.price,
      offerPrice: book.offerPrice,
      stock: book.stock,
      status: book.status,
      featured: book.featured,
      description: book.description,
    });

    setSelectedImages(
      (book.images || []).map((src, index) => ({
        id: `existing-${book.id}-${index}`,
        preview: src,
      }))
    );

    window.scrollTo({ top: 0, behavior: "smooth" });

    showToast("Book loaded for editing");
  };

  /* =========================================================
      DELETE
  ========================================================= */

  const confirmDelete = () => {
    if (!modal.book) return;

    const deletedId = modal.book.id;

    setBooks((prev) => prev.filter((book) => book.id !== deletedId));
    setSelectedBooks((prev) => prev.filter((id) => id !== deletedId));

    if (editingId === deletedId) resetForm();

    closeModal();
    showToast("Book deleted successfully");
  };

  /* =========================================================
      TOGGLES
  ========================================================= */

  const toggleStatus = (id) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id ? { ...book, status: !book.status } : book
      )
    );
  };

  const toggleFeatured = (id) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id ? { ...book, featured: !book.featured } : book
      )
    );
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

          <button
            type="button"
            className="BookPosting-shareButton"
            onClick={handleShareClick}
            aria-label="Share this book collection"
          >
            <span className="BookPosting-shareIcon">
              <FaShareAlt />
            </span>
            Share
          </button>
        </div>
      </div>

      {/* ADD / EDIT BOOK FORM */}
      <section className="BookPosting-formCard">
        <div className="BookPosting-cardHeader">
          <div className="BookPosting-cardTitle">
            <span>
              <FaPlus />
            </span>

            <h2>{editingId ? "Edit Book" : "Add New Book"}</h2>
          </div>

          <button
            type="button"
            className="BookPosting-clearButton"
            onClick={resetForm}
          >
            <FaRedo />
            Clear Form
          </button>
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
                className={`BookPosting-hint ${
                  offerPreview
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
                  apiKey="8hswbe7bfeeneui9eb9gjgsym8ku30nx5gwre9808ajdzniu"
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
                    <img src={image.preview} alt="Book preview" />

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
                          <img src={book.images[0]} alt={book.title} />
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
                        className={`BookPosting-categoryBadge ${
                          book.category === "Odia Literature" ||
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
                        className={`BookPosting-stock ${
                          book.stock === 0
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
                        className={`BookPosting-toggle ${
                          book.status ? "BookPosting-toggleActive" : ""
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
                        className={`BookPosting-toggle ${
                          book.featured ? "BookPosting-toggleFeatured" : ""
                        }`}
                        onClick={() => toggleFeatured(book.id)}
                        aria-label="Toggle featured"
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
                      src={image}
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
                        src={book.images[0]}
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
          className={`BookPosting-toast ${
            toast.type === "error" ? "BookPosting-toastError" : ""
          }`}
          role="status"
        >
          <div className="BookPosting-toastIcon">
            {toast.type === "error" ? <FaExclamationTriangle /> : <FaCheck />}
          </div>

          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default BookPosting;