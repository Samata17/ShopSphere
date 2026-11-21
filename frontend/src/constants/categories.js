import smartphone from "../assets/products/smartphone.png";
import handbag from "../assets/products/handbag.png";
import coffeeMaker from "../assets/products/coffee-maker.png";
import airFryer from "../assets/products/air-fryer.png";
import novel from "../assets/products/novel.png";
import skincare from "../assets/products/skincare.png";
import football from "../assets/products/football.png";

// Single source of truth for the category taxonomy used across the app:
// Navbar, the Categories page/section, product filters, and the seller
// Add/Edit product forms all import from here. Ids are fixed to match the
// `categories` table seeded by backend/src/db/migrate.js exactly, so the
// seller/admin forms can send categoryId directly without an extra fetch.
export const categories = [
  {
    id: 1,
    name: "Electronics",
    icon: "💻",
    image: smartphone,
    description: "Explore the latest gadgets and electronics",
  },
  {
    id: 2,
    name: "Mobiles",
    icon: "📱",
    image: smartphone,
    description: "Smartphones and mobile accessories",
  },
  {
    id: 3,
    name: "Fashion",
    icon: "👕",
    image: handbag,
    description: "Discover styles you'll love",
  },
  {
    id: 4,
    name: "Beauty",
    icon: "💄",
    image: skincare,
    description: "Beauty and skincare essentials",
  },
  {
    id: 5,
    name: "Books",
    icon: "📚",
    image: novel,
    description: "Bestsellers and page-turners",
  },
  {
    id: 6,
    name: "Grocery",
    icon: "🛒",
    image: airFryer,
    description: "Everyday grocery and household essentials",
  },
  {
    id: 7,
    name: "Home & Kitchen",
    icon: "🏠",
    image: coffeeMaker,
    description: "Everything you need for your home",
  },
  {
    id: 8,
    name: "Sports",
    icon: "⚽",
    image: football,
    description: "Gear up and stay active",
  },
];

export const categoryNames = categories.map((category) => category.name);
