const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

// Public hosted logo URL for clean inline rendering in email clients without attachment clutter
const getLogoUrl = () => {
  return (
    process.env.EMAIL_LOGO_URL ||
    process.env.APP_LOGO_URL ||
    "https://raw.githubusercontent.com/CODE-WITH-PRASANTA/Likhani-Book-/main/backend/src/assets/logo.png"
  );
};

// Helper to sanitize payment method so third-party payment gateways (Razorpay) are never mentioned
const cleanPaymentMethod = (method) => {
  if (!method) return "Online";
  const cleaned = String(method)
    .replace(/razorpay/gi, "")
    .replace(/^[\s/•-]+|[\s/•-]+$/g, "")
    .trim();
  return cleaned || "Online";
};

// Support contact email
const getSupportEmail = () => {
  return (
    process.env.SUPPORT_EMAIL ||
    process.env.EMAIL_USER ||
    "publicationlekhani@gmail.com"
  ).trim();
};

/**
 * Lekhani Books - Professional Transactional Email Engine
 * Handles branded, responsive HTML notifications for:
 * 1. Order Confirmation (Placed / Paid)
 * 2. Payment Failed (Pending / Declined)
 * 3. Order Shipped (In Transit / Dispatched)
 * 4. Order Delivered (Successfully Handed Over)
 * 5. Order Cancelled / Status Updates
 */

// Cached transporter instance
let transporter = null;

/**
 * Reset transporter cache (useful after env update or for testing)
 */
const resetTransporter = () => {
  transporter = null;
};

/**
 * Initializes and returns the Nodemailer Transporter
 */
const getTransporter = () => {
  if (transporter) return transporter;

  const emailService = process.env.EMAIL_SERVICE;
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = Number(process.env.EMAIL_PORT) || 465;
  const emailSecure = process.env.EMAIL_SECURE === "true" || emailPort === 465;
  const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
  const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, "") : "";

  if (!emailUser || !emailPass) {
    // Graceful fallback: return a transporter with logger enabled if credentials missing
    transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: emailUser || "mock@likhanibooks.local",
        pass: emailPass || "mockpass",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    return transporter;
  }

  if (
    (emailService && emailService.toLowerCase() === "gmail") ||
    (emailHost && emailHost.includes("gmail"))
  ) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass, // Gmail 16-character App Password
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  } else {
    transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return transporter;
};

/**
 * Helper to safely extract recipient email from order object
 */
const getRecipientEmail = (order) => {
  if (
    order?.shippingAddress?.email &&
    typeof order.shippingAddress.email === "string" &&
    order.shippingAddress.email.includes("@")
  ) {
    return order.shippingAddress.email.trim().toLowerCase();
  }
  if (
    order?.user?.email &&
    typeof order.user.email === "string" &&
    order.user.email.includes("@")
  ) {
    return order.user.email.trim().toLowerCase();
  }
  if (
    order?.email &&
    typeof order.email === "string" &&
    order.email.includes("@")
  ) {
    return order.email.trim().toLowerCase();
  }
  return null;
};

/**
 * Checks whether email sending credentials are properly configured
 */
const isEmailConfigured = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  return Boolean(user && pass && user.trim() !== "" && pass.trim() !== "");
};

/**
 * Formats a currency amount in INR
 */
const formatINR = (val) => {
  const num = Number(val) || 0;
  return "₹" + num.toLocaleString("en-IN");
};

/**
 * Formats a date string
 */
const formatDate = (dateVal) => {
  try {
    const d = dateVal ? new Date(dateVal) : new Date();
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return "Recent";
  }
};

/**
 * Base email layout wrapper with modern luxury typography, Lekhani branding, and responsive design
 */
const generateEmailTemplate = ({
  headerTitle,
  headerSubtitle,
  badgeText,
  badgeColor = "info", // 'success' | 'warning' | 'danger' | 'info' | 'primary'
  themeGradient = "linear-gradient(135deg, #0b192c 0%, #1e3a8a 55%, #1d4ed8 100%)",
  accentBorderColor = "#d97706",
  greeting,
  messageHtml,
  order,
  actionButton,
}) => {
  const badgeStyles = {
    success: "background-color: #dcfce7; color: #15803d; border: 1px solid #86efac;",
    warning: "background-color: #fef3c7; color: #b45309; border: 1px solid #fcd34d;",
    danger: "background-color: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;",
    info: "background-color: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc;",
    primary: "background-color: #ede9fe; color: #6d28d9; border: 1px solid #c4b5fd;",
  };

  const badgeStyle = badgeStyles[badgeColor] || badgeStyles.info;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  const items = Array.isArray(order?.items) ? order.items : [];
  const orderId = order?.orderId || (order?._id ? `ORD-${order._id.toString().slice(-6).toUpperCase()}` : "N/A");
  const customerName = order?.shippingAddress?.fullName || "Valued Reader";
  const address = order?.shippingAddress || {};
  const pricing = order?.pricing || {};
  const totalAmount = pricing.totalAmount || order?.amount || 0;
  const subtotal = pricing.itemsSubtotal || totalAmount;
  const discount = pricing.discount || 0;
  const shippingFee = pricing.shippingFee || 0;

  const fullAddress = [
    address.street,
    address.locality,
    address.city,
    address.state,
    address.pincode ? `- ${address.pincode}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const itemsRowsHtml = items
    .map(
      (item, idx) => `
      <tr>
        <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #1e293b; vertical-align: middle;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 3px; font-size: 14px;">${idx + 1}. ${item.title || "Book"}</div>
          <div style="font-size: 12px; color: #64748b; font-weight: 500;">Author: ${item.author || "Unknown"}</div>
        </td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #475569; text-align: center; vertical-align: middle;">
          <span style="display: inline-block; background: #f1f5f9; color: #334155; font-weight: 700; padding: 3px 10px; border-radius: 12px; font-size: 12px;">${item.quantity || 1}</span>
        </td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #0f172a; font-weight: 600; text-align: right; vertical-align: middle;">
          ${formatINR(item.price || 0)}
        </td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1d4ed8; font-weight: 800; text-align: right; vertical-align: middle;">
          ${formatINR((Number(item.price) || 0) * (Number(item.quantity) || 1))}
        </td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle} - Lekhani Books</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #334155;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 28px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: ${themeGradient}; padding: 36px 24px 30px; text-align: center; border-bottom: 3px solid ${accentBorderColor};">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${clientUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img
                        src="${getLogoUrl()}"
                        alt="Lekhani Books"
                        width="96"
                        height="88"
                        style="display: block; margin: 0 auto 12px; width: 96px; max-width: 96px; height: auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.45));"
                      />
                    </a>
                    <h1 style="margin: 0 0 4px; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 1.2px; text-transform: uppercase;">LEKHANI BOOKS</h1>
                    <p style="margin: 0; font-size: 12.5px; color: #cbd5e1; font-weight: 500; letter-spacing: 0.4px;">${headerSubtitle || "Direct Literature Distribution &amp; Publications"}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Bar -->
          <tr>
            <td style="padding: 24px 32px 10px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; ${badgeStyle}">
                      ${badgeText}
                    </span>
                  </td>
                  <td align="right" style="font-size: 12px; color: #64748b;">
                    Order Ref: <strong style="color: #0f172a; font-family: monospace; font-size: 13px;">${orderId}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 14px 32px 20px;">
              <h2 style="margin: 0 0 12px; font-size: 19px; font-weight: 800; color: #0f172a;">
                ${greeting || `Hello ${customerName},`}
              </h2>
              <div style="font-size: 14.5px; line-height: 1.65; color: #475569;">
                ${messageHtml}
              </div>

              ${
                actionButton
                  ? `
                <div style="margin: 26px 0 12px; text-align: center;">
                  <a href="${actionButton.url}" target="_blank" style="display: inline-block; background: ${actionButton.color || "#2563eb"}; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 30px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2); letter-spacing: 0.3px;">
                    ${actionButton.text}
                  </a>
                </div>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- Order Summary Section -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 22px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.8px; padding-bottom: 8px;">Order Details</td>
                    <td align="right" style="font-size: 12px; color: #64748b; padding-bottom: 8px;">Date: <strong style="color: #1e293b;">${formatDate(order?.createdAt)}</strong></td>
                  </tr>
                  <tr>
                    <td colspan="2" style="font-size: 13.5px; color: #334155; padding-top: 6px; border-top: 1px dashed #e2e8f0;">
                      Payment: <strong style="color: #0f172a;">${cleanPaymentMethod(order?.paymentInfo?.method)}</strong> &bull; 
                      Status: <strong style="color: ${badgeColor === "danger" ? "#dc2626" : "#16a34a"};">${order?.paymentInfo?.status || "Paid"}</strong>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Books List Table -->
              <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.8px;">Items in this Package</h3>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f1f5f9;">
                    <th style="padding: 12px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; text-align: left; letter-spacing: 0.5px;">Book Title</th>
                    <th style="padding: 12px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; text-align: center; width: 60px; letter-spacing: 0.5px;">Qty</th>
                    <th style="padding: 12px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; text-align: right; width: 85px; letter-spacing: 0.5px;">Price</th>
                    <th style="padding: 12px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; text-align: right; width: 95px; letter-spacing: 0.5px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRowsHtml || `<tr><td colspan="4" style="padding: 16px; text-align: center; color: #64748b; font-size: 13px;">Package Items</td></tr>`}
                </tbody>
              </table>

              <!-- Pricing Breakdown -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td width="48%"></td>
                  <td width="52%">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
                      <tr>
                        <td style="padding: 5px 0; color: #64748b;">Subtotal:</td>
                        <td align="right" style="padding: 5px 0; font-weight: 600; color: #1e293b;">${formatINR(subtotal)}</td>
                      </tr>
                      ${
                        discount > 0
                          ? `<tr>
                              <td style="padding: 5px 0; color: #16a34a; font-weight: 600;">Coupon Discount:</td>
                              <td align="right" style="padding: 5px 0; font-weight: 700; color: #16a34a;">-${formatINR(discount)}</td>
                            </tr>`
                          : ""
                      }
                      <tr>
                        <td style="padding: 5px 0; color: #64748b;">Delivery Fee:</td>
                        <td align="right" style="padding: 5px 0; font-weight: 600; color: #16a34a;">${shippingFee === 0 ? "FREE" : formatINR(shippingFee)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0 4px; border-top: 2px solid #e2e8f0; font-size: 15px; font-weight: 800; color: #0f172a;">Total Paid:</td>
                        <td align="right" style="padding: 12px 0 4px; border-top: 2px solid #e2e8f0; font-size: 17px; font-weight: 800; color: #1d4ed8;">${formatINR(totalAmount)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Shipping Destination Box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.8px; padding-bottom: 6px;">
                      📍 Delivery Address
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; font-weight: 700; color: #0f172a; padding-bottom: 3px;">
                      ${customerName}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; color: #475569; line-height: 1.55; padding-bottom: 4px;">
                      ${fullAddress || "Address provided during checkout"}
                    </td>
                  </tr>
                  ${address.phone ? `<tr><td style="font-size: 12.5px; color: #64748b; padding-top: 4px; border-top: 1px dashed #e2e8f0;">Phone: <strong style="color: #1e293b;">${address.phone}</strong></td></tr>` : ""}
                </table>
              </div>
            </td>
          </tr>

          <!-- Trust Badges -->
          <tr>
            <td style="padding: 0 32px 28px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 12px 10px;">
                <tr>
                  <td align="center" width="25%" style="font-size: 11px; color: #475569; font-weight: 700; padding: 4px 6px; line-height: 1.3;">
                    <span style="font-size: 16px; display: block; margin-bottom: 3px;">📖</span> Authentic Books
                  </td>
                  <td align="center" width="25%" style="font-size: 11px; color: #475569; font-weight: 700; padding: 4px 6px; line-height: 1.3; border-left: 1px solid #e2e8f0;">
                    <span style="font-size: 16px; display: block; margin-bottom: 3px;">📦</span> Safe Packaging
                  </td>
                  <td align="center" width="25%" style="font-size: 11px; color: #475569; font-weight: 700; padding: 4px 6px; line-height: 1.3; border-left: 1px solid #e2e8f0;">
                    <span style="font-size: 16px; display: block; margin-bottom: 3px;">🚚</span> Express Dispatch
                  </td>
                  <td align="center" width="25%" style="font-size: 11px; color: #475569; font-weight: 700; padding: 4px 6px; line-height: 1.3; border-left: 1px solid #e2e8f0;">
                    <span style="font-size: 16px; display: block; margin-bottom: 3px;">💬</span> Quick Support
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Information -->
          <tr>
            <td style="background-color: #0f172a; padding: 26px 32px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6; border-top: 1px solid #1e293b;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 10px;">
                <tr>
                  <td align="center" style="vertical-align: middle;">
                    <a href="${clientUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img
                        src="${getLogoUrl()}"
                        alt="Lekhani Books"
                        width="32"
                        height="29"
                        style="display: inline-block; vertical-align: middle; width: 32px; height: auto; margin-right: 8px; border: 0;"
                      />
                      <span style="font-size: 14px; font-weight: 700; color: #f8fafc; vertical-align: middle; letter-spacing: 0.5px;">LEKHANI BOOKS</span>
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 6px; color: #cbd5e1; font-weight: 500;">Dedicated to Odia and Indian Literature &bull; Fast &amp; Safe Dispatch Nationwide</p>
              <p style="margin: 0 0 8px; font-size: 11.5px; color: #64748b;">
                Need help with your order? Reach our support team at <a href="mailto:${getSupportEmail()}" style="color: #60a5fa; text-decoration: none; font-weight: 600;">${getSupportEmail()}</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} Lekhani Books Publications. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Low-level email sending helper with automatic CID logo attachment
 */
const sendMail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    if (!to || typeof to !== "string" || !to.includes("@")) {
      console.warn("[EmailService] No valid recipient email address provided. Skipped.", to);
      return { success: false, reason: "Invalid recipient email" };
    }

    const mailer = getTransporter();
    const fromAddress =
      process.env.EMAIL_FROM ||
      `"Lekhani Books" <${process.env.EMAIL_USER || "publicationlekhani@gmail.com"}>`;

    // Low-level email sending: no logo file attachment so Gmail does not show downloadable file attachments
    const finalAttachments = Array.isArray(attachments) ? [...attachments] : [];

    if (!isEmailConfigured()) {
      console.log(`[EmailService - SIMULATION MODE] ✉️ Email to: ${to} | Subject: "${subject}"`);
      console.log("[EmailService] (Set EMAIL_USER and EMAIL_PASS in backend/.env to send real emails via Gmail/SMTP)");
      return {
        success: true,
        simulated: true,
        message: "Email logged in simulation mode (credentials not configured)",
      };
    }

    const mailOptions = {
      from: fromAddress,
      to: to.trim().toLowerCase(),
      subject: subject,
      html: html,
      text: text || subject,
    };

    if (finalAttachments.length > 0) {
      mailOptions.attachments = finalAttachments;
    }

    const info = await mailer.sendMail(mailOptions);

    console.log(`[EmailService] ✅ Email dispatched to ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] ❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 1. ORDER CONFIRMATION / PLACED EMAIL
 * Triggered when a customer buys a book and payment is successful (or placed)
 */
const sendOrderConfirmationEmail = async (order) => {
  try {
    const recipient = getRecipientEmail(order);
    if (!recipient) return { success: false, reason: "No email in order" };

    const orderId = order.orderId || order._id;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const html = generateEmailTemplate({
      headerTitle: "Order Confirmed",
      headerSubtitle: "Order Confirmation & Invoice Receipt",
      themeGradient: "linear-gradient(135deg, #0b192c 0%, #1e3a8a 55%, #1d4ed8 100%)",
      accentBorderColor: "#f59e0b",
      badgeText: "Order Confirmed & Paid",
      badgeColor: "success",
      greeting: `Thank you for your order, ${order.shippingAddress?.fullName || "Reader"}!`,
      messageHtml: `
        <p>Your order <strong>#${orderId}</strong> has been successfully placed and payment is confirmed.</p>
        <p>Our warehouse team is carefully packing your curated books. As soon as your parcel is handed over to our courier partner, we will send you shipping and tracking details.</p>
      `,
      order: order,
      actionButton: {
        text: "View My Orders",
        url: `${clientUrl}/orders`,
        color: "#1d4ed8",
      },
    });

    return await sendMail({
      to: recipient,
      subject: `Order Confirmed: #${orderId} - Lekhani Books`,
      html: html,
      text: `Thank you for your order #${orderId} from Lekhani Books! We have received your payment of ${formatINR(order?.pricing?.totalAmount || order?.amount)}. We are preparing your books for dispatch.`,
    });
  } catch (err) {
    console.error("[EmailService] Error in sendOrderConfirmationEmail:", err);
    return { success: false, error: err.message };
  }
};

/**
 * 2. PAYMENT FAILED / PENDING ALERT EMAIL
 * Triggered when Razorpay reports payment.failed, verification fails, or transaction is declined
 */
const sendPaymentFailedEmail = async (order, reason = "") => {
  try {
    const recipient = getRecipientEmail(order);
    if (!recipient) return { success: false, reason: "No email in order" };

    const orderId = order.orderId || order._id;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const failureDescription =
      reason || "The payment transaction could not be completed by your bank or card network.";

    const html = generateEmailTemplate({
      headerTitle: "Payment Failed",
      headerSubtitle: "Payment Notification & Recovery",
      themeGradient: "linear-gradient(135deg, #18181b 0%, #4c0519 50%, #881337 100%)",
      accentBorderColor: "#f43f5e",
      badgeText: "Payment Incomplete / Failed",
      badgeColor: "danger",
      greeting: `Hello ${order.shippingAddress?.fullName || "Reader"},`,
      messageHtml: `
        <p>We noticed that the payment for order <strong>#${orderId}</strong> could not be completed.</p>
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 14px; margin: 14px 0; border-radius: 4px; font-size: 13.5px; color: #991b1b;">
          <strong>Issue:</strong> ${failureDescription}
        </div>
        <p>Don't worry! Your selected books are safely held in your order history. If money was debited from your bank account, it will automatically be refunded by your bank within 3-5 working days.</p>
        <p>You can easily retry payment using UPI, NetBanking, Debit/Credit Card, or another payment option.</p>
      `,
      order: order,
      actionButton: {
        text: "Retry Order Payment",
        url: `${clientUrl}/orders`,
        color: "#dc2626",
      },
    });

    return await sendMail({
      to: recipient,
      subject: `Action Required: Payment Failed for Order #${orderId} - Lekhani Books`,
      html: html,
      text: `Your payment for order #${orderId} could not be completed (${failureDescription}). Please visit ${clientUrl}/orders to retry your payment.`,
    });
  } catch (err) {
    console.error("[EmailService] Error in sendPaymentFailedEmail:", err);
    return { success: false, error: err.message };
  }
};

/**
 * 3. ORDER SHIPPED / IN TRANSIT EMAIL
 * Triggered when admin marks order status as "Shipped"
 */
const sendOrderShippedEmail = async (order, trackingInfo = {}) => {
  try {
    const recipient = getRecipientEmail(order);
    if (!recipient) return { success: false, reason: "No email in order" };

    const orderId = order.orderId || order._id;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const carrier = trackingInfo.carrier || "Standard Expedited Courier";
    const trackingNumber = trackingInfo.trackingNumber || `LKN-${orderId.toString().replace(/[^0-9A-Z]/gi, "").slice(-8)}`;

    const html = generateEmailTemplate({
      headerTitle: "Order Shipped",
      headerSubtitle: "Dispatch & Courier Tracking",
      themeGradient: "linear-gradient(135deg, #062b3f 0%, #0369a1 55%, #0284c7 100%)",
      accentBorderColor: "#38bdf8",
      badgeText: "Dispatched & In Transit 🚚",
      badgeColor: "info",
      greeting: `Exciting news, ${order.shippingAddress?.fullName || "Reader"}!`,
      messageHtml: `
        <p>Your package for order <strong>#${orderId}</strong> has been handed over to our courier partner and is on its way to your doorstep.</p>
        <div style="background-color: #f0fdf4; border: 1px dashed #86efac; border-radius: 8px; padding: 14px; margin: 16px 0;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
            <tr>
              <td style="color: #64748b; padding: 3px 0;">Courier Partner:</td>
              <td align="right" style="font-weight: 700; color: #0f172a;">${carrier}</td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 3px 0;">Tracking ID / AWB:</td>
              <td align="right" style="font-weight: 700; color: #0284c7;">${trackingNumber}</td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 3px 0;">Estimated Delivery:</td>
              <td align="right" style="font-weight: 600; color: #16a34a;">Within 2-5 Business Days</td>
            </tr>
          </table>
        </div>
        <p>Please ensure someone is available at the delivery address to receive the parcel.</p>
      `,
      order: order,
      actionButton: {
        text: "Track Your Order",
        url: `${clientUrl}/orders`,
        color: "#0284c7",
      },
    });

    return await sendMail({
      to: recipient,
      subject: `Your Lekhani Books Order #${orderId} is on the way! 🚚`,
      html: html,
      text: `Great news! Your order #${orderId} from Lekhani Books has been shipped via ${carrier} (Tracking: ${trackingNumber}).`,
    });
  } catch (err) {
    console.error("[EmailService] Error in sendOrderShippedEmail:", err);
    return { success: false, error: err.message };
  }
};

/**
 * 4. ORDER OUT FOR DELIVERY EMAIL
 * Triggered when admin marks order status as "Out for Delivery"
 */
const sendOrderOutForDeliveryEmail = async (order, trackingInfo = {}) => {
  try {
    const recipient = getRecipientEmail(order);
    if (!recipient) return { success: false, reason: "No email in order" };

    const orderId = order.orderId || order._id;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const carrier = order.deliveryPartner || trackingInfo.carrier || "Delivery Executive";
    const agentPhone = order.deliveryAgentPhone || "";
    const expectedDate = order.expectedDeliveryDate || "Today";

    const html = generateEmailTemplate({
      headerTitle: "Out for Delivery",
      headerSubtitle: "Doorstep Arrival Today",
      themeGradient: "linear-gradient(135deg, #1c1917 0%, #78350f 50%, #b45309 100%)",
      accentBorderColor: "#fbbf24",
      badgeText: "Out for Delivery Today 🛵",
      badgeColor: "warning",
      greeting: `Get ready, ${order.shippingAddress?.fullName || "Reader"}!`,
      messageHtml: `
        <p>Your package for order <strong>#${orderId}</strong> is <strong>Out for Delivery</strong> and will be arriving at your doorstep today.</p>
        <div style="background-color: #fffbeb; border: 1px dashed #fde68a; border-radius: 8px; padding: 14px; margin: 16px 0;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
            <tr>
              <td style="color: #64748b; padding: 3px 0;">Delivery Partner:</td>
              <td align="right" style="font-weight: 700; color: #0f172a;">${carrier}</td>
            </tr>
            ${
              agentPhone
                ? `
            <tr>
              <td style="color: #64748b; padding: 3px 0;">Delivery Agent Contact:</td>
              <td align="right" style="font-weight: 700; color: #d97706;"><a href="tel:${agentPhone}" style="color: #d97706; text-decoration: none;">${agentPhone}</a></td>
            </tr>`
                : ""
            }
            <tr>
              <td style="color: #64748b; padding: 3px 0;">Expected Delivery:</td>
              <td align="right" style="font-weight: 600; color: #d97706;">${expectedDate}</td>
            </tr>
          </table>
        </div>
        <p>Please keep your phone reachable and ensure someone is available at the delivery address to receive the parcel.</p>
      `,
      order: order,
      actionButton: {
        text: "Track Your Order",
        url: `${clientUrl}/orders`,
        color: "#d97706",
      },
    });

    return await sendMail({
      to: recipient,
      subject: `Out for Delivery: Your Lekhani Books Order #${orderId} will arrive today! 🛵`,
      html: html,
      text: `Your order #${orderId} from Lekhani Books is out for delivery today via ${carrier}. Please ensure someone is available at your address to receive the parcel.`,
    });
  } catch (err) {
    console.error("[EmailService] Error in sendOrderOutForDeliveryEmail:", err);
    return { success: false, error: err.message };
  }
};

/**
 * 5. ORDER DELIVERED EMAIL
 * Triggered when admin marks order status as "Delivered"
 */
const sendOrderDeliveredEmail = async (order) => {
  try {
    const recipient = getRecipientEmail(order);
    if (!recipient) return { success: false, reason: "No email in order" };

    const orderId = order.orderId || order._id;

    const html = generateEmailTemplate({
      headerTitle: "Order Delivered",
      headerSubtitle: "Package Successfully Delivered",
      themeGradient: "linear-gradient(135deg, #022c22 0%, #065f46 55%, #059669 100%)",
      accentBorderColor: "#10b981",
      badgeText: "Delivered Successfully 🎉",
      badgeColor: "success",
      greeting: `Your books have arrived, ${order.shippingAddress?.fullName || "Reader"}!`,
      messageHtml: `
        <p>Your package for order <strong>#${orderId}</strong> has been successfully delivered to your address.</p>
        <p>We hope you enjoy reading your new books as much as we enjoyed curating them for you. Happy reading!</p>
      `,
      order: order,
      actionButton: null,
    });

    return await sendMail({
      to: recipient,
      subject: `Delivered: Your Lekhani Books Order #${orderId} has arrived! 🎉`,
      html: html,
      text: `Your order #${orderId} from Lekhani Books has been successfully delivered. Thank you for shopping with us!`,
    });
  } catch (err) {
    console.error("[EmailService] Error in sendOrderDeliveredEmail:", err);
    return { success: false, error: err.message };
  }
};

/**
 * 5. ORDER CANCELLED EMAIL
 * Triggered when order is marked as "Cancelled"
 */
const sendOrderCancelledEmail = async (order, reason = "") => {
  try {
    const recipient = getRecipientEmail(order);
    if (!recipient) return { success: false, reason: "No email in order" };

    const orderId = order.orderId || order._id;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const html = generateEmailTemplate({
      headerTitle: "Order Cancelled",
      headerSubtitle: "Order Cancellation & Refund Notice",
      themeGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
      accentBorderColor: "#64748b",
      badgeText: "Order Cancelled",
      badgeColor: "danger",
      greeting: `Hello ${order.shippingAddress?.fullName || "Reader"},`,
      messageHtml: `
        <p>Your order <strong>#${orderId}</strong> has been cancelled${reason ? `: <em>${reason}</em>` : "."}</p>
        <p>If you have already made payment for this order, your refund has been initiated and will reflect in your original payment method within 5-7 business days.</p>
        <p>If you believe this was a mistake or need further assistance, please contact our support team.</p>
      `,
      order: order,
      actionButton: {
        text: "Browse Store",
        url: `${clientUrl}/shop`,
        color: "#475569",
      },
    });

    return await sendMail({
      to: recipient,
      subject: `Order Cancelled: #${orderId} - Lekhani Books`,
      html: html,
      text: `Your order #${orderId} from Lekhani Books has been cancelled. Any eligible refund will be credited back within 5-7 business days.`,
    });
  } catch (err) {
    console.error("[EmailService] Error in sendOrderCancelledEmail:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Dispatcher helper: intelligently triggers the right email based on status transition
 */
const notifyOrderStatusChange = async ({
  order,
  previousStatus,
  newStatus,
  previousPayment,
  newPayment,
  failureReason,
  trackingInfo,
}) => {
  try {
    if (!order) return;

    // Check payment failure first
    if (newPayment === "Failed" && previousPayment !== "Failed") {
      await sendPaymentFailedEmail(order, failureReason || "Payment could not be verified");
    } else if (
      newPayment === "Paid" &&
      previousPayment !== "Paid" &&
      newStatus !== "Delivered" &&
      newStatus !== "Shipped"
    ) {
      await sendOrderConfirmationEmail(order);
    }

    // Check order status updates
    if (newStatus && newStatus !== previousStatus) {
      switch (newStatus) {
        case "Placed":
          if (newPayment !== "Paid" || previousPayment === "Paid") {
            await sendOrderConfirmationEmail(order);
          }
          break;
        case "Shipped":
          await sendOrderShippedEmail(order, trackingInfo || {});
          break;
        case "Out for Delivery":
          await sendOrderOutForDeliveryEmail(order, trackingInfo || {});
          break;
        case "Delivered":
          await sendOrderDeliveredEmail(order);
          break;
        case "Cancelled":
          await sendOrderCancelledEmail(order, failureReason);
          break;
        default:
          break;
      }
    }
  } catch (err) {
    console.error("[EmailService] Error in notifyOrderStatusChange:", err);
  }
};

/**
 * Sends a sample test email for verification
 */
const sendTestSampleEmail = async ({ to, type = "order_confirmed" }) => {
  const sampleOrder = {
    _id: "6714bc1234567890abcdef12",
    orderId: "ORD-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-9999",
    createdAt: new Date(),
    shippingAddress: {
      fullName: "Saroj Kumar",
      email: to,
      phone: "+91 98765 43210",
      street: "Plot No. 12, Saheed Nagar",
      locality: "Near Ram Mandir",
      city: "Bhubaneswar",
      state: "Odisha",
      pincode: "751007",
    },
    paymentInfo: {
      method: "UPI / Online",
      status: type === "payment_failed" ? "Failed" : "Paid",
      razorpayOrderId: "order_test_rzp123456",
      razorpayPaymentId: "pay_test_987654321",
    },
    items: [
      {
        bookId: "b1",
        title: "Chha Mana Atha Guntha (ଛ ମାଣ ଆଠ ଗୁଣ୍ଠ)",
        author: "Fakir Mohan Senapati",
        quantity: 1,
        price: 320,
      },
      {
        bookId: "b2",
        title: "Matira Manisha (ମାଟିର ମଣିଷ)",
        author: "Kalindi Charan Panigrahi",
        quantity: 2,
        price: 210,
      },
    ],
    pricing: {
      itemsSubtotal: 740,
      discount: 40,
      shippingFee: 0,
      totalAmount: 700,
      currency: "INR",
    },
  };

  switch (type) {
    case "payment_failed":
      return await sendPaymentFailedEmail(
        sampleOrder,
        "Transaction declined by customer's bank or insufficient funds."
      );
    case "order_delivered":
      return await sendOrderDeliveredEmail(sampleOrder);
    case "order_out_for_delivery":
    case "out_for_delivery":
      return await sendOrderOutForDeliveryEmail(sampleOrder, {
        carrier: "Blue Dart Express",
      });
    case "order_shipped":
      return await sendOrderShippedEmail(sampleOrder, {
        carrier: "Blue Dart Express",
        trackingNumber: "BD982736192IN",
      });
    case "order_confirmed":
    default:
      return await sendOrderConfirmationEmail(sampleOrder);
  }
};

/**
 * 6. PASSWORD RESET OTP EMAIL
 * Triggered when a user requests a password reset
 */
const sendPasswordResetOtpEmail = async ({ to, name, otp }) => {
  try {
    if (!to || !to.includes("@")) return { success: false, reason: "Invalid recipient email" };

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const recipientName = name || "Reader";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Lekhani Books</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #334155;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 28px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #030712 0%, #1e1b4b 60%, #312e81 100%); padding: 36px 24px 30px; text-align: center; border-bottom: 3px solid #818cf8;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${clientUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img
                        src="${getLogoUrl()}"
                        alt="Lekhani Books"
                        width="96"
                        height="88"
                        style="display: block; margin: 0 auto 12px; width: 96px; max-width: 96px; height: auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.45));"
                      />
                    </a>
                    <h1 style="margin: 0 0 4px; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 1.2px; text-transform: uppercase;">LEKHANI BOOKS</h1>
                    <p style="margin: 0; font-size: 12.5px; color: #c7d2fe; font-weight: 500; letter-spacing: 0.4px;">Account Security &amp; Verification</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status / Alert Tag -->
          <tr>
            <td style="padding: 24px 32px 10px;">
              <span style="display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; background-color: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe;">
                🔒 Security Verification
              </span>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 14px 32px 24px;">
              <h2 style="margin: 0 0 12px; font-size: 19px; font-weight: 800; color: #0f172a;">
                Password Reset Request
              </h2>
              <p style="font-size: 14.5px; line-height: 1.6; color: #475569; margin: 0 0 14px;">
                Hello <strong>${recipientName}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.65; color: #475569; margin: 0 0 20px;">
                We received a request to reset the password for your Lekhani Books account associated with <strong>${to}</strong>. Use the 6-digit OTP verification code below to authorize your password change:
              </p>

              <!-- OTP Display Box -->
              <div style="text-align: center; margin: 26px 0; background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #6366f1; border-radius: 14px; padding: 24px 20px;">
                <div style="font-size: 11.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                  Your 6-Digit One-Time Code
                </div>
                <div style="font-size: 36px; font-weight: 800; color: #1e1b4b; letter-spacing: 12px; font-family: 'Courier New', Courier, monospace; display: inline-block; background: #ffffff; padding: 10px 28px; border-radius: 10px; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.12);">
                  ${otp}
                </div>
                <p style="margin: 12px 0 0; font-size: 12.5px; color: #dc2626; font-weight: 700;">
                  ⏳ This code expires in 10 minutes.
                </p>
              </div>

              <!-- Security Advisory -->
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; margin: 20px 0; border-radius: 6px; font-size: 13px; color: #92400e; line-height: 1.55;">
                <strong>Security Advisory:</strong> Never share this code with anyone. Lekhani Books representatives will never ask for your verification code. If you did not initiate this request, you can safely disregard this email.
              </div>
            </td>
          </tr>

          <!-- Trust Badges -->
          <tr>
            <td style="padding: 0 32px 28px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 12px 10px;">
                <tr>
                  <td align="center" width="25%" style="font-size: 11px; color: #475569; font-weight: 700; padding: 4px 6px; line-height: 1.3;">
                    <span style="font-size: 16px; display: block; margin-bottom: 3px;">📖</span> Authentic Books
                  </td>
                  <td align="center" width="25%" style="font-size: 11px; color: #475569; font-weight: 700; padding: 4px 6px; line-height: 1.3; border-left: 1px solid #e2e8f0;">
                    <span style="font-size: 16px; display: block; margin-bottom: 3px;">📦</span> Safe Packaging
                  </td>
                  <td align="center" width="25%" style="font-size: 11px; color: #475569; font-weight: 700; padding: 4px 6px; line-height: 1.3; border-left: 1px solid #e2e8f0;">
                    <span style="font-size: 16px; display: block; margin-bottom: 3px;">🚚</span> Express Dispatch
                  </td>
                  <td align="center" width="25%" style="font-size: 11px; color: #475569; font-weight: 700; padding: 4px 6px; line-height: 1.3; border-left: 1px solid #e2e8f0;">
                    <span style="font-size: 16px; display: block; margin-bottom: 3px;">💬</span> Quick Support
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Information -->
          <tr>
            <td style="background-color: #0f172a; padding: 26px 32px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6; border-top: 1px solid #1e293b;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 10px;">
                <tr>
                  <td align="center" style="vertical-align: middle;">
                    <a href="${clientUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img
                        src="${getLogoUrl()}"
                        alt="Lekhani Books"
                        width="32"
                        height="29"
                        style="display: inline-block; vertical-align: middle; width: 32px; height: auto; margin-right: 8px; border: 0;"
                      />
                      <span style="font-size: 14px; font-weight: 700; color: #f8fafc; vertical-align: middle; letter-spacing: 0.5px;">LEKHANI BOOKS</span>
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 6px; color: #cbd5e1; font-weight: 500;">Dedicated to Odia and Indian Literature &bull; Fast &amp; Safe Dispatch Nationwide</p>
              <p style="margin: 0 0 8px; font-size: 11.5px; color: #64748b;">
                Need help? Reach our support team at <a href="mailto:${getSupportEmail()}" style="color: #60a5fa; text-decoration: none; font-weight: 600;">${getSupportEmail()}</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} Lekhani Books Publications. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return await sendMail({
      to: to,
      subject: "Password Reset Request - Lekhani Books",
      html: html,
      text: `Hello ${recipientName},\n\nYour 6-digit verification code to reset your password is: ${otp}\n\nThis code is valid for 10 minutes. If you did not request this, please ignore this email.\n\nLekhani Books Team`,
    });
  } catch (err) {
    console.error("[EmailService] Error in sendPasswordResetOtpEmail:", err);
    return { success: false, error: err.message };
  }
};

/**
 * 7. PASSWORD RESET SUCCESS CONFIRMATION EMAIL
 */
const sendPasswordResetSuccessEmail = async ({ to, name }) => {
  try {
    if (!to || !to.includes("@")) return { success: false, reason: "Invalid recipient email" };

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const recipientName = name || "Reader";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed - Lekhani Books</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #334155;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 28px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0b1329 0%, #064e3b 55%, #065f46 100%); padding: 36px 24px 30px; text-align: center; border-bottom: 3px solid #10b981;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${clientUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img
                        src="${getLogoUrl()}"
                        alt="Lekhani Books"
                        width="96"
                        height="88"
                        style="display: block; margin: 0 auto 12px; width: 96px; max-width: 96px; height: auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.45));"
                      />
                    </a>
                    <h1 style="margin: 0 0 4px; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 1.2px; text-transform: uppercase;">LEKHANI BOOKS</h1>
                    <p style="margin: 0; font-size: 12.5px; color: #a7f3d0; font-weight: 500; letter-spacing: 0.4px;">Account Security Update</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status / Alert Tag -->
          <tr>
            <td style="padding: 24px 32px 10px;">
              <span style="display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;">
                ✓ Password Successfully Updated
              </span>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 14px 32px 24px;">
              <h2 style="margin: 0 0 12px; font-size: 19px; font-weight: 800; color: #0f172a;">
                Your Password Was Changed
              </h2>
              <p style="font-size: 14.5px; line-height: 1.6; color: #475569; margin: 0 0 14px;">
                Hello <strong>${recipientName}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.65; color: #475569; margin: 0 0 22px;">
                The password for your Lekhani Books account (<strong>${to}</strong>) has been changed successfully. You can now log in securely using your new credentials.
              </p>

              <div style="margin: 26px 0 20px; text-align: center;">
                <a href="${clientUrl}/login" target="_blank" style="display: inline-block; background: #059669; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 30px; border-radius: 8px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3); letter-spacing: 0.3px;">
                  Sign In to Your Account
                </a>
              </div>

              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 16px; margin: 22px 0 0; border-radius: 6px; font-size: 13px; color: #991b1b; line-height: 1.55;">
                <strong>Did not make this change?</strong> If you did not authorize this change, please immediately reset your password or contact our support team at <a href="mailto:${getSupportEmail()}" style="color: #dc2626; font-weight: 600;">${getSupportEmail()}</a>.
              </div>
            </td>
          </tr>

          <!-- Trust Badges -->
          <tr>
            <td style="padding: 0 32px 28px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 12px 10px;">
                <tr>
                  <td align="center" width="25%" style="font-size: 11px; color: #475569; font-weight: 700; padding: 4px 6px; line-height: 1.3;">
                    <span style="font-size: 16px; display: block; margin-bottom: 3px;">📖</span> Authentic Books
                  </td>
                  <td align="center" width="25%" style="font-size: 11px; color: #475569; font-weight: 700; padding: 4px 6px; line-height: 1.3; border-left: 1px solid #e2e8f0;">
                    <span style="font-size: 16px; display: block; margin-bottom: 3px;">📦</span> Safe Packaging
                  </td>
                  <td align="center" width="25%" style="font-size: 11px; color: #475569; font-weight: 700; padding: 4px 6px; line-height: 1.3; border-left: 1px solid #e2e8f0;">
                    <span style="font-size: 16px; display: block; margin-bottom: 3px;">🚚</span> Express Dispatch
                  </td>
                  <td align="center" width="25%" style="font-size: 11px; color: #475569; font-weight: 700; padding: 4px 6px; line-height: 1.3; border-left: 1px solid #e2e8f0;">
                    <span style="font-size: 16px; display: block; margin-bottom: 3px;">💬</span> Quick Support
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Information -->
          <tr>
            <td style="background-color: #0f172a; padding: 26px 32px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6; border-top: 1px solid #1e293b;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 10px;">
                <tr>
                  <td align="center" style="vertical-align: middle;">
                    <a href="${clientUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img
                        src="${getLogoUrl()}"
                        alt="Lekhani Books"
                        width="32"
                        height="29"
                        style="display: inline-block; vertical-align: middle; width: 32px; height: auto; margin-right: 8px; border: 0;"
                      />
                      <span style="font-size: 14px; font-weight: 700; color: #f8fafc; vertical-align: middle; letter-spacing: 0.5px;">LEKHANI BOOKS</span>
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 6px; color: #cbd5e1; font-weight: 500;">Dedicated to Odia and Indian Literature &bull; Fast &amp; Safe Dispatch Nationwide</p>
              <p style="margin: 0 0 8px; font-size: 11.5px; color: #64748b;">
                Need help? Reach our support team at <a href="mailto:${getSupportEmail()}" style="color: #60a5fa; text-decoration: none; font-weight: 600;">${getSupportEmail()}</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} Lekhani Books Publications. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return await sendMail({
      to: to,
      subject: `Your Lekhani Books password has been reset successfully`,
      html: html,
      text: `Hello ${recipientName},\n\nYour Lekhani Books account password was reset successfully.\n\nIf you did not perform this action, please contact support immediately.\n\nLekhani Books Team`,
    });
  } catch (err) {
    console.error("[EmailService] Error in sendPasswordResetSuccessEmail:", err);
    return { success: false, error: err.message };
  }
};

module.exports = {
  resetTransporter,
  isEmailConfigured,
  sendMail,
  sendOrderConfirmationEmail,
  sendPaymentFailedEmail,
  sendOrderShippedEmail,
  sendOrderOutForDeliveryEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
  notifyOrderStatusChange,
  sendTestSampleEmail,
  sendPasswordResetOtpEmail,
  sendPasswordResetSuccessEmail,
};
