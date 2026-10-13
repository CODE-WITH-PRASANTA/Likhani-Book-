/* =========================================================
   SHARED SHOP DATA
   Used by both ShopMain (listing) and BookDetails (detail page)
========================================================= */

// Change this if your shop page lives on a different route
export const SHOP_PATH = "/shop";

export const categoriesList = [
  "All Categories",
  "Arts & Photography",
  "Biographies & Memoirs",
  "Christian Books & Bibles",
  "Research & Publishing Guides",
  "Sports & Outdoors",
  "Food & Drink",
];

export const categoryBlurbs = {
  "Arts & Photography":
    "A beautifully produced guide to creative practice, visual storytelling and the ideas behind great work. Perfect for students, makers and curious readers.",
  "Biographies & Memoirs":
    "Real stories, honest reflections and hard-won lessons from remarkable lives. An engaging read that stays with you long after the last page.",
  "Christian Books & Bibles":
    "A thoughtful companion for faith, reflection and daily devotion, written with clarity and a calm, encouraging voice.",
  "Research & Publishing Guides":
    "A clear, practical reference that breaks complex ideas into steps you can use right away, whether you study, write or build.",
  "Sports & Outdoors":
    "Practical advice, training insight and inspiring stories for people who love to move, explore and push their limits.",
  "Food & Drink":
    "Approachable recipes and kitchen know-how, with step-by-step guidance that makes cooking at home a pleasure.",
};

export const imageUrl = (id, width = 600) =>
  `https://images.unsplash.com/${id}?w=${width}&auto=format&fit=crop&q=80`;

export const formatPrice = (value) => `₹${value.toLocaleString("en-IN")}`;

/*
  Row format:
  [id, title, price, oldPrice, categoryIndex, hot, imageId,
   inStock, onSale, popularity, latestDate]
*/
export const products = [
  [1, "Simple Things You Save BOOK", 499, null, 1, true, "photo-1544947950-fa07a98d237f", true, true, 95, "2026-03-01"],
  [2, "How Deal With Very Bad BOOK", 649, null, 2, false, "photo-1512820790803-83ca734da794", true, true, 88, "2026-02-15"],
  [3, "The Hidden Mystery Behind", 520, 699, 1, false, "photo-1543002588-bfa74002ed7e", true, false, 92, "2026-01-20"],
  [4, "Qple GPad With Retina Display", 3499, 4200, 3, false, "photo-1497633762265-9d179a990aa6", true, true, 70, "2026-04-10"],
  [5, "Flovely And Unicorn Erna", 380, null, 4, false, "photo-1532012164546-f432f2e3777f", true, true, 85, "2026-04-01"],
  [6, "Castle In The Sky", 299, null, 5, false, "photo-1516979187457-637abb4f9353", true, true, 99, "2026-04-14"],
  [7, "The Art of Creative Thinking", 1150, 1400, 1, true, "photo-1495640388908-05fa85288e61", true, true, 97, "2026-03-25"],
  [8, "Mastering Modern UX Design", 1890, null, 4, false, "photo-1507842229451-79b1be886a20", true, true, 91, "2026-04-05"],
  [9, "Mindset: The New Psychology", 750, null, 2, false, "photo-1491841573634-28140fc7ced7", true, false, 80, "2026-02-28"],
  [10, "The Ultimate Guide to Nutrition", 550, 750, 6, false, "photo-1490645935967-10de6ba17061", true, true, 76, "2026-01-15"],
  [11, "Extreme Outdoor Adventures", 2400, null, 5, false, "photo-1519681393784-d120267933ba", false, false, 89, "2026-03-12"],
  [12, "Collector's Ancient Scriptures", 4500, 5200, 3, true, "photo-1457369804613-52c61a468e7d", true, true, 94, "2026-04-18"],
  [13, "Quick Italian Pasta Cooking", 420, null, 6, false, "photo-1551183053-bf91a1d81141", true, false, 65, "2026-02-10"],
  [14, "The Historical Chronicles", 2890, null, 2, false, "photo-1463320726281-696a485928c7", true, true, 83, "2026-03-30"],
  [15, "Contemporary Architectural Forms", 1650, 1999, 1, false, "photo-1486406146926-c627a92ad1ab", true, true, 96, "2026-04-08"],
  [16, "Philosophy of Living Well", 890, null, 4, false, "photo-1524995997946-a1c2e315a42f", true, false, 74, "2026-01-29"],
  [17, "The Psychology of Money", 399, 499, 2, true, "photo-1592496431122-2349e0fbc666", true, true, 98, "2026-04-12"],
  [18, "Atomic Habits & Daily Routines", 540, 650, 4, false, "photo-1544716278-ca5e3f4abd8c", true, true, 99, "2026-03-18"],
  [19, "Street Food Culinary Secrets", 699, null, 6, false, "photo-1555396273-367ea4eb4db5", true, true, 81, "2026-02-22"],
  [20, "Mountaineering Survival Handbook", 1350, 1700, 5, false, "photo-1526778548025-fa2f459cd5c1", true, false, 79, "2026-03-05"],
  [21, "Vintage Cinema Posters Volume 1", 2100, null, 1, true, "photo-1518709268805-4e9042af9f23", true, true, 93, "2026-04-09"],
  [22, "Ancient Faith and Medieval Saints", 1250, 1500, 3, false, "photo-1476275466078-4007374efbbe", true, true, 84, "2026-01-18"],
  [23, "Minimalist Typography in Practice", 1590, null, 1, false, "photo-1513475382585-d06e58bcb0e0", true, true, 90, "2026-04-15"],
  [24, "Life in the Shadows of Titans", 820, null, 2, false, "photo-1497633762265-9d179a990aa6", true, false, 73, "2026-02-04"],
  [25, "Baking Artisan Bread at Home", 799, 999, 6, false, "photo-1509440159596-0249088772ff", true, true, 92, "2026-03-22"],
  [26, "Marathon Training & Endurance", 1100, null, 5, false, "photo-1461896836934-ffe607ba8211", true, true, 87, "2026-04-03"],
  [27, "Sacred Texts & Devotionals", 950, null, 3, true, "photo-1505664194779-8beaceb93744", true, true, 95, "2026-03-14"],
  [28, "Scientific Research Methods 2026", 2800, 3200, 4, false, "photo-1456513080510-7bf3a84b82f8", true, false, 86, "2026-02-18"],
  [29, "Color Theory for Visual Artists", 1450, null, 1, false, "photo-1513364776144-60967b0f800f", true, true, 94, "2026-04-02"],
  [30, "Memoirs of an Himalayan Guide", 680, 850, 2, false, "photo-1506744038136-46273834b3fb", true, true, 88, "2026-03-27"],
  [31, "Mastering French Pastries", 1199, null, 6, true, "photo-1509440159596-0249088772ff", true, true, 96, "2026-04-11"],
  [32, "The Champion's Mindset in Sports", 890, null, 5, false, "photo-1517649763962-0c623266ddc0", true, true, 82, "2026-02-14"],
].map(
  ([id, title, price, oldPrice, cat, hot, img, inStock, onSale, popularity, latestDate]) => ({
    id,
    sku: `LKH-${String(id).padStart(4, "0")}`,
    title,
    price,
    oldPrice,
    category: categoriesList[cat],
    hot,
    image: imageUrl(img, 600),
    imageLarge: imageUrl(img, 1000),
    inStock,
    onSale,
    popularity,
    latestDate,
    description: categoryBlurbs[categoriesList[cat]],
    discount: oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0,
  })
);

export const getProductById = (id) =>
  products.find((product) => String(product.id) === String(id)) || null;

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });