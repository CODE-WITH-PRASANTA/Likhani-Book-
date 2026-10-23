const Comment = require("../models/Comment");
const Blog = require("../models/Blog");
const Enquiry = require("../models/Enquiry");
const { isValidObjectId, isValidEmail, escapeRegex } = require("../utils/helpers");

// Sanitize helper to prevent basic stored XSS
const sanitizeText = (str) => {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, (char) => (char === "<" ? "&lt;" : "&gt;"))
    .trim();
};

// =========================================================
// CREATE COMMENT FOR A BLOG
// =========================================================
exports.createComment = async (req, res) => {
  try {
    const identifier = req.params.identifier || req.body.blogId || req.body.blogSlug || req.body.blog;
    const { name, email, message } = req.body || {};

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Blog identifier is required to post a comment.",
      });
    }

    // 1. Locate the exact Blog
    let blog = null;
    if (isValidObjectId(identifier)) {
      blog = await Blog.findById(identifier);
    }
    if (!blog) {
      blog = await Blog.findOne({ slug: String(identifier).toLowerCase().trim() });
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "The requested blog article was not found.",
      });
    }

    // 2. Validate input fields
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide your name (at least 2 characters).",
      });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (!message || typeof message !== "string" || message.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please write a comment message (at least 2 characters).",
      });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Comment message is too long (maximum 2000 characters).",
      });
    }

    const cleanName = sanitizeText(name);
    const cleanEmail = email.trim().toLowerCase();
    const cleanMessage = sanitizeText(message);

    // 3. Prevent Duplicacy
    // Rule A: Exact duplicate comment already exists on this blog
    const exactDuplicate = await Comment.findOne({
      blog: blog._id,
      email: cleanEmail,
      message: cleanMessage,
    });

    if (exactDuplicate) {
      return res.status(409).json({
        success: false,
        message: "You have already posted this exact comment on this article.",
      });
    }

    // Rule B: Rate limiting cooldown (avoid spamming within 30 seconds from same email on this blog)
    const recentComment = await Comment.findOne({
      blog: blog._id,
      email: cleanEmail,
      createdAt: { $gte: new Date(Date.now() - 30 * 1000) },
    });

    if (recentComment) {
      return res.status(429).json({
        success: false,
        message: "Please wait 30 seconds before posting another comment.",
      });
    }

    // 4. Save Comment in Database as DRAFT (requires admin publishing)
    const newComment = await Comment.create({
      blog: blog._id,
      blogSlug: blog.slug,
      blogTitle: blog.title,
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
      status: "Draft",
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
      userAgent: req.headers["user-agent"] || "",
    });

    // 5. Update Blog Comment Count (only count published/approved)
    const totalPublished = await Comment.countDocuments({
      blog: blog._id,
      status: { $in: ["Published", "Approved"] },
    });
    await Blog.findByIdAndUpdate(blog._id, { comments: totalPublished });

    // 6. Seamlessly sync to Enquiry table as a Draft/New Blog Comment
    try {
      await Enquiry.create({
        name: cleanName,
        email: cleanEmail,
        phone: "N/A",
        address: `/blog/${blog.slug}`,
        type: "Blog Comment",
        subject: `Blog Comment: ${blog.title}`,
        message: `[Article: "${blog.title}"]\n[Path: /blog/${blog.slug}]\n\nComment: ${cleanMessage}`,
        status: "New",
        commentId: newComment._id,
      });
    } catch (enquiryErr) {
      console.error("Warning: Failed to sync comment to Enquiry:", enquiryErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Your comment has been submitted as a draft and will appear on the blog once approved by admin.",
      data: newComment,
      totalComments: totalPublished,
    });
  } catch (error) {
    console.error("CREATE COMMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to post comment. Please try again.",
    });
  }
};

// =========================================================
// GET COMMENTS FOR A SPECIFIC BLOG (STRICTLY SCOPED)
// =========================================================
exports.getCommentsByBlog = async (req, res) => {
  try {
    const { identifier } = req.params;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Blog identifier is required.",
      });
    }

    // Find the blog
    let blog = null;
    if (isValidObjectId(identifier)) {
      blog = await Blog.findById(identifier).lean();
    }
    if (!blog) {
      blog = await Blog.findOne({ slug: String(identifier).toLowerCase().trim() }).lean();
    }

    if (!blog) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Strictly fetch ONLY this blog's PUBLISHED / APPROVED comments (no drafts)
    const comments = await Comment.find({
      blog: blog._id,
      status: { $in: ["Published", "Approved"] },
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    console.error("GET COMMENTS BY BLOG ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load comments.",
    });
  }
};

// =========================================================
// GET ALL COMMENTS (ADMIN / MODERATION)
// =========================================================
exports.getAllComments = async (req, res) => {
  try {
    const { search = "", status = "All", page = 1, limit = 20 } = req.query;
    const query = {};

    if (search && search.trim()) {
      const safe = escapeRegex(search.trim());
      const regex = new RegExp(safe, "i");
      query.$or = [
        { name: regex },
        { email: regex },
        { message: regex },
        { blogTitle: regex },
        { blogSlug: regex },
      ];
    }

    if (status && status !== "All") {
      query.status = status;
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, comments] = await Promise.all([
      Comment.countDocuments(query),
      Comment.find(query)
        .populate("blog", "title slug image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("GET ALL COMMENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch comments.",
    });
  }
};

// =========================================================
// DELETE COMMENT
// =========================================================
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid comment ID." });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }

    const blogId = comment.blog;
    await comment.deleteOne();

    // Recalculate count of published comments
    if (blogId) {
      const count = await Comment.countDocuments({
        blog: blogId,
        status: { $in: ["Published", "Approved"] },
      });
      await Blog.findByIdAndUpdate(blogId, { comments: count });
    }

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE COMMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete comment.",
    });
  }
};

// =========================================================
// PUBLISH COMMENT (ADMIN APPROVAL)
// =========================================================
exports.publishComment = async (req, res) => {
  try {
    const { id } = req.params;
    let comment = null;
    let enquiry = null;

    if (isValidObjectId(id)) {
      comment = await Comment.findById(id);
      if (!comment) {
        // Check if an Enquiry ID was passed instead
        enquiry = await Enquiry.findById(id);
        if (enquiry) {
          if (enquiry.commentId) {
            comment = await Comment.findById(enquiry.commentId);
          }
          if (!comment) {
            const slugFromAddress = (enquiry.address || "").replace(/^\/blog\//, "").trim();
            comment = await Comment.findOne({
              $or: [
                { email: enquiry.email, blogSlug: slugFromAddress },
                { email: enquiry.email },
              ],
            }).sort({ createdAt: -1 });
          }
        }
      }
    }

    // If still no comment found but enquiry exists, synthesize comment from enquiry
    if (!comment && enquiry && enquiry.type === "Blog Comment") {
      const slugFromAddress = (enquiry.address || "").replace(/^\/blog\//, "").trim();
      const matchedBlog = await Blog.findOne({
        $or: [{ slug: slugFromAddress }, { slug: new RegExp(`^${escapeRegex(slugFromAddress)}$`, "i") }],
      });

      if (matchedBlog) {
        comment = await Comment.create({
          blog: matchedBlog._id,
          blogSlug: matchedBlog.slug,
          blogTitle: matchedBlog.title,
          name: enquiry.name,
          email: enquiry.email,
          message: enquiry.message ? enquiry.message.replace(/^\[Article:[^\]]*\]\s*\[Path:[^\]]*\]\s*Comment:\s*/i, "").trim() : "Great post!",
          status: "Published",
        });
        enquiry.commentId = comment._id;
        await enquiry.save();
      }
    }

    if (!comment && enquiry) {
      enquiry.status = "Closed";
      enquiry.adminReply = "Approved & Published on live blog";
      await enquiry.save();
      return res.status(200).json({
        success: true,
        message: "Status updated to Approved & Published.",
        data: enquiry,
      });
    }

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }

    comment.status = "Published";
    await comment.save();

    // Recalculate live published count on the blog
    const totalPublished = await Comment.countDocuments({
      blog: comment.blog,
      status: { $in: ["Published", "Approved"] },
    });
    await Blog.findByIdAndUpdate(comment.blog, { comments: totalPublished });

    // Update associated Enquiry to Closed/Published
    await Enquiry.updateMany(
      {
        $or: [
          { commentId: comment._id },
          { email: comment.email, type: "Blog Comment", address: `/blog/${comment.blogSlug}` },
          { _id: id },
        ],
      },
      { status: "Closed", adminReply: "Approved & Published on live blog" }
    );

    return res.status(200).json({
      success: true,
      message: "Comment approved and published to the live blog!",
      data: comment,
      totalPublished,
    });
  } catch (error) {
    console.error("PUBLISH COMMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to publish comment.",
    });
  }
};

// =========================================================
// UNPUBLISH COMMENT (MOVE BACK TO DRAFT)
// =========================================================
exports.unpublishComment = async (req, res) => {
  try {
    const { id } = req.params;
    let comment = null;
    let enquiry = null;

    if (isValidObjectId(id)) {
      comment = await Comment.findById(id);
      if (!comment) {
        enquiry = await Enquiry.findById(id);
        if (enquiry) {
          if (enquiry.commentId) {
            comment = await Comment.findById(enquiry.commentId);
          }
          if (!comment) {
            const slugFromAddress = (enquiry.address || "").replace(/^\/blog\//, "").trim();
            comment = await Comment.findOne({
              $or: [
                { email: enquiry.email, blogSlug: slugFromAddress },
                { email: enquiry.email },
              ],
            }).sort({ createdAt: -1 });
          }
        }
      }
    }

    if (!comment && enquiry) {
      enquiry.status = "New";
      enquiry.adminReply = "Unpublished / Moved back to draft";
      await enquiry.save();
      return res.status(200).json({
        success: true,
        message: "Status updated to Draft (Pending).",
        data: enquiry,
      });
    }

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }

    comment.status = "Draft";
    await comment.save();

    // Recalculate live published count on the blog
    const totalPublished = await Comment.countDocuments({
      blog: comment.blog,
      status: { $in: ["Published", "Approved"] },
    });
    await Blog.findByIdAndUpdate(comment.blog, { comments: totalPublished });

    // Update associated Enquiry to New / Draft
    await Enquiry.updateMany(
      {
        $or: [
          { commentId: comment._id },
          { email: comment.email, type: "Blog Comment", address: `/blog/${comment.blogSlug}` },
          { _id: id },
        ],
      },
      { status: "New", adminReply: "Unpublished / Moved back to draft" }
    );

    return res.status(200).json({
      success: true,
      message: "Comment unpublished and moved back to draft.",
      data: comment,
      totalPublished,
    });
  } catch (error) {
    console.error("UNPUBLISH COMMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to unpublish comment.",
    });
  }
};
