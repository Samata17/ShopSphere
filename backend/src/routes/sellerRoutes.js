const express = require("express");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {
  addProduct,
  getSellerProducts,
  getSellerProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  getSellerOrders,
  getSellerOrderById,
  updateItemStatus,
  getDashboardStats,
} = require("../controllers/sellerOrderController");

const router = express.Router();

router.use(protect, authorizeRoles("SELLER"));

// ==========================================
// DASHBOARD
// ==========================================
router.get("/dashboard", getDashboardStats);

// ==========================================
// PRODUCTS
// ==========================================
router.get("/products", getSellerProducts);
router.get("/products/:id", getSellerProductById);
router.post("/products", upload.array("images", 6), addProduct);
router.put("/products/:id", upload.array("images", 6), updateProduct);
router.delete("/products/:id", deleteProduct);

// ==========================================
// ORDERS
// ==========================================
router.get("/orders", getSellerOrders);
router.get("/orders/:id", getSellerOrderById);
router.patch("/orders/items/:itemId/status", updateItemStatus);

module.exports = router;
