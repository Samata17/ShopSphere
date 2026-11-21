import { useEffect, useState } from "react";
import { FaBoxOpen } from "react-icons/fa";

import ProductCard from "../../components/products/ProductCard";
import ProductFilters from "../../components/products/ProductFilters";
import Pagination from "../../components/common/Pagination";
import SkeletonCard from "../../components/common/SkeletonCard";
import EmptyState from "../../components/common/EmptyState";
import { fetchProducts, fetchProductsPaginated } from "../../api/products";
import { categories } from "../../constants/categories";

import "../../styles/products.css";
import "../../styles/newArrivals.css";

const DEFAULT_FILTERS = {
  category: "All",
  brand: "All",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  inStock: "all",
};

const PAGE_SIZE = 12;

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allBrands, setAllBrands] = useState([]);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

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
  // FETCH NEW ARRIVALS ON ANY FILTER/PAGE CHANGE
  // ==========================================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = { page, limit: PAGE_SIZE, sort: "newest" };

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
        console.error("New arrivals fetch error:", err);
        setError("Unable to load new arrivals. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters, page]);

  const handleFilterChange = (patch) => {
    setFilters((previous) => ({ ...previous, ...patch }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  return (
    <main className="new-arrivals-page">
      <div className="new-arrivals-heading">
        <span>JUST IN</span>
        <h1>New Arrivals</h1>
        <p>Discover the latest products added to ShopSphere.</p>
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
              title="Unable to load new arrivals"
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
                  <ProductCard
                    key={product.id}
                    product={product}
                    badge={{ type: "new", label: "NEW" }}
                  />
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
              message="Try changing your category or filters."
              actionLabel="Clear Filters"
              onAction={resetFilters}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default NewArrivals;
