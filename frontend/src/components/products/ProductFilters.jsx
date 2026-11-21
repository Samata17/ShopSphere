import { FaStar } from "react-icons/fa";

const RATING_OPTIONS = [4, 3, 2, 1];

function ProductFilters({ categories, brands, filters, onChange, onClear }) {
  const hasActiveFilters =
    filters.category !== "All" ||
    filters.brand !== "All" ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating ||
    filters.inStock !== "all";

  return (
    <aside className="filters-sidebar">
      <div className="filters-sidebar-header">
        <h3>Filters</h3>

        {hasActiveFilters && (
          <button type="button" className="clear-filters-btn" onClick={onClear}>
            Clear All
          </button>
        )}
      </div>

      {/* CATEGORY */}
      <div className="filter-section">
        <h4>Category</h4>

        <div className="filter-option-list">
          <button
            type="button"
            className={`filter-option ${filters.category === "All" ? "active" : ""}`}
            onClick={() => onChange({ category: "All" })}
          >
            All Categories
          </button>

          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={`filter-option ${filters.category === category.name ? "active" : ""}`}
              onClick={() => onChange({ category: category.name })}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* BRAND */}
      {brands.length > 0 && (
        <div className="filter-section">
          <h4>Brand</h4>

          <div className="filter-option-list">
            <button
              type="button"
              className={`filter-option ${filters.brand === "All" ? "active" : ""}`}
              onClick={() => onChange({ brand: "All" })}
            >
              All Brands
            </button>

            {brands.map((brand) => (
              <button
                type="button"
                key={brand}
                className={`filter-option ${filters.brand === brand ? "active" : ""}`}
                onClick={() => onChange({ brand })}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PRICE RANGE */}
      <div className="filter-section">
        <h4>Price Range</h4>

        <div className="filter-price-inputs">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
          />

          <span>to</span>

          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
          />
        </div>
      </div>

      {/* RATING */}
      <div className="filter-section">
        <h4>Customer Rating</h4>

        <div className="filter-option-list">
          <button
            type="button"
            className={`filter-option ${!filters.minRating ? "active" : ""}`}
            onClick={() => onChange({ minRating: "" })}
          >
            All Ratings
          </button>

          {RATING_OPTIONS.map((rating) => (
            <button
              type="button"
              key={rating}
              className={`filter-option ${
                Number(filters.minRating) === rating ? "active" : ""
              }`}
              onClick={() => onChange({ minRating: String(rating) })}
            >
              {rating}
              <FaStar className="filter-star" /> & up
            </button>
          ))}
        </div>
      </div>

      {/* AVAILABILITY */}
      <div className="filter-section">
        <h4>Availability</h4>

        <div className="filter-option-list">
          {[
            { value: "all", label: "All" },
            { value: "true", label: "In Stock" },
            { value: "false", label: "Out of Stock" },
          ].map((option) => (
            <button
              type="button"
              key={option.value}
              className={`filter-option ${filters.inStock === option.value ? "active" : ""}`}
              onClick={() => onChange({ inStock: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default ProductFilters;
