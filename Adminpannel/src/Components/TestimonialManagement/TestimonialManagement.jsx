import React, { useEffect, useMemo, useRef, useState } from "react";
import "./TestimonialManagement.css";

import {
  FaPlus,
  FaSearch,
  FaList,
  FaThLarge,
  FaEye,
  FaPencilAlt,
  FaTrashAlt,
  FaSave,
  FaUndo,
  FaStar,
  FaRegStar,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaTimes,
  FaFilter,
  FaEllipsisV,
  FaQuoteLeft,
  FaBuilding,
  FaToggleOn,
  FaToggleOff,
  FaCloudUploadAlt,
} from "react-icons/fa";

const BASE_URL = "http://localhost:5000";
const API_URL = `${BASE_URL}/api/testimonials`;

const availableColors = [
  "#1e293b",
  "#0284c7",
  "#f97316",
  "#6366f1",
  "#22c55e",
];

const ITEMS_PER_PAGE = 6;

const emptyForm = {
  clientName: "",
  designation: "",
  company: "",
  rating: 4,
  message: "",
  accentColor: "#f97316",
  status: "Active",
};

const getImageUrl = (path) => {
  if (!path) return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
  if (path.startsWith("blob:") || path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);

  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [editingId, setEditingId] = useState(null);
  const [viewingModalData, setViewingModalData] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const formRef = useRef(null);

  /* ----------------------------------------------------
      API: FETCH ALL TESTIMONIALS
  ---------------------------------------------------- */
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const result = await res.json();
      if (result.success) {
        setTestimonials(result.data);
      }
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  /* ----------------------------------------------------
      FILTER
  ---------------------------------------------------- */
  const filteredTestimonials = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return testimonials.filter((item) => {
      const matchesSearch =
        !search ||
        item.clientName?.toLowerCase().includes(search) ||
        item.designation?.toLowerCase().includes(search) ||
        item.company?.toLowerCase().includes(search) ||
        item.message?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [testimonials, searchTerm, statusFilter]);

  /* ----------------------------------------------------
      PAGINATION
  ---------------------------------------------------- */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTestimonials.length / ITEMS_PER_PAGE)
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTestimonials = filteredTestimonials.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  /* ----------------------------------------------------
      SELECTION
  ---------------------------------------------------- */
  const currentPageIds = currentTestimonials.map((item) => item._id);

  const isAllSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedIds.includes(id));

  const isSomeSelected =
    currentPageIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      setSelectedIds((prev) => [
        ...new Set([...prev, ...currentPageIds]),
      ]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  /* ----------------------------------------------------
      FORM & IMAGE UPLOAD
  ---------------------------------------------------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateImage = (file, maxSizeMB = 2) => {
    if (!file) return false;
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowed.includes(file.type)) {
      alert("Please upload JPG, PNG, WEBP, or SVG image.");
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Image size must be less than ${maxSizeMB}MB.`);
      return false;
    }
    return true;
  };

  const handleImageFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImage(file, 2)) {
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (field === "logo") {
      setLogoFile(file);
      setLogoPreview(previewUrl);
    } else if (field === "profileImage") {
      setProfileFile(file);
      setProfilePreview(previewUrl);
    }
  };

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setLogoFile(null);
    setProfileFile(null);
    setLogoPreview(null);
    setProfilePreview(null);
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      clientName: item.clientName || "",
      designation: item.designation || "",
      company: item.company || "",
      rating: item.rating || 4,
      message: item.message || "",
      accentColor: item.accentColor || "#f97316",
      status: item.status || "Active",
    });
    setLogoFile(null);
    setProfileFile(null);
    setLogoPreview(item.logo ? getImageUrl(item.logo) : null);
    setProfilePreview(item.profileImage ? getImageUrl(item.profileImage) : null);

    scrollToForm();
  };

  /* ----------------------------------------------------
      SUBMIT (CREATE OR UPDATE)
  ---------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clientName.trim() || !formData.designation.trim() || !formData.message.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    const formPayload = new FormData();
    Object.keys(formData).forEach((key) => {
      formPayload.append(key, formData[key]);
    });

    if (logoFile) formPayload.append("logo", logoFile);
    if (profileFile) formPayload.append("profileImage", profileFile);

    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formPayload,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save testimonial");
      }

      if (editingId) {
        setTestimonials((prev) =>
          prev.map((item) => (item._id === editingId ? data.data : item))
        );
      } else {
        setTestimonials((prev) => [data.data, ...prev]);
        setCurrentPage(1);
      }

      handleReset();
    } catch (err) {
      alert(err.message);
    }
  };

  /* ----------------------------------------------------
      STATUS TOGGLE
  ---------------------------------------------------- */
  const toggleStatus = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/status`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setTestimonials((prev) =>
          prev.map((item) => (item._id === id ? data.data : item))
        );
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  /* ----------------------------------------------------
      DELETE LOGIC
  ---------------------------------------------------- */
  const handleDelete = async (id) => {
    const item = testimonials.find((t) => t._id === id);
    if (!item) return;

    if (!window.confirm(`Delete testimonial from "${item.clientName}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTestimonials((prev) => prev.filter((t) => t._id !== id));
        setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
        if (editingId === id) handleReset();
      }
    } catch (err) {
      alert("Failed to delete testimonial");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected testimonials?`)) return;

    try {
      const res = await fetch(`${API_URL}/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        setTestimonials((prev) => prev.filter((t) => !selectedIds.includes(t._id)));
        setSelectedIds([]);
      }
    } catch (err) {
      alert("Failed to perform bulk delete");
    }
  };

  /* ----------------------------------------------------
      PAGINATION BUTTONS
  ---------------------------------------------------- */
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  /* ----------------------------------------------------
      STATS
  ---------------------------------------------------- */
  const activeCount = testimonials.filter((i) => i.status === "Active").length;
  const inactiveCount = testimonials.filter((i) => i.status === "Inactive").length;
  const averageRating =
    testimonials.length > 0
      ? (
          testimonials.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
          testimonials.length
        ).toFixed(1)
      : "0.0";

  const RatingStars = ({ rating, clickable = false, onChange }) => (
    <div className="TM-ratingStars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          className={`TM-starButton ${clickable ? "TM-starClickable" : ""}`}
          onClick={() => clickable && onChange?.(star)}
          aria-label={`Rate ${star} out of 5`}
        >
          {star <= rating ? (
            <FaStar className="TM-star TM-starActive" />
          ) : (
            <FaRegStar className="TM-star" />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="TestimonialManagement">
      {/* STATS */}
      <section className="TM-stats">
        <div className="TM-statCard">
          <div className="TM-statIcon TM-blue">
            <FaQuoteLeft />
          </div>
          <div>
            <span>Total Testimonials</span>
            <strong>{testimonials.length}</strong>
          </div>
        </div>

        <div className="TM-statCard">
          <div className="TM-statIcon TM-green">
            <FaCheck />
          </div>
          <div>
            <span>Active</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="TM-statCard">
          <div className="TM-statIcon TM-orange">
            <FaStar />
          </div>
          <div>
            <span>Average Rating</span>
            <strong>{averageRating}/5</strong>
          </div>
        </div>

        <div className="TM-statCard">
          <div className="TM-statIcon TM-purple">
            <FaTimes />
          </div>
          <div>
            <span>Inactive</span>
            <strong>{inactiveCount}</strong>
          </div>
        </div>
      </section>

      <div className="TM-container">
        {/* FORM */}
        <section ref={formRef} className="TM-card TM-formCard">
          <div className="TM-cardHeader">
            <div>
              <span className="TM-sectionEyebrow">TESTIMONIAL</span>
              <h3>{editingId ? "Edit Testimonial" : "Create Testimonial"}</h3>
            </div>
            {editingId && <span className="TM-editBadge">Editing</span>}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="TM-formGroup">
              <label>Client Name <span>*</span></label>
              <div className="TM-inputWrapper">
                <FaUser />
                <input
                  type="text"
                  name="clientName"
                  placeholder="Enter client name"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="TM-formGroup">
              <label>Designation <span>*</span></label>
              <input
                type="text"
                name="designation"
                placeholder="e.g. Marketing Coordinator"
                value={formData.designation}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="TM-formGroup">
              <label>Company</label>
              <div className="TM-inputWrapper">
                <FaBuilding />
                <input
                  type="text"
                  name="company"
                  placeholder="e.g. Envato, Amazon"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* COMPANY LOGO */}
            <div className="TM-formGroup">
              <label>Company Logo</label>
              <div className="TM-uploadBox">
                <input
                  type="file"
                  id="logoUpload"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => handleImageFileChange(e, "logo")}
                  hidden
                />
                <label htmlFor="logoUpload" className="TM-uploadLabel">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Company logo preview"
                      className="TM-uploadPreview"
                    />
                  ) : (
                    <div className="TM-uploadIcon">
                      <FaCloudUploadAlt />
                    </div>
                  )}
                  <div className="TM-uploadContent">
                    <strong>{logoPreview ? "Change Logo" : "Upload Logo"}</strong>
                    <span>PNG, JPG, WEBP or SVG • Max 2MB</span>
                  </div>
                </label>
              </div>
            </div>

            {/* PROFILE IMAGE */}
            <div className="TM-formGroup">
              <label>Profile Image</label>
              <div className="TM-uploadBox">
                <input
                  type="file"
                  id="profileUpload"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleImageFileChange(e, "profileImage")}
                  hidden
                />
                <label htmlFor="profileUpload" className="TM-uploadLabel">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="TM-uploadPreview TM-profilePreview"
                    />
                  ) : (
                    <div className="TM-uploadIcon">
                      <FaUser />
                    </div>
                  )}
                  <div className="TM-uploadContent">
                    <strong>{profilePreview ? "Change Photo" : "Upload Photo"}</strong>
                    <span>JPG, PNG or WEBP • Max 2MB</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="TM-formGroup">
              <label>Rating <span>*</span></label>
              <div className="TM-ratingPicker">
                <RatingStars
                  rating={formData.rating}
                  clickable
                  onChange={(rating) => setFormData((prev) => ({ ...prev, rating }))}
                />
                <span>{formData.rating} / 5</span>
              </div>
            </div>

            <div className="TM-formGroup">
              <label>Testimonial Message <span>*</span></label>
              <textarea
                rows="5"
                name="message"
                placeholder="Write customer testimonial..."
                value={formData.message}
                onChange={handleInputChange}
                maxLength={500}
                required
              />
              <div className="TM-characterCount">{formData.message.length}/500</div>
            </div>

            <div className="TM-formGroup">
              <label>Accent Color</label>
              <div className="TM-colorPicker">
                {availableColors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    aria-label={`Select ${color}`}
                    className={`TM-colorDot ${formData.accentColor === color ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData((prev) => ({ ...prev, accentColor: color }))}
                  >
                    {formData.accentColor === color && <FaCheck />}
                  </button>
                ))}
              </div>
            </div>

            <div className="TM-formGroup">
              <label>Status</label>
              <div className="TM-statusChoice">
                <button
                  type="button"
                  className={formData.status === "Active" ? "active" : ""}
                  onClick={() => setFormData((prev) => ({ ...prev, status: "Active" }))}
                >
                  <FaCheck /> Active
                </button>
                <button
                  type="button"
                  className={formData.status === "Inactive" ? "inactiveActive" : ""}
                  onClick={() => setFormData((prev) => ({ ...prev, status: "Inactive" }))}
                >
                  <FaTimes /> Inactive
                </button>
              </div>
            </div>

            <div className="TM-formActions">
              <button type="button" className="TM-resetBtn" onClick={handleReset}>
                <FaUndo /> Reset
              </button>
              <button type="submit" className="TM-saveBtn">
                <FaSave /> {editingId ? "Update Testimonial" : "Save Testimonial"}
              </button>
            </div>
          </form>
        </section>

        {/* LIST / GRID DISPLAY */}
        <section className="TM-card TM-listCard">
          <div className="TM-listTop">
            <div>
              <span className="TM-sectionEyebrow">CONTENT LIBRARY</span>
              <h3>
                All Testimonials <span>{filteredTestimonials.length}</span>
              </h3>
            </div>
            <div className="TM-viewToggle">
              <button
                type="button"
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
              >
                <FaList /> List
              </button>
              <button
                type="button"
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}
              >
                <FaThLarge /> Grid
              </button>
            </div>
          </div>

          <div className="TM-toolbar">
            <div className="TM-searchBox">
              <FaSearch />
              <input
                type="text"
                placeholder="Search by client, company or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm("")}>
                  <FaTimes />
                </button>
              )}
            </div>

            <button
              type="button"
              className={`TM-filterBtn ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <FaFilter /> Filter
            </button>

            {showFilters && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="TM-statusSelect"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="TM-bulkBar">
              <div>
                <div className="TM-selectedCheck">
                  <FaCheck />
                </div>
                <strong>{selectedIds.length} selected</strong>
              </div>
              <button type="button" onClick={handleBulkDelete}>
                <FaTrashAlt /> Delete Selected
              </button>
            </div>
          )}

          {viewMode === "list" ? (
            <div className="TM-tableWrapper">
              <table className="TM-table">
                <thead>
                  <tr>
                    <th className="TM-checkboxColumn">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isSomeSelected;
                        }}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>#</th>
                    <th>Client</th>
                    <th>Message</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTestimonials.map((item, index) => (
                    <tr
                      key={item._id}
                      className={selectedIds.includes(item._id) ? "selectedRow" : ""}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item._id)}
                          onChange={() => handleSelectOne(item._id)}
                        />
                      </td>
                      <td className="TM-index">{startIndex + index + 1}</td>
                      <td>
                        <div className="TM-clientCell">
                          <div className="TM-avatarWrapper">
                            <img
                              src={getImageUrl(item.profileImage)}
                              alt={item.clientName}
                              className="TM-avatar"
                            />
                            <span
                              className="TM-onlineDot"
                              style={{
                                background:
                                  item.status === "Active" ? "#22c55e" : "#94a3b8",
                              }}
                            />
                          </div>
                          <div>
                            <strong>{item.clientName}</strong>
                            <span>{item.designation}</span>
                            {item.company && <small>{item.company}</small>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="TM-messageCell">
                          <FaQuoteLeft />
                          <span>{item.message}</span>
                        </div>
                      </td>
                      <td>
                        <RatingStars rating={item.rating} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`TM-statusBadge ${item.status.toLowerCase()}`}
                          onClick={() => toggleStatus(item._id)}
                          title="Click to change status"
                        >
                          {item.status === "Active" ? <FaToggleOn /> : <FaToggleOff />}
                          {item.status}
                        </button>
                      </td>
                      <td>
                        <div className="TM-actionButtons">
                          <button
                            type="button"
                            className="view"
                            title="View"
                            onClick={() => setViewingModalData(item)}
                          >
                            <FaEye />
                          </button>
                          <button
                            type="button"
                            className="edit"
                            title="Edit"
                            onClick={() => handleEdit(item)}
                          >
                            <FaPencilAlt />
                          </button>
                          <button
                            type="button"
                            className="delete"
                            title="Delete"
                            onClick={() => handleDelete(item._id)}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {currentTestimonials.length === 0 && (
                    <tr>
                      <td colSpan="7" className="TM-emptyState">
                        <div>
                          <FaSearch />
                          <h4>No testimonials found</h4>
                          <p>Try another search or filter.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="TM-grid">
              {currentTestimonials.map((item) => (
                <article
                  key={item._id}
                  className="TM-gridCard"
                  style={{ "--accent": item.accentColor || "#3b82f6" }}
                >
                  <div className="TM-gridAccent" />
                  <div className="TM-gridTop">
                    <div className="TM-gridProfile">
                      <img
                        src={getImageUrl(item.profileImage)}
                        alt={item.clientName}
                      />
                      <div>
                        <h4>{item.clientName}</h4>
                        <span>{item.designation}</span>
                      </div>
                    </div>
                    <button type="button" className="TM-moreBtn">
                      <FaEllipsisV />
                    </button>
                  </div>

                  <div className="TM-gridRating">
                    <RatingStars rating={item.rating} />
                    <span>{item.rating}.0</span>
                  </div>

                  <div className="TM-quote">
                    <FaQuoteLeft />
                  </div>

                  <p className="TM-gridMessage">{item.message}</p>

                  {item.company && (
                    <div className="TM-company">
                      {item.logo ? (
                        <img src={getImageUrl(item.logo)} alt={item.company} />
                      ) : (
                        <FaBuilding />
                      )}
                      <span>{item.company}</span>
                    </div>
                  )}

                  <div className="TM-gridFooter">
                    <button
                      type="button"
                      className={`TM-statusBadge ${item.status.toLowerCase()}`}
                      onClick={() => toggleStatus(item._id)}
                    >
                      {item.status === "Active" ? <FaToggleOn /> : <FaToggleOff />}
                      {item.status}
                    </button>

                    <div className="TM-actionButtons">
                      <button
                        type="button"
                        className="view"
                        onClick={() => setViewingModalData(item)}
                      >
                        <FaEye />
                      </button>
                      <button
                        type="button"
                        className="edit"
                        onClick={() => handleEdit(item)}
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        type="button"
                        className="delete"
                        onClick={() => handleDelete(item._id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {currentTestimonials.length === 0 && (
                <div className="TM-gridEmpty">
                  <FaSearch />
                  <h4>No testimonials found</h4>
                  <p>Try changing your search or filter.</p>
                </div>
              )}
            </div>
          )}

          {/* PAGINATION */}
          <div className="TM-pagination">
            <div className="TM-paginationInfo">
              Showing{" "}
              <strong>
                {filteredTestimonials.length === 0 ? 0 : startIndex + 1}
              </strong>{" "}
              to{" "}
              <strong>
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredTestimonials.length)}
              </strong>{" "}
              of <strong>{filteredTestimonials.length}</strong> testimonials
            </div>

            <div className="TM-pageButtons">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                <FaChevronLeft />
              </button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span key={`dots-${index}`} className="TM-pageDots">
                    ...
                  </span>
                ) : (
                  <button
                    type="button"
                    key={page}
                    className={currentPage === page ? "active" : ""}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* VIEW MODAL */}
      {viewingModalData && (
        <div
          className="TM-modalBackdrop"
          onClick={() => setViewingModalData(null)}
        >
          <div className="TM-modal" onClick={(e) => e.stopPropagation()}>
            <div
              className="TM-modalAccent"
              style={{
                background: viewingModalData.accentColor || "#3b82f6",
              }}
            />
            <button
              type="button"
              className="TM-modalClose"
              onClick={() => setViewingModalData(null)}
            >
              <FaTimes />
            </button>

            <div className="TM-modalContent">
              <div className="TM-modalAvatarWrapper">
                <img
                  src={getImageUrl(viewingModalData.profileImage)}
                  alt={viewingModalData.clientName}
                  className="TM-modalAvatar"
                />
                <span
                  className={`TM-modalStatus ${viewingModalData.status.toLowerCase()}`}
                />
              </div>

              <h3>{viewingModalData.clientName}</h3>
              <p className="TM-modalRole">{viewingModalData.designation}</p>

              {viewingModalData.company && (
                <div className="TM-modalCompany">
                  <FaBuilding />
                  {viewingModalData.company}
                </div>
              )}

              <RatingStars rating={viewingModalData.rating} />

              <div className="TM-modalQuote">
                <FaQuoteLeft />
                <p>{viewingModalData.message}</p>
              </div>

              <div className="TM-modalBottom">
                <span
                  className={`TM-statusBadge ${viewingModalData.status.toLowerCase()}`}
                >
                  {viewingModalData.status}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    handleEdit(viewingModalData);
                    setViewingModalData(null);
                  }}
                >
                  <FaPencilAlt /> Edit Testimonial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialManagement;