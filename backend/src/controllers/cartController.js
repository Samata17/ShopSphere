const pool = require("../config/db");

// ==========================================
// GET CART
// ==========================================
const getCart = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT
        c.id, c.product_id, c.quantity,
        p.name, p.price, p.old_price, p.image_url, p.stock, p.category, p.is_active
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, items });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching cart",
    });
  }
};

// ==========================================
// ADD / INCREMENT ITEM IN CART
// ==========================================
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }

    const qtyToAdd = Number(quantity) > 0 ? Number(quantity) : 1;

    const [products] = await pool.query(
      "SELECT id, stock FROM products WHERE id = ? AND is_active = TRUE",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, productId, qtyToAdd]
    );

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding to cart",
    });
  }
};

// ==========================================
// UPDATE ITEM QUANTITY
// ==========================================
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.productId;

    if (!quantity || Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const [result] = await pool.query(
      `UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?`,
      [Number(quantity), req.user.id, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart updated",
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating cart",
    });
  }
};

// ==========================================
// REMOVE ITEM
// ==========================================
const removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId;

    await pool.query(
      `DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`,
      [req.user.id, productId]
    );

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while removing item",
    });
  }
};

// ==========================================
// CLEAR CART
// ==========================================
const clearCart = async (req, res) => {
  try {
    await pool.query(`DELETE FROM cart_items WHERE user_id = ?`, [
      req.user.id,
    ]);

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while clearing cart",
    });
  }
};

// ==========================================
// MERGE GUEST CART (on login)
// body: { items: [{ productId, quantity }] }
// ==========================================
const mergeCart = async (req, res) => {
  try {
    const { items } = req.body;

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (!item.productId) continue;

        const qty = Number(item.quantity) > 0 ? Number(item.quantity) : 1;

        await pool.query(
          `INSERT INTO cart_items (user_id, product_id, quantity)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
          [req.user.id, item.productId, qty]
        );
      }
    }

    const [mergedItems] = await pool.query(
      `SELECT
        c.id, c.product_id, c.quantity,
        p.name, p.price, p.old_price, p.image_url, p.stock, p.category, p.is_active
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, items: mergedItems });
  } catch (error) {
    console.error("Merge cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while merging cart",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
};
