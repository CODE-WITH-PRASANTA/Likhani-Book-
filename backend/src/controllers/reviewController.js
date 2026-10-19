const Review = require("../models/Review");
const Book = require("../models/Book");
const BookPosting = require("../models/BookPosting");
const { isValidObjectId, escapeRegex, isValidEmail } = require("../utils/helpers");

// Helper to resolve book cover image from existing book collection if none provided
const resolveBookCover = async (bookTitle, providedImage) => {
  if (providedImage && typeof providedImage === "string" && providedImage.trim()) {
    return providedImage.trim();
  }

  if (bookTitle && typeof bookTitle === "string" && bookTitle.trim()) {
    try {
      const escaped = escapeRegex(bookTitle.trim());
      const regex = new RegExp(`^${escaped}$`, "i");

      // Check in Book collection
      const foundBook = await Book.findOne({ title: regex }).lean();
      if (foundBook && (foundBook.image || foundBook.images?.[0])) {
        return foundBook.image || foundBook.images[0];
      }

      // Check in BookPosting collection
      const foundPosting = await BookPosting.findOne({ title: regex }).lean();
      if (foundPosting && (foundPosting.image || foundPosting.images?.[0])) {
        return foundPosting.image || foundPosting.images[0];
      }
    } catch (err) {
      console.warn("Could not auto-resolve book cover:", err.message);
    }
  }

  return "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=100&q=80";
};

// =========================================================
// GET ALL REVIEWS (Search, Status, Rating, Book Filter, Sorting)
// =========================================================
exports.getReviews = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      rating = "",
      book = "",
      sort = "latest",
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    // Search query on user, email, book, and comment
    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      query.$or = [
        { user: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
        { book: { $regex: escaped, $options: "i" } },
        { comment: { $regex: escaped, $options: "i" } },
      ];
    }

    // Status filter
    if (status && status !== "All Status" && status !== "All") {
      query.status = status.trim();
    }

    // Rating filter
    if (rating && rating !== "All Ratings") {
      const numericRating = parseInt(rating, 10);
      if (!isNaN(numericRating) && numericRating >= 1 && numericRating <= 5) {
        query.rating = numericRating;
      }
    }

    // Book filter
    if (book && book !== "All Books" && book.trim()) {
      query.book = book.trim();
    }

    // Sorting options
    let sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };
    else if (sort === "Sort By: A-Z" || sort === "A-Z" || sort === "a-z") sortOptions = { user: 1 };
    else if (sort === "Sort By: Rating" || sort === "Rating" || sort === "rating-high") sortOptions = { rating: -1, createdAt: -1 };
    else if (sort === "rating-low") sortOptions = { rating: 1, createdAt: -1 };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, reviews, globalTotal, approvedCount, pendingCount, rejectedCount] =
      await Promise.all([
        Review.countDocuments(query),
        Review.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
        Review.countDocuments({}),
        Review.countDocuments({ status: "Approved" }),
        Review.countDocuments({ status: "Pending" }),
        Review.countDocuments({ status: "Rejected" }),
      ]);

    // Format output with mapped id and human-readable date
    const formatted = reviews.map((r) => ({
      ...r,
      id: r._id.toString(),
      date: r.createdAt
        ? new Date(r.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Recently",
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      stats: {
        total: globalTotal,
        approved: approvedCount,
        pending: pendingCount,
        rejected: rejectedCount,
      },
    });
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// GET PUBLIC APPROVED REVIEWS (For Frontend Product Pages)
// =========================================================
exports.getPublicReviews = async (req, res) => {
  try {
    const { book, bookId, limit = 20 } = req.query;
    const query = { status: "Approved" };

    if (bookId && isValidObjectId(bookId)) {
      query.bookId = bookId;
    } else if (book && book.trim()) {
      query.book = { $regex: new RegExp(`^${escapeRegex(book.trim())}$`, "i") };
    }

    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .lean();

    const formatted = reviews.map((r) => ({
      id: r._id.toString(),
      user: r.user,
      userImage: r.userImage,
      book: r.book,
      bookImage: r.bookImage,
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt
        ? new Date(r.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Recently",
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("GET PUBLIC REVIEWS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// GET SINGLE REVIEW BY ID
// =========================================================
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid review ID format" });
    }

    const review = await Review.findById(id).lean();
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        ...review,
        id: review._id.toString(),
        date: review.createdAt
          ? new Date(review.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recently",
      },
    });
  } catch (error) {
    console.error("GET REVIEW BY ID ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// CREATE REVIEW (Full End-to-End Validation)
// =========================================================
exports.createReview = async (req, res) => {
  try {
    const {
      user,
      email,
      book,
      rating,
      comment,
      status = "Pending",
      userImage,
      bookImage,
      bookId,
    } = req.body || {};

    // 1. User Name Validation
    if (!user || typeof user !== "string" || !user.trim()) {
      return res.status(400).json({ success: false, message: "User name is required" });
    }
    const cleanUser = user.trim();
    if (cleanUser.length < 2 || cleanUser.length > 100) {
      return res.status(400).json({
        success: false,
        message: "User name must be between 2 and 100 characters",
      });
    }

    // 2. Email Validation
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // 3. Book Name Validation
    if (!book || typeof book !== "string" || !book.trim()) {
      return res.status(400).json({ success: false, message: "Book name is required" });
    }
    const cleanBook = book.trim();

    // 4. Rating Validation (1 to 5)
    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    // 5. Comment Validation
    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return res.status(400).json({ success: false, message: "Review comment is required" });
    }
    const cleanComment = comment.trim();
    if (cleanComment.length < 3 || cleanComment.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Review comment must be between 3 and 2000 characters",
      });
    }

    // 6. Status Validation
    const cleanStatus = ["Approved", "Pending", "Rejected"].includes(status)
      ? status
      : "Pending";

    // Auto-generate avatar if none provided
    const resolvedUserImage =
      userImage && typeof userImage === "string" && userImage.trim()
        ? userImage.trim()
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanUser)}&background=eaf3ff&color=1674e8&bold=true`;

    // Auto-resolve book cover if none provided
    const resolvedBookImage = await resolveBookCover(cleanBook, bookImage);

    const validBookId = bookId && isValidObjectId(bookId) ? bookId : null;

    const review = await Review.create({
      user: cleanUser,
      email: cleanEmail,
      book: cleanBook,
      rating: Math.floor(numericRating),
      comment: cleanComment,
      status: cleanStatus,
      userImage: resolvedUserImage,
      bookImage: resolvedBookImage,
      bookId: validBookId,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: {
        ...review.toObject(),
        id: review._id.toString(),
        date: new Date(review.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      },
    });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// UPDATE REVIEW
// =========================================================
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid review ID format" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    const {
      user,
      email,
      book,
      rating,
      comment,
      status,
      userImage,
      bookImage,
    } = req.body || {};

    if (user && user.trim()) {
      review.user = user.trim();
      if (!userImage) {
        review.userImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user)}&background=eaf3ff&color=1674e8&bold=true`;
      }
    }

    if (email && email.trim()) {
      if (!isValidEmail(email.trim())) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }
      review.email = email.trim().toLowerCase();
    }

    if (book && book.trim()) {
      review.book = book.trim();
      if (!bookImage) {
        review.bookImage = await resolveBookCover(review.book, review.bookImage);
      }
    }

    if (rating !== undefined && rating !== "") {
      const numericRating = Number(rating);
      if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }
      review.rating = Math.floor(numericRating);
    }

    if (comment && comment.trim()) {
      if (comment.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: "Comment must be at least 3 characters",
        });
      }
      review.comment = comment.trim();
    }

    if (status && ["Approved", "Pending", "Rejected"].includes(status)) {
      review.status = status;
    }

    if (userImage && typeof userImage === "string") {
      review.userImage = userImage.trim();
    }

    if (bookImage && typeof bookImage === "string") {
      review.bookImage = bookImage.trim();
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: {
        ...review.toObject(),
        id: review._id.toString(),
        date: new Date(review.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      },
    });
  } catch (error) {
    console.error("UPDATE REVIEW ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// DELETE REVIEW
// =========================================================
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid review ID format" });
    }

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// BULK DELETE REVIEWS
// =========================================================
exports.bulkDeleteReviews = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of review IDs to delete",
      });
    }

    const validIds = ids.filter(isValidObjectId);
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid review IDs provided",
      });
    }

    const result = await Review.deleteMany({ _id: { $in: validIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} review(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("BULK DELETE REVIEWS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// TOGGLE / SET REVIEW STATUS
// =========================================================
exports.toggleReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: targetStatus } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid review ID format" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (targetStatus && ["Approved", "Pending", "Rejected"].includes(targetStatus)) {
      review.status = targetStatus;
    } else {
      // Cycle: Pending -> Approved -> Rejected -> Pending
      if (review.status === "Pending") review.status = "Approved";
      else if (review.status === "Approved") review.status = "Rejected";
      else review.status = "Pending";
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: `Review status changed to ${review.status}`,
      data: {
        ...review.toObject(),
        id: review._id.toString(),
        date: new Date(review.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      },
    });
  } catch (error) {
    console.error("TOGGLE REVIEW STATUS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
