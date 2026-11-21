import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingBag,
  FaThLarge,
  FaBoxOpen,
  FaClipboardList,
  FaUser,
  FaSignOutAlt,
  FaSearch,
  FaBell,
  FaChevronDown,
  FaEye,
  FaPlusCircle,
  FaBoxes,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { getSellerOrders } from "../../api/seller";

import "../../styles/sellerOrders.css";

function SellerOrders() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/seller/login", { replace: true });
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getSellerOrders();
        setOrders(data);
      } catch (error) {
        console.error("Get seller orders error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "All") return orders;
    return orders.filter((order) => order.order_status === statusFilter);
  }, [orders, statusFilter]);

  const getStatusClass = (status) => status.toLowerCase().replaceAll(" ", "-");

  const getOrderAmount = (order) =>
    order.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

  return (
    <div className="seller-orders-layout">
      <aside className="seller-orders-sidebar">
        <Link to="/seller/dashboard" className="seller-orders-logo">
          <div className="seller-orders-logo-icon">
            <FaShoppingBag />
          </div>

          <div>
            <h2>ShopSphere</h2>
            <span>Seller Panel</span>
          </div>
        </Link>

        <div className="seller-orders-divider" />

        <p className="seller-orders-menu-title">SELLER PANEL</p>

        <nav className="seller-orders-menu">
          <Link to="/seller/dashboard" className="seller-orders-menu-item">
            <FaThLarge />
            Dashboard
          </Link>

          <Link to="/seller/products" className="seller-orders-menu-item">
            <FaBoxOpen />
            My Products
          </Link>

          <Link to="/seller/add-product" className="seller-orders-menu-item">
            <FaPlusCircle />
            Add Product
          </Link>

          <Link to="/seller/orders" className="seller-orders-menu-item active">
            <FaClipboardList />
            Orders
          </Link>

          <Link to="/seller/products" className="seller-orders-menu-item">
            <FaBoxes />
            Inventory
          </Link>

          <button type="button" className="seller-orders-menu-item">
            <FaUser />
            Seller Account
          </button>
        </nav>

        <div className="seller-orders-business-card">
          <FaClipboardList />
          <strong>Manage Orders</strong>

          <p>View customer orders and keep track of their current status.</p>
        </div>

        <button
          type="button"
          className="seller-orders-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          Logout
        </button>
      </aside>

      <div className="seller-orders-main">
        <header className="seller-orders-topbar">
          <div className="seller-orders-search">
            <FaSearch />
            <input type="text" placeholder="Search products, orders and more..." />
          </div>

          <div className="seller-orders-top-actions">
            <button type="button" className="seller-orders-notification">
              <FaBell />
              <span>2</span>
            </button>

            <div className="seller-orders-account">
              <div className="seller-orders-avatar">
                <FaUser />
              </div>

              <div>
                <strong>Seller Account</strong>
                <small>Seller</small>
              </div>

              <FaChevronDown />
            </div>
          </div>
        </header>

        <main className="seller-orders-content">
          <div className="seller-orders-heading">
            <div>
              <span>ORDER MANAGEMENT</span>
              <h1>Orders</h1>
              <p>View and manage customer orders for your products.</p>
            </div>
          </div>

          <div className="seller-orders-stats">
            <div className="seller-orders-stat-card">
              <span>Total Orders</span>
              <strong>{orders.length}</strong>
              <small>All customer orders</small>
            </div>

            <div className="seller-orders-stat-card">
              <span>Placed</span>

              <strong>
                {orders.filter((order) => order.order_status === "PLACED").length}
              </strong>

              <small>Orders being prepared</small>
            </div>

            <div className="seller-orders-stat-card">
              <span>Shipped</span>

              <strong>
                {orders.filter((order) => order.order_status === "SHIPPED").length}
              </strong>

              <small>Orders on the way</small>
            </div>

            <div className="seller-orders-stat-card">
              <span>Delivered</span>

              <strong>
                {
                  orders.filter((order) => order.order_status === "DELIVERED")
                    .length
                }
              </strong>

              <small>Successfully delivered</small>
            </div>
          </div>

          <section className="seller-orders-card">
            <div className="seller-orders-card-heading">
              <div>
                <h2>Customer Orders</h2>
                <p>All orders containing products from your store.</p>
              </div>

              <div className="seller-orders-filter">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Orders</option>
                  <option value="PLACED">Placed</option>
                  <option value="PACKED">Packed</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="seller-orders-table-wrapper">
              {loading ? (
                <p style={{ padding: "20px" }}>Loading orders...</p>
              ) : filteredOrders.length === 0 ? (
                <p style={{ padding: "20px" }}>No orders yet.</p>
              ) : (
                <table className="seller-orders-table">
                  <thead>
                    <tr>
                      <th>Order Number</th>
                      <th>Customer</th>
                      <th>Order Date</th>
                      <th>Total Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.order_id}>
                        <td>
                          <strong className="seller-order-id">
                            {order.order_number}
                          </strong>
                        </td>

                        <td>
                          <div className="seller-order-customer">
                            <div className="seller-order-customer-avatar">
                              <FaUser />
                            </div>

                            <span>{order.shipping_name}</span>
                          </div>
                        </td>

                        <td>
                          {new Date(order.created_at).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )}
                        </td>

                        <td>
                          <strong>
                            ₹{getOrderAmount(order).toLocaleString("en-IN")}
                          </strong>
                        </td>

                        <td>{order.payment_method}</td>

                        <td>
                          <span
                            className={`seller-order-status ${getStatusClass(
                              order.order_status
                            )}`}
                          >
                            {order.order_status}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="seller-view-order-btn"
                            onClick={() =>
                              navigate(`/seller/orders/${order.order_id}`)
                            }
                          >
                            <FaEye />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default SellerOrders;
