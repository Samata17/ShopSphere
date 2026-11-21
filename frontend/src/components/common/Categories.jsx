import CategoryCard from "./CategoryCard";
import { categories } from "../../constants/categories";

function Categories() {
  return (
    <section className="categories">
      <h2>Shop by Category</h2>

      <p className="section-subtitle">
        Explore products across our most popular categories.
      </p>

      <div className="category-grid">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
          />
        ))}
      </div>
    </section>
  );
}

export default Categories;