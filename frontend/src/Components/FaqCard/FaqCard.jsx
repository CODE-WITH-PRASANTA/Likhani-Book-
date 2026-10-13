import React, { useState } from 'react';
import './FaqCard.css';

const FAQ_DATA = {
  'Trust & Safety': [
    {
      question: 'What skills will my child learn by using Kinder?',
      answer:
        "Likhani offers a curated collection of engaging children's books designed to improve early literacy, comprehension, creative thinking, and artistic expression through immersive storytelling.",
    },
    {
      question: 'What is included in your services?',
      answer:
        'At Likhani, we provide complete publishing, printing, and digital book distribution services. Our packages include manuscript editing, original cover design, interior layout formatting, and global distribution across major online marketplaces.',
    },
    {
      question: 'What type of company is measured?',
      answer:
        "Likhani measures growth across independent authors, traditional book publishers, literary agencies, and education-focused children's book creators.",
    },
    {
      question: 'Are the tours included with meals?',
      answer:
        'Our author workshop sessions and literary event tours include complimentary refreshments, catering options, and networking dinners depending on the event pass purchased.',
    },
    {
      question: 'What activities are done in the development?',
      answer:
        'Book development involves editorial reviews, character design workshops, audio narration production, and interactive ebook formatting tailored for modern publishing standards.',
    },
    {
      question: 'What ages is Prodigies designed for?',
      answer:
        'Likhani\'s "Prodigies" young author series is tailored for children and teenagers aged 6 to 16 who want to write, illustrate, and publish their own original stories.',
    },
  ],
  General: [
    {
      question: 'How do I get started with Likhani?',
      answer:
        'Create a free account, choose a package that fits your project, and upload your manuscript. Our team will reach out within one business day to plan the next steps.',
    },
    {
      question: 'Can I publish in more than one language?',
      answer:
        'Yes. We support multilingual publishing, including layout and typography for regional scripts, so your story can reach readers in their own language.',
    },
    {
      question: 'How long does it take to publish a book?',
      answer:
        'Most books go live within 4 to 8 weeks, depending on editing depth, illustration needs, and how quickly feedback is returned.',
    },
  ],
  'Mamaya Shop': [
    {
      question: 'How long does delivery take?',
      answer:
        'Standard delivery takes 4 to 7 working days. Remote locations may need a few extra days, and you will receive tracking details as soon as your order ships.',
    },
    {
      question: 'Can I return or exchange a product?',
      answer:
        'Unused items in original packaging can be returned or exchanged within 7 days of delivery. Contact support with your order number to begin.',
    },
    {
      question: 'Do you offer gift wrapping?',
      answer:
        'Yes. Add gift wrapping at checkout and include a personal message that is printed on a card inside the package.',
    },
  ],
  'Kids Toys': [
    {
      question: 'Are the toys safe for toddlers?',
      answer:
        'Every toy lists its recommended age on the product page. Toys for children under 3 are made without small detachable parts and use non-toxic, child-safe materials.',
    },
    {
      question: 'What materials are the toys made from?',
      answer:
        'Our range uses sustainably sourced wood, food-grade silicone, and water-based paints. Each product page lists its exact materials.',
    },
    {
      question: 'How do I clean the toys?',
      answer:
        'Wipe wooden toys with a damp cloth and mild soap. Silicone and plastic toys can be washed in warm soapy water. Avoid soaking wooden items.',
    },
  ],
};

const CATEGORIES = Object.keys(FAQ_DATA);

const FaqCard = () => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [openFaqIndex, setOpenFaqIndex] = useState(1);

  const faqs = FAQ_DATA[activeCategory];

  const selectCategory = (category) => {
    setActiveCategory(category);
    setOpenFaqIndex(0);
  };

  const toggleAccordion = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section className="faqcard-container">
      {/* Sidebar */}
      <aside className="faqcard-sidebar">
        <div className="faqcard-tabs" role="tablist" aria-label="FAQ categories">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`faqcard-category-btn ${isActive ? 'faqcard-active' : ''}`}
                onClick={() => selectCategory(category)}
              >
                <span className="faqcard-category-label">{category}</span>
                <span className="faqcard-category-count">{FAQ_DATA[category].length}</span>
              </button>
            );
          })}
        </div>

        <div className="faqcard-help">
          <p className="faqcard-help-title">Still have questions?</p>
          <p className="faqcard-help-text">
            Our team replies within one business day.
          </p>
          <a className="faqcard-help-link" href="/contact">
            Contact support
          </a>
        </div>
      </aside>

      {/* Accordion */}
      <div className="faqcard-content" role="tabpanel">
        {faqs.map((faq, index) => {
          const isOpen = openFaqIndex === index;
          const panelId = `faqcard-panel-${activeCategory.replace(/\W/g, '')}-${index}`;
          return (
            <div
              key={`${activeCategory}-${index}`}
              className={`faqcard-item ${isOpen ? 'faqcard-item-open' : ''}`}
              style={{ '--faq-delay': `${index * 45}ms` }}
            >
              <button
                type="button"
                className="faqcard-header"
                onClick={() => toggleAccordion(index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span className="faqcard-question">{faq.question}</span>
                <span className="faqcard-icon" aria-hidden="true">
                  <span className="faqcard-icon-bar faqcard-icon-bar-h" />
                  <span className="faqcard-icon-bar faqcard-icon-bar-v" />
                </span>
              </button>

              <div
                id={panelId}
                className="faqcard-body"
                role="region"
                aria-hidden={!isOpen}
              >
                <div className="faqcard-body-inner">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FaqCard;