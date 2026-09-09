import React, { useState, useMemo, useEffect } from 'react';
import './Addtocart.css';
import { 
  FaSearch, 
  FaStar, 
  FaShoppingBasket, 
  FaHeart, 
  FaEye, 
  FaChevronDown, 
  FaChevronUp, 
  FaThLarge, 
  FaList, 
  FaArrowUp 
} from 'react-icons/fa';

// 32+ प्रोडक्ट्स का बड़ा डमी डेटा सेट (भारतीय रुपये ₹ और विभिन्न कैटेगरीज में)
const initialProducts = [
  {
    id: 1,
    title: "Simple Things You Save BOOK",
    price: 499,
    oldPrice: null,
    rating: 3.4,
    starGroup: 3,
    reviews: 25,
    category: "Arts & Photography",
    badges: [{ text: "Hot", type: "hot" }, { text: "-30%", type: "discount" }],
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 95,
    latestDate: "2026-03-01"
  },
  {
    id: 2,
    title: "How Deal With Very Bad BOOK",
    price: 649,
    oldPrice: null,
    rating: 4.2,
    starGroup: 4,
    reviews: 24,
    category: "Biographies & Memoirs",
    badges: [],
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 88,
    latestDate: "2026-02-15"
  },
  {
    id: 3,
    title: "The Hidden Mystery Behind",
    price: 520,
    oldPrice: 699,
    rating: 4.8,
    starGroup: 5,
    reviews: 35,
    category: "Arts & Photography",
    badges: [],
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: false,
    popularity: 92,
    latestDate: "2026-01-20"
  },
  {
    id: 4,
    title: "Qple GPad With Retina Sisplay",
    price: 3499,
    oldPrice: 4200,
    rating: 3.4,
    starGroup: 3,
    reviews: 25,
    category: "Christian Books & Bibles",
    badges: [{ text: "-12%", type: "discount" }],
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 70,
    latestDate: "2026-04-10"
  },
  {
    id: 5,
    title: "Flovely And Unicorn Erna",
    price: 380,
    oldPrice: null,
    rating: 5.0,
    starGroup: 5,
    reviews: 35,
    category: "Research & Publishing Guides",
    badges: [],
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 85,
    latestDate: "2026-04-01"
  },
  {
    id: 6,
    title: "Castle In The Sky",
    price: 299,
    oldPrice: null,
    rating: 4.5,
    starGroup: 4,
    reviews: 24,
    category: "Sports & Outdoors",
    badges: [],
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 99,
    latestDate: "2026-04-14"
  },
  {
    id: 7,
    title: "The Art of Creative Thinking",
    price: 1150,
    oldPrice: 1400,
    rating: 4.9,
    starGroup: 5,
    reviews: 35,
    category: "Arts & Photography",
    badges: [{ text: "Hot", type: "hot" }],
    image: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 97,
    latestDate: "2026-03-25"
  },
  {
    id: 8,
    title: "Mastering Modern UX Design",
    price: 1890,
    oldPrice: null,
    rating: 4.1,
    starGroup: 4,
    reviews: 24,
    category: "Research & Publishing Guides",
    badges: [{ text: "-20%", type: "discount" }],
    image: "https://images.unsplash.com/photo-1507842229451-79b1be886a20?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 91,
    latestDate: "2026-04-05"
  },
  {
    id: 9,
    title: "Mindset: The New Psychology",
    price: 750,
    oldPrice: null,
    rating: 3.2,
    starGroup: 3,
    reviews: 15,
    category: "Biographies & Memoirs",
    badges: [],
    image: "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: false,
    popularity: 80,
    latestDate: "2026-02-28"
  },
  {
    id: 10,
    title: "The Ultimate Guide to Nutrition",
    price: 550,
    oldPrice: 750,
    rating: 2.3,
    starGroup: 2,
    reviews: 2,
    category: "Food & Drink",
    badges: [{ text: "-25%", type: "discount" }],
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 76,
    latestDate: "2026-01-15"
  },
  {
    id: 11,
    title: "Extreme Outdoor Adventures",
    price: 2400,
    oldPrice: null,
    rating: 4.7,
    starGroup: 5,
    reviews: 35,
    category: "Sports & Outdoors",
    badges: [],
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=80",
    inStock: false,
    onSale: false,
    popularity: 89,
    latestDate: "2026-03-12"
  },
  {
    id: 12,
    title: "Collector's Ancient Scriptures",
    price: 4500,
    oldPrice: 5200,
    rating: 4.0,
    starGroup: 4,
    reviews: 24,
    category: "Christian Books & Bibles",
    badges: [{ text: "Hot", type: "hot" }],
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 94,
    latestDate: "2026-04-18"
  },
  {
    id: 13,
    title: "Quick Italian Pasta Cooking",
    price: 420,
    oldPrice: null,
    rating: 1.8,
    starGroup: 1,
    reviews: 1,
    category: "Food & Drink",
    badges: [],
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: false,
    popularity: 65,
    latestDate: "2026-02-10"
  },
  {
    id: 14,
    title: "The Historical Chronicles",
    price: 2890,
    oldPrice: null,
    rating: 3.5,
    starGroup: 3,
    reviews: 15,
    category: "Biographies & Memoirs",
    badges: [],
    image: "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 83,
    latestDate: "2026-03-30"
  },
  {
    id: 15,
    title: "Contemporary Architectural Forms",
    price: 1650,
    oldPrice: 1999,
    rating: 4.6,
    starGroup: 5,
    reviews: 35,
    category: "Arts & Photography",
    badges: [{ text: "-18%", type: "discount" }],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 96,
    latestDate: "2026-04-08"
  },
  {
    id: 16,
    title: "Philosophy of Living Well",
    price: 890,
    oldPrice: null,
    rating: 2.8,
    starGroup: 2,
    reviews: 2,
    category: "Research & Publishing Guides",
    badges: [],
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: false,
    popularity: 74,
    latestDate: "2026-01-29"
  },
  {
    id: 17,
    title: "The Psychology of Money",
    price: 399,
    oldPrice: 499,
    rating: 4.9,
    starGroup: 5,
    reviews: 35,
    category: "Biographies & Memoirs",
    badges: [{ text: "Hot", type: "hot" }],
    image: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 98,
    latestDate: "2026-04-12"
  },
  {
    id: 18,
    title: "Atomic Habits & Daily Routines",
    price: 540,
    oldPrice: 650,
    rating: 5.0,
    starGroup: 5,
    reviews: 35,
    category: "Research & Publishing Guides",
    badges: [{ text: "-15%", type: "discount" }],
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 99,
    latestDate: "2026-03-18"
  },
  {
    id: 19,
    title: "Street Food Culinary Secrets",
    price: 699,
    oldPrice: null,
    rating: 4.2,
    starGroup: 4,
    reviews: 24,
    category: "Food & Drink",
    badges: [],
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 81,
    latestDate: "2026-02-22"
  },
  {
    id: 20,
    title: "Mountaineering Survival Handbook",
    price: 1350,
    oldPrice: 1700,
    rating: 3.4,
    starGroup: 3,
    reviews: 15,
    category: "Sports & Outdoors",
    badges: [],
    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: false,
    popularity: 79,
    latestDate: "2026-03-05"
  },
  {
    id: 21,
    title: "Vintage Cinema Posters Volume 1",
    price: 2100,
    oldPrice: null,
    rating: 4.4,
    starGroup: 4,
    reviews: 24,
    category: "Arts & Photography",
    badges: [{ text: "Hot", type: "hot" }],
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 93,
    latestDate: "2026-04-09"
  },
  {
    id: 22,
    title: "Ancient Faith and Medieval Saints",
    price: 1250,
    oldPrice: 1500,
    rating: 3.8,
    starGroup: 4,
    reviews: 24,
    category: "Christian Books & Bibles",
    badges: [],
    image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 84,
    latestDate: "2026-01-18"
  },
  {
    id: 23,
    title: "Minimalist Typography in Practice",
    price: 1590,
    oldPrice: null,
    rating: 4.8,
    starGroup: 5,
    reviews: 35,
    category: "Arts & Photography",
    badges: [{ text: "-10%", type: "discount" }],
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 90,
    latestDate: "2026-04-15"
  },
  {
    id: 24,
    title: "Life in the Shadows of Titans",
    price: 820,
    oldPrice: null,
    rating: 3.1,
    starGroup: 3,
    reviews: 15,
    category: "Biographies & Memoirs",
    badges: [],
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: false,
    popularity: 73,
    latestDate: "2026-02-04"
  },
  {
    id: 25,
    title: "Baking Artisan Bread at Home",
    price: 799,
    oldPrice: 999,
    rating: 4.7,
    starGroup: 5,
    reviews: 35,
    category: "Food & Drink",
    badges: [],
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 92,
    latestDate: "2026-03-22"
  },
  {
    id: 26,
    title: "Marathon Training & Endurance",
    price: 1100,
    oldPrice: null,
    rating: 4.3,
    starGroup: 4,
    reviews: 24,
    category: "Sports & Outdoors",
    badges: [],
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 87,
    latestDate: "2026-04-03"
  },
  {
    id: 27,
    title: "Sacred Texts & Devotionals",
    price: 950,
    oldPrice: null,
    rating: 4.9,
    starGroup: 5,
    reviews: 35,
    category: "Christian Books & Bibles",
    badges: [{ text: "Hot", type: "hot" }],
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 95,
    latestDate: "2026-03-14"
  },
  {
    id: 28,
    title: "Scientific Research Methods 2026",
    price: 2800,
    oldPrice: 3200,
    rating: 3.9,
    starGroup: 4,
    reviews: 24,
    category: "Research & Publishing Guides",
    badges: [{ text: "-15%", type: "discount" }],
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: false,
    popularity: 86,
    latestDate: "2026-02-18"
  },
  {
    id: 29,
    title: "Color Theory for Visual Artists",
    price: 1450,
    oldPrice: null,
    rating: 4.6,
    starGroup: 5,
    reviews: 35,
    category: "Arts & Photography",
    badges: [],
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 94,
    latestDate: "2026-04-02"
  },
  {
    id: 30,
    title: "Memoirs of an Himalayan Guide",
    price: 680,
    oldPrice: 850,
    rating: 4.5,
    starGroup: 4,
    reviews: 24,
    category: "Biographies & Memoirs",
    badges: [],
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 88,
    latestDate: "2026-03-27"
  },
  {
    id: 31,
    title: "Mastering French Pastries",
    price: 1199,
    oldPrice: null,
    rating: 4.8,
    starGroup: 5,
    reviews: 35,
    category: "Food & Drink",
    badges: [{ text: "Hot", type: "hot" }],
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 96,
    latestDate: "2026-04-11"
  },
  {
    id: 32,
    title: "The Champion's Mindset in Sports",
    price: 890,
    oldPrice: null,
    rating: 3.3,
    starGroup: 3,
    reviews: 15,
    category: "Sports & Outdoors",
    badges: [],
    image: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 82,
    latestDate: "2026-02-14"
  }
];

const categoriesList = [
  "All Categories",
  "Arts & Photography",
  "Biographies & Memoirs",
  "Christian Books & Bibles",
  "Research & Publishing Guides",
  "Sports & Outdoors",
  "Food & Drink"
];

const reviewOptions = [
  { stars: 5, count: 35 },
  { stars: 4, count: 24 },
  { stars: 3, count: 15 },
  { stars: 2, count: 2 },
  { stars: 1, count: 1 },
];

const Addtocart = () => {
  // State मैनेजमेंट
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [inStockOpen, setInStockOpen] = useState(false);
  const [onSaleOpen, setOnSaleOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Default Sorting");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [toastMessage, setToastMessage] = useState("");

  // भारतीय रुपये में प्राइस स्लाइडर स्टेट्स (₹100 — ₹5000)
  const [sliderMin, setSliderMin] = useState(100);
  const [sliderMax, setSliderMax] = useState(5000);
  const [appliedPriceRange, setAppliedPriceRange] = useState({ min: 100, max: 5000 });

  // सिलेक्टेड रिव्यू स्टार्स
  const [selectedReviews, setSelectedReviews] = useState([]);

  // ================= पेजिनैशन स्टेट =================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // प्रत्येक पेज पर 8 प्रोडक्ट्स

  // रिव्यू चेकबॉक्स टॉगल
  const handleReviewToggle = (stars) => {
    setSelectedReviews((prev) => 
      prev.includes(stars) ? prev.filter((s) => s !== stars) : [...prev, stars]
    );
    setCurrentPage(1);
  };

  // 'Filter' बटन क्लिक
  const handleApplyPriceFilter = () => {
    setAppliedPriceRange({ min: sliderMin, max: sliderMax });
    setCurrentPage(1);
  };

  // कार्ट में जोड़ना
  const handleAddToCart = (productTitle) => {
    setCartCount((prev) => prev + 1);
    setToastMessage(`"${productTitle}" added to cart!`);
    setTimeout(() => setToastMessage(""), 2500);
  };

  // फ़िल्टरिंग और सॉर्टिंग लॉजिक
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. सर्च बार फ़िल्टर
    if (searchTerm.trim() !== "") {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. कैटेगरी फ़िल्टर
    if (!selectedStatusFilter && !searchTerm && selectedCategory !== "All Categories") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 3. स्टेटस ड्रॉपडाउन फ़िल्टर
    if (selectedStatusFilter) {
      if (selectedStatusFilter === "In Stock") {
        result = result.filter((p) => p.inStock);
      } else if (selectedStatusFilter === "On Sale") {
        result = result.filter((p) => p.onSale);
      } else {
        result = result.filter((p) => p.title.toLowerCase() === selectedStatusFilter.toLowerCase());
      }
    }

    // 4. प्राइस रेंज फ़िल्टर (₹ INR)
    result = result.filter(
      (p) => p.price >= appliedPriceRange.min && p.price <= appliedPriceRange.max
    );

    // 5. रिव्यू चेकबॉक्स फ़िल्टर
    if (selectedReviews.length > 0) {
      result = result.filter((p) => selectedReviews.includes(p.starGroup));
    }

    // 6. सॉर्टिंग लॉजिक
    if (selectedSort === "Sort By Popularity") {
      result.sort((a, b) => b.popularity - a.popularity);
    } else if (selectedSort === "Sort By Average Rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === "Sort By Latest") {
      result.sort((a, b) => new Date(b.latestDate) - new Date(a.latestDate));
    }

    return result;
  }, [searchTerm, selectedCategory, selectedStatusFilter, appliedPriceRange, selectedReviews, selectedSort]);

  // पेजिनैशन कैलकुलेशन
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  const currentDisplayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="shop-page-wrapper">
      
      {/* कार्ट नोटिफिकेशन */}
      {toastMessage && <div className="cart-notification">{toastMessage}</div>}

      <div className="shop-main-layout">
        
        {/* ================= बायाँ साइडबार ================= */}
        <aside className="shop-sidebar">
          
          {/* 1. सर्च बार */}
          <div className="sidebar-block">
            <h3 className="sidebar-heading">Search</h3>
            <div className="search-input-box">
              <input
                type="text"
                placeholder="Search here"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedStatusFilter(null);
                  setCurrentPage(1);
                }}
              />
              <FaSearch className="search-icon" />
            </div>
          </div>

          {/* 2. कैटेगरीज */}
          <div className="sidebar-block">
            <h3 className="sidebar-heading">Categories</h3>
            <div className="category-btn-list">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  className={`category-item-btn ${selectedCategory === cat && !selectedStatusFilter ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedStatusFilter(null);
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 3. प्रोडक्ट स्टेटस ड्रॉपडाउन */}
          <div className="sidebar-block">
            <h3 className="sidebar-heading">Product Status</h3>

            {/* In Stock Dropdown */}
            <div className="custom-dropdown-container">
              <button 
                className="dropdown-trigger-btn"
                onClick={() => {
                  setInStockOpen(!inStockOpen);
                  setOnSaleOpen(false);
                }}
              >
                <span>In Stock</span>
                <span className="arrow-badge">
                  {inStockOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>

              {inStockOpen && (
                <div className="dropdown-options-menu">
                  <div 
                    className="dropdown-item" 
                    onClick={() => { setSelectedStatusFilter("In Stock"); setInStockOpen(false); setCurrentPage(1); }}
                  >
                    In Stock
                  </div>
                  <div 
                    className="dropdown-item" 
                    onClick={() => { setSelectedStatusFilter("Castle In The Sky"); setInStockOpen(false); setCurrentPage(1); }}
                  >
                    Castle In The Sky
                  </div>
                  <div 
                    className="dropdown-item" 
                    onClick={() => { setSelectedStatusFilter("The Hidden Mystery Behind"); setInStockOpen(false); setCurrentPage(1); }}
                  >
                    The Hidden Mystery Behind
                  </div>
                  <div 
                    className="dropdown-item" 
                    onClick={() => { setSelectedStatusFilter("Flovely And Unicorn Erna"); setInStockOpen(false); setCurrentPage(1); }}
                  >
                    Flovely And Unicorn Erna
                  </div>
                </div>
              )}
            </div>

            {/* On Sale Dropdown */}
            <div className="custom-dropdown-container">
              <button 
                className="dropdown-trigger-btn"
                onClick={() => {
                  setOnSaleOpen(!onSaleOpen);
                  setInStockOpen(false);
                }}
              >
                <span>On Sale</span>
                <span className="arrow-badge">
                  {onSaleOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>

              {onSaleOpen && (
                <div className="dropdown-options-menu">
                  <div 
                    className="dropdown-item" 
                    onClick={() => { setSelectedStatusFilter("On Sale"); setOnSaleOpen(false); setCurrentPage(1); }}
                  >
                    On Sale
                  </div>
                  <div 
                    className="dropdown-item" 
                    onClick={() => { setSelectedStatusFilter("Flovely And Unicorn Erna"); setOnSaleOpen(false); setCurrentPage(1); }}
                  >
                    Flovely And Unicorn Erna
                  </div>
                  <div 
                    className="dropdown-item" 
                    onClick={() => { setSelectedStatusFilter("Castle In The Sky"); setOnSaleOpen(false); setCurrentPage(1); }}
                  >
                    Castle In The Sky
                  </div>
                  <div 
                    className="dropdown-item" 
                    onClick={() => { setSelectedStatusFilter("How Deal With Very Bad BOOK"); setOnSaleOpen(false); setCurrentPage(1); }}
                  >
                    How Deal With Very Bad BOOK
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Filter By Price (भारतीय रुपये ₹) */}
          <div className="sidebar-block">
            <h3 className="sidebar-heading">Filter By Price</h3>
            
            <div className="price-slider-wrapper">
              <div className="slider-track-bg"></div>
              <div 
                className="slider-track-highlight"
                style={{
                  left: `${((sliderMin - 100) / 4900) * 100}%`,
                  right: `${100 - ((sliderMax - 100) / 4900) * 100}%`
                }}
              ></div>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={sliderMin}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), sliderMax - 100);
                  setSliderMin(val);
                }}
                className="range-input"
              />
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={sliderMax}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), sliderMin + 100);
                  setSliderMax(val);
                }}
                className="range-input"
              />
            </div>

            <div className="price-action-row">
              <button 
                className="price-filter-btn" 
                onClick={handleApplyPriceFilter}
              >
                Filter
              </button>
              <span className="price-label-text">
                Price: <strong>₹{sliderMin.toLocaleString('en-IN')} — ₹{sliderMax.toLocaleString('en-IN')}</strong>
              </span>
            </div>
          </div>

          {/* 5. By Review */}
          <div className="sidebar-block">
            <h3 className="sidebar-heading">By Review</h3>
            <div className="review-filter-list">
              {reviewOptions.map((opt) => (
                <label key={opt.stars} className="review-checkbox-row">
                  <input
                    type="checkbox"
                    checked={selectedReviews.includes(opt.stars)}
                    onChange={() => handleReviewToggle(opt.stars)}
                    className="custom-review-checkbox"
                  />
                  <div className="stars-group">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`star-icon-small ${star <= opt.stars ? 'filled' : 'empty'}`}
                      />
                    ))}
                  </div>
                  <span className="review-count">{opt.count}</span>
                </label>
              ))}
            </div>
          </div>

        </aside>

        {/* ================= दायाँ भाग (प्रोडक्ट्स ग्रिड और टॉप बार) ================= */}
        <main className="shop-products-content">
          
          {/* टॉप हेडर बार */}
          <div className="top-filter-bar">
            <span className="results-text">
              Showing {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)} Of {filteredProducts.length} Results
            </span>

            <div className="top-controls-right">
              {/* Default Sorting Dropdown */}
              <div className="sort-dropdown-wrap">
                <button 
                  className="sort-dropdown-btn"
                  onClick={() => setSortOpen(!sortOpen)}
                >
                  <span>{selectedSort}</span>
                  <FaChevronDown className="sort-icon-arrow" />
                </button>

                {sortOpen && (
                  <div className="sort-options-list">
                    <div 
                      className="sort-option" 
                      onClick={() => { setSelectedSort("Default Sorting"); setSortOpen(false); }}
                    >
                      Default Sorting
                    </div>
                    <div 
                      className="sort-option" 
                      onClick={() => { setSelectedSort("Sort By Popularity"); setSortOpen(false); }}
                    >
                      Sort By Popularity
                    </div>
                    <div 
                      className="sort-option" 
                      onClick={() => { setSelectedSort("Sort By Average Rating"); setSortOpen(false); }}
                    >
                      Sort By Average Rating
                    </div>
                    <div 
                      className="sort-option" 
                      onClick={() => { setSelectedSort("Sort By Latest"); setSortOpen(false); }}
                    >
                      Sort By Latest
                    </div>
                  </div>
                )}
              </div>

              {/* व्यू टॉगल आइकन्स */}
              <div className="view-toggle-icons">
                <FaList className="view-icon" />
                <FaThLarge className="view-icon active" />
              </div>
            </div>
          </div>

          {/* प्रोडक्ट कार्ड्स ग्रिड */}
          <div className="products-grid">
            {currentDisplayedProducts.length === 0 ? (
              <div className="no-products-msg">
                <p>No products found matching your filter criteria.</p>
                <button 
                  className="reset-filters-btn"
                  onClick={() => {
                    setSelectedCategory("All Categories");
                    setSelectedStatusFilter(null);
                    setSearchTerm("");
                    setSelectedSort("Default Sorting");
                    setSliderMin(100);
                    setSliderMax(5000);
                    setAppliedPriceRange({ min: 100, max: 5000 });
                    setSelectedReviews([]);
                    setCurrentPage(1);
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              currentDisplayedProducts.map((product) => (
                <div key={product.id} className="product-card">
                  
                  <div className="product-image-container">
                    <div className="badge-group">
                      {product.badges.map((b, idx) => (
                        <span key={idx} className={`badge-item ${b.type}`}>
                          {b.text}
                        </span>
                      ))}
                    </div>

                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="product-card-img" 
                    />

                    <div className="image-hover-overlay">
                      <button className="overlay-action-btn" title="Add to Wishlist">
                        <FaHeart />
                      </button>
                      <button className="overlay-action-btn" title="Quick View">
                        <FaEye />
                      </button>
                    </div>
                  </div>

                  <div className="product-card-info">
                    <h4 className="product-title">{product.title}</h4>

                    <div className="product-meta-row">
                      <div className="price-tag">
                        <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.oldPrice && (
                          <span className="old-price">₹{product.oldPrice.toLocaleString('en-IN')}</span>
                        )}
                      </div>

                      <div className="rating-tag">
                        <FaStar className="star-icon" />
                        <span className="rating-value">{product.rating} ({product.reviews})</span>
                      </div>
                    </div>

                    <button 
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product.title)}
                    >
                      <span className="btn-content">
                        <FaShoppingBasket className="basket-icon" />
                        Add To Cart
                      </span>
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* ================= संदर्भ चित्र अनुसार पेजिनैशन ================= */}
          {totalPages > 1 && (
            <div className="reference-pagination-wrapper">
              
              {/* Previous बटन */}
              <button 
                className={`pagination-btn prev-btn ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {/* 1, 2, 3 बॉक्सेस */}
              {Array.from({ length: Math.min(3, totalPages) }, (_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    className={`pagination-box ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* ... (Ellipsis) अगर 3 से अधिक पेज हों */}
              {totalPages > 3 && (
                <button 
                  className={`pagination-box ellipsis-box ${currentPage > 3 ? 'active' : ''}`}
                  onClick={() => handlePageChange(totalPages)}
                >
                  ...
                </button>
              )}

              {/* Next बटन */}
              <button 
                className={`pagination-btn next-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>

            </div>
          )}

        </main>
      </div>

      {/* स्क्रॉल टू टॉप फ्लोटिंग बटन */}
      <button 
        className="scroll-to-top-btn" 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Scroll to Top"
      >
        <FaArrowUp />
      </button>

    </div>
  );
};

export default Addtocart;