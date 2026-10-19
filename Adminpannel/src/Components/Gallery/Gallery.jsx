import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  FiImage,
  FiFolder,
  FiEye,
  FiTrash2,
  FiEdit3,
  FiSearch,
  FiUploadCloud,
  FiPlus,
  FiSave,
  FiX,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiGrid,
  FiLoader,
} from "react-icons/fi";
import API, { BASE_URL } from "../../api/axios";
import "./Gallery.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85";

const DEFAULT_CATEGORIES = [
  "Infrastructure",
  "Events",
  "Academics",
  "Sports",
  "Activities",
];

const ITEMS_PER_PAGE = 8;

const getImageUrl = (path) => {
  if (!path) return FALLBACK_IMAGE;
  if (
    path.startsWith("blob:") ||
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const Gallery = () => {
  const fileInputRef = useRef(null);
  const blobUrlsRef = useRef(new Set());

  // Main state
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [apiCategories, setApiCategories] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [apiStats, setApiStats] = useState({
    totalImages: 0,
    totalFolders: 0,
    totalViews: 0,
    unusedImages: 0,
  });

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [sortOrder, setSortOrder] = useState("Newest First");

  // Selection & Pagination
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Edit Form State
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editFile, setEditFile] = useState(null);

  // Blob URL helpers
  const createImageUrl = (file) => {
    const url = URL.createObjectURL(file);
    blobUrlsRef.current.add(url);
    return url;
  };

  const revokeImageUrl = (url) => {
    if (url && url.startsWith("blob:") && blobUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      blobUrlsRef.current.delete(url);
    }
  };

  const handleImageError = (event) => {
    if (event.currentTarget.src !== FALLBACK_IMAGE) {
      event.currentTarget.src = FALLBACK_IMAGE;
    }
  };

  const validateFile = (file) => {
    if (!file) return false;
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, JPEG, PNG and WEBP images are allowed.");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return false;
    }
    return true;
  };

  // =========================================================
  // FETCH GALLERIES FROM BACKEND API
  // =========================================================
  const fetchGalleries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/gallery?limit=500");
      if (res.data?.success) {
        const items = res.data.data || [];
        setGalleryItems(items);
        if (res.data.stats) {
          setApiStats(res.data.stats);
        }
        if (Array.isArray(res.data.categories)) {
          setApiCategories(res.data.categories);
        }
      }
    } catch (err) {
      console.error("Error fetching gallery images:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // FETCH CATEGORIES DYNAMICALLY FROM /categories API
  // =========================================================
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const res = await API.get("/categories");
      if (res.data?.success && Array.isArray(res.data.data)) {
        const names = res.data.data
          .map((c) => (typeof c === "string" ? c : c.name))
          .filter(Boolean);
        setDynamicCategories(names);
      }
    } catch (err) {
      console.error("Error fetching dynamic categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGalleries();
    fetchCategories();
  }, [fetchGalleries, fetchCategories]);

  // Combined categories: dynamic categories + API categories + current item categories
  const categories = useMemo(() => {
    const fromItems = galleryItems.map((item) => item.category).filter(Boolean);
    const combined = new Set([
      ...dynamicCategories,
      ...apiCategories,
      ...fromItems,
    ]);
    if (combined.size === 0) {
      return DEFAULT_CATEGORIES;
    }
    return Array.from(combined);
  }, [dynamicCategories, apiCategories, galleryItems]);

  // =========================================================
  // FILE SELECTION & UPLOAD
  // =========================================================
  const handleFileChange = (file) => {
    if (!validateFile(file)) return;
    if (previewUrl) revokeImageUrl(previewUrl);

    const newUrl = createImageUrl(file);
    setSelectedFile(file);
    setPreviewUrl(newUrl);
  };

  const handleInputFile = (event) => {
    const file = event.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // =========================================================
  // CREATE GALLERY IMAGE
  // =========================================================
  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter image title.");
      return;
    }
    if (!category) {
      alert("Please select a category.");
      return;
    }
    if (!selectedFile) {
      alert("Please upload an image.");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("image", selectedFile);

      const res = await API.post("/gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data?.data) {
        const created = res.data.data;
        setGalleryItems((prev) => [created, ...prev]);
        setTitle("");
        setCategory("");
        setSelectedFile(null);
        if (previewUrl) {
          revokeImageUrl(previewUrl);
          setPreviewUrl("");
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setCurrentPage(1);
        fetchGalleries();
        fetchCategories();
      }
    } catch (err) {
      console.error("Save gallery error:", err);
      alert(err.response?.data?.message || "Failed to save gallery image.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // FILTER & SORT
  // =========================================================
  const filteredItems = useMemo(() => {
    let result = [...galleryItems];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(search) ||
          item.category?.toLowerCase().includes(search)
      );
    }

    if (categoryFilter !== "All Categories") {
      result = result.filter((item) => item.category === categoryFilter);
    }

    if (sortOrder === "Newest First") {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortOrder === "Oldest First") {
      result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortOrder === "A - Z") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortOrder === "Z - A") {
      result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    }

    return result;
  }, [galleryItems, searchTerm, categoryFilter, sortOrder]);

  // =========================================================
  // PAGINATION
  // =========================================================
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, sortOrder]);

  // =========================================================
  // SELECTION
  // =========================================================
  const currentPageIds = currentItems.map((item) => item._id || item.id);
  const isAllSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedItems.includes(id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems((prev) =>
        prev.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      setSelectedItems((prev) => [
        ...new Set([...prev, ...currentPageIds]),
      ]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // =========================================================
  // VIEW
  // =========================================================
  const handleView = (item) => {
    setViewItem(item);
    // Optionally trigger view increment in the background
    const itemId = item._id || item.id;
    if (itemId) {
      API.post(`/gallery/${itemId}/view`).catch(() => {});
    }
  };

  // =========================================================
  // EDIT
  // =========================================================
  const handleEdit = (item) => {
    setEditItem(item);
    setEditTitle(item.title || "");
    setEditCategory(item.category || "");
    setEditImage(getImageUrl(item.image));
    setEditFile(null);
  };

  const handleEditFile = (event) => {
    const file = event.target.files?.[0];
    if (!validateFile(file)) return;
    const newUrl = createImageUrl(file);
    setEditFile(file);
    setEditImage(newUrl);
  };

  const handleUpdate = async () => {
    if (!editTitle.trim()) {
      alert("Please enter image title.");
      return;
    }
    if (!editCategory) {
      alert("Please select category.");
      return;
    }

    try {
      setUpdating(true);
      const itemId = editItem._id || editItem.id;
      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("category", editCategory);
      if (editFile) {
        formData.append("image", editFile);
      }

      const res = await API.put(`/gallery/${itemId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data?.data) {
        const updated = res.data.data;
        setGalleryItems((prev) =>
          prev.map((item) =>
            (item._id || item.id) === (updated._id || updated.id) ? updated : item
          )
        );
        if (editImage && editImage.startsWith("blob:")) {
          revokeImageUrl(editImage);
        }
        setEditItem(null);
        setEditFile(null);
        setEditImage("");
        fetchGalleries();
        fetchCategories();
      }
    } catch (err) {
      console.error("Update gallery error:", err);
      alert(err.response?.data?.message || "Failed to update gallery image.");
    } finally {
      setUpdating(false);
    }
  };

  // =========================================================
  // DELETE SINGLE
  // =========================================================
  const handleDelete = (item) => {
    setDeleteItem(item);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    const itemId = deleteItem._id || deleteItem.id;

    try {
      setDeleting(true);
      const res = await API.delete(`/gallery/${itemId}`);
      if (res.data?.success) {
        setGalleryItems((prev) =>
          prev.filter((item) => (item._id || item.id) !== itemId)
        );
        setSelectedItems((prev) => prev.filter((id) => id !== itemId));
        setDeleteItem(null);
        fetchGalleries();
        fetchCategories();
      }
    } catch (err) {
      console.error("Delete gallery error:", err);
      alert(err.response?.data?.message || "Failed to delete gallery image.");
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // BULK DELETE
  // =========================================================
  const confirmBulkDelete = async () => {
    if (!selectedItems.length) return;

    try {
      setDeleting(true);
      const res = await API.post("/gallery/bulk-delete", {
        ids: selectedItems,
      });

      if (res.data?.success) {
        setGalleryItems((prev) =>
          prev.filter((item) => !selectedItems.includes(item._id || item.id))
        );
        setSelectedItems([]);
        setBulkDeleteConfirm(false);
        fetchGalleries();
        fetchCategories();
      }
    } catch (err) {
      console.error("Bulk delete gallery error:", err);
      alert(err.response?.data?.message || "Failed to delete selected images.");
    } finally {
      setDeleting(false);
    }
  };

  // Dynamic statistics
  const totalImages = galleryItems.length;
  const totalFolders = new Set(galleryItems.map((item) => item.category).filter(Boolean)).size;
  const totalViews = galleryItems.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0);
  const unusedImages = 0;

  // ESC Key listener
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setViewItem(null);
        setEditItem(null);
        setDeleteItem(null);
        setBulkDeleteConfirm(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Clean Blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current.clear();
    };
  }, []);

  return (
    <div className="GalleryContainer">
      {/* STATS */}
      <div className="GalleryStats">
        <div className="GalleryStatCard">
          <div className="GalleryStatIcon GalleryStatBlue">
            <FiImage />
          </div>
          <div className="GalleryStatContent">
            <span>Total Images</span>
            <strong>{totalImages}</strong>
            <small className="GalleryGreenText">Active in database</small>
          </div>
        </div>

        <div className="GalleryStatCard">
          <div className="GalleryStatIcon GalleryStatBlue">
            <FiFolder />
          </div>
          <div className="GalleryStatContent">
            <span>Gallery Folders</span>
            <strong>{categories.length || totalFolders}</strong>
            <small className="GalleryGreenText">Categories defined</small>
          </div>
        </div>

        <div className="GalleryStatCard">
          <div className="GalleryStatIcon GalleryStatBlue">
            <FiEye />
          </div>
          <div className="GalleryStatContent">
            <span>Total Views</span>
            <strong>{totalViews.toLocaleString()}</strong>
            <small className="GalleryGreenText">All-time views</small>
          </div>
        </div>

        <div className="GalleryStatCard">
          <div className="GalleryStatIcon GalleryStatRed">
            <FiTrash2 />
          </div>
          <div className="GalleryStatContent">
            <span>Unused Images</span>
            <strong>{unusedImages}</strong>
            <small className="GalleryRedText">Optimized storage</small>
          </div>
        </div>
      </div>

      {/* ADD GALLERY FORM */}
      <div className="GalleryFormCard">
        <div className="GallerySectionHeader">
          <div className="GallerySectionTitle">
            <FiPlus />
            <h2>Add Gallery Image</h2>
          </div>
        </div>

        <div className="GalleryDivider" />

        <div className="GalleryFormGrid">
          {/* TITLE */}
          <div className="GalleryFormGroup">
            <label>
              Title <span>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter image title (e.g. School Library, Annual Day, etc.)"
              disabled={saving}
            />
          </div>

          {/* CATEGORY */}
          <div className="GalleryFormGroup">
            <label>
              Category <span>*</span>
            </label>
            <div className="GallerySelectWrapper">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={saving || categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? "Loading categories..." : "Select Category"}
                </option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <FiChevronDown />
            </div>
          </div>

          {/* UPLOAD */}
          <div className="GalleryFormGroup GalleryUploadGroup">
            <label>
              Upload Image <span>*</span>
            </label>
            <div
              className="GalleryUploadBox"
              onClick={() => !saving && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {previewUrl ? (
                <div className="GalleryUploadPreview">
                  <img
                    src={previewUrl}
                    alt="Selected preview"
                    onError={handleImageError}
                  />
                  <div className="GalleryUploadOverlay">
                    <FiUploadCloud />
                    <span>Change Image</span>
                  </div>
                </div>
              ) : (
                <>
                  <FiUploadCloud />
                  <strong>Click to upload or drag and drop</strong>
                  <span>Supports: JPG, PNG, JPEG, WEBP (Max 5MB)</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleInputFile}
              hidden
              disabled={saving}
            />
          </div>
        </div>

        <button
          type="button"
          className="GallerySaveButton"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <FiLoader className="GallerySpinner" />
              Saving...
            </>
          ) : (
            <>
              <FiSave />
              Save
            </>
          )}
        </button>
      </div>

      {/* GALLERY LIST */}
      <div className="GalleryListCard">
        <div className="GalleryListHeader">
          <div className="GalleryListTitle">
            <div className="GalleryListIcon">
              <FiGrid />
            </div>
            <div>
              <h2>Gallery List</h2>
              <span>{filteredItems.length} images</span>
            </div>
          </div>

          <div className="GalleryFilters">
            {/* BULK ACTION BUTTON */}
            {selectedItems.length > 0 && (
              <button
                type="button"
                className="GalleryBulkDeleteBtn"
                onClick={() => setBulkDeleteConfirm(true)}
              >
                <FiTrash2 />
                Delete Selected ({selectedItems.length})
              </button>
            )}

            <div className="GallerySearchBox">
              <FiSearch />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title..."
              />
            </div>

            <div className="GalleryFilterSelect">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option>All Categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <FiChevronDown />
            </div>

            <div className="GalleryFilterSelect">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option>Newest First</option>
                <option>Oldest First</option>
                <option>A - Z</option>
                <option>Z - A</option>
              </select>
              <FiChevronDown />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="GalleryTableWrapper">
          <table className="GalleryTable">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>#</th>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Uploaded On</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="GalleryEmptyState">
                    <div className="GalleryEmptyIcon">
                      <FiLoader className="GallerySpinner" />
                    </div>
                    <h3>Loading gallery images...</h3>
                    <p>Connecting to backend database.</p>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item, index) => {
                  const itemId = item._id || item.id;
                  const itemImgUrl = getImageUrl(item.image);
                  return (
                    <tr key={itemId}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(itemId)}
                          onChange={() => handleSelectItem(itemId)}
                        />
                      </td>

                      <td>{startIndex + index + 1}</td>

                      <td>
                        <div className="GalleryTableImage">
                          <img
                            src={itemImgUrl}
                            alt={item.title}
                            onError={handleImageError}
                          />
                        </div>
                      </td>

                      <td>
                        <strong className="GalleryTableTitle">
                          {item.title}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`GalleryCategoryBadge GalleryCategory${(
                            item.category || ""
                          ).replace(/\s/g, "")}`}
                        >
                          {item.category}
                        </span>
                      </td>

                      <td>
                        <div className="GalleryDate">
                          <strong>{item.uploadedOn || "Recently"}</strong>
                          <span>{item.time || ""}</span>
                        </div>
                      </td>

                      <td>
                        <span className="GallerySize">
                          {item.size || "1.5 MB"}
                        </span>
                      </td>

                      <td>
                        <div className="GalleryActions">
                          <button
                            type="button"
                            className="GalleryActionButton GalleryViewButton"
                            title="View"
                            onClick={() => handleView(item)}
                          >
                            <FiEye />
                          </button>

                          <button
                            type="button"
                            className="GalleryActionButton GalleryEditButton"
                            title="Edit"
                            onClick={() => handleEdit(item)}
                          >
                            <FiEdit3 />
                          </button>

                          <button
                            type="button"
                            className="GalleryActionButton GalleryDeleteButton"
                            title="Delete"
                            onClick={() => handleDelete(item)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="GalleryEmptyState">
                    <div className="GalleryEmptyIcon">
                      <FiImage />
                    </div>
                    <h3>No gallery images found</h3>
                    <p>Add your first gallery image using the form above.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="GalleryTableFooter">
          <span>
            Showing{" "}
            {filteredItems.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of{" "}
            {filteredItems.length} images
          </span>

          <div className="GalleryPagination">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              <FiChevronLeft />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  type="button"
                  key={page}
                  className={currentPage === page ? "GalleryPageActive" : ""}
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
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewItem && (
        <div
          className="GalleryModalOverlay"
          onClick={() => setViewItem(null)}
        >
          <div
            className="GalleryViewModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="GalleryModalHeader">
              <div>
                <span>GALLERY IMAGE</span>
                <h2>{viewItem.title}</h2>
              </div>
              <button
                type="button"
                className="GalleryCloseButton"
                onClick={() => setViewItem(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="GalleryViewImage">
              <img
                src={getImageUrl(viewItem.image)}
                alt={viewItem.title}
                onError={handleImageError}
              />
            </div>

            <div className="GalleryViewDetails">
              <div>
                <span>Title</span>
                <strong>{viewItem.title}</strong>
              </div>
              <div>
                <span>Category</span>
                <strong>{viewItem.category}</strong>
              </div>
              <div>
                <span>Uploaded On</span>
                <strong>{viewItem.uploadedOn || "Recently"}</strong>
              </div>
              <div>
                <span>Image Size</span>
                <strong>{viewItem.size || "N/A"}</strong>
              </div>
            </div>

            <div className="GalleryModalFooter">
              <button
                type="button"
                className="GalleryModalSecondary"
                onClick={() => setViewItem(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="GalleryModalPrimary"
                onClick={() => {
                  const itm = viewItem;
                  setViewItem(null);
                  handleEdit(itm);
                }}
              >
                <FiEdit3 />
                Edit Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <div
          className="GalleryModalOverlay"
          onClick={() => !updating && setEditItem(null)}
        >
          <div
            className="GalleryEditModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="GalleryModalHeader">
              <div>
                <span>EDIT GALLERY</span>
                <h2>Update Image</h2>
              </div>
              <button
                type="button"
                className="GalleryCloseButton"
                onClick={() => !updating && setEditItem(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="GalleryEditBody">
              <div className="GalleryEditPreview">
                <img
                  src={editImage || FALLBACK_IMAGE}
                  alt={editTitle}
                  onError={handleImageError}
                />
                <label className="GalleryChangeImageButton">
                  <FiUploadCloud />
                  Change Image
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleEditFile}
                    disabled={updating}
                  />
                </label>
              </div>

              <div className="GalleryEditFields">
                <div className="GalleryFormGroup">
                  <label>Image Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    disabled={updating}
                  />
                </div>

                <div className="GalleryFormGroup">
                  <label>Category</label>
                  <div className="GallerySelectWrapper">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      disabled={updating || categoriesLoading}
                    >
                      <option value="">Select Category</option>
                      {categories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown />
                  </div>
                </div>
              </div>
            </div>

            <div className="GalleryModalFooter">
              <button
                type="button"
                className="GalleryModalSecondary"
                onClick={() => setEditItem(null)}
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="GalleryModalPrimary"
                onClick={handleUpdate}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <FiLoader className="GallerySpinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE SINGLE MODAL */}
      {deleteItem && (
        <div
          className="GalleryModalOverlay"
          onClick={() => !deleting && setDeleteItem(null)}
        >
          <div
            className="GalleryDeleteModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="GalleryDeleteIcon">
              <FiAlertTriangle />
            </div>
            <h2>Delete Gallery Image?</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>"{deleteItem.title}"</strong>? This action cannot be
              undone.
            </p>
            <div className="GalleryDeleteActions">
              <button
                type="button"
                className="GalleryModalSecondary"
                onClick={() => setDeleteItem(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="GalleryConfirmDelete"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <FiLoader className="GallerySpinner" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 />
                    Delete Image
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE MODAL */}
      {bulkDeleteConfirm && (
        <div
          className="GalleryModalOverlay"
          onClick={() => !deleting && setBulkDeleteConfirm(false)}
        >
          <div
            className="GalleryDeleteModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="GalleryDeleteIcon">
              <FiAlertTriangle />
            </div>
            <h2>Delete Selected Images?</h2>
            <p>
              Are you sure you want to permanently delete{" "}
              <strong>{selectedItems.length}</strong> selected images? This
              action cannot be undone.
            </p>
            <div className="GalleryDeleteActions">
              <button
                type="button"
                className="GalleryModalSecondary"
                onClick={() => setBulkDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="GalleryConfirmDelete"
                onClick={confirmBulkDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <FiLoader className="GallerySpinner" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 />
                    Delete All Selected
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;