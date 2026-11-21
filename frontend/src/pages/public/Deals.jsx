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
import "../../styles/deals.css";

const DEFAULT_FILTERS = {
  category: "All",
  brand: "All",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  inStock: "all",
};

const PAGE_SIZE = 12;

function Deals() {
  const [deals, setDeals] = useState([]);
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
  // FETCH DEALS ON ANY FILTER/PAGE CHANGE
  // ==========================================

  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        setError("");

        const params = { page, limit: PAGE_SIZE, deals: true };

        if (filters.category !== "All") params.category = filters.category;
        if (filters.brand !== "All") params.brand = filters.brand;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.minRating) params.minRating = filters.minRating;
        if (filters.inStock !== "all") params.inStock = filters.inStock;

        const data = await fetchProductsPaginated(params);
        setDeals(data.products);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Deals fetch error:", err);
        setError("Unable to load deals. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
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
    <div className="deals-page">
      <div className="deals-heading">
        <span className="deal-label">LIMITED TIME OFFERS</span>
        <h1>Hot Deals 🔥</h1>
        <p>Grab your favorites at amazing prices before they're gone.</p>
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
              {pagination?.total === 1 ? "deal" : "deals"} found
            </span>
          </div>

          {error ? (
            <EmptyState
              icon={<FaBoxOpen />}
              title="Unable to load deals"
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
          ) : deals.length > 0 ? (
            <>
              <div className="products-grid">
                {deals.map((product) => {
                  const discountPercent = product.oldPrice
                    ? Math.round(
                        ((product.oldPrice - product.price) /
                          product.oldPrice) *
                          100
                      )
                    : 0;

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      badge={{
                        type: "discount",
                        label: `${discountPercent}% OFF`,
                      }}
                    />
                  );
                })}
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
              title="No deals found"
              message="Try changing your category or filters."
              actionLabel="Clear Filters"
              onAction={resetFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Deals;
