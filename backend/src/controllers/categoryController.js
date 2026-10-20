const Category = require("../models/Category");
const { isValidObjectId } = require("../utils/helpers");

// GET ALL CATEGORIES
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE CATEGORY
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID format" });
    }

    const category = await Category.findById(id).lean();
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {
    const { name, description = "", color = "blue" } = req.body || {};

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: `Category '${name.trim()}' already exists` });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description.trim(),
      color: color.trim() || "blue",
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID format" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const { name, description, color } = req.body || {};

    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${name.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, "i") },
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({ success: false, message: `Category '${name.trim()}' already exists` });
      }
      category.name = name.trim();
    }

    if (description !== undefined) category.description = description.trim();
    if (color !== undefined) category.color = color.trim();

    const updated = await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID format" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// BULK DELETE CATEGORIES
exports.bulkDeleteCategories = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide category IDs as an array" });
    }

    const validIds = ids.filter((id) => isValidObjectId(id));
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: "No valid ObjectIds provided" });
    }

    const result = await Category.deleteMany({ _id: { $in: validIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} categories deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET TOP SELLING CATEGORIES (DYNAMIC FOR HOME PAGE)
exports.getTopSellingCategories = async (req, res) => {
  try {
    const BookPosting = require("../models/BookPosting");
    const Book = require("../models/Book");
    const Order = require("../models/Order");

    // 1. Fetch categories from Category model
    const dbCategories = await Category.find().lean();

    // 2. Fetch all published books
    const [postingBooks, standardBooks] = await Promise.all([
      BookPosting.find({ status: "Published" }).lean(),
      Book.find({ status: "Published" }).lean(),
    ]);

    const allBooks = [...postingBooks, ...standardBooks];

    // Map books by ID and lowercase title to their category
    const bookCatMap = {};
    const booksByCategory = {};

    allBooks.forEach((b) => {
      const rawCat = (b.category || "").trim();
      if (!rawCat) return;

      const catKey = rawCat.toLowerCase();
      if (!booksByCategory[catKey]) {
        booksByCategory[catKey] = {
          name: rawCat,
          books: [],
        };
      }
      booksByCategory[catKey].books.push(b);

      if (b._id) bookCatMap[b._id.toString()] = rawCat;
      if (b.title) bookCatMap[b.title.trim().toLowerCase()] = rawCat;
    });

    // 3. Aggregate sales per category from Paid/Placed orders
    const paidOrders = await Order.find({
      $or: [
        { "paymentInfo.status": "Paid" },
        { orderStatus: { $in: ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"] } },
      ],
    }).lean();

    const catSales = {};
    paidOrders.forEach((ord) => {
      (ord.items || []).forEach((item) => {
        const cat =
          bookCatMap[item.bookId] ||
          bookCatMap[(item.title || "").trim().toLowerCase()];
        if (cat) {
          const key = cat.toLowerCase();
          catSales[key] = (catSales[key] || 0) + (Number(item.quantity) || 1);
        }
      });
    });

    // 4. Merge all distinct categories from Category collection and Book collection
    const categoryNameMap = new Map();

    dbCategories.forEach((cat) => {
      const trimmed = cat.name.trim();
      if (trimmed) {
        categoryNameMap.set(trimmed.toLowerCase(), {
          id: cat._id,
          name: trimmed,
          description: cat.description || "",
          color: cat.color || "blue",
        });
      }
    });

    Object.keys(booksByCategory).forEach((catKey) => {
      if (!categoryNameMap.has(catKey)) {
        categoryNameMap.set(catKey, {
          id: catKey,
          name: booksByCategory[catKey].name,
          description: "",
          color: "blue",
        });
      }
    });

    // Curated high-res book images for clean fallbacks when book has no uploaded image
    const FALLBACK_CATEGORY_IMAGES = {
      fiction: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
      "fiction & literature": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
      "science & technology": "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=600&q=80",
      technology: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=600&q=80",
      "business & finance": "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=600&q=80",
      business: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=600&q=80",
      "history & philosophy": "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=600&q=80",
      history: "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=600&q=80",
      philosophy: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80",
      "self-help & wellness": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80",
      "self-help": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80",
      romance: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80",
      adventure: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=80",
      demohhh: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
      default: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    };

    const result = [];

    categoryNameMap.forEach((catInfo, catKey) => {
      // Exclude placeholder 'Category' if it has 0 books and 0 sales
      const catEntry = booksByCategory[catKey];
      const bookCount = catEntry ? catEntry.books.length : 0;
      const totalSold = catSales[catKey] || 0;

      if (catInfo.name.toLowerCase() === "category" && bookCount === 0 && totalSold === 0) {
        return;
      }

      // Find top book image
      let coverImage = "";
      if (catEntry && catEntry.books.length > 0) {
        const bookWithImage = catEntry.books.find((b) => b.image && b.image.trim() !== "");
        if (bookWithImage) {
          coverImage = bookWithImage.image;
        }
      }

      if (!coverImage) {
        const matchedKey = Object.keys(FALLBACK_CATEGORY_IMAGES).find((k) =>
          catKey.includes(k)
        );
        coverImage = matchedKey
          ? FALLBACK_CATEGORY_IMAGES[matchedKey]
          : FALLBACK_CATEGORY_IMAGES.default;
      }

      result.push({
        id: String(catInfo.id),
        title: catInfo.name,
        count: bookCount,
        totalSold: totalSold,
        image: coverImage,
        description: catInfo.description,
        color: catInfo.color,
      });
    });

    // 5. Dynamic Sort: Top Selling Category shows first!
    result.sort((a, b) => {
      if (b.totalSold !== a.totalSold) {
        return b.totalSold - a.totalSold;
      }
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.title.localeCompare(b.title);
    });

    // Format 2-digit rank badge: "01", "02", "03", "04", "05"...
    result.forEach((item, index) => {
      item.number = String(index + 1).padStart(2, "0");
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Error in getTopSellingCategories:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
