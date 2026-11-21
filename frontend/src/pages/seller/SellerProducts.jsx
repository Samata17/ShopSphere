import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { toast } from "react-toastify";

import {
  FaShoppingBag,
  FaThLarge,
  FaBoxOpen,
  FaPlusCircle,
  FaBoxes,
  FaUser,
  FaSignOutAlt,
  FaSearch,
  FaBell,
  FaChevronDown,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaFilter,
  FaExclamationTriangle,
  FaClipboardList,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { getSellerProducts, deleteSellerProduct } from "../../api/seller";
import { categories } from "../../constants/categories";
import { resolveImageUrl } from "../../utils/image";

import "../../styles/sellerProducts.css";

function SellerProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/seller/login", { replace: true });
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getSellerProducts();
      setProducts(data);
    } catch (error) {
      console.error("Get seller products error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // =========================================
  // FILTER STATE
  // =========================================

  const [searchTerm, setSearchTerm] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  // =========================================
  // DELETE PRODUCT
  // =========================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteSellerProduct(id);

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id)
      );
      toast.success("Product deleted");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not delete this product"
      );
    }
  };

  // =========================================
  // EDIT PRODUCT
  // =========================================

  const handleEdit = (id) => {
    navigate(`/seller/edit-product/${id}`);
  };

  // =========================================
  // FILTER PRODUCTS
  // =========================================

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const search =
        searchTerm.toLowerCase().trim();

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search) ||
        product.category
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        categoryFilter === "All" ||
        product.category === categoryFilter;

      const productStatus = product.is_active ? "Active" : "Inactive";

      const matchesStatus =
        statusFilter === "All" ||
        productStatus === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    products,
    searchTerm,
    categoryFilter,
    statusFilter,
  ]);

  // =========================================
  // STOCK STATUS
  // =========================================

  const getStockStatus = (stock) => {
    if (stock === 0) {
      return {
        text: "Out of Stock",
        className: "out",
      };
    }

    if (stock <= 5) {
      return {
        text: "Low Stock",
        className: "low",
      };
    }

    return {
      text: "In Stock",
      className: "stock",
    };
  };

  return (
    <div className="seller-products-layout">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="seller-products-sidebar">

        {/* LOGO */}

        <Link
          to="/seller/dashboard"
          className="seller-products-logo"
        >
          <div className="seller-products-logo-icon">
            <FaShoppingBag />
          </div>

          <div>
            <h2>ShopSphere</h2>
            <span>Seller Panel</span>
          </div>
        </Link>

        <div className="seller-products-divider" />

        <p className="seller-products-menu-title">
          SELLER PANEL
        </p>

        {/* =========================================
            MENU
        ========================================= */}

        <nav className="seller-products-menu">

          {/* DASHBOARD */}

          <Link
            to="/seller/dashboard"
            className="seller-products-menu-item"
          >
            <FaThLarge />
            <span>Dashboard</span>
          </Link>

          {/* MY PRODUCTS */}

          <Link
            to="/seller/products"
            className={`seller-products-menu-item ${
              location.pathname ===
              "/seller/products"
                ? "active"
                : ""
            }`}
          >
            <FaBoxOpen />
            <span>My Products</span>
          </Link>

          {/* ADD PRODUCT */}

          <Link
            to="/seller/add-product"
            className="seller-products-menu-item"
          >
            <FaPlusCircle />
            <span>Add Product</span>
          </Link>

          {/* ORDERS */}

          <Link
            to="/seller/orders"
            className={`seller-products-menu-item ${
              location.pathname.startsWith(
                "/seller/orders"
              )
                ? "active"
                : ""
            }`}
          >
            <FaClipboardList />
            <span>Orders</span>
          </Link>

          {/* VIEW PRODUCTS */}

          <Link
            to="/products"
            className="seller-products-menu-item"
          >
            <FaEye />
            <span>View Products</span>
          </Link>

          {/* INVENTORY */}

          <Link
            to="/seller/products"
            className="seller-products-menu-item"
          >
            <FaBoxes />
            <span>Inventory</span>
          </Link>

          {/* SELLER ACCOUNT */}

          <button
            type="button"
            className="seller-products-menu-item"
          >
            <FaUser />
            <span>Seller Account</span>
          </button>

        </nav>

        {/* =========================================
            BUSINESS CARD
        ========================================= */}

        <div className="seller-products-business-card">

          <div>
            <FaShoppingBag />
          </div>

          <strong>
            Grow Your Business
          </strong>

          <p>
            Keep your product information and stock
            updated.
          </p>

          <Link to="/seller/add-product">
            Add Product
          </Link>

        </div>
{/* =========================================
    LOGOUT
========================================= */}

<button
  type="button"
  className="seller-products-logout"
  onClick={handleLogout}
>
  <FaSignOutAlt />
  <span>Logout</span>
</button>
        
      </aside>

      {/* =========================================
          MAIN
      ========================================= */}

      <div className="seller-products-main">

        {/* =========================================
            TOPBAR
        ========================================= */}

        <header className="seller-products-topbar">

          <div className="seller-products-top-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

          </div>

          <div className="seller-products-top-actions">

            <button
              type="button"
              className="seller-products-notification"
              aria-label="Notifications"
            >
              <FaBell />
              <span>2</span>
            </button>

            <div className="seller-products-account">

              <div className="seller-products-avatar">
                <FaUser />
              </div>

              <div className="seller-products-account-info">
                <strong>Seller Account</strong>
                <small>Seller</small>
              </div>

              <FaChevronDown />

            </div>

          </div>

        </header>

        {/* =========================================
            PAGE CONTENT
        ========================================= */}

        <main className="seller-products-content">

          {/* =========================================
              HEADING
          ========================================= */}

          <div className="seller-products-heading">

            <div>

              <span>
                PRODUCT MANAGEMENT
              </span>

              <h1>
                My Products
              </h1>

              <p>
                View and manage the products you have
                added to ShopSphere.
              </p>

            </div>

            <Link
              to="/seller/add-product"
              className="seller-products-add-btn"
            >
              <FaPlusCircle />
              Add New Product
            </Link>

          </div>

          {/* =========================================
              SUMMARY CARDS
          ========================================= */}

          <div className="seller-product-summary">

            {/* TOTAL PRODUCTS */}

            <div className="seller-product-summary-card">

              <div className="summary-icon purple">
                <FaBoxOpen />
              </div>

              <div>
                <span>Total Products</span>
                <strong>{products.length}</strong>
              </div>

            </div>

            {/* IN STOCK */}

            <div className="seller-product-summary-card">

              <div className="summary-icon green">
                <FaBoxes />
              </div>

              <div>

                <span>In Stock</span>

                <strong>
                  {
                    products.filter(
                      (product) =>
                        product.stock > 5
                    ).length
                  }
                </strong>

              </div>

            </div>

            {/* LOW STOCK */}

            <div className="seller-product-summary-card">

              <div className="summary-icon orange">
                <FaExclamationTriangle />
              </div>

              <div>

                <span>Low Stock</span>

                <strong>
                  {
                    products.filter(
                      (product) =>
                        product.stock > 0 &&
                        product.stock <= 5
                    ).length
                  }
                </strong>

              </div>

            </div>

            {/* OUT OF STOCK */}

            <div className="seller-product-summary-card">

              <div className="summary-icon red">
                <FaBoxes />
              </div>

              <div>

                <span>Out of Stock</span>

                <strong>
                  {
                    products.filter(
                      (product) =>
                        product.stock === 0
                    ).length
                  }
                </strong>

              </div>

            </div>

          </div>

          {/* =========================================
              PRODUCTS CARD
          ========================================= */}

          <section className="seller-products-card">

            {/* =====================================
                FILTER BAR
            ===================================== */}

            <div className="seller-products-filterbar">

              <div className="seller-products-search-box">

                <FaSearch />

                <input
                  type="text"
                  placeholder="Search by product name or category..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="seller-products-filters">

                {/* CATEGORY */}

                <div className="seller-filter-select">

                  <FaFilter />

                  <select
                    value={categoryFilter}
                    onChange={(e) =>
                      setCategoryFilter(
                        e.target.value
                      )
                    }
                  >
                    <option value="All">
                      All Categories
                    </option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                </div>

                {/* STATUS */}

                <div className="seller-filter-select">

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value
                      )
                    }
                  >
                    <option value="All">
                      All Status
                    </option>

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>

                </div>

              </div>

            </div>

            {/* =========================================
                RESULT INFO
            ========================================= */}

            <div className="seller-products-result">

              <span>
                Showing{" "}
                <strong>
                  {filteredProducts.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {products.length}
                </strong>{" "}
                products
              </span>

              {(searchTerm ||
                categoryFilter !== "All" ||
                statusFilter !== "All") && (

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("All");
                    setStatusFilter("All");
                  }}
                >
                  Clear Filters
                </button>

              )}

            </div>

            {/* =========================================
                PRODUCTS TABLE
            ========================================= */}

            {loading ? (

              <p style={{ padding: "20px" }}>Loading products...</p>

            ) : filteredProducts.length === 0 ? (

              <div className="seller-products-empty">

                <div>
                  <FaBoxOpen />
                </div>

                <h3>
                  No products found
                </h3>

                <p>
                  Try changing your filters or add a
                  new product.
                </p>

                <Link to="/seller/add-product">
                  <FaPlusCircle />
                  Add Product
                </Link>

              </div>

            ) : (

              <div className="seller-products-table-wrapper">

                <table className="seller-products-table">

                  <thead>

                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Inventory</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>

                  </thead>

                  <tbody>

                    {filteredProducts.map(
                      (product) => {

                        const stockStatus =
                          getStockStatus(
                            product.stock
                          );

                        const productStatus = product.is_active
                          ? "Active"
                          : "Inactive";

                        return (

                          <tr key={product.id}>

                            {/* ================= PRODUCT ================= */}

                            <td>

                              <div className="seller-table-product-info">

                                <div className="seller-table-product-image">

                                  <img
                                    src={resolveImageUrl(product.image_url)}
                                    alt={product.name}
                                    onError={(e) => {
                                      e.currentTarget.style.display =
                                        "none";

                                      e.currentTarget
                                        .nextElementSibling
                                        ?.classList.remove(
                                          "hidden-product-icon"
                                        );
                                    }}
                                  />

                                  <FaShoppingBag className="hidden-product-icon" />

                                </div>

                                <div>

                                  <strong>
                                    {product.name}
                                  </strong>

                                  <span>
                                    ID: #{product.id}
                                  </span>

                                </div>

                              </div>

                            </td>

                            {/* ================= CATEGORY ================= */}

                            <td>

                              <span className="seller-category-badge">
                                {product.category}
                              </span>

                            </td>

                            {/* ================= PRICE ================= */}

                            <td>

                              <strong className="seller-product-price">
                                ₹
                                {Number(product.price).toLocaleString(
                                  "en-IN"
                                )}
                              </strong>

                            </td>

                            {/* ================= STOCK ================= */}

                            <td>
                              <strong>
                                {product.stock}
                              </strong>
                            </td>

                            {/* ================= INVENTORY ================= */}

                            <td>

                              <span
                                className={`seller-stock-badge ${stockStatus.className}`}
                              >
                                {stockStatus.text}
                              </span>

                            </td>

                            {/* ================= STATUS ================= */}

                            <td>

                              <span
                                className={`seller-product-status ${
                                  productStatus ===
                                  "Active"
                                    ? "active"
                                    : "inactive"
                                }`}
                              >

                                <span />

                                {productStatus}

                              </span>

                            </td>

                            {/* ================= ACTIONS ================= */}

                            <td>

                              <div className="seller-product-actions">

                                {/* VIEW */}

                                <button
                                  type="button"
                                  className="seller-action-view"
                                  title="View Product"
                                  onClick={() =>
                                    navigate(
                                      `/product/${product.id}`
                                    )
                                  }
                                >
                                  <FaEye />
                                </button>

                                {/* EDIT */}

                                <button
                                  type="button"
                                  className="seller-action-edit"
                                  title="Edit Product"
                                  onClick={() =>
                                    handleEdit(
                                      product.id
                                    )
                                  }
                                >
                                  <FaEdit />
                                </button>

                                {/* DELETE */}

                                <button
                                  type="button"
                                  className="seller-action-delete"
                                  title="Delete Product"
                                  onClick={() =>
                                    handleDelete(
                                      product.id
                                    )
                                  }
                                >
                                  <FaTrashAlt />
                                </button>

                              </div>

                            </td>

                          </tr>

                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>

          {/* =========================================
              REQUIREMENT NOTE
          ========================================= */}

          <div className="seller-products-note">

            <FaBoxOpen />

            <div>

              <strong>
                Seller Product Management
              </strong>

              <p>
                You can view, edit and delete products
                added to your seller account. Ordering
                and checkout are not available for
                seller accounts.
              </p>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default SellerProducts;