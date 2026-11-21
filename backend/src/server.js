require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

// ==========================================
// DATABASE
// ==========================================

const pool = require("./config/db");

// ==========================================
// ROUTES
// ==========================================

const authRoutes = require("./routes/authRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const publicProductRoutes = require(
  "./routes/publicProductRoutes"
);
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const addressRoutes = require("./routes/addressRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ==========================================
// STATIC UPLOADS
// ==========================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

// ==========================================
// HOME / TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShopSphere Backend API is running 🚀",
  });
});

// ==========================================
// AUTH ROUTES
// ==========================================

app.use(
  "/api/auth",
  authRoutes
);

// ==========================================
// SELLER ROUTES
// ==========================================

app.use(
  "/api/seller",
  sellerRoutes
);

// ==========================================
// PUBLIC PRODUCT ROUTES
// ==========================================

app.use(
  "/api/products",
  publicProductRoutes
);

// ==========================================
// CART / WISHLIST / ADDRESS / ORDER ROUTES
// ==========================================

app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);

// ==========================================
// CATEGORY / REVIEW ROUTES
// ==========================================

app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);

// ==========================================
// ADMIN ROUTES
// ==========================================

app.use("/api/admin", adminRoutes);

// ==========================================
// 404 ROUTE
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// ==========================================
// SERVER PORT
// ==========================================

const PORT =
  process.env.PORT || 5000;

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    // Test MySQL connection
    const connection =
      await pool.getConnection();

    console.log(
      "MySQL database connected successfully ✅"
    );

    connection.release();

    app.listen(PORT, () => {
      console.log(
        `ShopSphere server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "MySQL database connection failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();