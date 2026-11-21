const pool = require("../config/db");

const SHIPPING_FEE = 49;
const FREE_SHIPPING_THRESHOLD = 999;

const PAYMENT_METHODS = ["COD", "CARD", "UPI"];

const generateOrderNumber = () => {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SS-${Date.now()}-${random}`;
};

// ==========================================
// CHECKOUT — CREATE ORDER FROM CART
// body: { addressId, paymentMethod }
// ==========================================
const checkout = async (req, res) => {
  const { addressId, paymentMethod } = req.body;

  if (!addressId || !paymentMethod) {
    return res.status(400).json({
      success: false,
      message: "addressId and paymentMethod are required",
    });
  }

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment method",
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [addresses] = await connection.query(
      `SELECT * FROM addresses WHERE id = ? AND user_id = ?`,
      [addressId, req.user.id]
    );

    if (addresses.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Shipping address not found",
      });
    }

    const address = addresses[0];

    const [cartItems] = await connection.query(
      `SELECT c.product_id, c.quantity, p.name, p.price, p.stock, p.image_url, p.seller_id, p.is_active
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?
       FOR UPDATE`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    for (const item of cartItems) {
      if (!item.is_active) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `${item.name} is no longer available`,
        });
      }

      if (item.stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Only ${item.stock} unit(s) of ${item.name} left in stock`,
        });
      }
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shippingFee;

    const paymentStatus = paymentMethod === "COD" ? "PENDING" : "PAID";

    const [orderResult] = await connection.query(
      `INSERT INTO orders
       (order_number, user_id, status, payment_method, payment_status,
        subtotal, shipping_fee, total,
        shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode)
       VALUES (?, ?, 'PLACED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateOrderNumber(),
        req.user.id,
        paymentMethod,
        paymentStatus,
        subtotal,
        shippingFee,
        total,
        address.full_name,
        address.phone,
        address.address_line,
        address.city,
        address.state,
        address.pincode,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await connection.query(
        `INSERT INTO order_items
         (order_id, product_id, seller_id, product_name, product_image, price, quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.seller_id,
          item.name,
          item.image_url,
          item.price,
          item.quantity,
        ]
      );

      await connection.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await connection.query(`DELETE FROM cart_items WHERE user_id = ?`, [
      req.user.id,
    ]);

    await connection.commit();

    const [orderRows] = await pool.query(`SELECT * FROM orders WHERE id = ?`, [
      orderId,
    ]);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: orderRows[0],
    });
  } catch (error) {
    await connection.rollback();
    console.error("Checkout error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while placing order",
    });
  } finally {
    connection.release();
  }
};

// ==========================================
// GET MY ORDERS
// ==========================================
const getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );

    if (orders.length === 0) {
      return res.status(200).json({ success: true, orders: [] });
    }

    const orderIds = orders.map((order) => order.id);

    const [items] = await pool.query(
      `SELECT * FROM order_items WHERE order_id IN (?)`,
      [orderIds]
    );

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: items.filter((item) => item.order_id === order.id),
    }));

    return res.status(200).json({ success: true, orders: ordersWithItems });
  } catch (error) {
    console.error("Get my orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

// ==========================================
// GET ORDER BY ID
// ==========================================
const getOrderById = async (req, res) => {
  try {
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

    const order = orders[0];

    const isOwner = order.user_id === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    const [items] = await pool.query(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [orderId]
    );

    return res.status(200).json({
      success: true,
      order: { ...order, items },
    });
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
};

// ==========================================
// CANCEL ORDER (only while PLACED)
// ==========================================
const cancelOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const orderId = req.params.id;

    await connection.beginTransaction();

    const [orders] = await connection.query(
      `SELECT * FROM orders WHERE id = ? AND user_id = ? FOR UPDATE`,
      [orderId, req.user.id]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (orders[0].status !== "PLACED") {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Only orders that haven't been packed yet can be cancelled",
      });
    }

    const [items] = await connection.query(
      `SELECT product_id, quantity FROM order_items WHERE order_id = ?`,
      [orderId]
    );

    for (const item of items) {
      if (item.product_id) {
        await connection.query(
          `UPDATE products SET stock = stock + ? WHERE id = ?`,
          [item.quantity, item.product_id]
        );
      }
    }

    await connection.query(
      `UPDATE orders SET status = 'CANCELLED' WHERE id = ?`,
      [orderId]
    );

    await connection.query(
      `UPDATE order_items SET item_status = 'CANCELLED' WHERE order_id = ?`,
      [orderId]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Order cancelled",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Cancel order error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while cancelling order",
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  checkout,
  getMyOrders,
  getOrderById,
  cancelOrder,
};
