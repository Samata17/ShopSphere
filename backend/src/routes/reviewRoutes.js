const express = require("express");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  canReview,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const router = express.Router();

// ==========================================
// CAN CURRENT CUSTOMER REVIEW THIS PRODUCT?
// GET /api/reviews/can-review/:productId
// ==========================================
router.get("/can-review/:productId", protect, canReview);

// ==========================================
// ADD / UPDATE / DELETE REVIEW - CUSTOMER ONLY
// ==========================================
router.post("/", protect, authorizeRoles("CUSTOMER"), addReview);
router.put("/:id", protect, authorizeRoles("CUSTOMER"), updateReview);
router.delete("/:id", protect, authorizeRoles("CUSTOMER"), deleteReview);

module.exports = router;
