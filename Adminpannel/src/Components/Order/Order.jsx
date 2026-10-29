import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiX,
  FiShoppingBag,
  FiTruck,
  FiClock,
  FiDollarSign,
  FiCheckCircle,
  FiPackage,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiSave,
  FiAlertTriangle,
  FiDownload,
  FiRefreshCw,
  FiSliders,
  FiPrinter,
} from "react-icons/fi";
import API from "../../api/axios";
import { downloadInvoice } from "../../utils/invoiceGenerator";
import "./Order.css";

const Order = () => {
  const ORDERS_PER_PAGE = 10;

  // Real orders from database
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders", { params: { paymentStatus: "Paid" } });
      if (res.data && res.data.success && Array.isArray(res.data.orders)) {
        const paidOnlyOrders = res.data.orders.filter((order) => {
          const s = (order.paymentInfo?.status || "").toLowerCase();
          return s === "paid" || s === "success" || s === "refunded";
        });
        const formatted = paidOnlyOrders.map((order, idx) => {
          const orderDate = new Date(order.createdAt || Date.now());
          const dateStr = orderDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const timeStr = orderDate.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const items = Array.isArray(order.items) ? order.items : [];
          const fullAddr = order.shippingAddress
            ? `${order.shippingAddress.street || ""}, ${
                order.shippingAddress.locality
                  ? order.shippingAddress.locality + ", "
                  : ""
              }${order.shippingAddress.city || ""}, ${
                order.shippingAddress.state || "Odisha"
              } - ${order.shippingAddress.pincode || ""}`
            : "Address not specified";

          return {
            id:
              order.orderId ||
              (order._id ? `ORD-${order._id.slice(-6).toUpperCase()}` : `#ORD${1000 + idx}`),
            orderId:
              order.orderId ||
              (order._id ? `ORD-${order._id.slice(-6).toUpperCase()}` : `#ORD${1000 + idx}`),
            rawId: order._id,
            customer: order.shippingAddress?.fullName || order.user?.name || "Customer",
            email: order.shippingAddress?.email || order.user?.email || "customer@example.com",
            phone: order.shippingAddress?.phone || order.user?.phone || "-",
            city: order.shippingAddress?.city
              ? `${order.shippingAddress.city}, ${order.shippingAddress.state || "Odisha"}`
              : "Odisha, India",
            fullAddress: fullAddr,
            amount: Number(order.pricing?.totalAmount || 0),
            payment: (() => {
              const s = (order.paymentInfo?.status || "").toLowerCase();
              if (s === "refunded") return "Refunded";
              return "Paid";
            })(),
            paymentMethod: order.paymentInfo?.method || "Online Payment",
            paymentId: order.paymentInfo?.razorpayPaymentId || "",
            status: order.orderStatus || "Placed",
            date: dateStr,
            time: timeStr,
            items: items,
            books: items.map((it) => it.title || "Book"),
            more: items.length > 2 ? items.length - 2 : 0,
            pricing: order.pricing,
            couponCode: order.pricing?.couponCode || "",
            currentLocation: order.currentLocation || "",
            expectedDeliveryDate: order.expectedDeliveryDate || "",
            deliveryPartner: order.deliveryPartner || "",
            deliveryAgentPhone: order.deliveryAgentPhone || "",
            trackingId: order.trackingId || "",
            rawOrder: order,
          };
        });
        setOrders(formatted);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load real orders from backend:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [paymentFilter, setPaymentFilter] = useState("All Payment Status");
  const [activeTab, setActiveTab] = useState("All Orders");

  const [selectedOrders, setSelectedOrders] = useState([]);
  const [viewOrder, setViewOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [isClosingModal, setIsClosingModal] = useState(false);

  const tabs = [
    "All Orders",
    "Placed",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  // Dynamic statistics calculated from real orders in database
  const totalOrdersCount = orders.length;
  const grossRevenue = orders.reduce(
    (sum, o) => sum + (Number(o.amount) || 0),
    0
  );
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
  const pendingCount = orders.filter(
    (o) =>
      o.status === "Placed" ||
      o.status === "Pending" ||
      o.status === "Processing"
  ).length;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        order.id.toLowerCase().includes(searchText) ||
        order.customer.toLowerCase().includes(searchText) ||
        order.email.toLowerCase().includes(searchText) ||
        (Array.isArray(order.items) &&
          order.items.some(
            (book) =>
              (book.title && book.title.toLowerCase().includes(searchText)) ||
              (book.author && book.author.toLowerCase().includes(searchText))
          ));

      const matchesStatus =
        statusFilter === "All Status" ||
        order.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesPayment =
        paymentFilter === "All Payment Status" ||
        order.payment.toLowerCase() === paymentFilter.toLowerCase();

      const matchesTab =
        activeTab === "All Orders" ||
        order.status.toLowerCase() === activeTab.toLowerCase();

      return matchesSearch && matchesStatus && matchesPayment && matchesTab;
    });
  }, [orders, search, statusFilter, paymentFilter, activeTab]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / ORDERS_PER_PAGE)
  );

  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + ORDERS_PER_PAGE
  );

  const getStatusClass = (status) =>
    `OrderStatusBadge OrderStatus${(status || "").replace(/\s+/g, "")}`;
  const getPaymentClass = (payment) => `OrderPaymentBadge OrderPayment${payment}`;

  const getTabCount = (tab) =>
    tab === "All Orders"
      ? orders.length
      : orders.filter((order) => order.status?.toLowerCase() === tab.toLowerCase()).length;

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedOrders([]);
  };

  const handleSelectAll = () => {
    const ids = currentOrders.map((order) => order.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedOrders.includes(id));

    if (allSelected) {
      setSelectedOrders((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedOrders((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const handleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const closeModal = useCallback(() => {
    setIsClosingModal(true);
    setTimeout(() => {
      setViewOrder(null);
      setEditOrder(null);
      setDeleteOrder(null);
      setEditForm(null);
      setIsClosingModal(false);
    }, 220);
  }, []);

  useEffect(() => {
    const hasModal = Boolean(viewOrder || editOrder || deleteOrder);
    if (hasModal) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          closeModal();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [viewOrder, editOrder, deleteOrder, closeModal]);

  const openView = (order) => {
    setIsClosingModal(false);
    setViewOrder(order);
  };

  const openEdit = (order) => {
    setIsClosingModal(false);
    setEditOrder(order);

    let initialPhone = order.deliveryAgentPhone || order.rawOrder?.deliveryAgentPhone || "";
    let initialTracking = order.trackingId || order.rawOrder?.trackingId || "";

    // If phone and tracking were previously saved together with a slash, split them cleanly
    if (initialPhone && initialPhone.includes("/")) {
      const parts = initialPhone.split("/");
      initialPhone = parts[0].trim();
      if (!initialTracking || initialTracking === (order.deliveryAgentPhone || order.rawOrder?.deliveryAgentPhone)) {
        initialTracking = parts.slice(1).join("/").trim();
      }
    } else if (initialTracking && initialTracking.includes("/") && !initialPhone) {
      const parts = initialTracking.split("/");
      initialPhone = parts[0].trim();
      initialTracking = parts.slice(1).join("/").trim();
    } else if (initialPhone && initialTracking && initialPhone === initialTracking) {
      // If exactly identical without slash, keep phone if numeric-like, otherwise keep tracking
      if (/^\+?\d[\d\s-]{6,}$/.test(initialPhone)) {
        initialTracking = "";
      } else {
        initialPhone = "";
      }
    }

    setEditForm({
      customer: order.customer,
      email: order.email,
      phone: order.phone,
      city: order.city,
      amount: order.amount,
      payment: order.payment,
      status: order.status,
      currentLocation: order.currentLocation || order.rawOrder?.currentLocation || "",
      expectedDeliveryDate: order.expectedDeliveryDate || order.rawOrder?.expectedDeliveryDate || "",
      deliveryPartner: order.deliveryPartner || order.rawOrder?.deliveryPartner || "",
      deliveryAgentPhone: initialPhone,
      trackingId: initialTracking,
    });
  };

  const openDelete = (order) => {
    setIsClosingModal(false);
    setDeleteOrder(order);
  };

  const saveEdit = async () => {
    try {
      if (editOrder.rawId) {
        await API.put(`/orders/${editOrder.rawId}/status`, {
          orderStatus: editForm.status,
          paymentStatus: editForm.payment,
          currentLocation: editForm.currentLocation || "",
          expectedDeliveryDate: editForm.expectedDeliveryDate || "",
          deliveryPartner: editForm.deliveryPartner || "",
          deliveryAgentPhone: editForm.deliveryAgentPhone || "",
          trackingId: editForm.trackingId || "",
        });
      }
      setOrders((prev) =>
        prev.map((order) =>
          order.id === editOrder.id
            ? {
                ...order,
                ...editForm,
                amount: Number(editForm.amount),
              }
            : order
        )
      );
      closeModal();
    } catch (err) {
      console.error("Failed to update order:", err);
      alert("Failed to update order in database.");
    }
  };

  const deleteConfirmed = async () => {
    try {
      if (deleteOrder.rawId) {
        await API.delete(`/orders/${deleteOrder.rawId}`);
      }
      setOrders((prev) => prev.filter((order) => order.id !== deleteOrder.id));
      setSelectedOrders((prev) => prev.filter((id) => id !== deleteOrder.id));
      closeModal();
    } catch (err) {
      console.error("Failed to delete order:", err);
      alert("Failed to delete order from database.");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All Status");
    setPaymentFilter("All Payment Status");
    setActiveTab("All Orders");
    setCurrentPage(1);
    setSelectedOrders([]);
  };

  /**
   * Premium Print & PDF Receipt Generator
   * Generates a branded, printable tax invoice window with auto-print & download trigger
   */
  const handleDownloadInvoice = (order) => {
    setDownloadingId(order.id);
    downloadInvoice(order);
    setTimeout(() => {
      setDownloadingId(null);
    }, 450);
  };

  const handleDownloadReceipt = (order) => {
    return handleDownloadInvoice(order);
    setDownloadingId(order.id);

    const items =
      Array.isArray(order.items) && order.items.length > 0
        ? order.items
        : [
            {
              title: "Curated Books Package",
              author: "Lekhani Publications",
              price: order.amount,
              quantity: 1,
            },
          ];

    const subtotal = Math.round(order.amount / 1.05);
    const gstTax = order.amount - subtotal;
    const shipping = order.amount > 1000 ? 0 : 50;
    const grandTotal = order.amount;

    const receiptHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Receipt_${order.id.replace("#", "")}</title>
        <style>
          @page { size: A4; margin: 16mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #f8fafc;
            color: #0f172a;
            margin: 0;
            padding: 30px;
            display: flex;
            justify-content: center;
          }
          .invoice-card {
            background: #ffffff;
            width: 100%;
            max-width: 800px;
            padding: 44px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 24px;
            border-bottom: 2px solid #2563eb;
          }
          .company-logo {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo-mark {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            border-radius: 10px;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: 800;
          }
          .company-name {
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #0f172a;
            margin: 0;
          }
          .company-tag {
            font-size: 11px;
            color: #64748b;
            margin-top: 2px;
          }
          .invoice-meta {
            text-align: right;
          }
          .invoice-pill {
            display: inline-block;
            background: #eff6ff;
            color: #2563eb;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 9999px;
            letter-spacing: 0.5px;
          }
          .invoice-id {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            margin: 8px 0 4px;
          }
          .invoice-date {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
          }
          .billing-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 28px 0;
            padding: 18px 20px;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          .bill-col h4 {
            margin: 0 0 8px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #64748b;
          }
          .bill-col strong {
            font-size: 14px;
            color: #0f172a;
            display: block;
            margin-bottom: 3px;
          }
          .bill-col p {
            margin: 2px 0;
            font-size: 12px;
            color: #475569;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .items-table th {
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
            padding: 12px 14px;
            background: #f1f5f9;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
          }
          .items-table td {
            padding: 14px;
            font-size: 12.5px;
            border-bottom: 1px solid #f1f5f9;
            color: #1e293b;
          }
          .items-table tr:last-child td {
            border-bottom: 1px solid #e2e8f0;
          }
          .summary-wrapper {
            display: flex;
            justify-content: flex-end;
            margin-top: 24px;
          }
          .summary-table {
            width: 320px;
            border-collapse: collapse;
          }
          .summary-table td {
            padding: 6px 12px;
            font-size: 12.5px;
            color: #64748b;
          }
          .summary-table td:last-child {
            text-align: right;
            font-weight: 600;
            color: #0f172a;
          }
          .summary-total {
            border-top: 2px solid #e2e8f0;
            font-size: 16px !important;
            font-weight: 800 !important;
            color: #2563eb !important;
            padding-top: 10px !important;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            margin-top: 14px;
          }
          .badge-paid { background: #dcfce7; color: #15803d; }
          .badge-cod { background: #fef3c7; color: #b45309; }
          .footer-section {
            margin-top: 40px;
            padding-top: 18px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header-row">
            <div class="company-logo">
              <div class="logo-mark">L</div>
              <div>
                <h1 class="company-name">LEKHANI BOOKS</h1>
                <div class="company-tag">Publications & Direct Distribution • Reg. Govt. of Odisha</div>
              </div>
            </div>
            <div class="invoice-meta">
              <span class="invoice-pill">TAX INVOICE / RECEIPT</span>
              <h2 class="invoice-id">${order.id}</h2>
              <div class="invoice-date">Date: <strong>${order.date}</strong> at ${order.time}</div>
              <div class="invoice-date">Status: <strong>${order.status}</strong></div>
            </div>
          </div>

          <div class="billing-grid">
            <div class="bill-col">
              <h4>Customer Billed To</h4>
              <strong>${order.customer}</strong>
              <p>${order.email}</p>
              <p>${order.phone}</p>
              <p>${order.fullAddress || order.city}</p>
            </div>
            <div class="bill-col">
              <h4>Payment & Logistics</h4>
              <p>Payment Mode: <strong>${order.paymentMethod || order.payment}</strong></p>
              <p>Fulfillment: <strong>Expedited Courier Service</strong></p>
              <span class="status-badge ${order.payment === "Paid" ? "badge-paid" : "badge-cod"}">
                Payment Status: ${order.payment.toUpperCase()}
              </span>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 45%;">Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (it, idx) => `
                <tr>
                  <td>
                    <strong>${idx + 1}. ${it.title}</strong>
                    <div style="font-size: 10.5px; color: #64748b;">${it.author || "Standard Edition"}</div>
                  </td>
                  <td style="text-align: center;">${it.quantity || 1}</td>
                  <td style="text-align: right;">₹${Number(it.price || 0).toLocaleString("en-IN")}</td>
                  <td style="text-align: right;">₹${(Number(it.price || 0) * Number(it.quantity || 1)).toLocaleString("en-IN")}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="summary-wrapper">
            <table class="summary-table">
              <tr>
                <td>Taxable Subtotal</td>
                <td>₹${subtotal.toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td>Estimated GST (5%)</td>
                <td>₹${gstTax.toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td>Standard Shipping</td>
                <td>${shipping === 0 ? "FREE" : "₹" + shipping}</td>
              </tr>
              <tr>
                <td class="summary-total">Total Amount</td>
                <td class="summary-total">₹${grandTotal.toLocaleString("en-IN")}</td>
              </tr>
            </table>
          </div>

          <div class="footer-section">
            <span>Thank you for shopping with us! This is a system-generated authentic tax receipt.</span>
            <span>Ref: ${order.id.replace("#", "")}-${Date.now().toString().slice(-6)}</span>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=880,height=920");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      printWindow.focus();
    } else {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(
          JSON.stringify(
            {
              receiptId: order.id,
              customer: order.customer,
              email: order.email,
              phone: order.phone,
              city: order.city,
              date: order.date,
              time: order.time,
              status: order.status,
              payment: order.payment,
              amount: order.amount,
              breakdown: items,
              generatedAt: new Date().toISOString(),
            },
            null,
            2
          )
        );
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `Receipt_${order.id.replace("#", "")}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    setTimeout(() => {
      setDownloadingId(null);
    }, 450);
  };

  return (
    <div className="OrderContainer">
      {/* HEADER COMMAND BAR */}
      <header className="OrderHeaderBar">
        <div className="OrderHeaderTitleGroup">
          <div className="OrderHeaderIconWrapper">
            <FiShoppingBag />
          </div>
          <div>
            <h1 className="OrderMainTitle">Orders Workspace</h1>
            <p className="OrderSubTitle">
              Real-time monitoring, logistics status and customer fulfillment
            </p>
          </div>
        </div>

        <div className="OrderHeaderActions">
          <button
            className="OrderSecondaryBtn"
            onClick={fetchOrders}
            title="Refresh Real Orders"
          >
            <FiRefreshCw className={loading ? "OrderSpinIcon" : ""} />
            <span>Sync</span>
          </button>
          <button className="OrderPrimaryBtn" title="Export CSV Data">
            <FiDownload />
            <span>Export Data</span>
          </button>
        </div>
      </header>

      {/* STATS OVERVIEW - REAL VALUES FROM DATABASE */}
      <section className="OrderStatsGrid">
        <div className="OrderStatCard OrderStatCardOrders">
          <div className="OrderStatIcon OrderStatBlue">
            <FiShoppingBag />
          </div>
          <div className="OrderStatContent">
            <span>TOTAL ORDERS</span>
            <strong>{totalOrdersCount}</strong>
            <small className="OrderPositive">Live from database</small>
          </div>
        </div>

        <div className="OrderStatCard OrderStatCardRevenue">
          <div className="OrderStatIcon OrderStatOrange">
            <FiDollarSign />
          </div>
          <div className="OrderStatContent">
            <span>GROSS REVENUE</span>
            <strong>₹{grossRevenue.toLocaleString("en-IN")}</strong>
            <small className="OrderPositive">Calculated live</small>
          </div>
        </div>

        <div className="OrderStatCard OrderStatCardDelivered">
          <div className="OrderStatIcon OrderStatGreen">
            <FiTruck />
          </div>
          <div className="OrderStatContent">
            <span>DELIVERED RATIO</span>
            <strong>{deliveredCount}</strong>
            <small className="OrderPositive">
              {totalOrdersCount > 0
                ? `${Math.round((deliveredCount / totalOrdersCount) * 100)}% completed`
                : "0% completed"}
            </small>
          </div>
        </div>

        <div className="OrderStatCard OrderStatCardPending">
          <div className="OrderStatIcon OrderStatRed">
            <FiClock />
          </div>
          <div className="OrderStatContent">
            <span>PENDING ACTION</span>
            <strong>{pendingCount}</strong>
            <small className="OrderNegative">Requires attention</small>
          </div>
        </div>
      </section>

      {/* MAIN ORDER TABLE CARD */}
      <section className="OrderMainCard">
        {/* TABS NAVIGATION */}
        <div className="OrderTabsWrapper">
          <div className="OrderTabs">
            {tabs.map((tab) => {
              const count = getTabCount(tab);
              return (
                <button
                  key={tab}
                  className={`OrderTab ${activeTab === tab ? "OrderTabActive" : ""}`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab}
                  <span className="OrderTabBadge">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FILTERS */}
        <div className="OrderFilterArea">
          <div className="OrderSearchBox">
            <FiSearch />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by ID, customer name, email, books..."
            />
            {search && (
              <button
                className="OrderSearchClear"
                onClick={() => handleSearch("")}
                title="Clear Search"
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="OrderSelectBox">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Status</option>
              <option>Placed</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Out for Delivery</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
            <FiChevronDown />
          </div>

          <div className="OrderSelectBox">
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Payment Status</option>
              <option>Paid</option>
              <option>Refunded</option>
            </select>
            <FiChevronDown />
          </div>

          <button className="OrderResetButton" onClick={resetFilters}>
            <FiSliders />
            <span>Reset</span>
          </button>
        </div>

        {/* TABLE WRAPPER */}
        <div className="OrderTableWrapper">
          <table className="OrderTable">
            <thead>
              <tr>
                <th className="OrderColCheckbox">
                  <input
                    type="checkbox"
                    checked={
                      currentOrders.length > 0 &&
                      currentOrders.every((order) =>
                        selectedOrders.includes(order.id)
                      )
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="OrderColId">Order ID</th>
                <th className="OrderColCustomer">Customer</th>
                <th className="OrderColBooks">Books Ordered</th>
                <th className="OrderColAmount">Amount</th>
                <th className="OrderColPayment">Payment</th>
                <th className="OrderColStatus">Status</th>
                <th className="OrderColDate">Date & Time</th>
                <th className="OrderColAction">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "48px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        color: "#2563eb",
                        fontWeight: 600,
                      }}
                    >
                      <FiRefreshCw className="OrderSpinIcon" style={{ fontSize: "18px" }} />
                      <span>Fetching real orders from database...</span>
                    </div>
                  </td>
                </tr>
              ) : currentOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="OrderEmptyState">
                    <div className="OrderEmptyBox">
                      <FiPackage />
                      <h3>No Orders Found</h3>
                      <p>
                        {search || statusFilter !== "All Status" || activeTab !== "All Orders"
                          ? "We couldn't find anything matching your filters or search terms."
                          : "No real orders in database yet. Orders placed on the storefront will appear here instantly."}
                      </p>
                      <button className="OrderResetButton" onClick={resetFilters}>
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => {
                  const isSelected = selectedOrders.includes(order.id);
                  const isDownloading = downloadingId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className={isSelected ? "OrderRowSelected" : ""}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOrder(order.id)}
                        />
                      </td>
                      <td>
                        <span className="OrderId">{order.id}</span>
                      </td>
                      <td>
                        <div className="OrderCustomer">
                          <div className="OrderAvatar">
                            {order.customer.charAt(0).toUpperCase()}
                          </div>
                          <div className="OrderCustomerInfo">
                            <strong>{order.customer}</strong>
                            <span>{order.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="OrderBooks">
                          {order.items && order.items.length > 0 ? (
                            <>
                              {order.items.slice(0, 2).map((item, index) => (
                                <div
                                  key={index}
                                  className="OrderBookCover"
                                  style={{
                                    background: "#1e3a8a",
                                    overflow: "hidden",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                  title={`${item.title} by ${item.author || "Author"}`}
                                >
                                  {item.coverImage ? (
                                    <img
                                      src={item.coverImage}
                                      alt={item.title}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: "8.5px",
                                        padding: "2px",
                                        textAlign: "center",
                                        color: "#fff",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {(item.title || "BOOK").slice(0, 7)}
                                    </span>
                                  )}
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <span className="OrderMoreBooks">
                                  +{order.items.length - 2} more
                                </span>
                              )}
                            </>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#64748b" }}>
                              1 Package
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="OrderAmount">
                          ₹{order.amount.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td>
                        <span className={getPaymentClass(order.payment)}>
                          <span className="OrderBadgeDot" />
                          {order.payment}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusClass(order.status)}>
                          <span className="OrderBadgeDot" />
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="OrderDateTime">
                          <strong>{order.date}</strong>
                          <span>{order.time}</span>
                        </div>
                      </td>
                      <td>
                        <div className="OrderActions">
                          {/* INVOICE DOWNLOAD BUTTON */}
                          <button
                            className={`OrderActionButton OrderReceiptButton ${
                              isDownloading ? "OrderReceiptLoading" : ""
                            }`}
                            title="Download Official Tax Invoice"
                            onClick={() => handleDownloadInvoice(order)}
                            disabled={isDownloading}
                          >
                            <FiDownload />
                            <span>{isDownloading ? "Downloading..." : "Invoice"}</span>
                          </button>

                          <button
                            className="OrderActionButton OrderViewButton"
                            title="View order"
                            onClick={() => openView(order)}
                          >
                            <FiEye />
                          </button>
                          <button
                            className="OrderActionButton OrderEditButton"
                            title="Edit order"
                            onClick={() => openEdit(order)}
                          >
                            <FiEdit3 />
                          </button>
                          <button
                            className="OrderActionButton OrderDeleteButton"
                            title="Delete order"
                            onClick={() => openDelete(order)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER & PAGINATION */}
        <footer className="OrderTableFooter">
          <span className="OrderShowingText">
            Showing{" "}
            <strong>
              {filteredOrders.length === 0 ? 0 : startIndex + 1}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(
                startIndex + ORDERS_PER_PAGE,
                filteredOrders.length
              )}
            </strong>{" "}
            of <strong>{filteredOrders.length}</strong> orders
          </span>

          <div className="OrderPagination">
            <button
              className="OrderPageButton"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title="Previous Page"
            >
              <FiChevronLeft />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`OrderPageButton ${
                  currentPage === page ? "OrderPageActive" : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="OrderPageButton"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              title="Next Page"
            >
              <FiChevronRight />
            </button>
          </div>
        </footer>
      </section>

      {/* ================= VIEW MODAL ================= */}
      {viewOrder && (
        <div
          className={`OrderModalOverlay ${isClosingModal ? "OrderModalExiting" : ""}`}
          onClick={closeModal}
        >
          <div
            className="OrderViewModal OrderModalBox"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="OrderModalHeader">
              <div>
                <span className="OrderModalLabel">ORDER RECORD DETAILS</span>
                <h2>{viewOrder.id}</h2>
              </div>
              <div className="OrderModalHeaderBtns">
                <button
                  className="OrderReceiptDownloadHeaderBtn"
                  onClick={() => handleDownloadInvoice(viewOrder)}
                  title="Download Official Tax Invoice"
                >
                  <FiDownload />
                  <span>Download Invoice</span>
                </button>
                <button className="OrderCloseButton" onClick={closeModal}>
                  <FiX />
                </button>
              </div>
            </div>

            <div className="OrderViewTop">
              <div className="OrderBigAvatar">
                {viewOrder.customer.charAt(0).toUpperCase()}
              </div>
              <div className="OrderViewTopDetails">
                <h3>{viewOrder.customer}</h3>
                <p>{viewOrder.email}</p>
              </div>
              <span className={getStatusClass(viewOrder.status)}>
                <span className="OrderBadgeDot" />
                {viewOrder.status}
              </span>
            </div>

            <div className="OrderDetailsGrid">
              <div className="OrderDetailItem">
                <FiMail />
                <div>
                  <span>Email Address</span>
                  <strong>{viewOrder.email}</strong>
                </div>
              </div>
              <div className="OrderDetailItem">
                <FiPhone />
                <div>
                  <span>Contact Phone</span>
                  <strong>{viewOrder.phone}</strong>
                </div>
              </div>
              <div className="OrderDetailItem">
                <FiMapPin />
                <div>
                  <span>Delivery Destination</span>
                  <strong>{viewOrder.fullAddress || viewOrder.city}</strong>
                </div>
              </div>
              <div className="OrderDetailItem">
                <FiCreditCard />
                <div>
                  <span>Payment Method & Status</span>
                  <strong>
                    {viewOrder.paymentMethod || "Online Payment"} ({viewOrder.payment})
                  </strong>
                </div>
              </div>

              {viewOrder.currentLocation && (
                <div className="OrderDetailItem">
                  <FiMapPin />
                  <div>
                    <span>Current Hub / Location</span>
                    <strong>{viewOrder.currentLocation}</strong>
                  </div>
                </div>
              )}

              {viewOrder.expectedDeliveryDate && (
                <div className="OrderDetailItem">
                  <FiCalendar />
                  <div>
                    <span>Expected Delivery</span>
                    <strong>{viewOrder.expectedDeliveryDate}</strong>
                  </div>
                </div>
              )}

              {viewOrder.deliveryPartner && (
                <div className="OrderDetailItem">
                  <FiTruck />
                  <div>
                    <span>Delivery Partner</span>
                    <strong>
                      {viewOrder.deliveryPartner}
                      {viewOrder.deliveryAgentPhone &&
                      viewOrder.deliveryAgentPhone !== viewOrder.trackingId
                        ? ` (📞 ${viewOrder.deliveryAgentPhone.split('/')[0].trim()})`
                        : ""}
                    </strong>
                  </div>
                </div>
              )}

              {viewOrder.trackingId && (
                <div className="OrderDetailItem">
                  <FiPackage />
                  <div>
                    <span>Tracking Number (AWB)</span>
                    <strong>
                      {viewOrder.trackingId.includes('/')
                        ? viewOrder.trackingId.split('/').slice(1).join('/').trim() || viewOrder.trackingId
                        : viewOrder.trackingId}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            <div className="OrderModalSection">
              <h3>Items in Package ({viewOrder.items?.length || 0})</h3>
              <div className="OrderModalBooks">
                {viewOrder.items && viewOrder.items.length > 0 ? (
                  viewOrder.items.map((item, index) => (
                    <div
                      className="OrderModalBook"
                      key={index}
                      style={{ gap: "12px", alignItems: "center" }}
                    >
                      <div
                        className="OrderModalBookCover"
                        style={{
                          background: "#1e3a8a",
                          width: "48px",
                          height: "64px",
                          borderRadius: "4px",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: "8.5px",
                              color: "#fff",
                              textAlign: "center",
                              padding: "2px",
                              fontWeight: 600,
                            }}
                          >
                            {(item.title || "BOOK").slice(0, 10)}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          textAlign: "left",
                        }}
                      >
                        <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>
                          {item.title}
                        </strong>
                        <small style={{ color: "#64748b" }}>
                          By {item.author || "Unknown"}
                        </small>
                        <small style={{ color: "#2563eb", fontWeight: 600 }}>
                          Qty: {item.quantity || 1} • ₹{item.price}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#64748b", margin: 0 }}>
                    Package items information not specified.
                  </p>
                )}
              </div>
            </div>

            <div className="OrderSummaryBox">
              <div>
                <span>Timestamp</span>
                <strong>
                  {viewOrder.date} • {viewOrder.time}
                </strong>
              </div>
              <div>
                <span>Payment State</span>
                <strong
                  className={
                    viewOrder.payment === "Paid" ? "OrderPositive" : "OrderNegative"
                  }
                >
                  {viewOrder.payment}
                </strong>
              </div>
              <div>
                <span>Total Amount Paid</span>
                <strong className="OrderSummaryAmount">
                  ₹{viewOrder.amount.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {editOrder && editForm && (
        <div
          className={`OrderModalOverlay ${isClosingModal ? "OrderModalExiting" : ""}`}
          onClick={closeModal}
        >
          <div
            className="OrderEditModal OrderModalBox"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="OrderModalHeader">
              <div>
                <span className="OrderModalLabel">OPERATIONAL CONTROL</span>
                <h2>Edit {editOrder.id}</h2>
              </div>
              <button className="OrderCloseButton" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <div className="OrderEditForm">
              {[
                ["customer", "Customer Full Name", "text"],
                ["email", "Email Address", "email"],
                ["phone", "Phone Contact", "text"],
                ["city", "Delivery City & State", "text"],
                ["amount", "Total Order Value (₹)", "number"],
              ].map(([field, label, type]) => (
                <div className="OrderFormGroup" key={field}>
                  <label>{label}</label>
                  <input
                    type={type}
                    value={editForm[field]}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}

              <div className="OrderFormGroup">
                <label>Payment Status</label>
                <div className="OrderCustomSelect">
                  <select
                    value={editForm.payment}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        payment: e.target.value,
                      }))
                    }
                  >
                    <option>Paid</option>
                    <option>Refunded</option>
                  </select>
                  <FiChevronDown />
                </div>
              </div>

              <div className="OrderStatusManagement">
                <div className="OrderStatusHeading">
                  <div>
                    <h3>Order Lifecycle Stage</h3>
                    <p>Select the immediate fulfillment stage to dispatch notifications</p>
                  </div>
                </div>

                <div className="OrderStatusOptions">
                  {[
                    "Placed",
                    "Processing",
                    "Shipped",
                    "Out for Delivery",
                    "Delivered",
                    "Cancelled",
                  ].map((status) => (
                    <button
                      type="button"
                      key={status}
                      className={`OrderStatusOption ${
                        editForm.status === status
                          ? "OrderStatusOptionActive"
                          : ""
                      }`}
                      onClick={() =>
                        setEditForm((prev) => ({
                          ...prev,
                          status,
                        }))
                      }
                    >
                      <span className="OrderStatusDot" />
                      {status}
                      {editForm.status === status && <FiCheckCircle />}
                    </button>
                  ))}
                </div>

                {/* Dynamic Field: When status is Shipped */}
                {editForm.status === "Shipped" && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "16px",
                      background: "#f0f7ff",
                      borderRadius: "10px",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <div className="OrderFormGroup" style={{ margin: 0 }}>
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#1e3a8a",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "6px",
                        }}
                      >
                        <FiMapPin style={{ color: "#2563eb" }} /> Current Hub / Dispatch Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bhubaneswar Sorting Center / In Transit via Cuttack Hub"
                        value={editForm.currentLocation || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            currentLocation: e.target.value,
                          }))
                        }
                      />
                      <small
                        style={{
                          fontSize: "11.5px",
                          color: "#3b82f6",
                          marginTop: "6px",
                          display: "block",
                          fontWeight: 500,
                        }}
                      >
                        ✓ This location will be shown live to the customer on their order tracking screen.
                      </small>
                    </div>
                  </div>
                )}

                {/* Dynamic Fields: When status is Out for Delivery */}
                {editForm.status === "Out for Delivery" && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "16px",
                      background: "#faf5ff",
                      borderRadius: "10px",
                      border: "1px solid #e9d5ff",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div className="OrderFormGroup" style={{ margin: 0 }}>
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#581c87",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "6px",
                        }}
                      >
                        <FiCalendar style={{ color: "#7e22ce" }} /> Expected Delivery Date
                      </label>
                      <input
                        type="date"
                        value={editForm.expectedDeliveryDate || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            expectedDeliveryDate: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="OrderFormGroup" style={{ margin: 0 }}>
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#581c87",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "6px",
                        }}
                      >
                        <FiTruck style={{ color: "#7e22ce" }} /> Delivery Partner / Courier
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Delhivery / Blue Dart / DTDC / Saroj"
                        value={editForm.deliveryPartner || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            deliveryPartner: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div className="OrderFormGroup" style={{ margin: 0 }}>
                        <label
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#581c87",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "6px",
                          }}
                        >
                          <FiPhone style={{ color: "#7e22ce" }} /> Delivery Agent Phone
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. +91 8117048317"
                          value={editForm.deliveryAgentPhone || ""}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              deliveryAgentPhone: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="OrderFormGroup" style={{ margin: 0 }}>
                        <label
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#581c87",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "6px",
                          }}
                        >
                          <FiPackage style={{ color: "#7e22ce" }} /> Tracking Number (AWB ID)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. AWM5678904"
                          value={editForm.trackingId || ""}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              trackingId: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <small
                      style={{
                        fontSize: "11.5px",
                        color: "#7e22ce",
                        display: "block",
                        fontWeight: 500,
                      }}
                    >
                      ✓ Customer will see the expected delivery date & courier partner details immediately.
                    </small>
                  </div>
                )}
              </div>
            </div>

            <div className="OrderModalFooter">
              <button className="OrderCancelButton" onClick={closeModal}>
                Discard
              </button>
              <button className="OrderSaveButton" onClick={saveEdit}>
                <FiSave />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deleteOrder && (
        <div
          className={`OrderModalOverlay ${isClosingModal ? "OrderModalExiting" : ""}`}
          onClick={closeModal}
        >
          <div
            className="OrderDeleteModal OrderModalBox"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="OrderDeleteIcon">
              <FiAlertTriangle />
            </div>
            <h2>Remove Order Record?</h2>
            <p>
              Are you sure you want to permanently delete order record{" "}
              <strong>{deleteOrder.id}</strong> belonging to{" "}
              <strong>{deleteOrder.customer}</strong>? This action cannot be
              undone.
            </p>

            <div className="OrderModalFooter">
              <button className="OrderCancelButton" onClick={closeModal}>
                Cancel
              </button>
              <button className="OrderDeleteConfirmButton" onClick={deleteConfirmed}>
                <FiTrash2 />
                <span>Delete Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;