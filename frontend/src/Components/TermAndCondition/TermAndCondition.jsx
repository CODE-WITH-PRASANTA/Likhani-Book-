
import React from "react";
import { Link } from "react-router-dom";
import {
  FiFileText,
  FiShield,
  FiRefreshCw,
  FiMail,
  FiChevronRight,
  FiShoppingBag,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiPhone,
} from "react-icons/fi";
import "./TermAndCondition.css";

const TermAndCondition = () => {
  const quickLinks = [
    {
      label: "Terms & Conditions",
      path: "/terms-and-conditions",
      icon: <FiFileText />,
      active: true,
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
    },
    {
      label: "Contact Us",
      path: "/contactus",
      icon: <FiMail />,
    },
  ];

  const terms = [
    {
      title: "Acceptance of Terms",
      icon: <FiCheckCircle />,
      description:
        "By accessing or using the Lekhani website, you acknowledge that you have read, understood, and agree to these Terms & Conditions. If you do not agree with any part of these terms, please discontinue using our website.",
    },
    {
      title: "Use of Our Website",
      icon: <FiFileText />,
      description:
        "You agree to use this website only for lawful purposes. You must not misuse the website, interfere with its operation, attempt unauthorized access, or engage in activities that could harm other users or our services.",
    },
    {
      title: "Products and Pricing",
      icon: <FiShoppingBag />,
      description:
        "We make reasonable efforts to display accurate book descriptions, images, availability, and prices. Product appearance may vary slightly from the images shown. Prices, offers, and availability may change without prior notice.",
    },
    {
      title: "Orders and Payment",
      icon: <FiCreditCard />,
      description:
        "Placing an order constitutes a purchase request. Orders are subject to acceptance, stock availability, and payment verification. If an order cannot be fulfilled, we will make reasonable efforts to inform you and arrange any applicable refund.",
    },
    {
      title: "Shipping and Delivery",
      icon: <FiTruck />,
      description:
        "We aim to deliver orders within the estimated delivery period displayed during checkout. Delivery dates may vary because of courier delays, weather, incorrect address details, or other circumstances outside our reasonable control.",
    },
    {
      title: "Returns and Refunds",
      icon: <FiRefreshCw />,
      description:
        "Returns and refunds are handled according to our Refund Policy. Eligibility may depend on the condition of the item, the reason for the return, and the time elapsed since delivery.",
      link: true,
    },
    {
      title: "Intellectual Property",
      icon: <FiShield />,
      description:
        "Website content, branding, graphics, and original materials are protected by applicable intellectual property laws. You may not reproduce, distribute, or commercially use protected materials without appropriate permission.",
    },
    {
      title: "Limitation of Liability",
      icon: <FiAlertCircle />,
      description:
        "To the extent permitted by applicable law, Lekhani is not responsible for indirect or consequential losses arising from website use, temporary service interruptions, or circumstances beyond our reasonable control. Nothing in these terms excludes liability that cannot legally be excluded.",
    },
    {
      title: "Changes to These Terms",
      icon: <FiFileText />,
      description:
        "We may revise these Terms & Conditions to reflect changes to our services or legal requirements. Updated terms will be published on this page with a revised date. Continued use of the website after changes take effect indicates acceptance where permitted by law.",
    },
    {
      title: "Contact Information",
      icon: <FiPhone />,
      description:
        "If you have questions about these Terms & Conditions, please contact our support team using the email address or telephone number below.",
      contact: true,
    },
  ];

  return (
    <main className="TermAndCondition">
      <section className="TermAndCondition-hero">
        <div className="TermAndCondition-hero-overlay" />

        <div className="TermAndCondition-hero-content">
          <span className="TermAndCondition-eyebrow">
            LEKHANI BOOKSTORE
          </span>

          <h1>Terms &amp; Conditions</h1>

          <nav
            className="TermAndCondition-breadcrumb"
            aria-label="Breadcrumb"
          >
            <Link to="/">Home</Link>
            <FiChevronRight aria-hidden="true" />
            <span>Terms &amp; Conditions</span>
          </nav>
        </div>
      </section>

      <section className="TermAndCondition-content-section">
        <div className="TermAndCondition-layout">
          <aside className="TermAndCondition-sidebar">
            <div className="TermAndCondition-sidebar-card">
              <span className="TermAndCondition-sidebar-label">
                POLICIES &amp; SUPPORT
              </span>

              <h2>Helpful Information</h2>

              <nav className="TermAndCondition-sidebar-nav">
                {quickLinks.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`TermAndCondition-sidebar-link ${
                      item.active
                        ? "TermAndCondition-sidebar-link-active"
                        : ""
                    }`}
                    aria-current={item.active ? "page" : undefined}
                  >
                    <span className="TermAndCondition-sidebar-icon">
                      {item.icon}
                    </span>

                    <span>{item.label}</span>

                    <FiChevronRight className="TermAndCondition-sidebar-chevron" />
                  </Link>
                ))}
              </nav>
            </div>

            <div className="TermAndCondition-help-card">
              <span className="TermAndCondition-help-icon">
                <FiMail />
              </span>

              <span className="TermAndCondition-sidebar-label">
                NEED ASSISTANCE?
              </span>

              <h3>We’re Here to Help</h3>

              <p>
                Have a question about an order, payment, or these terms?
                Our support team is ready to help.
              </p>

              <a
                href="mailto:publicationlekhani@gmail.com"
                className="TermAndCondition-help-button"
              >
                Contact Support <FiChevronRight />
              </a>

              <a
                href="tel:+919692075298"
                className="TermAndCondition-help-phone"
              >
                +91 9692075298
              </a>
            </div>
          </aside>

          <article className="TermAndCondition-main-card">
            <header className="TermAndCondition-main-heading">
              <span className="TermAndCondition-section-kicker">
                PLEASE READ CAREFULLY
              </span>

              <h2>Terms &amp; Conditions</h2>

              <div className="TermAndCondition-heading-underline" />

              <p className="TermAndCondition-updated">
                Last Updated: 01 January 2026
              </p>

              <p className="TermAndCondition-intro">
                Welcome to Lekhani. These Terms &amp; Conditions govern your
                use of our website and the purchase of products from our
                online bookstore. By accessing or using our website, you
                agree to these terms. Please read them carefully before
                placing an order.
              </p>
            </header>

            <div className="TermAndCondition-notice">
              <span className="TermAndCondition-notice-icon">
                <FiAlertCircle />
              </span>

              <p>
                <strong>Important information</strong>
                <br />
                Please review our order, delivery, and refund terms before
                completing a purchase. These terms should be read together
                with our Privacy Policy and Refund Policy.
              </p>
            </div>

            <div className="TermAndCondition-list">
              {terms.map((term, index) => (
                <section
                  className="TermAndCondition-item"
                  key={term.title}
                >
                  <div className="TermAndCondition-number">
                    {index + 1}
                  </div>

                  <div className="TermAndCondition-item-icon">
                    {term.icon}
                  </div>

                  <div className="TermAndCondition-item-content">
                    <h3>{term.title}</h3>

                    <p>{term.description}</p>

                    {term.link && (
                      <p className="TermAndCondition-policy-link">
                        Read our{" "}
                        <Link to="/refund-policy">Refund Policy</Link>{" "}
                        for further details.
                      </p>
                    )}

                    {term.contact && (
                      <div className="TermAndCondition-contact-details">
                        <a href="mailto:publicationlekhani@gmail.com">
                          <FiMail />
                          publicationlekhani@gmail.com
                        </a>

                        <a href="tel:+919692075298">
                          <FiPhone />
                          +91 9692075298
                        </a>
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </div>

            <div className="TermAndCondition-footer-note">
              <span className="TermAndCondition-footer-note-icon">
                <FiShield />
              </span>

              <div>
                <h3>Thank You for Choosing Lekhani</h3>

                <p>
                  We appreciate your trust in our bookstore. By using our
                  website, you agree to follow these terms and any
                  applicable laws and regulations.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
};

export default TermAndCondition;
