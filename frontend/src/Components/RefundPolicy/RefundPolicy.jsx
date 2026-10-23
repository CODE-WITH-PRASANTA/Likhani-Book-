
import React from "react";
import { Link } from "react-router-dom";
import {
  FiPackage,
  FiSlash,
  FiRefreshCw,
  FiCreditCard,
  FiTruck,
  FiHeadphones,
  FiFileText,
  FiShield,
  FiMail,
  FiChevronRight,
  FiArrowRight,
} from "react-icons/fi";
import "./RefundPolicy.css";

const RefundPolicy = () => {
  const policies = [
    {
      number: "01",
      title: "Eligibility for Refund",
      icon: <FiPackage />,
      description:
        "You can request a refund within 7 days from the date of delivery if:",
      points: [
        "You received a damaged or defective book.",
        "You received the wrong item.",
        "The product does not match the condition described at purchase.",
      ],
    },
    {
      number: "02",
      title: "Non-Refundable Items",
      icon: <FiSlash />,
      description: "The following items are generally not eligible for refunds:",
      points: [
        "Books damaged through misuse or normal wear after delivery.",
        "Digital products or eBooks once downloaded, unless defective.",
        "Items purchased during special sales, unless damaged or incorrectly supplied.",
      ],
    },
    {
      number: "03",
      title: "How to Request a Refund",
      icon: <FiRefreshCw />,
      description:
        "Contact our support team and provide the information needed to review your request.",
      points: [
        "Share your order number and registered email address.",
        "Explain the reason for your refund request.",
        "Attach clear photographs of the item if it is damaged or incorrect.",
      ],
    },
    {
      number: "04",
      title: "Refund Approval & Processing",
      icon: <FiCreditCard />,
      description:
        "After inspection and approval, the refund will be initiated to your original payment method.",
      points: [
        "Our team will normally review requests within 2–3 business days.",
        "Approved refunds may take 7–10 business days to appear, depending on your bank or payment provider.",
        "We will contact you if additional information is required.",
      ],
    },
    {
      number: "05",
      title: "Return & Shipping Charges",
      icon: <FiTruck />,
      description:
        "If a return is approved, our team will guide you through the return process.",
      points: [
        "For damaged, defective, or incorrect items, contact us before sending the book back.",
        "Original shipping charges are generally non-refundable unless the issue was caused by us or applicable law requires otherwise.",
        "Please retain the packaging until your request has been resolved.",
      ],
    },
    {
      number: "06",
      title: "Need Help?",
      icon: <FiHeadphones />,
      description:
        "If you have questions about a refund or return, our support team is here to help.",
      points: [
        "Email: example@gmail.com",
        "Phone: +91 9692075298",
        "Please include your order number in all refund-related communication.",
      ],
    },
  ];

  const quickLinks = [
    {
      label: "Terms & Conditions",
      path: "/terms-and-conditions",
      icon: <FiFileText />,
    },
    {
      label: "Privacy Policy",
      path: "/privacy-policy",
      icon: <FiShield />,
    },
    {
      label: "Refund Policy",
      path: "/refund-policy",
      icon: <FiRefreshCw />,
      active: true,
    },
  ];

  return (
    <main className="RefundPolicy">
      <section className="RefundPolicy-hero">
        <div className="RefundPolicy-hero-overlay" />

        <div className="RefundPolicy-hero-content">
          <div className="RefundPolicy-breadcrumb">
            <Link to="/">Home</Link>
            <FiChevronRight />
            <span>Refund Policy</span>
          </div>

          <span className="RefundPolicy-eyebrow">CUSTOMER CARE</span>
          <h1>Refund Policy</h1>
          <p>Your satisfaction is our priority.</p>
          <span className="RefundPolicy-hero-line" />
        </div>

        <div className="RefundPolicy-hero-decoration" aria-hidden="true">
          <FiPackage />
        </div>
      </section>

      <section className="RefundPolicy-content-section">
        <div className="RefundPolicy-layout">
          <aside className="RefundPolicy-sidebar">
            <div className="RefundPolicy-sidebar-card">
              <span className="RefundPolicy-sidebar-label">
                POLICIES & INFORMATION
              </span>

              <h2>Helpful Information</h2>

              <nav className="RefundPolicy-sidebar-nav">
                {quickLinks.map((item) => (
                  <Link
                    to={item.path}
                    key={item.label}
                    className={`RefundPolicy-sidebar-link ${
                      item.active ? "RefundPolicy-sidebar-link-active" : ""
                    }`}
                    aria-current={item.active ? "page" : undefined}
                  >
                    <span className="RefundPolicy-sidebar-link-icon">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    <FiChevronRight className="RefundPolicy-sidebar-chevron" />
                  </Link>
                ))}
              </nav>
            </div>

            <div className="RefundPolicy-help-card">
              <div className="RefundPolicy-help-icon">
                <FiHeadphones />
              </div>

              <span className="RefundPolicy-sidebar-label">
                WE ARE HERE TO HELP
              </span>

              <h3>Need Assistance?</h3>

              <p>
                Have a question about your order or refund? Get in touch with
                our customer support team.
              </p>

              <a
                href="mailto:publicationlekhani@gmail.com"
                className="RefundPolicy-help-button"
              >
                <FiMail />
                Contact Support
                <FiArrowRight />
              </a>

              <a
                href="tel:+919692075298"
                className="RefundPolicy-help-phone"
              >
                +91 9692075298
              </a>
            </div>
          </aside>

          <div className="RefundPolicy-main-card">
            <div className="RefundPolicy-main-heading">
              <span className="RefundPolicy-section-kicker">
                SIMPLE & TRANSPARENT
              </span>

              <h2>Refund Policy</h2>

              <p className="RefundPolicy-updated">
                Last updated: 01 January 2026
              </p>

              <p className="RefundPolicy-intro">
                At Lekhani, we want you to enjoy every book you purchase. If
                something is not right with your order, this policy explains
                how to request a return or refund and what to expect during the
                process.
              </p>
            </div>

            <div className="RefundPolicy-notice">
              <span className="RefundPolicy-notice-icon">
                <FiPackage />
              </span>

              <p>
                <strong>Important:</strong> Please contact us before returning
                an item. Refund eligibility depends on the condition of the
                product, the reason for the request, and applicable consumer
                protection laws.
              </p>
            </div>

            <div className="RefundPolicy-list">
              {policies.map((policy) => (
                <article
                  className="RefundPolicy-item"
                  key={policy.number}
                >
                  <div className="RefundPolicy-number">
                    {policy.number}
                  </div>

                  <div className="RefundPolicy-item-icon">
                    {policy.icon}
                  </div>

                  <div className="RefundPolicy-item-content">
                    <h3>{policy.title}</h3>
                    <p>{policy.description}</p>

                    <ul>
                      {policy.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>

            <div className="RefundPolicy-footer-note">
              <div className="RefundPolicy-footer-note-icon">
                <FiShield />
              </div>

              <div>
                <h3>Our Commitment to You</h3>
                <p>
                  We aim to handle every refund request fairly and
                  transparently. Nothing in this policy limits any rights you
                  may have under applicable law.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RefundPolicy;
