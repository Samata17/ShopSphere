import { motion } from "framer-motion";

function CategoryCard({ category }) {
  return (
    <motion.div
      className="category-card"
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ duration: 0.25 }}
    >
      <div className="category-icon">{category.icon}</div>

      <h3>{category.name}</h3>
    </motion.div>
  );
}

export default CategoryCard;