import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  Users as UsersIcon,
  UserCheck,
  UserX,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Upload,
  Mail,
  Phone,
  CalendarDays,
  Shield,
  CircleCheck,
  CircleX,
  AlertTriangle,
  Check,
  UserRound,
  MapPin,
} from "lucide-react";
import "./Users.css";

const Users = () => {
  /* =========================================================
     INITIAL DATA
  ========================================================= */

  const initialUsers = [
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "+91 98765 43210",
      role: "Admin",
      joinedDate: "Sep 9, 2026",
      status: "Active",
      avatar: "https://i.pravatar.cc/150?img=12",
      address: "Bhubaneswar, Odisha",
      orders: 42,
    },
    {
      id: 2,
      name: "Priya Patel",
      email: "priya@example.com",
      phone: "+91 87654 32109",
      role: "Editor",
      joinedDate: "Sep 9, 2026",
      status: "Active",
      avatar: "https://i.pravatar.cc/150?img=47",
      address: "Mumbai, Maharashtra",
      orders: 36,
    },
    {
      id: 3,
      name: "Amit Kumar",
      email: "amit@example.com",
      phone: "+91 76543 21098",
      role: "Customer",
      joinedDate: "Sep 8, 2026",
      status: "Active",
      avatar: "https://i.pravatar.cc/150?img=11",
      address: "Delhi, India",
      orders: 28,
    },
    {
      id: 4,
      name: "Sneha Verma",
      email: "sneha@example.com",
      phone: "+91 65432 10987",
      role: "Customer",
      joinedDate: "Sep 8, 2026",
      status: "Active",
      avatar: "https://i.pravatar.cc/150?img=44",
      address: "Kolkata, West Bengal",
      orders: 31,
    },
    {
      id: 5,
      name: "Vikram Singh",
      email: "vikram@example.com",
      phone: "+91 54321 09876",
      role: "Editor",
      joinedDate: "Sep 7, 2026",
      status: "Inactive",
      avatar: "https://i.pravatar.cc/150?img=13",
      address: "Jaipur, Rajasthan",
      orders: 19,
    },
    {
      id: 6,
      name: "Neha Gupta",
      email: "neha@example.com",
      phone: "+91 43210 98765",
      role: "Customer",
      joinedDate: "Sep 7, 2026",
      status: "Active",
      avatar: "https://i.pravatar.cc/150?img=32",
      address: "Pune, Maharashtra",
      orders: 24,
    },
    {
      id: 7,
      name: "Rohan Mehta",
      email: "rohan@example.com",
      phone: "+91 32109 87654",
      role: "Customer",
      joinedDate: "Sep 6, 2026",
      status: "Active",
      avatar: "https://i.pravatar.cc/150?img=68",
      address: "Ahmedabad, Gujarat",
      orders: 17,
    },
    {
      id: 8,
      name: "Ananya Singh",
      email: "ananya@example.com",
      phone: "+91 21098 76543",
      role: "Customer",
      joinedDate: "Sep 6, 2026",
      status: "Inactive",
      avatar: "https://i.pravatar.cc/150?img=49",
      address: "Lucknow, Uttar Pradesh",
      orders: 12,
    },
    {
      id: 9,
      name: "Arjun Das",
      email: "arjun@example.com",
      phone: "+91 99887 66554",
      role: "Customer",
      joinedDate: "Sep 5, 2026",
      status: "Active",
      avatar: "https://i.pravatar.cc/150?img=15",
      address: "Cuttack, Odisha",
      orders: 22,
    },
    {
      id: 10,
      name: "Meera Joshi",
      email: "meera@example.com",
      phone: "+91 88776 55443",
      role: "Editor",
      joinedDate: "Sep 4, 2026",
      status: "Active",
      avatar: "https://i.pravatar.cc/150?img=45",
      address: "Bangalore, Karnataka",
      orders: 38,
    },
    {
      id: 11,
      name: "Sourav Mishra",
      email: "sourav@example.com",
      phone: "+91 77665 44332",
      role: "Customer",
      joinedDate: "Sep 3, 2026",
      status: "Active",
      avatar: "https://i.pravatar.cc/150?img=52",
      address: "Ranchi, Jharkhand",
      orders: 14,
    },
    {
      id: 12,
      name: "Kavya Nair",
      email: "kavya@example.com",
      phone: "+91 66554 33221",
      role: "Customer",
      joinedDate: "Sep 2, 2026",
      status: "Inactive",
      avatar: "https://i.pravatar.cc/150?img=48",
      address: "Kochi, Kerala",
      orders: 9,
    },
  ];

  /* =========================================================
     STATES
  ========================================================= */

  const [users, setUsers] = useState(initialUsers);

  const [searchTerm, setSearchTerm] = useState("");

  const [roleFilter, setRoleFilter] = useState("All Roles");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [sortFilter, setSortFilter] =
    useState("Sort By: Latest");

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedUsers, setSelectedUsers] = useState([]);

  const [modalType, setModalType] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Customer",
    status: "Active",
    address: "",
    avatar: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const [imagePreview, setImagePreview] = useState("");

  const imageInputRef = useRef(null);

  const USERS_PER_PAGE = 8;

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredUsers = useMemo(() => {
    let result = [...users];

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.phone.toLowerCase().includes(search)
      );
    }

    if (roleFilter !== "All Roles") {
      result = result.filter(
        (user) => user.role === roleFilter
      );
    }

    if (statusFilter !== "All Status") {
      result = result.filter(
        (user) => user.status === statusFilter
      );
    }

    if (sortFilter === "Sort By: A-Z") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (sortFilter === "Sort By: Z-A") {
      result.sort((a, b) =>
        b.name.localeCompare(a.name)
      );
    }

    if (sortFilter === "Sort By: Orders") {
      result.sort((a, b) => b.orders - a.orders);
    }

    return result;
  }, [
    users,
    searchTerm,
    roleFilter,
    statusFilter,
    sortFilter,
  ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length / USERS_PER_PAGE
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) * USERS_PER_PAGE;

  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + USERS_PER_PAGE
  );

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  const newUsers = users.length;

  /* =========================================================
     SELECT ALL
  ========================================================= */

  const currentUserIds = currentUsers.map(
    (user) => user.id
  );

  const allCurrentSelected =
    currentUserIds.length > 0 &&
    currentUserIds.every((id) =>
      selectedUsers.includes(id)
    );

  const someCurrentSelected =
    currentUserIds.some((id) =>
      selectedUsers.includes(id)
    ) && !allCurrentSelected;

  const handleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedUsers((previous) =>
        previous.filter(
          (id) => !currentUserIds.includes(id)
        )
      );
    } else {
      setSelectedUsers((previous) => [
        ...new Set([
          ...previous,
          ...currentUserIds,
        ]),
      ]);
    }
  };

  /* =========================================================
     SELECT USER
  ========================================================= */

  const handleSelectUser = (userId) => {
    setSelectedUsers((previous) =>
      previous.includes(userId)
        ? previous.filter((id) => id !== userId)
        : [...previous, userId]
    );
  };

  /* =========================================================
     FORM RESET
  ========================================================= */

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Customer",
      status: "Active",
      address: "",
      avatar: "",
    });

    setImagePreview("");

    setFormErrors({});

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  /* =========================================================
     MODALS
  ========================================================= */

  const openAddModal = () => {
    resetForm();
    setSelectedUser(null);
    setModalType("add");
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setModalType("view");
  };

  const openEditModal = (user) => {
    setSelectedUser(user);

    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      address: user.address || "",
      avatar: user.avatar || "",
    });

    setImagePreview(user.avatar || "");

    setFormErrors({});

    setModalType("edit");
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setModalType("delete");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
    resetForm();
  };

  /* =========================================================
     INPUT
  ========================================================= */

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  /* =========================================================
     IMAGE
  ========================================================= */

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormErrors((previous) => ({
        ...previous,
        avatar: "Please select a valid image.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((previous) => ({
        ...previous,
        avatar: "Image must be smaller than 5MB.",
      }));
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);

      setFormData((previous) => ({
        ...previous,
        avatar: reader.result,
      }));
    };

    reader.readAsDataURL(file);

    setFormErrors((previous) => ({
      ...previous,
      avatar: "",
    }));
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (
      !/^\S+@\S+\.\S+$/.test(formData.email)
    ) {
      errors.email = "Enter a valid email.";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* =========================================================
     ADD
  ========================================================= */

  const handleAddUser = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const newUser = {
      id: Date.now(),

      name: formData.name.trim(),

      email: formData.email.trim(),

      phone: formData.phone.trim(),

      role: formData.role,

      status: formData.status,

      avatar:
        formData.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          formData.name
        )}&background=eaf3ff&color=1474e8&bold=true`,

      address: formData.address.trim(),

      joinedDate: new Date().toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      ),

      orders: 0,
    };

    setUsers((previous) => [
      newUser,
      ...previous,
    ]);

    setCurrentPage(1);

    closeModal();
  };

  /* =========================================================
     UPDATE
  ========================================================= */

  const handleUpdateUser = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setUsers((previous) =>
      previous.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              name: formData.name.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              role: formData.role,
              status: formData.status,
              address: formData.address.trim(),
              avatar:
                formData.avatar || user.avatar,
            }
          : user
      )
    );

    closeModal();
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    setUsers((previous) =>
      previous.filter(
        (user) => user.id !== selectedUser.id
      )
    );

    setSelectedUsers((previous) =>
      previous.filter(
        (id) => id !== selectedUser.id
      )
    );

    closeModal();
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const toggleUserStatus = (user) => {
    setUsers((previous) =>
      previous.map((item) =>
        item.id === user.id
          ? {
              ...item,
              status:
                item.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : item
      )
    );
  };

  /* =========================================================
     EXPORT
  ========================================================= */

  const handleExport = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Role",
      "Joined Date",
      "Status",
      "Orders",
    ];

    const rows = users.map((user) => [
      user.id,
      user.name,
      user.email,
      user.phone,
      user.role,
      user.joinedDate,
      user.status,
      user.orders,
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
    link.download = "users.csv";

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
    setRoleFilter("All Roles");
    setStatusFilter("All Status");
    setSortFilter("Sort By: Latest");
    setCurrentPage(1);
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const goPrevious = () => {
    setCurrentPage((previous) =>
      Math.max(1, previous - 1)
    );
  };

  const goNext = () => {
    setCurrentPage((previous) =>
      Math.min(totalPages, previous + 1)
    );
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="Users">

      {/* HEADER */}

      <section className="Users__header">

        <div className="Users__heading">
          <h1 className="Users__title">
            Users
          </h1>

          <p className="Users__subtitle">
            Manage your users. View, edit or remove
            user accounts.
          </p>
        </div>

        <div className="Users__headerRight">

          <div className="Users__breadcrumb">
            <span>Dashboard</span>
            <span>›</span>
            <strong>Users</strong>
          </div>

          <button
            className="Users__addButton"
            onClick={openAddModal}
          >
            <Plus size={18} />
            Add User
          </button>

        </div>

      </section>


      {/* STATS */}

      <section className="Users__stats">

        <div className="Users__statCard Users__statCard--blue">

          <div className="Users__statIcon">
            <UsersIcon size={22} />
          </div>

          <div className="Users__statContent">
            <span>Total Users</span>
            <strong>{totalUsers}</strong>
          </div>

          <UsersIcon className="Users__statWatermark" />

        </div>


        <div className="Users__statCard Users__statCard--green">

          <div className="Users__statIcon">
            <UserCheck size={22} />
          </div>

          <div className="Users__statContent">
            <span>Active Users</span>
            <strong>{activeUsers}</strong>
          </div>

          <UsersIcon className="Users__statWatermark" />

        </div>


        <div className="Users__statCard Users__statCard--red">

          <div className="Users__statIcon">
            <UserX size={22} />
          </div>

          <div className="Users__statContent">
            <span>Inactive Users</span>
            <strong>{inactiveUsers}</strong>
          </div>

          <UsersIcon className="Users__statWatermark" />

        </div>


        <div className="Users__statCard Users__statCard--purple">

          <div className="Users__statIcon">
            <ShieldCheck size={22} />
          </div>

          <div className="Users__statContent">
            <span>New Users</span>
            <strong>{newUsers}</strong>
          </div>

          <UsersIcon className="Users__statWatermark" />

        </div>

      </section>


      {/* TOOLBAR */}

      <section className="Users__toolbar">

        <div className="Users__filters">

          <div className="Users__search">

            <Search size={17} />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search users by name, email or phone..."
            />

            {searchTerm && (
              <button
                className="Users__searchClear"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
              >
                <X size={13} />
              </button>
            )}

          </div>


          <div className="Users__select">

            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Roles</option>
              <option>Admin</option>
              <option>Editor</option>
              <option>Customer</option>
            </select>

            <ChevronDown size={15} />

          </div>


          <div className="Users__select">

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>

            <ChevronDown size={15} />

          </div>


          <div className="Users__select Users__select--sort">

            <select
              value={sortFilter}
              onChange={(event) => {
                setSortFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option>Sort By: Latest</option>
              <option>Sort By: A-Z</option>
              <option>Sort By: Z-A</option>
              <option>Sort By: Orders</option>
            </select>

            <ChevronDown size={15} />

          </div>

        </div>


        <div className="Users__toolbarRight">

          {selectedUsers.length > 0 && (
            <div className="Users__selected">
              <Check size={14} />

              <span>
                {selectedUsers.length} selected
              </span>

              <button
                onClick={() => setSelectedUsers([])}
              >
                <X size={13} />
              </button>
            </div>
          )}

          <button
            className="Users__exportButton"
            onClick={handleExport}
          >
            <Download size={16} />
            Export Excel
          </button>

        </div>

      </section>


      {/* TABLE */}

      <section className="Users__tableCard">

        <div className="Users__tableWrapper">

          <table className="Users__table">

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
                <th>Image</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>

              </tr>

            </thead>


            <tbody>

              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (

                  <tr
                    key={user.id}
                    className={
                      selectedUsers.includes(user.id)
                        ? "Users__rowSelected"
                        : ""
                    }
                  >

                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(
                          user.id
                        )}
                        onChange={() =>
                          handleSelectUser(user.id)
                        }
                      />
                    </td>

                    <td>
                      <span className="Users__number">
                        {startIndex + index + 1}
                      </span>
                    </td>

                    <td>
                      <div className="Users__avatar">
                        <img
                          src={user.avatar}
                          alt={user.name}
                        />
                      </div>
                    </td>

                    <td>
                      <div className="Users__userInfo">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </td>

                    <td>
                      <span className="Users__email">
                        {user.email}
                      </span>
                    </td>

                    <td>
                      <span className="Users__phone">
                        {user.phone}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`Users__role Users__role--${user.role.toLowerCase()}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span className="Users__date">
                        {user.joinedDate}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`Users__statusToggle ${
                          user.status === "Active"
                            ? "Users__statusToggle--active"
                            : "Users__statusToggle--inactive"
                        }`}
                        onClick={() =>
                          toggleUserStatus(user)
                        }
                      >
                        <span />
                      </button>
                    </td>

                    <td>

                      <div className="Users__actions">

                        <button
                          className="Users__action Users__action--view"
                          onClick={() =>
                            openViewModal(user)
                          }
                          title="View User"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="Users__action Users__action--edit"
                          onClick={() =>
                            openEditModal(user)
                          }
                          title="Edit User"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="Users__action Users__action--delete"
                          onClick={() =>
                            openDeleteModal(user)
                          }
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))
              ) : (

                <tr>

                  <td
                    colSpan="10"
                    className="Users__empty"
                  >

                    <div className="Users__emptyContent">

                      <div className="Users__emptyIcon">
                        <UsersIcon size={32} />
                      </div>

                      <h3>
                        No users found
                      </h3>

                      <p>
                        Try changing your search
                        or filters.
                      </p>

                      <button
                        onClick={resetFilters}
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

        <div className="Users__tableFooter">

          <span className="Users__showing">
            Showing{" "}
            {filteredUsers.length === 0
              ? 0
              : startIndex + 1}{" "}
            to{" "}
            {Math.min(
              startIndex + USERS_PER_PAGE,
              filteredUsers.length
            )}{" "}
            of {filteredUsers.length} users
          </span>


          <div className="Users__pagination">

            <button
              className="Users__paginationArrow"
              disabled={safePage === 1}
              onClick={goPrevious}
            >
              <ChevronLeft size={16} />
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
                      ? "Users__page Users__page--active"
                      : "Users__page"
                  }
                  onClick={() =>
                    setCurrentPage(page)
                  }
                >
                  {page}
                </button>

              ))}

            <button
              className="Users__paginationArrow"
              disabled={safePage === totalPages}
              onClick={goNext}
            >
              <ChevronRight size={16} />
            </button>

          </div>

        </div>

      </section>


      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {(modalType === "add" ||
        modalType === "edit") && (

        <div
          className="Users__overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="Users__formModal">

            <div className="Users__modalHeader">

              <div>
                <span className="Users__modalEyebrow">
                  USER MANAGEMENT
                </span>

                <h2>
                  {modalType === "add"
                    ? "Add New User"
                    : "Edit User"}
                </h2>

                <p>
                  {modalType === "add"
                    ? "Create a new user account for your bookstore."
                    : "Update the user's account information."}
                </p>
              </div>

              <button
                className="Users__closeButton"
                onClick={closeModal}
              >
                <X size={19} />
              </button>

            </div>


            <form
              className="Users__form"
              onSubmit={
                modalType === "add"
                  ? handleAddUser
                  : handleUpdateUser
              }
            >

              <div className="Users__profileUpload">

                <div className="Users__largeAvatar">

                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                    />
                  ) : (
                    <UserRound size={38} />
                  )}

                </div>

                <div className="Users__uploadContent">

                  <strong>
                    Profile Picture
                  </strong>

                  <span>
                    JPG, PNG or WEBP. Maximum 5MB.
                  </span>

                  <button
                    type="button"
                    className="Users__uploadButton"
                    onClick={() =>
                      imageInputRef.current?.click()
                    }
                  >
                    <Upload size={15} />
                    {imagePreview
                      ? "Change Photo"
                      : "Upload Photo"}
                  </button>

                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    hidden
                  />

                  {formErrors.avatar && (
                    <small className="Users__error">
                      {formErrors.avatar}
                    </small>
                  )}

                </div>

              </div>


              <div className="Users__formGrid">

                <div className="Users__field">

                  <label>
                    Full Name <b>*</b>
                  </label>

                  <div className="Users__inputWrapper">

                    <UserRound size={16} />

                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                    />

                  </div>

                  {formErrors.name && (
                    <small className="Users__error">
                      {formErrors.name}
                    </small>
                  )}

                </div>


                <div className="Users__field">

                  <label>
                    Email Address <b>*</b>
                  </label>

                  <div className="Users__inputWrapper">

                    <Mail size={16} />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@email.com"
                    />

                  </div>

                  {formErrors.email && (
                    <small className="Users__error">
                      {formErrors.email}
                    </small>
                  )}

                </div>

              </div>


              <div className="Users__formGrid">

                <div className="Users__field">

                  <label>
                    Phone Number <b>*</b>
                  </label>

                  <div className="Users__inputWrapper">

                    <Phone size={16} />

                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                    />

                  </div>

                  {formErrors.phone && (
                    <small className="Users__error">
                      {formErrors.phone}
                    </small>
                  )}

                </div>


                <div className="Users__field">

                  <label>User Role</label>

                  <div className="Users__selectWrapper">

                    <Shield size={16} />

                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option>Customer</option>
                      <option>Editor</option>
                      <option>Admin</option>
                    </select>

                    <ChevronDown size={15} />

                  </div>

                </div>

              </div>


              <div className="Users__formGrid">

                <div className="Users__field">

                  <label>
                    Account Status
                  </label>

                  <div className="Users__selectWrapper">

                    {formData.status === "Active" ? (
                      <CircleCheck size={16} />
                    ) : (
                      <CircleX size={16} />
                    )}

                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>

                    <ChevronDown size={15} />

                  </div>

                </div>


                <div className="Users__field">

                  <label>Address</label>

                  <div className="Users__inputWrapper">

                    <MapPin size={16} />

                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="City, State"
                    />

                  </div>

                </div>

              </div>


              <div className="Users__formFooter">

                <button
                  type="button"
                  className="Users__cancelButton"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="Users__saveButton"
                >
                  <Check size={17} />

                  {modalType === "add"
                    ? "Create User"
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* =====================================================
          PREMIUM VIEW USER MODAL
      ===================================================== */}

      {modalType === "view" &&
        selectedUser && (

        <div
          className="Users__overlay Users__overlay--view"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="Users__viewModal">

            {/* VIEW HEADER */}

            <div className="Users__viewHeader">

              <div className="Users__viewHeaderText">

                <span className="Users__modalEyebrow">
                  USER PROFILE
                </span>

                <h2>
                  User Details
                </h2>

                <p>
                  Complete information about this user.
                </p>

              </div>

              <button
                className="Users__viewClose"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>


            {/* VIEW CONTENT */}

            <div className="Users__viewBody">

              {/* PROFILE HERO */}

              <div className="Users__profileHero">

                <div className="Users__viewAvatar">

                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                  />

                  <span
                    className={`Users__online ${
                      selectedUser.status ===
                      "Active"
                        ? "Users__online--active"
                        : "Users__online--inactive"
                    }`}
                  />

                </div>


                <div className="Users__profileHeroInfo">

                  <div className="Users__profileNameRow">

                    <h3>
                      {selectedUser.name}
                    </h3>

                    <span
                      className={`Users__role Users__role--${selectedUser.role.toLowerCase()}`}
                    >
                      {selectedUser.role}
                    </span>

                  </div>


                  <div className="Users__profileEmail">
                    <Mail size={13} />
                    <span>
                      {selectedUser.email}
                    </span>
                  </div>


                  <span
                    className={`Users__viewStatus ${
                      selectedUser.status ===
                      "Active"
                        ? "Users__viewStatus--active"
                        : "Users__viewStatus--inactive"
                    }`}
                  >

                    {selectedUser.status ===
                    "Active" ? (
                      <CircleCheck size={14} />
                    ) : (
                      <CircleX size={14} />
                    )}

                    {selectedUser.status}

                  </span>

                </div>

              </div>


              {/* DETAILS */}

              <div className="Users__detailsGrid">

                <div className="Users__detailCard">

                  <div className="Users__detailIcon">
                    <Mail size={18} />
                  </div>

                  <div className="Users__detailText">

                    <span>
                      Email Address
                    </span>

                    <strong>
                      {selectedUser.email}
                    </strong>

                  </div>

                </div>


                <div className="Users__detailCard">

                  <div className="Users__detailIcon">
                    <Phone size={18} />
                  </div>

                  <div className="Users__detailText">

                    <span>
                      Phone Number
                    </span>

                    <strong>
                      {selectedUser.phone}
                    </strong>

                  </div>

                </div>


                <div className="Users__detailCard">

                  <div className="Users__detailIcon">
                    <CalendarDays size={18} />
                  </div>

                  <div className="Users__detailText">

                    <span>
                      Joined Date
                    </span>

                    <strong>
                      {selectedUser.joinedDate}
                    </strong>

                  </div>

                </div>


                <div className="Users__detailCard">

                  <div className="Users__detailIcon">
                    <Shield size={18} />
                  </div>

                  <div className="Users__detailText">

                    <span>
                      Account Role
                    </span>

                    <strong>
                      {selectedUser.role}
                    </strong>

                  </div>

                </div>


                <div className="Users__detailCard">

                  <div className="Users__detailIcon">
                    <UsersIcon size={18} />
                  </div>

                  <div className="Users__detailText">

                    <span>
                      Total Orders
                    </span>

                    <strong>
                      {selectedUser.orders}
                    </strong>

                  </div>

                </div>


                <div className="Users__detailCard">

                  <div className="Users__detailIcon">
                    <MapPin size={18} />
                  </div>

                  <div className="Users__detailText">

                    <span>
                      Location
                    </span>

                    <strong>
                      {selectedUser.address ||
                        "Not provided"}
                    </strong>

                  </div>

                </div>

              </div>

            </div>


            {/* VIEW FOOTER */}

            <div className="Users__viewFooter">

              <button
                className="Users__cancelButton"
                onClick={closeModal}
              >
                Close
              </button>

              <button
                className="Users__saveButton Users__editViewButton"
                onClick={() =>
                  openEditModal(selectedUser)
                }
              >
                <Pencil size={16} />
                Edit User
              </button>

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {modalType === "delete" &&
        selectedUser && (

        <div
          className="Users__overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="Users__deleteModal">

            <div className="Users__deleteIcon">
              <AlertTriangle size={28} />
            </div>

            <h2>
              Delete User?
            </h2>

            <p>
              Are you sure you want to permanently
              delete{" "}
              <strong>
                {selectedUser.name}
              </strong>
              ?
              <br />
              This action cannot be undone.
            </p>

            <div className="Users__deleteActions">

              <button
                className="Users__cancelButton"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                className="Users__deleteConfirmButton"
                onClick={handleDeleteUser}
              >
                <Trash2 size={16} />
                Delete User
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Users;