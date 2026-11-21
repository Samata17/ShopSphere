import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  FaShoppingBag,
  FaThLarge,
  FaBoxOpen,
  FaClipboardList,
  FaBoxes,
  FaUser,
  FaSignOutAlt,
  FaSearch,
  FaBell,
  FaChevronDown,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaReceipt,
  FaCreditCard,
  FaCheckCircle,
  FaCube,
  FaPrint,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import {
  getSellerOrderById,
  updateSellerOrderItemStatus,
} from "../../api/seller";
import { resolveImageUrl } from "../../utils/image";

import "../../styles/sellerOrderDetails.css";

const ITEM_STATUSES = ["PLACED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

function SellerOrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/seller/login", { replace: true });
  };

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await getSellerOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load this order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (itemId, status) => {
    setUpdatingItemId(itemId);

    try {
      await updateSellerOrderItemStatus(itemId, status);
      await loadOrder();
      toast.success("Order item status updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update item status");
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (loading) {
    return null;
  }

  if (!order) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <h2>Order not found</h2>
        <p>{error}</p>

        <Link to="/seller/orders">Back to Orders</Link>
      </div>
    );
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  return (
    <div className="seller-detail-layout">
      <aside className="seller-detail-sidebar">
        <Link to="/seller/dashboard" className="seller-detail-logo">
          <div className="seller-detail-logo-icon">
            <FaShoppingBag />
          </div>

          <div>
            <h2>ShopSphere</h2>
            <span>Seller Panel</span>
          </div>
        </Link>

        <nav className="seller-detail-menu">
          <Link to="/seller/dashboard" className="seller-detail-menu-item">
            <FaThLarge />
            Dashboard
          </Link>

          <Link to="/seller/products" className="seller-detail-menu-item">
            <FaBoxOpen />
            Products
          </Link>

          <Link to="/seller/orders" className="seller-detail-menu-item active">
            <FaClipboardList />
            Orders
          </Link>

          <Link to="/seller/products" className="seller-detail-menu-item">
            <FaBoxes />
            Inventory
          </Link>

          <button type="button" className="seller-detail-menu-item">
            <FaUser />
            Seller Account
          </button>
        </nav>

        <button
          type="button"
          className="seller-detail-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          Logout
        </button>
      </aside>

      <div className="seller-detail-main">
        <header className="seller-detail-topbar">
          <div className="seller-detail-search">
            <FaSearch />
            <input type="text" placeholder="Search products, orders and more..." />
          </div>

          <div className="seller-detail-top-actions">
            <button
              type="button"
              className="seller-detail-bell"
              aria-label="Notifications"
            >
              <FaBell />
              <span>2</span>
            </button>

            <div className="seller-detail-account">
              <div className="seller-detail-avatar">
                <FaUser />
              </div>

              <div>
                <strong>Seller Account</strong>
                <span>Seller</span>
              </div>

              <FaChevronDown />
            </div>
          </div>
        </header>

        <main className="seller-detail-content">
          <div className="seller-detail-breadcrumb">
            <Link to="/seller/orders">Orders</Link>
            <span>›</span>
            <strong>Order Details</strong>
          </div>

          <div className="seller-detail-heading">
            <div>
              <h1>Order Information</h1>
              <p>View and manage your order details.</p>
            </div>

            <button
              type="button"
              className="seller-back-orders"
              onClick={() => navigate("/seller/orders")}
            >
              <FaArrowLeft />
              Back to Orders
            </button>
          </div>

          <section className="seller-order-info-card">
            <div className="seller-order-info-item">
              <span>Order Number</span>
              <strong>{order.order_number}</strong>

              <small className="seller-delivered-badge">
                {order.status}
              </small>
            </div>

            <div className="seller-order-info-item">
              <span>Order Date</span>

              <strong>
                {new Date(order.created_at).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="seller-order-info-item">
              <span>Customer</span>

              <strong>
                <FaUser />
                {order.shipping_name}
              </strong>

              <small>+91 {order.shipping_phone}</small>
            </div>

            <div className="seller-order-info-item">
              <span>Your Total (this order)</span>

              <strong className="seller-order-price">
                ₹{subtotal.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="seller-order-info-item">
              <span>Payment Method</span>

              <strong>
                <FaCreditCard />
                {order.payment_method}
              </strong>

              <small>{order.payment_status}</small>
            </div>
          </section>

          <div className="seller-order-middle-grid">
            <section className="seller-order-shipping-card">
              <div className="seller-order-detail-section">
                <div className="seller-order-section-title">
                  <FaMapMarkerAlt />
                  <strong>Shipping Address</strong>
                </div>

                <p>
                  <strong>{order.shipping_name}</strong>
                </p>

                <p>{order.shipping_address}</p>

                <p>
                  {order.shipping_city}, {order.shipping_state} -{" "}
                  {order.shipping_pincode}
                </p>

                <p>+91 {order.shipping_phone}</p>
              </div>

              <div className="seller-order-detail-section summary">
                <div className="seller-order-section-title">
                  <FaReceipt />
                  <strong>Order Summary (your items)</strong>
                </div>

                <div className="seller-summary-line">
                  <span>Subtotal</span>

                  <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
                </div>

                <div className="seller-summary-divider" />

                <div className="seller-summary-total">
                  <span>Total</span>

                  <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
                </div>
              </div>
            </section>

            <section className="seller-order-timeline-card">
              <h3>Update Item Status</h3>

              <p style={{ color: "#888", fontSize: "13px", marginBottom: "14px" }}>
                Update fulfillment status for each of your items in this
                order.
              </p>

              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    padding: "10px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <span style={{ fontSize: "13px" }}>{item.product_name}</span>

                  <select
                    value={item.item_status}
                    disabled={updatingItemId === item.id}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  >
                    {ITEM_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </section>
          </div>

          <div className="seller-order-lower-grid">
            <section className="seller-payment-card">
              <div className="seller-order-section-title">
                <FaCreditCard />
                <strong>Payment Details</strong>
              </div>

              <div className="seller-payment-row">
                <span>Payment Method</span>
                <strong>{order.payment_method}</strong>
              </div>

              <div className="seller-payment-row">
                <span>Payment Status</span>

                <strong className="seller-paid">
                  {order.payment_status}
                </strong>
              </div>
            </section>

            <section className="seller-items-card">
              <div className="seller-order-section-title">
                <FaCube />
                <strong>Order Items ({order.items.length})</strong>
              </div>

              {order.items.map((item) => (
                <div className="seller-order-product" key={item.id}>
                  <img
                    src={resolveImageUrl(item.product_image)}
                    alt={item.product_name}
                  />

                  <div className="seller-order-product-info">
                    <strong>{item.product_name}</strong>

                    <span>
                      Price: ₹{Number(item.price).toLocaleString("en-IN")}
                    </span>

                    <span>Status: {item.item_status}</span>
                  </div>

                  <div className="seller-product-quantity">
                    <span>Quantity</span>
                    <strong>{item.quantity}</strong>
                  </div>

                  <div className="seller-product-total">
                    <span>Total</span>

                    <strong>
                      ₹
                      {(Number(item.price) * item.quantity).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                </div>
              ))}
            </section>
          </div>

          <section className="seller-order-bottom">
            <div className="seller-order-bottom-note">
              <FaCheckCircle />
              <span>You can print this order for your records.</span>
            </div>

            <div className="seller-order-bottom-actions">
              <button
                type="button"
                className="seller-print-btn"
                onClick={() => window.print()}
              >
                <FaPrint />
                Print Order
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default SellerOrderDetails;
