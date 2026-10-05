const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

/* ==============================
   DATABASE
============================== */

connectDB();

/* ==============================
   MIDDLEWARE
============================== */

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

/* ==============================
   STATIC UPLOADS
============================== */

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

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

// Add your routes here
// Example:
// const authRoutes = require("./routes/auth.routes");
// app.use("/api/auth", authRoutes);

/* ==============================
   404
============================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* ==============================
   SERVER
============================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});