const pool = require("../config/db");

// Product images are intentionally never deleted from disk here: past
// order_items snapshot an image_url at purchase time, and deleting the file
// when a product is edited/removed would break images in order history.

const resolveCategory = async (categoryId) => {
  const [categories] = await pool.query(
    `SELECT id, name FROM categories WHERE id = ?`,
    [categoryId]
  );
  return categories[0] || null;
};

// ==========================================
// ADD PRODUCT - SELLER
// ==========================================
const addProduct = async (req, res) => {
  try {
    const { name, description, categoryId, brand, price, oldPrice, stock } =
      req.body;

    if (!name || !categoryId || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, category and price are required",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    const category = await resolveCategory(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Invalid category selected",
      });
    }

    const sellerId = req.user.id;
    const files = req.files || [];
    const images = files.map(
      (file) => `/uploads/products/${file.filename}`
    );
    const thumbnailUrl = images[0] || null;

    const [result] = await pool.query(
      `INSERT INTO products
       (seller_id, name, description, category, category_id, brand, price, old_price, stock, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sellerId,
        name.trim(),
        description?.trim() || null,
        category.name,
        category.id,
        brand?.trim() || null,
        Number(price),
        oldPrice ? Number(oldPrice) : null,
        Number(stock) || 0,
        thumbnailUrl,
      ]
    );

    const productId = result.insertId;

    for (let i = 0; i < images.length; i += 1) {
      await pool.query(
        `INSERT INTO product_images (product_id, image_url, sort_order, is_thumbnail) VALUES (?, ?, ?, ?)`,
        [productId, images[i], i, i === 0 ? 1 : 0]
      );
    }

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: {
        id: productId,
        seller_id: sellerId,
        name: name.trim(),
        description: description?.trim() || null,
        category: category.name,
        category_id: category.id,
        brand: brand?.trim() || null,
        price: Number(price),
        old_price: oldPrice ? Number(oldPrice) : null,
        stock: Number(stock) || 0,
        image_url: thumbnailUrl,
        images,
      },
    });
  } catch (error) {
    console.error("Add product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while adding product",
    });
  }
};

// ==========================================
// GET SELLER'S OWN PRODUCTS
// ==========================================
const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const [products] = await pool.query(
      `SELECT *
       FROM products
       WHERE seller_id = ?
       ORDER BY created_at DESC`,
      [sellerId]
    );

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get seller products error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

// ==========================================
// GET SELLER'S SINGLE PRODUCT (FOR EDIT)
// ==========================================
const getSellerProductById = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const productId = req.params.id;

    const [products] = await pool.query(
      `SELECT * FROM products WHERE id = ? AND seller_id = ?`,
      [productId, sellerId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not own this product",
      });
    }

    const [images] = await pool.query(
      `SELECT id, image_url, sort_order, is_thumbnail
       FROM product_images WHERE product_id = ? ORDER BY sort_order ASC`,
      [productId]
    );

    return res.status(200).json({
      success: true,
      product: { ...products[0], images },
    });
  } catch (error) {
    console.error("Get seller product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    });
  }
};

// ==========================================
// UPDATE PRODUCT - SELLER
// (supports adding new images, removing existing images, and
//  re-assigning the thumbnail)
// ==========================================
const updateProduct = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const productId = req.params.id;

    const {
      name,
      description,
      categoryId,
      brand,
      price,
      oldPrice,
      stock,
      thumbnailImageId,
      removeImageIds,
    } = req.body;

    const [products] = await pool.query(
      `SELECT *
       FROM products
       WHERE id = ? AND seller_id = ?`,
      [productId, sellerId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not own this product",
      });
    }

    const currentProduct = products[0];

    if (price !== undefined && Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    let updatedCategoryName = currentProduct.category;
    let updatedCategoryId = currentProduct.category_id;

    if (categoryId !== undefined) {
      const category = await resolveCategory(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Invalid category selected",
        });
      }
      updatedCategoryName = category.name;
      updatedCategoryId = category.id;
    }

    const updatedName = name !== undefined ? name.trim() : currentProduct.name;

    const updatedDescription =
      description !== undefined
        ? description.trim() || null
        : currentProduct.description;

    const updatedBrand =
      brand !== undefined ? brand.trim() || null : currentProduct.brand;

    const updatedPrice = price !== undefined ? Number(price) : currentProduct.price;

    const updatedOldPrice =
      oldPrice !== undefined
        ? oldPrice
          ? Number(oldPrice)
          : null
        : currentProduct.old_price;

    const updatedStock =
      stock !== undefined ? Number(stock) : currentProduct.stock;

    // Remove selected existing images (ownership already scoped via productId above)
    const idsToRemove = removeImageIds
      ? String(removeImageIds)
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

    if (idsToRemove.length > 0) {
      await pool.query(
        `DELETE FROM product_images WHERE product_id = ? AND id IN (${idsToRemove
          .map(() => "?")
          .join(",")})`,
        [productId, ...idsToRemove]
      );
    }

    // Add newly uploaded images
    const files = req.files || [];
    const newImages = files.map((file) => `/uploads/products/${file.filename}`);

    if (newImages.length > 0) {
      const [[{ maxOrder }]] = await pool.query(
        `SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM product_images WHERE product_id = ?`,
        [productId]
      );

      for (let i = 0; i < newImages.length; i += 1) {
        await pool.query(
          `INSERT INTO product_images (product_id, image_url, sort_order, is_thumbnail) VALUES (?, ?, ?, 0)`,
          [productId, newImages[i], maxOrder + 1 + i]
        );
      }
    }

    // Re-assign thumbnail if requested
    if (thumbnailImageId) {
      await pool.query(
        `UPDATE product_images SET is_thumbnail = (id = ?) WHERE product_id = ?`,
        [thumbnailImageId, productId]
      );
    } else if (newImages.length > 0 && idsToRemove.length > 0) {
      // If the previous thumbnail was just removed, promote the first remaining image
      const [[thumbCheck]] = await pool.query(
        `SELECT COUNT(*) AS count FROM product_images WHERE product_id = ? AND is_thumbnail = 1`,
        [productId]
      );
      if (thumbCheck.count === 0) {
        await pool.query(
          `UPDATE product_images SET is_thumbnail = 1
           WHERE id = (SELECT id FROM (SELECT id FROM product_images WHERE product_id = ? ORDER BY sort_order ASC LIMIT 1) AS t)`,
          [productId]
        );
      }
    }

    const [[thumbnailRow]] = await pool.query(
      `SELECT image_url FROM product_images WHERE product_id = ? AND is_thumbnail = 1 LIMIT 1`,
      [productId]
    );
    const updatedImageUrl = thumbnailRow?.image_url || currentProduct.image_url;

    await pool.query(
      `UPDATE products
       SET name = ?,
           description = ?,
           category = ?,
           category_id = ?,
           brand = ?,
           price = ?,
           old_price = ?,
           stock = ?,
           image_url = ?
       WHERE id = ? AND seller_id = ?`,
      [
        updatedName,
        updatedDescription,
        updatedCategoryName,
        updatedCategoryId,
        updatedBrand,
        updatedPrice,
        updatedOldPrice,
        updatedStock,
        updatedImageUrl,
        productId,
        sellerId,
      ]
    );

    const [images] = await pool.query(
      `SELECT id, image_url, sort_order, is_thumbnail
       FROM product_images WHERE product_id = ? ORDER BY sort_order ASC`,
      [productId]
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: {
        id: Number(productId),
        seller_id: sellerId,
        name: updatedName,
        description: updatedDescription,
        category: updatedCategoryName,
        category_id: updatedCategoryId,
        brand: updatedBrand,
        price: Number(updatedPrice),
        old_price: updatedOldPrice,
        stock: Number(updatedStock),
        image_url: updatedImageUrl,
        images,
      },
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating product",
    });
  }
};

// ==========================================
// DELETE PRODUCT - SELLER
// ==========================================
const deleteProduct = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const productId = req.params.id;

    const [products] = await pool.query(
      `SELECT id, name
       FROM products
       WHERE id = ? AND seller_id = ?`,
      [productId, sellerId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not own this product",
      });
    }

    const product = products[0];

    await pool.query(`DELETE FROM products WHERE id = ? AND seller_id = ?`, [
      productId,
      sellerId,
    ]);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product: {
        id: product.id,
        name: product.name,
      },
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    });
  }
};

module.exports = {
  addProduct,
  getSellerProducts,
  getSellerProductById,
  updateProduct,
  deleteProduct,
};
