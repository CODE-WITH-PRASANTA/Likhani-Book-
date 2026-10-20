const Book = require("../models/Book");
const Order = require("../models/Order");
const { escapeRegex, isValidObjectId, safeDeleteUploadFile } = require("../utils/helpers");

// =========================================================
// GET ALL BOOKS (Search, Filter, Sort, Pagination, Stats)
// =========================================================
exports.getBooks = async (req, res) => {
  try {
    const {
      search = "",
      category = "All Categories",
      status = "All Status",
      stock = "All Stock",
      sort = "Sort By: Latest",
      page = 1,
      limit = 8,
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 8, 1);

    const query = {};

    // 1. Safe Search
    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      const regex = new RegExp(safeSearch, "i");
      query.$or = [
        { title: regex },
        { author: regex },
        { isbn: regex },
        { publisher: regex },
      ];
    }

    // 2. Category Filter
    if (category && category !== "All Categories" && category !== "All") {
      query.category = category;
    }

    // 3. Status Filter
    if (status && status !== "All Status" && status !== "All") {
      query.status = status;
    }

    // 4. Stock Filter
    if (stock && stock !== "All Stock" && stock !== "All") {
      if (stock === "In Stock") {
        query.stock = { $gt: 0 };
      } else if (stock === "Out of Stock") {
        query.stock = 0;
      } else if (stock === "Low Stock") {
        query.stock = { $gt: 0, $lte: 10 };
      }
    }

    // 5. Featured Filter
    if (req.query.featured === "true" || req.query.featured === true) {
      query.featured = true;
    } else if (req.query.featured === "false" || req.query.featured === false) {
      query.featured = false;
    }

    // 5. Sort Configuration
    let sortConfig = { createdAt: -1 };
    if (sort === "Sort By: A-Z") {
      sortConfig = { title: 1 };
    } else if (sort === "Sort By: Price Low") {
      sortConfig = { price: 1 };
    } else if (sort === "Sort By: Price High") {
      sortConfig = { price: -1 };
    } else if (sort === "Sort By: Stock") {
      sortConfig = { stock: -1 };
    }

    // Concurrent execution of data fetch and global stats
    const [totalMatching, books, statsTotal, statsPublished, statsDraft, statsOutOfStock] =
      await Promise.all([
        Book.countDocuments(query),
        Book.find(query)
          .sort(sortConfig)
          .skip((pageNumber - 1) * limitNumber)
          .limit(limitNumber)
          .lean(),
        Book.countDocuments(),
        Book.countDocuments({ status: "Published" }),
        Book.countDocuments({ status: "Draft" }),
        Book.countDocuments({ stock: 0 }),
      ]);

    const totalPages = Math.ceil(totalMatching / limitNumber) || 1;

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalMatching,
        totalPages,
      },
      stats: {
        total: statsTotal,
        published: statsPublished,
        draft: statsDraft,
        outOfStock: statsOutOfStock,
      },
    });
  } catch (error) {
    console.error("GET BOOKS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// GET SINGLE BOOK
// =========================================================
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book ID format" });
    }

    const book = await Book.findById(id).lean();
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// CREATE BOOK
// =========================================================
exports.createBook = async (req, res) => {
  const imageFile = req.files?.image?.[0];
  const galleryFiles = req.files?.images || [];

  try {
    const {
      title,
      isbn = "",
      author,
      category,
      price,
      offerPrice,
      stock = 0,
      status = "Published",
      description = "",
      publisher = "",
      pages = 0,
      language = "English",
      year,
      featured = false,
      image: textImage = "",
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

    // Determine primary image
    let primaryImage = textImage.trim();
    if (imageFile) {
      primaryImage = `/uploads/${imageFile.filename}`;
    }

    // Gallery images
    const imagesArray = galleryFiles.map((f) => `/uploads/${f.filename}`);
    if (primaryImage && !imagesArray.includes(primaryImage)) {
      imagesArray.unshift(primaryImage);
    }

    const calculatedStatus = numericStock === 0 ? "Out of Stock" : status;

    const book = await Book.create({
      title: title.trim(),
      isbn: isbn.trim(),
      author: author.trim(),
      category: category.trim(),
      price: numericPrice,
      offerPrice: offerPrice ? Number(offerPrice) : null,
      stock: numericStock,
      status: calculatedStatus,
      image: primaryImage,
      images: imagesArray,
      description: description.trim(),
      publisher: publisher.trim(),
      pages: Number(pages) || 0,
      language: language.trim() || "English",
      year: Number(year) || new Date().getFullYear(),
      featured: featured === true || featured === "true",
    });

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (error) {
    if (imageFile) safeDeleteUploadFile(imageFile.filename);
    galleryFiles.forEach((f) => safeDeleteUploadFile(f.filename));
    console.error("CREATE BOOK ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// =========================================================
// UPDATE BOOK
// =========================================================
exports.updateBook = async (req, res) => {
  const imageFile = req.files?.image?.[0];
  const galleryFiles = req.files?.images || [];

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      if (imageFile) safeDeleteUploadFile(imageFile.filename);
      galleryFiles.forEach((f) => safeDeleteUploadFile(f.filename));
      return res.status(400).json({ success: false, message: "Invalid book ID format" });
    }

    const existing = await Book.findById(id);
    if (!existing) {
      if (imageFile) safeDeleteUploadFile(imageFile.filename);
      galleryFiles.forEach((f) => safeDeleteUploadFile(f.filename));
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    const updateData = { ...req.body };

    if (updateData.title !== undefined) updateData.title = updateData.title.trim();
    if (updateData.isbn !== undefined) updateData.isbn = updateData.isbn.trim();
    if (updateData.author !== undefined) updateData.author = updateData.author.trim();
    if (updateData.category !== undefined) updateData.category = updateData.category.trim();
    if (updateData.description !== undefined) updateData.description = updateData.description.trim();
    if (updateData.publisher !== undefined) updateData.publisher = updateData.publisher.trim();
    if (updateData.language !== undefined) updateData.language = updateData.language.trim();

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.offerPrice !== undefined) updateData.offerPrice = updateData.offerPrice ? Number(updateData.offerPrice) : null;
    if (updateData.pages !== undefined) updateData.pages = Number(updateData.pages) || 0;
    if (updateData.year !== undefined) updateData.year = Number(updateData.year) || new Date().getFullYear();

    if (updateData.stock !== undefined) {
      updateData.stock = Math.max(Number(updateData.stock) || 0, 0);
      if (updateData.stock === 0) {
        updateData.status = "Out of Stock";
      }
    }

    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === true || updateData.featured === "true";
    }

    // Handle new primary image upload
    if (imageFile) {
      safeDeleteUploadFile(existing.image);
      updateData.image = `/uploads/${imageFile.filename}`;
    }

    // Handle new gallery images upload
    if (galleryFiles.length > 0) {
      const newImages = galleryFiles.map((f) => `/uploads/${f.filename}`);
      updateData.images = [...(existing.images || []), ...newImages];
    }

    const updated = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: updated,
    });
  } catch (error) {
    if (imageFile) safeDeleteUploadFile(imageFile.filename);
    galleryFiles.forEach((f) => safeDeleteUploadFile(f.filename));
    console.error("UPDATE BOOK ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// =========================================================
// DELETE SINGLE BOOK
// =========================================================
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book ID format" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    safeDeleteUploadFile(book.image);
    (book.images || []).forEach((img) => safeDeleteUploadFile(img));

    await Book.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// BULK DELETE BOOKS
// =========================================================
exports.bulkDeleteBooks = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide book IDs as an array" });
    }

    const validIds = ids.filter((id) => isValidObjectId(id));
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: "No valid book ObjectIds provided" });
    }

    const books = await Book.find({ _id: { $in: validIds } });
    books.forEach((book) => {
      safeDeleteUploadFile(book.image);
      (book.images || []).forEach((img) => safeDeleteUploadFile(img));
    });

    const result = await Book.deleteMany({ _id: { $in: validIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} books deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// TOGGLE STATUS
// =========================================================
exports.toggleBookStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book ID format" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    if (book.status === "Published") {
      book.status = "Draft";
    } else if (book.stock === 0) {
      book.status = "Out of Stock";
    } else {
      book.status = "Published";
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: `Status changed to ${book.status}`,
      data: book,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// TOGGLE FEATURED
// =========================================================
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book ID format" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    book.featured = !book.featured;
    await book.save();

    res.status(200).json({
      success: true,
      message: `Book ${book.featured ? "marked as featured" : "unmarked as featured"}`,
      data: book,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// GET TOP SELLING BOOKS
// =========================================================
exports.getTopSellingBooks = async (req, res) => {
  try {
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const category = req.query.category;

    const query = { status: "Published" };
    if (category && category !== "All Categories" && category !== "All") {
      query.category = category.trim();
    }

    const [books, paidOrders] = await Promise.all([
      Book.find(query).lean(),
      Order.find({
        $or: [
          { "paymentInfo.status": "Paid" },
          { orderStatus: { $in: ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"] } },
        ],
      })
        .select("items")
        .lean(),
    ]);

    const salesById = {};
    const salesByTitle = {};
    paidOrders.forEach((ord) => {
      (ord.items || []).forEach((item) => {
        const qty = Number(item.quantity) || 1;
        const bId = String(item.bookId || "").trim();
        const title = (item.title || "").trim().toLowerCase();
        if (bId) salesById[bId] = (salesById[bId] || 0) + qty;
        if (title) salesByTitle[title] = (salesByTitle[title] || 0) + qty;
      });
    });

    let maxSold = 0;
    const enrichedBooks = (books || []).map((b) => {
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

    enrichedBooks.sort((a, b) => {
      if (b.totalSold !== a.totalSold) return b.totalSold - a.totalSold;
      if (b.featured !== a.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    enrichedBooks.forEach((book, index) => {
      book.rank = index + 1;
      book.isHighestSelling = maxSold > 0 ? book.totalSold === maxSold : index === 0;
      book.isTopSeller = book.totalSold > 0 || index < 4;
      book.topSellingBadge = book.isHighestSelling
        ? "Top Selling"
        : book.totalSold > 0
        ? "Best Seller"
        : book.featured
        ? "Featured"
        : null;
    });

    const highestSellingBook =
      enrichedBooks.find((b) => b.isHighestSelling) || enrichedBooks[0] || null;

    const limitedBooks = enrichedBooks.slice(0, limit);

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
