
import React from "react";
import { Link } from "react-router-dom";
import {
  FiFileText,
  FiShield,
  FiRefreshCw,
  FiMail,
  FiChevronRight,
  FiUser,
  FiDatabase,
  FiLock,
  FiSettings,
  FiEye,
  FiCalendar,
} from "react-icons/fi";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  const policies = [
    {
      number: "01",
      title: "Information We Collect",
      icon: <FiDatabase />,
      description:
        "We may collect personal information when you interact with Lekhani, place an order, create an account, or contact us.",
      points: [
        "Your name, email address, and phone number.",
        "Billing, shipping address, and order details.",
        "Payment transaction information provided through our payment service providers.",
      ],
    },
    {
      number: "02",
      title: "How We Use Your Information",
      icon: <FiEye />,
      description:
        "We use your information to operate our bookstore and provide a smooth shopping experience.",
      points: [
        "Process orders, payments, deliveries, returns, and refunds.",
        "Send order confirmations, delivery updates, and customer support responses.",
        "Improve our website, products, and services.",
        "Send promotional emails where you have opted in or where permitted by law.",
      ],
    },
    {
      number: "03",
      title: "Sharing Your Information",
      icon: <FiUser />,
      description:
        "We do not sell your personal information. We share it only when needed to operate our services or meet legal obligations.",
      points: [
        "Payment providers to process transactions.",
        "Delivery partners to ship your orders.",
        "Technology and email service providers that help operate our website.",
        "Authorities when disclosure is required by applicable law.",
      ],
    },
    {
      number: "04",
      title: "Data Security",
      icon: <FiLock />,
      description:
        "We take reasonable technical and organizational measures to protect your personal information from unauthorized access, loss, misuse, or disclosure.",
      points: [
        "Access to personal information is limited to relevant purposes.",
        "Payments may be handled by third-party payment providers using their security procedures.",
        "No online system or method of storage can be guaranteed to be completely secure.",
      ],
    },
    {
      number: "05",
      title: "Cookies & Similar Technologies",
    icon: <FiSettings />,
      description:
        "Our website may use cookies and similar technologies to help the website function and improve your browsing experience.",
      points: [
        "Remember preferences and maintain essential website functions.",
        "Understand website usage and improve performance.",
        "You can manage cookies through your browser settings. Disabling certain cookies may affect website features.",
      ],
    },
    {
      number: "06",
      title: "Your Privacy Rights",
      icon: <FiShield />,
      description:
        "Depending on applicable law, you may have rights concerning your personal information.",
      points: [
        "Request access to or correction of your personal information.",
        "Request deletion or restriction of processing where applicable.",
        "Withdraw consent for optional marketing communications.",
        "Contact us to submit a privacy-related request.",
      ],
    },
    {
      number: "07",
      title: "Data Retention & Policy Updates",
      icon: <FiCalendar />,
      description:
        "We retain information for as long as reasonably necessary for the purposes described in this policy, including legal, accounting, and business requirements.",
      points: [
        "Retention periods depend on the type of information and applicable requirements.",
        "We may update this policy when our practices or legal obligations change.",
        "Updates will be published on this page with a revised date.",
      ],
    },
    {
      number: "08",
      title: "Contact Us",
      icon: <FiMail />,
      description:
        "If you have questions, concerns, or requests regarding this Privacy Policy, please contact our team.",
      points: [
        "Email: example@gmail.com",
        "Phone: +91 9692075298",
        "Please describe your request clearly so we can assist you.",
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
      active: true,
    },
    {
      label: "Refund Policy",
      path: "/refund-policy",
      icon: <FiRefreshCw />,
    },
    {
      label: "Contact Us",
      path: "/contact",
      icon: <FiMail />,
    },
  ];

  return (
    <main className="PrivacyPolicy">
      <section className="PrivacyPolicy-hero">
        <div className="PrivacyPolicy-hero-overlay" />

        <div className="PrivacyPolicy-hero-content">
          <nav className="PrivacyPolicy-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <FiChevronRight aria-hidden="true" />
            <span>Privacy Policy</span>
          </nav>

          <span className="PrivacyPolicy-eyebrow">
            YOUR PRIVACY MATTERS
          </span>

          <h1>Privacy Policy</h1>

          <p>
            Your trust matters to us. Learn how we handle your information.
          </p>

          <span className="PrivacyPolicy-hero-line" />
        </div>

        <div className="PrivacyPolicy-hero-decoration" aria-hidden="true">
          <FiShield />
        </div>
      </section>

      <section className="PrivacyPolicy-content-section">
        <div className="PrivacyPolicy-layout">
          <aside className="PrivacyPolicy-sidebar">
            <div className="PrivacyPolicy-sidebar-card">
              <span className="PrivacyPolicy-sidebar-label">
                POLICIES & SUPPORT
              </span>

              <h2>Helpful Information</h2>

              <nav className="PrivacyPolicy-sidebar-nav">
                {quickLinks.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`PrivacyPolicy-sidebar-link ${
                      item.active
                        ? "PrivacyPolicy-sidebar-link-active"
                        : ""
                    }`}
                    aria-current={item.active ? "page" : undefined}
                  >
                    <span className="PrivacyPolicy-sidebar-link-icon">
                      {item.icon}
                    </span>

                    <span>{item.label}</span>

                    <FiChevronRight className="PrivacyPolicy-sidebar-chevron" />
                  </Link>
                ))}
              </nav>
            </div>

            <div className="PrivacyPolicy-help-card">
              <div className="PrivacyPolicy-help-icon">
                <FiLock />
              </div>

              <span className="PrivacyPolicy-sidebar-label">
                YOUR DATA, YOUR RIGHTS
              </span>

              <h3>Questions About Privacy?</h3>

              <p>
                Need to update your details or have a question about your
                information? Contact our support team.
              </p>

              <a
                href="mailto:publicationlekhani@gmail.com"
                className="PrivacyPolicy-help-button"
              >
                <FiMail />
                Contact Support
                <FiChevronRight />
              </a>

              <a
                href="tel:+919692075298"
                className="PrivacyPolicy-help-phone"
              >
                +91 9692075298
              </a>
            </div>
          </aside>

          <article className="PrivacyPolicy-main-card">
            <header className="PrivacyPolicy-main-heading">
              <span className="PrivacyPolicy-section-kicker">
                TRANSPARENCY & TRUST
              </span>

              <h2>Privacy Policy</h2>

              <div className="PrivacyPolicy-heading-underline" />

              <p className="PrivacyPolicy-updated">
                Last Updated: 01 January 2026
              </p>

              <p className="PrivacyPolicy-intro">
                At Lekhani, we value your privacy and are committed to
                protecting your personal information. This Privacy Policy
                explains how we collect, use, share, and safeguard your data
                when you visit our website, create an account, or make a
                purchase from our online store.
              </p>
            </header>

            <div className="PrivacyPolicy-notice">
              <span className="PrivacyPolicy-notice-icon">
                <FiShield />
              </span>

              <p>
                <strong>Your privacy is important.</strong> We collect and use
                personal information for legitimate business purposes, provide
                appropriate protections, and handle requests in accordance
                with applicable law.
              </p>
            </div>

            <div className="PrivacyPolicy-list">
              {policies.map((policy) => (
                <section
                  className="PrivacyPolicy-item"
                  key={policy.number}
                >
                  <div className="PrivacyPolicy-number">
                    {policy.number}
                  </div>

                  <div className="PrivacyPolicy-item-icon">
                    {policy.icon}
                  </div>

                  <div className="PrivacyPolicy-item-content">
                    <h3>{policy.title}</h3>
                    <p>{policy.description}</p>

                    <ul>
                      {policy.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              ))}
            </div>

            <div className="PrivacyPolicy-footer-note">
              <div className="PrivacyPolicy-footer-note-icon">
                <FiShield />
              </div>

              <div>
                <h3>Our Commitment</h3>
                <p>
                  We aim to treat your information responsibly and
                  transparently. If you have a privacy request, please contact
                  us using the details provided above.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
