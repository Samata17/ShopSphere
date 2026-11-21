const pool = require("../config/db");

// ==========================================
// GET ORDERS CONTAINING THIS SELLER'S ITEMS
// Only the seller's own items are returned per order.
// ==========================================
const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const [items] = await pool.query(
      `SELECT oi.*, o.order_number, o.status AS order_status, o.payment_method,
              o.payment_status, o.shipping_name, o.shipping_phone, o.shipping_address,
              o.shipping_city, o.shipping_state, o.shipping_pincode, o.created_at AS order_created_at
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.seller_id = ?
       ORDER BY o.created_at DESC`,
      [sellerId]
    );

    const ordersMap = new Map();

    for (const row of items) {
      if (!ordersMap.has(row.order_id)) {
        ordersMap.set(row.order_id, {
          order_id: row.order_id,
          order_number: row.order_number,
          order_status: row.order_status,
          payment_method: row.payment_method,
          payment_status: row.payment_status,
          shipping_name: row.shipping_name,
          shipping_phone: row.shipping_phone,
          shipping_address: row.shipping_address,
          shipping_city: row.shipping_city,
          shipping_state: row.shipping_state,
          shipping_pincode: row.shipping_pincode,
          created_at: row.order_created_at,
          items: [],
        });
      }

      ordersMap.get(row.order_id).items.push({
        id: row.id,
        product_id: row.product_id,
        product_name: row.product_name,
        product_image: row.product_image,
        price: row.price,
        quantity: row.quantity,
        item_status: row.item_status,
      });
    }

    return res.status(200).json({
      success: true,
      orders: Array.from(ordersMap.values()),
    });
  } catch (error) {
    console.error("Get seller orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

// ==========================================
// GET ONE ORDER (SELLER'S ITEMS ONLY)
// ==========================================
const getSellerOrderById = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orderId = req.params.id;

    const [orders] = await pool.query(`SELECT * FROM orders WHERE id = ?`, [
      orderId,
    ]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const [items] = await pool.query(
      `SELECT * FROM order_items WHERE order_id = ? AND seller_id = ?`,
      [orderId, sellerId]
    );

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You have no items in this order",
      });
    }

    return res.status(200).json({
      success: true,
      order: { ...orders[0], items },
    });
  } catch (error) {
    console.error("Get seller order error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
};

// ==========================================
// UPDATE ITEM STATUS (SELLER'S OWN ITEM ONLY)
// ==========================================
const ITEM_STATUSES = ["PLACED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

const updateItemStatus = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { itemId } = req.params;
    const { status } = req.body;

    if (!ITEM_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const [result] = await pool.query(
      `UPDATE order_items SET item_status = ? WHERE id = ? AND seller_id = ?`,
      [status, itemId, sellerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Order item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item status updated",
    });
  } catch (error) {
    console.error("Update item status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating item status",
    });
  }
};

// ==========================================
// SELLER DASHBOARD STATS
// ==========================================
const getDashboardStats = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const [[productStats]] = await pool.query(
      `SELECT COUNT(*) AS totalProducts, COALESCE(SUM(stock), 0) AS totalStock
       FROM products WHERE seller_id = ?`,
      [sellerId]
    );

    const [[orderStats]] = await pool.query(
      `SELECT COUNT(DISTINCT order_id) AS totalOrders,
              COALESCE(SUM(price * quantity), 0) AS totalRevenue,
              COALESCE(SUM(quantity), 0) AS totalUnitsSold
       FROM order_items WHERE seller_id = ? AND item_status != 'CANCELLED'`,
      [sellerId]
    );

    const [recentProducts] = await pool.query(
      `SELECT id, name, category, price, stock, image_url
       FROM products WHERE seller_id = ? ORDER BY created_at DESC LIMIT 5`,
      [sellerId]
    );

    const [lowStockProducts] = await pool.query(
      `SELECT id, name, category, stock, image_url
       FROM products WHERE seller_id = ? AND is_active = TRUE AND stock <= 5
       ORDER BY stock ASC LIMIT 10`,
      [sellerId]
    );

    const [[ratingStats]] = await pool.query(
      `SELECT COALESCE(AVG(r.rating), 0) AS averageRating, COUNT(r.id) AS totalReviews
       FROM reviews r JOIN products p ON r.product_id = p.id
       WHERE p.seller_id = ?`,
      [sellerId]
    );

    const [recentReviews] = await pool.query(
      `SELECT r.id, r.rating, r.title, r.comment, r.created_at,
              p.id AS product_id, p.name AS product_name, u.name AS customer_name
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       JOIN users u ON r.user_id = u.id
       WHERE p.seller_id = ?
       ORDER BY r.created_at DESC LIMIT 5`,
      [sellerId]
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts: productStats.totalProducts,
        totalStock: productStats.totalStock,
        totalOrders: orderStats.totalOrders,
        totalRevenue: orderStats.totalRevenue,
        totalUnitsSold: orderStats.totalUnitsSold,
        averageRating: ratingStats.averageRating,
        totalReviews: ratingStats.totalReviews,
      },
      recentProducts,
      lowStockProducts,
      recentReviews,
    });
  } catch (error) {
    console.error("Get seller dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard stats",
    });
  }
};

module.exports = {
  getSellerOrders,
  getSellerOrderById,
  updateItemStatus,
  getDashboardStats,
};
