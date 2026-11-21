import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  FaShieldAlt,
  FaTachometerAlt,
  FaUsers,
  FaStore,
  FaBoxOpen,
  FaShoppingBag,
  FaSignOutAlt,
  FaUser,
  FaArrowRight,
  FaChartLine,
  FaCheckCircle,
  FaRupeeSign,
  FaFire,
  FaStar,
} from "react-icons/fa";

import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";
import { getAdminDashboard } from "../../api/admin";
import Spinner from "../../components/common/Spinner";

import "../../styles/adminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const [dashboardStats, setDashboardStats] = useState(null);
  const [mostSoldProducts, setMostSoldProducts] = useState([]);
  const [highestRatedProducts, setHighestRatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const data = await getAdminDashboard();
      setDashboardStats(data.stats);
      setMostSoldProducts(data.mostSoldProducts || []);
      setHighestRatedProducts(data.highestRatedProducts || []);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Could not load dashboard data. Please try again.";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const stats = [
    {
      id: 1,
      title: "Total Customers",
      value: dashboardStats?.totalCustomers ?? "—",
      icon: <FaUsers />,
      description: "Registered customers",
    },
    {
      id: 2,
      title: "Total Sellers",
      value: dashboardStats?.totalSellers ?? "—",
      icon: <FaStore />,
      description: "Registered sellers",
    },
    {
      id: 3,
      title: "Total Products",
      value: dashboardStats?.totalProducts ?? "—",
      icon: <FaBoxOpen />,
      description: "Products on ShopSphere",
    },
    {
      id: 4,
      title: "Total Orders",
      value: dashboardStats?.totalOrders ?? "—",
      icon: <FaShoppingBag />,
      description: "Customer orders",
    },
    {
      id: 5,
      title: "Total Revenue",
      value: dashboardStats
        ? `₹${Number(dashboardStats.totalRevenue).toLocaleString("en-IN")}`
        : "—",
      icon: <FaRupeeSign />,
      description: "Across all orders",
    },
  ];

  return (
    <div className="admin-dashboard-page">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="admin-sidebar">

        {/* LOGO */}

        <div className="admin-logo">
          <div className="admin-logo-icon">
            <FaShieldAlt />
          </div>

          <div>
            <h2>ShopSphere</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        {/* ADMIN USER */}

        <div className="admin-profile">
          <div className="admin-profile-avatar">
            <FaUser />
          </div>

          <div>
            <small>Welcome back</small>
            <strong>Administrator</strong>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="admin-nav">

          <Link
            to="/admin/dashboard"
            className={`admin-nav-item ${
              location.pathname === "/admin/dashboard"
                ? "active"
                : ""
            }`}
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/users"
            className={`admin-nav-item ${
              location.pathname === "/admin/users"
                ? "active"
                : ""
            }`}
          >
            <FaUsers />
            <span>Manage Users</span>
          </Link>

          <Link
            to="/admin/products"
            className={`admin-nav-item ${
              location.pathname === "/admin/products"
                ? "active"
                : ""
            }`}
          >
            <FaBoxOpen />
            <span>Manage Products</span>
          </Link>

          <Link
            to="/admin/orders"
            className={`admin-nav-item ${
              location.pathname === "/admin/orders"
                ? "active"
                : ""
            }`}
          >
            <FaShoppingBag />
            <span>Manage Orders</span>
          </Link>

        </nav>

        {/* LOGOUT */}

        <button
          type="button"
          className="admin-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>

      </aside>

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="admin-main">

        {/* TOP HEADER */}

        <header className="admin-top-header">

          <div>
            <p className="admin-small-heading">
              ADMINISTRATION
            </p>

            <h1>Admin Dashboard</h1>

            <p>
              Monitor and manage your ShopSphere
              marketplace.
            </p>
          </div>

          <div className="admin-header-badge">
            <FaShieldAlt />

            <div>
              <small>Logged in as</small>
              <strong>Admin</strong>
            </div>
          </div>

        </header>

        {/* =========================================
            STATISTICS
        ========================================= */}

        {loading ? (
          <div className="ss-page-loading">
            <Spinner size={32} label="Loading dashboard..." />
          </div>
        ) : loadError ? (
          <div className="ss-page-loading">
            <p style={{ color: "#dc3545" }}>{loadError}</p>
            <button
              type="button"
              onClick={loadStats}
              style={{
                padding: "8px 16px",
                border: "1px solid #7045e7",
                borderRadius: "7px",
                background: "#fff",
                color: "#7045e7",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <section className="admin-stats">

            {stats.map((stat) => (
              <div
                className="admin-stat-card"
                key={stat.id}
              >
                <div className="admin-stat-top">

                  <div className="admin-stat-icon">
                    {stat.icon}
                  </div>

                  <FaChartLine className="admin-stat-chart" />

                </div>

                <h3>{stat.value}</h3>

                <strong>{stat.title}</strong>

                <p>{stat.description}</p>
              </div>
            ))}

          </section>
        )}

        {/* =========================================
            MANAGEMENT
        ========================================= */}

        <section className="admin-section">

          <div className="admin-section-heading">
            <div>
              <h2>Management</h2>

              <p>
                Manage the main areas of your
                ShopSphere marketplace.
              </p>
            </div>
          </div>

          <div className="admin-management-grid">

            {/* USERS */}

            <Link
              to="/admin/users"
              className="admin-management-card"
            >
              <div className="admin-management-icon">
                <FaUsers />
              </div>

              <div className="admin-management-content">
                <h3>Users & Sellers</h3>

                <p>
                  View and manage registered customers
                  and seller accounts.
                </p>

                <span>
                  Manage Users
                  <FaArrowRight />
                </span>
              </div>
            </Link>

            {/* PRODUCTS */}

            <Link
              to="/admin/products"
              className="admin-management-card"
            >
              <div className="admin-management-icon">
                <FaBoxOpen />
              </div>

              <div className="admin-management-content">
                <h3>Products</h3>

                <p>
                  Review and manage products added by
                  sellers.
                </p>

                <span>
                  Manage Products
                  <FaArrowRight />
                </span>
              </div>
            </Link>

            {/* ORDERS */}

            <Link
              to="/admin/orders"
              className="admin-management-card"
            >
              <div className="admin-management-icon">
                <FaShoppingBag />
              </div>

              <div className="admin-management-content">
                <h3>Orders</h3>

                <p>
                  Monitor customer orders and their
                  current status.
                </p>

                <span>
                  Manage Orders
                  <FaArrowRight />
                </span>
              </div>
            </Link>

          </div>

        </section>

        {/* =========================================
            BOTTOM SECTION
        ========================================= */}

        <div className="admin-bottom-grid">

          {/* MOST SOLD PRODUCTS */}

          <section className="admin-section">

            <div className="admin-section-heading">
              <div>
                <h2>Most Sold Products</h2>
                <p>Top products by units sold.</p>
              </div>
            </div>

            <div className="admin-system-list">
              {mostSoldProducts.length === 0 ? (
                <div className="admin-system-item">
                  <div>
                    <strong>No sales yet</strong>
                    <span>Units sold will appear here once orders come in.</span>
                  </div>
                </div>
              ) : (
                mostSoldProducts.map((product) => (
                  <div className="admin-system-item" key={product.id}>
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.unitsSold} units sold</span>
                    </div>

                    <span className="admin-status-active">
                      <FaFire />
                      {product.unitsSold}
                    </span>
                  </div>
                ))
              )}
            </div>

          </section>

          {/* HIGHEST RATED PRODUCTS */}

          <section className="admin-section">

            <div className="admin-section-heading">
              <div>
                <h2>Highest Rated Products</h2>
                <p>Top products by average customer rating.</p>
              </div>
            </div>

            <div className="admin-system-list">
              {highestRatedProducts.length === 0 ? (
                <div className="admin-system-item">
                  <div>
                    <strong>No reviews yet</strong>
                    <span>Ratings will appear here once customers review products.</span>
                  </div>
                </div>
              ) : (
                highestRatedProducts.map((product) => (
                  <div className="admin-system-item" key={product.id}>
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}</span>
                    </div>

                    <span className="admin-status-active">
                      <FaStar />
                      {Number(product.averageRating).toFixed(1)}
                    </span>
                  </div>
                ))
              )}
            </div>

          </section>

          {/* SYSTEM STATUS */}

          <section className="admin-section">

            <div className="admin-section-heading">
              <div>
                <h2>System Status</h2>

                <p>
                  ShopSphere service overview.
                </p>
              </div>
            </div>

            <div className="admin-system-list">

              <div className="admin-system-item">
                <div>
                  <strong>Customer Portal</strong>
                  <span>Shopping website</span>
                </div>

                <span className="admin-status-active">
                  <FaCheckCircle />
                  Active
                </span>
              </div>

              <div className="admin-system-item">
                <div>
                  <strong>Seller Portal</strong>
                  <span>Seller management system</span>
                </div>

                <span className="admin-status-active">
                  <FaCheckCircle />
                  Active
                </span>
              </div>

              <div className="admin-system-item">
                <div>
                  <strong>Admin Portal</strong>
                  <span>Administration system</span>
                </div>

                <span className="admin-status-active">
                  <FaCheckCircle />
                  Active
                </span>
              </div>

            </div>

          </section>

        </div>

      </main>
    </div>
  );
}

export default AdminDashboard;