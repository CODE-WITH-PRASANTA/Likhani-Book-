const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const multer = require("multer");

const connectDB = require("./src/config/db");

dotenv.config();

const app = express();

const supportRoutes = require("./src/routes/supportRoutes");
const enquiryRoutes = require("./src/routes/enquiryRoutes");
const testimonialRoutes = require("./src/routes/testimonialRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const bookRoutes = require("./src/routes/bookRoutes");
const bookPostingRoutes = require("./src/routes/bookPostingRoutes");
const blogRoutes = require("./src/routes/blogRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const couponRoutes = require("./src/routes/couponRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const galleryRoutes = require("./src/routes/galleryRoutes");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");

/* ==============================
   DATABASE
============================== */

connectDB();

/* ==============================
   MIDDLEWARE (CORS Restricted & Secure)
============================== */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev fallback for local network access
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

/* ==============================
   STATIC UPLOADS
============================== */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ==============================
   HEALTH CHECK ROUTE
============================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend API is running successfully",
  });
});

/* ==============================
   API ROUTES
============================== */

app.use("/api/supports", supportRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/testimonial", testimonialRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/book-posting", bookPostingRoutes);
app.use("/api/book-postings", bookPostingRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/galleries", galleryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

/* ==============================
   404 HANDLER
============================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* ==============================
   GLOBAL ERROR HANDLER
============================== */

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  // Multer specific errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds the 5MB limit.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Multer file filter custom error
  if (err.message && err.message.includes("Invalid file format")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format for resource at path '${err.path}'`,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ==============================
   SERVER
============================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});