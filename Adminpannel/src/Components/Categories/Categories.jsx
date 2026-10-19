import React, { useCallback, useEffect, useMemo, useState } from "react";
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

import API from "../../api/axios";
import "./Categories.css";

const Categories = () => {
  /* =========================================================
     STATES
  ========================================================= */
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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
     API: FETCH ALL CATEGORIES
  ========================================================= */
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/categories");
      if (res.data && res.data.success) {
        setCategories(
          (res.data.data || []).map((cat) => ({
            ...cat,
            id: cat._id || cat.id,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* =========================================================
     FILTER & PAGINATION
  ========================================================= */
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const search = searchTerm.toLowerCase().trim();
      return (
        category.name?.toLowerCase().includes(search) ||
        category.description?.toLowerCase().includes(search)
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (formMode === "add") {
        const colors = ["blue", "green", "purple", "orange", "yellow", "pink"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const res = await API.post("/categories", {
          name: formData.name.trim(),
          description: formData.description.trim(),
          color: randomColor,
        });

        if (res.data && res.data.success) {
          await fetchCategories();
          resetForm();
        }
      } else {
        const res = await API.put(`/categories/${editingId}`, {
          name: formData.name.trim(),
          description: formData.description.trim(),
        });

        if (res.data && res.data.success) {
          await fetchCategories();
          resetForm();
        }
      }
    } catch (err) {
      console.error("Category save error:", err);
      alert(err.response?.data?.message || "Failed to save category");
    }
  };

  const handleStartEdit = (category) => {
    setFormMode("edit");
    setEditingId(category.id);
    setFormData({
      name: category.name || "",
      description: category.description || "",
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

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    try {
      const res = await API.delete(`/categories/${selectedCategory.id}`);
      if (res.data && res.data.success) {
        if (editingId === selectedCategory.id) {
          resetForm();
        }
        await fetchCategories();
        setSelectedIds((prev) => prev.filter((id) => id !== selectedCategory.id));
        closeModal();
      }
    } catch (err) {
      console.error("Category delete error:", err);
      alert(err.response?.data?.message || "Failed to delete category");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected categories?`)) return;

    try {
      const res = await API.post("/categories/bulk-delete", { ids: selectedIds });
      if (res.data && res.data.success) {
        setSelectedIds([]);
        await fetchCategories();
      }
    } catch (err) {
      console.error("Bulk delete categories error:", err);
      alert(err.response?.data?.message || "Failed to delete selected categories");
    }
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
        row.map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`).join(",")
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

              <div className="Categories__field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide context or notes about this category..."
                  rows="4"
                />
              </div>

              <div className="Categories__formFooter">
                {formMode === "edit" ? (
                  <div className="Categories__buttonGroup">
                    <button
                      type="button"
                      className="Categories__cancelButton"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="Categories__submitButton">
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <button type="submit" className="Categories__submitButton">
                    <Plus size={16} />
                    Create Category
                  </button>
                )}
              </div>
            </form>
          </div>
        </aside>

        {/* =====================================================
            RIGHT SIDE: DATA TABLE (50%)
        ====================================================== */}
        <section className="Categories__panelRight">
          {/* TOOLBAR */}
          <div className="Categories__toolbar">
            <div className="Categories__toolbarLeft">
              <div className="Categories__searchBox">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Filter categories..."
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
                    title="Clear filter"
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
                  <button onClick={handleBulkDelete} title="Delete selected" style={{ marginLeft: "6px", background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}>
                    <Trash2 size={13} />
                  </button>
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
                  {loading ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: "40px" }}>
                        Loading categories...
                      </td>
                    </tr>
                  ) : currentCategories.length > 0 ? (
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
                                  isEditingThis ? "Categories__action--active" : ""
                                }`}
                                onClick={() => handleStartEdit(category)}
                                title="Edit Category"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                className="Categories__action Categories__action--delete"
                                onClick={() => openDeleteModal(category)}
                                title="Delete Category"
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
                      <td colSpan="4" className="Categories__emptyCell">
                        <div className="Categories__empty">
                          <BookOpen size={36} />
                          <h3>No Categories Found</h3>
                          <p>Try searching for a different term or create a new one on the left.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TABLE FOOTER / PAGINATION */}
            <div className="Categories__tableFooter">
              <span className="Categories__counts">
                Showing {filteredCategories.length === 0 ? 0 : startIndex + 1} to{" "}
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredCategories.length)} of{" "}
                {filteredCategories.length} categories
              </span>

              <div className="Categories__pagination">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  aria-label="Previous Page"
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
                  aria-label="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* VIEW MODAL */}
      {modalType === "view" && selectedCategory && (
        <div
          className="Categories__overlay"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="Categories__modal">
            <div className="Categories__modalHeader">
              <h3>Category Details</h3>
              <button onClick={closeModal} title="Close window">
                <X size={18} />
              </button>
            </div>
            <div className="Categories__modalBody">
              <div className="Categories__detailGroup">
                <label>Category Name</label>
                <div style={{ marginTop: "4px" }}>
                  <span
                    className={`Categories__badge Categories__badge--${
                      selectedCategory.color || "blue"
                    }`}
                  >
                    {selectedCategory.name}
                  </span>
                </div>
              </div>
              <div className="Categories__detailGroup">
                <label>Description</label>
                <p>{selectedCategory.description || "No description provided."}</p>
              </div>
            </div>
            <div className="Categories__modalFooter">
              <button className="Categories__primaryButton" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {modalType === "delete" && selectedCategory && (
        <div
          className="Categories__overlay"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="Categories__modal Categories__modal--warning">
            <div className="Categories__warningContent">
              <div className="Categories__warningIcon">
                <AlertTriangle size={24} />
              </div>
              <h3>Delete Category?</h3>
              <p>
                Are you sure you want to remove{" "}
                <strong>{selectedCategory.name}</strong>? This action cannot be undone.
              </p>
              <div className="Categories__modalActions">
                <button className="Categories__cancelButton" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  className="Categories__deleteButton"
                  onClick={handleDeleteCategory}
                >
                  Delete Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;