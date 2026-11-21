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
  FaClock,
  FaTruck,
  FaCheckCircle,
  FaCreditCard,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { getAdminOrders, updateAdminOrderStatus } from "../../api/admin";

import "../../styles/manageOrders.css";

const ORDER_STATUSES = ["PLACED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

function ManageOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getAdminOrders();
      setOrders(data);
    } catch (error) {
      console.error("Get admin orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const pendingCount = orders.filter((order) => order.status === "PLACED").length;

  const processingCount = orders.filter(
    (order) => order.status === "PACKED" || order.status === "SHIPPED"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        order.order_number.toLowerCase().includes(search) ||
        order.customer_name.toLowerCase().includes(search) ||
        order.customer_phone.includes(search);

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      const matchesPayment =
        paymentFilter === "All" || order.payment_status === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAdminOrderStatus(id, newStatus);
      await loadOrders();
      toast.success(
        newStatus === "CANCELLED" ? "Order cancelled" : "Order status updated"
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update order status");
    }
  };

  const handleViewOrder = (order) => {
    alert(
      `Order: ${order.order_number}\n` +
        `Customer: ${order.customer_name}\n` +
        `Phone: ${order.customer_phone}\n` +
        `Amount: ₹${Number(order.total).toLocaleString("en-IN")}\n` +
        `Payment: ${order.payment_method} (${order.payment_status})\n` +
        `Order Status: ${order.status}\n` +
        `Date: ${new Date(order.created_at).toLocaleString("en-IN")}\n` +
        `Delivery: ${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}`
    );
  };

  return (
    <div className="manage-orders-page">
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

      <main className="manage-orders-main">
        <div className="manage-orders-header">
          <p className="admin-small-heading">ORDER MANAGEMENT</p>
          <h1>Manage Orders</h1>
          <p>Monitor and manage customer orders across ShopSphere.</p>
        </div>

        <div className="order-summary-grid">
          <div className="order-summary-card">
            <div className="order-summary-icon">
              <FaShoppingBag />
            </div>

            <div>
              <span>Total Orders</span>
              <strong>{orders.length}</strong>
            </div>
          </div>

          <div className="order-summary-card">
            <div className="order-summary-icon pending">
              <FaClock />
            </div>

            <div>
              <span>Placed</span>
              <strong>{pendingCount}</strong>
            </div>
          </div>

          <div className="order-summary-card">
            <div className="order-summary-icon processing">
              <FaTruck />
            </div>

            <div>
              <span>Packed / Shipped</span>
              <strong>{processingCount}</strong>
            </div>
          </div>

          <div className="order-summary-card">
            <div className="order-summary-icon delivered">
              <FaCheckCircle />
            </div>

            <div>
              <span>Delivered</span>
              <strong>{deliveredCount}</strong>
            </div>
          </div>
        </div>

        <section className="orders-management-card">
          <div className="orders-card-header">
            <div>
              <h2>All Orders</h2>
              <p>Search, filter and update customer orders.</p>
            </div>

            <div className="orders-search-box">
              <FaSearch />

              <input
                type="text"
                placeholder="Search order, customer or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="order-filters">
            <div className="order-filter-group">
              <label>Order Status</label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="order-filter-group">
              <label>Payment Status</label>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="All">All Payments</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <div className="order-result-count">
              Showing <strong>{filteredOrders.length}</strong> of{" "}
              <strong>{orders.length}</strong> orders
            </div>
          </div>

          <div className="admin-orders-table-wrapper">
            {loading ? (
              <p style={{ padding: "20px" }}>Loading orders...</p>
            ) : (
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <div className="admin-order-id">
                          <div className="order-icon-box">
                            <FaShoppingBag />
                          </div>

                          <div>
                            <strong>{order.order_number}</strong>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="order-customer">
                          <strong>{order.customer_name}</strong>
                          <span>{order.customer_phone}</span>
                        </div>
                      </td>

                      <td>
                        <strong className="order-amount">
                          ₹{Number(order.total).toLocaleString("en-IN")}
                        </strong>
                      </td>

                      <td>
                        <div className="order-payment">
                          <span className="payment-method">
                            <FaCreditCard />
                            {order.payment_method}
                          </span>

                          <span
                            className={`payment-status ${order.payment_status.toLowerCase()}`}
                          >
                            {order.payment_status}
                          </span>
                        </div>
                      </td>

                      <td className="order-date">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )}
                      </td>

                      <td>
                        <select
                          className={`order-status-select ${order.status.toLowerCase()}`}
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="view-order-btn"
                          title="View Order"
                          onClick={() => handleViewOrder(order)}
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-admin-orders">
                      <FaShoppingBag />
                      <strong>No orders found</strong>
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

export default ManageOrders;
