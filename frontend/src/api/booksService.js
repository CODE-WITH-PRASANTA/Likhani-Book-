import API, { BASE_URL } from "./axios";

export const normalizeBook = (b) => {
  if (!b) return null;
  const id = String(b._id || b.id || "");
  const numericPrice = Number(b.price) || 0;
  const numericOffer = Number(b.offerPrice) || 0;
  const onSale = Boolean(numericOffer > 0 && numericPrice > numericOffer);
  const finalPrice = onSale ? numericOffer : numericPrice;
  const oldPrice = onSale ? numericPrice : null;
  const discount =
    onSale && numericPrice > 0
      ? Math.round(((numericPrice - numericOffer) / numericPrice) * 100)
      : 0;

  const rawImg = b.image || (Array.isArray(b.images) && b.images[0]) || "";
  const cleanImg = rawImg
    ? (rawImg.startsWith("http") || rawImg.startsWith("data:")
        ? rawImg
        : `${BASE_URL}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`)
    : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80";

  const totalSold = Number(b.totalSold || b.salesCount || 0);
  const isTopSelling = Boolean(b.isTopSelling);
  const isBestSeller = Boolean(b.isBestSeller);

  let badge = null;
  let badgeType = null;
  if (isTopSelling) {
    badge = "Top Selling";
    badgeType = "gold";
  } else if (isBestSeller) {
    badge = "Best Seller";
    badgeType = "orange";
  } else if (b.featured) {
    badge = "Featured";
    badgeType = "blue";
  } else if (onSale) {
    badge = "Special Offer";
    badgeType = "green";
  }

  const topSellingBadge = isTopSelling
    ? "Top Selling"
    : isBestSeller
    ? "Best Seller"
    : null;

  return {
    id,
    _id: id,
    title: b.title || "Untitled Book",
    author: b.author || "Likhani Author",
    category: b.category || "General",
    genre: b.category || "General",
    price: finalPrice,
    oldPrice: oldPrice,
    originalPrice: oldPrice,
    discount: discount,
    stock: b.stock === undefined || b.stock === null ? true : Number(b.stock) > 0,
    stockCount: Math.max(Number(b.stock) || 0, 0),
    totalSold,
    salesCount: totalSold,
    isTopSelling,
    isBestSeller,
    isHighestSelling: isTopSelling,
    isTopSeller: isTopSelling || isBestSeller,
    topSellingBadge,
    badge,
    badgeType,
    featured: Boolean(b.featured),
    hot: Boolean(isTopSelling || isBestSeller),
    image: cleanImg,
    images: Array.isArray(b.images) && b.images.length > 0 ? b.images : [cleanImg],
    description: b.description ? b.description.replace(/<[^>]+>/g, "").trim() : "A captivating selection curated for passionate readers.",
    pages: Number(b.pages) || 240,
    publisher: b.publisher || "Lekhani Publications",
    sku: b.sku || (b.isbn ? `ISBN-${b.isbn}` : null),
  };
};

let catalogCache = null;
let cacheTime = 0;

export const fetchAllCatalogBooks = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && catalogCache && now - cacheTime < 30000) {
    return catalogCache;
  }
  try {
    const [booksRes, postingRes] = await Promise.allSettled([
      API.get("/books", { params: { limit: 100 } }),
      API.get("/book-posting", { params: { limit: 100 } }),
    ]);

    const map = new Map();
    const ingest = (list) => {
      if (Array.isArray(list)) {
        list.forEach((item) => {
          if (item && (item._id || item.id)) {
            const formatted = normalizeBook(item);
            if (formatted) map.set(formatted.id, formatted);
          }
        });
      }
    };

    if (booksRes.status === "fulfilled" && booksRes.value?.data?.data) {
      ingest(booksRes.value.data.data);
    }
    if (postingRes.status === "fulfilled" && postingRes.value?.data?.data) {
      ingest(postingRes.value.data.data);
    }

    catalogCache = Array.from(map.values());
    cacheTime = now;
    return catalogCache;
  } catch (err) {
    console.error("Failed to fetch catalog books:", err);
    return catalogCache || [];
  }
};

/**
 * Fetch books where featured=true and status=Published from backend
 * Corresponds to the orange 'Featured' toggle in the Admin Panel
 */
export const fetchFeaturedBooks = async () => {
  try {
    // 1. Fetch from /book-posting (the primary admin table in Admin Panel)
    const postingRes = await API.get("/book-posting", {
      params: {
        featured: "true",
        status: "Published",
        limit: 50,
      },
    });

    const list = [];
    const seen = new Set();

    if (postingRes.data?.success && Array.isArray(postingRes.data.data)) {
      postingRes.data.data.forEach((item) => {
        if (item && (item._id || item.id) && item.featured) {
          const norm = normalizeBook(item);
          if (norm && !seen.has(norm.id)) {
            seen.add(norm.id);
            list.push(norm);
          }
        }
      });
    }

    // 2. Also check /books in case books were added there
    try {
      const booksRes = await API.get("/books", {
        params: {
          featured: "true",
          status: "Published",
          limit: 50,
        },
      });

      if (booksRes.data?.success && Array.isArray(booksRes.data.data)) {
        booksRes.data.data.forEach((item) => {
          if (item && (item._id || item.id) && item.featured) {
            const norm = normalizeBook(item);
            if (norm && !seen.has(norm.id)) {
              seen.add(norm.id);
              list.push(norm);
            }
          }
        });
      }
    } catch (e) {
      // Ignore fallback errors
    }

    return list;
  } catch (err) {
    console.error("Failed to fetch featured books from API:", err);
    return [];
  }
};

/**
 * Fetch dynamic top-selling categories computed from database orders and catalog
 */
export const fetchTopCategories = async () => {
  try {
    const res = await API.get("/categories/top-selling");
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map((cat) => ({
        ...cat,
        image:
          cat.image && (cat.image.startsWith("http") || cat.image.startsWith("data:"))
            ? cat.image
            : cat.image
            ? `${BASE_URL}${cat.image.startsWith("/") ? "" : "/"}${cat.image}`
            : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
      }));
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch top categories:", err);
    return [];
  }
};

/**
 * Fetch top selling books dynamically from backend based on actual customer sales
 */
export const fetchTopSellingBooks = async (limit = 10) => {
  try {
    const res = await API.get("/book-posting/top-selling", {
      params: { limit },
    });

    if (res.data?.success && Array.isArray(res.data.data)) {
      return {
        books: res.data.data.map(normalizeBook).filter(Boolean),
        highestSellingBook: normalizeBook(res.data.highestSellingBook),
        maxSold: res.data.maxSold || 0,
      };
    }
    return { books: [], highestSellingBook: null, maxSold: 0 };
  } catch (err) {
    console.error("Failed to fetch top selling books:", err);
    return { books: [], highestSellingBook: null, maxSold: 0 };
  }
};

/**
 * Fetch featured authors dynamically aggregated from backend published books
 */
export const fetchFeaturedAuthors = async () => {
  try {
    // 1. Try dedicated endpoint
    const res = await API.get("/book-posting/featured-authors");
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data;
    }
  } catch (e) {
    // Fall back to client-side catalog aggregation
  }

  try {
    const catalog = await fetchAllCatalogBooks();
    const map = new Map();
    const fallbackAvatars = [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    ];

    catalog.forEach((book) => {
      const name = (book.author || "").trim();
      if (!name || name.length < 2 || name.toLowerCase().includes("test author") || name.toLowerCase().startsWith("ssss")) {
        return;
      }
      const key = name.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { id: book.id || name, name, count: 1 });
      } else {
        map.get(key).count += 1;
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .map((author, idx) => ({
        id: author.id,
        name: author.name,
        count: author.count,
        books: `${String(author.count).padStart(2, "0")} Published Book${author.count > 1 ? "s" : ""}`,
        image: fallbackAvatars[idx % fallbackAvatars.length],
      }));
  } catch (err) {
    console.error("Failed to aggregate featured authors:", err);
    return [];
  }
};



