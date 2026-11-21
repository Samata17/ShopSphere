require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("../config/db");

// ==========================================
// DEMO ACCOUNTS
// ==========================================

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "Demo@123";

const SELLERS = [
  { name: "TechWorld Store", phone: "9800000001", email: "techworld.store@shopsphere.demo" },
  { name: "StyleHouse Retail", phone: "9800000002", email: "stylehouse.retail@shopsphere.demo" },
  { name: "Daily Basket Mart", phone: "9800000003", email: "dailybasket.mart@shopsphere.demo" },
];

const CUSTOMERS = [
  { name: "Anjali Verma", phone: "9800000011", email: "anjali.verma@shopsphere.demo" },
  { name: "Rohan Mehta", phone: "9800000012", email: "rohan.mehta@shopsphere.demo" },
];

// ==========================================
// IMAGE BANK (curated stable Unsplash CDN photos, per category)
// ==========================================

const IMG = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=75&auto=format&fit=crop`;

// Each product gets its own curated, verified image(s) — matched by content
// to the actual product, not pulled from a shared per-category pool. A
// shared pool caused semantic mismatches (e.g. a cycling photo assigned to
// "Professional Football") since 6 generic category photos can't correctly
// represent 6 different product types. Every ID below was downloaded and
// visually verified against its product before being added here.
const PRODUCT_IMAGES = {
  Electronics: [
    ["1496181133206-80ce9b88a853"], // UltraBook Pro 14 Laptop
    ["1505740420928-5e560c06d30e"], // Noise Cancelling Wireless Headphones
    ["1611755489400-3c53602ab783"], // 4K Ultra HD Smart TV
    ["1606841837239-c5a1a4a07af7"], // True Wireless Earbuds Pro
    ["1523275335684-37898b6baf30"], // Fitness Smartwatch Series 5
    ["1608043152269-423dbba4e7e1"], // Portable Bluetooth Speaker
  ],
  Mobiles: [
    ["1511707171634-5f897ff02aa9"], // Galaxy Nova 12 5G
    ["1592750475338-74b7b21085ab"], // Pixel Edge 8
    ["1580910051074-3eb694886505"], // iSpark 15 Lite
    ["1598327105666-5b89351aff97"], // Redline X2 Pro
    ["1587037542794-6ca5f4772330"], // Mobile Fast Charger 65W
    ["1623393884989-cb3663e431c5"], // Shockproof Phone Case Combo
  ],
  Fashion: [
    ["1521572163474-6864f9cf17ab"], // Men's Slim Fit Cotton Shirt
    ["1602303894456-398ce544d90b"], // Women's Floral Summer Dress
    ["1542291026-7eec264c27ff"], // Classic Running Sneakers
    ["1624687943971-e86af76d57de"], // Leather Handbag - Tote Style
    ["1543076447-215ad9ba6923"], // Men's Denim Jacket
    ["1567473810954-507d59716c25"], // Unisex Aviator Sunglasses
  ],
  Beauty: [
    ["1713768704571-6aeb0d0e5105"], // Vitamin C Brightening Serum
    ["1542452255191-c85a98f2c5d1"], // Matte Finish Lipstick Set
    ["1622910076411-b126ff7e469b"], // Hydrating Face Moisturizer
    ["1620464003286-a5b0d79f32c2"], // Professional Makeup Brush Set
    ["1701992678972-d5a053ad0fb0"], // Herbal Shampoo & Conditioner Combo
    ["1523293182086-7651a899d37f"], // Eau De Parfum - Floral Musk
  ],
  Books: [
    ["1544716278-ca5e3f4abd8c"], // The Silent Horizon (Fiction Novel)
    ["1512820790803-83ca734da794"], // Mastering Data Structures & Algorithms
    ["1481627834876-b7833e8f5570"], // Mindful Living: A Practical Guide
    ["1495446815901-a7297e633e8d"], // The Startup Blueprint
    ["1476275466078-4007374efbbe"], // History of Ancient Civilizations
    ["1524995997946-a1c2e315a42f"], // Illustrated Children's Story Collection
  ],
  Grocery: [
    ["1704916029292-ec7b5976204c"], // Organic Basmati Rice 5kg
    ["1474979266404-7eaacbcd87c5"], // Cold Pressed Groundnut Oil 1L
    ["1627820752174-acae1b399128"], // Assorted Dry Fruits Combo 500g
    ["1714842981153-ffeaf74e7a1a"], // Whole Wheat Atta 10kg
    ["1568832849324-167c62c7849b"], // Premium Masala Chai 250g
    ["1587049352851-8d4e89133924"], // Organic Honey 500g
  ],
  "Home & Kitchen": [
    ["1565452344518-47faca79dc69"], // Automatic Drip Coffee Maker
    ["1604414499020-f9ac575bc5ec"], // Non-Stick Cookware Set (5 Pcs)
    ["1610399809302-f1dd7ec33187"], // Stainless Steel Vacuum Flask 1L
    ["1558317374-067fb5f30001"], // Robotic Floor Cleaner
    ["1570974802254-4b0ad1a755f5"], // LED Study Table Lamp
    ["1584100936595-c0654b55a2e2"], // Memory Foam Bed Pillow (Set of 2)
  ],
  Sports: [
    ["1579952363873-27f3bade9f55"], // Professional Football
    ["1646239646963-b0b9be56d6b5"], // Yoga Mat with Carry Strap
    ["1725289767222-3444016c70ce"], // Adjustable Dumbbell Set 20kg
    ["1708312604109-16c0be9326cd"], // Badminton Racket Pro Combo
    ["1571008887538-b36bb32f4571"], // Running Shoes - Trail Edition
    ["1758791184255-411236a49346"], // Cricket Bat - English Willow
  ],
};

const pickImages = (category, index) =>
  PRODUCT_IMAGES[category][index].map(IMG);

// ==========================================
// CATEGORY -> SELLER ASSIGNMENT
// ==========================================

const CATEGORY_SELLER = {
  Electronics: 0,
  Mobiles: 0,
  Fashion: 1,
  Beauty: 1,
  Sports: 1,
  Books: 2,
  Grocery: 2,
  "Home & Kitchen": 2,
};

// ==========================================
// PRODUCT CATALOG
// ==========================================

const PRODUCTS = {
  Electronics: [
    { name: "UltraBook Pro 14 Laptop", brand: "Zentek", price: 68990, oldPrice: 74990, stock: 12, description: "14-inch laptop with 16GB RAM, 512GB SSD and all-day battery life for work and creativity." },
    { name: "Noise Cancelling Wireless Headphones", brand: "SonicWave", price: 4999, oldPrice: 6999, stock: 30, description: "Over-ear headphones with active noise cancellation and 30-hour battery life." },
    { name: "4K Ultra HD Smart TV 43-inch", brand: "Visiora", price: 27999, oldPrice: 32999, stock: 8, description: "43-inch 4K smart TV with HDR support and built-in streaming apps." },
    { name: "True Wireless Earbuds Pro", brand: "SonicWave", price: 2499, oldPrice: null, stock: 50, description: "Compact true wireless earbuds with punchy bass and a pocket-sized charging case." },
    { name: "Fitness Smartwatch Series 5", brand: "PulseFit", price: 5499, oldPrice: 6999, stock: 0, description: "Smartwatch with heart-rate tracking, SpO2 monitor and 7-day battery life." },
    { name: "Portable Bluetooth Speaker", brand: "BoomBox", price: 1999, oldPrice: null, stock: 40, description: "Rugged, water-resistant Bluetooth speaker with deep bass for indoor and outdoor use." },
  ],
  Mobiles: [
    { name: "Galaxy Nova 12 5G", brand: "Solstice", price: 24999, oldPrice: 27999, stock: 20, description: "5G smartphone with a 6.5-inch AMOLED display and a 108MP triple camera setup." },
    { name: "Pixel Edge 8", brand: "Nimbus", price: 45999, oldPrice: null, stock: 10, description: "Flagship smartphone with clean software, computational photography and 5 years of updates." },
    { name: "iSpark 15 Lite", brand: "Vortek", price: 59999, oldPrice: 64999, stock: 5, description: "Premium smartphone with a titanium frame and a pro-grade camera system." },
    { name: "Redline X2 Pro", brand: "Solstice", price: 15999, oldPrice: 17999, stock: 25, description: "Gaming-focused smartphone with a 144Hz display and a large 5000mAh battery." },
    { name: "Mobile Fast Charger 65W", brand: "PowerCell", price: 1299, oldPrice: null, stock: 60, description: "65W GaN fast charger that charges most phones to 50% in under 20 minutes." },
    { name: "Shockproof Phone Case Combo", brand: "ArmorGrip", price: 499, oldPrice: 799, stock: 100, description: "Military-grade shockproof case with a tempered glass screen protector included." },
  ],
  Fashion: [
    { name: "Men's Slim Fit Cotton Shirt", brand: "Urban Thread", price: 899, oldPrice: 1299, stock: 35, description: "Breathable slim-fit cotton shirt, perfect for office wear or casual outings." },
    { name: "Women's Floral Summer Dress", brand: "Blossom Studio", price: 1499, oldPrice: 1999, stock: 20, description: "Lightweight floral dress with a flattering A-line cut for warm-weather days." },
    { name: "Classic Running Sneakers", brand: "StrideOn", price: 2999, oldPrice: 3999, stock: 18, description: "Cushioned running sneakers with breathable mesh uppers and shock-absorbing soles." },
    { name: "Leather Handbag - Tote Style", brand: "Vaultier", price: 3499, oldPrice: null, stock: 12, description: "Genuine leather tote bag with spacious interior compartments and a magnetic clasp." },
    { name: "Men's Denim Jacket", brand: "Urban Thread", price: 2199, oldPrice: 2799, stock: 0, description: "Classic washed-denim jacket with a comfortable regular fit for everyday layering." },
    { name: "Unisex Aviator Sunglasses", brand: "SunNest", price: 799, oldPrice: 1099, stock: 45, description: "UV-protected aviator sunglasses with a lightweight metal frame." },
  ],
  Beauty: [
    { name: "Vitamin C Brightening Serum", brand: "GlowRoot", price: 699, oldPrice: 899, stock: 60, description: "Antioxidant-rich serum that brightens skin tone and reduces dark spots over time." },
    { name: "Matte Finish Lipstick Set", brand: "ColorPop", price: 599, oldPrice: null, stock: 40, description: "Long-lasting matte lipstick set in 4 everyday shades." },
    { name: "Hydrating Face Moisturizer", brand: "GlowRoot", price: 449, oldPrice: 599, stock: 55, description: "Lightweight, non-greasy moisturizer that keeps skin hydrated all day." },
    { name: "Professional Makeup Brush Set", brand: "ColorPop", price: 999, oldPrice: 1399, stock: 25, description: "12-piece makeup brush set with soft synthetic bristles and a travel pouch." },
    { name: "Herbal Shampoo & Conditioner Combo", brand: "PureLeaf", price: 549, oldPrice: null, stock: 0, description: "Sulphate-free herbal shampoo and conditioner combo for smooth, frizz-free hair." },
    { name: "Eau De Parfum - Floral Musk", brand: "Essence Noir", price: 1899, oldPrice: 2299, stock: 15, description: "Long-lasting floral musk fragrance with soft, warm undertones." },
  ],
  Books: [
    { name: "The Silent Horizon (Fiction Novel)", brand: "Penview Publications", price: 349, oldPrice: 499, stock: 30, description: "A gripping fiction novel about resilience, family and second chances." },
    { name: "Mastering Data Structures & Algorithms", brand: "TechPress", price: 599, oldPrice: null, stock: 25, description: "A practical, example-driven guide to data structures and algorithms for interviews." },
    { name: "Mindful Living: A Practical Guide", brand: "Sage House", price: 299, oldPrice: 399, stock: 40, description: "A practical guide to building mindfulness habits into everyday life." },
    { name: "The Startup Blueprint", brand: "Ventura Books", price: 449, oldPrice: 599, stock: 18, description: "Lessons from founders on building and scaling early-stage startups." },
    { name: "History of Ancient Civilizations", brand: "Penview Publications", price: 799, oldPrice: null, stock: 10, description: "An illustrated deep dive into the world's earliest great civilizations." },
    { name: "Illustrated Children's Story Collection", brand: "Little Sprout", price: 399, oldPrice: 549, stock: 22, description: "A colourful collection of bedtime stories for young readers." },
  ],
  Grocery: [
    { name: "Organic Basmati Rice 5kg", brand: "FarmFresh", price: 649, oldPrice: 749, stock: 80, description: "Premium long-grain organic basmati rice, aged for extra aroma." },
    { name: "Cold Pressed Groundnut Oil 1L", brand: "FarmFresh", price: 259, oldPrice: null, stock: 70, description: "Naturally extracted cold-pressed groundnut oil with no additives." },
    { name: "Assorted Dry Fruits Combo 500g", brand: "NutraHarvest", price: 549, oldPrice: 699, stock: 40, description: "A healthy mix of almonds, cashews, raisins and walnuts." },
    { name: "Whole Wheat Atta 10kg", brand: "GrainMill", price: 449, oldPrice: null, stock: 60, description: "Stone-ground whole wheat flour for soft, fluffy rotis." },
    { name: "Premium Masala Chai 250g", brand: "Chaiwala's", price: 199, oldPrice: 249, stock: 0, description: "A rich blend of Assam tea leaves with hand-ground aromatic spices." },
    { name: "Organic Honey 500g", brand: "NutraHarvest", price: 349, oldPrice: 429, stock: 35, description: "Raw, unprocessed organic honey sourced from forest apiaries." },
  ],
  "Home & Kitchen": [
    { name: "Automatic Drip Coffee Maker", brand: "BrewHouse", price: 2499, oldPrice: 2999, stock: 15, description: "12-cup programmable drip coffee maker with a keep-warm plate." },
    { name: "Non-Stick Cookware Set (5 Pcs)", brand: "CulinaPro", price: 1999, oldPrice: 2599, stock: 20, description: "Durable non-stick cookware set including pans and a wok, safe for all stovetops." },
    { name: "Stainless Steel Vacuum Flask 1L", brand: "ThermoKeep", price: 599, oldPrice: null, stock: 50, description: "Double-walled vacuum flask that keeps drinks hot or cold for up to 12 hours." },
    { name: "Robotic Floor Cleaner", brand: "CleanBot", price: 12999, oldPrice: 15999, stock: 6, description: "Smart robotic vacuum with app control and automatic charging dock return." },
    { name: "LED Study Table Lamp", brand: "Luminix", price: 799, oldPrice: 999, stock: 30, description: "Adjustable LED desk lamp with 3 brightness modes and a flicker-free display." },
    { name: "Memory Foam Bed Pillow (Set of 2)", brand: "SnoozeWell", price: 899, oldPrice: 1199, stock: 0, description: "Ergonomic memory foam pillows that contour to your head and neck." },
  ],
  Sports: [
    { name: "Professional Football", brand: "KickForce", price: 999, oldPrice: 1299, stock: 25, description: "Match-quality football with a durable stitched outer cover." },
    { name: "Yoga Mat with Carry Strap", brand: "FlexCore", price: 799, oldPrice: null, stock: 40, description: "Non-slip, extra-thick yoga mat with a lightweight carry strap." },
    { name: "Adjustable Dumbbell Set 20kg", brand: "IronPeak", price: 3499, oldPrice: 4199, stock: 10, description: "Space-saving adjustable dumbbell pair, ideal for home workouts." },
    { name: "Badminton Racket Pro Combo", brand: "SmashLine", price: 1299, oldPrice: 1699, stock: 18, description: "Lightweight carbon-fibre racket pair with shuttlecocks and a carry bag." },
    { name: "Running Shoes - Trail Edition", brand: "StrideOn", price: 2799, oldPrice: 3299, stock: 0, description: "Trail running shoes with reinforced grip soles for uneven terrain." },
    { name: "Cricket Bat - English Willow", brand: "KickForce", price: 4499, oldPrice: 5499, stock: 8, description: "Grade-A English willow cricket bat, hand-crafted for a balanced pickup." },
  ],
};

// ==========================================
// DEMO REVIEW CONTENT POOL
// ==========================================

const REVIEW_POOL = [
  { rating: 5, title: "Excellent purchase", comment: "Exactly as described and arrived quickly. Really happy with the quality." },
  { rating: 4, title: "Good value for money", comment: "Works well overall, a couple of minor quirks but nothing major." },
  { rating: 5, title: "Highly recommended", comment: "Exceeded my expectations. Would definitely buy again from this seller." },
  { rating: 4, title: "Solid product", comment: "Does what it promises. Packaging was good and delivery was on time." },
  { rating: 3, title: "Decent, not amazing", comment: "It's okay for the price, but I expected slightly better build quality." },
];

// ==========================================
// HELPERS
// ==========================================

const getOrCreateUser = async ({ name, phone, email, role }) => {
  const [existing] = await pool.query(`SELECT id FROM users WHERE phone = ?`, [phone]);
  if (existing.length > 0) return existing[0].id;

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password, phone, role, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
    [name, email, hashedPassword, phone, role]
  );
  console.log(`  seeded ${role} "${name}" — email: ${email}, password: ${DEMO_PASSWORD}`);
  return result.insertId;
};

const getCategoryId = async (name) => {
  const [rows] = await pool.query(`SELECT id FROM categories WHERE name = ?`, [name]);
  if (rows.length === 0) throw new Error(`Category "${name}" not found — run migrate.js first`);
  return rows[0].id;
};

// ==========================================
// SEED PRODUCTS
// ==========================================

const seedProducts = async (sellerIds) => {
  const insertedByCategory = {};

  for (const [category, items] of Object.entries(PRODUCTS)) {
    const sellerId = sellerIds[CATEGORY_SELLER[category]];
    const categoryId = await getCategoryId(category);

    const [[{ count }]] = await pool.query(
      `SELECT COUNT(*) AS count FROM products WHERE seller_id = ? AND category_id = ?`,
      [sellerId, categoryId]
    );

    if (count > 0) {
      console.log(`  skipping "${category}" — seller already has products in this category`);
      const [existingIds] = await pool.query(
        `SELECT id FROM products WHERE seller_id = ? AND category_id = ? ORDER BY id LIMIT ?`,
        [sellerId, categoryId, items.length]
      );
      insertedByCategory[category] = existingIds.map((r) => r.id);
      continue;
    }

    const ids = [];

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const images = pickImages(category, i);
      const thumbnail = images[0];

      const [result] = await pool.query(
        `INSERT INTO products
         (seller_id, name, description, category, category_id, brand, price, old_price, stock, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sellerId,
          item.name,
          item.description,
          category,
          categoryId,
          item.brand,
          item.price,
          item.oldPrice,
          item.stock,
          thumbnail,
        ]
      );

      const productId = result.insertId;
      ids.push(productId);

      for (let imgIndex = 0; imgIndex < images.length; imgIndex += 1) {
        await pool.query(
          `INSERT INTO product_images (product_id, image_url, sort_order, is_thumbnail) VALUES (?, ?, ?, ?)`,
          [productId, images[imgIndex], imgIndex, imgIndex === 0 ? 1 : 0]
        );
      }
    }

    insertedByCategory[category] = ids;
    console.log(`  seeded ${items.length} products in "${category}"`);
  }

  return insertedByCategory;
};

// ==========================================
// SEED DEMO ORDERS + REVIEWS (verified purchases)
// ==========================================

const seedDemoOrdersAndReviews = async (productIdsByCategory, customerIds) => {
  const [[{ count }]] = await pool.query(`SELECT COUNT(*) AS count FROM reviews`);
  if (count > 0) {
    console.log("  reviews already exist, skipping demo orders/reviews seed");
    return;
  }

  const [addressRows] = await pool.query(
    `SELECT id FROM addresses WHERE user_id = ? LIMIT 1`,
    [customerIds[0]]
  );

  let reviewIndex = 0;

  const createDeliveredOrderItem = async (customerId, productId) => {
    const [[product]] = await pool.query(
      `SELECT seller_id, name, image_url, price FROM products WHERE id = ?`,
      [productId]
    );

    const orderNumber = `SEED-${Date.now()}-${productId}-${customerId}`;

    const [orderResult] = await pool.query(
      `INSERT INTO orders
       (order_number, user_id, status, payment_method, payment_status,
        subtotal, shipping_fee, total,
        shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode)
       VALUES (?, ?, 'DELIVERED', 'COD', 'PAID', ?, 0, ?, 'Demo Customer', '9800000011', 'Demo Address', 'Demo City', 'Demo State', '000000')`,
      [orderNumber, customerId, product.price, product.price]
    );

    const [itemResult] = await pool.query(
      `INSERT INTO order_items
       (order_id, product_id, seller_id, product_name, product_image, price, quantity, item_status)
       VALUES (?, ?, ?, ?, ?, ?, 1, 'DELIVERED')`,
      [orderResult.insertId, productId, product.seller_id, product.name, product.image_url, product.price]
    );

    return itemResult.insertId;
  };

  const addReview = async (customerId, productId, orderItemId) => {
    const review = REVIEW_POOL[reviewIndex % REVIEW_POOL.length];
    reviewIndex += 1;

    await pool.query(
      `INSERT IGNORE INTO reviews (product_id, user_id, order_item_id, rating, title, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [productId, customerId, orderItemId, review.rating, review.title, review.comment]
    );
  };

  for (const [, productIds] of Object.entries(productIdsByCategory)) {
    const reviewedProducts = productIds.slice(0, 2);

    for (let i = 0; i < reviewedProducts.length; i += 1) {
      const productId = reviewedProducts[i];

      const orderItemId1 = await createDeliveredOrderItem(customerIds[0], productId);
      await addReview(customerIds[0], productId, orderItemId1);

      if (i === 0) {
        const orderItemId2 = await createDeliveredOrderItem(customerIds[1], productId);
        await addReview(customerIds[1], productId, orderItemId2);
      }
    }
  }

  void addressRows;
  console.log("  seeded demo delivered orders + reviews");
};

// ==========================================
// RUN
// ==========================================

const run = async () => {
  try {
    console.log("Seeding demo sellers...");
    const sellerIds = [];
    for (const seller of SELLERS) {
      sellerIds.push(await getOrCreateUser({ ...seller, role: "SELLER" }));
    }

    console.log("Seeding demo customers...");
    const customerIds = [];
    for (const customer of CUSTOMERS) {
      customerIds.push(await getOrCreateUser({ ...customer, role: "CUSTOMER" }));
    }

    console.log("Seeding products...");
    const productIdsByCategory = await seedProducts(sellerIds);

    console.log("Seeding demo orders + reviews...");
    await seedDemoOrdersAndReviews(productIdsByCategory, customerIds);

    console.log("\nSeed completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("\nSeed failed:", error.message);
    process.exit(1);
  }
};

run();
