import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Search,
  Plus,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
  Clock3,
  Ban,
  MessageSquare,
  UserRound,
  BookOpen,
  CalendarDays,
  Mail,
  AlertTriangle,
  Send,
  CircleCheck,
  CircleX,
} from "lucide-react";

import API, { BASE_URL } from "../../api/axios";
import "./Reviews.css";

const getImageUrl = (imagePath) => {
  if (!imagePath)
    return "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=100&q=80";
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("blob:") ||
    imagePath.startsWith("data:")
  )
    return imagePath;
  return `${BASE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const Reviews = () => {
  /* ============================================================
     STATES
  ============================================================ */

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [ratingFilter, setRatingFilter] =
    useState("All Ratings");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [bookFilter, setBookFilter] =
    useState("All Books");

  const [sortFilter, setSortFilter] =
    useState("Sort By: Latest");

  const [selectedReviews, setSelectedReviews] =
    useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [modalType, setModalType] = useState(null);

  const [selectedReview, setSelectedReview] =
    useState(null);

  const [formData, setFormData] = useState({
    user: "",
    email: "",
    book: "",
    rating: 5,
    comment: "",
    status: "Pending",
  });

  const [formErrors, setFormErrors] = useState({});

  const ITEMS_PER_PAGE = 8;

  /* ============================================================
     FETCH REVIEWS FROM API
  ============================================================ */

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/reviews", { params: { limit: 100 } });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  /* ============================================================
     STATISTICS
  ============================================================ */

  const totalReviews = reviews.length;

  const approvedReviews = reviews.filter(
    (review) => review.status === "Approved"
  ).length;

  const pendingReviews = reviews.filter(
    (review) => review.status === "Pending"
  ).length;

  const rejectedReviews = reviews.filter(
    (review) => review.status === "Rejected"
  ).length;

  /* ============================================================
     BOOK LIST
  ============================================================ */

  const books = [
    "All Books",
    ...new Set(reviews.map((review) => review.book)),
  ];

  /* ============================================================
     FILTER
  ============================================================ */

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter(
        (review) =>
          review.user.toLowerCase().includes(search) ||
          review.email.toLowerCase().includes(search) ||
          review.book.toLowerCase().includes(search) ||
          review.comment.toLowerCase().includes(search)
      );
    }

    if (ratingFilter !== "All Ratings") {
      const selectedRating = Number(
        ratingFilter.charAt(0)
      );

      result = result.filter(
        (review) => review.rating === selectedRating
      );
    }

    if (statusFilter !== "All Status") {
      result = result.filter(
        (review) => review.status === statusFilter
      );
    }

    if (bookFilter !== "All Books") {
      result = result.filter(
        (review) => review.book === bookFilter
      );
    }

    if (sortFilter === "Sort By: A-Z") {
      result.sort((a, b) =>
        a.user.localeCompare(b.user)
      );
    }

    if (sortFilter === "Sort By: Rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sortFilter === "Sort By: Latest") {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [
    reviews,
    searchTerm,
    ratingFilter,
    statusFilter,
    bookFilter,
    sortFilter,
  ]);

  /* ============================================================
     PAGINATION
  ============================================================ */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredReviews.length / ITEMS_PER_PAGE
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) * ITEMS_PER_PAGE;

  const currentReviews = filteredReviews.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* ============================================================
     SELECT ALL
  ============================================================ */

  const currentReviewIds = currentReviews.map(
    (review) => review.id
  );

  const allCurrentSelected =
    currentReviewIds.length > 0 &&
    currentReviewIds.every((id) =>
      selectedReviews.includes(id)
    );

  const someCurrentSelected =
    currentReviewIds.some((id) =>
      selectedReviews.includes(id)
    ) && !allCurrentSelected;

  const handleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedReviews((previous) =>
        previous.filter(
          (id) => !currentReviewIds.includes(id)
        )
      );
    } else {
      setSelectedReviews((previous) => [
        ...new Set([
          ...previous,
          ...currentReviewIds,
        ]),
      ]);
    }
  };

  const handleSelectReview = (id) => {
    setSelectedReviews((previous) =>
      previous.includes(id)
        ? previous.filter(
            (reviewId) => reviewId !== id
          )
        : [...previous, id]
    );
  };

  /* ============================================================
     FORM
  ============================================================ */

  const resetForm = () => {
    setFormData({
      user: "",
      email: "",
      book: "",
      rating: 5,
      comment: "",
      status: "Pending",
    });

    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setSelectedReview(null);
    setModalType("add");
  };

  const openViewModal = (review) => {
    setSelectedReview(review);
    setModalType("view");
  };

  const openEditModal = (review) => {
    setSelectedReview(review);

    setFormData({
      user: review.user,
      email: review.email,
      book: review.book,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
    });

    setFormErrors({});
    setModalType("edit");
  };

  const openDeleteModal = (review) => {
    setSelectedReview(review);
    setModalType("delete");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedReview(null);
    resetForm();
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "rating" ? Number(value) : value,
    }));

    setFormErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.user.trim()) {
      errors.user = "User name is required.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    }

    if (!formData.book.trim()) {
      errors.book = "Book name is required.";
    }

    if (!formData.comment.trim()) {
      errors.comment = "Review comment is required.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* ============================================================
     ADD
  ============================================================ */

  const handleAddReview = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = {
      user: formData.user.trim(),
      email: formData.email.trim(),
      book: formData.book.trim(),
      rating: formData.rating,
      comment: formData.comment.trim(),
      status: formData.status,
    };

    try {
      setIsSaving(true);
      await API.post("/reviews", payload);
      await fetchReviews();
      setCurrentPage(1);
      closeModal();
    } catch (err) {
      console.error("Add review error:", err);
      alert(err.response?.data?.message || "Failed to add review");
    } finally {
      setIsSaving(false);
    }
  };

  /* ============================================================
     UPDATE
  ============================================================ */

  const handleUpdateReview = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;
    if (!selectedReview) return;

    const id = selectedReview.id || selectedReview._id;
    const payload = {
      user: formData.user.trim(),
      email: formData.email.trim(),
      book: formData.book.trim(),
      rating: formData.rating,
      comment: formData.comment.trim(),
      status: formData.status,
    };

    try {
      setIsSaving(true);
      await API.put(`/reviews/${id}`, payload);
      await fetchReviews();
      closeModal();
    } catch (err) {
      console.error("Update review error:", err);
      alert(err.response?.data?.message || "Failed to update review");
    } finally {
      setIsSaving(false);
    }
  };

  /* ============================================================
     DELETE
  ============================================================ */

  const handleDeleteReview = async () => {
    if (!selectedReview) return;

    const id = selectedReview.id || selectedReview._id;

    try {
      setIsSaving(true);
      await API.delete(`/reviews/${id}`);
      setSelectedReviews((previous) =>
        previous.filter((reviewId) => reviewId !== id)
      );
      await fetchReviews();
      closeModal();
    } catch (err) {
      console.error("Delete review error:", err);
      alert(err.response?.data?.message || "Failed to delete review");
    } finally {
      setIsSaving(false);
    }
  };

  /* ============================================================
     BULK DELETE
  ============================================================ */

  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedReviews.length} selected review(s)?`
      )
    )
      return;

    try {
      setIsSaving(true);
      await API.post("/reviews/bulk-delete", { ids: selectedReviews });
      setSelectedReviews([]);
      await fetchReviews();
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert(err.response?.data?.message || "Failed to delete selected reviews");
    } finally {
      setIsSaving(false);
    }
  };

  /* ============================================================
     STATUS
  ============================================================ */

  const handleStatusClick = async (review) => {
    const id = review.id || review._id;
    let nextStatus = "Approved";
    if (review.status === "Pending") {
      nextStatus = "Approved";
    } else if (review.status === "Approved") {
      nextStatus = "Rejected";
    } else {
      nextStatus = "Pending";
    }

    try {
      await API.patch(`/reviews/${id}/status`, { status: nextStatus });
      setReviews((previous) =>
        previous.map((item) =>
          item.id === id || item._id === id
            ? { ...item, status: nextStatus }
            : item
        )
      );

      if (
        selectedReview &&
        (selectedReview.id === id || selectedReview._id === id)
      ) {
        setSelectedReview({
          ...review,
          status: nextStatus,
        });
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert(err.response?.data?.message || "Failed to update review status");
    }
  };

  /* ============================================================
     EXPORT
  ============================================================ */

  const handleExport = () => {
    const headers = [
      "ID",
      "User",
      "Email",
      "Book",
      "Rating",
      "Comment",
      "Date",
      "Status",
    ];

    const rows = reviews.map((review) => [
      review.id,
      review.user,
      review.email,
      review.book,
      review.rating,
      review.comment,
      review.date,
      review.status,
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

    const link = document.createElement("a");

    link.href = url;
    link.download = "book-reviews.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRatingFilter("All Ratings");
    setStatusFilter("All Status");
    setBookFilter("All Books");
    setSortFilter("Sort By: Latest");
    setCurrentPage(1);
  };

  /* ============================================================
     STARS
  ============================================================ */

  const renderStars = (
    rating,
    interactive = false,
    onChange = null
  ) => {
    return (
      <div
        className={`Reviews__stars ${
          interactive
            ? "Reviews__stars--interactive"
            : ""
        }`}
      >
        {[1, 2, 3, 4, 5].map((starNumber) => (
          <button
            key={starNumber}
            type="button"
            disabled={!interactive}
            onClick={() =>
              interactive &&
              onChange(starNumber)
            }
            className={
              starNumber <= rating
                ? "Reviews__star Reviews__star--filled"
                : "Reviews__star"
            }
          >
            <Star
              size={interactive ? 24 : 16}
              fill={
                starNumber <= rating
                  ? "currentColor"
                  : "none"
              }
            />
          </button>
        ))}
      </div>
    );
  };

  /* ============================================================
     STATUS ICON
  ============================================================ */

  const renderStatusIcon = (status) => {
    if (status === "Approved") {
      return <Check size={14} />;
    }

    if (status === "Pending") {
      return <Clock3 size={14} />;
    }

    return <Ban size={14} />;
  };

  /* ============================================================
     JSX
  ============================================================ */

  return (
    <div className="Reviews">

      {/* HEADER */}
      <section className="Reviews__header">

        <div className="Reviews__heading">
          <h1 className="Reviews__title">
            Reviews
          </h1>

          <p className="Reviews__subtitle">
            Manage book reviews. Approve, edit or
            remove reviews from your store.
          </p>
        </div>

        <div className="Reviews__headerRight">

          <div className="Reviews__breadcrumb">
            <span>Dashboard</span>
            <span>›</span>
            <strong>Reviews</strong>
          </div>

          <button
            className="Reviews__addButton"
            onClick={openAddModal}
          >
            <Plus size={19} />
            Add Review
          </button>

        </div>

      </section>


      {/* STATISTICS */}
      <section className="Reviews__stats">

        <div className="Reviews__statCard Reviews__statCard--blue">

          <div className="Reviews__statIcon">
            <Star size={25} />
          </div>

          <div className="Reviews__statContent">
            <span>Total Reviews</span>
            <strong>{totalReviews}</strong>
          </div>

          <Star className="Reviews__statWatermark" />

        </div>


        <div className="Reviews__statCard Reviews__statCard--green">

          <div className="Reviews__statIcon">
            <Check size={25} />
          </div>

          <div className="Reviews__statContent">
            <span>Approved Reviews</span>
            <strong>{approvedReviews}</strong>
          </div>

          <Star className="Reviews__statWatermark" />

        </div>


        <div className="Reviews__statCard Reviews__statCard--orange">

          <div className="Reviews__statIcon">
            <Clock3 size={25} />
          </div>

          <div className="Reviews__statContent">
            <span>Pending Reviews</span>
            <strong>{pendingReviews}</strong>
          </div>

          <Star className="Reviews__statWatermark" />

        </div>


        <div className="Reviews__statCard Reviews__statCard--red">

          <div className="Reviews__statIcon">
            <Ban size={25} />
          </div>

          <div className="Reviews__statContent">
            <span>Rejected Reviews</span>
            <strong>{rejectedReviews}</strong>
          </div>

          <Star className="Reviews__statWatermark" />

        </div>

      </section>


      {/* TOOLBAR */}
      <section className="Reviews__toolbar">

        <div className="Reviews__filters">

          <div className="Reviews__search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search reviews by book title, user or comment..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />

            {searchTerm && (
              <button
                className="Reviews__clearSearch"
                onClick={() => setSearchTerm("")}
              >
                <X size={14} />
              </button>
            )}

          </div>


          <div className="Reviews__select">

            <select
              value={ratingFilter}
              onChange={(event) => {
                setRatingFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Ratings</option>
              <option>5 Stars</option>
              <option>4 Stars</option>
              <option>3 Stars</option>
              <option>2 Stars</option>
              <option>1 Star</option>
            </select>

            <ChevronDown size={16} />

          </div>


          <div className="Reviews__select">

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Status</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>

            <ChevronDown size={16} />

          </div>


          <div className="Reviews__select Reviews__select--book">

            <select
              value={bookFilter}
              onChange={(event) => {
                setBookFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              {books.map((book) => (
                <option key={book} value={book}>
                  {book}
                </option>
              ))}
            </select>

            <ChevronDown size={16} />

          </div>


          <div className="Reviews__select Reviews__select--sort">

            <select
              value={sortFilter}
              onChange={(event) => {
                setSortFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option>Sort By: Latest</option>
              <option>Sort By: A-Z</option>
              <option>Sort By: Rating</option>
            </select>

            <ChevronDown size={16} />

          </div>

        </div>


        <div className="Reviews__toolbarRight">

          {selectedReviews.length > 0 && (
            <>
              <div className="Reviews__selected">
                <Check size={15} />
                <span>
                  {selectedReviews.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedReviews([])}
                >
                  <X size={13} />
                </button>
              </div>

              <button
                type="button"
                className="Reviews__exportButton"
                style={{
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  borderColor: "#dc2626",
                  gap: "6px",
                }}
                onClick={handleBulkDelete}
              >
                <Trash2 size={15} />
                Delete Selected
              </button>
            </>
          )}

          <button
            className="Reviews__exportButton"
            onClick={handleExport}
          >
            <Download size={17} />
            Export Excel
          </button>

        </div>

      </section>


      {/* TABLE */}
      <section className="Reviews__tableCard">

        <div className="Reviews__tableWrapper">

          <table className="Reviews__table">

            <thead>
              <tr>

                <th>
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    ref={(element) => {
                      if (element) {
                        element.indeterminate =
                          someCurrentSelected;
                      }
                    }}
                    onChange={handleSelectAll}
                  />
                </th>

                <th>#</th>
                <th>User</th>
                <th>Book</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>

              </tr>
            </thead>


            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#64748b",
                    }}
                  >
                    Loading reviews...
                  </td>
                </tr>
              ) : currentReviews.length > 0 ? (
                currentReviews.map(
                  (review, index) => (

                    <tr
                      key={review.id}
                      className={
                        selectedReviews.includes(
                          review.id
                        )
                          ? "Reviews__rowSelected"
                          : ""
                      }
                    >

                      <td>
                        <input
                          type="checkbox"
                          checked={selectedReviews.includes(
                            review.id
                          )}
                          onChange={() =>
                            handleSelectReview(
                              review.id
                            )
                          }
                        />
                      </td>


                      <td>
                        <span className="Reviews__number">
                          {startIndex + index + 1}
                        </span>
                      </td>


                      <td>
                        <div className="Reviews__user">

                          <div className="Reviews__userImage">

                            <img
                              src={getImageUrl(review.userImage)}
                              alt={review.user}
                            />

                          </div>

                          <div className="Reviews__userInfo">

                            <strong>
                              {review.user}
                            </strong>

                            <span>
                              {review.email}
                            </span>

                          </div>

                        </div>
                      </td>


                      <td>
                        <div className="Reviews__book">

                          <div className="Reviews__bookImage">

                            <img
                              src={getImageUrl(review.bookImage)}
                              alt={review.book}
                              onError={(event) => {
                                event.currentTarget.src =
                                  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=100&q=80";
                              }}
                            />

                          </div>

                          <strong>
                            {review.book}
                          </strong>

                        </div>
                      </td>


                      <td>
                        {renderStars(review.rating)}
                      </td>


                      <td>
                        <div className="Reviews__comment">
                          {review.comment}
                        </div>
                      </td>


                      <td>
                        <span className="Reviews__date">
                          {review.date}
                        </span>
                      </td>


                      <td>

                        <button
                          className={`Reviews__status Reviews__status--${review.status.toLowerCase()}`}
                          onClick={() =>
                            handleStatusClick(review)
                          }
                        >
                          {renderStatusIcon(
                            review.status
                          )}

                          {review.status}
                        </button>

                      </td>


                      <td>

                        <div className="Reviews__actions">

                          <button
                            className="Reviews__action Reviews__action--view"
                            onClick={() =>
                              openViewModal(review)
                            }
                            title="View Review"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            className="Reviews__action Reviews__action--edit"
                            onClick={() =>
                              openEditModal(review)
                            }
                            title="Edit Review"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            className="Reviews__action Reviews__action--delete"
                            onClick={() =>
                              openDeleteModal(review)
                            }
                            title="Delete Review"
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="9"
                    className="Reviews__empty"
                  >

                    <div className="Reviews__emptyContent">

                      <div className="Reviews__emptyIcon">
                        <MessageSquare size={34} />
                      </div>

                      <h3>
                        No reviews found
                      </h3>

                      <p>
                        Try changing your search or
                        filters.
                      </p>

                      <button onClick={clearFilters}>
                        Clear Filters
                      </button>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}

        <div className="Reviews__tableFooter">

          <span className="Reviews__showing">

            Showing{" "}
            {filteredReviews.length === 0
              ? 0
              : startIndex + 1}
            {" "}to{" "}
            {Math.min(
              startIndex + ITEMS_PER_PAGE,
              filteredReviews.length
            )}
            {" "}of{" "}
            {filteredReviews.length} reviews

          </span>


          <div className="Reviews__pagination">

            <button
              disabled={safePage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1)
                )
              }
            >
              <ChevronLeft size={17} />
            </button>


            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            )
              .slice(0, 5)
              .map((page) => (
                <button
                  key={page}
                  className={
                    safePage === page
                      ? "Reviews__page--active"
                      : ""
                  }
                  onClick={() =>
                    setCurrentPage(page)
                  }
                >
                  {page}
                </button>
              ))}


            {totalPages > 5 && (
              <span className="Reviews__dots">
                ...
              </span>
            )}


            <button
              disabled={safePage === totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(
                    totalPages,
                    page + 1
                  )
                )
              }
            >
              <ChevronRight size={17} />
            </button>

          </div>

        </div>

      </section>


      {/* ============================================================
          ADD / EDIT MODAL
      ============================================================ */}

      {(modalType === "add" ||
        modalType === "edit") && (

        <div
          className="Reviews__overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="Reviews__formModal">

            <div className="Reviews__modalHeader">

              <div>

                <span className="Reviews__eyebrow">
                  REVIEW MANAGEMENT
                </span>

                <h2>
                  {modalType === "add"
                    ? "Add New Review"
                    : "Edit Review"}
                </h2>

                <p>
                  {modalType === "add"
                    ? "Create a new customer review."
                    : "Update review information."}
                </p>

              </div>

              <button
                className="Reviews__closeButton"
                onClick={closeModal}
              >
                <X size={20} />
              </button>

            </div>


            <form
              className="Reviews__form"
              onSubmit={
                modalType === "add"
                  ? handleAddReview
                  : handleUpdateReview
              }
            >

              <div className="Reviews__formGrid">

                <div className="Reviews__field">

                  <label>User Name *</label>

                  <div className="Reviews__inputWrapper">

                    <UserRound size={17} />

                    <input
                      name="user"
                      value={formData.user}
                      onChange={handleInputChange}
                      placeholder="Enter user name"
                    />

                  </div>

                  {formErrors.user && (
                    <small>
                      {formErrors.user}
                    </small>
                  )}

                </div>


                <div className="Reviews__field">

                  <label>Email *</label>

                  <div className="Reviews__inputWrapper">

                    <Mail size={17} />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="user@example.com"
                    />

                  </div>

                  {formErrors.email && (
                    <small>
                      {formErrors.email}
                    </small>
                  )}

                </div>

              </div>


              <div className="Reviews__formGrid">

                <div className="Reviews__field">

                  <label>Book *</label>

                  <div className="Reviews__inputWrapper">

                    <BookOpen size={17} />

                    <input
                      name="book"
                      value={formData.book}
                      onChange={handleInputChange}
                      placeholder="Enter book title"
                    />

                  </div>

                  {formErrors.book && (
                    <small>
                      {formErrors.book}
                    </small>
                  )}

                </div>


                <div className="Reviews__field">

                  <label>Status</label>

                  <div className="Reviews__selectWrapper">

                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option>Approved</option>
                      <option>Pending</option>
                      <option>Rejected</option>
                    </select>

                    <ChevronDown size={16} />

                  </div>

                </div>

              </div>


              <div className="Reviews__field Reviews__field--rating">

                <label>Rating</label>

                {renderStars(
                  formData.rating,
                  true,
                  (value) =>
                    setFormData((previous) => ({
                      ...previous,
                      rating: value,
                    }))
                )}

              </div>


              <div className="Reviews__field">

                <label>
                  Review Comment *
                </label>

                <div className="Reviews__textareaWrapper">

                  <MessageSquare size={17} />

                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    placeholder="Write review comment..."
                    rows="5"
                  />

                </div>

                {formErrors.comment && (
                  <small>
                    {formErrors.comment}
                  </small>
                )}

              </div>


              <div className="Reviews__formFooter">

                <button
                  type="button"
                  className="Reviews__cancelButton"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="Reviews__saveButton"
                >
                  <Send size={17} />

                  {modalType === "add"
                    ? "Add Review"
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* ============================================================
          VIEW MODAL
      ============================================================ */}

      {modalType === "view" &&
        selectedReview && (

        <div
          className="Reviews__overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="Reviews__viewModal">

            <div className="Reviews__modalHeader">

              <div>

                <span className="Reviews__eyebrow">
                  REVIEW DETAILS
                </span>

                <h2>
                  Review Details
                </h2>

                <p>
                  Complete information about this
                  customer review.
                </p>

              </div>

              <button
                className="Reviews__closeButton"
                onClick={closeModal}
              >
                <X size={20} />
              </button>

            </div>


            <div className="Reviews__viewBody">

              <div className="Reviews__profileCard">

                <div className="Reviews__profileImage">

                  <img
                    src={selectedReview.userImage}
                    alt={selectedReview.user}
                  />

                </div>

                <div className="Reviews__profileInfo">

                  <h3>
                    {selectedReview.user}
                  </h3>

                  <div className="Reviews__profileEmail">
                    <Mail size={15} />
                    {selectedReview.email}
                  </div>

                  <span
                    className={`Reviews__status Reviews__status--${selectedReview.status.toLowerCase()}`}
                  >
                    {renderStatusIcon(
                      selectedReview.status
                    )}

                    {selectedReview.status}
                  </span>

                </div>

                <div className="Reviews__profileRating">

                  <span>Rating</span>

                  {renderStars(
                    selectedReview.rating
                  )}

                  <strong>
                    {selectedReview.rating}.0 / 5
                  </strong>

                </div>

              </div>


              <div className="Reviews__viewBookCard">

                <div className="Reviews__viewBookImage">

                  <img
                    src={getImageUrl(selectedReview.bookImage)}
                    alt={selectedReview.book}
                  />

                </div>

                <div className="Reviews__viewBookInfo">

                  <span>
                    BOOK REVIEW
                  </span>

                  <h3>
                    {selectedReview.book}
                  </h3>

                  <div className="Reviews__viewDate">
                    <CalendarDays size={16} />
                    {selectedReview.date}
                  </div>

                </div>

              </div>


              <div className="Reviews__commentCard">

                <div className="Reviews__commentIcon">
                  <MessageSquare size={21} />
                </div>

                <div>

                  <span>
                    CUSTOMER COMMENT
                  </span>

                  <p>
                    "{selectedReview.comment}"
                  </p>

                </div>

              </div>


              <div className="Reviews__quickStatus">

                <span>
                  Update Status
                </span>

                <div className="Reviews__statusButtons">

                  <button
                    className={
                      selectedReview.status ===
                      "Approved"
                        ? "Reviews__quickStatusButton Reviews__quickStatusButton--activeGreen"
                        : "Reviews__quickStatusButton"
                    }
                    onClick={() =>
                      updateStatus(
                        selectedReview,
                        "Approved"
                      )
                    }
                  >
                    <CircleCheck size={16} />
                    Approve
                  </button>

                  <button
                    className={
                      selectedReview.status ===
                      "Pending"
                        ? "Reviews__quickStatusButton Reviews__quickStatusButton--activeOrange"
                        : "Reviews__quickStatusButton"
                    }
                    onClick={() =>
                      updateStatus(
                        selectedReview,
                        "Pending"
                      )
                    }
                  >
                    <Clock3 size={16} />
                    Pending
                  </button>

                  <button
                    className={
                      selectedReview.status ===
                      "Rejected"
                        ? "Reviews__quickStatusButton Reviews__quickStatusButton--activeRed"
                        : "Reviews__quickStatusButton"
                    }
                    onClick={() =>
                      updateStatus(
                        selectedReview,
                        "Rejected"
                      )
                    }
                  >
                    <CircleX size={16} />
                    Reject
                  </button>

                </div>

              </div>

            </div>


            <div className="Reviews__viewFooter">

              <button
                className="Reviews__cancelButton"
                onClick={closeModal}
              >
                Close
              </button>

              <button
                className="Reviews__saveButton"
                onClick={() =>
                  openEditModal(selectedReview)
                }
              >
                <Pencil size={17} />
                Edit Review
              </button>

            </div>

          </div>

        </div>
      )}


      {/* ============================================================
          DELETE MODAL
      ============================================================ */}

      {modalType === "delete" &&
        selectedReview && (

        <div
          className="Reviews__overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="Reviews__deleteModal">

            <div className="Reviews__deleteIcon">
              <AlertTriangle size={30} />
            </div>

            <h2>
              Delete Review?
            </h2>

            <p>
              Are you sure you want to permanently
              delete the review submitted by{" "}
              <strong>
                {selectedReview.user}
              </strong>
              ?
            </p>

            <div className="Reviews__deleteActions">

              <button
                className="Reviews__cancelButton"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                className="Reviews__deleteButton"
                onClick={handleDeleteReview}
              >
                <Trash2 size={17} />
                Delete Review
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Reviews;