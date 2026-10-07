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
  FaStar,
  FaImage,
  FaFilter,
  FaExclamationTriangle,
  FaTag,
  FaBoxOpen,
} from "react-icons/fa";
import "./Shop.css";

const Shop = () => {
  /* =========================================================
     CONSTANTS
  ========================================================= */

  const ITEMS_PER_PAGE = 6;

  const defaultBooks = [
    {
      id: 1,
      title: "Simple Things You Say",
      author: "Rupi Kaur",
      category: "Arts & Photography",
      price: 499,
      discountPrice: "",
      stock: 25,
      rating: 3.4,
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
      discountPrice: "",
      stock: 24,
      rating: 4.2,
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
      discountPrice: 520,
      stock: 35,
      rating: 4.8,
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
      discountPrice: 3499,
      stock: 25,
      rating: 3.4,
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
      discountPrice: "",
      stock: 24,
      rating: 4.5,
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
      discountPrice: 1150,
      stock: 18,
      rating: 4.9,
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
      discountPrice: "",
      stock: 15,
      rating: 5,
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
      discountPrice: "",
      stock: 12,
      rating: 4.6,
      status: true,
      featured: false,
      description:
        "Learn photography composition, lighting and storytelling techniques.",
      images: [
        "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=80",
      ],
    },
  ];

  /* =========================================================
     STATES
  ========================================================= */

  const [books, setBooks] = useState(defaultBooks);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    price: "",
    discountPrice: "",
    stock: "",
    rating: "",
    status: true,
    featured: false,
    description: "",
  });

  const [selectedImages, setSelectedImages] = useState([]);

  const [categories, setCategories] = useState([
    "Arts & Photography",
    "Biographies & Memoirs",
    "Christian Books & Bibles",
    "Research & Publishing Guides",
    "Sports & Outdoors",
    "Food & Drink",
  ]);

  const [categoryInput, setCategoryInput] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const [selectedBooks, setSelectedBooks] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState({
    open: false,
    type: "",
    book: null,
  });

  const [editingId, setEditingId] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const fileInputRef = useRef(null);

  /* =========================================================
     TOAST
  ========================================================= */

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 2500);
  };

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
     CATEGORY
  ========================================================= */

  const addCategory = () => {
    const newCategory = categoryInput.trim();

    if (!newCategory) {
      showToast("Please enter a category", "error");
      return;
    }

    const exists = categories.some(
      (category) => category.toLowerCase() === newCategory.toLowerCase()
    );

    if (exists) {
      setFormData((prev) => ({
        ...prev,
        category: newCategory,
      }));

      setCategoryInput("");
      showToast("Category selected");
      return;
    }

    setCategories((prev) => [...prev, newCategory]);

    setFormData((prev) => ({
      ...prev,
      category: newCategory,
    }));

    setCategoryInput("");

    showToast("Category added successfully");
  };

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    const validFiles = [];

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        showToast(`${file.name} is not a valid image`, "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast(`${file.name} is larger than 5MB`, "error");
        return;
      }

      validFiles.push(file);
    });

    const previews = validFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...previews]);

    e.target.value = "";
  };

  const removeSelectedImage = (id) => {
    setSelectedImages((prev) => {
      const image = prev.find((item) => item.id === id);

      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }

      return prev.filter((item) => item.id !== id);
    });
  };

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    selectedImages.forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });

    setFormData({
      title: "",
      author: "",
      category: "",
      price: "",
      discountPrice: "",
      stock: "",
      rating: "",
      status: true,
      featured: false,
      description: "",
    });

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
      showToast("Please add/select a category", "error");
      return;
    }

    if (!formData.price) {
      showToast("Price is required", "error");
      return;
    }

    if (!formData.stock) {
      showToast("Stock is required", "error");
      return;
    }

    if (editingId) {
      setBooks((prev) =>
        prev.map((book) =>
          book.id === editingId
            ? {
                ...book,
                ...formData,
                price: Number(formData.price),
                discountPrice: formData.discountPrice
                  ? Number(formData.discountPrice)
                  : "",
                stock: Number(formData.stock),
                rating: Number(formData.rating || 0),
                images:
                  selectedImages.length > 0
                    ? selectedImages.map((item) => item.preview)
                    : book.images,
              }
            : book
        )
      );

      showToast("Book updated successfully");
    } else {
      const newBook = {
        id: Date.now(),
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice
          ? Number(formData.discountPrice)
          : "",
        stock: Number(formData.stock),
        rating: Number(formData.rating || 0),
        images: selectedImages.map((item) => item.preview),
      };

      setBooks((prev) => [newBook, ...prev]);

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
      discountPrice: book.discountPrice,
      stock: book.stock,
      rating: book.rating,
      status: book.status,
      featured: book.featured,
      description: book.description,
    });

    setSelectedImages([]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    showToast("Book loaded for editing");
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const confirmDelete = () => {
    if (!modal.book) return;

    setBooks((prev) =>
      prev.filter((book) => book.id !== modal.book.id)
    );

    setSelectedBooks((prev) =>
      prev.filter((id) => id !== modal.book.id)
    );

    closeModal();

    showToast("Book deleted successfully");
  };

  /* =========================================================
     TOGGLE STATUS
  ========================================================= */

  const toggleStatus = (id) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id
          ? {
              ...book,
              status: !book.status,
            }
          : book
      )
    );
  };

  /* =========================================================
     TOGGLE FEATURED
  ========================================================= */

  const toggleFeatured = (id) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id
          ? {
              ...book,
              featured: !book.featured,
            }
          : book
      )
    );
  };

  /* =========================================================
     SEARCH / FILTER
  ========================================================= */

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const searchMatch =
        book.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        book.author
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

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
      setSelectedBooks((prev) => [
        ...new Set([...prev, ...currentPageIds]),
      ]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedBooks((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  /* =========================================================
     MODAL
  ========================================================= */

  const openModal = (type, book = null) => {
    setModal({
      open: true,
      type,
      book,
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      type: "",
      book: null,
    });
  };

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
      "Discount Price",
      "Stock",
      "Rating",
      "Status",
      "Featured",
    ];

    const rows = books.map((book) => [
      book.title,
      book.author,
      book.category,
      book.price,
      book.discountPrice,
      book.stock,
      book.rating,
      book.status ? "Published" : "Unpublished",
      book.featured ? "Yes" : "No",
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "books-list.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast("Books exported successfully");
  };

  /* =========================================================
     FORMAT PRICE
  ========================================================= */

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  /* =========================================================
     CLEANUP IMAGE URLS
  ========================================================= */

  useEffect(() => {
    return () => {
      selectedImages.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="Shop">

      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <div className="Shop-header">
        <div className="Shop-headerLeft">
          <div className="Shop-headerIcon">
            <FaBookOpen />
          </div>

          <div>
            <h1>Add / Manage Books</h1>
            <p>
              Add new books, manage categories, stock, price and more.
            </p>
          </div>
        </div>

        <div className="Shop-breadcrumb">
          Dashboard
          <FaChevronRight />
          Books / Products
        </div>
      </div>

      {/* =====================================================
          ADD BOOK FORM
      ===================================================== */}

      <section className="Shop-formCard">

        <div className="Shop-cardHeader">
          <div className="Shop-cardTitle">
            <span>
              <FaPlus />
            </span>

            <h2>
              {editingId ? "Edit Book" : "Add New Book"}
            </h2>
          </div>

          <button
            type="button"
            className="Shop-clearButton"
            onClick={resetForm}
          >
            <FaRedo />
            Clear Form
          </button>
        </div>

        <form
          className="Shop-form"
          onSubmit={handleSubmit}
        >

          {/* ROW 1 */}

          <div className="Shop-formGrid">

            <div className="Shop-field">
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

            <div className="Shop-field">
              <label>Author</label>

              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Enter author name"
              />
            </div>

            <div className="Shop-field">
              <label>
                Category <span>*</span>
              </label>

              <div className="Shop-categoryInput">
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) =>
                    setCategoryInput(e.target.value)
                  }
                  placeholder={
                    formData.category ||
                    "Enter or add category"
                  }
                />

                <button
                  type="button"
                  onClick={addCategory}
                  title="Add category"
                >
                  <FaPlus />
                </button>
              </div>

              {formData.category && (
                <div className="Shop-selectedCategory">
                  <FaTag />
                  {formData.category}

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        category: "",
                      }))
                    }
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>

            <div className="Shop-field">
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

          <div className="Shop-formGrid">

            <div className="Shop-field">
              <label>Discount Price (₹)</label>

              <input
                type="number"
                min="0"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleInputChange}
                placeholder="Enter discount price"
              />
            </div>

            <div className="Shop-field">
              <label>
                Stock <span>*</span>
              </label>

              <input
                type="number"
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="Enter stock"
              />
            </div>

            <div className="Shop-field">
              <label>Rating</label>

              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                placeholder="Enter rating e.g. 4.5"
              />
            </div>

            <div className="Shop-field">
              <label>Status</label>

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
                <option value="published">
                  Published
                </option>

                <option value="unpublished">
                  Unpublished
                </option>
              </select>
            </div>

          </div>

          {/* DESCRIPTION + IMAGES */}

          <div className="Shop-bottomGrid">

            {/* DESCRIPTION */}

            <div className="Shop-descriptionSection">

              <div className="Shop-labelRow">
                <label>
                  Description <span>*</span>
                </label>

                <span className="Shop-descriptionHint">
                  Rich text editor
                </span>
              </div>

              <div className="Shop-editorWrapper">

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

            {/* IMAGE UPLOAD */}

            <div className="Shop-imageSection">

              <div className="Shop-labelRow">
                <label>
                  Book Images <span>*</span>
                </label>

                <span className="Shop-imageHint">
                  JPG, PNG, WebP • Max 5MB
                </span>
              </div>

              <div className="Shop-imageUploadArea">

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
                  className="Shop-uploadBox"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  <FaImage />

                  <strong>
                    Click to upload images
                  </strong>

                  <span>
                    Multiple images allowed
                  </span>
                </button>

                {selectedImages.map((image) => (
                  <div
                    className="Shop-imagePreview"
                    key={image.id}
                  >
                    <img
                      src={image.preview}
                      alt="Book preview"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeSelectedImage(image.id)
                      }
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="Shop-addMoreImage"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  <FaPlus />
                  <span>Add More</span>
                </button>

              </div>

            </div>

          </div>

          {/* FORM BUTTON */}

          <div className="Shop-formActions">

            <button
              type="submit"
              className="Shop-submitButton"
            >
              <FaUpload />

              {editingId
                ? "Update Book"
                : "Add Book"}
            </button>

          </div>

        </form>
      </section>

      {/* =====================================================
          BOOK LIST
      ===================================================== */}

      <section className="Shop-listCard">

        <div className="Shop-listHeader">

          <div className="Shop-listTitle">
            <span>
              <FaBookOpen />
            </span>

            <div>
              <h2>
                Books List
                <small>
                  ({filteredBooks.length})
                </small>
              </h2>

              <p>
                Manage your books and publishing status
              </p>
            </div>
          </div>

          <div className="Shop-listTools">

            <div className="Shop-searchBox">
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

            <div className="Shop-filterBox">

              <FaFilter />

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option>
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>

            </div>

            <button
              className="Shop-exportButton"
              onClick={exportCSV}
            >
              <FaDownload />
              Export
            </button>

          </div>

        </div>

        {/* SELECTED INFO */}

        {selectedBooks.length > 0 && (
          <div className="Shop-selectionBar">

            <div>
              <FaCheck />
              {selectedBooks.length} book
              {selectedBooks.length > 1
                ? "s"
                : ""} selected
            </div>

            <button
              onClick={() =>
                setSelectedBooks([])
              }
            >
              Clear selection
            </button>

          </div>
        )}

        {/* TABLE */}

        <div className="Shop-tableWrapper">

          <table className="Shop-table">

            <thead>
              <tr>

                <th className="Shop-checkboxColumn">
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
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
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
                        ? "Shop-selectedRow"
                        : ""
                    }
                  >

                    {/* CHECKBOX */}

                    <td>
                      <input
                        type="checkbox"
                        checked={selectedBooks.includes(
                          book.id
                        )}
                        onChange={() =>
                          handleSelectOne(book.id)
                        }
                      />
                    </td>

                    {/* NUMBER */}

                    <td>
                      <span className="Shop-rowNumber">
                        {startIndex + index + 1}
                      </span>
                    </td>

                    {/* IMAGE */}

                    <td>

                      <div className="Shop-tableImage">

                        {book.images?.[0] ? (
                          <img
                            src={book.images[0]}
                            alt={book.title}
                          />
                        ) : (
                          <FaImage />
                        )}

                      </div>

                    </td>

                    {/* TITLE */}

                    <td>

                      <div className="Shop-bookInfo">

                        <strong>
                          {book.title}
                        </strong>

                        <span>
                          {book.author || "Unknown Author"}
                        </span>

                      </div>

                    </td>

                    {/* CATEGORY */}

                    <td>

                      <span className="Shop-categoryBadge">
                        {book.category}
                      </span>

                    </td>

                    {/* PRICE */}

                    <td>

                      <div className="Shop-price">

                        <strong>
                          {formatPrice(
                            book.discountPrice ||
                              book.price
                          )}
                        </strong>

                        {book.discountPrice && (
                          <del>
                            {formatPrice(book.price)}
                          </del>
                        )}

                      </div>

                    </td>

                    {/* STOCK */}

                    <td>

                      <span
                        className={`Shop-stock ${
                          book.stock <= 5
                            ? "Shop-lowStock"
                            : ""
                        }`}
                      >
                        {book.stock}
                      </span>

                    </td>

                    {/* RATING */}

                    <td>

                      <div className="Shop-rating">

                        <FaStar />

                        <span>
                          {book.rating || "0.0"}
                        </span>

                      </div>

                    </td>

                    {/* STATUS */}

                    <td>

                      <button
                        type="button"
                        className={`Shop-toggle ${
                          book.status
                            ? "Shop-toggleActive"
                            : ""
                        }`}
                        onClick={() =>
                          toggleStatus(book.id)
                        }
                        aria-label="Toggle status"
                      >
                        <span />
                      </button>

                    </td>

                    {/* FEATURED */}

                    <td>

                      <button
                        type="button"
                        className={`Shop-toggle ${
                          book.featured
                            ? "Shop-toggleFeatured"
                            : ""
                        }`}
                        onClick={() =>
                          toggleFeatured(book.id)
                        }
                        aria-label="Toggle featured"
                      >
                        <span />
                      </button>

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="Shop-actions">

                        <button
                          type="button"
                          className="Shop-actionButton Shop-viewAction"
                          title="View"
                          onClick={() =>
                            openModal("view", book)
                          }
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="Shop-actionButton Shop-editAction"
                          title="Edit"
                          onClick={() =>
                            handleEdit(book)
                          }
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          className="Shop-actionButton Shop-deleteAction"
                          title="Delete"
                          onClick={() =>
                            openModal("delete", book)
                          }
                        >
                          <FaTrash />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))
              ) : (

                <tr>
                  <td
                    colSpan="11"
                    className="Shop-emptyState"
                  >
                    <FaBoxOpen />
                    <strong>
                      No books found
                    </strong>
                    <span>
                      Try changing your search or category filter.
                    </span>
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* ===================================================
            PAGINATION
        =================================================== */}

        <div className="Shop-pagination">

          <div className="Shop-paginationInfo">
            Showing{" "}
            <strong>
              {filteredBooks.length === 0
                ? 0
                : startIndex + 1}
            </strong>
            –
            <strong>
              {Math.min(
                startIndex + ITEMS_PER_PAGE,
                filteredBooks.length
              )}
            </strong>{" "}
            of{" "}
            <strong>
              {filteredBooks.length}
            </strong>{" "}
            results
          </div>

          <div className="Shop-paginationControls">

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.max(1, prev - 1)
                )
              }
            >
              <FaChevronLeft />
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (

              <button
                key={page}
                type="button"
                className={
                  currentPage === page
                    ? "Shop-pageActive"
                    : ""
                }
                onClick={() =>
                  setCurrentPage(page)
                }
              >
                {page}
              </button>

            ))}

            <button
              type="button"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(totalPages, prev + 1)
                )
              }
            >
              Next
              <FaChevronRight />
            </button>

          </div>

          <div className="Shop-perPage">
            6 per page
          </div>

        </div>

      </section>

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      {modal.open && modal.type === "view" && modal.book && (

        <div
          className="Shop-modalOverlay"
          onClick={closeModal}
        >

          <div
            className="Shop-modal Shop-viewModal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="Shop-modalHeader">

              <div>
                <span className="Shop-modalIcon">
                  <FaEye />
                </span>

                <div>
                  <h3>
                    Book Details
                  </h3>

                  <p>
                    Complete information about this book
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
              >
                <FaTimes />
              </button>

            </div>

            <div className="Shop-viewContent">

              <div className="Shop-viewImages">

                {modal.book.images?.length > 0 ? (
                  modal.book.images.map(
                    (image, index) => (
                      <img
                        src={image}
                        alt={`${modal.book.title}-${index}`}
                        key={index}
                      />
                    )
                  )
                ) : (
                  <div className="Shop-noImage">
                    No Image
                  </div>
                )}

              </div>

              <div className="Shop-viewDetails">

                <div className="Shop-viewTitleRow">

                  <div>
                    <span className="Shop-viewCategory">
                      {modal.book.category}
                    </span>

                    <h2>
                      {modal.book.title}
                    </h2>

                    <p>
                      By {modal.book.author ||
                        "Unknown Author"}
                    </p>
                  </div>

                  <div className="Shop-viewRating">
                    <FaStar />
                    {modal.book.rating}
                  </div>

                </div>

                <div className="Shop-viewGrid">

                  <div>
                    <span>Price</span>

                    <strong>
                      {formatPrice(
                        modal.book.discountPrice ||
                          modal.book.price
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Stock</span>

                    <strong>
                      {modal.book.stock}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>

                    <strong>
                      {modal.book.status
                        ? "Published"
                        : "Unpublished"}
                    </strong>
                  </div>

                  <div>
                    <span>Featured</span>

                    <strong>
                      {modal.book.featured
                        ? "Yes"
                        : "No"}
                    </strong>
                  </div>

                </div>

                <div className="Shop-viewDescription">

                  <h4>
                    Description
                  </h4>

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

            <div className="Shop-modalFooter">

              <button
                type="button"
                className="Shop-modalClose"
                onClick={closeModal}
              >
                Close
              </button>

              <button
                type="button"
                className="Shop-modalEdit"
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

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {modal.open && modal.type === "delete" && modal.book && (

        <div
          className="Shop-modalOverlay"
          onClick={closeModal}
        >

          <div
            className="Shop-modal Shop-deleteModal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="Shop-deleteIcon">
              <FaExclamationTriangle />
            </div>

            <h3>
              Delete this book?
            </h3>

            <p>
              Are you sure you want to delete{" "}
              <strong>
                "{modal.book.title}"
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="Shop-deleteActions">

              <button
                type="button"
                onClick={closeModal}
                className="Shop-cancelDelete"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="Shop-confirmDelete"
              >
                <FaTrash />
                Delete Book
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast.show && (

        <div
          className={`Shop-toast ${
            toast.type === "error"
              ? "Shop-toastError"
              : ""
          }`}
        >

          <div className="Shop-toastIcon">
            {toast.type === "error" ? (
              <FaExclamationTriangle />
            ) : (
              <FaCheck />
            )}
          </div>

          <span>
            {toast.message}
          </span>

        </div>

      )}

    </div>
  );
};

export default Shop;