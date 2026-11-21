const express = require("express");

const { getAllCategories } = require("../controllers/categoryController");

const router = express.Router();

// ==========================================
// GET ALL CATEGORIES
// PUBLIC ROUTE
// GET /api/categories
// ==========================================
router.get("/", getAllCategories);

module.exports = router;
