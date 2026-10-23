import bookLogo from "../assets/booklogo.webp";

/**
 * Converts image URL into a base64 PNG data URL to ensure html2canvas/jsPDF
 * renders the image without cross-origin issues or format incompatibility.
 */
const getLogoDataUrl = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve("");
    if (url.startsWith("data:")) return resolve(url);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width || 140;
        canvas.height = img.naturalHeight || img.height || 140;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataUri = canvas.toDataURL("image/png");
        resolve(dataUri);
      } catch (e) {
        resolve(url);
      }
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
};

/**
 * Dynamically loads html2pdf.js bundle if not already present on window
 */
export const loadHtml2Pdf = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.html2pdf) {
      resolve(window.html2pdf);
      return;
    }

    const existingScript = document.getElementById("html2pdf-script");
    if (existingScript) {
      existingScript.onload = () => resolve(window.html2pdf);
      existingScript.onerror = () => resolve(null);
      return;
    }

    const script = document.createElement("script");
    script.id = "html2pdf-script";
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.async = true;
    script.onload = () => resolve(window.html2pdf);
    script.onerror = () => {
      console.warn("Could not load html2pdf from CDN");
      resolve(null);
    };
    document.body.appendChild(script);
  });
};

/**
 * Generates and downloads a branded tax invoice directly in PDF format with the official Lekhani Books logo in Admin Panel.
 * Opens preview and downloads `Invoice_<orderId>.pdf`.
 *
 * @param {Object} order - Order data object from state or backend
 */
export const downloadInvoice = async (order) => {
  if (!order) return;

  const orderId =
    order.orderId ||
    (order.id && !String(order.id).startsWith("rcpt_") ? order.id : null) ||
    (order.rawId ? `ORD-${order.rawId.toString().slice(-6).toUpperCase()}` : "ORD-OFFICIAL");

  const cleanId = String(orderId).replace(/[^a-zA-Z0-9_-]/g, "");

  const customerName =
    order.shippingAddress?.fullName ||
    order.customer ||
    order.user?.name ||
    "Customer";

  const email =
    order.shippingAddress?.email ||
    order.email ||
    order.user?.email ||
    "-";

  const phone =
    order.shippingAddress?.phone ||
    order.phone ||
    order.user?.phone ||
    "-";

  const fullAddress =
    order.fullAddress ||
    (order.shippingAddress
      ? `${order.shippingAddress.street || ""}, ${
          order.shippingAddress.locality ? order.shippingAddress.locality + ", " : ""
        }${order.shippingAddress.city || ""}, ${
          order.shippingAddress.state || "Odisha"
        } - ${order.shippingAddress.pincode || ""}`
      : order.city || "Odisha, India");

  const rawItems = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [
        {
          title: "Books Order",
          author: "Lekhani Publications",
          price: order.pricing?.totalAmount || order.amount || 0,
          quantity: 1,
        },
      ];

  const totalAmount = Number(
    order.pricing?.totalAmount || order.totalAmount || order.amount || 0
  );

  const couponCode =
    order.pricing?.couponCode ||
    order.couponCode ||
    order.rawOrder?.pricing?.couponCode ||
    order.coupon?.code ||
    order.coupon ||
    "";

  const discount = Number(
    order.pricing?.discount ||
    order.discount ||
    order.rawOrder?.pricing?.discount ||
    order.couponDiscount ||
    0
  );

  const rawSubtotal = Number(
    order.pricing?.itemsSubtotal ||
    order.itemsSubtotal ||
    order.rawOrder?.pricing?.itemsSubtotal ||
    (Array.isArray(rawItems) && rawItems.length > 0
      ? rawItems.reduce((acc, it) => acc + Number(it.price || 0) * Number(it.quantity || 1), 0)
      : totalAmount + discount)
  );

  const subtotal = rawSubtotal;
  const shipping = Number(
    order.pricing?.shippingFee ??
    order.shippingFee ??
    order.rawOrder?.pricing?.shippingFee ??
    0
  );

  const paymentId =
    order.paymentInfo?.razorpayPaymentId ||
    order.paymentId ||
    order.paymentInfo?.paymentId ||
    "Online Pre-paid";

  const paymentMethod =
    order.paymentMethod ||
    order.paymentInfo?.method ||
    "Online Payment";

  const paymentStatus =
    order.payment ||
    order.paymentInfo?.status ||
    "Paid";

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : order.date || "Today";

  const orderTime = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : order.time || "";

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fullLogoUrl =
    bookLogo.startsWith("http") || bookLogo.startsWith("data:")
      ? bookLogo
      : `${origin}${bookLogo.startsWith("/") ? "" : "/"}${bookLogo}`;

  // Get Base64 PNG logo for error-free canvas rendering
  let logoDataUrl = fullLogoUrl;
  try {
    logoDataUrl = await getLogoDataUrl(fullLogoUrl);
  } catch (e) {
    logoDataUrl = fullLogoUrl;
  }

  // Build the invoice card HTML
  const invoiceCardHtml = `
    <div class="invoice-card" style="width: 760px; margin: 0 auto; background: #ffffff; padding: 32px 36px; border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; box-sizing: border-box;">
      <style>
        * { box-sizing: border-box; }
        .invoice-card { background: #ffffff; color: #0f172a; }
        .header-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 2px solid #2563eb; gap: 16px; }
        .brand-section { display: flex; align-items: center; gap: 14px; }
        .brand-logo-img { width: 62px; height: 62px; object-fit: contain; }
        .brand-text h1 { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; margin: 0; }
        .brand-text p { font-size: 11px; color: #64748b; margin: 2px 0 0; }
        .invoice-meta { text-align: right; }
        .invoice-pill { display: inline-block; background: #eff6ff; color: #2563eb; font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 4px; border: 1px solid #bfdbfe; }
        .invoice-id { font-size: 18px; font-weight: 800; color: #0f172a; margin: 5px 0 3px; }
        .invoice-date { font-size: 11.5px; color: #64748b; }
        .billing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; padding: 14px 18px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
        .bill-col h4 { margin: 0 0 6px; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; }
        .bill-col strong { font-size: 13.5px; color: #0f172a; display: block; margin-bottom: 2px; }
        .bill-col p { margin: 2px 0; font-size: 11.5px; color: #475569; }
        .bill-col code { background: #e2e8f0; padding: 1px 4px; border-radius: 3px; font-size: 10.5px; }
        .status-badge { display: inline-block; margin-top: 5px; padding: 2px 8px; border-radius: 4px; font-size: 10.5px; font-weight: 700; }
        .badge-paid { background: #dcfce7; color: #15803d; }
        .badge-failed { background: #fee2e2; color: #b91c1c; }
        .badge-pending { background: #fef3c7; color: #b45309; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .items-table th { text-align: left; font-size: 10.5px; text-transform: uppercase; color: #64748b; padding: 9px 12px; background: #f1f5f9; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
        .items-table td { padding: 10px 12px; font-size: 12.5px; color: #334155; border-bottom: 1px solid #f1f5f9; }
        .summary-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
        .summary-table { width: 280px; border-collapse: collapse; }
        .summary-table td { padding: 5px 10px; font-size: 12px; color: #64748b; }
        .summary-table td:last-child { text-align: right; font-weight: 600; color: #0f172a; }
        .summary-total { border-top: 2px solid #e2e8f0; font-size: 14.5px !important; font-weight: 800 !important; color: #2563eb !important; padding-top: 8px !important; }
        .footer-section { margin-top: 28px; padding-top: 14px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #94a3b8; }
        .auth-stamp { color: #059669; font-weight: 600; font-size: 11px; }
      </style>

      <div class="header-row">
        <div class="brand-section">
          <img src="${logoDataUrl}" alt="Lekhani Books" class="brand-logo-img" />
          <div class="brand-text">
            <h1>LEKHANI BOOKS</h1>
            <p>Direct Publications & Distribution • Odisha, India</p>
            <p>Email: publicationlekhani@gmail.com • Phone: +91 9692075298</p>
          </div>
        </div>
        <div class="invoice-meta">
          <span class="invoice-pill">ORIGINAL TAX INVOICE</span>
          <div class="invoice-id">${orderId}</div>
          <div class="invoice-date">Date: <strong>${orderDate}</strong> ${orderTime ? "• " + orderTime : ""}</div>
          <div class="invoice-date">Status: <strong>${order.orderStatus || order.status || "Placed"}</strong></div>
        </div>
      </div>

      <div class="billing-grid">
        <div class="bill-col">
          <h4>Billed & Shipped To</h4>
          <strong>${customerName}</strong>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Address:</strong> ${fullAddress}</p>
        </div>
        <div class="bill-col">
          <h4>Payment & Logistics</h4>
          <p><strong>Payment Mode:</strong> ${paymentMethod}</p>
          <p><strong>Payment ID:</strong> <code>${paymentId}</code></p>
          <p><strong>Logistics:</strong> Express Delivery</p>
          <span class="status-badge ${
            paymentStatus.toLowerCase() === "paid"
              ? "badge-paid"
              : paymentStatus.toLowerCase() === "failed"
              ? "badge-failed"
              : "badge-pending"
          }">
            Payment Status: ${paymentStatus.toUpperCase()}
          </span>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 50%;">Book Title & Author</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rawItems
            .map(
              (item, idx) => {
                const itemPrice = Number(item.price || 0);
                const itemQty = Number(item.quantity || 1);
                const hasOffer = Boolean(item.originalPrice && Number(item.originalPrice) > itemPrice);
                return `
            <tr>
              <td>
                <strong>${idx + 1}. ${item.title}</strong>
                ${item.author ? `<div style="font-size: 11px; color: #64748b;">By ${item.author}</div>` : ""}
                ${hasOffer ? `<div style="font-size: 10px; color: #059669; font-weight: 600; margin-top: 2px;">Special Offer (MRP: ₹${Number(item.originalPrice).toLocaleString("en-IN")})</div>` : ""}
              </td>
              <td style="text-align: center;">${itemQty}</td>
              <td style="text-align: right;">
                ₹${itemPrice.toLocaleString("en-IN")}
                ${hasOffer ? `<div style="font-size: 10px; color: #94a3b8; text-decoration: line-through;">₹${Number(item.originalPrice).toLocaleString("en-IN")}</div>` : ""}
              </td>
              <td style="text-align: right;">₹${(itemPrice * itemQty).toLocaleString("en-IN")}</td>
            </tr>
          `;
              }
            )
            .join("")}
        </tbody>
      </table>

      <div class="summary-wrapper">
        <table class="summary-table">
          <tr>
            <td>Items Subtotal</td>
            <td>₹${rawSubtotal.toLocaleString("en-IN")}</td>
          </tr>
          ${
            discount > 0 || couponCode
              ? `
          <tr style="color: #059669; font-weight: 600;">
            <td>Offer / Coupon Discount ${couponCode ? `(${couponCode})` : ""}</td>
            <td>− ₹${discount.toLocaleString("en-IN")}</td>
          </tr>`
              : ""
          }
          <tr>
            <td class="summary-total">Total Amount</td>
            <td class="summary-total">₹${totalAmount.toLocaleString("en-IN")}</td>
          </tr>
        </table>
      </div>

      <div class="footer-section">
        <div>
          <span>Thank you for choosing Lekhani Books! This is an electronically generated authentic tax invoice.</span>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 3px;">Ref: ${cleanId}-${Date.now().toString().slice(-6)}</div>
        </div>
        <div class="auth-stamp">
          ✔ Digitally Verified & Authenticated
        </div>
      </div>
    </div>
  `;

  // Create temporary offscreen container for html2pdf
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "760px";
  container.style.background = "#ffffff";
  container.style.zIndex = "-1000";
  container.innerHTML = invoiceCardHtml;
  document.body.appendChild(container);

  try {
    const html2pdf = await loadHtml2Pdf();
    if (html2pdf) {
      const opt = {
        margin: [10, 8, 10, 8],
        filename: `Invoice_${cleanId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      const targetEl = container.firstElementChild || container;
      const worker = html2pdf().set(opt).from(targetEl);

      // Direct download of the real .pdf file to user's device
      await worker.save();
      container.remove();
      return;
    }
  } catch (pdfErr) {
    console.error("html2pdf generation failed, falling back to print window:", pdfErr);
  }

  // Fallback: If html2pdf could not run, open print window for Save as PDF
  container.remove();
  try {
    const printWindow = window.open("", "_blank", "width=860,height=900");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice_${cleanId}</title>
        </head>
        <body style="margin:0; padding:20px; background:#f8fafc; display:flex; justify-content:center;">
          ${invoiceCardHtml}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    }
  } catch (e) {
    console.error("Fallback print window error:", e);
  }
};
