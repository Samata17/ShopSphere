const pool = require("../config/db");

// ==========================================
// GET ALL CATEGORIES - PUBLIC
// ==========================================
const getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      `SELECT id, name, slug, icon, description FROM categories ORDER BY id ASC`
    );

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
    });
  }
};

module.exports = {
  getAllCategories,
};
