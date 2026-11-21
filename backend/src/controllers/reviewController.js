const pool = require("../config/db");

// ==========================================
// GET REVIEWS FOR A PRODUCT - PUBLIC
// ==========================================
const getProductReviews = async (req, res) => {
  try {
    const productId = req.params.id;

    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.title, r.comment, r.created_at, r.updated_at,
              r.user_id, u.name AS customer_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      ratingBreakdown[review.rating] = (ratingBreakdown[review.rating] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      reviews,
      totalReviews,
      averageRating,
      ratingBreakdown,
    });
  } catch (error) {
    console.error("Get product reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching reviews",
    });
  }
};

// ==========================================
// CHECK IF CURRENT CUSTOMER CAN REVIEW A PRODUCT
// ==========================================
const canReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const [purchases] = await pool.query(
      `SELECT oi.id FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ? AND oi.item_status != 'CANCELLED'
       LIMIT 1`,
      [userId, productId]
    );

    const [existingReviews] = await pool.query(
      `SELECT id, rating, title, comment FROM reviews WHERE product_id = ? AND user_id = ?`,
      [productId, userId]
    );

    const hasPurchased = purchases.length > 0;
    const existingReview = existingReviews[0] || null;

    return res.status(200).json({
      success: true,
      hasPurchased,
      hasReviewed: !!existingReview,
      canReview: hasPurchased && !existingReview,
      existingReview,
    });
  } catch (error) {
    console.error("Can review check error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while checking review eligibility",
    });
  }
};

// ==========================================
// ADD REVIEW - CUSTOMER (VERIFIED PURCHASE ONLY)
// ==========================================
const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating || !title?.trim() || !comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: "productId, rating, title and comment are required",
      });
    }

    const ratingNumber = Number(rating);
    if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5",
      });
    }

    const [purchases] = await pool.query(
      `SELECT oi.id FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ? AND oi.item_status != 'CANCELLED'
       ORDER BY oi.id DESC LIMIT 1`,
      [userId, productId]
    );

    if (purchases.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You can only review products you have purchased",
      });
    }

    const [existing] = await pool.query(
      `SELECT id FROM reviews WHERE product_id = ? AND user_id = ?`,
      [productId, userId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product. Edit your existing review instead.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO reviews (product_id, user_id, order_item_id, rating, title, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [productId, userId, purchases[0].id, ratingNumber, title.trim(), comment.trim()]
    );

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: {
        id: result.insertId,
        product_id: Number(productId),
        user_id: userId,
        rating: ratingNumber,
        title: title.trim(),
        comment: comment.trim(),
      },
    });
  } catch (error) {
    console.error("Add review error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while adding review",
    });
  }
};

// ==========================================
// UPDATE REVIEW - OWNER ONLY
// ==========================================
const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.id;
    const { rating, title, comment } = req.body;

    const [reviews] = await pool.query(
      `SELECT * FROM reviews WHERE id = ? AND user_id = ?`,
      [reviewId, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you do not own this review",
      });
    }

    const current = reviews[0];

    let updatedRating = current.rating;
    if (rating !== undefined) {
      const ratingNumber = Number(rating);
      if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be a whole number between 1 and 5",
        });
      }
      updatedRating = ratingNumber;
    }

    const updatedTitle = title !== undefined ? title.trim() : current.title;
    const updatedComment = comment !== undefined ? comment.trim() : current.comment;

    if (!updatedTitle || !updatedComment) {
      return res.status(400).json({
        success: false,
        message: "Title and comment cannot be empty",
      });
    }

    await pool.query(
      `UPDATE reviews SET rating = ?, title = ?, comment = ? WHERE id = ? AND user_id = ?`,
      [updatedRating, updatedTitle, updatedComment, reviewId, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: {
        id: Number(reviewId),
        rating: updatedRating,
        title: updatedTitle,
        comment: updatedComment,
      },
    });
  } catch (error) {
    console.error("Update review error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating review",
    });
  }
};

// ==========================================
// DELETE REVIEW - OWNER ONLY
// ==========================================
const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.id;

    const [result] = await pool.query(
      `DELETE FROM reviews WHERE id = ? AND user_id = ?`,
      [reviewId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you do not own this review",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting review",
    });
  }
};

module.exports = {
  getProductReviews,
  canReview,
  addReview,
  updateReview,
  deleteReview,
};
