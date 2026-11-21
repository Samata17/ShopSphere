import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

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
  FaArrowRight,
  FaCheckCircle,
  FaEye,
  FaClipboardList,
  FaStar,
  FaExclamationTriangle,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { getSellerDashboard } from "../../api/seller";

import "../../styles/sellerDashboard.css";

function SellerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/seller/login", { replace: true });
  };

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUnitsSold: 0,
    averageRating: 0,
    totalReviews: 0,
  });

  const [recentProducts, setRecentProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getSellerDashboard();
        setStats(data.stats);
        setRecentProducts(data.recentProducts);
        setLowStockProducts(data.lowStockProducts || []);
        setRecentReviews(data.recentReviews || []);
      } catch (error) {
        console.error("Seller dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="seller-layout">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="seller-sidebar">

        {/* ================= LOGO ================= */}

        <Link
          to="/seller/dashboard"
          className="seller-logo"
        >
          <div className="seller-logo-icon">
            <FaShoppingBag />
          </div>

          <div>
            <h2>ShopSphere</h2>
            <span>Seller Panel</span>
          </div>
        </Link>

        <div className="seller-sidebar-divider" />

        <p className="seller-menu-heading">
          SELLER PANEL
        </p>

        {/* ================= MENU ================= */}

        <nav className="seller-menu">

          {/* DASHBOARD */}

          <Link
            to="/seller/dashboard"
            className={
              location.pathname === "/seller/dashboard"
                ? "seller-menu-link active"
                : "seller-menu-link"
            }
          >
            <FaThLarge />
            <span>Dashboard</span>
          </Link>

          {/* MY PRODUCTS */}

          <Link
            to="/seller/products"
            className={
              location.pathname === "/seller/products"
                ? "seller-menu-link active"
                : "seller-menu-link"
            }
          >
            <FaBoxOpen />
            <span>My Products</span>
          </Link>

          {/* ADD PRODUCT */}

          <Link
            to="/seller/add-product"
            className={
              location.pathname === "/seller/add-product"
                ? "seller-menu-link active"
                : "seller-menu-link"
            }
          >
            <FaPlusCircle />
            <span>Add Product</span>
          </Link>

          {/* ORDERS */}

          <Link
            to="/seller/orders"
            className={
              location.pathname.startsWith("/seller/orders")
                ? "seller-menu-link active"
                : "seller-menu-link"
            }
          >
            <FaClipboardList />
            <span>Orders</span>
          </Link>

          {/* VIEW ALL PRODUCTS */}

          <Link
            to="/products"
            className="seller-menu-link"
          >
            <FaEye />
            <span>View Products</span>
          </Link>

          {/* INVENTORY */}

          <Link
            to="/seller/products"
            className="seller-menu-link"
          >
            <FaBoxes />
            <span>Inventory</span>
          </Link>

          {/* SELLER ACCOUNT */}

          <button
            type="button"
            className="seller-menu-link"
          >
            <FaUser />
            <span>Seller Account</span>
          </button>

        </nav>

        {/* =========================================
            BUSINESS CARD
        ========================================= */}

        <div className="seller-business-card">

          <div className="seller-business-icon">
            <FaShoppingBag />
          </div>

          <strong>
            Grow Your Business
          </strong>

          <p>
            Add and manage your products to reach more
            ShopSphere customers.
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
          className="seller-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>

      </aside>

      {/* =========================================
          MAIN
      ========================================= */}

      <div className="seller-main">

        {/* =========================================
            TOP HEADER
        ========================================= */}

        <header className="seller-topbar">

          {/* SEARCH */}

          <div className="seller-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search your products..."
            />

          </div>

          {/* TOP ACTIONS */}

          <div className="seller-top-actions">

            <button
              type="button"
              className="seller-notification"
              aria-label="Notifications"
            >
              <FaBell />
              <span>2</span>
            </button>

            <div className="seller-account-top">

              <div className="seller-account-avatar">
                <FaUser />
              </div>

              <div>
                <small>Welcome</small>
                <strong>Seller Account</strong>
              </div>

              <FaChevronDown
                className="seller-account-arrow"
              />

            </div>

          </div>

        </header>

        {/* =========================================
            DASHBOARD CONTENT
        ========================================= */}

        <main className="seller-dashboard-content">

          {/* =========================================
              WELCOME
          ========================================= */}

          <div className="seller-dashboard-heading">

            <div>

              <span className="seller-dashboard-label">
                SELLER DASHBOARD
              </span>

              <h1>
                Welcome back, Seller!
              </h1>

              <p>
                Here's an overview of your ShopSphere
                products and inventory.
              </p>

            </div>

            <Link
              to="/seller/add-product"
              className="seller-primary-btn"
            >
              <FaPlusCircle />
              Add New Product
            </Link>

          </div>

          {/* =========================================
              STAT CARDS
          ========================================= */}

          <div className="seller-stats-grid">

            {/* TOTAL PRODUCTS */}

            <div className="seller-stat-card">

              <div className="seller-stat-icon purple">
                <FaBoxOpen />
              </div>

              <div className="seller-stat-info">

                <span>
                  Total Products
                </span>

                <h2>
                  {stats.totalProducts}
                </h2>

                <Link to="/seller/products">
                  View Products
                  <FaArrowRight />
                </Link>

              </div>

            </div>

            {/* TOTAL STOCK */}

            <div className="seller-stat-card">

              <div className="seller-stat-icon green">
                <FaCheckCircle />
              </div>

              <div className="seller-stat-info">

                <span>
                  Total Stock Units
                </span>

                <h2>
                  {stats.totalStock}
                </h2>

                <small>
                  Across all your products
                </small>

              </div>

            </div>

            {/* ORDERS */}

            <div className="seller-stat-card">

              <div className="seller-stat-icon orange">
                <FaClipboardList />
              </div>

              <div className="seller-stat-info">

                <span>
                  Total Orders
                </span>

                <h2>
                  {stats.totalOrders}
                </h2>

                <Link to="/seller/orders">
                  View Orders
                  <FaArrowRight />
                </Link>

              </div>

            </div>

            {/* REVENUE */}

            <div className="seller-stat-card">

              <div className="seller-stat-icon red">
                <FaBoxes />
              </div>

              <div className="seller-stat-info">

                <span>
                  Total Revenue
                </span>

                <h2>
                  ₹{Number(stats.totalRevenue).toLocaleString("en-IN")}
                </h2>

                <small>
                  From items sold
                </small>

              </div>

            </div>

            {/* AVERAGE RATING */}

            <div className="seller-stat-card">

              <div className="seller-stat-icon orange">
                <FaStar />
              </div>

              <div className="seller-stat-info">

                <span>
                  Average Rating
                </span>

                <h2>
                  {Number(stats.averageRating || 0).toFixed(1)}
                </h2>

                <small>
                  From {stats.totalReviews || 0} review
                  {stats.totalReviews === 1 ? "" : "s"}
                </small>

              </div>

            </div>

            {/* UNITS SOLD */}

            <div className="seller-stat-card">

              <div className="seller-stat-icon green">
                <FaBoxes />
              </div>

              <div className="seller-stat-info">

                <span>
                  Units Sold
                </span>

                <h2>
                  {stats.totalUnitsSold || 0}
                </h2>

                <small>
                  Across all your products
                </small>

              </div>

            </div>

          </div>

          {/* =========================================
              DASHBOARD GRID
          ========================================= */}

          <div className="seller-dashboard-grid">

            {/* =====================================
                RECENT PRODUCTS
            ===================================== */}

            <section
              className="
                seller-dashboard-card
                seller-products-section
              "
            >

              <div className="seller-card-header">

                <div>

                  <h2>
                    Recent Products
                  </h2>

                  <p>
                    Recently added products in your
                    store.
                  </p>

                </div>

                <Link to="/seller/products">
                  View All
                  <FaArrowRight />
                </Link>

              </div>

              {/* TABLE */}

              <div className="seller-table-wrapper">

                {loading ? (
                  <p style={{ padding: "20px" }}>Loading...</p>
                ) : recentProducts.length === 0 ? (
                  <p style={{ padding: "20px" }}>
                    You haven't added any products yet.
                  </p>
                ) : (
                <table className="seller-product-table">

                  <thead>

                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {recentProducts.map((product) => {
                      const statusText =
                        product.stock === 0
                          ? "Out of Stock"
                          : product.stock <= 5
                          ? "Low Stock"
                          : "Active";

                      return (

                      <tr key={product.id}>

                        {/* PRODUCT */}

                        <td>

                          <div className="seller-table-product">

                            <div className="seller-product-placeholder">
                              <FaShoppingBag />
                            </div>

                            <strong>
                              {product.name}
                            </strong>

                          </div>

                        </td>

                        {/* CATEGORY */}

                        <td>
                          {product.category}
                        </td>

                        {/* PRICE */}

                        <td>
                          <strong>
                            ₹
                            {Number(product.price).toLocaleString(
                              "en-IN"
                            )}
                          </strong>
                        </td>

                        {/* STOCK */}

                        <td>
                          {product.stock}
                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`seller-status ${
                              statusText === "Active"
                                ? "active"
                                : statusText === "Low Stock"
                                ? "low"
                                : "out"
                            }`}
                          >
                            {statusText}
                          </span>

                        </td>

                      </tr>
                      );
                    })}

                  </tbody>

                </table>
                )}

              </div>

            </section>

            {/* =====================================
                QUICK ACTIONS
            ===================================== */}

            <section
              className="
                seller-dashboard-card
                seller-quick-section
              "
            >

              <div className="seller-card-header">

                <div>

                  <h2>
                    Quick Actions
                  </h2>

                  <p>
                    Manage your store quickly.
                  </p>

                </div>

              </div>

              <div className="seller-quick-actions">

                {/* ADD PRODUCT */}

                <Link
                  to="/seller/add-product"
                  className="seller-quick-action"
                >

                  <div>
                    <FaPlusCircle />
                  </div>

                  <span>

                    <strong>
                      Add Product
                    </strong>

                    <small>
                      Add a new product for sale
                    </small>

                  </span>

                  <FaArrowRight />

                </Link>

                {/* MY PRODUCTS */}

                <Link
                  to="/seller/products"
                  className="seller-quick-action"
                >

                  <div>
                    <FaBoxOpen />
                  </div>

                  <span>

                    <strong>
                      My Products
                    </strong>

                    <small>
                      Edit or delete your products
                    </small>

                  </span>

                  <FaArrowRight />

                </Link>

                {/* ORDERS */}

                <Link
                  to="/seller/orders"
                  className="seller-quick-action"
                >

                  <div>
                    <FaClipboardList />
                  </div>

                  <span>

                    <strong>
                      Orders
                    </strong>

                    <small>
                      View customer orders
                    </small>

                  </span>

                  <FaArrowRight />

                </Link>

                {/* VIEW PRODUCTS */}

                <Link
                  to="/products"
                  className="seller-quick-action"
                >

                  <div>
                    <FaEye />
                  </div>

                  <span>

                    <strong>
                      View Products
                    </strong>

                    <small>
                      Browse all ShopSphere products
                    </small>

                  </span>

                  <FaArrowRight />

                </Link>

                {/* INVENTORY */}

                <Link
                  to="/seller/products"
                  className="seller-quick-action"
                >

                  <div>
                    <FaBoxes />
                  </div>

                  <span>

                    <strong>
                      Inventory
                    </strong>

                    <small>
                      Check product stock levels
                    </small>

                  </span>

                  <FaArrowRight />

                </Link>

              </div>

            </section>

          </div>

          {/* =========================================
              LOW STOCK + RECENT REVIEWS
          ========================================= */}

          <div className="seller-dashboard-grid">

            {/* LOW STOCK PRODUCTS */}

            <section className="seller-dashboard-card seller-products-section">

              <div className="seller-card-header">
                <div>
                  <h2>Low Stock Products</h2>
                  <p>Products with 5 or fewer units left.</p>
                </div>
              </div>

              <div className="seller-table-wrapper">
                {loading ? (
                  <p style={{ padding: "20px" }}>Loading...</p>
                ) : lowStockProducts.length === 0 ? (
                  <p style={{ padding: "20px" }}>
                    No products are running low on stock.
                  </p>
                ) : (
                  <table className="seller-product-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Stock</th>
                      </tr>
                    </thead>

                    <tbody>
                      {lowStockProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <div className="seller-table-product">
                              <div className="seller-product-placeholder">
                                <FaExclamationTriangle />
                              </div>
                              <strong>{product.name}</strong>
                            </div>
                          </td>
                          <td>{product.category}</td>
                          <td>
                            <span
                              className={`seller-status ${
                                product.stock === 0 ? "out" : "low"
                              }`}
                            >
                              {product.stock === 0
                                ? "Out of Stock"
                                : `${product.stock} left`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            {/* RECENT REVIEWS */}

            <section className="seller-dashboard-card seller-quick-section">

              <div className="seller-card-header">
                <div>
                  <h2>Recent Reviews</h2>
                  <p>Latest feedback from customers.</p>
                </div>
              </div>

              <div className="seller-reviews-list">
                {loading ? (
                  <p style={{ padding: "20px" }}>Loading...</p>
                ) : recentReviews.length === 0 ? (
                  <p style={{ padding: "20px" }}>No reviews yet.</p>
                ) : (
                  recentReviews.map((review) => (
                    <div className="seller-review-item" key={review.id}>
                      <div className="seller-review-header">
                        <strong>{review.product_name}</strong>
                        <span className="seller-review-stars">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </span>
                      </div>
                      <p className="seller-review-title">{review.title}</p>
                      <small>by {review.customer_name}</small>
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>

          {/* =========================================
              SELLER INFORMATION
          ========================================= */}

          <section className="seller-info-banner">

            <div className="seller-info-icon">
              <FaCheckCircle />
            </div>

            <div>

              <strong>
                Seller Account
              </strong>

              <p>
                As a seller, you can add, modify,
                delete and view products. Ordering and
                checkout are available only to customer
                accounts.
              </p>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default SellerDashboard;