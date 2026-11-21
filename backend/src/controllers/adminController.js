const pool = require("../config/db");

// ==========================================
// DASHBOARD STATS
// ==========================================
const getDashboardStats = async (req, res) => {
  try {
    const [[userStats]] = await pool.query(
      `SELECT
        COUNT(*) AS totalUsers,
        SUM(role = 'CUSTOMER') AS totalCustomers,
        SUM(role = 'SELLER') AS totalSellers
       FROM users`
    );

    const [[productStats]] = await pool.query(
      `SELECT COUNT(*) AS totalProducts FROM products`
    );

    // Total Orders counts every non-cancelled order placed. Revenue only
    // counts orders actually marked PAID — COD orders become revenue once
    // delivered (see updateOrderStatus below), not the moment they're
    // placed, so counting all COD orders here would overstate revenue for
    // any order still PLACED/PACKED/SHIPPED.
    const [[orderStats]] = await pool.query(
      `SELECT
        SUM(status != 'CANCELLED') AS totalOrders,
        COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN total ELSE 0 END), 0) AS totalRevenue
       FROM orders`
    );

    const [mostSoldProducts] = await pool.query(
      `SELECT p.id, p.name, p.image_url, SUM(oi.quantity) AS unitsSold
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.item_status != 'CANCELLED'
       GROUP BY p.id
       ORDER BY unitsSold DESC
       LIMIT 5`
    );

    const [highestRatedProducts] = await pool.query(
      `SELECT p.id, p.name, p.image_url, AVG(r.rating) AS averageRating, COUNT(r.id) AS reviewCount
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       GROUP BY p.id
       HAVING reviewCount >= 1
       ORDER BY averageRating DESC
       LIMIT 5`
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: userStats.totalUsers,
        totalCustomers: userStats.totalCustomers,
        totalSellers: userStats.totalSellers,
        totalProducts: productStats.totalProducts,
        totalOrders: orderStats.totalOrders,
        totalRevenue: orderStats.totalRevenue,
      },
      mostSoldProducts,
      highestRatedProducts,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard stats",
    });
  }
};

// ==========================================
// USERS
// ==========================================
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, name, email, phone, role, is_active, created_at
       FROM users ORDER BY created_at DESC`
    );

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

const setUserActiveStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;

    if (Number(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    const [result] = await pool.query(
      `UPDATE users SET is_active = ? WHERE id = ?`,
      [isActive ? 1 : 0, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User status updated",
    });
  } catch (error) {
    console.error("Set user status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating user status",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (Number(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

// ==========================================
// PRODUCTS
// ==========================================
const getAllProductsAdmin = async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT p.*, u.name AS seller_name
       FROM products p
       JOIN users u ON p.seller_id = u.id
       ORDER BY p.created_at DESC`
    );

    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get all products (admin) error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

const setProductActiveStatus = async (req, res) => {
  try {
    const productId = req.params.id;
    const { isActive } = req.body;

    const [result] = await pool.query(
      `UPDATE products SET is_active = ? WHERE id = ?`,
      [isActive ? 1 : 0, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product status updated",
    });
  } catch (error) {
    console.error("Set product status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating product status",
    });
  }
};

const deleteProductAdmin = async (req, res) => {
  try {
    const productId = req.params.id;

    const [result] = await pool.query(`DELETE FROM products WHERE id = ?`, [
      productId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    console.error("Delete product (admin) error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    });
  }
};

// ==========================================
// ORDERS
// ==========================================
const getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.phone AS customer_phone
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get all orders (admin) error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

const ORDER_STATUSES = ["PLACED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const [result] = await pool.query(
      `UPDATE orders SET status = ? WHERE id = ?`,
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (status === "DELIVERED") {
      await pool.query(
        `UPDATE orders SET payment_status = 'PAID' WHERE id = ? AND payment_method = 'COD'`,
        [orderId]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    console.error("Update order status (admin) error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating order status",
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  setUserActiveStatus,
  deleteUser,
  getAllProductsAdmin,
  setProductActiveStatus,
  deleteProductAdmin,
  getAllOrders,
  updateOrderStatus,
};
