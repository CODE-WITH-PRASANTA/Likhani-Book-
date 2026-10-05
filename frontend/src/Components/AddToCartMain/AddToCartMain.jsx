import React, { useMemo, useState } from "react";
import "./AddToCartMain.css";

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
  FaArrowUp,
} from "react-icons/fa";

/* =========================================================
   PRODUCT DATA
========================================================= */

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
    badges: [
      { text: "Hot", type: "hot" },
      { text: "-30%", type: "discount" },
    ],
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 95,
    latestDate: "2026-03-01",
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
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 88,
    latestDate: "2026-02-15",
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
    image:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: false,
    popularity: 92,
    latestDate: "2026-01-20",
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
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 70,
    latestDate: "2026-04-10",
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
    image:
      "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 85,
    latestDate: "2026-04-01",
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
    image:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 99,
    latestDate: "2026-04-14",
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
    image:
      "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 97,
    latestDate: "2026-03-25",
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
    image:
      "https://images.unsplash.com/photo-1507842229451-79b1be886a20?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 91,
    latestDate: "2026-04-05",
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
    image:
      "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: false,
    popularity: 80,
    latestDate: "2026-02-28",
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
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 76,
    latestDate: "2026-01-15",
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
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=80",
    inStock: false,
    onSale: false,
    popularity: 89,
    latestDate: "2026-03-12",
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
    image:
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 94,
    latestDate: "2026-04-18",
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
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: false,
    popularity: 65,
    latestDate: "2026-02-10",
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
    image:
      "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 83,
    latestDate: "2026-03-30",
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
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 96,
    latestDate: "2026-04-08",
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
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: false,
    popularity: 74,
    latestDate: "2026-01-29",
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
    image:
      "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 98,
    latestDate: "2026-04-12",
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
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 99,
    latestDate: "2026-03-18",
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
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 81,
    latestDate: "2026-02-22",
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
    image:
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: false,
    popularity: 79,
    latestDate: "2026-03-05",
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
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 93,
    latestDate: "2026-04-09",
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
    image:
      "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 84,
    latestDate: "2026-01-18",
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
    image:
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 90,
    latestDate: "2026-04-15",
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
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: false,
    popularity: 73,
    latestDate: "2026-02-04",
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
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 92,
    latestDate: "2026-03-22",
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
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 87,
    latestDate: "2026-04-03",
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
    image:
      "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 95,
    latestDate: "2026-03-14",
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
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: false,
    popularity: 86,
    latestDate: "2026-02-18",
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
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 94,
    latestDate: "2026-04-02",
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
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 88,
    latestDate: "2026-03-27",
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
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 96,
    latestDate: "2026-04-11",
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
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=400&auto=format&fit=crop&q=80",
    inStock: true,
    onSale: true,
    popularity: 82,
    latestDate: "2026-02-14",
  },
];

/* =========================================================
   FILTER DATA
========================================================= */

const categoriesList = [
  "All Categories",
  "Arts & Photography",
  "Biographies & Memoirs",
  "Christian Books & Bibles",
  "Research & Publishing Guides",
  "Sports & Outdoors",
  "Food & Drink",
];

const reviewOptions = [
  { stars: 5, count: 35 },
  { stars: 4, count: 24 },
  { stars: 3, count: 15 },
  { stars: 2, count: 2 },
  { stars: 1, count: 1 },
];

/* =========================================================
   COMPONENT
========================================================= */

const AddToCartMain = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All Categories");

  const [inStockOpen, setInStockOpen] = useState(false);
  const [onSaleOpen, setOnSaleOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [selectedSort, setSelectedSort] =
    useState("Default Sorting");

  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState(null);

  const [cartCount, setCartCount] = useState(0);
  const [toastMessage, setToastMessage] = useState("");

  const [sliderMin, setSliderMin] = useState(100);
  const [sliderMax, setSliderMax] = useState(5000);

  const [appliedPriceRange, setAppliedPriceRange] =
    useState({
      min: 100,
      max: 5000,
    });

  const [selectedReviews, setSelectedReviews] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  /* =======================================================
     REVIEW FILTER
  ======================================================= */

  const handleReviewToggle = (stars) => {
    setSelectedReviews((prev) =>
      prev.includes(stars)
        ? prev.filter((item) => item !== stars)
        : [...prev, stars]
    );

    setCurrentPage(1);
  };

  /* =======================================================
     PRICE FILTER
  ======================================================= */

  const handleApplyPriceFilter = () => {
    setAppliedPriceRange({
      min: sliderMin,
      max: sliderMax,
    });

    setCurrentPage(1);
  };

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart = (productTitle) => {
    setCartCount((prev) => prev + 1);

    setToastMessage(
      `"${productTitle}" added to cart!`
    );

    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    /* Search */
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(search) ||
          product.category.toLowerCase().includes(search)
      );
    }

    /* Category */
    if (
      !selectedStatusFilter &&
      !searchTerm &&
      selectedCategory !== "All Categories"
    ) {
      result = result.filter(
        (product) =>
          product.category === selectedCategory
      );
    }

    /* Status */
    if (selectedStatusFilter) {
      if (selectedStatusFilter === "In Stock") {
        result = result.filter(
          (product) => product.inStock
        );
      } else if (
        selectedStatusFilter === "On Sale"
      ) {
        result = result.filter(
          (product) => product.onSale
        );
      } else {
        result = result.filter(
          (product) =>
            product.title.toLowerCase() ===
            selectedStatusFilter.toLowerCase()
        );
      }
    }

    /* Price */
    result = result.filter(
      (product) =>
        product.price >= appliedPriceRange.min &&
        product.price <= appliedPriceRange.max
    );

    /* Reviews */
    if (selectedReviews.length > 0) {
      result = result.filter((product) =>
        selectedReviews.includes(product.starGroup)
      );
    }

    /* Sorting */
    if (selectedSort === "Sort By Popularity") {
      result.sort(
        (a, b) => b.popularity - a.popularity
      );
    }

    if (
      selectedSort ===
      "Sort By Average Rating"
    ) {
      result.sort(
        (a, b) => b.rating - a.rating
      );
    }

    if (selectedSort === "Sort By Latest") {
      result.sort(
        (a, b) =>
          new Date(b.latestDate) -
          new Date(a.latestDate)
      );
    }

    return result;
  }, [
    searchTerm,
    selectedCategory,
    selectedStatusFilter,
    appliedPriceRange,
    selectedReviews,
    selectedSort,
  ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.ceil(
    filteredProducts.length / itemsPerPage
  );

  const currentDisplayedProducts = useMemo(() => {
    const startIndex =
      (currentPage - 1) * itemsPerPage;

    return filteredProducts.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [
    filteredProducts,
    currentPage,
  ]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 400,
      behavior: "smooth",
    });
  };

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  const resetFilters = () => {
    setSelectedCategory("All Categories");
    setSelectedStatusFilter(null);
    setSearchTerm("");
    setSelectedSort("Default Sorting");

    setSliderMin(100);
    setSliderMax(5000);

    setAppliedPriceRange({
      min: 100,
      max: 5000,
    });

    setSelectedReviews([]);
    setCurrentPage(1);
  };

  return (
    <section className="AddToCartMain">

      {/* =================================================
          CART NOTIFICATION
      ================================================= */}

      {toastMessage && (
        <div className="AddToCartMain__cart-notification">
          {toastMessage}
        </div>
      )}

      <div className="AddToCartMain__main-layout">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="AddToCartMain__sidebar">

          {/* Search */}
          <div className="AddToCartMain__sidebar-block">
            <h3 className="AddToCartMain__sidebar-heading">
              Search
            </h3>

            <div className="AddToCartMain__search-box">
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

              <FaSearch className="AddToCartMain__search-icon" />
            </div>
          </div>

          {/* Categories */}
          <div className="AddToCartMain__sidebar-block">
            <h3 className="AddToCartMain__sidebar-heading">
              Categories
            </h3>

            <div className="AddToCartMain__category-list">
              {categoriesList.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`AddToCartMain__category-btn ${
                    selectedCategory === category &&
                    !selectedStatusFilter
                      ? "AddToCartMain__category-btn--active"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedStatusFilter(null);
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Product Status */}
          <div className="AddToCartMain__sidebar-block">
            <h3 className="AddToCartMain__sidebar-heading">
              Product Status
            </h3>

            {/* In Stock */}
            <div className="AddToCartMain__dropdown-container">

              <button
                type="button"
                className="AddToCartMain__dropdown-trigger"
                onClick={() => {
                  setInStockOpen((prev) => !prev);
                  setOnSaleOpen(false);
                }}
              >
                <span>In Stock</span>

                <span className="AddToCartMain__arrow-badge">
                  {inStockOpen ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </span>
              </button>

              {inStockOpen && (
                <div className="AddToCartMain__dropdown-menu">

                  {[
                    "In Stock",
                    "Castle In The Sky",
                    "The Hidden Mystery Behind",
                    "Flovely And Unicorn Erna",
                  ].map((item) => (
                    <button
                      type="button"
                      key={item}
                      className="AddToCartMain__dropdown-item"
                      onClick={() => {
                        setSelectedStatusFilter(item);
                        setInStockOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      {item}
                    </button>
                  ))}

                </div>
              )}
            </div>

            {/* On Sale */}
            <div className="AddToCartMain__dropdown-container">

              <button
                type="button"
                className="AddToCartMain__dropdown-trigger"
                onClick={() => {
                  setOnSaleOpen((prev) => !prev);
                  setInStockOpen(false);
                }}
              >
                <span>On Sale</span>

                <span className="AddToCartMain__arrow-badge">
                  {onSaleOpen ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </span>
              </button>

              {onSaleOpen && (
                <div className="AddToCartMain__dropdown-menu">

                  {[
                    "On Sale",
                    "Flovely And Unicorn Erna",
                    "Castle In The Sky",
                    "How Deal With Very Bad BOOK",
                  ].map((item) => (
                    <button
                      type="button"
                      key={item}
                      className="AddToCartMain__dropdown-item"
                      onClick={() => {
                        setSelectedStatusFilter(item);
                        setOnSaleOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      {item}
                    </button>
                  ))}

                </div>
              )}

            </div>
          </div>

          {/* Price */}
          <div className="AddToCartMain__sidebar-block">

            <h3 className="AddToCartMain__sidebar-heading">
              Filter By Price
            </h3>

            <div className="AddToCartMain__price-slider">

              <div className="AddToCartMain__slider-bg" />

              <div
                className="AddToCartMain__slider-highlight"
                style={{
                  left: `${
                    ((sliderMin - 100) / 4900) *
                    100
                  }%`,
                  right: `${
                    100 -
                    ((sliderMax - 100) / 4900) *
                      100
                  }%`,
                }}
              />

              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={sliderMin}
                onChange={(e) => {
                  const value = Math.min(
                    Number(e.target.value),
                    sliderMax - 100
                  );

                  setSliderMin(value);
                }}
                className="AddToCartMain__range-input"
              />

              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={sliderMax}
                onChange={(e) => {
                  const value = Math.max(
                    Number(e.target.value),
                    sliderMin + 100
                  );

                  setSliderMax(value);
                }}
                className="AddToCartMain__range-input"
              />

            </div>

            <div className="AddToCartMain__price-action">

              <button
                type="button"
                className="AddToCartMain__price-filter-btn"
                onClick={handleApplyPriceFilter}
              >
                Filter
              </button>

              <span className="AddToCartMain__price-label">
                Price:{" "}
                <strong>
                  ₹{sliderMin.toLocaleString("en-IN")}
                  {" — "}
                  ₹{sliderMax.toLocaleString("en-IN")}
                </strong>
              </span>

            </div>

          </div>

          {/* Reviews */}
          <div className="AddToCartMain__sidebar-block">

            <h3 className="AddToCartMain__sidebar-heading">
              By Review
            </h3>

            <div className="AddToCartMain__review-list">

              {reviewOptions.map((option) => (
                <label
                  key={option.stars}
                  className="AddToCartMain__review-row"
                >
                  <input
                    type="checkbox"
                    checked={selectedReviews.includes(
                      option.stars
                    )}
                    onChange={() =>
                      handleReviewToggle(
                        option.stars
                      )
                    }
                    className="AddToCartMain__review-checkbox"
                  />

                  <div className="AddToCartMain__stars">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <FaStar
                          key={star}
                          className={`AddToCartMain__star ${
                            star <= option.stars
                              ? "AddToCartMain__star--filled"
                              : "AddToCartMain__star--empty"
                          }`}
                        />
                      )
                    )}

                  </div>

                  <span className="AddToCartMain__review-count">
                    {option.count}
                  </span>
                </label>
              ))}

            </div>
          </div>

        </aside>

        {/* =================================================
            PRODUCTS AREA
        ================================================= */}

        <main className="AddToCartMain__products-content">

          {/* Top Bar */}
          <div className="AddToCartMain__top-filter-bar">

            <span className="AddToCartMain__results-text">
              Showing{" "}
              {filteredProducts.length > 0
                ? (currentPage - 1) *
                    itemsPerPage +
                  1
                : 0}
              -
              {Math.min(
                currentPage * itemsPerPage,
                filteredProducts.length
              )}{" "}
              Of {filteredProducts.length} Results
            </span>

            <div className="AddToCartMain__top-controls">

              {/* Sorting */}
              <div className="AddToCartMain__sort-wrapper">

                <button
                  type="button"
                  className="AddToCartMain__sort-btn"
                  onClick={() =>
                    setSortOpen((prev) => !prev)
                  }
                >
                  <span>{selectedSort}</span>

                  <FaChevronDown className="AddToCartMain__sort-arrow" />
                </button>

                {sortOpen && (
                  <div className="AddToCartMain__sort-menu">

                    {[
                      "Default Sorting",
                      "Sort By Popularity",
                      "Sort By Average Rating",
                      "Sort By Latest",
                    ].map((option) => (
                      <button
                        type="button"
                        key={option}
                        className="AddToCartMain__sort-option"
                        onClick={() => {
                          setSelectedSort(option);
                          setSortOpen(false);
                          setCurrentPage(1);
                        }}
                      >
                        {option}
                      </button>
                    ))}

                  </div>
                )}

              </div>

              {/* View Icons */}
              <div className="AddToCartMain__view-icons">

                <FaList className="AddToCartMain__view-icon" />

                <FaThLarge className="AddToCartMain__view-icon AddToCartMain__view-icon--active" />

              </div>

            </div>
          </div>

          {/* Products */}
          <div className="AddToCartMain__products-grid">

            {currentDisplayedProducts.length === 0 ? (

              <div className="AddToCartMain__no-products">

                <p>
                  No products found matching
                  your filter criteria.
                </p>

                <button
                  type="button"
                  className="AddToCartMain__reset-btn"
                  onClick={resetFilters}
                >
                  Reset All Filters
                </button>

              </div>

            ) : (

              currentDisplayedProducts.map(
                (product) => (

                  <article
                    key={product.id}
                    className="AddToCartMain__product-card"
                  >

                    {/* Image */}
                    <div className="AddToCartMain__image-container">

                      <div className="AddToCartMain__badge-group">

                        {product.badges.map(
                          (badge, index) => (
                            <span
                              key={index}
                              className={`AddToCartMain__badge AddToCartMain__badge--${badge.type}`}
                            >
                              {badge.text}
                            </span>
                          )
                        )}

                      </div>

                      <img
                        src={product.image}
                        alt={product.title}
                        className="AddToCartMain__product-image"
                        loading="lazy"
                      />

                      <div className="AddToCartMain__hover-overlay">

                        <button
                          type="button"
                          className="AddToCartMain__overlay-btn"
                          title="Add to Wishlist"
                        >
                          <FaHeart />
                        </button>

                        <button
                          type="button"
                          className="AddToCartMain__overlay-btn"
                          title="Quick View"
                        >
                          <FaEye />
                        </button>

                      </div>

                    </div>

                    {/* Info */}
                    <div className="AddToCartMain__product-info">

                      <h4 className="AddToCartMain__product-title">
                        {product.title}
                      </h4>

                      <div className="AddToCartMain__meta-row">

                        <div className="AddToCartMain__price-tag">

                          <span className="AddToCartMain__current-price">
                            ₹
                            {product.price.toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          {product.oldPrice && (
                            <span className="AddToCartMain__old-price">
                              ₹
                              {product.oldPrice.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          )}

                        </div>

                        <div className="AddToCartMain__rating">

                          <FaStar className="AddToCartMain__rating-star" />

                          <span>
                            {product.rating} (
                            {product.reviews})
                          </span>

                        </div>

                      </div>

                      <button
                        type="button"
                        className="AddToCartMain__add-cart-btn"
                        onClick={() =>
                          handleAddToCart(
                            product.title
                          )
                        }
                      >
                        <span className="AddToCartMain__btn-content">

                          <FaShoppingBasket className="AddToCartMain__basket-icon" />

                          Add To Cart

                        </span>
                      </button>

                    </div>

                  </article>

                )
              )

            )}

          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="AddToCartMain__pagination">

              <button
                type="button"
                className={`AddToCartMain__pagination-btn ${
                  currentPage === 1
                    ? "AddToCartMain__pagination-btn--disabled"
                    : ""
                }`}
                onClick={() =>
                  handlePageChange(
                    currentPage - 1
                  )
                }
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {Array.from(
                {
                  length: Math.min(
                    3,
                    totalPages
                  ),
                },
                (_, index) => {
                  const page =
                    index + 1;

                  return (
                    <button
                      type="button"
                      key={page}
                      className={`AddToCartMain__pagination-box ${
                        currentPage === page
                          ? "AddToCartMain__pagination-box--active"
                          : ""
                      }`}
                      onClick={() =>
                        handlePageChange(page)
                      }
                    >
                      {page}
                    </button>
                  );
                }
              )}

              {totalPages > 3 && (
                <button
                  type="button"
                  className={`AddToCartMain__pagination-box ${
                    currentPage > 3
                      ? "AddToCartMain__pagination-box--active"
                      : ""
                  }`}
                  onClick={() =>
                    handlePageChange(
                      totalPages
                    )
                  }
                >
                  ...
                </button>
              )}

              <button
                type="button"
                className={`AddToCartMain__pagination-btn ${
                  currentPage === totalPages
                    ? "AddToCartMain__pagination-btn--disabled"
                    : ""
                }`}
                onClick={() =>
                  handlePageChange(
                    currentPage + 1
                  )
                }
                disabled={
                  currentPage === totalPages
                }
              >
                Next
              </button>

            </div>
          )}

        </main>
      </div>

      {/* Scroll To Top */}
      <button
        type="button"
        className="AddToCartMain__scroll-top"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
        title="Scroll to Top"
        aria-label="Scroll to top"
      >
        <FaArrowUp />
      </button>

      {/* Cart Count - optional */}
      <span className="AddToCartMain__cart-count">
        {cartCount}
      </span>

    </section>
  );
};

export default AddToCartMain;