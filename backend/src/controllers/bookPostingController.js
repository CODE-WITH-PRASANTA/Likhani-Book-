const BookPosting = require("../models/BookPosting");
const Order = require("../models/Order");
const {
  isValidObjectId,
  escapeRegex,
  safeDeleteUploadFile,
  saveBase64Image,
  convertFileToWebp,
} = require("../utils/helpers");

const computeBookSales = async () => {
  try {
    const paidOrders = await Order.find({
      $or: [
        { "paymentInfo.status": "Paid" },
        { orderStatus: { $in: ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"] } },
      ],
    })
      .select("items")
      .lean();

    const salesById = {};
    const salesByTitle = {};

    paidOrders.forEach((ord) => {
      (ord.items || []).forEach((item) => {
        const qty = Number(item.quantity) || 1;
        const bId = String(item.bookId || "").trim();
        const title = (item.title || "").trim().toLowerCase();
        if (bId) {
          salesById[bId] = (salesById[bId] || 0) + qty;
        }
        if (title) {
          salesByTitle[title] = (salesByTitle[title] || 0) + qty;
        }
      });
    });

    return { salesById, salesByTitle };
  } catch (err) {
    console.error("Error computing book sales from orders:", err);
    return { salesById: {}, salesByTitle: {} };
  }
};

// =========================================================
// GET ALL BOOK POSTINGS (Search, Category, Status, Pagination)
// =========================================================
exports.getBookPostings = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      status = "",
      featured = "",
      sort = "latest",
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    // Safe regex search on title and author
    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      query.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { author: { $regex: escaped, $options: "i" } },
      ];
    }

    // Category filter
    if (category && category !== "All Categories" && category !== "All") {
      query.category = category.trim();
    }

    // Status filter
    if (status && status !== "All Status" && status !== "All") {
      query.status = status.trim();
    }

    // Featured filter
    if (featured === "true" || featured === true) {
      query.featured = true;
    } else if (featured === "false" || featured === false) {
      query.featured = false;
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === "price-low") sortOptions = { price: 1 };
    else if (sort === "price-high") sortOptions = { price: -1 };
    else if (sort === "title-asc") sortOptions = { title: 1 };
    else if (sort === "title-desc") sortOptions = { title: -1 };
    else if (sort === "best-selling" || sort === "top-selling") sortOptions = { salesCount: -1, createdAt: -1 };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [{ salesById, salesByTitle }, total, items, globalTotal, publishedCount, draftCount] =
      await Promise.all([
        computeBookSales(),
        BookPosting.countDocuments(query),
        BookPosting.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
        BookPosting.countDocuments({}),
        BookPosting.countDocuments({ status: "Published" }),
        BookPosting.countDocuments({ status: "Draft" }),
      ]);

    // Compute sales and determine max sales across all retrieved items
    let maxSold = 0;
    const enrichedItems = items.map((b) => {
      const byId = salesById[String(b._id)] || 0;
      const byTitle = salesByTitle[(b.title || "").trim().toLowerCase()] || 0;
      const dbSales = Number(b.salesCount) || 0;
      const totalSold = Math.max(byId, byTitle, dbSales);
      if (totalSold > maxSold) maxSold = totalSold;
      return {
        ...b,
        totalSold,
        salesCount: totalSold,
      };
    });

    enrichedItems.forEach((book) => {
      book.isTopSelling = Boolean(book.isTopSelling);
      book.isBestSeller = Boolean(book.isBestSeller);
      book.isHighestSelling = book.isTopSelling;
      book.isTopSeller = book.isTopSelling || book.isBestSeller;
      book.topSellingBadge = book.isTopSelling
        ? "Top Selling"
        : book.isBestSeller
        ? "Best Seller"
        : book.featured
        ? "Featured"
        : null;
    });

    if (sort === "best-selling" || sort === "top-selling") {
      enrichedItems.sort((a, b) => b.totalSold - a.totalSold);
    }

    res.status(200).json({
      success: true,
      count: enrichedItems.length,
      data: enrichedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      stats: {
        total: globalTotal,
        published: publishedCount,
        draft: draftCount,
      },
    });
  } catch (error) {
    console.error("GET BOOK POSTINGS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// GET TOP SELLING BOOK POSTINGS
// =========================================================
exports.getTopSellingBookPostings = async (req, res) => {
  try {
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const category = req.query.category;

    const query = { status: "Published" };
    if (category && category !== "All Categories" && category !== "All") {
      query.category = category.trim();
    }

    const [books, { salesById, salesByTitle }] = await Promise.all([
      BookPosting.find(query).lean(),
      computeBookSales(),
    ]);

    if (!books || books.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        maxSold: 0,
        highestSellingBook: null,
        data: [],
      });
    }

    let maxSold = 0;
    const enrichedBooks = books.map((b) => {
      const byId = salesById[String(b._id)] || 0;
      const byTitle = salesByTitle[(b.title || "").trim().toLowerCase()] || 0;
      const dbSales = Number(b.salesCount) || 0;
      const totalSold = Math.max(byId, byTitle, dbSales);
      if (totalSold > maxSold) maxSold = totalSold;

      return {
        ...b,
        totalSold,
        salesCount: totalSold,
      };
    });

    // Sort by: isTopSelling first, then isBestSeller, then sales, then featured, then newest
    enrichedBooks.sort((a, b) => {
      const aTop = a.isTopSelling ? 1 : 0;
      const bTop = b.isTopSelling ? 1 : 0;
      if (bTop !== aTop) return bTop - aTop;

      const aBest = a.isBestSeller ? 1 : 0;
      const bBest = b.isBestSeller ? 1 : 0;
      if (bBest !== aBest) return bBest - aBest;

      if (b.totalSold !== a.totalSold) {
        return b.totalSold - a.totalSold;
      }
      if (b.featured !== a.featured) {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    enrichedBooks.forEach((book, index) => {
      book.rank = index + 1;
      book.isTopSelling = Boolean(book.isTopSelling);
      book.isBestSeller = Boolean(book.isBestSeller);
      book.isHighestSelling = book.isTopSelling;
      book.isTopSeller = book.isTopSelling || book.isBestSeller;
      book.topSellingBadge = book.isTopSelling
        ? "Top Selling"
        : book.isBestSeller
        ? "Best Seller"
        : book.featured
        ? "Featured"
        : null;
    });

    // If any books are explicitly marked as isTopSelling or isBestSeller, serve those
    const activeMarked = enrichedBooks.filter((b) => b.isTopSelling || b.isBestSeller);
    const booksToServe = activeMarked.length > 0 ? activeMarked : enrichedBooks;

    const highestSellingBook =
      booksToServe.find((b) => b.isTopSelling) ||
      booksToServe.find((b) => b.isBestSeller) ||
      booksToServe[0] ||
      null;

    const limitedBooks = booksToServe.slice(0, limit);

    return res.status(200).json({
      success: true,
      count: limitedBooks.length,
      maxSold,
      highestSellingBook,
      data: limitedBooks,
    });
  } catch (error) {
    console.error("GET TOP SELLING BOOKS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// GET FEATURED AUTHORS (FOR ABOUT PAGE & FEATURED AUTHOR SECTION)
// =========================================================
exports.getFeaturedAuthors = async (req, res) => {
  try {
    const Book = require("../models/Book");
    const [postingBooks, standardBooks] = await Promise.all([
      BookPosting.find({ status: "Published" }).lean(),
      Book.find({ status: "Published" }).lean(),
    ]);

    const allBooks = [...postingBooks, ...standardBooks];

    const authorAvatars = [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80",
    ];

    const authorsMap = new Map();

    allBooks.forEach((book) => {
      const authorName = (book.author || "").trim();
      if (
        !authorName ||
        authorName.length < 2 ||
        authorName.toLowerCase().includes("test author") ||
        authorName.toLowerCase().startsWith("ssss")
      ) {
        return;
      }

      const key = authorName.toLowerCase();
      if (!authorsMap.has(key)) {
        authorsMap.set(key, {
          id: String(book._id || authorName),
          name: authorName,
          booksCount: 1,
          categories: new Set(book.category ? [book.category] : []),
        });
      } else {
        const item = authorsMap.get(key);
        item.booksCount += 1;
        if (book.category) item.categories.add(book.category);
      }
    });

    const authorsList = Array.from(authorsMap.values())
      .sort((a, b) => b.booksCount - a.booksCount)
      .map((author, index) => ({
        id: author.id || `author-${index + 1}`,
        name: author.name,
        count: author.booksCount,
        books: `${String(author.booksCount).padStart(2, "0")} Published Book${
          author.booksCount > 1 ? "s" : ""
        }`,
        image: authorAvatars[index % authorAvatars.length],
        categories: Array.from(author.categories),
      }));

    return res.status(200).json({
      success: true,
      count: authorsList.length,
      data: authorsList,
    });
  } catch (error) {
    console.error("GET FEATURED AUTHORS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// GET SINGLE BOOK POSTING
// =========================================================
exports.getBookPostingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book posting ID format" });
    }

    const item = await BookPosting.findById(id).lean();
    if (!item) {
      return res.status(404).json({ success: false, message: "Book posting not found" });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error("GET BOOK POSTING BY ID ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// CREATE BOOK POSTING
// =========================================================
exports.createBookPosting = async (req, res) => {
  const imageFile = req.files?.image?.[0];
  const galleryFiles = req.files?.images || [];

  try {
    const {
      title,
      author,
      category,
      price,
      offerPrice,
      stock = 0,
      status = "Published",
      featured = false,
      isTopSelling = false,
      isBestSeller = false,
      publisher = "",
      pages = 0,
      language = "English",
      year = new Date().getFullYear(),
      description = "",
      image: textImage = "",
      images: bodyImages,
    } = req.body || {};

    if (!title?.trim() || !author?.trim() || !category?.trim() || price === undefined || price === "") {
      if (imageFile) safeDeleteUploadFile(imageFile.filename);
      galleryFiles.forEach((f) => safeDeleteUploadFile(f.filename));
      return res.status(400).json({
        success: false,
        message: "Title, author, category, and price are required.",
      });
    }

    const numericPrice = Number(price);
    const numericStock = Math.max(Number(stock) || 0, 0);

    if (isNaN(numericPrice) || numericPrice < 0) {
      if (imageFile) safeDeleteUploadFile(imageFile.filename);
      galleryFiles.forEach((f) => safeDeleteUploadFile(f.filename));
      return res.status(400).json({ success: false, message: "Please provide a valid price." });
    }

    // Determine primary cover image
    let primaryImage = textImage ? textImage.trim() : "";
    if (imageFile) {
      primaryImage = await convertFileToWebp(imageFile);
    } else if (primaryImage.startsWith("data:")) {
      primaryImage = await saveBase64Image(primaryImage);
    }

    // Gallery images
    let imagesArray = [];
    if (galleryFiles.length > 0) {
      imagesArray = await Promise.all(galleryFiles.map((f) => convertFileToWebp(f)));
    } else if (Array.isArray(bodyImages)) {
      imagesArray = await Promise.all(
        bodyImages
          .filter(Boolean)
          .map((img) => (typeof img === "string" && img.startsWith("data:") ? saveBase64Image(img) : img))
      );
    }
    if (primaryImage && !imagesArray.includes(primaryImage)) {
      imagesArray.unshift(primaryImage);
    }
    if (!primaryImage && imagesArray.length > 0) {
      primaryImage = imagesArray[0];
    }

    const calculatedStatus = numericStock === 0 ? "Out of Stock" : status;

    const bookPost = await BookPosting.create({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      price: numericPrice,
      offerPrice: offerPrice ? Number(offerPrice) : null,
      stock: numericStock,
      status: calculatedStatus,
      featured: featured === true || featured === "true",
      isTopSelling: isTopSelling === true || isTopSelling === "true",
      isBestSeller: isBestSeller === true || isBestSeller === "true",
      publisher: typeof publisher === "string" ? publisher.trim() : "",
      pages: pages !== "" && !isNaN(pages) ? Math.max(Number(pages) || 0, 0) : 0,
      language: typeof language === "string" && language.trim() ? language.trim() : "English",
      year: year !== "" && !isNaN(year) ? Number(year) : new Date().getFullYear(),
      description: description ? description.trim() : "",
      image: primaryImage,
      images: imagesArray,
    });

    res.status(201).json({
      success: true,
      message: "Book posting created successfully",
      data: bookPost,
    });
  } catch (error) {
    if (imageFile) safeDeleteUploadFile(imageFile.filename);
    galleryFiles.forEach((f) => safeDeleteUploadFile(f.filename));
    console.error("CREATE BOOK POSTING ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// =========================================================
// UPDATE BOOK POSTING
// =========================================================
exports.updateBookPosting = async (req, res) => {
  const imageFile = req.files?.image?.[0];
  const galleryFiles = req.files?.images || [];

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      if (imageFile) safeDeleteUploadFile(imageFile.filename);
      galleryFiles.forEach((f) => safeDeleteUploadFile(f.filename));
      return res.status(400).json({ success: false, message: "Invalid book posting ID format" });
    }

    const existing = await BookPosting.findById(id);
    if (!existing) {
      if (imageFile) safeDeleteUploadFile(imageFile.filename);
      galleryFiles.forEach((f) => safeDeleteUploadFile(f.filename));
      return res.status(404).json({ success: false, message: "Book posting not found" });
    }

    const updateData = { ...req.body };

    if (updateData.title !== undefined) updateData.title = updateData.title.trim();
    if (updateData.author !== undefined) updateData.author = updateData.author.trim();
    if (updateData.category !== undefined) updateData.category = updateData.category.trim();
    if (updateData.description !== undefined) updateData.description = updateData.description.trim();

    if (updateData.publisher !== undefined) {
      updateData.publisher = typeof updateData.publisher === "string" ? updateData.publisher.trim() : "";
    }
    if (updateData.pages !== undefined) {
      updateData.pages = updateData.pages !== "" && !isNaN(updateData.pages) ? Math.max(Number(updateData.pages) || 0, 0) : 0;
    }
    if (updateData.language !== undefined) {
      updateData.language = typeof updateData.language === "string" && updateData.language.trim() ? updateData.language.trim() : "English";
    }
    if (updateData.year !== undefined) {
      updateData.year = updateData.year !== "" && !isNaN(updateData.year) ? Number(updateData.year) : new Date().getFullYear();
    }

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.offerPrice !== undefined) {
      updateData.offerPrice = updateData.offerPrice ? Number(updateData.offerPrice) : null;
    }

    if (updateData.stock !== undefined) {
      updateData.stock = Math.max(Number(updateData.stock) || 0, 0);
      if (updateData.stock === 0) {
        updateData.status = "Out of Stock";
      } else if (existing.status === "Out of Stock" && updateData.stock > 0 && !updateData.status) {
        updateData.status = "Published";
      }
    }

    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === true || updateData.featured === "true";
    }

    if (updateData.isTopSelling !== undefined) {
      updateData.isTopSelling = updateData.isTopSelling === true || updateData.isTopSelling === "true";
    }

    if (updateData.isBestSeller !== undefined) {
      updateData.isBestSeller = updateData.isBestSeller === true || updateData.isBestSeller === "true";
    }

    // New uploaded cover image
    if (imageFile) {
      if (existing.image && existing.image.startsWith("/uploads/")) {
        safeDeleteUploadFile(existing.image.replace("/uploads/", ""));
      }
      updateData.image = await convertFileToWebp(imageFile);
    } else if (updateData.image && typeof updateData.image === "string" && updateData.image.startsWith("data:")) {
      updateData.image = await saveBase64Image(updateData.image);
    }

    // Gallery images
    if (galleryFiles.length > 0) {
      const newImages = await Promise.all(galleryFiles.map((f) => convertFileToWebp(f)));
      updateData.images = newImages;
      if (updateData.image && !updateData.images.includes(updateData.image)) {
        updateData.images.unshift(updateData.image);
      }
    } else if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = await Promise.all(
        updateData.images
          .filter(Boolean)
          .map((img) => (typeof img === "string" && img.startsWith("data:") ? saveBase64Image(img) : img))
      );
    }

    const updated = await BookPosting.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Book posting updated successfully",
      data: updated,
    });
  } catch (error) {
    if (imageFile) safeDeleteUploadFile(imageFile.filename);
    galleryFiles.forEach((f) => safeDeleteUploadFile(f.filename));
    console.error("UPDATE BOOK POSTING ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// =========================================================
// DELETE BOOK POSTING
// =========================================================
exports.deleteBookPosting = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book posting ID format" });
    }

    const item = await BookPosting.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Book posting not found" });
    }

    // Clean up uploaded files
    if (item.image && item.image.startsWith("/uploads/")) {
      safeDeleteUploadFile(item.image.replace("/uploads/", ""));
    }
    if (Array.isArray(item.images)) {
      item.images.forEach((imgPath) => {
        if (imgPath && imgPath.startsWith("/uploads/")) {
          safeDeleteUploadFile(imgPath.replace("/uploads/", ""));
        }
      });
    }

    await BookPosting.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Book posting deleted successfully",
    });
  } catch (error) {
    console.error("DELETE BOOK POSTING ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// BULK DELETE BOOK POSTINGS
// =========================================================
exports.bulkDeleteBookPostings = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No IDs provided for bulk deletion" });
    }

    const validIds = ids.filter((id) => isValidObjectId(id));
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: "No valid ObjectIds provided" });
    }

    const items = await BookPosting.find({ _id: { $in: validIds } });

    // Clean up files
    items.forEach((item) => {
      if (item.image && item.image.startsWith("/uploads/")) {
        safeDeleteUploadFile(item.image.replace("/uploads/", ""));
      }
      if (Array.isArray(item.images)) {
        item.images.forEach((imgPath) => {
          if (imgPath && imgPath.startsWith("/uploads/")) {
            safeDeleteUploadFile(imgPath.replace("/uploads/", ""));
          }
        });
      }
    });

    const result = await BookPosting.deleteMany({ _id: { $in: validIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} book posting(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("BULK DELETE BOOK POSTINGS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// TOGGLE STATUS
// =========================================================
exports.toggleBookPostingStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book posting ID format" });
    }

    const item = await BookPosting.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Book posting not found" });
    }

    const newStatus = item.status === "Published" ? "Draft" : "Published";
    item.status = newStatus;
    await item.save();

    res.status(200).json({
      success: true,
      message: `Status updated to ${newStatus}`,
      data: item,
    });
  } catch (error) {
    console.error("TOGGLE STATUS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// TOGGLE FEATURED
// =========================================================
exports.toggleBookPostingFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book posting ID format" });
    }

    const item = await BookPosting.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Book posting not found" });
    }

    item.featured = !item.featured;
    await item.save();

    res.status(200).json({
      success: true,
      message: `Featured status updated to ${item.featured}`,
      data: item,
    });
  } catch (error) {
    console.error("TOGGLE FEATURED ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// TOGGLE TOP SELLING
// =========================================================
exports.toggleBookPostingTopSelling = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book posting ID format" });
    }

    const item = await BookPosting.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Book posting not found" });
    }

    item.isTopSelling = !item.isTopSelling;
    await item.save();

    res.status(200).json({
      success: true,
      message: `Top Selling status updated to ${item.isTopSelling}`,
      data: item,
    });
  } catch (error) {
    console.error("TOGGLE TOP SELLING ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// TOGGLE BEST SELLER
// =========================================================
exports.toggleBookPostingBestSeller = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book posting ID format" });
    }

    const item = await BookPosting.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Book posting not found" });
    }

    item.isBestSeller = !item.isBestSeller;
    await item.save();

    res.status(200).json({
      success: true,
      message: `Best Seller status updated to ${item.isBestSeller}`,
      data: item,
    });
  } catch (error) {
    console.error("TOGGLE BEST SELLER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

