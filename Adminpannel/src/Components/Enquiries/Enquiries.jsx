import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Swal from "sweetalert2";

import {
  FiMessageSquare,
  FiMail,
  FiClock,
  FiCheckCircle,
  FiDownload,
  FiSearch,
  FiCalendar,
  FiFilter,
  FiEye,
  FiEdit,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiRefreshCw,
  FiGlobe,
} from "react-icons/fi";

import API from "../../api/axios";

import "./Enquiries.css";

const ITEMS_PER_PAGE = 8;

const TYPES = [
  "Blog Comment",
  "General Enquiry",
  "Book Information",
  "Order Related",
  "Price Query",
  "Product Suggestion",
  "Shipping",
  "Return & Refund",
  "Payment Issue",
  "Other",
];

const STATUSES = [
  "New",
  "In Progress",
  "Closed",
];

const Enquiries = () => {
  // =====================================================
  // DATA
  // =====================================================

  const [enquiries, setEnquiries] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [selectedIds, setSelectedIds] =
    useState([]);

  // =====================================================
  // FILTERS
  // =====================================================

  const [searchQuery, setSearchQuery] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [dateRangeFilter, setDateRangeFilter] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: ITEMS_PER_PAGE,
      total: 0,
      totalPages: 1,
    });

  const [serverStats, setServerStats] =
    useState({
      total: 0,
      newCount: 0,
      inProgressCount: 0,
      closedCount: 0,
    });

  // =====================================================
  // MODALS
  // =====================================================

  const [viewModalData, setViewModalData] = useState(null);

  const [editModalData, setEditModalData] = useState(null);

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    status: "New",
  });

  const [actionLoading, setActionLoading] = useState(false);

  // =====================================================
  // FETCH
  // =====================================================

  const fetchEnquiries = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const response =
          await API.get("/enquiries", {
            params: {
              search: searchQuery,
              type: typeFilter,
              status: statusFilter,
              date: dateRangeFilter,
              page: currentPage,
              limit: ITEMS_PER_PAGE,
            },
          });

        const result = response.data;

        setEnquiries(
          Array.isArray(result?.data)
            ? result.data
            : []
        );

        setPagination(
          result?.pagination || {
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            total: 0,
            totalPages: 1,
          }
        );

        if (result?.stats) {
          setServerStats(result.stats);
        }

        // Keep current page valid
        if (
          result?.pagination?.totalPages &&
          currentPage >
            result.pagination.totalPages
        ) {
          setCurrentPage(
            result.pagination.totalPages
          );
        }
      } catch (error) {
        console.error(
          "FETCH ENQUIRIES ERROR:",
          error
        );

        Swal.fire({
          icon: "error",
          title: "Unable to load enquiries",
          text:
            error?.response?.data?.message ||
            "Please check your backend server.",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      searchQuery,
      typeFilter,
      statusFilter,
      dateRangeFilter,
      currentPage,
    ]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEnquiries();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchEnquiries]);

  // =====================================================
  // STATS
  // =====================================================

  const stats = useMemo(() => {
    return serverStats;
  }, [serverStats]);

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "";

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // SELECT ALL
  // =====================================================

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(
        enquiries.map(
          (item) => item._id
        )
      );
    } else {
      setSelectedIds([]);
    }
  };

  // =====================================================
  // SELECT ROW
  // =====================================================

  const handleSelectRow = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter(
            (item) => item !== id
          )
        : [...previous, id]
    );
  };

  // =====================================================
  // DELETE SINGLE
  // =====================================================

  const handleDelete = async (id) => {
    const result =
      await Swal.fire({
        icon: "warning",
        title: "Delete enquiry?",
        text: "This enquiry will be permanently deleted.",
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#ef4444",
      });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(true);

      await API.delete(
        `/enquiries/${id}`
      );

      setSelectedIds((previous) =>
        previous.filter(
          (item) => item !== id
        )
      );

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Enquiry deleted successfully.",
        timer: 1300,
        showConfirmButton: false,
      });

      await fetchEnquiries(false);
    } catch (error) {
      console.error(
        "DELETE ENQUIRY ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text:
          error?.response?.data?.message ||
          "Unable to delete enquiry.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // BULK DELETE
  // =====================================================

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    const result =
      await Swal.fire({
        icon: "warning",
        title: `Delete ${selectedIds.length} enquiries?`,
        text: "This action cannot be undone.",
        showCancelButton: true,
        confirmButtonText: "Delete All",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#ef4444",
      });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(true);

      await API.delete(
        "/enquiries/bulk",
        {
          data: {
            ids: selectedIds,
          },
        }
      );

      setSelectedIds([]);

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Selected enquiries deleted successfully.",
        timer: 1300,
        showConfirmButton: false,
      });

      await fetchEnquiries(false);
    } catch (error) {
      console.error(
        "BULK DELETE ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text:
          error?.response?.data?.message ||
          "Unable to delete selected enquiries.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // TOGGLE PUBLISH / UNPUBLISH BLOG COMMENT
  // =====================================================

  const handleTogglePublishComment = async (item) => {
    if (!item?._id) return;

    const isCurrentlyPublished = item.status === "Closed";
    const nextStatus = isCurrentlyPublished ? "New" : "Closed";

    // Optimistically update UI so the toggle switches instantly
    setEnquiries((prev) =>
      prev.map((e) =>
        e._id === item._id ? { ...e, status: nextStatus } : e
      )
    );

    try {
      setActionLoading(true);
      const endpoint = isCurrentlyPublished
        ? `/enquiries/${item._id}/unpublish-comment`
        : `/enquiries/${item._id}/publish-comment`;

      await API.patch(endpoint);

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1400,
        timerProgressBar: false,
      });

      Toast.fire({
        icon: "success",
        title: isCurrentlyPublished
          ? "Comment moved to Draft"
          : "Comment Published Live!",
      });

      await fetchEnquiries(false);
    } catch (error) {
      console.error("TOGGLE PUBLISH ERROR:", error);

      // Revert optimistic update on failure
      setEnquiries((prev) =>
        prev.map((e) =>
          e._id === item._id ? { ...e, status: item.status } : e
        )
      );

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });

      Toast.fire({
        icon: "error",
        title:
          error?.response?.data?.message ||
          "Unable to update comment publishing status.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // VIEW
  // =====================================================

  const handleView = (item) => {
    setViewModalData(item);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const handleOpenEdit = (item) => {
    setEditModalData(item);
    setEditFormData({
      name: item.name || "",
      email: item.email || "",
      phone: item.phone || "",
      subject: item.subject || "",
      message: item.message || "",
      status: item.status || "New",
    });
  };

  // =====================================================
  // SUBMIT EDIT
  // =====================================================

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editModalData?._id) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await API.put(`/enquiries/${editModalData._id}`, {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
        subject: editFormData.subject.trim(),
        message: editFormData.message.trim(),
        status: editFormData.status,
      });

      const updated = response.data?.data;

      if (updated) {
        setEnquiries((previous) =>
          previous.map((item) =>
            item._id === updated._id ? updated : item
          )
        );
      }

      setEditModalData(null);

      await Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        text:
          editModalData.type === "Blog Comment"
            ? "Comment updated and synchronized successfully."
            : "Enquiry updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      await fetchEnquiries(false);
    } catch (error) {
      console.error("EDIT ENQUIRY ERROR:", error);

      Swal.fire({
        icon: "error",
        title: "Update failed",
        text:
          error?.response?.data?.message ||
          "Unable to update enquiry.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("All");
    setStatusFilter("All");
    setDateRangeFilter("");
    setCurrentPage(1);
  };

  // =====================================================
  // CSV
  // =====================================================

  const handleExportCSV = () => {
    if (!enquiries.length) {
      Swal.fire({
        icon: "info",
        title: "Nothing to export",
        text: "There are no enquiries on this page.",
      });

      return;
    }

    const headers = [
      "#",
      "Name",
      "Email",
      "Phone",
      "Address",
      "Type",
      "Subject",
      "Message",
      "Status",
      "Date",
    ];

    const escapeCSV = (value) =>
      `"${String(
        value ?? ""
      ).replace(/"/g, '""')}"`;

    const rows = enquiries.map(
      (item, index) => [
        index + 1,
        escapeCSV(item.name),
        escapeCSV(item.email),
        escapeCSV(item.phone),
        escapeCSV(item.address),
        escapeCSV(item.type),
        escapeCSV(item.subject),
        escapeCSV(item.message),
        escapeCSV(item.status),
        escapeCSV(
          formatDate(item.createdAt)
        ),
      ]
    );

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `enquiries_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // TYPE CLASS
  // =====================================================

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "Blog Comment":
        return "Enquiries-typeBadge--blogComment";

      case "Book Information":
        return "Enquiries-typeBadge--bookInfo";

      case "Order Related":
        return "Enquiries-typeBadge--order";

      case "Price Query":
        return "Enquiries-typeBadge--price";

      case "Product Suggestion":
        return "Enquiries-typeBadge--product";

      case "Shipping":
        return "Enquiries-typeBadge--shipping";

      case "Return & Refund":
        return "Enquiries-typeBadge--refund";

      case "Payment Issue":
        return "Enquiries-typeBadge--payment";

      default:
        return "Enquiries-typeBadge--other";
    }
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusBadgeClass = (
    status
  ) => {
    switch (status) {
      case "New":
        return "Enquiries-statusBadge--new";

      case "In Progress":
        return "Enquiries-statusBadge--inProgress";

      case "Closed":
        return "Enquiries-statusBadge--closed";

      default:
        return "";
    }
  };

  // =====================================================
  // DATE FILTER
  // =====================================================

  const visibleEnquiries =
    dateRangeFilter
      ? enquiries.filter((item) => {
          if (!item.createdAt) {
            return false;
          }

          const itemDate =
            new Date(item.createdAt)
              .toISOString()
              .slice(0, 10);

          return (
            itemDate === dateRangeFilter
          );
        })
      : enquiries;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="Enquiries">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="Enquiries-header">

        <div>
          <div className="Enquiries-titleRow">

            <div className="Enquiries-iconWrapper">
              <FiMessageSquare />
            </div>

            <h1 className="Enquiries-title">
              Customer Enquiries
            </h1>

          </div>

          <p className="Enquiries-subtitle">
            Manage, respond to, and keep
            track of customer enquiries.
          </p>
        </div>

        <div className="Enquiries-headerActions">

          <button
            className="Enquiries-refreshBtn"
            onClick={() =>
              fetchEnquiries(false)
            }
            disabled={refreshing}
          >
            <FiRefreshCw
              className={
                refreshing
                  ? "Enquiries-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            className="Enquiries-exportBtn"
            onClick={handleExportCSV}
          >
            <FiDownload />
            Export CSV
          </button>

        </div>

      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="Enquiries-statsGrid">

        <div className="Enquiries-statCard Enquiries-statCard--blue">
          <div className="Enquiries-statIcon">
            <FiMessageSquare />
          </div>

          <div>
            <div className="Enquiries-statCount">
              {stats.total}
            </div>

            <div className="Enquiries-statLabel">
              Total Enquiries
            </div>
          </div>
        </div>

        <div className="Enquiries-statCard Enquiries-statCard--green">
          <div className="Enquiries-statIcon">
            <FiMail />
          </div>

          <div>
            <div className="Enquiries-statCount">
              {stats.newCount}
            </div>

            <div className="Enquiries-statLabel">
              New Enquiries
            </div>
          </div>
        </div>

        <div className="Enquiries-statCard Enquiries-statCard--orange">
          <div className="Enquiries-statIcon">
            <FiClock />
          </div>

          <div>
            <div className="Enquiries-statCount">
              {stats.inProgressCount}
            </div>

            <div className="Enquiries-statLabel">
              In Progress
            </div>
          </div>
        </div>

        <div className="Enquiries-statCard Enquiries-statCard--red">
          <div className="Enquiries-statIcon">
            <FiCheckCircle />
          </div>

          <div>
            <div className="Enquiries-statCount">
              {stats.closedCount}
            </div>

            <div className="Enquiries-statLabel">
              Closed
            </div>
          </div>
        </div>

      </div>

      {/* =================================================
          FILTER
      ================================================= */}

      <div className="Enquiries-filterCard">

        <div className="Enquiries-searchGroup">

          <FiSearch />

          <input
            type="text"
            className="Enquiries-searchInput"
            placeholder="Search by customer, email, phone, subject..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(
                event.target.value
              );

              setCurrentPage(1);
            }}
          />

        </div>

        <div className="Enquiries-filterControls">

          <div className="Enquiries-controlGroup">

            <label>
              Enquiry Type
            </label>

            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(
                  event.target.value
                );

                setCurrentPage(1);
              }}
            >
              <option value="All">
                All Types
              </option>

              {TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>

          </div>

          <div className="Enquiries-controlGroup">

            <label>
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target.value
                );

                setCurrentPage(1);
              }}
            >
              <option value="All">
                All Statuses
              </option>

              {STATUSES.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}
            </select>

          </div>

          <div className="Enquiries-controlGroup">

            <label>
              Date
            </label>

            <div className="Enquiries-dateInputWrapper">

              <FiCalendar />

              <input
                type="date"
                value={dateRangeFilter}
                onChange={(event) => {
                  setDateRangeFilter(
                    event.target.value
                  );

                  setCurrentPage(1);
                }}
              />

            </div>

          </div>

          <button
            className="Enquiries-resetBtn"
            onClick={handleResetFilters}
          >
            <FiFilter />
            Reset
          </button>

        </div>

      </div>

      {/* =================================================
          BULK ACTION
      ================================================= */}

      {selectedIds.length > 0 && (
        <div className="Enquiries-bulkBar">

          <span>
            {selectedIds.length} selected
          </span>

          <button
            onClick={handleBulkDelete}
            disabled={actionLoading}
          >
            <FiTrash2 />
            Delete Selected
          </button>

        </div>
      )}

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="Enquiries-tableCard">

        <div className="Enquiries-tableResponsive">

          <table className="Enquiries-table">

            <thead>

              <tr>

                <th>
                  <input
                    type="checkbox"
                    checked={
                      enquiries.length > 0 &&
                      enquiries.every(
                        (item) =>
                          selectedIds.includes(
                            item._id
                          )
                      )
                    }
                    onChange={
                      handleSelectAll
                    }
                  />
                </th>

                <th>#</th>

                <th>Customer</th>

                <th>Email</th>

                <th>Phone</th>

                <th>Type</th>

                <th>Subject</th>

                <th>Message</th>

                <th>Date</th>

                <th>Status</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="11"
                    className="Enquiries-emptyRow"
                  >
                    Loading enquiries...
                  </td>
                </tr>
              ) : visibleEnquiries.length >
                0 ? (
                visibleEnquiries.map(
                  (item, index) => (
                    <tr
                      key={item._id}
                    >

                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(
                            item._id
                          )}
                          onChange={() =>
                            handleSelectRow(
                              item._id
                            )
                          }
                        />
                      </td>

                      <td>
                        {(currentPage -
                          1) *
                          ITEMS_PER_PAGE +
                          index +
                          1}
                      </td>

                      <td className="Enquiries-fontBold">
                        {item.name}
                      </td>

                      <td>
                        {item.email}
                      </td>

                      <td>
                        {item.phone}
                      </td>

                      <td>
                        <span
                          className={`Enquiries-typeBadge ${getTypeBadgeClass(
                            item.type
                          )}`}
                        >
                          {item.type ||
                            "General Enquiry"}
                        </span>
                      </td>

                      <td>
                        {item.subject ||
                          "Website Enquiry"}
                      </td>

                      <td
                        className="Enquiries-messageCell"
                        title={
                          item.message
                        }
                      >
                        {item.message ||
                          "-"}
                      </td>

                      <td>
                        <div className="Enquiries-dateCell">
                          <span>
                            {formatDate(
                              item.createdAt
                            )}
                          </span>

                          <span className="Enquiries-timeText">
                            {formatTime(
                              item.createdAt
                            )}
                          </span>
                        </div>
                      </td>

                      <td>
                        {item.type === "Blog Comment" ? (
                          <div className="Enquiries-publishToggleWrap">
                            <label
                              className="Enquiries-toggleSwitch"
                              title={
                                item.status === "Closed"
                                  ? "Published Live — Click to switch to Draft"
                                  : "Draft (Pending) — Click to Publish Live to Blog"
                              }
                            >
                              <input
                                type="checkbox"
                                checked={item.status === "Closed"}
                                onChange={() => handleTogglePublishComment(item)}
                                disabled={actionLoading}
                              />
                              <span className="Enquiries-toggleSlider" />
                            </label>
                            <span
                              className={`Enquiries-toggleBadge ${
                                item.status === "Closed"
                                  ? "is-published"
                                  : "is-draft"
                              }`}
                            >
                              {item.status === "Closed"
                                ? "Published"
                                : "Draft"}
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`Enquiries-statusBadge ${getStatusBadgeClass(
                              item.status
                            )}`}
                          >
                            <span className="Enquiries-statusDot" />
                            {item.status}
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="Enquiries-actionGroup">
                          <button
                            className="Enquiries-actionBtn Enquiries-actionBtn--view"
                            title="View Details"
                            onClick={() => handleView(item)}
                          >
                            <FiEye />
                          </button>

                          <button
                            className="Enquiries-actionBtn Enquiries-actionBtn--edit"
                            title="Edit"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <FiEdit />
                          </button>

                          <button
                            className="Enquiries-actionBtn Enquiries-actionBtn--delete"
                            title="Delete"
                            onClick={() => handleDelete(item._id)}
                            disabled={actionLoading}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="11"
                    className="Enquiries-emptyRow"
                  >
                    <p>
                      No enquiries found.
                    </p>

                    <button
                      onClick={
                        handleResetFilters
                      }
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        <div className="Enquiries-tableFooter">

          <div>
            Showing{" "}
            <strong>
              {pagination.total === 0
                ? 0
                : (currentPage - 1) *
                    ITEMS_PER_PAGE +
                  1}
            </strong>{" "}
            -{" "}
            <strong>
              {Math.min(
                currentPage *
                  ITEMS_PER_PAGE,
                pagination.total
              )}
            </strong>{" "}
            of{" "}
            <strong>
              {pagination.total}
            </strong>
          </div>

          <div className="Enquiries-pagination">

            <button
              disabled={
                currentPage <= 1
              }
              onClick={() =>
                setCurrentPage(
                  (previous) =>
                    Math.max(
                      previous - 1,
                      1
                    )
                )
              }
            >
              <FiChevronLeft />
            </button>

            {Array.from(
              {
                length:
                  pagination.totalPages ||
                  1,
              },
              (_, index) =>
                index + 1
            ).map((page) => (
              <button
                key={page}
                className={
                  currentPage === page
                    ? "Enquiries-pageBtn--active"
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
              disabled={
                currentPage >=
                pagination.totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (previous) =>
                    Math.min(
                      previous + 1,
                      pagination.totalPages
                    )
                )
              }
            >
              <FiChevronRight />
            </button>

          </div>

        </div>

      </div>

      {/* =================================================
          VIEW MODAL
      ================================================= */}

      {viewModalData && (
        <div
          className="Enquiries-modalOverlay"
          onClick={() =>
            setViewModalData(null)
          }
        >

          <div
            className="Enquiries-modalCard"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="Enquiries-modalHeader">

              <h3>
                Enquiry Details
              </h3>

              <button
                onClick={() =>
                  setViewModalData(null)
                }
              >
                <FiX />
              </button>

            </div>

            <div className="Enquiries-modalBody">

              <div className="Enquiries-modalGrid">

                <div>
                  <span>
                    Customer Name
                  </span>

                  <p>
                    {viewModalData.name}
                  </p>
                </div>

                <div>
                  <span>
                    Email Address
                  </span>

                  <p>
                    {viewModalData.email}
                  </p>
                </div>

                <div>
                  <span>
                    Phone Number
                  </span>

                  <p>
                    {viewModalData.phone}
                  </p>
                </div>

                <div>
                  <span>
                    Address
                  </span>

                  <p>
                    {viewModalData.address ||
                      "-"}
                  </p>
                </div>

                <div>
                  <span>
                    Type
                  </span>

                  <p>
                    {viewModalData.type}
                  </p>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <p>
                    {viewModalData.status}
                  </p>
                </div>

              </div>

              <div className="Enquiries-modalMessage">

                <span>
                  Subject
                </span>

                <p>
                  {viewModalData.subject}
                </p>

                <span>
                  Message
                </span>

                <p>
                  {viewModalData.message ||
                    "-"}
                </p>

                {viewModalData.adminReply && (
                  <>
                    <span>
                      Admin Reply
                    </span>

                    <p>
                      {
                        viewModalData.adminReply
                      }
                    </p>
                  </>
                )}

              </div>

            </div>

            {viewModalData.type === "Blog Comment" && (
              <div className="Enquiries-modalFooter">
                <button
                  type="button"
                  className={`Enquiries-modalActionBtn ${
                    viewModalData.status === "Closed" ? "unpublish" : "publish"
                  }`}
                  onClick={() => {
                    const currentItem = viewModalData;
                    setViewModalData(null);
                    handleTogglePublishComment(currentItem);
                  }}
                  disabled={actionLoading}
                >
                  {viewModalData.status === "Closed" ? (
                    <>
                      <FiClock /> Unpublish / Move to Draft
                    </>
                  ) : (
                    <>
                      <FiCheckCircle /> Approve & Publish Live to Blog
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="Enquiries-modalCloseBtn"
                  onClick={() => setViewModalData(null)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================
          EDIT MODAL
      ================================================= */}

      {editModalData && (
        <div
          className="Enquiries-modalOverlay"
          onClick={() => setEditModalData(null)}
        >
          <div
            className="Enquiries-modalCard Enquiries-modalCard--edit"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="Enquiries-modalHeader">
              <div className="Enquiries-modalHeaderTitle">
                <FiEdit />
                <h3>
                  {editModalData.type === "Blog Comment"
                    ? "Edit Blog Comment"
                    : "Edit Enquiry"}
                </h3>
              </div>

              <button onClick={() => setEditModalData(null)}>
                <FiX />
              </button>
            </div>

            <form className="Enquiries-modalBody" onSubmit={handleEditSubmit}>
              {editModalData.type === "Blog Comment" ? (
                <>
                  <div className="Enquiries-formGroup">
                    <label>Article Reference</label>
                    <input
                      type="text"
                      value={editModalData.subject || editModalData.address || ""}
                      disabled
                      className="Enquiries-inputDisabled"
                    />
                  </div>

                  <div className="Enquiries-formRow2">
                    <div className="Enquiries-formGroup">
                      <label>
                        Commenter Name <span>*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                        placeholder="Commenter Name"
                      />
                    </div>

                    <div className="Enquiries-formGroup">
                      <label>
                        Email Address <span>*</span>
                      </label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="Enquiries-formGroup">
                    <label>
                      Comment Message <span>*</span>
                    </label>
                    <textarea
                      rows="4"
                      value={editFormData.message}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      required
                      placeholder="Comment content..."
                    />
                  </div>

                  <div className="Enquiries-formGroup">
                    <label>Publish Status</label>
                    <div className="Enquiries-editStatusToggle">
                      <label
                        className={`Enquiries-statusRadioPill ${
                          editFormData.status !== "Closed" ? "active-draft" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value="New"
                          checked={editFormData.status !== "Closed"}
                          onChange={() =>
                            setEditFormData((prev) => ({
                              ...prev,
                              status: "New",
                            }))
                          }
                        />
                        Draft (Hidden from Live Blog)
                      </label>

                      <label
                        className={`Enquiries-statusRadioPill ${
                          editFormData.status === "Closed"
                            ? "active-published"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value="Closed"
                          checked={editFormData.status === "Closed"}
                          onChange={() =>
                            setEditFormData((prev) => ({
                              ...prev,
                              status: "Closed",
                            }))
                          }
                        />
                        Published (Live on Blog)
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="Enquiries-formRow2">
                    <div className="Enquiries-formGroup">
                      <label>Customer Name</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="Enquiries-formGroup">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="Enquiries-formRow2">
                    <div className="Enquiries-formGroup">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        value={editFormData.phone}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="Enquiries-formGroup">
                      <label>Status</label>
                      <select
                        value={editFormData.status}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="Enquiries-formGroup">
                    <label>Subject</label>
                    <input
                      type="text"
                      value={editFormData.subject}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="Enquiries-formGroup">
                    <label>Message Content</label>
                    <textarea
                      rows="4"
                      value={editFormData.message}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                    />
                  </div>
                </>
              )}

              <div className="Enquiries-modalFooterButtons">
                <button
                  type="button"
                  className="Enquiries-modalCancelBtn"
                  onClick={() => setEditModalData(null)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="Enquiries-modalSubmitBtn"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Enquiries;