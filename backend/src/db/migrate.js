require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("../config/db");

// ==========================================
// HELPERS
// ==========================================

const columnExists = async (table, column) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
    [process.env.DB_NAME, table, column]
  );
  return rows[0].count > 0;
};

const tableExists = async (table) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.tables
     WHERE table_schema = ? AND table_name = ?`,
    [process.env.DB_NAME, table]
  );
  return rows[0].count > 0;
};

// ==========================================
// MIGRATION STEPS
// ==========================================

const migrateUsersTable = async () => {
  const [dupPhones] = await pool.query(
    `SELECT phone FROM users WHERE phone IS NOT NULL GROUP BY phone HAVING COUNT(*) > 1`
  );
  if (dupPhones.length > 0) {
    throw new Error(
      `Cannot enforce unique phone: duplicate phone numbers exist (${dupPhones.map((r) => r.phone).join(", ")})`
    );
  }

  const [nullPhones] = await pool.query(
    `SELECT id, name FROM users WHERE phone IS NULL OR phone = ''`
  );
  if (nullPhones.length > 0) {
    throw new Error(
      `Cannot enforce NOT NULL phone: users without a phone exist (ids: ${nullPhones.map((r) => r.id).join(", ")}). Set a phone for them first.`
    );
  }

  await pool.query(`ALTER TABLE users MODIFY COLUMN phone VARCHAR(20) NOT NULL`);

  const [existingUnique] = await pool.query(
    `SELECT COUNT(*) AS count FROM information_schema.statistics
     WHERE table_schema = ? AND table_name = 'users' AND index_name = 'phone_unique'`,
    [process.env.DB_NAME]
  );
  if (existingUnique[0].count === 0) {
    await pool.query(`ALTER TABLE users ADD UNIQUE INDEX phone_unique (phone)`);
  }

  // Backfill a placeholder email for any legacy user who registered before
  // email became the login identifier, so no existing account is locked out.
  await pool.query(
    `UPDATE users SET email = CONCAT(phone, '@shopsphere.local') WHERE email IS NULL OR email = ''`
  );

  const [dupEmails] = await pool.query(
    `SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1`
  );
  if (dupEmails.length > 0) {
    throw new Error(
      `Cannot enforce unique email: duplicate emails exist (${dupEmails.map((r) => r.email).join(", ")})`
    );
  }

  await pool.query(`ALTER TABLE users MODIFY COLUMN email VARCHAR(150) NOT NULL`);

  const [existingEmailUnique] = await pool.query(
    `SELECT COUNT(*) AS count FROM information_schema.statistics
     WHERE table_schema = ? AND table_name = 'users' AND index_name = 'email_unique'`,
    [process.env.DB_NAME]
  );
  if (existingEmailUnique[0].count === 0) {
    await pool.query(`ALTER TABLE users ADD UNIQUE INDEX email_unique (email)`);
  }

  if (!(await columnExists("users", "reset_token_hash"))) {
    await pool.query(`ALTER TABLE users ADD COLUMN reset_token_hash VARCHAR(255) NULL`);
  }
  if (!(await columnExists("users", "reset_token_expires_at"))) {
    await pool.query(`ALTER TABLE users ADD COLUMN reset_token_expires_at DATETIME NULL`);
  }

  console.log("users table migrated (phone unique/required, email unique/required, reset-token columns)");
};

const migrateProductsTable = async () => {
  if (!(await columnExists("products", "old_price"))) {
    await pool.query(`ALTER TABLE products ADD COLUMN old_price DECIMAL(10,2) NULL AFTER price`);
  }
  if (!(await columnExists("products", "brand"))) {
    await pool.query(`ALTER TABLE products ADD COLUMN brand VARCHAR(100) NULL AFTER category`);
  }
  console.log("products table migrated (old_price, brand)");
};

// ==========================================
// CATEGORIES TABLE + SEED
// ==========================================

const CATEGORY_SEED = [
  [1, "Electronics", "electronics", "💻", "Explore the latest gadgets and electronics"],
  [2, "Mobiles", "mobiles", "📱", "Smartphones and mobile accessories"],
  [3, "Fashion", "fashion", "👕", "Discover styles you'll love"],
  [4, "Beauty", "beauty", "💄", "Beauty and skincare essentials"],
  [5, "Books", "books", "📚", "Bestsellers and page-turners"],
  [6, "Grocery", "grocery", "🛒", "Everyday grocery and household essentials"],
  [7, "Home & Kitchen", "home-kitchen", "🏠", "Everything you need for your home"],
  [8, "Sports", "sports", "⚽", "Gear up and stay active"],
];

const createCategoriesTable = async () => {
  if (!(await tableExists("categories"))) {
    await pool.query(`
      CREATE TABLE categories (
        id INT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(10),
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("categories table created");
  }

  for (const [id, name, slug, icon, description] of CATEGORY_SEED) {
    await pool.query(
      `INSERT IGNORE INTO categories (id, name, slug, icon, description) VALUES (?, ?, ?, ?, ?)`,
      [id, name, slug, icon, description]
    );
  }
  console.log("categories seeded");
};

const migrateProductsCategoryId = async () => {
  if (!(await columnExists("products", "category_id"))) {
    await pool.query(`ALTER TABLE products ADD COLUMN category_id INT NULL AFTER category`);
    await pool.query(
      `ALTER TABLE products ADD CONSTRAINT fk_products_category
       FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL`
    );
  }

  await pool.query(
    `UPDATE products p JOIN categories c ON p.category = c.name
     SET p.category_id = c.id WHERE p.category_id IS NULL`
  );

  console.log("products table migrated (category_id backfilled)");
};

// ==========================================
// PRODUCT IMAGES TABLE (+ BACKFILL FROM image_url)
// ==========================================

const createProductImagesTable = async () => {
  if (!(await tableExists("product_images"))) {
    await pool.query(`
      CREATE TABLE product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        is_thumbnail TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product_images_product (product_id)
      )
    `);
    console.log("product_images table created");
  }

  await pool.query(`
    INSERT INTO product_images (product_id, image_url, sort_order, is_thumbnail)
    SELECT p.id, p.image_url, 0, 1
    FROM products p
    WHERE p.image_url IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id)
  `);

  console.log("product_images backfilled from legacy image_url");
};

// ==========================================
// REVIEWS TABLE
// ==========================================

const createReviewsTable = async () => {
  if (await tableExists("reviews")) return;

  await pool.query(`
    CREATE TABLE reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      user_id INT NOT NULL,
      order_item_id INT NULL,
      rating TINYINT NOT NULL,
      title VARCHAR(150) NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_reviews_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,
      CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
      UNIQUE KEY unique_product_user (product_id, user_id)
    )
  `);
  console.log("reviews table created");
};

const createAddressesTable = async () => {
  if (await tableExists("addresses")) {
    if (!(await columnExists("addresses", "address_type"))) {
      await pool.query(
        `ALTER TABLE addresses ADD COLUMN address_type ENUM('Home','Work','Other') NOT NULL DEFAULT 'Home' AFTER pincode`
      );
      console.log("addresses table migrated (address_type)");
    }
    return;
  }

  await pool.query(`
    CREATE TABLE addresses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      address_line VARCHAR(255) NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pincode VARCHAR(10) NOT NULL,
      address_type ENUM('Home','Work','Other') NOT NULL DEFAULT 'Home',
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("addresses table created");
};

const createCartItemsTable = async () => {
  if (await tableExists("cart_items")) return;
  await pool.query(`
    CREATE TABLE cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_product (user_id, product_id),
      CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);
  console.log("cart_items table created");
};

const createWishlistItemsTable = async () => {
  if (await tableExists("wishlist_items")) return;
  await pool.query(`
    CREATE TABLE wishlist_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_product (user_id, product_id),
      CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);
  console.log("wishlist_items table created");
};

const createOrdersTable = async () => {
  if (await tableExists("orders")) return;
  await pool.query(`
    CREATE TABLE orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number VARCHAR(30) NOT NULL UNIQUE,
      user_id INT NOT NULL,
      status ENUM('PLACED','PACKED','SHIPPED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PLACED',
      payment_method ENUM('COD','CARD','UPI') NOT NULL,
      payment_status ENUM('PENDING','PAID','FAILED') NOT NULL DEFAULT 'PENDING',
      subtotal DECIMAL(10,2) NOT NULL,
      shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
      total DECIMAL(10,2) NOT NULL,
      shipping_name VARCHAR(100) NOT NULL,
      shipping_phone VARCHAR(20) NOT NULL,
      shipping_address VARCHAR(255) NOT NULL,
      shipping_city VARCHAR(100) NOT NULL,
      shipping_state VARCHAR(100) NOT NULL,
      shipping_pincode VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("orders table created");
};

const createOrderItemsTable = async () => {
  if (await tableExists("order_items")) return;
  await pool.query(`
    CREATE TABLE order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NULL,
      seller_id INT NOT NULL,
      product_name VARCHAR(150) NOT NULL,
      product_image VARCHAR(500),
      price DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL,
      item_status ENUM('PLACED','PACKED','SHIPPED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PLACED',
      CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    )
  `);
  console.log("order_items table created");
};

const seedAdmin = async () => {
  const [existingAdmins] = await pool.query(`SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1`);
  if (existingAdmins.length > 0) {
    console.log("Admin user already exists, skipping seed");
    return;
  }

  const adminPhone = process.env.ADMIN_PHONE || "9999999999";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  const adminEmail = process.env.ADMIN_EMAIL || `${adminPhone}@shopsphere.local`;
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await pool.query(
    `INSERT INTO users (name, email, password, phone, role, is_active)
     VALUES (?, ?, ?, ?, 'ADMIN', 1)`,
    ["ShopSphere Admin", adminEmail, hashedPassword, adminPhone]
  );

  console.log(`Admin user seeded — email: ${adminEmail}, password: ${adminPassword}`);
  console.log("Change ADMIN_EMAIL / ADMIN_PHONE / ADMIN_PASSWORD in .env before any real deployment.");
};

// ==========================================
// RUN
// ==========================================

const run = async () => {
  try {
    await migrateUsersTable();
    await migrateProductsTable();
    await createCategoriesTable();
    await migrateProductsCategoryId();
    await createProductImagesTable();
    await createAddressesTable();
    await createCartItemsTable();
    await createWishlistItemsTable();
    await createOrdersTable();
    await createOrderItemsTable();
    await createReviewsTable();
    await seedAdmin();

    console.log("\nMigration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("\nMigration failed:", error.message);
    process.exit(1);
  }
};

run();
