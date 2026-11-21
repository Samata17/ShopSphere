const pool = require("../config/db");

// ==========================================
// GET WISHLIST
// ==========================================
const getWishlist = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT
        w.id, w.product_id,
        p.name, p.price, p.old_price, p.image_url, p.stock, p.category, p.is_active
       FROM wishlist_items w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, items });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching wishlist",
    });
  }
};

// ==========================================
// ADD TO WISHLIST
// ==========================================
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }

    const [products] = await pool.query(
      "SELECT id FROM products WHERE id = ? AND is_active = TRUE",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await pool.query(
      `INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)`,
      [req.user.id, productId]
    );

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding to wishlist",
    });
  }
};

// ==========================================
// REMOVE FROM WISHLIST
// ==========================================
const removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;

    await pool.query(
      `DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?`,
      [req.user.id, productId]
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while removing from wishlist",
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
