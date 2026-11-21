import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { toast } from "react-toastify";

import {
  FaShieldAlt,
  FaTachometerAlt,
  FaUsers,
  FaBoxOpen,
  FaShoppingBag,
  FaSignOutAlt,
  FaUser,
  FaSearch,
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaStore,
  FaBoxes,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import {
  getAdminProducts,
  setProductActiveStatus,
  deleteAdminProduct,
} from "../../api/admin";
import { resolveImageUrl } from "../../utils/image";

import "../../styles/manageProducts.css";

const getProductStatus = (product) => {
  if (!product.is_active) return "Inactive";
  if (product.stock === 0) return "Out of Stock";
  return "Active";
};

function ManageProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAdminProducts();
      setProducts(data);
    } catch (error) {
      console.error("Get admin products error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const activeProducts = products.filter(
    (product) => getProductStatus(product) === "Active"
  ).length;

  const outOfStockProducts = products.filter(
    (product) => product.stock === 0
  ).length;

  const uniqueSellers = new Set(
    products.map((product) => product.seller_name)
  ).size;

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(search) ||
        product.seller_name.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search);

      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        getProductStatus(product) === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const handleView = (product) => {
    alert(
      `Product: ${product.name}\nSeller: ${product.seller_name}\nCategory: ${product.category}\nPrice: ₹${Number(
        product.price
      ).toLocaleString("en-IN")}\nStock: ${product.stock}\nStatus: ${getProductStatus(
        product
      )}`
    );
  };

  const handleStatusChange = async (product) => {
    if (!product.is_active && product.stock === 0) {
      toast.warn("This product is out of stock. Ask the seller to restock before activating it.");
      return;
    }

    try {
      await setProductActiveStatus(product.id, !product.is_active);
      await loadProducts();
      toast.success(product.is_active ? "Product deactivated" : "Product activated");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not update product status"
      );
    }
  };

  const handleDelete = async (product) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteAdminProduct(product.id);
      await loadProducts();
      toast.success("Product deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete product");
    }
  };

  return (
    <div className="manage-products-page">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">
            <FaShieldAlt />
          </div>

          <div>
            <h2>ShopSphere</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <div className="admin-profile">
          <div className="admin-profile-avatar">
            <FaUser />
          </div>

          <div>
            <small>Welcome back</small>
            <strong>Administrator</strong>
          </div>
        </div>

        <nav className="admin-nav">
          <Link
            to="/admin/dashboard"
            className={`admin-nav-item ${
              location.pathname === "/admin/dashboard" ? "active" : ""
            }`}
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/users"
            className={`admin-nav-item ${
              location.pathname === "/admin/users" ? "active" : ""
            }`}
          >
            <FaUsers />
            <span>Manage Users</span>
          </Link>

          <Link
            to="/admin/products"
            className={`admin-nav-item ${
              location.pathname === "/admin/products" ? "active" : ""
            }`}
          >
            <FaBoxOpen />
            <span>Manage Products</span>
          </Link>

          <Link
            to="/admin/orders"
            className={`admin-nav-item ${
              location.pathname === "/admin/orders" ? "active" : ""
            }`}
          >
            <FaShoppingBag />
            <span>Manage Orders</span>
          </Link>
        </nav>

        <button type="button" className="admin-logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </aside>

      <main className="manage-products-main">
        <div className="manage-products-header">
          <p className="admin-small-heading">PRODUCT MANAGEMENT</p>
          <h1>Manage Products</h1>
          <p>View and manage products from all ShopSphere sellers.</p>
        </div>

        <div className="product-summary-grid">
          <div className="product-summary-card">
            <div className="product-summary-icon">
              <FaBoxes />
            </div>

            <div>
              <span>Total Products</span>
              <strong>{products.length}</strong>
            </div>
          </div>

          <div className="product-summary-card">
            <div className="product-summary-icon">
              <FaCheckCircle />
            </div>

            <div>
              <span>Active Products</span>
              <strong>{activeProducts}</strong>
            </div>
          </div>

          <div className="product-summary-card">
            <div className="product-summary-icon">
              <FaTimesCircle />
            </div>

            <div>
              <span>Out of Stock</span>
              <strong>{outOfStockProducts}</strong>
            </div>
          </div>

          <div className="product-summary-card">
            <div className="product-summary-icon">
              <FaStore />
            </div>

            <div>
              <span>Sellers</span>
              <strong>{uniqueSellers}</strong>
            </div>
          </div>
        </div>

        <section className="products-management-card">
          <div className="products-card-header">
            <div>
              <h2>All Products</h2>
              <p>Search, filter and manage seller products.</p>
            </div>

            <div className="products-search-box">
              <FaSearch />

              <input
                type="text"
                placeholder="Search product or seller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="product-filters">
            <div className="product-filter-group">
              <label>Category</label>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="product-filter-group">
              <label>Status</label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div className="product-result-count">
              Showing <strong>{filteredProducts.length}</strong> of{" "}
              <strong>{products.length}</strong> products
            </div>
          </div>

          <div className="admin-products-table-wrapper">
            {loading ? (
              <p style={{ padding: "20px" }}>Loading products...</p>
            ) : (
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Seller</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const status = getProductStatus(product);

                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="admin-product-info">
                            <div className="admin-product-image">
                              <img
                                src={resolveImageUrl(product.image_url)}
                                alt={product.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                }}
                              />
                            </div>

                            <div>
                              <strong>{product.name}</strong>
                              <span>Product #{product.id}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="admin-product-seller">
                            <FaStore />
                            <span>{product.seller_name}</span>
                          </div>
                        </td>

                        <td>
                          <span className="admin-category-badge">
                            {product.category}
                          </span>
                        </td>

                        <td>
                          <strong className="admin-product-price">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={
                              product.stock === 0
                                ? "admin-stock out"
                                : product.stock <= 5
                                ? "admin-stock low"
                                : "admin-stock"
                            }
                          >
                            {product.stock}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`admin-product-status ${status
                              .toLowerCase()
                              .replaceAll(" ", "-")}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          <div className="admin-product-actions">
                            <button
                              type="button"
                              title="View Product"
                              onClick={() => handleView(product)}
                            >
                              <FaEye />
                            </button>

                            <button
                              type="button"
                              title={
                                product.is_active
                                  ? "Deactivate Product"
                                  : "Activate Product"
                              }
                              className="product-status-action"
                              onClick={() => handleStatusChange(product)}
                            >
                              {product.is_active ? (
                                <FaTimesCircle />
                              ) : (
                                <FaCheckCircle />
                              )}
                            </button>

                            <button
                              type="button"
                              title="Delete Product"
                              className="product-delete-action"
                              onClick={() => handleDelete(product)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="no-admin-products">
                      <FaBoxOpen />
                      <strong>No products found</strong>
                      <span>Try changing your search or filters.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ManageProducts;
