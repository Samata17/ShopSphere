// One-off backfill: updates images for products that were already seeded
// with the old, mismatched IMAGE_BANK scheme. Matches by product name (not
// delete/recreate) so existing product IDs — and anything referencing them
// (cart_items, wishlist_items, order_items, reviews) — stay intact.
require("dotenv").config();

const pool = require("../config/db");

const IMG = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=75&auto=format&fit=crop`;

const PRODUCT_IMAGES = {
  Electronics: {
    "4K Ultra HD Smart TV 43-inch": ["1611755489400-3c53602ab783"],
    "True Wireless Earbuds Pro": ["1606841837239-c5a1a4a07af7"],
    "Portable Bluetooth Speaker": ["1608043152269-423dbba4e7e1"],
  },
  Mobiles: {
    "Mobile Fast Charger 65W": ["1587037542794-6ca5f4772330"],
    "Shockproof Phone Case Combo": ["1623393884989-cb3663e431c5"],
  },
  Fashion: {
    "Women's Floral Summer Dress": ["1602303894456-398ce544d90b"],
    "Leather Handbag - Tote Style": ["1624687943971-e86af76d57de"],
    "Men's Denim Jacket": ["1543076447-215ad9ba6923"],
    "Unisex Aviator Sunglasses": ["1567473810954-507d59716c25"],
  },
  Beauty: {
    "Vitamin C Brightening Serum": ["1713768704571-6aeb0d0e5105"],
    "Matte Finish Lipstick Set": ["1542452255191-c85a98f2c5d1"],
    "Hydrating Face Moisturizer": ["1622910076411-b126ff7e469b"],
    "Professional Makeup Brush Set": ["1620464003286-a5b0d79f32c2"],
    "Herbal Shampoo & Conditioner Combo": ["1701992678972-d5a053ad0fb0"],
    "Eau De Parfum - Floral Musk": ["1523293182086-7651a899d37f"],
  },
  Grocery: {
    "Organic Basmati Rice 5kg": ["1704916029292-ec7b5976204c"],
    "Cold Pressed Groundnut Oil 1L": ["1474979266404-7eaacbcd87c5"],
    "Assorted Dry Fruits Combo 500g": ["1627820752174-acae1b399128"],
    "Whole Wheat Atta 10kg": ["1714842981153-ffeaf74e7a1a"],
    "Premium Masala Chai 250g": ["1568832849324-167c62c7849b"],
    "Organic Honey 500g": ["1587049352851-8d4e89133924"],
  },
  "Home & Kitchen": {
    "Automatic Drip Coffee Maker": ["1565452344518-47faca79dc69"],
    "Non-Stick Cookware Set (5 Pcs)": ["1604414499020-f9ac575bc5ec"],
    "Stainless Steel Vacuum Flask 1L": ["1610399809302-f1dd7ec33187"],
    "Robotic Floor Cleaner": ["1558317374-067fb5f30001"],
    "LED Study Table Lamp": ["1570974802254-4b0ad1a755f5"],
    "Memory Foam Bed Pillow (Set of 2)": ["1584100936595-c0654b55a2e2"],
  },
  Sports: {
    "Professional Football": ["1579952363873-27f3bade9f55"],
    "Yoga Mat with Carry Strap": ["1646239646963-b0b9be56d6b5"],
    "Adjustable Dumbbell Set 20kg": ["1725289767222-3444016c70ce"],
    "Badminton Racket Pro Combo": ["1708312604109-16c0be9326cd"],
    "Cricket Bat - English Willow": ["1758791184255-411236a49346"],
  },
};

const run = async () => {
  let updated = 0;
  let skipped = 0;

  try {
    for (const [category, products] of Object.entries(PRODUCT_IMAGES)) {
      for (const [name, ids] of Object.entries(products)) {
        const images = ids.map(IMG);
        const thumbnail = images[0];

        const [rows] = await pool.query(
          `SELECT id FROM products WHERE name = ? AND category = ?`,
          [name, category]
        );

        if (rows.length === 0) {
          console.log(`  skip (not found): "${name}" [${category}]`);
          skipped += 1;
          continue;
        }

        for (const row of rows) {
          await pool.query(`UPDATE products SET image_url = ? WHERE id = ?`, [
            thumbnail,
            row.id,
          ]);

          await pool.query(`DELETE FROM product_images WHERE product_id = ?`, [
            row.id,
          ]);

          for (let i = 0; i < images.length; i += 1) {
            await pool.query(
              `INSERT INTO product_images (product_id, image_url, sort_order, is_thumbnail) VALUES (?, ?, ?, ?)`,
              [row.id, images[i], i, i === 0 ? 1 : 0]
            );
          }

          console.log(`  updated: "${name}" [${category}] (product id ${row.id})`);
          updated += 1;
        }
      }
    }

    console.log(`\nDone. Updated ${updated} product(s), skipped ${skipped} not found.`);
    process.exit(0);
  } catch (error) {
    console.error("\nfixProductImages failed:", error.message);
    process.exit(1);
  }
};

run();
