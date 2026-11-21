const pool = require("../config/db");

const RATINGS_JOIN = `
  LEFT JOIN (
    SELECT product_id, AVG(rating) AS avg_rating, COUNT(*) AS review_count
    FROM reviews
    GROUP BY product_id
  ) rv ON rv.product_id = p.id
  LEFT JOIN (
    SELECT product_id, SUM(quantity) AS sold_count
    FROM order_items
    WHERE item_status != 'CANCELLED'
    GROUP BY product_id
  ) sc ON sc.product_id = p.id
`;

const PRODUCT_SELECT = `
  p.id, p.seller_id, p.name, p.description, p.category, p.category_id, p.brand,
  p.price, p.old_price, p.stock, p.image_url, p.is_active,
  p.created_at, p.updated_at,
  u.name AS seller_name,
  COALESCE(rv.avg_rating, 0) AS avg_rating,
  COALESCE(rv.review_count, 0) AS review_count,
  COALESCE(sc.sold_count, 0) AS sold_count
`;

// ==========================================
// GET ALL ACTIVE PRODUCTS - PUBLIC
// Supports search, filters, sort, and pagination:
// ?search=&category=&brand=&minPrice=&maxPrice=&minRating=&inStock=true|false
// &deals=true&sort=price_asc|price_desc|newest|rating|bestselling|name_asc
// &page=1&limit=12
// ==========================================
const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      search,
      sort,
      deals,
      minPrice,
      maxPrice,
      minRating,
      inStock,
    } = req.query;

    const conditions = ["p.is_active = TRUE"];
    const params = [];

    if (category) {
      conditions.push("p.category = ?");
      params.push(category);
    }

    if (brand) {
      const brands = brand.split(",").map((b) => b.trim()).filter(Boolean);
      if (brands.length > 0) {
        conditions.push(`p.brand IN (${brands.map(() => "?").join(",")})`);
        params.push(...brands);
      }
    }

    if (search) {
      conditions.push(
        "(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ? OR p.category LIKE ?)"
      );
      const likeTerm = `%${search}%`;
      params.push(likeTerm, likeTerm, likeTerm, likeTerm);
    }

    if (deals === "true") {
      conditions.push("p.old_price IS NOT NULL AND p.old_price > p.price");
    }

    if (minPrice) {
      conditions.push("p.price >= ?");
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      conditions.push("p.price <= ?");
      params.push(Number(maxPrice));
    }

    if (inStock === "true") {
      conditions.push("p.stock > 0");
    } else if (inStock === "false") {
      conditions.push("p.stock = 0");
    }

    const havingClauses = [];
    if (minRating) {
      havingClauses.push("avg_rating >= ?");
      params.push(Number(minRating));
    }

    let orderBy = "p.created_at DESC";
    if (sort === "price_asc") orderBy = "p.price ASC";
    else if (sort === "price_desc") orderBy = "p.price DESC";
    else if (sort === "newest") orderBy = "p.created_at DESC";
    else if (sort === "rating") orderBy = "avg_rating DESC";
    else if (sort === "bestselling") orderBy = "sold_count DESC";
    else if (sort === "name_asc") orderBy = "p.name ASC";

    const baseQuery = `
      SELECT ${PRODUCT_SELECT}
      FROM products p
      JOIN users u ON p.seller_id = u.id
      ${RATINGS_JOIN}
      WHERE ${conditions.join(" AND ")}
      ${havingClauses.length > 0 ? `HAVING ${havingClauses.join(" AND ")}` : ""}
    `;

    // Legacy callers (Deals/LatestProducts/NewArrivals/old Products.jsx) don't
    // send page/limit and expect the full matching list back, so default to a
    // high ceiling rather than the new Products page's 12-per-page default.
    const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 1000;
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM (${baseQuery}) AS count_table`,
      params
    );

    const [products] = await pool.query(
      `${baseQuery} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("Get public products error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

// ==========================================
// GET SINGLE PRODUCT BY ID - PUBLIC
// ==========================================
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const [products] = await pool.query(
      `SELECT ${PRODUCT_SELECT}
       FROM products p
       JOIN users u ON p.seller_id = u.id
       ${RATINGS_JOIN}
       WHERE p.id = ? AND p.is_active = TRUE`,
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = products[0];

    const [images] = await pool.query(
      `SELECT id, image_url, sort_order, is_thumbnail
       FROM product_images WHERE product_id = ? ORDER BY sort_order ASC`,
      [productId]
    );

    let relatedProducts = [];
    if (product.category_id) {
      const [related] = await pool.query(
        `SELECT ${PRODUCT_SELECT}
         FROM products p
         JOIN users u ON p.seller_id = u.id
         ${RATINGS_JOIN}
         WHERE p.category_id = ? AND p.id != ? AND p.is_active = TRUE
         ORDER BY avg_rating DESC
         LIMIT 6`,
        [product.category_id, productId]
      );
      relatedProducts = related;
    }

    return res.status(200).json({
      success: true,
      product: { ...product, images },
      relatedProducts,
    });
  } catch (error) {
    console.error("Get product details error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
};
