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
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
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
      description: "Fictional stories, novels, and narrative literature.",
      color: "blue",
    },
    {
      id: 2,
      name: "Non-Fiction",
      description: "Real stories, biographies, and educational books.",
      color: "green",
    },
    {
      id: 3,
      name: "Academic",
      description: "Study materials, textbooks, and research journals.",
      color: "orange",
    },
    {
      id: 4,
      name: "Kids",
      description: "Children's books, illustrations, and bedtime stories.",
      color: "pink",
    },
    {
      id: 5,
      name: "Self Help",
      description: "Personal growth, habits, and motivational books.",
      color: "purple",
    },
    {
      id: 6,
      name: "Comics",
      description: "Graphic novels, comics, and illustrated works.",
      color: "yellow",
    },
    {
      id: 7,
      name: "Mystery",
      description: "Mystery, thriller, suspense, and detective stories.",
      color: "dark",
    },
    {
      id: 8,
      name: "Others",
      description: "Miscellaneous publications and uncategorized books.",
      color: "gray",
    },
  ];

  /* =========================================================
     STATES
  ========================================================= */
  const [categories, setCategories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals for View and Delete confirmation
  const [modalType, setModalType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form Mode: "add" | "edit"
  const [formMode, setFormMode] = useState("add");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const ITEMS_PER_PAGE = 7;

  /* =========================================================
     FILTER & PAGINATION
  ========================================================= */
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const search = searchTerm.toLowerCase().trim();
      return (
        category.name.toLowerCase().includes(search) ||
        category.description.toLowerCase().includes(search)
      );
    });
  }, [categories, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const currentCategories = filteredCategories.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  /* =========================================================
     SELECTION HANDLERS
  ========================================================= */
  const currentCategoryIds = currentCategories.map((c) => c.id);

  const isAllSelected =
    currentCategoryIds.length > 0 &&
    currentCategoryIds.every((id) => selectedIds.includes(id));

  const isSomeSelected =
    currentCategoryIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !currentCategoryIds.includes(id))
      );
    } else {
      setSelectedIds((prev) => [
        ...new Set([...prev, ...currentCategoryIds]),
      ]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  /* =========================================================
     FORM HANDLERS
  ========================================================= */
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const resetForm = () => {
    setFormMode("add");
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required.";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (formMode === "add") {
      const colors = ["blue", "green", "purple", "orange", "yellow", "pink"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newCategory = {
        id: Date.now(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: randomColor,
      };

      setCategories((prev) => [newCategory, ...prev]);
    } else {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: formData.name.trim(),
                description: formData.description.trim(),
              }
            : c
        )
      );
    }

    resetForm();
  };

  const handleStartEdit = (category) => {
    setFormMode("edit");
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* =========================================================
     MODAL CONTROLS
  ========================================================= */
  const openViewModal = (category) => {
    setSelectedCategory(category);
    setModalType("view");
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setModalType("delete");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;
    setCategories((prev) => prev.filter((c) => c.id !== selectedCategory.id));
    setSelectedIds((prev) => prev.filter((id) => id !== selectedCategory.id));

    if (editingId === selectedCategory.id) {
      resetForm();
    }

    setCurrentPage(1);
    closeModal();
  };

  /* =========================================================
     EXPORT CSV
  ========================================================= */
  const handleExport = () => {
    const headers = ["ID", "Category Name", "Description"];
    const rows = categories.map((cat) => [
      cat.id,
      cat.name,
      cat.description,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "categories.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="Categories">
   
      {/* 50 / 50 MAIN WORKSPACE */}
      <div className="Categories__workspace">
        {/* =====================================================
            LEFT SIDE: INLINE MANAGEMENT FORM (50%)
        ====================================================== */}
        <aside className="Categories__panelLeft">
          <div className="Categories__formCard">
            <div className="Categories__formCardHeader">
              <div className="Categories__formCardHeaderTitle">
                <span className="Categories__formEyebrow">
                  {formMode === "edit" ? "RECORD REVISION" : "TAXONOMY GENERATION"}
                </span>
                <h2>{formMode === "edit" ? "Edit Category" : "Add New Category"}</h2>
                <p>
                  {formMode === "edit"
                    ? "Modify category details and save your updates."
                    : "Fill in the fields below to create a new category."}
                </p>
              </div>

              {formMode === "edit" && (
                <button
                  type="button"
                  className="Categories__resetButton"
                  onClick={resetForm}
                  title="Cancel edit & return to add mode"
                >
                  <RotateCcw size={14} />
                  New Category
                </button>
              )}
            </div>

            <form className="Categories__form" onSubmit={handleFormSubmit}>
              <div className="Categories__field">
                <label>
                  Category Name <b>*</b>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Science Fiction, Biography"
                />
                {errors.name && <small>{errors.name}</small>}
              </div>

              <div className="Categories__formFooter">
                {formMode === "edit" ? (
                  <>
                    <button
                      type="button"
                      className="Categories__cancel"
                      onClick={resetForm}
                    >
                      Cancel Edit
                    </button>
                    <button type="submit" className="Categories__save">
                      <CheckCircle2 size={16} />
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button type="submit" className="Categories__save Categories__save--block">
                    <Plus size={16} />
                    Create Category
                  </button>
                )}
              </div>
            </form>
          </div>
        </aside>

        {/* =====================================================
            RIGHT SIDE: TABLE & CONTROLS (50%)
        ====================================================== */}
        <main className="Categories__panelRight">
          {/* TOOLBAR */}
          <div className="Categories__toolbar">
            <div className="Categories__toolbarLeft">
              <div className="Categories__search">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {searchTerm && (
                  <button
                    className="Categories__searchClear"
                    onClick={() => setSearchTerm("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="Categories__toolbarRight">
              {selectedIds.length > 0 && (
                <div className="Categories__selectedCount">
                  <CheckCircle2 size={14} />
                  <span>{selectedIds.length}</span>
                  <button onClick={handleClearSelection} title="Clear selection">
                    <X size={12} />
                  </button>
                </div>
              )}

              <button className="Categories__export" onClick={handleExport} title="Export CSV">
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="Categories__tableCard">
            <div className="Categories__tableScroll">
              <table className="Categories__table">
                <thead>
                  <tr>
                    <th className="Categories__checkCell">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isSomeSelected;
                        }}
                        onChange={handleSelectAll}
                        aria-label="Select all current categories"
                      />
                    </th>
                    <th style={{ width: "60px" }}>#</th>
                    <th>Category Name</th>
                    <th style={{ width: "130px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentCategories.length > 0 ? (
                    currentCategories.map((category, index) => {
                      const isEditingThis = editingId === category.id;
                      const isSelected = selectedIds.includes(category.id);

                      return (
                        <tr
                          key={category.id}
                          className={`
                            ${isSelected ? "Categories__rowSelected" : ""}
                            ${isEditingThis ? "Categories__rowEditing" : ""}
                          `}
                        >
                          {/* CHECKBOX */}
                          <td className="Categories__checkCell">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(category.id)}
                              aria-label={`Select ${category.name}`}
                            />
                          </td>

                          {/* ROW NUMBER */}
                          <td>
                            <span className="Categories__number">
                              {startIndex + index + 1}
                            </span>
                          </td>

                          {/* BADGE */}
                          <td>
                            <div className="Categories__categoryCell">
                              <span
                                className={`Categories__badge Categories__badge--${
                                  category.color || "blue"
                                }`}
                              >
                                {category.name}
                              </span>
                            </div>
                          </td>

                          {/* ACTIONS */}
                          <td>
                            <div className="Categories__actions">
                              <button
                                className="Categories__action Categories__action--view"
                                onClick={() => openViewModal(category)}
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className={`Categories__action Categories__action--edit ${
                                  isEditingThis ? "Categories__action--activeEdit" : ""
                                }`}
                                onClick={() => handleStartEdit(category)}
                                title="Edit inline"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                className="Categories__action Categories__action--delete"
                                onClick={() => openDeleteModal(category)}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="Categories__empty">
                        <div className="Categories__emptyContent">
                          <FolderOpen size={32} />
                          <h3>No categories match</h3>
                          <p>Try modifying your search query.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER & PAGINATION */}
            <div className="Categories__tableFooter">
              <span>
                Showing {filteredCategories.length === 0 ? 0 : startIndex + 1} to{" "}
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredCategories.length)} of{" "}
                {filteredCategories.length} entries
              </span>

              <div className="Categories__pagination">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={safeCurrentPage === page ? "Categories__pageActive" : ""}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* VIEW MODAL */}
      {modalType === "view" && selectedCategory && (
        <div
          className="Categories__overlay"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="Categories__viewModal">
            <div className="Categories__viewHeader">
              <div>
                <span className="Categories__viewEyebrow">CATEGORY PREVIEW</span>
                <h2>Category Details</h2>
                <p>Detailed registry metadata for this record.</p>
              </div>

              <button className="Categories__close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="Categories__viewBody">
              <div className="Categories__viewTopCard">
                <div className="Categories__viewTitle">
                  <span
                    className={`Categories__badge Categories__badge--${
                      selectedCategory.color || "blue"
                    }`}
                  >
                    {selectedCategory.name}
                  </span>
                  <span className="Categories__viewIdTag">
                    #{selectedCategory.id}
                  </span>
                </div>

                <p className="Categories__viewDescription">
                  {selectedCategory.description}
                </p>
              </div>
            </div>

            <div className="Categories__viewFooter">
              <button className="Categories__cancel" onClick={closeModal}>
                Dismiss
              </button>
              <button
                className="Categories__save"
                onClick={() => {
                  closeModal();
                  handleStartEdit(selectedCategory);
                }}
              >
                <Edit3 size={16} />
                Load In Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modalType === "delete" && selectedCategory && (
        <div
          className="Categories__overlay"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="Categories__deleteModal">
            <div className="Categories__deleteIcon">
              <AlertTriangle size={26} />
            </div>

            <h2>Delete Category?</h2>
            <p>
              Are you sure you want to remove <strong>{selectedCategory.name}</strong>? This action cannot be reversed.
            </p>

            <div className="Categories__deleteFooter">
              <button className="Categories__cancel" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="Categories__deleteButton"
                onClick={handleDeleteCategory}
              >
                <Trash2 size={16} />
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;