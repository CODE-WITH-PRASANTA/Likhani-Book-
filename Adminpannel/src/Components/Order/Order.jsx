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
import "./Order.css";

const Order = () => {
  const ORDERS_PER_PAGE = 10;
  const TOTAL_PAGES = 8;

  const books = [
    { title: "Atomic Habits", author: "James Clear", color: "#e2b887", text: "ATOMIC\nHABITS", price: 499 },
    { title: "Deep Work", author: "Cal Newport", color: "#1f3b64", text: "DEEP\nWORK", price: 450 },
    { title: "Ikigai", author: "Héctor García", color: "#2d7a6e", text: "IKIGAI", price: 399 },
    { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", color: "#8a2435", text: "RICH\nDAD", price: 400 },
    { title: "The 48 Laws of Power", author: "Robert Greene", color: "#2d2a32", text: "THE\nPOWER", price: 650 },
    { title: "The Magic of Thinking Big", author: "David Schwartz", color: "#dc3545", text: "THINK\nBIG", price: 350 },
    { title: "Sapiens", author: "Yuval Noah Harari", color: "#8a7b66", text: "SAPIENS", price: 550 },
    { title: "The Psychology of Money", author: "Morgan Housel", color: "#194a7a", text: "PSYCHOLOGY", price: 399 },
  ];

  const initialOrders = [
    {
      id: "#ORD1250",
      customer: "Rohan Kumar",
      email: "rohan@gmail.com",
      phone: "+91 98765 43210",
      city: "Bhubaneswar, Odisha",
      books: [0, 1],
      more: 2,
      amount: 1450,
      payment: "Paid",
      status: "Delivered",
      date: "03 Oct 2026",
      time: "10:30 AM",
    },
    {
      id: "#ORD1249",
      customer: "Priya Das",
      email: "priya@gmail.com",
      phone: "+91 98765 12345",
      city: "Cuttack, Odisha",
      books: [2, 3],
      more: 1,
      amount: 799,
      payment: "Paid",
      status: "Shipped",
      date: "02 Oct 2026",
      time: "05:45 PM",
    },
    {
      id: "#ORD1248",
      customer: "Amit Sahu",
      email: "amit@gmail.com",
      phone: "+91 91234 56789",
      city: "Kendrapara, Odisha",
      books: [4, 5],
      more: 3,
      amount: 2199,
      payment: "COD",
      status: "Processing",
      date: "02 Oct 2026",
      time: "01:20 PM",
    },
    {
      id: "#ORD1247",
      customer: "Sneha Patel",
      email: "sneha@gmail.com",
      phone: "+91 99887 66554",
      city: "Bhubaneswar, Odisha",
      books: [0, 6],
      more: 1,
      amount: 899,
      payment: "Paid",
      status: "Pending",
      date: "01 Oct 2026",
      time: "11:15 AM",
    },
    {
      id: "#ORD1246",
      customer: "Vikash Singh",
      email: "vikash@gmail.com",
      phone: "+91 98761 23456",
      city: "Puri, Odisha",
      books: [1, 5],
      more: 2,
      amount: 1299,
      payment: "Paid",
      status: "Delivered",
      date: "01 Oct 2026",
      time: "09:45 AM",
    },
    {
      id: "#ORD1245",
      customer: "Neha Rani",
      email: "neha@gmail.com",
      phone: "+91 87654 32109",
      city: "Balasore, Odisha",
      books: [6, 7],
      more: 1,
      amount: 649,
      payment: "Failed",
      status: "Cancelled",
      date: "30 Sep 2026",
      time: "06:30 PM",
    },
    {
      id: "#ORD1244",
      customer: "Karan Mehta",
      email: "karan@gmail.com",
      phone: "+91 90909 12345",
      city: "Rourkela, Odisha",
      books: [7, 1],
      more: 4,
      amount: 1999,
      payment: "Paid",
      status: "Shipped",
      date: "29 Sep 2026",
      time: "03:10 PM",
    },
    {
      id: "#ORD1243",
      customer: "Megha Singh",
      email: "megha@gmail.com",
      phone: "+91 93456 78901",
      city: "Berhampur, Odisha",
      books: [3, 2],
      more: 1,
      amount: 999,
      payment: "Paid",
      status: "Delivered",
      date: "28 Sep 2026",
      time: "12:40 PM",
    },
    {
      id: "#ORD1242",
      customer: "Tushar Raut",
      email: "tushar@gmail.com",
      phone: "+91 92345 67890",
      city: "Angul, Odisha",
      books: [5, 4],
      more: 2,
      amount: 1099,
      payment: "COD",
      status: "Pending",
      date: "27 Sep 2026",
      time: "04:15 PM",
    },
    {
      id: "#ORD1241",
      customer: "Anjali Verma",
      email: "anjali@gmail.com",
      phone: "+91 98712 34567",
      city: "Delhi, India",
      books: [6, 4],
      more: 1,
      amount: 749,
      payment: "Paid",
      status: "Processing",
      date: "26 Sep 2026",
      time: "11:25 AM",
    },
  ];

  const [orders, setOrders] = useState(() => {
    const result = [];
    for (let page = 0; page < TOTAL_PAGES; page++) {
      initialOrders.forEach((order, index) => {
        result.push({
          ...order,
          id: `#ORD${1250 - page * 10 - index}`,
          amount:
            page === 0
              ? order.amount
              : Math.max(
                  499,
                  order.amount + ((page * 97 + index * 43) % 500) - 200
                ),
        });
      });
    }
    return result;
  });

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
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        order.id.toLowerCase().includes(searchText) ||
        order.customer.toLowerCase().includes(searchText) ||
        order.email.toLowerCase().includes(searchText) ||
        order.books.some((book) =>
          books[book].title.toLowerCase().includes(searchText)
        );

      const matchesStatus =
        statusFilter === "All Status" || order.status === statusFilter;

      const matchesPayment =
        paymentFilter === "All Payment Status" ||
        order.payment === paymentFilter;

      const matchesTab =
        activeTab === "All Orders" || order.status === activeTab;

      return matchesSearch && matchesStatus && matchesPayment && matchesTab;
    });
  }, [orders, search, statusFilter, paymentFilter, activeTab]);

  const totalPages = Math.max(
    1,
    Math.min(TOTAL_PAGES, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE))
  );

  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + ORDERS_PER_PAGE
  );

  const getStatusClass = (status) => `OrderStatusBadge OrderStatus${status}`;
  const getPaymentClass = (payment) => `OrderPaymentBadge OrderPayment${payment}`;

  const getTabCount = (tab) =>
    tab === "All Orders"
      ? orders.length
      : orders.filter((order) => order.status === tab).length;

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
    setEditForm({
      customer: order.customer,
      email: order.email,
      phone: order.phone,
      city: order.city,
      amount: order.amount,
      payment: order.payment,
      status: order.status,
    });
  };

  const openDelete = (order) => {
    setIsClosingModal(false);
    setDeleteOrder(order);
  };

  const saveEdit = () => {
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
  };

  const deleteConfirmed = () => {
    setOrders((prev) => prev.filter((order) => order.id !== deleteOrder.id));
    setSelectedOrders((prev) => prev.filter((id) => id !== deleteOrder.id));
    closeModal();
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
  const handleDownloadReceipt = (order) => {
    setDownloadingId(order.id);

    const items = order.books.map((bookIdx) => books[bookIdx]);
    if (order.more > 0) {
      for (let i = 0; i < order.more; i++) {
        items.push({
          title: `Additional Curated Title #${i + 1}`,
          author: "Publisher Direct",
          price: Math.round((order.amount * 0.4) / order.more),
        });
      }
    }

    const subtotal = Math.round(order.amount / 1.05);
    const gstTax = order.amount - subtotal;
    const shipping = order.amount > 1000 ? 0 : 50;
    const grandTotal = order.amount + shipping;

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
          .logo-badge {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            background: #2563eb;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 20px;
          }
          .company-title {
            font-size: 22px;
            font-weight: 800;
            margin: 0;
            color: #0f172a;
            letter-spacing: -0.5px;
          }
          .company-desc {
            font-size: 11px;
            color: #64748b;
            margin: 2px 0 0;
          }
          .invoice-meta {
            text-align: right;
          }
          .invoice-pill {
            display: inline-block;
            background: #eff6ff;
            color: #2563eb;
            font-size: 12px;
            font-weight: 800;
            padding: 4px 10px;
            border-radius: 20px;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }
          .invoice-id {
            font-size: 20px;
            font-weight: 800;
            margin: 0;
            font-family: monospace;
            color: #1e293b;
          }
          .invoice-date {
            font-size: 11px;
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
          .action-bar {
            margin-bottom: 24px;
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }
          .print-btn {
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(37,99,235,0.3);
          }
          .close-btn {
            background: #ffffff;
            color: #334155;
            border: 1px solid #cbd5e1;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          }
          @media print {
            body { background: white; padding: 0; }
            .invoice-card { border: none; box-shadow: none; padding: 10px; }
            .action-bar { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div style="width: 100%; max-width: 800px;">
          <div class="action-bar">
            <button class="close-btn" onclick="window.close()">Close Window</button>
            <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
          </div>

          <div class="invoice-card">
            <div class="header-row">
              <div class="company-logo">
                <div class="logo-badge">BK</div>
                <div>
                  <h1 class="company-title">BOOKSPHERE INC.</h1>
                  <p class="company-desc">Fulfillment Center & Registered Bookseller</p>
                  <p class="company-desc">GSTIN: 21AAACB1234D1Z8 • contact@booksphere.com</p>
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
                <p>${order.city}</p>
              </div>
              <div class="bill-col">
                <h4>Payment & Logistics</h4>
                <p>Payment Mode: <strong>${order.payment}</strong></p>
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
                      <strong>${idx + 1}.${it.title}</strong>
                      <div style="font-size: 10.5px; color: #64748b;">${it.author || "Standard Edition"}</div>
                    </td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right;">₹${(it.price || 499).toLocaleString("en-IN")}</td>
                    <td style="text-align: right;">₹${(it.price || 499).toLocaleString("en-IN")}</td>
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
        </div>
      </body>
      </html>
    `;

    // Open receipt in clean print-ready pop-up window
    const printWindow = window.open("", "_blank", "width=880,height=920");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      printWindow.focus();
    } else {
      // Fallback: Trigger instant JSON receipt download if popups are blocked
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
          <button className="OrderSecondaryBtn" onClick={resetFilters} title="Refresh Table">
            <FiRefreshCw />
            <span>Sync</span>
          </button>
          <button className="OrderPrimaryBtn" title="Export CSV Data">
            <FiDownload />
            <span>Export Data</span>
          </button>
        </div>
      </header>

      {/* STATS OVERVIEW */}
      <section className="OrderStatsGrid">
        <div className="OrderStatCard OrderStatCardOrders">
          <div className="OrderStatIcon OrderStatBlue">
            <FiShoppingBag />
          </div>
          <div className="OrderStatContent">
            <span>TOTAL ORDERS</span>
            <strong>1,248</strong>
            <small className="OrderPositive">↑ 12.4% vs last mo</small>
          </div>
        </div>

        <div className="OrderStatCard OrderStatCardRevenue">
          <div className="OrderStatIcon OrderStatOrange">
            <FiDollarSign />
          </div>
          <div className="OrderStatContent">
            <span>GROSS REVENUE</span>
            <strong>₹2,45,680</strong>
            <small className="OrderPositive">↑ 18.2% vs last mo</small>
          </div>
        </div>

        <div className="OrderStatCard OrderStatCardDelivered">
          <div className="OrderStatIcon OrderStatGreen">
            <FiTruck />
          </div>
          <div className="OrderStatContent">
            <span>DELIVERED RATIO</span>
            <strong>980</strong>
            <small className="OrderPositive">↑ 94.6% success</small>
          </div>
        </div>

        <div className="OrderStatCard OrderStatCardPending">
          <div className="OrderStatIcon OrderStatRed">
            <FiClock />
          </div>
          <div className="OrderStatContent">
            <span>PENDING ACTION</span>
            <strong>168</strong>
            <small className="OrderNegative">↓ 4.8% SLA alert</small>
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
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
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
              <option>COD</option>
              <option>Failed</option>
              <option>Refunded</option>
            </select>
            <FiChevronDown />
          </div>

          <div className="OrderDateBox">
            <FiCalendar />
            <span>Oct 01 - Oct 31, 2026</span>
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
              {currentOrders.map((order) => {
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
                          {order.customer.charAt(0)}
                        </div>
                        <div className="OrderCustomerInfo">
                          <strong>{order.customer}</strong>
                          <span>{order.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="OrderBooks">
                        {order.books.map((bookIndex, index) => {
                          const book = books[bookIndex];
                          return (
                            <div
                              key={index}
                              className="OrderBookCover"
                              style={{ background: book.color }}
                              title={book.title}
                            >
                              {book.text.split("\n").map((text) => (
                                <span key={text}>{text}</span>
                              ))}
                            </div>
                          );
                        })}
                        {order.more > 0 && (
                          <span className="OrderMoreBooks">
                            +{order.more} more
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
                        {/* PREMIUM RECEIPT DOWNLOAD BUTTON */}
                        <button
                          className={`OrderActionButton OrderReceiptButton ${
                            isDownloading ? "OrderReceiptLoading" : ""
                          }`}
                          title="Download & Print Order Tax Receipt"
                          onClick={() => handleDownloadReceipt(order)}
                          disabled={isDownloading}
                        >
                          <FiPrinter />
                          <span>{isDownloading ? "Printing..." : "Receipt"}</span>
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
              })}

              {currentOrders.length === 0 && (
                <tr>
                  <td colSpan="9" className="OrderEmptyState">
                    <div className="OrderEmptyBox">
                      <FiPackage />
                      <h3>No Matching Orders Found</h3>
                      <p>
                        We couldn't find anything matching your filters or
                        search terms. Try clearing or updating your filters.
                      </p>
                      <button className="OrderResetButton" onClick={resetFilters}>
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
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
                  onClick={() => handleDownloadReceipt(viewOrder)}
                  title="Print / Save Tax Receipt"
                >
                  <FiPrinter />
                  <span>Download Receipt</span>
                </button>
                <button className="OrderCloseButton" onClick={closeModal}>
                  <FiX />
                </button>
              </div>
            </div>

            <div className="OrderViewTop">
              <div className="OrderBigAvatar">
                {viewOrder.customer.charAt(0)}
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
                  <strong>{viewOrder.city}</strong>
                </div>
              </div>
              <div className="OrderDetailItem">
                <FiCreditCard />
                <div>
                  <span>Payment Method & Status</span>
                  <strong>{viewOrder.payment} (Verified)</strong>
                </div>
              </div>
            </div>

            <div className="OrderModalSection">
              <h3>Items in Package ({viewOrder.books.length + viewOrder.more})</h3>
              <div className="OrderModalBooks">
                {viewOrder.books.map((bookIndex, index) => {
                  const book = books[bookIndex];
                  return (
                    <div className="OrderModalBook" key={index}>
                      <div
                        className="OrderModalBookCover"
                        style={{ background: book.color }}
                      >
                        {book.text.split("\n").map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                      <strong>{book.title}</strong>
                      <small>Qty: 1</small>
                    </div>
                  );
                })}
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
                  className={viewOrder.payment === "Paid" ? "OrderPositive" : "OrderNegative"}
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
                    <option>COD</option>
                    <option>Failed</option>
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
                  <span className={getStatusClass(editForm.status)}>
                    <span className="OrderBadgeDot" />
                    {editForm.status}
                  </span>
                </div>

                <div className="OrderStatusOptions">
                  {[
                    "Pending",
                    "Processing",
                    "Shipped",
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
            <h2>Confirm Permanent Deletion</h2>
            <p>
              Are you sure you want to remove <strong>{deleteOrder.id}</strong> belonging to <strong>{deleteOrder.customer}</strong>? This action cannot be reverted.
            </p>
            <div className="OrderDeleteActions">
              <button className="OrderCancelButton" onClick={closeModal}>
                Cancel
              </button>
              <button className="OrderConfirmDelete" onClick={deleteConfirmed}>
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