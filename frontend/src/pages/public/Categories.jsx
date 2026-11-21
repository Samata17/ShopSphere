import { useNavigate } from "react-router-dom";

import { categories } from "../../constants/categories";

import "../../styles/categories.css";

function Categories() {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="categories-page">
      <div className="categories-heading">
        <h1>Shop by Category</h1>
        <p>Find exactly what you're looking for</p>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <div
            className="category-card"
            key={category.id}
            onClick={() => handleCategoryClick(category.name)}
          >
            <div className="category-image-container">
              <img src={category.image} alt={category.name} />
            </div>

            <div className="category-content">
              <h2>{category.name}</h2>
              <p>{category.description}</p>

              <button type="button">Shop Now →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;
