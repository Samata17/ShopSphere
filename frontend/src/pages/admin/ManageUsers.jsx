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
  FaStore,
  FaSearch,
  FaEye,
  FaUserCheck,
  FaUserSlash,
  FaTrashAlt,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import {
  getAdminUsers,
  setUserActiveStatus,
  deleteAdminUser,
} from "../../api/admin";

import "../../styles/manageUsers.css";

function ManageUsers() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      console.error("Get admin users error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  // =========================================
  // FILTER USERS
  // =========================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesTab =
        activeTab === "All" ||
        user.role === activeTab.toUpperCase();

      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        user.name.toLowerCase().includes(search) ||
        (user.email || "").toLowerCase().includes(search) ||
        user.phone.includes(search);

      return matchesTab && matchesSearch;
    });
  }, [users, activeTab, searchTerm]);

  // =========================================
  // COUNTS
  // =========================================

  const customerCount = users.filter(
    (user) => user.role === "CUSTOMER"
  ).length;

  const sellerCount = users.filter(
    (user) => user.role === "SELLER"
  ).length;

  const activeCount = users.filter((user) => user.is_active).length;

  // =========================================
  // STATUS CHANGE
  // =========================================

  const handleStatusChange = async (user) => {
    try {
      await setUserActiveStatus(user.id, !user.is_active);
      await loadUsers();
      toast.success(
        user.is_active ? "User deactivated" : "User activated"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not update user status"
      );
    }
  };

  // =========================================
  // VIEW USER
  // =========================================

  const handleView = (user) => {
    alert(
      `Name: ${user.name}\nEmail: ${user.email || "Not added"}\nPhone: ${user.phone}\nRole: ${user.role}\nStatus: ${user.is_active ? "Active" : "Inactive"}`
    );
  };

  // =========================================
  // DELETE USER
  // =========================================

  const handleDelete = async (user) => {
    const confirmDelete = window.confirm(
      `Delete ${user.role.toLowerCase()} "${user.name}"? This cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await deleteAdminUser(user.id);
      await loadUsers();
      toast.success("User deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete user");
    }
  };

  return (
    <div className="manage-users-page">

      {/* =====================================
          SIDEBAR
      ===================================== */}

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
              location.pathname ===
              "/admin/dashboard"
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
              location.pathname ===
              "/admin/products"
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
              location.pathname ===
              "/admin/orders"
                ? "active"
                : ""
            }`}
          >
            <FaShoppingBag />
            <span>Manage Orders</span>
          </Link>
        </nav>

        <button
          type="button"
          className="admin-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>

      </aside>

      {/* =====================================
          MAIN
      ===================================== */}

      <main className="manage-users-main">

        {/* HEADER */}

        <div className="manage-users-header">
          <div>
            <p className="admin-small-heading">
              USER MANAGEMENT
            </p>

            <h1>Manage Users</h1>

            <p>
              View and manage ShopSphere customers
              and sellers.
            </p>
          </div>
        </div>

        {/* =====================================
            SUMMARY
        ===================================== */}

        <div className="user-summary-grid">

          <div className="user-summary-card">
            <div className="user-summary-icon">
              <FaUsers />
            </div>

            <div>
              <span>Total Users</span>
              <strong>{users.length}</strong>
            </div>
          </div>

          <div className="user-summary-card">
            <div className="user-summary-icon">
              <FaUser />
            </div>

            <div>
              <span>Customers</span>
              <strong>{customerCount}</strong>
            </div>
          </div>

          <div className="user-summary-card">
            <div className="user-summary-icon">
              <FaStore />
            </div>

            <div>
              <span>Sellers</span>
              <strong>{sellerCount}</strong>
            </div>
          </div>

          <div className="user-summary-card">
            <div className="user-summary-icon">
              <FaUserCheck />
            </div>

            <div>
              <span>Active Accounts</span>
              <strong>{activeCount}</strong>
            </div>
          </div>

        </div>

        {/* =====================================
            USERS CARD
        ===================================== */}

        <section className="users-management-card">

          {/* TOP */}

          <div className="users-card-header">
            <div>
              <h2>Customers & Sellers</h2>

              <p>
                Search, view, edit and manage user
                account status.
              </p>
            </div>

            <div className="users-search-box">
              <FaSearch />

              <input
                type="text"
                placeholder="Search name, email or phone..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>
          </div>

          {/* =====================================
              TABS
          ===================================== */}

          <div className="users-tabs">

            <button
              type="button"
              className={
                activeTab === "All"
                  ? "active"
                  : ""
              }
              onClick={() => setActiveTab("All")}
            >
              All Users
              <span>{users.length}</span>
            </button>

            <button
              type="button"
              className={
                activeTab === "Customer"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("Customer")
              }
            >
              Customers
              <span>{customerCount}</span>
            </button>

            <button
              type="button"
              className={
                activeTab === "Seller"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("Seller")
              }
            >
              Sellers
              <span>{sellerCount}</span>
            </button>

          </div>

          {/* =====================================
              TABLE
          ===================================== */}

          <div className="users-table-wrapper">

            {loading ? (
              <p style={{ padding: "20px" }}>Loading users...</p>
            ) : (
            <table className="users-table">

              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>

                      {/* USER */}

                      <td>
                        <div className="table-user">
                          <div
                            className={`table-user-avatar ${
                              user.role === "SELLER"
                                ? "seller"
                                : ""
                            }`}
                          >
                            {user.role === "SELLER" ? (
                              <FaStore />
                            ) : (
                              <FaUser />
                            )}
                          </div>

                          <div>
                            <strong>
                              {user.name}
                            </strong>

                            <span>
                              ID #{user.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT */}

                      <td>
                        <div className="user-contact">
                          <strong>
                            {user.email || "Not added"}
                          </strong>

                          <span>
                            {user.phone}
                          </span>
                        </div>
                      </td>

                      {/* ROLE */}

                      <td>
                        <span
                          className={`user-role-badge ${user.role.toLowerCase()}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* JOINED */}

                      <td className="joined-date">
                        {new Date(user.created_at).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )}
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`user-status-badge ${
                            user.is_active ? "active" : "inactive"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div className="user-actions">

                          <button
                            type="button"
                            className="user-action-btn"
                            title="View User"
                            onClick={() =>
                              handleView(user)
                            }
                          >
                            <FaEye />
                          </button>

                          <button
                            type="button"
                            className={`user-action-btn status ${
                              user.is_active
                                ? "deactivate"
                                : "activate"
                            }`}
                            title={
                              user.is_active
                                ? "Deactivate Account"
                                : "Activate Account"
                            }
                            onClick={() =>
                              handleStatusChange(user)
                            }
                          >
                            {user.is_active ? (
                              <FaUserSlash />
                            ) : (
                              <FaUserCheck />
                            )}
                          </button>

                          <button
                            type="button"
                            className="user-action-btn"
                            title="Delete User"
                            onClick={() => handleDelete(user)}
                          >
                            <FaTrashAlt />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="no-users"
                    >
                      <FaUsers />

                      <strong>
                        No users found
                      </strong>

                      <span>
                        Try changing your search or
                        filter.
                      </span>
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

export default ManageUsers;