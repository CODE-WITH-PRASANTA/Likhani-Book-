import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit3,
  Trash2,
  X,
  FolderOpen,
  CheckCircle2,
  Ban,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  CircleCheck,
  CircleX,
  Info,
} from "lucide-react";

import "./Categories.css";

const Categories = () => {
  /* =========================================================
     INITIAL DATA
  ========================================================= */

  const initialCategories = [
    {
      id: 1,
      name: "Fiction",
      description: "Fictional stories and novels.",
      books: 42,
      active: true,
      color: "blue",
      image:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=85",
    },
    {
      id: 2,
      name: "Non-Fiction",
      description: "Real stories and educational books.",
      books: 28,
      active: true,
      color: "green",
      image:
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=85",
    },
    {
      id: 3,
      name: "Academic",
      description: "Study materials and academic books.",
      books: 20,
      active: true,
      color: "orange",
      image:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=85",
    },
    {
      id: 4,
      name: "Kids",
      description: "Children's books and storybooks.",
      books: 16,
      active: true,
      color: "pink",
      image:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=85",
    },
    {
      id: 5,
      name: "Self Help",
      description: "Self improvement and motivation books.",
      books: 10,
      active: true,
      color: "purple",
      image:
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=85",
    },
    {
      id: 6,
      name: "Comics",
      description: "Comics and graphic novels.",
      books: 8,
      active: true,
      color: "yellow",
      image:
        "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=600&q=85",
    },
    {
      id: 7,
      name: "Mystery",
      description: "Mystery and thriller books.",
      books: 8,
      active: false,
      color: "dark",
      image:
        "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=85",
    },
    {
      id: 8,
      name: "Others",
      description: "Other categories.",
      books: 8,
      active: true,
      color: "gray",
      image:
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=85",
    },
  ];

  /* =========================================================
     STATES
  ========================================================= */

  const [categories, setCategories] =
    useState(initialCategories);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIds, setSelectedIds] =
    useState([]);

  const [modalType, setModalType] = useState(null);

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    books: "",
    active: true,
    image: "",
  });

  const [errors, setErrors] = useState({});

  const ITEMS_PER_PAGE = 8;

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const search = searchTerm
        .toLowerCase()
        .trim();

      const matchesSearch =
        category.name
          .toLowerCase()
          .includes(search) ||
        category.description
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "All Status" ||
        (statusFilter === "Active" &&
          category.active) ||
        (statusFilter === "Inactive" &&
          !category.active);

      return matchesSearch && matchesStatus;
    });
  }, [
    categories,
    searchTerm,
    statusFilter,
  ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCategories.length /
        ITEMS_PER_PAGE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    ITEMS_PER_PAGE;

  const currentCategories =
    filteredCategories.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

  /* =========================================================
     SELECT ALL
  ========================================================= */

  const currentCategoryIds =
    currentCategories.map(
      (category) => category.id
    );

  const isAllSelected =
    currentCategoryIds.length > 0 &&
    currentCategoryIds.every((id) =>
      selectedIds.includes(id)
    );

  const isSomeSelected =
    currentCategoryIds.some((id) =>
      selectedIds.includes(id)
    ) && !isAllSelected;

  /* =========================================================
     SELECT ALL CURRENT PAGE
  ========================================================= */

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((previous) =>
        previous.filter(
          (id) =>
            !currentCategoryIds.includes(id)
        )
      );
    } else {
      setSelectedIds((previous) => [
        ...new Set([
          ...previous,
          ...currentCategoryIds,
        ]),
      ]);
    }
  };

  /* =========================================================
     SELECT SINGLE ROW
  ========================================================= */

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

  /* =========================================================
     CLEAR SELECTION
  ========================================================= */

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalCategories =
    categories.length;

  const activeCategories =
    categories.filter(
      (category) => category.active
    ).length;

  const inactiveCategories =
    categories.filter(
      (category) => !category.active
    ).length;

  const totalBooks =
    categories.reduce(
      (total, category) =>
        total + Number(category.books || 0),
      0
    );

  /* =========================================================
     FORM INPUT
  ========================================================= */

  const handleInputChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  /* =========================================================
     IMAGE
  ========================================================= */

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((previous) => ({
        ...previous,
        image:
          "Please select a valid image.",
      }));

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        image:
          "Image size must be less than 5MB.",
      }));

      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(
        reader.result
      );

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
      name: "",
      description: "",
      books: "",
      active: true,
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

    setSelectedCategory(null);

    setModalType("add");
  };

  /* =========================================================
     OPEN VIEW
  ========================================================= */

  const openViewModal = (category) => {
    setSelectedCategory(category);

    setModalType("view");
  };

  /* =========================================================
     OPEN EDIT
  ========================================================= */

  const openEditModal = (category) => {
    setSelectedCategory(category);

    setFormData({
      name: category.name,
      description:
        category.description,
      books: category.books,
      active: category.active,
      image: category.image,
    });

    setImagePreview(
      category.image || ""
    );

    setErrors({});

    setModalType("edit");
  };

  /* =========================================================
     OPEN DELETE
  ========================================================= */

  const openDeleteModal = (category) => {
    setSelectedCategory(category);

    setModalType("delete");
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    setModalType(null);

    setSelectedCategory(null);

    resetForm();
  };

  /* =========================================================
     VALIDATE FORM
  ========================================================= */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name =
        "Category name is required.";
    }

    if (!formData.description.trim()) {
      newErrors.description =
        "Description is required.";
    }

    if (
      formData.books === "" ||
      Number(formData.books) < 0
    ) {
      newErrors.books =
        "Enter a valid book count.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  /* =========================================================
     ADD CATEGORY
  ========================================================= */

  const handleAddCategory = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const newCategory = {
      id: Date.now(),

      name: formData.name.trim(),

      description:
        formData.description.trim(),

      books: Number(formData.books),

      active: formData.active,

      color: "blue",

      image:
        formData.image ||
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=85",
    };

    setCategories((previous) => [
      ...previous,
      newCategory,
    ]);

    closeModal();
  };

  /* =========================================================
     UPDATE CATEGORY
  ========================================================= */

  const handleUpdateCategory = (
    event
  ) => {
    event.preventDefault();

    if (!validateForm()) return;

    setCategories((previous) =>
      previous.map((category) =>
        category.id ===
        selectedCategory.id
          ? {
              ...category,

              name: formData.name.trim(),

              description:
                formData.description.trim(),

              books: Number(
                formData.books
              ),

              active:
                formData.active,

              image:
                formData.image ||
                category.image,
            }
          : category
      )
    );

    closeModal();
  };

  /* =========================================================
     DELETE CATEGORY
  ========================================================= */

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;

    setCategories((previous) =>
      previous.filter(
        (category) =>
          category.id !==
          selectedCategory.id
      )
    );

    setSelectedIds((previous) =>
      previous.filter(
        (id) =>
          id !== selectedCategory.id
      )
    );

    setCurrentPage(1);

    closeModal();
  };

  /* =========================================================
     STATUS TOGGLE
  ========================================================= */

  const toggleCategoryStatus = (id) => {
    setCategories((previous) =>
      previous.map((category) =>
        category.id === id
          ? {
              ...category,
              active:
                !category.active,
            }
          : category
      )
    );
  };

  /* =========================================================
     EXPORT
  ========================================================= */

  const handleExport = () => {
    const headers = [
      "ID",
      "Category Name",
      "Description",
      "Total Books",
      "Status",
    ];

    const rows =
      categories.map((category) => [
        category.id,
        category.name,
        category.description,
        category.books,
        category.active
          ? "Active"
          : "Inactive",
      ]);

    const csv = [
      headers,
      ...rows,
    ]
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

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "categories.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearchChange = (
    event
  ) => {
    setSearchTerm(
      event.target.value
    );

    setCurrentPage(1);
  };

  /* =========================================================
     STATUS FILTER
  ========================================================= */

  const handleStatusChange = (
    event
  ) => {
    setStatusFilter(
      event.target.value
    );

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
      Math.min(
        totalPages,
        page + 1
      )
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="Categories">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="Categories__header">
        <div className="Categories__headerLeft">
          <h1 className="Categories__title">
            Categories
          </h1>

          <p className="Categories__subtitle">
            Manage your book categories.
            Add, edit or remove categories.
          </p>
        </div>

        <div className="Categories__headerRight">
          <div className="Categories__breadcrumb">
            <span>Dashboard</span>

            <span>›</span>

            <strong>
              Categories
            </strong>
          </div>

          <button
            className="Categories__addButton"
            onClick={openAddModal}
          >
            <Plus size={18} />

            Add Category
          </button>
        </div>
      </section>

      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="Categories__stats">
        <div className="Categories__statCard Categories__statCard--blue">
          <div className="Categories__statIcon">
            <FolderOpen size={24} />
          </div>

          <div className="Categories__statInfo">
            <span>
              Total Categories
            </span>

            <strong>
              {totalCategories}
            </strong>
          </div>

          <BookOpen className="Categories__statBook" />
        </div>

        <div className="Categories__statCard Categories__statCard--green">
          <div className="Categories__statIcon">
            <CheckCircle2 size={24} />
          </div>

          <div className="Categories__statInfo">
            <span>
              Active Categories
            </span>

            <strong>
              {activeCategories}
            </strong>
          </div>

          <BookOpen className="Categories__statBook" />
        </div>

        <div className="Categories__statCard Categories__statCard--pink">
          <div className="Categories__statIcon">
            <Ban size={24} />
          </div>

          <div className="Categories__statInfo">
            <span>
              Inactive Categories
            </span>

            <strong>
              {inactiveCategories}
            </strong>
          </div>

          <BookOpen className="Categories__statBook" />
        </div>

        <div className="Categories__statCard Categories__statCard--purple">
          <div className="Categories__statIcon">
            <BookOpen size={24} />
          </div>

          <div className="Categories__statInfo">
            <span>
              Total Books
            </span>

            <strong>
              {totalBooks}
            </strong>
          </div>

          <BookOpen className="Categories__statBook" />
        </div>
      </section>

      {/* =====================================================
          TOOLBAR
      ====================================================== */}

      <section className="Categories__toolbar">
        <div className="Categories__toolbarLeft">
          <div className="Categories__search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={
                handleSearchChange
              }
            />

            {searchTerm && (
              <button
                className="Categories__searchClear"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="Categories__select">
            <select
              value={statusFilter}
              onChange={
                handleStatusChange
              }
            >
              <option>
                All Status
              </option>

              <option>
                Active
              </option>

              <option>
                Inactive
              </option>
            </select>

            <ChevronDown size={16} />
          </div>
        </div>

        <div className="Categories__toolbarRight">
          {selectedIds.length > 0 && (
            <div className="Categories__selectedCount">
              <CheckCircle2
                size={15}
              />

              <span>
                {selectedIds.length}{" "}
                selected
              </span>

              <button
                onClick={
                  handleClearSelection
                }
                title="Clear selection"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <button
            className="Categories__export"
            onClick={handleExport}
          >
            <Download size={17} />

            Export Excel
          </button>
        </div>
      </section>

      {/* =====================================================
          TABLE
      ====================================================== */}

      <section className="Categories__tableCard">
        <div className="Categories__tableScroll">
          <table className="Categories__table">
            <thead>
              <tr>
                {/* SELECT ALL */}
                <th className="Categories__checkCell">
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
                    aria-label="Select all categories"
                  />
                </th>

                <th>#</th>

                <th>Image</th>

                <th>
                  Category Name
                </th>

                <th>
                  Description
                </th>

                <th>
                  Total Books
                </th>

                <th>Status</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentCategories.length >
              0 ? (
                currentCategories.map(
                  (
                    category,
                    index
                  ) => (
                    <tr
                      key={
                        category.id
                      }
                      className={
                        selectedIds.includes(
                          category.id
                        )
                          ? "Categories__rowSelected"
                          : ""
                      }
                    >
                      {/* ROW CHECKBOX */}
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(
                            category.id
                          )}
                          onChange={() =>
                            handleSelectOne(
                              category.id
                            )
                          }
                          aria-label={`Select ${category.name}`}
                        />
                      </td>

                      <td>
                        <span className="Categories__number">
                          {startIndex +
                            index +
                            1}
                        </span>
                      </td>

                      <td>
                        <div className="Categories__tableImage">
                          <img
                            src={
                              category.image
                            }
                            alt={
                              category.name
                            }
                          />
                        </div>
                      </td>

                      <td>
                        <span
                          className={`Categories__badge Categories__badge--${category.color}`}
                        >
                          {
                            category.name
                          }
                        </span>
                      </td>

                      <td>
                        <span className="Categories__description">
                          {
                            category.description
                          }
                        </span>
                      </td>

                      <td>
                        <strong className="Categories__bookNumber">
                          {
                            category.books
                          }
                        </strong>
                      </td>

                      <td>
                        <button
                          className={`Categories__toggle ${
                            category.active
                              ? "Categories__toggle--active"
                              : "Categories__toggle--inactive"
                          }`}
                          onClick={() =>
                            toggleCategoryStatus(
                              category.id
                            )
                          }
                          aria-label={
                            category.active
                              ? "Set inactive"
                              : "Set active"
                          }
                        >
                          <span />
                        </button>
                      </td>

                      <td>
                        <div className="Categories__actions">
                          {/* VIEW */}
                          <button
                            className="Categories__action Categories__action--view"
                            onClick={() =>
                              openViewModal(
                                category
                              )
                            }
                            title="View"
                          >
                            <Eye
                              size={17}
                            />
                          </button>

                          {/* EDIT */}
                          <button
                            className="Categories__action Categories__action--edit"
                            onClick={() =>
                              openEditModal(
                                category
                              )
                            }
                            title="Edit"
                          >
                            <Edit3
                              size={17}
                            />
                          </button>

                          {/* DELETE */}
                          <button
                            className="Categories__action Categories__action--delete"
                            onClick={() =>
                              openDeleteModal(
                                category
                              )
                            }
                            title="Delete"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="Categories__empty"
                  >
                    <div className="Categories__emptyContent">
                      <FolderOpen
                        size={35}
                      />

                      <h3>
                        No categories
                        found
                      </h3>

                      <p>
                        Try changing
                        your search or
                        status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
            TABLE FOOTER
        ================================================== */}

        <div className="Categories__tableFooter">
          <span>
            Showing{" "}
            {filteredCategories.length ===
            0
              ? 0
              : startIndex + 1}{" "}
            to{" "}
            {Math.min(
              startIndex +
                ITEMS_PER_PAGE,
              filteredCategories.length
            )}{" "}
            of{" "}
            {
              filteredCategories.length
            }{" "}
            categories
          </span>

          <div className="Categories__pagination">
            <button
              onClick={
                previousPage
              }
              disabled={
                safeCurrentPage === 1
              }
            >
              <ChevronLeft
                size={17}
              />
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
                    ? "Categories__pageActive"
                    : ""
                }
                onClick={() =>
                  setCurrentPage(
                    page
                  )
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
              <ChevronRight
                size={17}
              />
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {(modalType === "add" ||
        modalType === "edit") && (
        <div
          className="Categories__overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="Categories__formModal">
            <div className="Categories__modalTop">
              <div>
                <span className="Categories__modalEyebrow">
                  CATEGORY MANAGEMENT
                </span>

                <h2>
                  {modalType ===
                  "add"
                    ? "Add New Category"
                    : "Edit Category"}
                </h2>

                <p>
                  {modalType ===
                  "add"
                    ? "Create a new category for your bookstore."
                    : "Update the category information below."}
                </p>
              </div>

              <button
                className="Categories__close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="Categories__form"
              onSubmit={
                modalType ===
                "add"
                  ? handleAddCategory
                  : handleUpdateCategory
              }
            >
              <div className="Categories__formImage">
                <div className="Categories__preview">
                  {imagePreview ? (
                    <img
                      src={
                        imagePreview
                      }
                      alt="Preview"
                    />
                  ) : (
                    <>
                      <ImageIcon
                        size={28}
                      />

                      <span>
                        Category
                        Image
                      </span>
                    </>
                  )}
                </div>

                <label className="Categories__upload">
                  <Upload
                    size={16}
                  />

                  {imagePreview
                    ? "Change Image"
                    : "Upload Image"}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageChange
                    }
                  />
                </label>

                <small>
                  JPG, PNG or WEBP •
                  Max 5MB
                </small>

                {errors.image && (
                  <em>
                    {errors.image}
                  </em>
                )}
              </div>

              <div className="Categories__field">
                <label>
                  Category Name{" "}
                  <b>*</b>
                </label>

                <input
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Example: Fiction"
                />

                {errors.name && (
                  <small>
                    {errors.name}
                  </small>
                )}
              </div>

              <div className="Categories__field">
                <label>
                  Description{" "}
                  <b>*</b>
                </label>

                <textarea
                  name="description"
                  rows="4"
                  value={
                    formData.description
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter category description..."
                />

                {errors.description && (
                  <small>
                    {
                      errors.description
                    }
                  </small>
                )}
              </div>

              <div className="Categories__twoFields">
                <div className="Categories__field">
                  <label>
                    Total Books{" "}
                    <b>*</b>
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="books"
                    value={
                      formData.books
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="0"
                  />

                  {errors.books && (
                    <small>
                      {errors.books}
                    </small>
                  )}
                </div>

                <div className="Categories__statusBox">
                  <div>
                    <strong>
                      Status
                    </strong>

                    <span>
                      {formData.active
                        ? "Category is visible"
                        : "Category is inactive"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`Categories__toggle ${
                      formData.active
                        ? "Categories__toggle--active"
                        : "Categories__toggle--inactive"
                    }`}
                    onClick={() =>
                      setFormData(
                        (
                          previous
                        ) => ({
                          ...previous,
                          active:
                            !previous.active,
                        })
                      )
                    }
                  >
                    <span />
                  </button>
                </div>
              </div>

              <div className="Categories__formFooter">
                <button
                  type="button"
                  className="Categories__cancel"
                  onClick={
                    closeModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="Categories__save"
                >
                  <CheckCircle2
                    size={17}
                  />

                  {modalType ===
                  "add"
                    ? "Create Category"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW MODAL
      ====================================================== */}

      {modalType ===
        "view" &&
        selectedCategory && (
          <div
            className="Categories__overlay Categories__overlay--view"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal();
              }
            }}
          >
            <div className="Categories__viewModal">
              <div className="Categories__viewHeader">
                <div>
                  <span className="Categories__viewEyebrow">
                    CATEGORY DETAILS
                  </span>

                  <h2>
                    Category Details
                  </h2>

                  <p>
                    Complete information
                    about this
                    category.
                  </p>
                </div>

                <button
                  className="Categories__close"
                  onClick={
                    closeModal
                  }
                >
                  <X size={20} />
                </button>
              </div>

              <div className="Categories__viewBody">
                <div className="Categories__viewImage">
                  <img
                    src={
                      selectedCategory.image
                    }
                    alt={
                      selectedCategory.name
                    }
                  />

                  <div className="Categories__viewImageOverlay">
                    <BookOpen
                      size={20}
                    />

                    <span>
                      {
                        selectedCategory.books
                      }{" "}
                      Books
                    </span>
                  </div>
                </div>

                <div className="Categories__viewInfo">
                  <div className="Categories__viewTitle">
                    <h3>
                      {
                        selectedCategory.name
                      }
                    </h3>

                    {selectedCategory.active ? (
                      <span className="Categories__activeBadge">
                        <CircleCheck
                          size={14}
                        />
                        Active
                      </span>
                    ) : (
                      <span className="Categories__inactiveBadge">
                        <CircleX
                          size={14}
                        />
                        Inactive
                      </span>
                    )}
                  </div>

                  <p className="Categories__viewDescription">
                    {
                      selectedCategory.description
                    }
                  </p>

                  <div className="Categories__viewCards">
                    <div className="Categories__viewCard">
                      <div className="Categories__viewCardIcon Categories__viewCardIcon--blue">
                        <BookOpen
                          size={19}
                        />
                      </div>

                      <div>
                        <span>
                          Total Books
                        </span>

                        <strong>
                          {
                            selectedCategory.books
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="Categories__viewCard">
                      <div className="Categories__viewCardIcon Categories__viewCardIcon--purple">
                        <FolderOpen
                          size={19}
                        />
                      </div>

                      <div>
                        <span>
                          Category ID
                        </span>

                        <strong>
                          #
                          {
                            selectedCategory.id
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="Categories__viewCard">
                      <div className="Categories__viewCardIcon Categories__viewCardIcon--green">
                        {selectedCategory.active ? (
                          <CheckCircle2
                            size={19}
                          />
                        ) : (
                          <Ban
                            size={19}
                          />
                        )}
                      </div>

                      <div>
                        <span>
                          Visibility
                        </span>

                        <strong>
                          {selectedCategory.active
                            ? "Visible"
                            : "Hidden"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="Categories__viewNotice">
                    <Info
                      size={17}
                    />

                    <div>
                      <strong>
                        Category visibility
                      </strong>

                      <span>
                        {selectedCategory.active
                          ? "This category is currently visible to customers."
                          : "This category is inactive and should not be displayed on the customer website."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="Categories__viewFooter">
                <button
                  className="Categories__cancel"
                  onClick={
                    closeModal
                  }
                >
                  Close
                </button>

                <button
                  className="Categories__save"
                  onClick={() =>
                    openEditModal(
                      selectedCategory
                    )
                  }
                >
                  <Edit3
                    size={17}
                  />

                  Edit Category
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          DELETE MODAL
      ====================================================== */}

      {modalType ===
        "delete" &&
        selectedCategory && (
          <div
            className="Categories__overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal();
              }
            }}
          >
            <div className="Categories__deleteModal">
              <div className="Categories__deleteIcon">
                <AlertTriangle
                  size={27}
                />
              </div>

              <h2>
                Delete Category?
              </h2>

              <p>
                You are about to
                permanently delete{" "}
                <strong>
                  {
                    selectedCategory.name
                  }
                </strong>
                . This action
                cannot be undone.
              </p>

              <div className="Categories__deleteFooter">
                <button
                  className="Categories__cancel"
                  onClick={
                    closeModal
                  }
                >
                  Cancel
                </button>

                <button
                  className="Categories__deleteButton"
                  onClick={
                    handleDeleteCategory
                  }
                >
                  <Trash2
                    size={17}
                  />

                  Delete Category
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Categories;