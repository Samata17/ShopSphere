import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaBoxOpen } from "react-icons/fa";

import ProductCard from "../../components/products/ProductCard";
import ProductFilters from "../../components/products/ProductFilters";
import Pagination from "../../components/common/Pagination";
import SkeletonCard from "../../components/common/SkeletonCard";
import EmptyState from "../../components/common/EmptyState";
import { fetchProducts, fetchProductsPaginated } from "../../api/products";
import { categories } from "../../constants/categories";
import "../../styles/products.css";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "bestselling", label: "Best Selling" },
  { value: "name_asc", label: "Alphabetical (A-Z)" },
];

const DEFAULT_FILTERS = {
  category: "All",
  brand: "All",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  inStock: "all",
};

const PAGE_SIZE = 12;

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allBrands, setAllBrands] = useState([]);

  const searchTerm = searchParams.get("search") || "";

  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    category: searchParams.get("category") || "All",
  });

  const [sortOption, setSortOption] = useState("newest");
  const [page, setPage] = useState(1);

  // ==========================================
  // RE-SYNC CATEGORY FILTER WHEN THE URL CHANGES
  // (Navbar links all point to /products?category=..., so clicking a new
  // category while already on this page changes the query string without
  // remounting the component — filters state needs to follow it.)
  // ==========================================

  const categoryParam = searchParams.get("category") || "All";

  useEffect(() => {
    setFilters((previous) =>
      previous.category === categoryParam
        ? previous
        : { ...previous, category: categoryParam }
    );
    setPage(1);
  }, [categoryParam]);

  // ==========================================
  // LOAD THE FULL BRAND LIST ONCE (for the filter sidebar)
  // ==========================================

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const all = await fetchProducts();
        const brandSet = new Set(all.map((p) => p.brand).filter(Boolean));
        setAllBrands([...brandSet].sort());
      } catch (err) {
        console.error("Brand list fetch error:", err);
      }
    };

    loadBrands();
  }, []);

  // ==========================================
  // FETCH PRODUCTS ON ANY FILTER/SORT/PAGE/SEARCH CHANGE
  // ==========================================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit: PAGE_SIZE,
          sort: sortOption,
        };

        if (searchTerm) params.search = searchTerm;
        if (filters.category !== "All") params.category = filters.category;
        if (filters.brand !== "All") params.brand = filters.brand;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.minRating) params.minRating = filters.minRating;
        if (filters.inStock !== "all") params.inStock = filters.inStock;

        const data = await fetchProductsPaginated(params);
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Product fetch error:", err);
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchTerm, filters, sortOption, page]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleFilterChange = (patch) => {
    setFilters((previous) => ({ ...previous, ...patch }));
    setPage(1);

    if (patch.category !== undefined) {
      // Picking a category (from the sidebar, same as the Navbar) should
      // always produce the same result set as a fresh Navbar link — clear
      // any leftover search term instead of silently ANDing it in.
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("search");
      if (patch.category === "All") newParams.delete("category");
      else newParams.set("category", patch.category);
      setSearchParams(newParams);
    }
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSortOption("newest");
    setPage(1);
    setSearchParams({});
  };

  const activeCategory = filters.category;

  return (
    <div className="products-page">
      <div className="products-heading">
        <h1>Our Products</h1>

        {searchTerm ? (
          <p>
            Search results for <strong>&quot;{searchTerm}&quot;</strong>
          </p>
        ) : activeCategory !== "All" ? (
          <p>
            Showing <strong>{activeCategory}</strong> products
          </p>
        ) : (
          <p>Discover products you&apos;ll love</p>
        )}
      </div>

      <div className="products-toolbar">
        <div className="product-toolbar-controls">
          <div className="product-sort">
            <label htmlFor="product-sort">Sort:</label>

            <select
              id="product-sort"
              value={sortOption}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="products-layout">
        <ProductFilters
          categories={categories}
          brands={allBrands}
          filters={filters}
          onChange={handleFilterChange}
          onClear={resetFilters}
        />

        <div className="products-main">
          <div className="products-result-info">
            <span>
              {pagination ? pagination.total : 0}{" "}
              {pagination?.total === 1 ? "product" : "products"} found
            </span>
          </div>

          {error ? (
            <EmptyState
              icon={<FaBoxOpen />}
              title="Unable to load products"
              message={error}
              actionLabel="Try Again"
              onAction={() => window.location.reload()}
            />
          ) : loading ? (
            <div className="products-grid">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <Pagination
                page={pagination?.page || 1}
                totalPages={pagination?.totalPages || 1}
                onPageChange={setPage}
              />
            </>
          ) : (
            <EmptyState
              icon={<FaBoxOpen />}
              title="No products found"
              message="Try changing your category, search or filters."
              actionLabel="Clear Filters"
              onAction={resetFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;
