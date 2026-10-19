const BookPosting = require("../models/BookPosting");
const {
  isValidObjectId,
  escapeRegex,
  safeDeleteUploadFile,
  saveBase64Image,
  convertFileToWebp,
} = require("../utils/helpers");

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

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, items, globalTotal, publishedCount, draftCount] = await Promise.all([
      BookPosting.countDocuments(query),
      BookPosting.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      BookPosting.countDocuments({}),
      BookPosting.countDocuments({ status: "Published" }),
      BookPosting.countDocuments({ status: "Draft" }),
    ]);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
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
