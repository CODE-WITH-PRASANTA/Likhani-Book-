import React, { useMemo, useState } from "react";
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

import "./Books.css";

const Books = () => {
  /* =========================================================
     INITIAL BOOK DATA
  ========================================================= */

  const initialBooks = [
    {
      id: 1,
      title: "Castle The Sky",
      isbn: "978014039433",
      author: "Hayao Miyazaki",
      category: "Kids",
      price: 1299,
      stock: 18,
      status: "Published",
      image:
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=85",
      description:
        "A beautifully illustrated fantasy story filled with adventure, friendship and imagination.",
      publisher: "Likhani Books",
      pages: 330,
      language: "English",
      year: 2021,
    },
    {
      id: 2,
      title: "Atomic Habits",
      isbn: "9780735211292",
      author: "James Clear",
      category: "Self Help",
      price: 899,
      stock: 0,
      status: "Out of Stock",
      image:
        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=300&q=85",
      description:
        "A practical guide to building good habits and breaking bad ones.",
      publisher: "Penguin",
      pages: 320,
      language: "English",
      year: 2018,
    },
    {
      id: 3,
      title: "Thinking, Fast and Slow",
      isbn: "9780141033570",
      author: "Daniel Kahneman",
      category: "Academic",
      price: 1099,
      stock: 12,
      status: "Published",
      image:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&q=85",
      description:
        "An exploration of the two systems that drive the way we think.",
      publisher: "Farrar",
      pages: 512,
      language: "English",
      year: 2012,
    },
    {
      id: 4,
      title: "The Psychology of Money",
      isbn: "9780857197689",
      author: "Morgan Housel",
      category: "Non-Fiction",
      price: 799,
      stock: 25,
      status: "Published",
      image:
        "https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=300&q=85",
      description:
        "Timeless lessons on wealth, greed and happiness.",
      publisher: "Harriman House",
      pages: 256,
      language: "English",
      year: 2020,
    },
    {
      id: 5,
      title: "Comic Adventures",
      isbn: "9781401234567",
      author: "Stan Lee",
      category: "Comics",
      price: 499,
      stock: 5,
      status: "Published",
      image:
        "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=300&q=85",
      description:
        "A colorful collection of exciting comic book adventures.",
      publisher: "Marvel",
      pages: 180,
      language: "English",
      year: 2019,
    },
    {
      id: 6,
      title: "Sherlock Holmes",
      isbn: "9781435164707",
      author: "Arthur Conan Doyle",
      category: "Mystery",
      price: 699,
      stock: 30,
      status: "Published",
      image:
        "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=300&q=85",
      description:
        "The legendary detective solves some of his most fascinating mysteries.",
      publisher: "Wordsworth",
      pages: 420,
      language: "English",
      year: 2017,
    },
    {
      id: 7,
      title: "The Great Gatsby",
      isbn: "9780743273565",
      author: "F. Scott Fitzgerald",
      category: "Fiction",
      price: 599,
      stock: 8,
      status: "Published",
      image:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&q=85",
      description:
        "A classic American novel about wealth, love and the American dream.",
      publisher: "Scribner",
      pages: 180,
      language: "English",
      year: 1925,
    },
    {
      id: 8,
      title: "Rich Dad Poor Dad",
      isbn: "9781612680194",
      author: "Robert T. Kiyosaki",
      category: "Self Help",
      price: 950,
      stock: 0,
      status: "Out of Stock",
      image:
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=300&q=85",
      description:
        "A personal finance classic about money, investing and financial independence.",
      publisher: "Plata Publishing",
      pages: 336,
      language: "English",
      year: 1997,
    },
    {
      id: 9,
      title: "The Alchemist",
      isbn: "9780062315007",
      author: "Paulo Coelho",
      category: "Fiction",
      price: 549,
      stock: 14,
      status: "Published",
      image:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=85",
      description:
        "A philosophical novel about following your dreams.",
      publisher: "HarperCollins",
      pages: 208,
      language: "English",
      year: 1988,
    },
    {
      id: 10,
      title: "Wings of Fire",
      isbn: "9788173711466",
      author: "A. P. J. Abdul Kalam",
      category: "Non-Fiction",
      price: 450,
      stock: 22,
      status: "Published",
      image:
        "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=300&q=85",
      description:
        "The inspiring autobiography of India's former President.",
      publisher: "Universities Press",
      pages: 180,
      language: "English",
      year: 1999,
    },
  ];

  /* =========================================================
     STATES
  ========================================================= */

  const [books, setBooks] = useState(initialBooks);

  const [searchTerm, setSearchTerm] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [stockFilter, setStockFilter] =
    useState("All Stock");

  const [sortFilter, setSortFilter] =
    useState("Sort By: Latest");

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState([]);

  const [modalType, setModalType] = useState(null);

  const [selectedBook, setSelectedBook] = useState(null);

  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    author: "",
    category: "Fiction",
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
     CATEGORIES
  ========================================================= */

  const categories = [
    "Fiction",
    "Non-Fiction",
    "Academic",
    "Kids",
    "Self Help",
    "Comics",
    "Mystery",
    "Others",
  ];

  /* =========================================================
     FILTER + SORT
  ========================================================= */

  const filteredBooks = useMemo(() => {
    let result = [...books];

    const search = searchTerm.toLowerCase().trim();

    if (search) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(search) ||
          book.author.toLowerCase().includes(search) ||
          book.isbn.toLowerCase().includes(search)
      );
    }

    if (categoryFilter !== "All Categories") {
      result = result.filter(
        (book) => book.category === categoryFilter
      );
    }

    if (statusFilter !== "All Status") {
      result = result.filter(
        (book) => book.status === statusFilter
      );
    }

    if (stockFilter !== "All Stock") {
      if (stockFilter === "In Stock") {
        result = result.filter(
          (book) => book.stock > 0
        );
      }

      if (stockFilter === "Out of Stock") {
        result = result.filter(
          (book) => book.stock === 0
        );
      }

      if (stockFilter === "Low Stock") {
        result = result.filter(
          (book) =>
            book.stock > 0 &&
            book.stock <= 10
        );
      }
    }

    if (sortFilter === "Sort By: A-Z") {
      result.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    if (sortFilter === "Sort By: Price Low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortFilter === "Sort By: Price High") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sortFilter === "Sort By: Stock") {
      result.sort((a, b) => b.stock - a.stock);
    }

    return result;
  }, [
    books,
    searchTerm,
    categoryFilter,
    statusFilter,
    stockFilter,
    sortFilter,
  ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredBooks.length / ITEMS_PER_PAGE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    ITEMS_PER_PAGE;

  const currentBooks = filteredBooks.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  /* =========================================================
     SELECT ALL
  ========================================================= */

  const currentBookIds = currentBooks.map(
    (book) => book.id
  );

  const isAllSelected =
    currentBookIds.length > 0 &&
    currentBookIds.every((id) =>
      selectedIds.includes(id)
    );

  const isSomeSelected =
    currentBookIds.some((id) =>
      selectedIds.includes(id)
    ) && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((previous) =>
        previous.filter(
          (id) =>
            !currentBookIds.includes(id)
        )
      );
    } else {
      setSelectedIds((previous) => [
        ...new Set([
          ...previous,
          ...currentBookIds,
        ]),
      ]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter(
            (selectedId) =>
              selectedId !== id
          )
        : [...previous, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalBooks = books.length;

  const publishedBooks = books.filter(
    (book) => book.status === "Published"
  ).length;

  const draftBooks = books.filter(
    (book) => book.status === "Draft"
  ).length;

  const outOfStockBooks = books.filter(
    (book) => book.stock === 0
  ).length;

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

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);

      setFormData((previous) => ({
        ...previous,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);

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
      category: "Fiction",
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

    setImagePreview("");

    setErrors({});
  };

  /* =========================================================
     OPEN ADD
  ========================================================= */

  const openAddModal = () => {
    resetForm();

    setSelectedBook(null);

    setModalType("add");
  };

  /* =========================================================
     OPEN VIEW
  ========================================================= */

  const openViewModal = (book) => {
    setSelectedBook(book);

    setModalType("view");
  };

  /* =========================================================
     OPEN EDIT
  ========================================================= */

  const openEditModal = (book) => {
    setSelectedBook(book);

    setFormData({
      title: book.title,
      isbn: book.isbn,
      author: book.author,
      category: book.category,
      price: book.price,
      stock: book.stock,
      status: book.status,
      description: book.description,
      publisher: book.publisher,
      pages: book.pages,
      language: book.language,
      year: book.year,
      image: book.image,
    });

    setImagePreview(book.image);

    setErrors({});

    setModalType("edit");
  };

  /* =========================================================
     OPEN DELETE
  ========================================================= */

  const openDeleteModal = (book) => {
    setSelectedBook(book);

    setModalType("delete");
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    setModalType(null);

    setSelectedBook(null);

    resetForm();
  };

  /* =========================================================
     VALIDATE
  ========================================================= */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title =
        "Book title is required.";
    }

    if (!formData.author.trim()) {
      newErrors.author =
        "Author is required.";
    }

    if (!formData.isbn.trim()) {
      newErrors.isbn =
        "ISBN is required.";
    }

    if (
      !formData.price ||
      Number(formData.price) < 0
    ) {
      newErrors.price =
        "Enter a valid price.";
    }

    if (
      formData.stock === "" ||
      Number(formData.stock) < 0
    ) {
      newErrors.stock =
        "Enter a valid stock.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================================================
     ADD BOOK
  ========================================================= */

  const handleAddBook = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const stock = Number(formData.stock);

    const newBook = {
      id: Date.now(),
      title: formData.title.trim(),
      isbn: formData.isbn.trim(),
      author: formData.author.trim(),
      category: formData.category,
      price: Number(formData.price),
      stock,
      status:
        stock === 0
          ? "Out of Stock"
          : formData.status,
      image:
        formData.image ||
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=85",
      description: formData.description,
      publisher: formData.publisher,
      pages: Number(formData.pages || 0),
      language: formData.language,
      year: Number(
        formData.year ||
          new Date().getFullYear()
      ),
    };

    setBooks((previous) => [
      newBook,
      ...previous,
    ]);

    setCurrentPage(1);

    closeModal();
  };

  /* =========================================================
     UPDATE BOOK
  ========================================================= */

  const handleUpdateBook = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const stock = Number(formData.stock);

    setBooks((previous) =>
      previous.map((book) =>
        book.id === selectedBook.id
          ? {
              ...book,
              title: formData.title.trim(),
              isbn: formData.isbn.trim(),
              author: formData.author.trim(),
              category: formData.category,
              price: Number(formData.price),
              stock,
              status:
                stock === 0
                  ? "Out of Stock"
                  : formData.status,
              image:
                formData.image ||
                book.image,
              description:
                formData.description,
              publisher:
                formData.publisher,
              pages: Number(
                formData.pages || 0
              ),
              language:
                formData.language,
              year: Number(
                formData.year ||
                  new Date().getFullYear()
              ),
            }
          : book
      )
    );

    closeModal();
  };

  /* =========================================================
     DELETE BOOK
  ========================================================= */

  const handleDeleteBook = () => {
    if (!selectedBook) return;

    setBooks((previous) =>
      previous.filter(
        (book) =>
          book.id !== selectedBook.id
      )
    );

    setSelectedIds((previous) =>
      previous.filter(
        (id) =>
          id !== selectedBook.id
      )
    );

    setCurrentPage(1);

    closeModal();
  };

  /* =========================================================
     STATUS TOGGLE
  ========================================================= */

  const toggleBookStatus = (book) => {
    setBooks((previous) =>
      previous.map((item) => {
        if (item.id !== book.id) {
          return item;
        }

        if (item.status === "Published") {
          return {
            ...item,
            status: "Draft",
          };
        }

        if (item.stock === 0) {
          return {
            ...item,
            status: "Out of Stock",
          };
        }

        return {
          ...item,
          status: "Published",
        };
      })
    );
  };

  /* =========================================================
     EXPORT
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
          .map(
            (value) =>
              `"${String(value).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link =
      document.createElement("a");

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

  /* =========================================================
     PAGINATION
  ========================================================= */

  const previousPage = () => {
    setCurrentPage((page) =>
      Math.max(1, page - 1)
    );
  };

  const nextPage = () => {
    setCurrentPage((page) =>
      Math.min(totalPages, page + 1)
    );
  };

  /* =========================================================
     CURRENCY
  ========================================================= */

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="Books">

      {/* HEADER */}

      <section className="Books__header">

        <div className="Books__headerLeft">

          <h1 className="Books__title">
            Books
          </h1>

          <p className="Books__subtitle">
            Manage your books. Add, edit or
            remove books from your store.
          </p>

        </div>

        <div className="Books__headerRight">

          <div className="Books__breadcrumb">
            <span>Dashboard</span>
            <span>›</span>
            <strong>Books</strong>
          </div>

          <button
            className="Books__addButton"
            onClick={openAddModal}
          >
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
                setSearchTerm(
                  event.target.value
                );
                setCurrentPage(1);
              }}
              placeholder="Search books by title, author, ISBN..."
            />

            {searchTerm && (
              <button
                className="Books__searchClear"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                <X size={14} />
              </button>
            )}

          </div>

          <div className="Books__filterSelect">

            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(
                  event.target.value
                );
                setCurrentPage(1);
              }}
            >

              <option>
                All Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category}
                  >
                    {category}
                  </option>
                )
              )}

            </select>

            <ChevronDown size={15} />

          </div>

          <div className="Books__filterSelect">

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target.value
                );
                setCurrentPage(1);
              }}
            >

              <option>
                All Status
              </option>

              <option>
                Published
              </option>

              <option>
                Draft
              </option>

              <option>
                Out of Stock
              </option>

            </select>

            <ChevronDown size={15} />

          </div>

          <div className="Books__filterSelect">

            <select
              value={stockFilter}
              onChange={(event) => {
                setStockFilter(
                  event.target.value
                );
                setCurrentPage(1);
              }}
            >

              <option>
                All Stock
              </option>

              <option>
                In Stock
              </option>

              <option>
                Low Stock
              </option>

              <option>
                Out of Stock
              </option>

            </select>

            <ChevronDown size={15} />

          </div>

          <div className="Books__filterSelect Books__filterSelect--sort">

            <select
              value={sortFilter}
              onChange={(event) => {
                setSortFilter(
                  event.target.value
                );
                setCurrentPage(1);
              }}
            >

              <option>
                Sort By: Latest
              </option>

              <option>
                Sort By: A-Z
              </option>

              <option>
                Sort By: Price Low
              </option>

              <option>
                Sort By: Price High
              </option>

              <option>
                Sort By: Stock
              </option>

            </select>

            <ChevronDown size={15} />

          </div>

        </div>

        <div className="Books__toolbarActions">

          {selectedIds.length > 0 && (
            <div className="Books__selectedCount">

              <CheckCircle2 size={15} />

              <span>
                {selectedIds.length} selected
              </span>

              <button
                onClick={clearSelection}
              >
                <X size={13} />
              </button>

            </div>
          )}

          <button
            className="Books__exportButton"
            onClick={handleExport}
          >
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
                    checked={
                      isAllSelected
                    }
                    ref={(input) => {
                      if (input) {
                        input.indeterminate =
                          isSomeSelected;
                      }
                    }}
                    onChange={
                      handleSelectAll
                    }
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

              {currentBooks.length > 0 ? (

                currentBooks.map(
                  (book, index) => (

                    <tr
                      key={book.id}
                      className={
                        selectedIds.includes(
                          book.id
                        )
                          ? "Books__rowSelected"
                          : ""
                      }
                    >

                      <td>

                        <input
                          type="checkbox"
                          checked={selectedIds.includes(
                            book.id
                          )}
                          onChange={() =>
                            handleSelectOne(
                              book.id
                            )
                          }
                        />

                      </td>

                      <td>
                        <span className="Books__number">
                          {startIndex +
                            index +
                            1}
                        </span>
                      </td>

                      <td>

                        <div className="Books__bookImage">

                          <img
                            src={book.image}
                            alt={book.title}
                          />

                        </div>

                      </td>

                      <td>

                        <div className="Books__bookTitle">

                          <strong>
                            {book.title}
                          </strong>

                          <span>
                            ISBN: {book.isbn}
                          </span>

                        </div>

                      </td>

                      <td>

                        <span className="Books__author">
                          {book.author}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`Books__category Books__category--${book.category
                            .toLowerCase()
                            .replace(
                              /[^a-z]/g,
                              "-"
                            )}`}
                        >
                          {book.category}
                        </span>

                      </td>

                      <td>

                        <strong className="Books__price">
                          {formatPrice(
                            book.price
                          )}
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
                            className={`Books__status Books__status--${book.status
                              .toLowerCase()
                              .replace(
                                /\s/g,
                                "-"
                              )}`}
                          >
                            {book.status}
                          </span>

                          <button
                            className={`Books__toggle ${
                              book.status ===
                              "Published"
                                ? "Books__toggle--active"
                                : "Books__toggle--inactive"
                            }`}
                            onClick={() =>
                              toggleBookStatus(
                                book
                              )
                            }
                          >
                            <span />
                          </button>

                        </div>

                      </td>

                      <td>

                        <div className="Books__actions">

                          <button
                            className="Books__action Books__action--view"
                            onClick={() =>
                              openViewModal(
                                book
                              )
                            }
                            title="View Book"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            className="Books__action Books__action--edit"
                            onClick={() =>
                              openEditModal(
                                book
                              )
                            }
                            title="Edit Book"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            className="Books__action Books__action--delete"
                            onClick={() =>
                              openDeleteModal(
                                book
                              )
                            }
                            title="Delete Book"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="10"
                    className="Books__empty"
                  >

                    <div className="Books__emptyContent">

                      <BookOpen size={40} />

                      <h3>
                        No books found
                      </h3>

                      <p>
                        Try changing your
                        filters or search
                        keyword.
                      </p>

                      <button
                        onClick={
                          resetFilters
                        }
                      >
                        Clear Filters
                      </button>

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

            Showing{" "}

            {filteredBooks.length === 0
              ? 0
              : startIndex + 1}

            {" "}to{" "}

            {Math.min(
              startIndex +
                ITEMS_PER_PAGE,
              filteredBooks.length
            )}

            {" "}of{" "}

            {filteredBooks.length}

            {" "}books

          </span>

          <div className="Books__pagination">

            <button
              onClick={previousPage}
              disabled={
                safeCurrentPage === 1
              }
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from(
              {
                length: totalPages,
              },
              (_, index) =>
                index + 1
            ).map((page) => (

              <button
                key={page}
                className={
                  safeCurrentPage ===
                  page
                    ? "Books__pageActive"
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
              onClick={nextPage}
              disabled={
                safeCurrentPage ===
                totalPages
              }
            >
              <ChevronRight size={16} />
            </button>

          </div>

        </div>

      </section>

      {/* ADD / EDIT MODAL */}

      {(modalType === "add" ||
        modalType === "edit") && (

        <div
          className="Books__overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="Books__formModal">

            <div className="Books__modalHeader">

              <div>

                <span className="Books__modalEyebrow">
                  BOOK MANAGEMENT
                </span>

                <h2>
                  {modalType === "add"
                    ? "Add New Book"
                    : "Edit Book"}
                </h2>

                <p>
                  {modalType === "add"
                    ? "Add a new book to your bookstore."
                    : "Update the book information below."}
                </p>

              </div>

              <button
                className="Books__closeButton"
                onClick={closeModal}
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="Books__form"
              onSubmit={
                modalType === "add"
                  ? handleAddBook
                  : handleUpdateBook
              }
            >

              {/* IMAGE */}

              <div className="Books__formImageArea">

                <div className="Books__imagePreview">

                  {imagePreview ? (

                    <img
                      src={imagePreview}
                      alt="Book Preview"
                    />

                  ) : (

                    <>
                      <ImageIcon size={27} />
                      <span>
                        Book Cover
                      </span>
                    </>

                  )}

                </div>

                <div className="Books__uploadInfo">

                  <label className="Books__uploadButton">

                    <Upload size={15} />

                    {imagePreview
                      ? "Change Cover"
                      : "Upload Cover"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleImageChange
                      }
                    />

                  </label>

                  <span>
                    JPG, PNG, WEBP • Max 5MB
                  </span>

                  {errors.image && (
                    <small>
                      {errors.image}
                    </small>
                  )}

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
                    value={
                      formData.title
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter book title"
                  />

                  {errors.title && (
                    <small>
                      {errors.title}
                    </small>
                  )}

                </div>

                <div className="Books__field">

                  <label>
                    ISBN <b>*</b>
                  </label>

                  <input
                    name="isbn"
                    value={
                      formData.isbn
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="978XXXXXXXXXX"
                  />

                  {errors.isbn && (
                    <small>
                      {errors.isbn}
                    </small>
                  )}

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
                    value={
                      formData.author
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Author name"
                  />

                  {errors.author && (
                    <small>
                      {errors.author}
                    </small>
                  )}

                </div>

                <div className="Books__field">

                  <label>
                    Category
                  </label>

                  <div className="Books__inputSelect">

                    <select
                      name="category"
                      value={
                        formData.category
                      }
                      onChange={
                        handleInputChange
                      }
                    >

                      {categories.map(
                        (category) => (
                          <option
                            key={category}
                          >
                            {category}
                          </option>
                        )
                      )}

                    </select>

                    <ChevronDown size={15} />

                  </div>

                </div>

              </div>

              {/* PRICE + STOCK + STATUS */}

              <div className="Books__formGrid Books__formGrid--three">

                <div className="Books__field">

                  <label>
                    Price <b>*</b>
                  </label>

                  <div className="Books__inputIcon">

                    <IndianRupee size={15} />

                    <input
                      type="number"
                      min="0"
                      name="price"
                      value={
                        formData.price
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="1299"
                    />

                  </div>

                  {errors.price && (
                    <small>
                      {errors.price}
                    </small>
                  )}

                </div>

                <div className="Books__field">

                  <label>
                    Stock <b>*</b>
                  </label>

                  <div className="Books__inputIcon">

                    <Package size={15} />

                    <input
                      type="number"
                      min="0"
                      name="stock"
                      value={
                        formData.stock
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="20"
                    />

                  </div>

                  {errors.stock && (
                    <small>
                      {errors.stock}
                    </small>
                  )}

                </div>

                <div className="Books__field">

                  <label>
                    Status
                  </label>

                  <div className="Books__inputSelect">

                    <select
                      name="status"
                      value={
                        formData.status
                      }
                      onChange={
                        handleInputChange
                      }
                    >

                      <option>
                        Published
                      </option>

                      <option>
                        Draft
                      </option>

                    </select>

                    <ChevronDown size={15} />

                  </div>

                </div>

              </div>

              {/* PUBLISHER + PAGES + YEAR */}

              <div className="Books__formGrid Books__formGrid--three">

                <div className="Books__field">

                  <label>
                    Publisher
                  </label>

                  <input
                    name="publisher"
                    value={
                      formData.publisher
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Publisher"
                  />

                </div>

                <div className="Books__field">

                  <label>
                    Pages
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="pages"
                    value={
                      formData.pages
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="300"
                  />

                </div>

                <div className="Books__field">

                  <label>
                    Publish Year
                  </label>

                  <input
                    type="number"
                    name="year"
                    value={
                      formData.year
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="2026"
                  />

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="Books__field">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleInputChange
                  }
                  rows="3"
                  placeholder="Enter a short description about this book..."
                />

              </div>

              {/* FOOTER */}

              <div className="Books__formFooter">

                <button
                  type="button"
                  className="Books__cancelButton"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="Books__saveButton"
                >

                  <CheckCircle2 size={16} />

                  {modalType === "add"
                    ? "Add Book"
                    : "Save Changes"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* VIEW MODAL */}

      {modalType === "view" &&
        selectedBook && (

          <div
            className="Books__overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal();
              }
            }}
          >

            <div className="Books__viewModal">

              <div className="Books__viewHeader">

                <div>

                  <span className="Books__modalEyebrow">
                    BOOK DETAILS
                  </span>

                  <h2>
                    Book Details
                  </h2>

                  <p>
                    Complete information
                    about this book.
                  </p>

                </div>

                <button
                  className="Books__closeButton"
                  onClick={closeModal}
                >
                  <X size={19} />
                </button>

              </div>

              <div className="Books__viewBody">

                <div className="Books__viewCover">

                  <img
                    src={
                      selectedBook.image
                    }
                    alt={
                      selectedBook.title
                    }
                  />

                  <div className="Books__viewCoverBadge">

                    <BookOpen size={15} />

                    {selectedBook.stock >
                    0
                      ? `${selectedBook.stock} in stock`
                      : "Out of stock"}

                  </div>

                </div>

                <div className="Books__viewInfo">

                  <div className="Books__viewTitleRow">

                    <div>

                      <h3>
                        {
                          selectedBook.title
                        }
                      </h3>

                      <span>
                        ISBN:{" "}
                        {
                          selectedBook.isbn
                        }
                      </span>

                    </div>

                    <span
                      className={`Books__viewStatus ${
                        selectedBook.status ===
                        "Published"
                          ? "Books__viewStatus--green"
                          : selectedBook.status ===
                            "Out of Stock"
                          ? "Books__viewStatus--red"
                          : "Books__viewStatus--orange"
                      }`}
                    >

                      {selectedBook.status ===
                      "Published" ? (
                        <CircleCheck
                          size={14}
                        />
                      ) : (
                        <CircleX size={14} />
                      )}

                      {selectedBook.status}

                    </span>

                  </div>

                  <p className="Books__viewDescription">
                    {selectedBook.description}
                  </p>

                  <div className="Books__viewDetails">

                    <div className="Books__viewDetail">

                      <div className="Books__viewDetailIcon">
                        <User size={17} />
                      </div>

                      <div>
                        <span>Author</span>
                        <strong>
                          {
                            selectedBook.author
                          }
                        </strong>
                      </div>

                    </div>

                    <div className="Books__viewDetail">

                      <div className="Books__viewDetailIcon">
                        <Layers size={17} />
                      </div>

                      <div>
                        <span>Category</span>
                        <strong>
                          {
                            selectedBook.category
                          }
                        </strong>
                      </div>

                    </div>

                    <div className="Books__viewDetail">

                      <div className="Books__viewDetailIcon">
                        <IndianRupee
                          size={17}
                        />
                      </div>

                      <div>
                        <span>Price</span>
                        <strong>
                          {formatPrice(
                            selectedBook.price
                          )}
                        </strong>
                      </div>

                    </div>

                    <div className="Books__viewDetail">

                      <div className="Books__viewDetailIcon">
                        <Package size={17} />
                      </div>

                      <div>
                        <span>Stock</span>
                        <strong>
                          {
                            selectedBook.stock
                          }
                        </strong>
                      </div>

                    </div>

                    <div className="Books__viewDetail">

                      <div className="Books__viewDetailIcon">
                        <Hash size={17} />
                      </div>

                      <div>
                        <span>Pages</span>
                        <strong>
                          {
                            selectedBook.pages
                          }
                        </strong>
                      </div>

                    </div>

                    <div className="Books__viewDetail">

                      <div className="Books__viewDetailIcon">
                        <BookOpen size={17} />
                      </div>

                      <div>
                        <span>Published</span>
                        <strong>
                          {
                            selectedBook.year
                          }
                        </strong>
                      </div>

                    </div>

                  </div>

                  <div className="Books__viewNotice">

                    <Info size={17} />

                    <div>

                      <strong>
                        Book visibility
                      </strong>

                      <span>
                        {selectedBook.status ===
                        "Published"
                          ? "This book is currently published and visible in your store."
                          : selectedBook.status ===
                            "Draft"
                          ? "This book is saved as a draft and is not currently published."
                          : "This book is currently unavailable because there is no stock."}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              <div className="Books__viewFooter">

                <button
                  className="Books__cancelButton"
                  onClick={closeModal}
                >
                  Close
                </button>

                <button
                  className="Books__saveButton"
                  onClick={() =>
                    openEditModal(
                      selectedBook
                    )
                  }
                >

                  <Edit3 size={16} />

                  Edit Book

                </button>

              </div>

            </div>

          </div>
        )}

      {/* DELETE MODAL */}

      {modalType === "delete" &&
        selectedBook && (

          <div
            className="Books__overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal();
              }
            }}
          >

            <div className="Books__deleteModal">

              <div className="Books__deleteIcon">
                <AlertTriangle size={27} />
              </div>

              <h2>
                Delete Book?
              </h2>

              <p>
                You are about to permanently
                delete{" "}
                <strong>
                  {selectedBook.title}
                </strong>
                . This action cannot be undone.
              </p>

              <div className="Books__deleteActions">

                <button
                  className="Books__cancelButton"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  className="Books__deleteButton"
                  onClick={
                    handleDeleteBook
                  }
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