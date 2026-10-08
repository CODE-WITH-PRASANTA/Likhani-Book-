const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");

// Correct relative path to src/config/db
const connectDB = require("./src/config/db");

dotenv.config();

const app = express();

const supportRoutes = require("./src/routes/supportRoutes");
const enquiryRoutes = require("./src/routes/enquiryRoutes");
const testimonialRoutes = require("./src/routes/testimonialRoutes");

/* ==============================
   DATABASE
============================== */

connectDB();

/* ==============================
   MIDDLEWARE (CORS Dynamic)
============================== */

// origin: true allows both user frontend and admin panel ports (5173, 5174, etc.)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

/* ==============================
   STATIC UPLOADS (FIXED)
============================== */

// Points to backend/uploads where multer stores files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ==============================
   TEST ROUTE
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
   GLOBAL ERROR HANDLER (For Multer file size errors)
============================== */

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
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