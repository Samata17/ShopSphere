const express = require("express");

const {
  getAllProducts,
  getProductById,
} = require("../controllers/publicProductController");

const { getProductReviews } = require("../controllers/reviewController");

const router = express.Router();

// ==========================================
// GET ALL ACTIVE PRODUCTS
// PUBLIC ROUTE
// GET /api/products
// ==========================================
router.get(
  "/",
  getAllProducts
);

// ==========================================
// GET ONE PRODUCT BY ID
// PUBLIC ROUTE
// GET /api/products/:id
// ==========================================
router.get(
  "/:id",
  getProductById
);

// ==========================================
// GET REVIEWS FOR A PRODUCT
// PUBLIC ROUTE
// GET /api/products/:id/reviews
// ==========================================
router.get(
  "/:id/reviews",
  getProductReviews
);

// ==========================================
// EXPORT ROUTER
// ==========================================
module.exports = router;