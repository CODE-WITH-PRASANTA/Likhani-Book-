import React, { useState, useEffect } from 'react';
import './Coustmerfeedback.css';

// अधिक डमी डेटा ताकि 1-by-1 स्लाइडिंग स्मूथ दिखे
const feedbackData = [
  {
    id: 1,
    quote: "One of the most powerful takeaways from this book is the emphasis on adopting a mindset of abundance and possibility. The idea that we can choose to see opportunities rather than limitations is a game-changer.",
    name: "Ronald Richards",
    role: "Marketing Coordinator",
    rating: 3,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    company: "envato",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Envato_Logo_2020.svg/320px-Envato_Logo_2020.svg.png",
    accentColor: "teal",
    hasTopBorder: true
  },
  {
    id: 2,
    quote: "The idea that we can choose to see opportunities rather than limitations is a game-changer. The book encourages readers to step out of their comfort zones and embrace a more positive outlook on life.",
    name: "Dianne Russell",
    role: "Project Manager",
    rating: 4,
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    company: "amazon",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png",
    accentColor: "black",
    hasTopBorder: false
  },
  {
    id: 3,
    quote: "\"The Art of Possibility\" by Rosamund Stone Zander and Benjamin Zander is a transformative read that challenges conventional thinking and opens up new possibilities. As a reader, I found myself profoundly inspired.",
    name: "Ronald Richards",
    role: "Marketing Coordinator",
    rating: 3,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    company: "envato",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Envato_Logo_2020.svg/320px-Envato_Logo_2020.svg.png",
    accentColor: "black",
    hasTopBorder: false
  },
  {
    id: 4,
    quote: "Reading this was an absolute revelation. It completely shifted how our team approaches creative problem-solving and daily motivation. Highly recommended for every avid reader!",
    name: "Kathryn Murphy",
    role: "Operations Lead",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    company: "amazon",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png",
    accentColor: "teal",
    hasTopBorder: true
  },
  {
    id: 5,
    quote: "An extraordinary perspective on personal growth and self-reflection. It offers step-by-step methodologies that are both practical and deeply motivating in modern life.",
    name: "Jacob Jones",
    role: "UI/UX Designer",
    rating: 4,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    company: "envato",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Envato_Logo_2020.svg/320px-Envato_Logo_2020.svg.png",
    accentColor: "black",
    hasTopBorder: false
  },
  {
    id: 6,
    quote: "Clear, engaging, and thoughtfully structured. This is one of the rare books that makes a noticeable difference in your day-to-day decisions immediately.",
    name: "Eleanor Pena",
    role: "Content Strategist",
    rating: 4,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    company: "amazon",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png",
    accentColor: "teal",
    hasTopBorder: false
  },
  {
    id: 7,
    quote: "A masterpiece in modern business ethics and creative flow. The real-world case studies bridge the gap between abstract ideology and actionable leadership traits.",
    name: "Devon Lane",
    role: "Lead Developer",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    company: "envato",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Envato_Logo_2020.svg/320px-Envato_Logo_2020.svg.png",
    accentColor: "teal",
    hasTopBorder: true
  },
  {
    id: 8,
    quote: "I found answers to challenges I struggled with for years. The clarity of thought in every chapter is truly refreshing and uplifting for anyone seeking progress.",
    name: "Savannah Nguyen",
    role: "Product Designer",
    rating: 4,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    company: "amazon",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png",
    accentColor: "black",
    hasTopBorder: false
  }
];

const Coustmerfeedback = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // स्क्रीन पर एक साथ 3 कार्ड दिखेंगे, इसलिए अधिकतम स्लाइड (Total - 3) तक जाएगी
  const visibleCards = 3;
  const maxIndex = Math.max(0, feedbackData.length - visibleCards);

  // 1-by-1 धीमी स्लाइडिंग
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3500); // हर 3.5 सेकंड में 1 कार्ड आगे खिसकेगा

    return () => clearInterval(timer);
  }, [isPaused, maxIndex]);

  return (
    <section className="feedback-section">
      {/* हेडर */}
      <div className="feedback-header">
        <h2 className="feedback-title">Customer Feedback</h2>
        <p className="feedback-subtitle">
          Interdum et malesuada fames ac ante ipsum primis in faucibus.
          <br />
          Donec at nulla nulla. Duis posuere ex lacus
        </p>
      </div>

      {/* स्लाइडर व्यूपोर्ट */}
      <div 
        className="feedback-carousel-viewport"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className="feedback-slider-track"
          style={{
            /* 1 कार्ड की चौड़ाई + गैप के हिसाब से 1-by-1 शिफ्ट */
            transform: `translateX(calc(-${currentIndex} * (100% / 3 + 24px / 3)))`
          }}
        >
          {feedbackData.map((item) => (
            <div 
              key={item.id} 
              className={`feedback-card ${item.hasTopBorder ? 'has-orange-border' : ''}`}
            >
              <p className="feedback-quote">{item.quote}</p>
              
              <div className="feedback-footer">
                {/* बॉटम-लेफ्ट कट-आउट और अवतार */}
                <div className={`avatar-container accent-${item.accentColor}`}>
                  <div className="corner-cutout"></div>
                  <img src={item.avatar} alt={item.name} className="avatar-img" />
                </div>

                {/* यूजर जानकारी & स्टार रेटिंग */}
                <div className="author-details">
                  <h4 className="author-name">{item.name}</h4>
                  <span className="author-role">{item.role}</span>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        className={`star ${star <= item.rating ? 'filled' : 'empty'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {/* कंपनी लोगो */}
                <div className="company-logo-wrap">
                  <img 
                    src={item.companyLogo} 
                    alt={item.company} 
                    className="company-logo" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* नेविगेशन डॉट्स (1-by-1 स्टेप्स) */}
      <div className="feedback-dots">
        {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
          <button
            key={dotIdx}
            className={`dot ${currentIndex === dotIdx ? 'active' : ''}`}
            onClick={() => setCurrentIndex(dotIdx)}
            aria-label={`Go to review ${dotIdx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Coustmerfeedback;