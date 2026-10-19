import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  IndianRupee,
  Save,
  AlertTriangle,
  TicketPercent,
  RefreshCw,
  Copy,
  Check,
  Lock,
  Infinity as InfinityIcon,
} from "lucide-react";

import API from "../../api/axios";
import "./Coupons.css";

/* =========================================================
   CONSTANTS & HELPERS
========================================================= */

const ITEMS_PER_PAGE = 8;

const CODE_PREFIX = "BK";
// No 0/O or 1/I so codes are easy to read and type
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DISCOUNT_PRESETS = [5, 10, 15, 20, 25, 30];
const MIN_PURCHASE_PRESETS = [0, 299, 499, 999, 1499];

const DISCOUNT_FILTERS = [
  "All Discounts",
  "Up to 10%",
  "11% to 20%",
  "Above 20%",
];

const randomChars = (length) => {
  let output = "";
  const cryptoObject =
    typeof window !== "undefined" ? window.crypto : null;

  if (cryptoObject && cryptoObject.getRandomValues) {
    const values = new Uint32Array(length);
    cryptoObject.getRandomValues(values);

    for (let i = 0; i < length; i += 1) {
      output += CODE_CHARS[values[i] % CODE_CHARS.length];
    }
  } else {
    for (let i = 0; i < length; i += 1) {
      output +=
        CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
  }

  return output;
};

// Generates a code that does not exist in the given list
const generateUniqueCode = (existingCodes) => {
  const taken = new Set(
    existingCodes.map((code) => code.toUpperCase())
  );

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const code = `${CODE_PREFIX}${randomChars(6)}`;
    if (!taken.has(code)) return code;
  }

  return `${CODE_PREFIX}${Date.now().toString(36).toUpperCase()}`;
};

const todayISO = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const formatDate = (iso) => {
  if (!iso) return "-";
  const [year, month, day] = iso.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
};

const computeStatus = (startDate, endDate) => {
  const today = todayISO();
  if (startDate > today) return "Scheduled";
  if (endDate < today) return "Expired";
  return "Active";
};

const formatRupees = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const matchesDiscount = (percent, filter) => {
  if (filter === "Up to 10%") return percent <= 10;
  if (filter === "11% to 20%") return percent > 10 && percent <= 20;
  if (filter === "Above 20%") return percent > 20;
  return true;
};

const getUsagePercentage = (coupon) => {
  if (coupon.usageLimit === "Unlimited") return null;
  if (Number(coupon.usageLimit) === 0) return 0;

  return Math.min(
    100,
    Math.round((coupon.used / Number(coupon.usageLimit)) * 100)
  );
};

const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    // fall through to the legacy method
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch (error) {
    return false;
  }
};

const createEmptyForm = (code = "") => ({
  code,
  title: "",
  description: "",
  discountPercent: "",
  minimumPurchase: "",
  usageLimit: "",
  unlimited: false,
  startDate: "",
  endDate: "",
  status: "Active",
});

const Coupons = () => {
  /* =========================================================
     STATES
  ========================================================= */

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [discountFilter, setDiscountFilter] = useState("All Discounts");
  const [sortFilter, setSortFilter] = useState("Sort By: Latest");

  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalType, setModalType] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState(createEmptyForm());

  const [copiedCode, setCopiedCode] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const toastTimer = useRef(null);
  const copyTimer = useRef(null);

  /* =========================================================
     TOAST
  ========================================================= */

  const showToast = (message, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);

    setToast({ show: true, message, type });

    toastTimer.current = setTimeout(() => {
      setToast((previous) => ({ ...previous, show: false }));
    }, 2600);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  /* =========================================================
     FETCH COUPONS FROM API
  ========================================================= */

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/coupons", { params: { limit: 100 } });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load coupons:", err);
      showToast("Failed to load coupons from server", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

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
     FILTER + SEARCH + SORT
  ========================================================= */

  const filteredCoupons = useMemo(() => {
    let result = [...coupons];

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter(
        (coupon) =>
          coupon.code.toLowerCase().includes(search) ||
          coupon.title.toLowerCase().includes(search) ||
          coupon.description.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== "All Status") {
      result = result.filter((coupon) => coupon.status === statusFilter);
    }

    if (discountFilter !== "All Discounts") {
      result = result.filter((coupon) =>
        matchesDiscount(coupon.discountPercent, discountFilter)
      );
    }

    if (sortFilter === "Sort By: A-Z") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortFilter === "Sort By: Discount") {
      result.sort((a, b) => b.discountPercent - a.discountPercent);
    } else {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [coupons, searchTerm, statusFilter, discountFilter, sortFilter]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentCoupons = filteredCoupons.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const pageStart = Math.max(
    1,
    Math.min(currentPage - 2, totalPages - 4)
  );
  const pageEnd = Math.min(totalPages, pageStart + 4);
  const pageNumbers = Array.from(
    { length: pageEnd - pageStart + 1 },
    (_, index) => pageStart + index
  );

  /* =========================================================
     SELECT ALL
  ========================================================= */

  const currentCouponIds = currentCoupons.map((coupon) => coupon.id);

  const allCurrentSelected =
    currentCouponIds.length > 0 &&
    currentCouponIds.every((id) => selectedCoupons.includes(id));

  const someCurrentSelected =
    currentCouponIds.some((id) => selectedCoupons.includes(id)) &&
    !allCurrentSelected;

  const handleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedCoupons((previous) =>
        previous.filter((id) => !currentCouponIds.includes(id))
      );
    } else {
      setSelectedCoupons((previous) => [
        ...new Set([...previous, ...currentCouponIds]),
      ]);
    }
  };

  const handleSelectCoupon = (id) => {
    setSelectedCoupons((previous) =>
      previous.includes(id)
        ? previous.filter((couponId) => couponId !== id)
        : [...previous, id]
    );
  };

  /* =========================================================
     MODALS
  ========================================================= */

  const resetForm = () => {
    setFormData(createEmptyForm());
    setFormErrors({});
  };

  const openAddModal = () => {
    setSelectedCoupon(null);
    setFormErrors({});
    setFormData(
      createEmptyForm(
        generateUniqueCode(coupons.map((coupon) => coupon.code))
      )
    );
    setModalType("add");
  };

  const openViewModal = (coupon) => {
    setSelectedCoupon(coupon);
    setModalType("view");
  };

  const openEditModal = (coupon) => {
    const isUnlimited = coupon.usageLimit === "Unlimited";

    setSelectedCoupon(coupon);

    setFormData({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      discountPercent: String(coupon.discountPercent),
      minimumPurchase: String(coupon.minimumPurchase),
      usageLimit: isUnlimited ? "" : String(coupon.usageLimit),
      unlimited: isUnlimited,
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

  useEffect(() => {
    if (!modalType) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalType]);

  /* =========================================================
     FORM INPUT
  ========================================================= */

  const clearError = (name) => {
    setFormErrors((previous) =>
      previous[name] ? { ...previous, [name]: "" } : previous
    );
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({ ...previous, [name]: value }));
    clearError(name);
  };

  const handleNumberChange = (event) => {
    const { name } = event.target;
    let value = event.target.value.replace(/\D/g, "");

    if (value !== "") value = String(Number(value));

    if (name === "discountPercent" && Number(value) > 100) {
      value = "100";
    }

    setFormData((previous) => ({ ...previous, [name]: value }));
    clearError(name);
  };

  const setNumberField = (name, value) => {
    setFormData((previous) => ({ ...previous, [name]: String(value) }));
    clearError(name);
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      const next = { ...previous, [name]: value };

      // Suggest a status from the chosen dates (can still be changed)
      if (next.startDate && next.endDate) {
        next.status = computeStatus(next.startDate, next.endDate);
      }

      return next;
    });

    clearError(name);
    clearError("endDate");
  };

  const toggleUnlimited = () => {
    setFormData((previous) => ({
      ...previous,
      unlimited: !previous.unlimited,
      usageLimit: "",
    }));
    clearError("usageLimit");
  };

  const regenerateCode = () => {
    setFormData((previous) => ({
      ...previous,
      code: generateUniqueCode(coupons.map((coupon) => coupon.code)),
    }));
    clearError("code");
  };

  const handleCopyCode = async (code) => {
    if (!code) return;

    const success = await copyToClipboard(code);

    if (success) {
      setCopiedCode(code);
      showToast(`Code ${code} copied`);

      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedCode(""), 1800);
    } else {
      showToast("Copy failed. Please copy the code manually.", "error");
    }
  };

  /* =========================================================
     LIVE PREVIEW
  ========================================================= */

  const preview = useMemo(() => {
    const percent = Number(formData.discountPercent) || 0;
    const minimum = Number(formData.minimumPurchase) || 0;
    const example = minimum > 0 ? minimum : 1000;
    const saving = Math.round((example * percent) / 100);

    return {
      percent,
      minimum,
      example,
      saving,
      pay: example - saving,
    };
  }, [formData.discountPercent, formData.minimumPurchase]);

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const errors = {};

    const code = formData.code.trim().toUpperCase();

    if (!code) {
      errors.code = "Coupon code is required.";
    } else {
      const duplicate = coupons.some(
        (coupon) =>
          coupon.code.toUpperCase() === code &&
          (!selectedCoupon || (coupon.id !== selectedCoupon.id && coupon._id !== selectedCoupon._id))
      );

      if (duplicate) {
        errors.code = "This code already exists. Generate a new one.";
      }
    }

    if (!formData.title.trim()) {
      errors.title = "Coupon title is required.";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required.";
    }

    const percent = Number(formData.discountPercent);

    if (formData.discountPercent === "" || percent < 1 || percent > 100) {
      errors.discountPercent = "Enter a percentage between 1 and 100.";
    }

    if (formData.minimumPurchase === "") {
      errors.minimumPurchase =
        "Enter the minimum purchase value (0 for no minimum).";
    }

    if (!formData.unlimited) {
      const limit = Number(formData.usageLimit);

      if (formData.usageLimit === "" || limit < 1) {
        errors.usageLimit = "Enter a limit of 1 or more, or choose unlimited.";
      } else if (selectedCoupon && limit < selectedCoupon.used) {
        errors.usageLimit = `Cannot be lower than the ${selectedCoupon.used} already used.`;
      }
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required.";
    }

    if (!formData.endDate) {
      errors.endDate = "End date is required.";
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      errors.endDate = "End date must be on or after the start date.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* =========================================================
     ADD / UPDATE
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = {
      code: formData.code.trim().toUpperCase(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      discountPercent: Number(formData.discountPercent),
      minimumPurchase: Number(formData.minimumPurchase),
      usageLimit: formData.unlimited
        ? "Unlimited"
        : Number(formData.usageLimit),
      unlimited: formData.unlimited,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
    };

    try {
      setIsSaving(true);
      if (modalType === "add") {
        await API.post("/coupons", payload);
        showToast(`Coupon ${payload.code} created successfully`);
        setCurrentPage(1);
      } else if (selectedCoupon) {
        const id = selectedCoupon.id || selectedCoupon._id;
        await API.put(`/coupons/${id}`, payload);
        showToast(`Coupon ${payload.code} updated successfully`);
      }

      await fetchCoupons();
      closeModal();
    } catch (err) {
      console.error("Coupon save error:", err);
      showToast(err.response?.data?.message || "Failed to save coupon", "error");
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;

    const id = selectedCoupon.id || selectedCoupon._id;
    const code = selectedCoupon.code;

    try {
      setIsSaving(true);
      await API.delete(`/coupons/${id}`);
      showToast(`Coupon ${code} deleted`);
      setSelectedCoupons((previous) =>
        previous.filter((couponId) => couponId !== id)
      );
      await fetchCoupons();
      closeModal();
    } catch (err) {
      console.error("Delete coupon error:", err);
      showToast(err.response?.data?.message || "Failed to delete coupon", "error");
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================================================
     BULK DELETE
  ========================================================= */

  const handleBulkDelete = async () => {
    if (selectedCoupons.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedCoupons.length} selected coupon(s)?`
      )
    )
      return;

    try {
      setIsSaving(true);
      await API.post("/coupons/bulk-delete", { ids: selectedCoupons });
      showToast(`${selectedCoupons.length} coupon(s) deleted successfully`);
      setSelectedCoupons([]);
      await fetchCoupons();
    } catch (err) {
      console.error("Bulk delete error:", err);
      showToast(err.response?.data?.message || "Failed to delete coupons", "error");
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const handleStatusClick = async (coupon) => {
    const id = coupon.id || coupon._id;
    let nextStatus = "Active";
    if (coupon.status === "Active") nextStatus = "Expired";
    else if (coupon.status === "Expired") nextStatus = "Scheduled";
    else nextStatus = "Active";

    try {
      await API.patch(`/coupons/${id}/status`, { status: nextStatus });
      setCoupons((previous) =>
        previous.map((item) =>
          item.id === id || item._id === id
            ? { ...item, status: nextStatus }
            : item
        )
      );

      if (
        selectedCoupon &&
        (selectedCoupon.id === id || selectedCoupon._id === id)
      ) {
        setSelectedCoupon({ ...coupon, status: nextStatus });
      }
      showToast(`Status changed to ${nextStatus}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast(err.response?.data?.message || "Failed to update status", "error");
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
      "Discount Percentage",
      "Minimum Purchase",
      "Usage Limit",
      "Used",
      "Start Date",
      "End Date",
      "Status",
    ];

    const rows = coupons.map((coupon) => [
      coupon.id,
      coupon.code,
      coupon.title,
      `${coupon.discountPercent}%`,
      coupon.minimumPurchase,
      coupon.usageLimit,
      coupon.used,
      coupon.startDate,
      coupon.endDate,
      coupon.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "coupons.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast("Coupons exported successfully");
  };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setDiscountFilter("All Discounts");
    setSortFilter("Sort By: Latest");
    setCurrentPage(1);
  };

  /* =========================================================
     SMALL RENDER HELPERS
  ========================================================= */

  const renderStatusIcon = (status, size) => {
    if (status === "Active") return <CheckCircle2 size={size} />;
    if (status === "Scheduled") return <Clock3 size={size} />;
    return <Ban size={size} />;
  };

  const renderMinimum = (value) =>
    value > 0 ? formatRupees(value) : "No minimum";

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="Coupons">
      {/* HEADER */}
      <section className="Coupons__header">
        <div className="Coupons__heading">
          <h1 className="Coupons__title">Coupons</h1>

          <p className="Coupons__subtitle">
            Create and manage discount coupons for your book store.
          </p>
        </div>

        <div className="Coupons__headerRight">
          <div className="Coupons__breadcrumb">
            <span>Dashboard</span>
            <span>›</span>
            <strong>Coupons</strong>
          </div>

          <button
            type="button"
            className="Coupons__addButton"
            onClick={openAddModal}
          >
            <Plus size={19} />
            Add Coupon
          </button>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="Coupons__stats">
        <div className="Coupons__statCard Coupons__statCard--blue">
          <div className="Coupons__statIcon">
            <Tag size={25} />
          </div>
          <div className="Coupons__statContent">
            <span>Total Coupons</span>
            <strong>{totalCoupons}</strong>
          </div>
          <Tag className="Coupons__statWatermark" />
        </div>

        <div className="Coupons__statCard Coupons__statCard--green">
          <div className="Coupons__statIcon">
            <CheckCircle2 size={25} />
          </div>
          <div className="Coupons__statContent">
            <span>Active Coupons</span>
            <strong>{activeCoupons}</strong>
          </div>
          <Tag className="Coupons__statWatermark" />
        </div>

        <div className="Coupons__statCard Coupons__statCard--orange">
          <div className="Coupons__statIcon">
            <Clock3 size={25} />
          </div>
          <div className="Coupons__statContent">
            <span>Scheduled Coupons</span>
            <strong>{scheduledCoupons}</strong>
          </div>
          <Tag className="Coupons__statWatermark" />
        </div>

        <div className="Coupons__statCard Coupons__statCard--red">
          <div className="Coupons__statIcon">
            <Ban size={25} />
          </div>
          <div className="Coupons__statContent">
            <span>Expired Coupons</span>
            <strong>{expiredCoupons}</strong>
          </div>
          <Tag className="Coupons__statWatermark" />
        </div>
      </section>

      {/* TOOLBAR */}
      <section className="Coupons__toolbar">
        <div className="Coupons__filters">
          <div className="Coupons__search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search coupons by code, title..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />

            {searchTerm && (
              <button
                type="button"
                className="Coupons__clearSearch"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="Coupons__select">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Scheduled</option>
              <option>Expired</option>
            </select>
            <ChevronDown size={16} />
          </div>

          <div className="Coupons__select Coupons__select--discount">
            <select
              value={discountFilter}
              onChange={(event) => {
                setDiscountFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              {DISCOUNT_FILTERS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>

          <div className="Coupons__select Coupons__select--sort">
            <select
              value={sortFilter}
              onChange={(event) => {
                setSortFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option>Sort By: Latest</option>
              <option>Sort By: A-Z</option>
              <option>Sort By: Discount</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="Coupons__toolbarRight">
          {selectedCoupons.length > 0 && (
            <>
              <div className="Coupons__selected">
                <CheckCircle2 size={15} />
                <span>{selectedCoupons.length} selected</span>
                <button
                  type="button"
                  onClick={() => setSelectedCoupons([])}
                  aria-label="Clear selection"
                >
                  <X size={13} />
                </button>
              </div>

              <button
                type="button"
                className="Coupons__exportButton"
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
            type="button"
            className="Coupons__exportButton"
            onClick={handleExport}
          >
            <Download size={17} />
            Export Excel
          </button>
        </div>
      </section>

      {/* TABLE */}
      <section className="Coupons__tableCard">
        <div className="Coupons__tableWrapper">
          <table className="Coupons__table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    ref={(element) => {
                      if (element) {
                        element.indeterminate = someCurrentSelected;
                      }
                    }}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>#</th>
                <th>Coupon Code</th>
                <th>Title</th>
                <th>Discount Percentage</th>
                <th>Minimum Purchase</th>
                <th>Usage Limit</th>
                <th>Used</th>
                <th>Validity Period</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="Coupons__empty">
                    <div className="Coupons__emptyContent">
                      <div className="Coupons__emptyIcon">
                        <RefreshCw size={30} className="Coupons__spin" />
                      </div>
                      <h3>Loading coupons...</h3>
                    </div>
                  </td>
                </tr>
              ) : currentCoupons.length > 0 ? (
                currentCoupons.map((coupon, index) => {
                  const percentage = getUsagePercentage(coupon);

                  return (
                    <tr
                      key={coupon.id}
                      className={
                        selectedCoupons.includes(coupon.id)
                          ? "Coupons__rowSelected"
                          : ""
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedCoupons.includes(coupon.id)}
                          onChange={() => handleSelectCoupon(coupon.id)}
                        />
                      </td>

                      <td>
                        <span className="Coupons__number">
                          {startIndex + index + 1}
                        </span>
                      </td>

                      <td>
                        <div className="Coupons__codeCell">
                          <span className="Coupons__code">{coupon.code}</span>

                          <button
                            type="button"
                            className="Coupons__copyMini"
                            title="Copy code"
                            aria-label={`Copy code ${coupon.code}`}
                            onClick={() => handleCopyCode(coupon.code)}
                          >
                            {copiedCode === coupon.code ? (
                              <Check size={13} />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </td>

                      <td>
                        <div className="Coupons__titleCell">
                          <strong>{coupon.title}</strong>
                          <span>{coupon.description}</span>
                        </div>
                      </td>

                      <td>
                        <span className="Coupons__discountBadge">
                          <Percent size={11} />
                          {coupon.discountPercent}% OFF
                        </span>
                      </td>

                      <td>
                        <span
                          className={`Coupons__minimumOrder ${
                            coupon.minimumPurchase === 0
                              ? "Coupons__minimumOrder--none"
                              : ""
                          }`}
                        >
                          {renderMinimum(coupon.minimumPurchase)}
                        </span>
                      </td>

                      <td>
                        <span className="Coupons__usageLimit">
                          {coupon.usageLimit === "Unlimited" ? (
                            <>
                              <InfinityIcon size={14} />
                              Unlimited
                            </>
                          ) : (
                            Number(coupon.usageLimit).toLocaleString("en-IN")
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="Coupons__usage">
                          <div className="Coupons__usageTop">
                            <strong>
                              {coupon.used.toLocaleString("en-IN")}
                            </strong>
                            <span>
                              {percentage === null ? "" : `${percentage}%`}
                            </span>
                          </div>

                          <div
                            className={`Coupons__usageBar ${
                              percentage === null
                                ? "Coupons__usageBar--unlimited"
                                : ""
                            }`}
                          >
                            <span
                              style={{
                                width:
                                  percentage === null
                                    ? "100%"
                                    : `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="Coupons__validity">
                          {formatDate(coupon.startDate)}
                          <span>-</span>
                          {formatDate(coupon.endDate)}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`Coupons__status Coupons__status--${coupon.status.toLowerCase()}`}
                          onClick={() => handleStatusClick(coupon)}
                          title="Click to change status"
                        >
                          {renderStatusIcon(coupon.status, 13)}
                          {coupon.status}
                        </button>
                      </td>

                      <td>
                        <div className="Coupons__actions">
                          <button
                            type="button"
                            className="Coupons__action Coupons__action--view"
                            title="View Coupon"
                            onClick={() => openViewModal(coupon)}
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            className="Coupons__action Coupons__action--edit"
                            title="Edit Coupon"
                            onClick={() => openEditModal(coupon)}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="Coupons__action Coupons__action--delete"
                            title="Delete Coupon"
                            onClick={() => openDeleteModal(coupon)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" className="Coupons__empty">
                    <div className="Coupons__emptyContent">
                      <div className="Coupons__emptyIcon">
                        <TicketPercent size={32} />
                      </div>

                      <h3>No coupons found</h3>

                      <p>Try changing your search or filters.</p>

                      <button type="button" onClick={clearFilters}>
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
        <div className="Coupons__tableFooter">
          <span className="Coupons__showing">
            Showing {filteredCoupons.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredCoupons.length)} of{" "}
            {filteredCoupons.length} coupons
          </span>

          <div className="Coupons__pagination">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={17} />
            </button>

            {pageStart > 1 && <span className="Coupons__dots">...</span>}

            {pageNumbers.map((page) => (
              <button
                type="button"
                key={page}
                className={currentPage === page ? "Coupons__page--active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            {pageEnd < totalPages && <span className="Coupons__dots">...</span>}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              aria-label="Next page"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* ADD / EDIT MODAL */}
      {(modalType === "add" || modalType === "edit") && (
        <div
          className="Coupons__overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            className="Coupons__formModal"
            role="dialog"
            aria-modal="true"
            aria-label={modalType === "add" ? "Add coupon" : "Edit coupon"}
          >
            <div className="Coupons__modalHeader">
              <div>
                <span className="Coupons__eyebrow">COUPON MANAGEMENT</span>

                <h2>{modalType === "add" ? "Add New Coupon" : "Edit Coupon"}</h2>

                <p>
                  {modalType === "add"
                    ? "Create a new discount coupon for your customers."
                    : "Update coupon information and settings."}
                </p>
              </div>

              <button
                type="button"
                className="Coupons__closeButton"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form className="Coupons__form" onSubmit={handleSubmit} noValidate>
              <div className="Coupons__formLayout">
                {/* FIELDS */}
                <div className="Coupons__formFields">
                  {/* CODE */}
                  <div className="Coupons__field">
                    <label>
                      Coupon Code
                      <em>
                        {modalType === "add" ? "Auto-generated" : "Locked"}
                      </em>
                    </label>

                    <div className="Coupons__codeRow">
                      <div className="Coupons__inputWrapper Coupons__inputWrapper--readonly Coupons__inputWrapper--code">
                        <Hash size={17} />

                        <input
                          name="code"
                          value={formData.code}
                          readOnly
                          aria-label="Coupon code"
                        />

                        {modalType === "edit" && <Lock size={14} />}
                      </div>

                      {modalType === "add" && (
                        <button
                          type="button"
                          className="Coupons__iconButton"
                          onClick={regenerateCode}
                          title="Generate a new code"
                          aria-label="Generate a new code"
                        >
                          <RefreshCw size={17} />
                        </button>
                      )}

                      <button
                        type="button"
                        className="Coupons__iconButton"
                        onClick={() => handleCopyCode(formData.code)}
                        title="Copy code"
                        aria-label="Copy code"
                      >
                        {copiedCode === formData.code ? (
                          <Check size={17} />
                        ) : (
                          <Copy size={17} />
                        )}
                      </button>
                    </div>

                    {formErrors.code ? (
                      <small className="Coupons__error">{formErrors.code}</small>
                    ) : (
                      <small className="Coupons__hint">
                        {modalType === "add"
                          ? "A unique code is created for you. Tap refresh for another."
                          : "Codes can't be changed after a coupon is created."}
                      </small>
                    )}
                  </div>

                  {/* TITLE */}
                  <div className="Coupons__field">
                    <label>Coupon Title *</label>

                    <div className="Coupons__inputWrapper">
                      <Tag size={17} />

                      <input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Welcome Discount"
                      />
                    </div>

                    {formErrors.title && (
                      <small className="Coupons__error">{formErrors.title}</small>
                    )}
                  </div>

                  {/* DESCRIPTION */}
                  <div className="Coupons__field">
                    <label>Description *</label>

                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter coupon description..."
                      rows="3"
                    />

                    {formErrors.description && (
                      <small className="Coupons__error">
                        {formErrors.description}
                      </small>
                    )}
                  </div>

                  {/* DISCOUNT PERCENTAGE */}
                  <div className="Coupons__field">
                    <label>Discount Percentage *</label>

                    <div className="Coupons__inputWrapper">
                      <Percent size={17} />

                      <input
                        name="discountPercent"
                        value={formData.discountPercent}
                        onChange={handleNumberChange}
                        inputMode="numeric"
                        placeholder="e.g. 15"
                        maxLength={3}
                      />

                      <span className="Coupons__suffix">%</span>
                    </div>

                    <div className="Coupons__chips">
                      {DISCOUNT_PRESETS.map((value) => (
                        <button
                          type="button"
                          key={value}
                          className={`Coupons__chip ${
                            Number(formData.discountPercent) === value
                              ? "Coupons__chip--active"
                              : ""
                          }`}
                          onClick={() => setNumberField("discountPercent", value)}
                        >
                          {value}%
                        </button>
                      ))}
                    </div>

                    {formErrors.discountPercent && (
                      <small className="Coupons__error">
                        {formErrors.discountPercent}
                      </small>
                    )}
                  </div>

                  {/* MINIMUM PURCHASE */}
                  <div className="Coupons__field">
                    <label>Minimum Purchase Value *</label>

                    <div className="Coupons__inputWrapper">
                      <IndianRupee size={17} />

                      <input
                        name="minimumPurchase"
                        value={formData.minimumPurchase}
                        onChange={handleNumberChange}
                        inputMode="numeric"
                        placeholder="e.g. 499"
                      />
                    </div>

                    <div className="Coupons__chips">
                      {MIN_PURCHASE_PRESETS.map((value) => (
                        <button
                          type="button"
                          key={value}
                          className={`Coupons__chip ${
                            formData.minimumPurchase !== "" &&
                            Number(formData.minimumPurchase) === value
                              ? "Coupons__chip--active"
                              : ""
                          }`}
                          onClick={() => setNumberField("minimumPurchase", value)}
                        >
                          {value === 0 ? "No minimum" : formatRupees(value)}
                        </button>
                      ))}
                    </div>

                    {formErrors.minimumPurchase ? (
                      <small className="Coupons__error">
                        {formErrors.minimumPurchase}
                      </small>
                    ) : (
                      <small className="Coupons__hint">
                        The coupon works only when the cart total reaches this
                        amount.
                      </small>
                    )}
                  </div>

                  {/* USAGE LIMIT */}
                  <div className="Coupons__field">
                    <label>Usage Limit *</label>

                    <div
                      className={`Coupons__inputWrapper ${
                        formData.unlimited ? "Coupons__inputWrapper--disabled" : ""
                      }`}
                    >
                      <ShoppingCart size={17} />

                      <input
                        name="usageLimit"
                        value={formData.unlimited ? "" : formData.usageLimit}
                        onChange={handleNumberChange}
                        inputMode="numeric"
                        placeholder={
                          formData.unlimited
                            ? "Unlimited uses"
                            : "e.g. 1000 uses"
                        }
                        disabled={formData.unlimited}
                      />
                    </div>

                    <button
                      type="button"
                      className="Coupons__switchRow"
                      role="switch"
                      aria-checked={formData.unlimited}
                      onClick={toggleUnlimited}
                    >
                      <span
                        className={`Coupons__switch ${
                          formData.unlimited ? "Coupons__switch--on" : ""
                        }`}
                      >
                        <span />
                      </span>
                      Unlimited uses
                    </button>

                    {formErrors.usageLimit && (
                      <small className="Coupons__error">
                        {formErrors.usageLimit}
                      </small>
                    )}
                  </div>

                  {/* DATES */}
                  <div className="Coupons__formGrid">
                    <div className="Coupons__field">
                      <label>Start Date *</label>

                      <div className="Coupons__inputWrapper">
                        <CalendarDays size={17} />

                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleDateChange}
                        />
                      </div>

                      {formErrors.startDate && (
                        <small className="Coupons__error">
                          {formErrors.startDate}
                        </small>
                      )}
                    </div>

                    <div className="Coupons__field">
                      <label>End Date *</label>

                      <div className="Coupons__inputWrapper">
                        <CalendarDays size={17} />

                        <input
                          type="date"
                          name="endDate"
                          min={formData.startDate || undefined}
                          value={formData.endDate}
                          onChange={handleDateChange}
                        />
                      </div>

                      {formErrors.endDate && (
                        <small className="Coupons__error">
                          {formErrors.endDate}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="Coupons__field">
                    <label>Status</label>

                    <div className="Coupons__selectWrapper">
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option>Active</option>
                        <option>Scheduled</option>
                        <option>Expired</option>
                      </select>

                      <ChevronDown size={16} />
                    </div>

                    <small className="Coupons__hint">
                      Suggested automatically from the dates. You can change it.
                    </small>
                  </div>
                </div>

                {/* LIVE PREVIEW */}
                <aside className="Coupons__preview">
                  <span className="Coupons__previewLabel">Live preview</span>

                  <div className="Coupons__ticket">
                    <div className="Coupons__ticketTop">
                      <TicketPercent size={20} />
                      <span>{formData.title.trim() || "Coupon title"}</span>
                    </div>

                    <div className="Coupons__ticketDiscount">
                      <strong>{preview.percent}%</strong>
                      <span>OFF</span>
                    </div>

                    <p className="Coupons__ticketRule">
                      {preview.minimum > 0
                        ? `On orders of ${formatRupees(preview.minimum)} or more`
                        : "No minimum purchase needed"}
                    </p>

                    <div className="Coupons__ticketDivider" />

                    <div className="Coupons__ticketCode">
                      {formData.code || "-"}
                    </div>

                    <p className="Coupons__ticketMeta">
                      {formData.startDate && formData.endDate
                        ? `Valid ${formatDate(formData.startDate)} - ${formatDate(
                            formData.endDate
                          )}`
                        : "Choose the validity dates"}
                    </p>
                  </div>

                  {preview.percent > 0 && (
                    <div className="Coupons__example">
                      <span>Example</span>
                      <p>
                        On a <strong>{formatRupees(preview.example)}</strong>{" "}
                        order the customer saves{" "}
                        <strong>{formatRupees(preview.saving)}</strong> and pays{" "}
                        <strong>{formatRupees(preview.pay)}</strong>.
                      </p>
                    </div>
                  )}
                </aside>
              </div>

              <div className="Coupons__formFooter">
                <button
                  type="button"
                  className="Coupons__cancelButton"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="Coupons__saveButton">
                  <Save size={17} />
                  {modalType === "add" ? "Create Coupon" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {modalType === "view" && selectedCoupon && (
        <div
          className="Coupons__overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            className="Coupons__viewModal"
            role="dialog"
            aria-modal="true"
            aria-label="Coupon details"
          >
            <div className="Coupons__modalHeader">
              <div>
                <span className="Coupons__eyebrow">COUPON DETAILS</span>

                <h2>Coupon Details</h2>

                <p>Complete information about this coupon.</p>
              </div>

              <button
                type="button"
                className="Coupons__closeButton"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="Coupons__viewBody">
              <div className="Coupons__couponHero">
                <div className="Coupons__couponIcon">
                  <TicketPercent size={32} />
                </div>

                <div className="Coupons__couponHeroInfo">
                  <span>COUPON CODE</span>

                  <h3>
                    {selectedCoupon.code}
                    <button
                      type="button"
                      className="Coupons__copyMini"
                      title="Copy code"
                      aria-label="Copy code"
                      onClick={() => handleCopyCode(selectedCoupon.code)}
                    >
                      {copiedCode === selectedCoupon.code ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </h3>

                  <p>{selectedCoupon.title}</p>
                </div>

                <button
                  type="button"
                  className={`Coupons__status Coupons__status--${selectedCoupon.status.toLowerCase()}`}
                  onClick={() => handleStatusClick(selectedCoupon)}
                >
                  {renderStatusIcon(selectedCoupon.status, 14)}
                  {selectedCoupon.status}
                </button>
              </div>

              <div className="Coupons__detailGrid">
                <div className="Coupons__detailCard">
                  <div className="Coupons__detailIcon">
                    <Percent size={19} />
                  </div>
                  <span>Discount Percentage</span>
                  <strong>{selectedCoupon.discountPercent}% OFF</strong>
                </div>

                <div className="Coupons__detailCard">
                  <div className="Coupons__detailIcon">
                    <IndianRupee size={19} />
                  </div>
                  <span>Minimum Purchase</span>
                  <strong>{renderMinimum(selectedCoupon.minimumPurchase)}</strong>
                </div>

                <div className="Coupons__detailCard">
                  <div className="Coupons__detailIcon">
                    <ShoppingCart size={19} />
                  </div>
                  <span>Usage</span>
                  <strong>
                    {selectedCoupon.used.toLocaleString("en-IN")} /{" "}
                    {selectedCoupon.usageLimit === "Unlimited"
                      ? "Unlimited"
                      : Number(selectedCoupon.usageLimit).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="Coupons__detailCard">
                  <div className="Coupons__detailIcon">
                    <CalendarDays size={19} />
                  </div>
                  <span>Validity</span>
                  <strong>
                    {formatDate(selectedCoupon.startDate)} -{" "}
                    {formatDate(selectedCoupon.endDate)}
                  </strong>
                </div>
              </div>

              <div className="Coupons__viewDescription">
                <span>DESCRIPTION</span>
                <p>{selectedCoupon.description}</p>
              </div>

              <div className="Coupons__viewUsage">
                <div className="Coupons__viewUsageHeader">
                  <span>Coupon Usage</span>

                  <strong>
                    {getUsagePercentage(selectedCoupon) === null
                      ? "No limit"
                      : `${getUsagePercentage(selectedCoupon)}%`}
                  </strong>
                </div>

                <div
                  className={`Coupons__viewUsageBar ${
                    getUsagePercentage(selectedCoupon) === null
                      ? "Coupons__viewUsageBar--unlimited"
                      : ""
                  }`}
                >
                  <span
                    style={{
                      width: `${
                        getUsagePercentage(selectedCoupon) === null
                          ? 100
                          : getUsagePercentage(selectedCoupon)
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="Coupons__viewFooter">
              <button
                type="button"
                className="Coupons__cancelButton"
                onClick={closeModal}
              >
                Close
              </button>

              <button
                type="button"
                className="Coupons__saveButton"
                onClick={() => openEditModal(selectedCoupon)}
              >
                <Pencil size={17} />
                Edit Coupon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modalType === "delete" && selectedCoupon && (
        <div
          className="Coupons__overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            className="Coupons__deleteModal"
            role="alertdialog"
            aria-modal="true"
            aria-label="Delete coupon"
          >
            <div className="Coupons__deleteIcon">
              <AlertTriangle size={30} />
            </div>

            <h2>Delete Coupon?</h2>

            <p>
              Are you sure you want to permanently delete{" "}
              <strong>{selectedCoupon.code}</strong>?
            </p>

            <div className="Coupons__deleteActions">
              <button
                type="button"
                className="Coupons__cancelButton"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="Coupons__deleteButton"
                onClick={handleDeleteCoupon}
              >
                <Trash2 size={17} />
                Delete Coupon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast.show && (
        <div
          className={`Coupons__toast ${
            toast.type === "error" ? "Coupons__toast--error" : ""
          }`}
          role="status"
        >
          <span className="Coupons__toastIcon">
            {toast.type === "error" ? (
              <AlertTriangle size={14} />
            ) : (
              <Check size={14} />
            )}
          </span>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Coupons;