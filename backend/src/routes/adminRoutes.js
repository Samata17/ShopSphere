const express = require("express");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  getDashboardStats,
  getAllUsers,
  setUserActiveStatus,
  deleteUser,
  getAllProductsAdmin,
  setProductActiveStatus,
  deleteProductAdmin,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect, authorizeRoles("ADMIN"));

router.get("/dashboard", getDashboardStats);

router.get("/users", getAllUsers);
router.patch("/users/:id/status", setUserActiveStatus);
router.delete("/users/:id", deleteUser);

router.get("/products", getAllProductsAdmin);
router.patch("/products/:id/status", setProductActiveStatus);
router.delete("/products/:id", deleteProductAdmin);

router.get("/orders", getAllOrders);
router.patch("/orders/:id/status", updateOrderStatus);

module.exports = router;
