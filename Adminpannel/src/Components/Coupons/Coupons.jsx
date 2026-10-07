import React, { useEffect, useMemo, useState } from "react";
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
  Tag,
  CheckCircle2,
  Clock3,
  Ban,
  Percent,
  CalendarDays,
  ShoppingCart,
  Hash,
  CircleDollarSign,
  Save,
  AlertTriangle,
  TicketPercent,
} from "lucide-react";

import "./Coupons.css";

const Coupons = () => {
  /* =========================================================
     INITIAL DATA
  ========================================================= */

  const initialCoupons = [
    {
      id: 1,
      code: "WELCOME10",
      title: "Welcome Discount",
      description: "Get 10% off on first order",
      discountType: "Percentage",
      discountValue: "10%",
      minimumOrder: 499,
      usageLimit: 1000,
      used: 245,
      startDate: "Sep 1, 2026",
      endDate: "Sep 30, 2026",
      status: "Active",
    },
    {
      id: 2,
      code: "BOOKLOVER",
      title: "Book Lover Special",
      description: "Flat ₹200 off on orders",
      discountType: "Fixed",
      discountValue: "₹200",
      minimumOrder: 999,
      usageLimit: 500,
      used: 132,
      startDate: "Sep 5, 2026",
      endDate: "Oct 5, 2026",
      status: "Active",
    },
    {
      id: 3,
      code: "FESTIVE20",
      title: "Festive Offer",
      description: "Get 20% off on all books",
      discountType: "Percentage",
      discountValue: "20%",
      minimumOrder: 799,
      usageLimit: 2000,
      used: 856,
      startDate: "Oct 1, 2026",
      endDate: "Oct 31, 2026",
      status: "Scheduled",
    },
    {
      id: 4,
      code: "STUDENT15",
      title: "Student Discount",
      description: "Get 15% off (student only)",
      discountType: "Percentage",
      discountValue: "15%",
      minimumOrder: 499,
      usageLimit: 1000,
      used: 410,
      startDate: "Aug 1, 2026",
      endDate: "Aug 31, 2026",
      status: "Active",
    },
    {
      id: 5,
      code: "FLAT50",
      title: "Flat 50 Off",
      description: "Flat ₹50 off on orders",
      discountType: "Fixed",
      discountValue: "₹50",
      minimumOrder: 299,
      usageLimit: 3000,
      used: 923,
      startDate: "Jul 10, 2026",
      endDate: "Aug 10, 2026",
      status: "Active",
    },
    {
      id: 6,
      code: "FREESHIP",
      title: "Free Shipping",
      description: "Free shipping on all orders",
      discountType: "Free Shipping",
      discountValue: "100%",
      minimumOrder: 0,
      usageLimit: "Unlimited",
      used: 1240,
      startDate: "Sep 1, 2026",
      endDate: "Dec 31, 2026",
      status: "Active",
    },
    {
      id: 7,
      code: "SUMMER25",
      title: "Summer Sale",
      description: "Get 25% off on all books",
      discountType: "Percentage",
      discountValue: "25%",
      minimumOrder: 999,
      usageLimit: 1500,
      used: 1500,
      startDate: "Jun 1, 2026",
      endDate: "Jun 30, 2026",
      status: "Expired",
    },
    {
      id: 8,
      code: "NEWUSER",
      title: "New User Offer",
      description: "Flat ₹100 off on first order",
      discountType: "Fixed",
      discountValue: "₹100",
      minimumOrder: 499,
      usageLimit: 1000,
      used: 1000,
      startDate: "May 1, 2026",
      endDate: "May 31, 2026",
      status: "Expired",
    },
    {
      id: 9,
      code: "READMORE",
      title: "Read More Offer",
      description: "Get 15% off on selected books",
      discountType: "Percentage",
      discountValue: "15%",
      minimumOrder: 599,
      usageLimit: 1200,
      used: 390,
      startDate: "Oct 5, 2026",
      endDate: "Nov 5, 2026",
      status: "Scheduled",
    },
    {
      id: 10,
      code: "BOOK100",
      title: "Book Savings",
      description: "Flat ₹100 off on orders",
      discountType: "Fixed",
      discountValue: "₹100",
      minimumOrder: 699,
      usageLimit: 800,
      used: 325,
      startDate: "Sep 10, 2026",
      endDate: "Oct 20, 2026",
      status: "Active",
    },
    {
      id: 11,
      code: "WEEKEND20",
      title: "Weekend Special",
      description: "20% discount on weekend orders",
      discountType: "Percentage",
      discountValue: "20%",
      minimumOrder: 799,
      usageLimit: 1000,
      used: 210,
      startDate: "Sep 12, 2026",
      endDate: "Oct 12, 2026",
      status: "Active",
    },
    {
      id: 12,
      code: "SHIPFREE",
      title: "Shipping Saver",
      description: "Free shipping on eligible orders",
      discountType: "Free Shipping",
      discountValue: "100%",
      minimumOrder: 999,
      usageLimit: "Unlimited",
      used: 560,
      startDate: "Sep 15, 2026",
      endDate: "Dec 15, 2026",
      status: "Active",
    },
  ];

  /* =========================================================
     STATES
  ========================================================= */

  const [coupons, setCoupons] = useState(initialCoupons);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [discountFilter, setDiscountFilter] =
    useState("All Discount Types");

  const [sortFilter, setSortFilter] =
    useState("Sort By: Latest");

  const [selectedCoupons, setSelectedCoupons] =
    useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [modalType, setModalType] = useState(null);

  const [selectedCoupon, setSelectedCoupon] =
    useState(null);

  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    discountType: "Percentage",
    discountValue: "",
    minimumOrder: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    status: "Active",
  });

  const ITEMS_PER_PAGE = 8;

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalCoupons = coupons.length;

  const activeCoupons = coupons.filter(
    (coupon) => coupon.status === "Active"
  ).length;

  const scheduledCoupons = coupons.filter(
    (coupon) => coupon.status === "Scheduled"
  ).length;

  const expiredCoupons = coupons.filter(
    (coupon) => coupon.status === "Expired"
  ).length;

  /* =========================================================
     FILTER + SEARCH
  ========================================================= */

  const filteredCoupons = useMemo(() => {
    let result = [...coupons];

    const search = searchTerm
      .trim()
      .toLowerCase();

    if (search) {
      result = result.filter(
        (coupon) =>
          coupon.code
            .toLowerCase()
            .includes(search) ||
          coupon.title
            .toLowerCase()
            .includes(search) ||
          coupon.description
            .toLowerCase()
            .includes(search)
      );
    }

    if (statusFilter !== "All Status") {
      result = result.filter(
        (coupon) =>
          coupon.status === statusFilter
      );
    }

    if (
      discountFilter !==
      "All Discount Types"
    ) {
      result = result.filter(
        (coupon) =>
          coupon.discountType ===
          discountFilter
      );
    }

    if (sortFilter === "Sort By: A-Z") {
      result.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    if (
      sortFilter === "Sort By: Discount"
    ) {
      result.sort(
        (a, b) =>
          parseInt(b.discountValue) -
          parseInt(a.discountValue)
      );
    }

    if (sortFilter === "Sort By: Latest") {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [
    coupons,
    searchTerm,
    statusFilter,
    discountFilter,
    sortFilter,
  ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCoupons.length /
        ITEMS_PER_PAGE
    )
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex =
    (currentPage - 1) *
    ITEMS_PER_PAGE;

  const currentCoupons =
    filteredCoupons.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

  /* =========================================================
     SELECT ALL
  ========================================================= */

  const currentCouponIds =
    currentCoupons.map(
      (coupon) => coupon.id
    );

  const allCurrentSelected =
    currentCouponIds.length > 0 &&
    currentCouponIds.every((id) =>
      selectedCoupons.includes(id)
    );

  const someCurrentSelected =
    currentCouponIds.some((id) =>
      selectedCoupons.includes(id)
    ) && !allCurrentSelected;

  const handleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedCoupons((previous) =>
        previous.filter(
          (id) =>
            !currentCouponIds.includes(id)
        )
      );
    } else {
      setSelectedCoupons((previous) => [
        ...new Set([
          ...previous,
          ...currentCouponIds,
        ]),
      ]);
    }
  };

  const handleSelectCoupon = (id) => {
    setSelectedCoupons((previous) =>
      previous.includes(id)
        ? previous.filter(
            (couponId) =>
              couponId !== id
          )
        : [...previous, id]
    );
  };

  /* =========================================================
     FORM RESET
  ========================================================= */

  const resetForm = () => {
    setFormData({
      code: "",
      title: "",
      description: "",
      discountType: "Percentage",
      discountValue: "",
      minimumOrder: "",
      usageLimit: "",
      startDate: "",
      endDate: "",
      status: "Active",
    });

    setFormErrors({});
  };

  /* =========================================================
     OPEN MODALS
  ========================================================= */

  const openAddModal = () => {
    resetForm();

    setSelectedCoupon(null);

    setModalType("add");
  };

  const openViewModal = (coupon) => {
    setSelectedCoupon(coupon);

    setModalType("view");
  };

  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon);

    setFormData({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      discountType:
        coupon.discountType,
      discountValue:
        coupon.discountValue,
      minimumOrder:
        coupon.minimumOrder === 0
          ? "0"
          : coupon.minimumOrder,
      usageLimit:
        coupon.usageLimit,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      status: coupon.status,
    });

    setFormErrors({});

    setModalType("edit");
  };

  const openDeleteModal = (coupon) => {
    setSelectedCoupon(coupon);

    setModalType("delete");
  };

  const closeModal = () => {
    setModalType(null);

    setSelectedCoupon(null);

    resetForm();
  };

  /* =========================================================
     FORM INPUT
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
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const errors = {};

    if (!formData.code.trim()) {
      errors.code =
        "Coupon code is required.";
    }

    if (!formData.title.trim()) {
      errors.title =
        "Coupon title is required.";
    }

    if (!formData.description.trim()) {
      errors.description =
        "Description is required.";
    }

    if (!formData.discountValue.trim()) {
      errors.discountValue =
        "Discount value is required.";
    }

    if (
      formData.minimumOrder === "" ||
      Number(formData.minimumOrder) < 0
    ) {
      errors.minimumOrder =
        "Enter a valid minimum order.";
    }

    if (!formData.usageLimit) {
      errors.usageLimit =
        "Usage limit is required.";
    }

    if (!formData.startDate) {
      errors.startDate =
        "Start date is required.";
    }

    if (!formData.endDate) {
      errors.endDate =
        "End date is required.";
    }

    setFormErrors(errors);

    return (
      Object.keys(errors).length === 0
    );
  };

  /* =========================================================
     ADD COUPON
  ========================================================= */

  const handleAddCoupon = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const newCoupon = {
      id: Date.now(),

      code:
        formData.code
          .trim()
          .toUpperCase(),

      title:
        formData.title.trim(),

      description:
        formData.description.trim(),

      discountType:
        formData.discountType,

      discountValue:
        formData.discountValue,

      minimumOrder:
        Number(formData.minimumOrder),

      usageLimit:
        formData.usageLimit ===
        "Unlimited"
          ? "Unlimited"
          : Number(formData.usageLimit),

      used: 0,

      startDate:
        formData.startDate,

      endDate:
        formData.endDate,

      status:
        formData.status,
    };

    setCoupons((previous) => [
      newCoupon,
      ...previous,
    ]);

    setCurrentPage(1);

    closeModal();
  };

  /* =========================================================
     UPDATE COUPON
  ========================================================= */

  const handleUpdateCoupon = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setCoupons((previous) =>
      previous.map((coupon) =>
        coupon.id ===
        selectedCoupon.id
          ? {
              ...coupon,

              code:
                formData.code
                  .trim()
                  .toUpperCase(),

              title:
                formData.title.trim(),

              description:
                formData.description.trim(),

              discountType:
                formData.discountType,

              discountValue:
                formData.discountValue,

              minimumOrder:
                Number(
                  formData.minimumOrder
                ),

              usageLimit:
                formData.usageLimit ===
                "Unlimited"
                  ? "Unlimited"
                  : Number(
                      formData.usageLimit
                    ),

              startDate:
                formData.startDate,

              endDate:
                formData.endDate,

              status:
                formData.status,
            }
          : coupon
      )
    );

    closeModal();
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDeleteCoupon = () => {
    if (!selectedCoupon) return;

    setCoupons((previous) =>
      previous.filter(
        (coupon) =>
          coupon.id !==
          selectedCoupon.id
      )
    );

    setSelectedCoupons((previous) =>
      previous.filter(
        (id) =>
          id !== selectedCoupon.id
      )
    );

    closeModal();
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const updateStatus = (
    coupon,
    newStatus
  ) => {
    setCoupons((previous) =>
      previous.map((item) =>
        item.id === coupon.id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );

    if (
      selectedCoupon &&
      selectedCoupon.id === coupon.id
    ) {
      setSelectedCoupon({
        ...coupon,
        status: newStatus,
      });
    }
  };

  const handleStatusClick = (
    coupon
  ) => {
    if (coupon.status === "Active") {
      updateStatus(
        coupon,
        "Expired"
      );
    } else if (
      coupon.status === "Expired"
    ) {
      updateStatus(
        coupon,
        "Scheduled"
      );
    } else {
      updateStatus(
        coupon,
        "Active"
      );
    }
  };

  /* =========================================================
     EXPORT
  ========================================================= */

  const handleExport = () => {
    const headers = [
      "ID",
      "Coupon Code",
      "Title",
      "Discount Type",
      "Discount Value",
      "Minimum Order",
      "Usage Limit",
      "Used",
      "Validity Period",
      "Status",
    ];

    const rows = coupons.map(
      (coupon) => [
        coupon.id,
        coupon.code,
        coupon.title,
        coupon.discountType,
        coupon.discountValue,
        coupon.minimumOrder,
        coupon.usageLimit,
        coupon.used,
        `${coupon.startDate} - ${coupon.endDate}`,
        coupon.status,
      ]
    );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value
              ).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "coupons.csv";

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  /* =========================================================
     PROGRESS
  ========================================================= */

  const getUsagePercentage = (
    coupon
  ) => {
    if (
      coupon.usageLimit ===
      "Unlimited"
    ) {
      return 35;
    }

    if (
      Number(coupon.usageLimit) ===
      0
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (coupon.used /
          Number(
            coupon.usageLimit
          )) *
          100
      )
    );
  };

  /* =========================================================
     DISCOUNT CLASS
  ========================================================= */

  const getDiscountClass = (
    type
  ) => {
    if (type === "Fixed") {
      return "Coupons__discount--fixed";
    }

    if (
      type === "Free Shipping"
    ) {
      return "Coupons__discount--shipping";
    }

    return "Coupons__discount--percentage";
  };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setSearchTerm("");

    setStatusFilter(
      "All Status"
    );

    setDiscountFilter(
      "All Discount Types"
    );

    setSortFilter(
      "Sort By: Latest"
    );

    setCurrentPage(1);
  };

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="Coupons">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="Coupons__header">

        <div className="Coupons__heading">

          <h1 className="Coupons__title">
            Coupons
          </h1>

          <p className="Coupons__subtitle">
            Create and manage discount
            coupons for your book store.
          </p>

        </div>

        <div className="Coupons__headerRight">

          <div className="Coupons__breadcrumb">

            <span>
              Dashboard
            </span>

            <span>
              ›
            </span>

            <strong>
              Coupons
            </strong>

          </div>

          <button
            className="Coupons__addButton"
            onClick={openAddModal}
          >
            <Plus size={19} />
            Add Coupon
          </button>

        </div>

      </section>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="Coupons__stats">

        <div className="Coupons__statCard Coupons__statCard--blue">

          <div className="Coupons__statIcon">
            <Tag size={25} />
          </div>

          <div className="Coupons__statContent">

            <span>
              Total Coupons
            </span>

            <strong>
              {totalCoupons}
            </strong>

          </div>

          <Tag className="Coupons__statWatermark" />

        </div>


        <div className="Coupons__statCard Coupons__statCard--green">

          <div className="Coupons__statIcon">
            <CheckCircle2 size={25} />
          </div>

          <div className="Coupons__statContent">

            <span>
              Active Coupons
            </span>

            <strong>
              {activeCoupons}
            </strong>

          </div>

          <Tag className="Coupons__statWatermark" />

        </div>


        <div className="Coupons__statCard Coupons__statCard--orange">

          <div className="Coupons__statIcon">
            <Clock3 size={25} />
          </div>

          <div className="Coupons__statContent">

            <span>
              Scheduled Coupons
            </span>

            <strong>
              {scheduledCoupons}
            </strong>

          </div>

          <Tag className="Coupons__statWatermark" />

        </div>


        <div className="Coupons__statCard Coupons__statCard--red">

          <div className="Coupons__statIcon">
            <Ban size={25} />
          </div>

          <div className="Coupons__statContent">

            <span>
              Expired Coupons
            </span>

            <strong>
              {expiredCoupons}
            </strong>

          </div>

          <Tag className="Coupons__statWatermark" />

        </div>

      </section>


      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <section className="Coupons__toolbar">

        <div className="Coupons__filters">

          <div className="Coupons__search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search coupons by code, title..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(
                  event.target.value
                );

                setCurrentPage(1);
              }}
            />

            {searchTerm && (
              <button
                className="Coupons__clearSearch"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                <X size={14} />
              </button>
            )}

          </div>


          <div className="Coupons__select">

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
                Active
              </option>

              <option>
                Scheduled
              </option>

              <option>
                Expired
              </option>
            </select>

            <ChevronDown size={16} />

          </div>


          <div className="Coupons__select Coupons__select--discount">

            <select
              value={discountFilter}
              onChange={(event) => {
                setDiscountFilter(
                  event.target.value
                );

                setCurrentPage(1);
              }}
            >
              <option>
                All Discount Types
              </option>

              <option>
                Percentage
              </option>

              <option>
                Fixed
              </option>

              <option>
                Free Shipping
              </option>
            </select>

            <ChevronDown size={16} />

          </div>


          <div className="Coupons__select Coupons__select--sort">

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
                Sort By: Discount
              </option>
            </select>

            <ChevronDown size={16} />

          </div>

        </div>


        <div className="Coupons__toolbarRight">

          {selectedCoupons.length >
            0 && (
            <div className="Coupons__selected">

              <CheckCircle2
                size={15}
              />

              <span>
                {selectedCoupons.length}
                {" "}selected
              </span>

              <button
                onClick={() =>
                  setSelectedCoupons(
                    []
                  )
                }
              >
                <X size={13} />
              </button>

            </div>
          )}

          <button
            className="Coupons__exportButton"
            onClick={handleExport}
          >
            <Download size={17} />
            Export Excel
          </button>

        </div>

      </section>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <section className="Coupons__tableCard">

        <div className="Coupons__tableWrapper">

          <table className="Coupons__table">

            <thead>

              <tr>

                <th>

                  <input
                    type="checkbox"
                    checked={
                      allCurrentSelected
                    }
                    ref={(element) => {
                      if (element) {
                        element.indeterminate =
                          someCurrentSelected;
                      }
                    }}
                    onChange={
                      handleSelectAll
                    }
                  />

                </th>

                <th>#</th>

                <th>
                  Coupon Code
                </th>

                <th>
                  Title
                </th>

                <th>
                  Discount Type
                </th>

                <th>
                  Discount Value
                </th>

                <th>
                  Minimum Order
                </th>

                <th>
                  Usage Limit
                </th>

                <th>
                  Used
                </th>

                <th>
                  Validity Period
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

              {currentCoupons.length >
              0 ? (
                currentCoupons.map(
                  (coupon, index) => {

                    const percentage =
                      getUsagePercentage(
                        coupon
                      );

                    return (
                      <tr
                        key={
                          coupon.id
                        }
                        className={
                          selectedCoupons.includes(
                            coupon.id
                          )
                            ? "Coupons__rowSelected"
                            : ""
                        }
                      >

                        <td>

                          <input
                            type="checkbox"
                            checked={selectedCoupons.includes(
                              coupon.id
                            )}
                            onChange={() =>
                              handleSelectCoupon(
                                coupon.id
                              )
                            }
                          />

                        </td>


                        <td>

                          <span className="Coupons__number">
                            {startIndex +
                              index +
                              1}
                          </span>

                        </td>


                        <td>

                          <span className="Coupons__code">
                            {
                              coupon.code
                            }
                          </span>

                        </td>


                        <td>

                          <div className="Coupons__titleCell">

                            <strong>
                              {
                                coupon.title
                              }
                            </strong>

                            <span>
                              {
                                coupon.description
                              }
                            </span>

                          </div>

                        </td>


                        <td>

                          <span
                            className={`Coupons__discount ${getDiscountClass(
                              coupon.discountType
                            )}`}
                          >
                            {
                              coupon.discountType
                            }
                          </span>

                        </td>


                        <td>

                          <strong className="Coupons__discountValue">
                            {
                              coupon.discountValue
                            }
                          </strong>

                        </td>


                        <td>

                          <span className="Coupons__minimumOrder">
                            {coupon.minimumOrder ===
                            0
                              ? "₹0"
                              : `₹${coupon.minimumOrder.toLocaleString()}`}
                          </span>

                        </td>


                        <td>

                          <span className="Coupons__usageLimit">
                            {
                              coupon.usageLimit
                            }
                          </span>

                        </td>


                        <td>

                          <div className="Coupons__usage">

                            <div className="Coupons__usageTop">

                              <strong>
                                {
                                  coupon.used
                                }
                              </strong>

                              <span>
                                {
                                  coupon.usageLimit ===
                                  "Unlimited"
                                    ? ""
                                    : `${percentage}%`}
                              </span>

                            </div>

                            <div className="Coupons__usageBar">

                              <span
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>


                        <td>

                          <span className="Coupons__validity">

                            {
                              coupon.startDate
                            }

                            <span>
                              -
                            </span>

                            {
                              coupon.endDate
                            }

                          </span>

                        </td>


                        <td>

                          <button
                            className={`Coupons__status Coupons__status--${coupon.status.toLowerCase()}`}
                            onClick={() =>
                              handleStatusClick(
                                coupon
                              )
                            }
                          >

                            {coupon.status ===
                              "Active" && (
                              <CheckCircle2
                                size={
                                  13
                                }
                              />
                            )}

                            {coupon.status ===
                              "Scheduled" && (
                              <Clock3
                                size={
                                  13
                                }
                              />
                            )}

                            {coupon.status ===
                              "Expired" && (
                              <Ban
                                size={
                                  13
                                }
                              />
                            )}

                            {
                              coupon.status
                            }

                          </button>

                        </td>


                        <td>

                          <div className="Coupons__actions">

                            <button
                              className="Coupons__action Coupons__action--view"
                              title="View Coupon"
                              onClick={() =>
                                openViewModal(
                                  coupon
                                )
                              }
                            >
                              <Eye
                                size={
                                  17
                                }
                              />
                            </button>


                            <button
                              className="Coupons__action Coupons__action--edit"
                              title="Edit Coupon"
                              onClick={() =>
                                openEditModal(
                                  coupon
                                )
                              }
                            >
                              <Pencil
                                size={
                                  17
                                }
                              />
                            </button>


                            <button
                              className="Coupons__action Coupons__action--delete"
                              title="Delete Coupon"
                              onClick={() =>
                                openDeleteModal(
                                  coupon
                                )
                              }
                            >
                              <Trash2
                                size={
                                  17
                                }
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )
              ) : (

                <tr>

                  <td
                    colSpan="12"
                    className="Coupons__empty"
                  >

                    <div className="Coupons__emptyContent">

                      <div className="Coupons__emptyIcon">
                        <TicketPercent
                          size={32}
                        />
                      </div>

                      <h3>
                        No coupons found
                      </h3>

                      <p>
                        Try changing your
                        search or filters.
                      </p>

                      <button
                        onClick={
                          clearFilters
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


        {/* ===================================================
            TABLE FOOTER
        =================================================== */}

        <div className="Coupons__tableFooter">

          <span className="Coupons__showing">

            Showing{" "}
            {filteredCoupons.length ===
            0
              ? 0
              : startIndex + 1}

            {" "}to{" "}

            {Math.min(
              startIndex +
                ITEMS_PER_PAGE,
              filteredCoupons.length
            )}

            {" "}of{" "}

            {
              filteredCoupons.length
            }

            {" "}coupons

          </span>


          <div className="Coupons__pagination">

            <button
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      1,
                      page - 1
                    )
                )
              }
            >
              <ChevronLeft
                size={17}
              />
            </button>


            {Array.from(
              {
                length:
                  totalPages,
              },
              (_, index) =>
                index + 1
            )
              .slice(0, 5)
              .map((page) => (

                <button
                  key={page}
                  className={
                    currentPage ===
                    page
                      ? "Coupons__page--active"
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


            {totalPages > 5 && (
              <span className="Coupons__dots">
                ...
              </span>
            )}


            <button
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      totalPages,
                      page + 1
                    )
                )
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
      ===================================================== */}

      {(modalType === "add" ||
        modalType === "edit") && (

        <div
          className="Coupons__overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="Coupons__formModal">

            <div className="Coupons__modalHeader">

              <div>

                <span className="Coupons__eyebrow">
                  COUPON MANAGEMENT
                </span>

                <h2>
                  {modalType ===
                  "add"
                    ? "Add New Coupon"
                    : "Edit Coupon"}
                </h2>

                <p>
                  {modalType ===
                  "add"
                    ? "Create a new discount coupon for your customers."
                    : "Update coupon information and settings."}
                </p>

              </div>

              <button
                className="Coupons__closeButton"
                onClick={
                  closeModal
                }
              >
                <X size={20} />
              </button>

            </div>


            <form
              className="Coupons__form"
              onSubmit={
                modalType ===
                "add"
                  ? handleAddCoupon
                  : handleUpdateCoupon
              }
            >

              <div className="Coupons__formGrid">

                <div className="Coupons__field">

                  <label>
                    Coupon Code *
                  </label>

                  <div className="Coupons__inputWrapper">

                    <Hash
                      size={17}
                    />

                    <input
                      name="code"
                      value={
                        formData.code
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="WELCOME10"
                    />

                  </div>

                  {formErrors.code && (
                    <small>
                      {
                        formErrors.code
                      }
                    </small>
                  )}

                </div>


                <div className="Coupons__field">

                  <label>
                    Coupon Title *
                  </label>

                  <div className="Coupons__inputWrapper">

                    <Tag
                      size={17}
                    />

                    <input
                      name="title"
                      value={
                        formData.title
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Welcome Discount"
                    />

                  </div>

                  {formErrors.title && (
                    <small>
                      {
                        formErrors.title
                      }
                    </small>
                  )}

                </div>

              </div>


              <div className="Coupons__field">

                <label>
                  Description *
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter coupon description..."
                  rows="3"
                />

                {formErrors.description && (
                  <small>
                    {
                      formErrors.description
                    }
                  </small>
                )}

              </div>


              <div className="Coupons__formGrid">

                <div className="Coupons__field">

                  <label>
                    Discount Type *
                  </label>

                  <div className="Coupons__selectWrapper">

                    <select
                      name="discountType"
                      value={
                        formData.discountType
                      }
                      onChange={
                        handleInputChange
                      }
                    >

                      <option>
                        Percentage
                      </option>

                      <option>
                        Fixed
                      </option>

                      <option>
                        Free Shipping
                      </option>

                    </select>

                    <ChevronDown
                      size={16}
                    />

                  </div>

                </div>


                <div className="Coupons__field">

                  <label>
                    Discount Value *
                  </label>

                  <div className="Coupons__inputWrapper">

                    {formData.discountType ===
                    "Percentage" ? (
                      <Percent
                        size={17}
                      />
                    ) : (
                      <CircleDollarSign
                        size={17}
                      />
                    )}

                    <input
                      name="discountValue"
                      value={
                        formData.discountValue
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder={
                        formData.discountType ===
                        "Percentage"
                          ? "10%"
                          : "₹200"
                      }
                    />

                  </div>

                  {formErrors.discountValue && (
                    <small>
                      {
                        formErrors.discountValue
                      }
                    </small>
                  )}

                </div>

              </div>


              <div className="Coupons__formGrid">

                <div className="Coupons__field">

                  <label>
                    Minimum Order
                  </label>

                  <div className="Coupons__inputWrapper">

                    <CircleDollarSign
                      size={17}
                    />

                    <input
                      type="number"
                      min="0"
                      name="minimumOrder"
                      value={
                        formData.minimumOrder
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="499"
                    />

                  </div>

                  {formErrors.minimumOrder && (
                    <small>
                      {
                        formErrors.minimumOrder
                      }
                    </small>
                  )}

                </div>


                <div className="Coupons__field">

                  <label>
                    Usage Limit
                  </label>

                  <div className="Coupons__inputWrapper">

                    <ShoppingCart
                      size={17}
                    />

                    <input
                      name="usageLimit"
                      value={
                        formData.usageLimit
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="1000 or Unlimited"
                    />

                  </div>

                  {formErrors.usageLimit && (
                    <small>
                      {
                        formErrors.usageLimit
                      }
                    </small>
                  )}

                </div>

              </div>


              <div className="Coupons__formGrid">

                <div className="Coupons__field">

                  <label>
                    Start Date *
                  </label>

                  <div className="Coupons__inputWrapper">

                    <CalendarDays
                      size={17}
                    />

                    <input
                      name="startDate"
                      value={
                        formData.startDate
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Sep 1, 2026"
                    />

                  </div>

                  {formErrors.startDate && (
                    <small>
                      {
                        formErrors.startDate
                      }
                    </small>
                  )}

                </div>


                <div className="Coupons__field">

                  <label>
                    End Date *
                  </label>

                  <div className="Coupons__inputWrapper">

                    <CalendarDays
                      size={17}
                    />

                    <input
                      name="endDate"
                      value={
                        formData.endDate
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Sep 30, 2026"
                    />

                  </div>

                  {formErrors.endDate && (
                    <small>
                      {
                        formErrors.endDate
                      }
                    </small>
                  )}

                </div>

              </div>


              <div className="Coupons__field">

                <label>
                  Status
                </label>

                <div className="Coupons__selectWrapper">

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
                      Active
                    </option>

                    <option>
                      Scheduled
                    </option>

                    <option>
                      Expired
                    </option>

                  </select>

                  <ChevronDown
                    size={16}
                  />

                </div>

              </div>


              <div className="Coupons__formFooter">

                <button
                  type="button"
                  className="Coupons__cancelButton"
                  onClick={
                    closeModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="Coupons__saveButton"
                >
                  <Save
                    size={17}
                  />

                  {modalType ===
                  "add"
                    ? "Create Coupon"
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      {modalType ===
        "view" &&
        selectedCoupon && (

        <div
          className="Coupons__overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="Coupons__viewModal">

            <div className="Coupons__modalHeader">

              <div>

                <span className="Coupons__eyebrow">
                  COUPON DETAILS
                </span>

                <h2>
                  Coupon Details
                </h2>

                <p>
                  Complete information
                  about this coupon.
                </p>

              </div>

              <button
                className="Coupons__closeButton"
                onClick={
                  closeModal
                }
              >
                <X size={20} />
              </button>

            </div>


            <div className="Coupons__viewBody">

              <div className="Coupons__couponHero">

                <div className="Coupons__couponIcon">

                  <TicketPercent
                    size={32}
                  />

                </div>

                <div className="Coupons__couponHeroInfo">

                  <span>
                    COUPON CODE
                  </span>

                  <h3>
                    {
                      selectedCoupon.code
                    }
                  </h3>

                  <p>
                    {
                      selectedCoupon.title
                    }
                  </p>

                </div>

                <button
                  className={`Coupons__status Coupons__status--${selectedCoupon.status.toLowerCase()}`}
                  onClick={() =>
                    handleStatusClick(
                      selectedCoupon
                    )
                  }
                >

                  {selectedCoupon.status ===
                    "Active" && (
                    <CheckCircle2
                      size={14}
                    />
                  )}

                  {selectedCoupon.status ===
                    "Scheduled" && (
                    <Clock3
                      size={14}
                    />
                  )}

                  {selectedCoupon.status ===
                    "Expired" && (
                    <Ban
                      size={14}
                    />
                  )}

                  {
                    selectedCoupon.status
                  }

                </button>

              </div>


              <div className="Coupons__detailGrid">

                <div className="Coupons__detailCard">

                  <div className="Coupons__detailIcon">
                    <Percent
                      size={19}
                    />
                  </div>

                  <span>
                    Discount
                  </span>

                  <strong>
                    {
                      selectedCoupon.discountValue
                    }
                  </strong>

                </div>


                <div className="Coupons__detailCard">

                  <div className="Coupons__detailIcon">
                    <CircleDollarSign
                      size={19}
                    />
                  </div>

                  <span>
                    Minimum Order
                  </span>

                  <strong>
                    {selectedCoupon.minimumOrder ===
                    0
                      ? "₹0"
                      : `₹${selectedCoupon.minimumOrder.toLocaleString()}`}
                  </strong>

                </div>


                <div className="Coupons__detailCard">

                  <div className="Coupons__detailIcon">
                    <ShoppingCart
                      size={19}
                    />
                  </div>

                  <span>
                    Usage
                  </span>

                  <strong>
                    {
                      selectedCoupon.used
                    }{" "}
                    /
                    {" "}
                    {
                      selectedCoupon.usageLimit
                    }
                  </strong>

                </div>


                <div className="Coupons__detailCard">

                  <div className="Coupons__detailIcon">
                    <CalendarDays
                      size={19}
                    />
                  </div>

                  <span>
                    Validity
                  </span>

                  <strong>
                    {
                      selectedCoupon.startDate
                    }
                    {" - "}
                    {
                      selectedCoupon.endDate
                    }
                  </strong>

                </div>

              </div>


              <div className="Coupons__viewDescription">

                <span>
                  DESCRIPTION
                </span>

                <p>
                  {
                    selectedCoupon.description
                  }
                </p>

              </div>


              <div className="Coupons__viewUsage">

                <div className="Coupons__viewUsageHeader">

                  <span>
                    Coupon Usage
                  </span>

                  <strong>
                    {
                      getUsagePercentage(
                        selectedCoupon
                      )
                    }
                    %
                  </strong>

                </div>

                <div className="Coupons__viewUsageBar">

                  <span
                    style={{
                      width: `${getUsagePercentage(
                        selectedCoupon
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>


            <div className="Coupons__viewFooter">

              <button
                className="Coupons__cancelButton"
                onClick={
                  closeModal
                }
              >
                Close
              </button>

              <button
                className="Coupons__saveButton"
                onClick={() =>
                  openEditModal(
                    selectedCoupon
                  )
                }
              >
                <Pencil
                  size={17}
                />
                Edit Coupon
              </button>

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {modalType ===
        "delete" &&
        selectedCoupon && (

        <div
          className="Coupons__overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="Coupons__deleteModal">

            <div className="Coupons__deleteIcon">
              <AlertTriangle
                size={30}
              />
            </div>

            <h2>
              Delete Coupon?
            </h2>

            <p>
              Are you sure you want
              to permanently delete{" "}
              <strong>
                {
                  selectedCoupon.code
                }
              </strong>
              ?
            </p>

            <div className="Coupons__deleteActions">

              <button
                className="Coupons__cancelButton"
                onClick={
                  closeModal
                }
              >
                Cancel
              </button>

              <button
                className="Coupons__deleteButton"
                onClick={
                  handleDeleteCoupon
                }
              >
                <Trash2
                  size={17}
                />
                Delete Coupon
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Coupons;