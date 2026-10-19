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

  return {
    id,
    _id: id,
    title: b.title || "Untitled Book",
    author: b.author || "Likhani Author",
    category: b.category || "General",
    price: finalPrice,
    oldPrice: oldPrice,
    discount: discount,
    stock: b.stock === undefined || b.stock === null ? true : Number(b.stock) > 0,
    stockCount: Math.max(Number(b.stock) || 0, 0),
    badge: b.featured ? "Bestseller" : onSale ? "Special Offer" : "Popular",
    badgeType: b.featured ? "orange" : onSale ? "green" : "blue",
    image: cleanImg,
    description: b.description || "",
    sku: b.isbn ? `ISBN-${b.isbn}` : `LKH-${id.slice(-4).toUpperCase()}`,
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
