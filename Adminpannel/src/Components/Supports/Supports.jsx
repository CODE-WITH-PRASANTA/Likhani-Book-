import React, { useEffect, useMemo, useState } from "react";
import "./Supports.css";

const initialMessages = [
  {
    id: 1,
    name: "Akash Kumar Roul",
    mobile: "+91 7205303511",
    email: "akash@example.com",
    message: "Need information about how to order books.",
    date: "12 Dec 2024",
    time: "10:45 AM",
    status: "New",
  },
  {
    id: 2,
    name: "Priya Sharma",
    mobile: "+91 9876543210",
    email: "priya@example.com",
    message: "Can you provide details about the available books?",
    date: "12 Dec 2024",
    time: "09:20 AM",
    status: "Replied",
  },
  {
    id: 3,
    name: "Rohit Mishra",
    mobile: "+91 9123456780",
    email: "rohit@example.com",
    message: "I want to know about book prices and delivery.",
    date: "11 Dec 2024",
    time: "06:15 PM",
    status: "New",
  },
  {
    id: 4,
    name: "Sneha Patnaik",
    mobile: "+91 8765432109",
    email: "sneha@example.com",
    message: "Do you have COD available?",
    date: "11 Dec 2024",
    time: "04:32 PM",
    status: "Replied",
  },
  {
    id: 5,
    name: "Aman Verma",
    mobile: "+91 9089765432",
    email: "aman@example.com",
    message: "Please share the delivery timeline.",
    date: "11 Dec 2024",
    time: "01:10 PM",
    status: "New",
  },
  {
    id: 6,
    name: "Kavya Singh",
    mobile: "+91 7986543210",
    email: "kavya@example.com",
    message: "I want bulk order details.",
    date: "10 Dec 2024",
    time: "11:45 AM",
    status: "Replied",
  },
  {
    id: 7,
    name: "Suresh Nayak",
    mobile: "+91 7070707070",
    email: "suresh@example.com",
    message: "Is this book available in Odia language?",
    date: "10 Dec 2024",
    time: "10:12 AM",
    status: "New",
  },
  {
    id: 8,
    name: "Anita Das",
    mobile: "+91 8899776655",
    email: "anita@example.com",
    message: "Can you suggest some best books?",
    date: "09 Dec 2024",
    time: "05:38 PM",
    status: "Replied",
  },
  {
    id: 9,
    name: "Vikram Rao",
    mobile: "+91 9123901234",
    email: "vikram@example.com",
    message: "I am facing issue with payment.",
    date: "09 Dec 2024",
    time: "12:26 PM",
    status: "New",
  },
  {
    id: 10,
    name: "Neha Agarwal",
    mobile: "+91 9988776655",
    email: "neha@example.com",
    message: "Can I get a discount on multiple books?",
    date: "08 Dec 2024",
    time: "03:55 PM",
    status: "Replied",
  },
  {
    id: 11,
    name: "Rajesh Kumar",
    mobile: "+91 9876501234",
    email: "rajesh@example.com",
    message: "Please help me track my book order.",
    date: "08 Dec 2024",
    time: "01:30 PM",
    status: "New",
  },
  {
    id: 12,
    name: "Pooja Mohanty",
    mobile: "+91 9090909090",
    email: "pooja@example.com",
    message: "Do you provide home delivery?",
    date: "07 Dec 2024",
    time: "11:15 AM",
    status: "Replied",
  },
];

const Supports = () => {
  const [messages, setMessages] = useState(initialMessages);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("");

  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] =
    useState("All Status");
  const [appliedDate, setAppliedDate] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [modalType, setModalType] = useState(null);
  const [selectedMessage, setSelectedMessage] =
    useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    mobile: "",
    email: "",
    message: "",
    status: "New",
  });

  const itemsPerPage = 10;

  /* =========================
     FILTER DATA
  ========================= */

  const filteredMessages = useMemo(() => {
    return messages.filter((item) => {
      const searchText =
        `${item.name} ${item.mobile} ${item.email} ${item.message}`
          .toLowerCase();

      const matchesSearch =
        !appliedSearch ||
        searchText.includes(
          appliedSearch.toLowerCase()
        );

      const matchesStatus =
        appliedStatus === "All Status" ||
        item.status === appliedStatus;

      const matchesDate =
        !appliedDate ||
        item.date === appliedDate;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    messages,
    appliedSearch,
    appliedStatus,
    appliedDate,
  ]);

  /* =========================
     PAGINATION
  ========================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredMessages.length / itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * itemsPerPage;

  const currentMessages =
    filteredMessages.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* =========================
     STATISTICS
  ========================= */

  const totalMessages = messages.length;

  const unreadMessages = messages.filter(
    (item) => item.status === "New"
  ).length;

  const repliedMessages = messages.filter(
    (item) => item.status === "Replied"
  ).length;

  const pendingMessages = messages.filter(
    (item) => item.status === "Pending"
  ).length;

  /* =========================
     FILTER
  ========================= */

  const handleApplyFilter = () => {
    setAppliedSearch(search);
    setAppliedStatus(statusFilter);
    setAppliedDate(dateFilter);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleResetFilter = () => {
    setSearch("");
    setStatusFilter("All Status");
    setDateFilter("");

    setAppliedSearch("");
    setAppliedStatus("All Status");
    setAppliedDate("");

    setCurrentPage(1);
    setSelectedIds([]);
  };

  /* =========================
     SELECT ALL
  ========================= */

  const currentPageIds = currentMessages.map(
    (item) => item.id
  );

  const isAllSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) =>
      selectedIds.includes(id)
    );

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((previous) =>
        previous.filter(
          (id) => !currentPageIds.includes(id)
        )
      );
    } else {
      setSelectedIds((previous) => [
        ...new Set([
          ...previous,
          ...currentPageIds,
        ]),
      ]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter(
            (selectedId) => selectedId !== id
          )
        : [...previous, id]
    );
  };

  /* =========================
     VIEW
  ========================= */

  const handleView = (item) => {
    setSelectedMessage(item);
    setModalType("view");
  };

  /* =========================
     EDIT
  ========================= */

  const handleEdit = (item) => {
    setSelectedMessage(item);

    setEditForm({
      name: item.name,
      mobile: item.mobile,
      email: item.email,
      message: item.message,
      status: item.status,
    });

    setModalType("edit");
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdate = (event) => {
    event.preventDefault();

    if (!editForm.name.trim()) {
      return;
    }

    setMessages((previous) =>
      previous.map((item) =>
        item.id === selectedMessage.id
          ? {
              ...item,
              name: editForm.name.trim(),
              mobile: editForm.mobile.trim(),
              email: editForm.email.trim(),
              message:
                editForm.message.trim(),
              status: editForm.status,
            }
          : item
      )
    );

    setModalType(null);
    setSelectedMessage(null);
  };

  /* =========================
     DELETE
  ========================= */

  const handleDeleteOpen = (item) => {
    setSelectedMessage(item);
    setModalType("delete");
  };

  const handleDeleteConfirm = () => {
    if (!selectedMessage) return;

    setMessages((previous) =>
      previous.filter(
        (item) =>
          item.id !== selectedMessage.id
      )
    );

    setSelectedIds((previous) =>
      previous.filter(
        (id) =>
          id !== selectedMessage.id
      )
    );

    setModalType(null);
    setSelectedMessage(null);
  };

  /* =========================
     BULK DELETE
  ========================= */

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;

    setMessages((previous) =>
      previous.filter(
        (item) =>
          !selectedIds.includes(item.id)
      )
    );

    setSelectedIds([]);
  };

  /* =========================
     CLOSE MODAL
  ========================= */

  const closeModal = () => {
    setModalType(null);
    setSelectedMessage(null);
  };

  /* =========================
     PAGINATION
  ========================= */

  const goToPage = (page) => {
    if (
      page >= 1 &&
      page <= totalPages
    ) {
      setCurrentPage(page);
      setSelectedIds([]);
    }
  };

  return (
    <div className="Supports">
      {/* =========================
          HEADER
      ========================= */}

      <div className="Supports-header">
        <div className="Supports-headerContent">
          <h1 className="Supports-title">
            Support Messages
          </h1>

          <p className="Supports-subtitle">
            Manage all support form submissions
            from your website.
          </p>
        </div>
      </div>

      {/* =========================
          STAT CARDS
      ========================= */}

      <div className="Supports-stats">
        {/* Total */}
        <div className="Supports-statCard Supports-totalCard">
          <div className="Supports-statIcon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M20 15a3 3 0 0 1-3 3H8l-4 3v-6a3 3 0 0 1-2-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3Z" />
              <path d="M8 9h8" />
              <path d="M8 13h5" />
            </svg>
          </div>

          <div className="Supports-statContent">
            <strong>
              {totalMessages}
            </strong>

            <span>
              Total Messages
            </span>
          </div>
        </div>

        {/* Unread */}
        <div className="Supports-statCard Supports-unreadCard">
          <div className="Supports-statIcon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
              />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </div>

          <div className="Supports-statContent">
            <strong>
              {unreadMessages}
            </strong>

            <span>
              Unread Messages
            </span>
          </div>
        </div>

        {/* Replied */}
        <div className="Supports-statCard Supports-repliedCard">
          <div className="Supports-statIcon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />
              <path d="m8 12 2.5 2.5L16 9" />
            </svg>
          </div>

          <div className="Supports-statContent">
            <strong>
              {repliedMessages}
            </strong>

            <span>
              Replied Messages
            </span>
          </div>
        </div>

        {/* Pending */}
        <div className="Supports-statCard Supports-pendingCard">
          <div className="Supports-statIcon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>

          <div className="Supports-statContent">
            <strong>
              {pendingMessages}
            </strong>

            <span>
              Pending Replies
            </span>
          </div>
        </div>
      </div>

      {/* =========================
          TOOLBAR
      ========================= */}

      <div className="Supports-toolbar">
        <div className="Supports-searchBox">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />

            <path d="m20 20-4-4" />
          </svg>

          <input
            type="text"
            placeholder="Search by name, mobile, message..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleApplyFilter();
              }
            }}
          />
        </div>

        <div className="Supports-selectBox">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option>
              All Status
            </option>
            <option>
              New
            </option>
            <option>
              Replied
            </option>
            <option>
              Pending
            </option>
          </select>

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <div className="Supports-dateBox">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect
              x="3"
              y="4"
              width="18"
              height="17"
              rx="2"
            />

            <path d="M16 2v4" />
            <path d="M8 2v4" />
            <path d="M3 10h18" />
          </svg>

          <input
            type="text"
            placeholder="Select Date"
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(
                event.target.value
              )
            }
            onFocus={(event) => {
              event.target.type = "date";
            }}
            onBlur={(event) => {
              if (!event.target.value) {
                event.target.type = "text";
              }
            }}
          />
        </div>

        <button
          type="button"
          className="Supports-filterButton"
          onClick={handleApplyFilter}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 5h16l-6.5 8v5l-3 1v-6Z" />
          </svg>

          <span>
            Filter
          </span>
        </button>
      </div>

      {/* =========================
          BULK ACTION
      ========================= */}

      {selectedIds.length > 0 && (
        <div className="Supports-bulkBar">
          <div>
            <strong>
              {selectedIds.length}
            </strong>{" "}
            message
            {selectedIds.length > 1
              ? "s"
              : ""}{" "}
            selected
          </div>

          <button
            type="button"
            onClick={handleBulkDelete}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 7h16" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M6 7l1 14h10l1-14" />
              <path d="M9 7V4h6v3" />
            </svg>

            Delete Selected
          </button>
        </div>
      )}

      {/* =========================
          TABLE
      ========================= */}

      <div className="Supports-tableCard">
        <div className="Supports-tableWrapper">
          <table className="Supports-table">
            <thead>
              <tr>
                <th className="Supports-checkColumn">
                  <input
                    type="checkbox"
                    checked={
                      isAllSelected
                    }
                    onChange={
                      handleSelectAll
                    }
                  />
                </th>

                <th>#</th>

                <th>Name</th>

                <th>
                  Mobile Number
                </th>

                <th>
                  Message Preview
                </th>

                <th>
                  Date & Time
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {currentMessages.length >
              0 ? (
                currentMessages.map(
                  (item, index) => (
                    <tr
                      key={item.id}
                      className={
                        selectedIds.includes(
                          item.id
                        )
                          ? "Supports-selectedRow"
                          : ""
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(
                            item.id
                          )}
                          onChange={() =>
                            handleSelectOne(
                              item.id
                            )
                          }
                        />
                      </td>

                      <td>
                        {startIndex +
                          index +
                          1}
                      </td>

                      <td>
                        <div className="Supports-name">
                          {item.name}
                        </div>
                      </td>

                      <td>
                        <span className="Supports-mobile">
                          {item.mobile}
                        </span>
                      </td>

                      <td>
                        <div
                          className="Supports-messagePreview"
                          title={
                            item.message
                          }
                        >
                          {item.message}
                        </div>
                      </td>

                      <td>
                        <div className="Supports-dateTime">
                          <span>
                            {item.date}
                          </span>

                          <small>
                            {item.time}
                          </small>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`Supports-status Supports-status-${item.status.toLowerCase()}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <div className="Supports-actions">
                          {/* VIEW */}
                          <button
                            type="button"
                            className="Supports-actionButton Supports-viewButton"
                            title="View"
                            onClick={() =>
                              handleView(
                                item
                              )
                            }
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />

                              <circle
                                cx="12"
                                cy="12"
                                r="2.8"
                              />
                            </svg>
                          </button>

                          {/* EDIT */}
                          <button
                            type="button"
                            className="Supports-actionButton Supports-editButton"
                            title="Edit"
                            onClick={() =>
                              handleEdit(
                                item
                              )
                            }
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                            </svg>
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            className="Supports-actionButton Supports-deleteButton"
                            title="Delete"
                            onClick={() =>
                              handleDeleteOpen(
                                item
                              )
                            }
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path d="M4 7h16" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M6 7l1 14h10l1-14" />
                              <path d="M9 7V4h6v3" />
                            </svg>
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
                    className="Supports-empty"
                  >
                    <div className="Supports-emptyContent">
                      <div className="Supports-emptyIcon">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        >
                          <circle
                            cx="11"
                            cy="11"
                            r="7"
                          />

                          <path d="m20 20-4-4" />
                        </svg>
                      </div>

                      <h3>
                        No messages found
                      </h3>

                      <p>
                        Try changing your
                        search or filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =========================
            FOOTER
        ========================= */}

        <div className="Supports-tableFooter">
          <p>
            Showing{" "}
            <strong>
              {filteredMessages.length ===
              0
                ? 0
                : startIndex + 1}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(
                startIndex +
                  itemsPerPage,
                filteredMessages.length
              )}
            </strong>{" "}
            of{" "}
            <strong>
              {filteredMessages.length}
            </strong>{" "}
            messages
          </p>

          <div className="Supports-pagination">
            <button
              type="button"
              disabled={
                safeCurrentPage === 1
              }
              onClick={() =>
                goToPage(
                  safeCurrentPage - 1
                )
              }
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                type="button"
                className={
                  safeCurrentPage === page
                    ? "Supports-pageActive"
                    : ""
                }
                onClick={() =>
                  goToPage(page)
                }
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={
                safeCurrentPage ===
                totalPages
              }
              onClick={() =>
                goToPage(
                  safeCurrentPage + 1
                )
              }
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      {modalType === "view" &&
        selectedMessage && (
          <div
            className="Supports-modalOverlay"
            onClick={closeModal}
          >
            <div
              className="Supports-viewModal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="Supports-modalHeader">
                <div>
                  <span className="Supports-modalEyebrow">
                    SUPPORT MESSAGE
                  </span>

                  <h2>
                    Message Details
                  </h2>
                </div>

                <button
                  type="button"
                  className="Supports-modalClose"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>

              <div className="Supports-viewProfile">
                <div className="Supports-profileAvatar">
                  {selectedMessage.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>
                    {selectedMessage.name}
                  </h3>

                  <p>
                    {selectedMessage.email}
                  </p>
                </div>

                <span
                  className={`Supports-status Supports-status-${selectedMessage.status.toLowerCase()}`}
                >
                  {selectedMessage.status}
                </span>
              </div>

              <div className="Supports-viewGrid">
                <div className="Supports-detailBox">
                  <span>
                    Mobile Number
                  </span>

                  <strong>
                    {selectedMessage.mobile}
                  </strong>
                </div>

                <div className="Supports-detailBox">
                  <span>
                    Email Address
                  </span>

                  <strong>
                    {selectedMessage.email}
                  </strong>
                </div>

                <div className="Supports-detailBox">
                  <span>
                    Date
                  </span>

                  <strong>
                    {selectedMessage.date}
                  </strong>
                </div>

                <div className="Supports-detailBox">
                  <span>
                    Time
                  </span>

                  <strong>
                    {selectedMessage.time}
                  </strong>
                </div>
              </div>

              <div className="Supports-messageBox">
                <span>
                  Customer Message
                </span>

                <p>
                  {selectedMessage.message}
                </p>
              </div>

              <div className="Supports-modalFooter">
                <button
                  type="button"
                  className="Supports-secondaryButton"
                  onClick={closeModal}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="Supports-primaryButton"
                  onClick={() => {
                    closeModal();

                    setTimeout(() => {
                      handleEdit(
                        selectedMessage
                      );
                    }, 100);
                  }}
                >
                  Edit Message
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {modalType === "edit" &&
        selectedMessage && (
          <div
            className="Supports-modalOverlay"
            onClick={closeModal}
          >
            <div
              className="Supports-editModal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="Supports-modalHeader">
                <div>
                  <span className="Supports-modalEyebrow">
                    UPDATE MESSAGE
                  </span>

                  <h2>
                    Edit Support Message
                  </h2>
                </div>

                <button
                  type="button"
                  className="Supports-modalClose"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>

              <form
                className="Supports-editForm"
                onSubmit={handleUpdate}
              >
                <div className="Supports-formGrid">
                  <div className="Supports-formGroup">
                    <label>
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={
                        handleEditChange
                      }
                    />
                  </div>

                  <div className="Supports-formGroup">
                    <label>
                      Mobile Number
                    </label>

                    <input
                      type="text"
                      name="mobile"
                      value={
                        editForm.mobile
                      }
                      onChange={
                        handleEditChange
                      }
                    />
                  </div>

                  <div className="Supports-formGroup">
                    <label>
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={
                        editForm.email
                      }
                      onChange={
                        handleEditChange
                      }
                    />
                  </div>

                  <div className="Supports-formGroup">
                    <label>
                      Status
                    </label>

                    <select
                      name="status"
                      value={
                        editForm.status
                      }
                      onChange={
                        handleEditChange
                      }
                    >
                      <option>
                        New
                      </option>

                      <option>
                        Replied
                      </option>

                      <option>
                        Pending
                      </option>
                    </select>
                  </div>
                </div>

                <div className="Supports-formGroup">
                  <label>
                    Customer Message
                  </label>

                  <textarea
                    name="message"
                    rows="5"
                    value={
                      editForm.message
                    }
                    onChange={
                      handleEditChange
                    }
                  />
                </div>

                <div className="Supports-modalFooter">
                  <button
                    type="button"
                    className="Supports-secondaryButton"
                    onClick={
                      closeModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="Supports-primaryButton"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {modalType === "delete" &&
        selectedMessage && (
          <div
            className="Supports-modalOverlay"
            onClick={closeModal}
          >
            <div
              className="Supports-deleteModal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="Supports-deleteIcon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 3 21 20H3Z" />
                  <path d="M12 9v5" />
                  <circle
                    cx="12"
                    cy="17"
                    r=".7"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </div>

              <h2>
                Delete Message?
              </h2>

              <p>
                Are you sure you want to
                delete the support message
                from{" "}
                <strong>
                  {selectedMessage.name}
                </strong>
                ? This action cannot be
                undone.
              </p>

              <div className="Supports-deleteActions">
                <button
                  type="button"
                  className="Supports-secondaryButton"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="Supports-dangerButton"
                  onClick={
                    handleDeleteConfirm
                  }
                >
                  Delete Message
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Supports;