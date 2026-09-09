import React, { useState } from 'react';
import { HiOutlineChevronDoubleRight, HiOutlineChevronDoubleDown } from 'react-icons/hi';
import './FaqCard.css';

const FaqCard = () => {
  const [activeCategory, setActiveCategory] = useState('Trust & Safety');
  const [openFaqIndex, setOpenFaqIndex] = useState(1); // Default second item open as shown in reference UI

  const categories = ['Trust & Safety', 'General', 'Mamaya Shop', 'Kids Toys'];

  const faqData = [
    {
      question: 'What Skills Will My Child Learn By Using Kinder?',
      answer: 'Likhani offers a curated collection of engaging children\'s books designed to improve early literacy, comprehension, creative thinking, and artistic expression through immersive storytelling.'
    },
    {
      question: 'What Is Included In Your Services?',
      answer: 'At Likhani, we provide complete publishing, printing, and digital book distribution services. Our packages include manuscript editing, original cover design, interior layout formatting, and global distribution across major online marketplaces.'
    },
    {
      question: 'What Type Of Company Is Measured?',
      answer: 'Likhani measures growth across independent authors, traditional book publishers, literary agencies, and education-focused children\'s book creators.'
    },
    {
      question: 'Are The Tours Included With Meals?',
      answer: 'Our author workshop sessions and literary event tours include complimentary refreshments, catering options, and networking dinners depending on the event pass purchased.'
    },
    {
      question: 'What Activities Are Done In The Development?',
      answer: 'Book development involves editorial reviews, character design workshops, audio narration production, and interactive ebook formatting tailored for modern publishing standards.'
    },
    {
      question: 'What Ages Is Prodigies Designed For?',
      answer: 'Likhani\'s "Prodigies" young author series is tailored for children and teenagers aged 6 to 16 who want to write, illustrate, and publish their own original stories.'
    }
  ];

  const toggleAccordion = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="faqcard-container">
      {/* Left Sidebar Category Navigation */}
      <div className="faqcard-sidebar">
        {categories.map((category) => (
          <button
            key={category}
            className={`faqcard-category-btn ${activeCategory === category ? 'faqcard-active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Right FAQ Accordion List */}
      <div className="faqcard-content">
        {faqData.map((faq, index) => {
          const isOpen = openFaqIndex === index;
          return (
            <div key={index} className="faqcard-item">
              <div 
                className="faqcard-header" 
                onClick={() => toggleAccordion(index)}
              >
                <h3 className={`faqcard-question ${isOpen ? 'faqcard-question-active' : ''}`}>
                  {faq.question}
                </h3>
                <span className={`faqcard-icon ${isOpen ? 'faqcard-icon-active' : ''}`}>
                  {isOpen ? (
                    <HiOutlineChevronDoubleDown size={18} />
                  ) : (
                    <HiOutlineChevronDoubleRight size={18} />
                  )}
                </span>
              </div>
              
              {isOpen && (
                <div className="faqcard-body">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FaqCard;