const Blog = require("../models/Blog");
const Category = require("../models/Category");
const {
  isValidObjectId,
  escapeRegex,
  safeDeleteUploadFile,
  saveBase64Image,
  convertFileToWebp,
} = require("../utils/helpers");

// Helper to generate a URL-friendly slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// =========================================================
// GET ALL BLOGS
// =========================================================
exports.getBlogs = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      status = "",
      tag = "",
      sort = "latest",
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    // Search on title, slug, shortDescription
    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      query.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { slug: { $regex: escaped, $options: "i" } },
        { shortDescription: { $regex: escaped, $options: "i" } },
      ];
    }

    // Category filter
    if (category && category !== "All Categories" && category !== "All") {
      const escapedCat = escapeRegex(category.trim());
      query.category = { $regex: new RegExp(`^${escapedCat}$`, "i") };
    }

    // Status filter
    if (status && status !== "All") {
      if (status === "Drafts") query.status = "Draft";
      else query.status = status.trim();
    }

    // Tag filter
    if (tag && tag.trim()) {
      query.tags = tag.trim();
    }

    // Sort options
    let sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };
    else if (sort === "title-asc") sortOptions = { title: 1 };
    else if (sort === "title-desc") sortOptions = { title: -1 };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, blogs, globalTotal, publishedCount, draftsCount, trashCount] =
      await Promise.all([
        Blog.countDocuments(query),
        Blog.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
        Blog.countDocuments({}),
        Blog.countDocuments({ status: "Published" }),
        Blog.countDocuments({ status: "Draft" }),
        Blog.countDocuments({ status: "Trash" }),
      ]);

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      stats: {
        all: globalTotal,
        published: publishedCount,
        drafts: draftsCount,
        trash: trashCount,
      },
    });
  } catch (error) {
    console.error("GET BLOGS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// GET SINGLE BLOG
// =========================================================
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    let blog = null;
    if (isValidObjectId(id)) {
      blog = await Blog.findById(id).lean();
    } else {
      // Find by slug
      blog = await Blog.findOne({ slug: id.toLowerCase().trim() }).lean();
    }

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error("GET BLOG BY ID ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// GET BLOG CATEGORIES (with counts)
// =========================================================
exports.getBlogCategories = async (req, res) => {
  try {
    const [allCategories, blogCounts] = await Promise.all([
      Category.find().sort({ name: 1 }).lean(),
      Blog.aggregate([
        { $match: { status: "Published" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = {};
    blogCounts.forEach((c) => {
      if (c._id) {
        countMap[c._id.toLowerCase().trim()] = c.count;
      }
    });

    const categoryMap = new Map();

    // 1. Populate all defined categories from the Category collection
    allCategories.forEach((cat) => {
      if (cat.name && cat.name.trim()) {
        const name = cat.name.trim();
        const count = countMap[name.toLowerCase()] || 0;
        categoryMap.set(name.toLowerCase(), {
          name,
          count,
        });
      }
    });

    // 2. Add any other categories that appear in published blogs
    blogCounts.forEach((c) => {
      if (c._id && c._id.trim()) {
        const name = c._id.trim();
        const key = name.toLowerCase();
        if (!categoryMap.has(key)) {
          categoryMap.set(key, {
            name,
            count: c.count,
          });
        }
      }
    });

    const formatted = Array.from(categoryMap.values()).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("GET BLOG CATEGORIES ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// CREATE BLOG (WebP image conversion)
// =========================================================
exports.createBlog = async (req, res) => {
  const file = req.file || req.files?.image?.[0] || req.files?.featuredImage?.[0];

  try {
    const {
      title,
      slug: customSlug,
      category,
      author = "Admin",
      shortDescription = "",
      description = "",
      tags = [],
      status = "Published",
      image: textImage = "",
      pageTitle = "",
      metaTitle = "",
      metaDescription = "",
      metaKeywords = "",
    } = req.body || {};

    if (!title?.trim() || !category?.trim()) {
      if (file) safeDeleteUploadFile(file.filename);
      return res.status(400).json({
        success: false,
        message: "Title and Category are required.",
      });
    }

    // Generate unique slug
    let baseSlug = customSlug?.trim() ? slugify(customSlug) : slugify(title);
    if (!baseSlug) baseSlug = `blog-${Date.now()}`;

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Blog.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    // Process image & convert to WebP
    let finalImage = "";
    if (file) {
      finalImage = await convertFileToWebp(file);
    } else if (textImage) {
      const trimmed = textImage.trim();
      if (trimmed.startsWith("data:")) {
        finalImage = await saveBase64Image(trimmed);
      } else {
        finalImage = trimmed;
      }
    }

    // Tags array normalization
    let tagsArray = [];
    if (Array.isArray(tags)) {
      tagsArray = tags;
    } else if (typeof tags === "string") {
      try {
        tagsArray = JSON.parse(tags);
      } catch (e) {
        tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    const blog = await Blog.create({
      title: title.trim(),
      slug: uniqueSlug,
      category: category.trim(),
      author: author ? author.trim() : "Admin",
      shortDescription: shortDescription.trim(),
      description: description ? description.trim() : "",
      tags: tagsArray,
      status: ["Published", "Draft", "Trash"].includes(status) ? status : "Published",
      image: finalImage,
      pageTitle: pageTitle ? pageTitle.trim() : "",
      metaTitle: metaTitle ? metaTitle.trim() : "",
      metaDescription: metaDescription ? metaDescription.trim() : "",
      metaKeywords: metaKeywords ? metaKeywords.trim() : "",
    });

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    if (file) safeDeleteUploadFile(file.filename);
    console.error("CREATE BLOG ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// =========================================================
// UPDATE BLOG (WebP image conversion)
// =========================================================
exports.updateBlog = async (req, res) => {
  const file = req.file || req.files?.image?.[0] || req.files?.featuredImage?.[0];

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      if (file) safeDeleteUploadFile(file.filename);
      return res.status(400).json({ success: false, message: "Invalid blog ID format" });
    }

    const existing = await Blog.findById(id);
    if (!existing) {
      if (file) safeDeleteUploadFile(file.filename);
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const updateData = { ...req.body };

    if (updateData.title !== undefined) updateData.title = updateData.title.trim();
    if (updateData.category !== undefined) updateData.category = updateData.category.trim();
    if (updateData.author !== undefined) updateData.author = updateData.author.trim();
    if (updateData.shortDescription !== undefined) updateData.shortDescription = updateData.shortDescription.trim();
    if (updateData.description !== undefined) updateData.description = updateData.description.trim();
    if (updateData.pageTitle !== undefined) updateData.pageTitle = updateData.pageTitle.trim();
    if (updateData.metaTitle !== undefined) updateData.metaTitle = updateData.metaTitle.trim();
    if (updateData.metaDescription !== undefined) updateData.metaDescription = updateData.metaDescription.trim();
    if (updateData.metaKeywords !== undefined) updateData.metaKeywords = updateData.metaKeywords.trim();

    // Check slug uniqueness if changed
    if (updateData.slug && updateData.slug.trim()) {
      const newSlug = slugify(updateData.slug);
      if (newSlug !== existing.slug) {
        const slugExists = await Blog.findOne({ slug: newSlug, _id: { $ne: id } });
        if (slugExists) {
          return res.status(400).json({ success: false, message: `Slug '${newSlug}' is already taken.` });
        }
        updateData.slug = newSlug;
      }
    }

    // Process file upload / image conversion
    if (file) {
      if (existing.image && existing.image.startsWith("/uploads/")) {
        safeDeleteUploadFile(existing.image);
      }
      updateData.image = await convertFileToWebp(file);
    } else if (updateData.image && typeof updateData.image === "string" && updateData.image.startsWith("data:")) {
      if (existing.image && existing.image.startsWith("/uploads/")) {
        safeDeleteUploadFile(existing.image);
      }
      updateData.image = await saveBase64Image(updateData.image);
    }

    if (updateData.tags && typeof updateData.tags === "string") {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch (e) {
        updateData.tags = updateData.tags.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    const updated = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updated,
    });
  } catch (error) {
    if (file) safeDeleteUploadFile(file.filename);
    console.error("UPDATE BLOG ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// =========================================================
// DELETE BLOG
// =========================================================
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid blog ID format" });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    if (blog.image && blog.image.startsWith("/uploads/")) {
      safeDeleteUploadFile(blog.image);
    }

    await Blog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("DELETE BLOG ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// BULK DELETE BLOGS
// =========================================================
exports.bulkDeleteBlogs = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No IDs provided for bulk deletion" });
    }

    const validIds = ids.filter((id) => isValidObjectId(id));
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: "No valid ObjectIds provided" });
    }

    const blogs = await Blog.find({ _id: { $in: validIds } });
    blogs.forEach((b) => {
      if (b.image && b.image.startsWith("/uploads/")) {
        safeDeleteUploadFile(b.image);
      }
    });

    const result = await Blog.deleteMany({ _id: { $in: validIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} blog(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("BULK DELETE BLOGS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// TOGGLE STATUS
// =========================================================
exports.toggleBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid blog ID format" });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const newStatus = blog.status === "Published" ? "Draft" : "Published";
    blog.status = newStatus;
    await blog.save();

    res.status(200).json({
      success: true,
      message: `Status updated to ${newStatus}`,
      data: blog,
    });
  } catch (error) {
    console.error("TOGGLE STATUS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
