const Gallery = require("../models/Gallery");
const Category = require("../models/Category");
const {
  isValidObjectId,
  escapeRegex,
  safeDeleteUploadFile,
  convertFileToWebp,
  saveBase64Image,
} = require("../utils/helpers");

// Helper to format date & time
const getFormattedDateTime = (date = new Date()) => {
  const uploadedOn = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { uploadedOn, time };
};

// =========================================================
// GET ALL GALLERIES (With Search, Filter, Sort, & Stats)
// =========================================================
exports.getAllGalleries = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      sort = "Newest First",
      page = 1,
      limit = 100,
    } = req.query;

    const query = {};

    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      query.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { category: { $regex: escaped, $options: "i" } },
      ];
    }

    if (
      category &&
      category.trim() &&
      category !== "All Categories" &&
      category !== "All"
    ) {
      query.category = category.trim();
    }

    let sortOptions = { createdAt: -1 };
    const normalizedSort = sort.toLowerCase();
    if (normalizedSort === "oldest first" || normalizedSort === "oldest") {
      sortOptions = { createdAt: 1 };
    } else if (normalizedSort === "a - z" || normalizedSort === "a-z") {
      sortOptions = { title: 1 };
    } else if (normalizedSort === "z - a" || normalizedSort === "z-a") {
      sortOptions = { title: -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
    const skip = (pageNum - 1) * limitNum;

    const [total, items, allItems, dbCategories] = await Promise.all([
      Gallery.countDocuments(query),
      Gallery.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Gallery.find({}, "category views").lean(),
      Category.find({}, "name").lean().catch(() => []),
    ]);

    // Map items to include `id` along with `_id`
    const formattedData = items.map((item) => ({
      ...item,
      id: item._id.toString(),
    }));

    // Calculate dynamic stats
    const distinctCategories = Array.from(
      new Set([
        ...dbCategories.map((c) => c.name).filter(Boolean),
        ...allItems.map((i) => i.category).filter(Boolean),
      ])
    );
    const totalViews = allItems.reduce(
      (acc, curr) => acc + (Number(curr.views) || 0),
      0
    );

    res.status(200).json({
      success: true,
      count: formattedData.length,
      data: formattedData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      stats: {
        totalImages: allItems.length,
        totalFolders: distinctCategories.length,
        totalViews,
        unusedImages: 0,
      },
      categories: distinctCategories,
    });
  } catch (error) {
    console.error("GET GALLERIES ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// GET SINGLE GALLERY BY ID
// =========================================================
exports.getGalleryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid gallery ID format" });
    }

    const gallery = await Gallery.findById(id).lean();
    if (!gallery) {
      return res
        .status(404)
        .json({ success: false, message: "Gallery image not found" });
    }

    res.status(200).json({
      success: true,
      data: { ...gallery, id: gallery._id.toString() },
    });
  } catch (error) {
    console.error("GET GALLERY BY ID ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// CREATE GALLERY IMAGE
// =========================================================
exports.createGallery = async (req, res) => {
  const uploadedFile = req.files?.image?.[0] || req.file;

  try {
    const { title, category, image, size, status } = req.body || {};

    if (!title?.trim() || !category?.trim()) {
      if (uploadedFile) safeDeleteUploadFile(uploadedFile.filename);
      return res.status(400).json({
        success: false,
        message: "Title and Category are required.",
      });
    }

    let imagePath = null;
    let computedSize = size || "0 MB";

    if (uploadedFile) {
      imagePath = await convertFileToWebp(uploadedFile);
      computedSize = `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`;
    } else if (image && typeof image === "string" && image.startsWith("data:")) {
      imagePath = await saveBase64Image(image);
    } else if (image && typeof image === "string") {
      imagePath = image.trim();
    }

    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: "Image file or valid image URL is required.",
      });
    }

    const { uploadedOn, time } = getFormattedDateTime(new Date());

    const gallery = await Gallery.create({
      title: title.trim(),
      category: category.trim(),
      image: imagePath,
      size: computedSize,
      uploadedOn,
      time,
      status: status || "Active",
      views: 0,
    });

    res.status(201).json({
      success: true,
      message: "Gallery image created successfully",
      data: { ...gallery.toObject(), id: gallery._id.toString() },
    });
  } catch (error) {
    if (uploadedFile) safeDeleteUploadFile(uploadedFile.filename);
    console.error("CREATE GALLERY ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// =========================================================
// UPDATE GALLERY IMAGE
// =========================================================
exports.updateGallery = async (req, res) => {
  const uploadedFile = req.files?.image?.[0] || req.file;

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      if (uploadedFile) safeDeleteUploadFile(uploadedFile.filename);
      return res
        .status(400)
        .json({ success: false, message: "Invalid gallery ID format" });
    }

    const existing = await Gallery.findById(id);
    if (!existing) {
      if (uploadedFile) safeDeleteUploadFile(uploadedFile.filename);
      return res
        .status(404)
        .json({ success: false, message: "Gallery image not found" });
    }

    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title.trim();
    if (req.body.category !== undefined)
      updateData.category = req.body.category.trim();
    if (req.body.status !== undefined) updateData.status = req.body.status;

    // Handle new image upload
    if (uploadedFile) {
      safeDeleteUploadFile(existing.image);
      updateData.image = await convertFileToWebp(uploadedFile);
      updateData.size = `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`;
    } else if (
      req.body.image &&
      typeof req.body.image === "string" &&
      req.body.image.startsWith("data:")
    ) {
      safeDeleteUploadFile(existing.image);
      updateData.image = await saveBase64Image(req.body.image);
    }

    const updated = await Gallery.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Gallery image updated successfully",
      data: { ...updated.toObject(), id: updated._id.toString() },
    });
  } catch (error) {
    if (uploadedFile) safeDeleteUploadFile(uploadedFile.filename);
    console.error("UPDATE GALLERY ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// =========================================================
// DELETE SINGLE GALLERY IMAGE
// =========================================================
exports.deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid gallery ID format" });
    }

    const item = await Gallery.findById(id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Gallery image not found" });
    }

    safeDeleteUploadFile(item.image);
    await Gallery.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Gallery image deleted successfully",
      id,
    });
  } catch (error) {
    console.error("DELETE GALLERY ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// BULK DELETE GALLERY IMAGES
// =========================================================
exports.bulkDeleteGalleries = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!Array.isArray(ids) || !ids.length) {
      return res
        .status(400)
        .json({ success: false, message: "No IDs provided as an array" });
    }

    const validIds = ids.filter((id) => isValidObjectId(id));
    if (validIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid ObjectIds provided" });
    }

    const items = await Gallery.find({ _id: { $in: validIds } });
    items.forEach((item) => {
      safeDeleteUploadFile(item.image);
    });

    const result = await Gallery.deleteMany({ _id: { $in: validIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} gallery images deleted successfully`,
      deletedCount: result.deletedCount,
      deletedIds: validIds,
    });
  } catch (error) {
    console.error("BULK DELETE GALLERY ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// INCREMENT VIEWS
// =========================================================
exports.incrementViews = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid gallery ID format" });
    }

    const gallery = await Gallery.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!gallery) {
      return res
        .status(404)
        .json({ success: false, message: "Gallery image not found" });
    }

    res.status(200).json({
      success: true,
      views: gallery.views,
    });
  } catch (error) {
    console.error("INCREMENT VIEWS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
