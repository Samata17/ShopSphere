const express = require("express");

const {
  checkout,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/checkout", authorizeRoles("CUSTOMER"), checkout);
router.get("/", authorizeRoles("CUSTOMER"), getMyOrders);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", authorizeRoles("CUSTOMER"), cancelOrder);

module.exports = router;
