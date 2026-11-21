const express = require("express");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.post("/merge", mergeCart);
router.put("/:productId", updateCartItem);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

module.exports = router;
