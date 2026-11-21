import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

import {
  FaUser,
  FaBoxOpen,
  FaHeart,
  FaMapMarkerAlt,
  FaLock,
  FaSignOutAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaSave,
  FaTimes,
  FaShoppingBag,
  FaCreditCard,
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaHome,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaShieldAlt,
  FaBan,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { useOrders } from "../../context/OrderContext";
import { useAddresses } from "../../context/AddressContext";

import "../../styles/account.css";

function Account() {
  const navigate = useNavigate();

  const { user, updateProfile, changePassword, logout } = useAuth();
  const { orders, cancelOrder } = useOrders();
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const handleCancelOrder = async (order) => {
    const confirmCancel = window.confirm(
      `Cancel order ${order.id}? This cannot be undone.`
    );

    if (!confirmCancel) return;

    setCancellingOrderId(order.dbId);

    try {
      await cancelOrder(order.dbId);
    } catch {
      // Failure toast is already shown by OrderContext.
    } finally {
      setCancellingOrderId(null);
    }
  };

  const {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // =========================================================
  // ACTIVE SECTION
  // =========================================================

  const [searchParams] = useSearchParams();

  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab === "orders") {
      setActiveSection("orders");
    } else if (tab === "addresses") {
      setActiveSection("addresses");
    } else {
      setActiveSection("profile");
    }
  }, [searchParams]);

  // =========================================================
  // PROFILE EDIT
  // =========================================================

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [errors, setErrors] = useState({});
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // =========================================================
  // ADDRESS STATE
  // =========================================================

  const emptyAddressForm = {
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    addressType: "Home",
    isDefault: false,
  };

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [addressErrors, setAddressErrors] = useState({});
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressServerError, setAddressServerError] = useState("");

  // =========================================================
  // CHANGE PASSWORD STATE
  // =========================================================

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordServerError, setPasswordServerError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // =========================================================
  // PROFILE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setProfileError("");
  };

  // =========================================================
  // OPEN SECTIONS
  // =========================================================

  const openProfile = () => {
    setActiveSection("profile");
    setIsEditing(false);
    setErrors({});
  };

  const openOrders = () => {
    setActiveSection("orders");
    setIsEditing(false);
    setErrors({});
  };

  const openAddresses = () => {
    setActiveSection("addresses");
    setIsEditing(false);
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressErrors({});
  };

  const openPassword = () => {
    setActiveSection("password");
    setIsEditing(false);

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordErrors({});
    setPasswordSuccess("");
    setPasswordServerError("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // =========================================================
  // EDIT PROFILE
  // =========================================================

  const handleEdit = () => {
    setFormData({ name: user.name, email: user.email || "" });
    setErrors({});
    setProfileError("");
    setIsEditing(true);
  };

  // =========================================================
  // PROFILE VALIDATION
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must contain at least 3 characters";
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Enter a valid email address";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSavingProfile(true);
    setProfileError("");

    try {
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim() || null,
      });

      setIsEditing(false);
      setErrors({});
    } catch (error) {
      setProfileError(
        error.response?.data?.message || "Could not update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: user.name, email: user.email || "" });
    setErrors({});
    setProfileError("");
    setIsEditing(false);
  };

  // =========================================================
  // ORDER DATE
  // =========================================================

  const formatOrderDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // ADDRESS CHANGE
  // =========================================================

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;

    let finalValue = type === "checkbox" ? checked : value;

    if (name === "phone") {
      finalValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "pincode") {
      finalValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setAddressForm((prev) => ({ ...prev, [name]: finalValue }));
    setAddressErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const openNewAddressForm = () => {
    setAddressForm({
      ...emptyAddressForm,
      fullName: user.name,
      phone: "",
    });

    setEditingAddressId(null);
    setAddressErrors({});
    setAddressServerError("");
    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      fullName: address.fullName || "",
      phone: address.phone || "",
      address: address.address || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      addressType: address.addressType || "Home",
      isDefault: Boolean(address.isDefault),
    });

    setEditingAddressId(address.id);
    setAddressErrors({});
    setAddressServerError("");
    setShowAddressForm(true);
  };

  const validateAddress = () => {
    const newErrors = {};

    if (!addressForm.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (addressForm.fullName.trim().length < 3) {
      newErrors.fullName = "Enter a valid full name";
    }

    if (!addressForm.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(addressForm.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!addressForm.address.trim()) {
      newErrors.address = "Address is required";
    } else if (addressForm.address.trim().length < 10) {
      newErrors.address = "Please enter a complete address";
    }

    if (!addressForm.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!addressForm.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!addressForm.pincode.trim()) {
      newErrors.pincode = "PIN code is required";
    } else if (!/^\d{6}$/.test(addressForm.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit PIN code";
    }

    setAddressErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (!validateAddress()) {
      return;
    }

    const cleanedAddress = {
      ...addressForm,
      fullName: addressForm.fullName.trim(),
      address: addressForm.address.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
    };

    setSavingAddress(true);
    setAddressServerError("");

    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, cleanedAddress);
      } else {
        await addAddress(cleanedAddress);
      }

      setAddressForm(emptyAddressForm);
      setEditingAddressId(null);
      setAddressErrors({});
      setShowAddressForm(false);
    } catch (error) {
      setAddressServerError(
        error.response?.data?.message || "Could not save address"
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const cancelAddressForm = () => {
    setAddressForm(emptyAddressForm);
    setEditingAddressId(null);
    setAddressErrors({});
    setAddressServerError("");
    setShowAddressForm(false);
  };

  const handleDeleteAddress = async (id) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (shouldDelete) {
      try {
        await deleteAddress(id);
      } catch {
        // Failure toast is already shown by AddressContext.
      }
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await setDefaultAddress(id);
    } catch {
      // Failure toast is already shown by AddressContext.
    }
  };

  // =========================================================
  // PASSWORD CHANGE
  // =========================================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    setPasswordSuccess("");
    setPasswordServerError("");
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = "Password must contain at least 6 characters";
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (
      passwordForm.currentPassword &&
      passwordForm.newPassword &&
      passwordForm.currentPassword === passwordForm.newPassword
    ) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setPasswordErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordSuccess("");
    setPasswordServerError("");

    if (!validatePassword()) {
      return;
    }

    setChangingPassword(true);

    try {
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      setPasswordSuccess("Password changed successfully!");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordErrors({});
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      setPasswordServerError(
        error.response?.data?.message || "Could not change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePasswordCancel = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordErrors({});
    setPasswordSuccess("");
    setPasswordServerError("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setActiveSection("profile");
  };

  if (!user) {
    return null;
  }

  const roleLabel =
    user.role.charAt(0) + user.role.slice(1).toLowerCase();

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="account-page">
      <div className="account-heading">
        <h1>My Account</h1>
        <p>Manage your profile, orders and account settings</p>
      </div>

      <div className="account-layout">
        {/* SIDEBAR */}

        <aside className="account-sidebar">
          <div className="account-user">
            <div className="account-avatar">
              <FaUser />
            </div>

            <div>
              <small>Welcome</small>
              <h3>{user.name}</h3>
            </div>
          </div>

          <div className="account-menu">
            <button
              type="button"
              className={`account-menu-item ${
                activeSection === "profile" ? "active" : ""
              }`}
              onClick={openProfile}
            >
              <FaUser />
              My Profile
            </button>

            <button
              type="button"
              className={`account-menu-item ${
                activeSection === "orders" ? "active" : ""
              }`}
              onClick={openOrders}
            >
              <FaBoxOpen />
              My Orders
            </button>

            <Link to="/wishlist" className="account-menu-item">
              <FaHeart />
              My Wishlist
            </Link>

            <button
              type="button"
              className={`account-menu-item ${
                activeSection === "addresses" ? "active" : ""
              }`}
              onClick={openAddresses}
            >
              <FaMapMarkerAlt />
              Saved Addresses
            </button>

            <button
              type="button"
              className={`account-menu-item ${
                activeSection === "password" ? "active" : ""
              }`}
              onClick={openPassword}
            >
              <FaLock />
              Change Password
            </button>

            <button
              type="button"
              className="account-menu-item logout"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}

        <main className="account-content">
          {/* PROFILE */}

          {activeSection === "profile" && (
            <>
              <div className="profile-header">
                <div>
                  <h2>My Profile</h2>
                  <p>View and manage your personal information.</p>
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    className="edit-profile-btn"
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="profile-divider" />

              <div className="profile-avatar-section">
                <div className="profile-big-avatar">
                  <FaUser />
                </div>

                <div>
                  <h3>{user.name}</h3>
                  <p>{roleLabel} Account</p>
                </div>
              </div>

              <div className="profile-section">
                <h3>Personal Information</h3>

                {!isEditing ? (
                  <div className="profile-info-grid">
                    <div className="profile-info-box">
                      <span>Full Name</span>
                      <strong>{user.name}</strong>
                    </div>

                    <div className="profile-info-box">
                      <span>Email Address</span>

                      <strong>
                        <FaEnvelope />
                        {user.email || "Not added"}
                      </strong>
                    </div>

                    <div className="profile-info-box">
                      <span>Phone Number</span>

                      <strong>
                        <FaPhoneAlt />
                        +91 {user.phone}
                      </strong>
                    </div>

                    <div className="profile-info-box">
                      <span>Account Type</span>
                      <strong>{roleLabel}</strong>
                    </div>
                  </div>
                ) : (
                  <form
                    className="account-edit-form"
                    onSubmit={handleSave}
                    noValidate
                  >
                    <div className="account-edit-grid">
                      <div className="account-edit-field">
                        <label>Full Name</label>

                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={
                            errors.name ? "account-input-error" : ""
                          }
                        />

                        {errors.name && (
                          <span className="account-error">
                            {errors.name}
                          </span>
                        )}
                      </div>

                      <div className="account-edit-field">
                        <label>Email Address (optional)</label>

                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={
                            errors.email ? "account-input-error" : ""
                          }
                        />

                        {errors.email && (
                          <span className="account-error">
                            {errors.email}
                          </span>
                        )}
                      </div>

                      <div className="account-edit-field">
                        <label>Phone Number</label>

                        <div className="account-phone-field">
                          <span>+91</span>
                          <input type="tel" value={user.phone} disabled />
                        </div>

                        <span className="account-error" style={{ color: "#888" }}>
                          Phone number can't be changed
                        </span>
                      </div>

                      <div className="account-edit-field">
                        <label>Account Type</label>
                        <input type="text" value={roleLabel} disabled />
                      </div>
                    </div>

                    {profileError && (
                      <p className="account-error">{profileError}</p>
                    )}

                    <div className="account-edit-actions">
                      <button
                        type="button"
                        className="account-cancel-btn"
                        onClick={handleCancel}
                      >
                        <FaTimes />
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="account-save-btn"
                        disabled={savingProfile}
                      >
                        <FaSave />
                        {savingProfile ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="profile-section">
                <h3>Quick Access</h3>

                <div className="account-quick-grid">
                  <button
                    type="button"
                    className="account-quick-card"
                    onClick={openOrders}
                  >
                    <FaBoxOpen />

                    <div>
                      <strong>My Orders</strong>
                      <span>View order history</span>
                    </div>
                  </button>

                  <Link to="/wishlist" className="account-quick-card">
                    <FaHeart />

                    <div>
                      <strong>Wishlist</strong>
                      <span>View saved products</span>
                    </div>
                  </Link>

                  <button
                    type="button"
                    className="account-quick-card"
                    onClick={openAddresses}
                  >
                    <FaMapMarkerAlt />

                    <div>
                      <strong>Addresses</strong>
                      <span>Manage addresses</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ORDERS */}

          {activeSection === "orders" && (
            <div className="orders-section">
              <div className="orders-page-header">
                <div>
                  <h2>My Orders</h2>
                  <p>View your order history and order details.</p>
                </div>

                {orders.length > 0 && (
                  <span className="orders-count">
                    {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                  </span>
                )}
              </div>

              <div className="profile-divider" />

              {orders.length === 0 ? (
                <div className="orders-empty">
                  <div className="orders-empty-icon">
                    <FaShoppingBag />
                  </div>

                  <h3>No orders yet</h3>

                  <p>
                    You haven't placed any orders yet. Start shopping and
                    your orders will appear here.
                  </p>

                  <Link to="/products" className="orders-shop-btn">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div className="order-history-card" key={order.id}>
                      <div className="order-history-header">
                        <div className="order-number">
                          <span>Order Number</span>
                          <strong>{order.id}</strong>
                        </div>

                        <div className="order-date">
                          <FaCalendarAlt />
                          <span>{formatOrderDate(order.orderDate)}</span>
                        </div>

                        <span className="order-status">{order.status}</span>

                        {order.status === "PLACED" && (
                          <button
                            type="button"
                            className="order-cancel-btn"
                            onClick={() => handleCancelOrder(order)}
                            disabled={cancellingOrderId === order.dbId}
                          >
                            <FaBan />
                            {cancellingOrderId === order.dbId
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </button>
                        )}
                      </div>

                      <div className="order-history-products">
                        {order.items?.map((item) => (
                          <div className="order-history-product" key={item.id}>
                            <img src={item.image} alt={item.name} />

                            <div className="order-product-details">
                              <strong>{item.name}</strong>
                              <span>Quantity: {item.quantity}</span>
                            </div>

                            <strong className="order-product-price">
                              ₹{item.price * item.quantity}
                            </strong>
                          </div>
                        ))}
                      </div>

                      <div className="order-information-grid">
                        <div className="order-info-card">
                          <div className="order-info-title">
                            <FaMapMarkerAlt />
                            <strong>Delivery Address</strong>
                          </div>

                          <p>{order.customer?.fullName}</p>
                          <p>{order.shippingAddress?.address}</p>

                          <p>
                            {order.shippingAddress?.city},{" "}
                            {order.shippingAddress?.state} -{" "}
                            {order.shippingAddress?.pincode}
                          </p>

                          <p>+91 {order.customer?.phone}</p>
                        </div>

                        <div className="order-info-card">
                          <div className="order-info-title">
                            <FaCreditCard />
                            <strong>Payment</strong>
                          </div>

                          <p>{order.paymentMethod}</p>
                          <p>{order.paymentStatus}</p>
                        </div>
                      </div>

                      <div className="order-price-summary">
                        <div>
                          <span>Subtotal</span>
                          <strong>₹{order.subtotal}</strong>
                        </div>

                        <div>
                          <span>Shipping</span>
                          <strong>
                            {order.shipping === 0
                              ? "FREE"
                              : `₹${order.shipping}`}
                          </strong>
                        </div>

                        <div className="order-final-total">
                          <span>Total</span>
                          <strong>₹{order.total}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SAVED ADDRESSES */}

          {activeSection === "addresses" && (
            <div className="addresses-section">
              <div className="addresses-header">
                <div>
                  <h2>Saved Addresses</h2>
                  <p>Add and manage your delivery addresses.</p>
                </div>

                {!showAddressForm && (
                  <button
                    type="button"
                    className="add-address-btn"
                    onClick={openNewAddressForm}
                  >
                    <FaPlus />
                    Add New Address
                  </button>
                )}
              </div>

              <div className="profile-divider" />

              {showAddressForm && (
                <form
                  className="address-form"
                  onSubmit={handleSaveAddress}
                  noValidate
                >
                  <div className="address-form-header">
                    <div>
                      <h3>
                        {editingAddressId ? "Edit Address" : "Add New Address"}
                      </h3>
                      <p>Enter your delivery address details.</p>
                    </div>
                  </div>

                  <div className="address-form-grid">
                    <div className="address-field">
                      <label>Full Name</label>

                      <input
                        type="text"
                        name="fullName"
                        placeholder="Enter full name"
                        value={addressForm.fullName}
                        onChange={handleAddressChange}
                        className={
                          addressErrors.fullName ? "address-input-error" : ""
                        }
                      />

                      {addressErrors.fullName && (
                        <span className="address-error">
                          {addressErrors.fullName}
                        </span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>Phone Number</label>

                      <input
                        type="tel"
                        name="phone"
                        placeholder="10-digit phone number"
                        value={addressForm.phone}
                        maxLength="10"
                        onChange={handleAddressChange}
                        className={
                          addressErrors.phone ? "address-input-error" : ""
                        }
                      />

                      {addressErrors.phone && (
                        <span className="address-error">
                          {addressErrors.phone}
                        </span>
                      )}
                    </div>

                    <div className="address-field address-full-width">
                      <label>Address</label>

                      <textarea
                        name="address"
                        rows="3"
                        placeholder="House number, street, area..."
                        value={addressForm.address}
                        onChange={handleAddressChange}
                        className={
                          addressErrors.address ? "address-input-error" : ""
                        }
                      />

                      {addressErrors.address && (
                        <span className="address-error">
                          {addressErrors.address}
                        </span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>City</label>

                      <input
                        type="text"
                        name="city"
                        placeholder="Enter city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        className={
                          addressErrors.city ? "address-input-error" : ""
                        }
                      />

                      {addressErrors.city && (
                        <span className="address-error">
                          {addressErrors.city}
                        </span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>State</label>

                      <input
                        type="text"
                        name="state"
                        placeholder="Enter state"
                        value={addressForm.state}
                        onChange={handleAddressChange}
                        className={
                          addressErrors.state ? "address-input-error" : ""
                        }
                      />

                      {addressErrors.state && (
                        <span className="address-error">
                          {addressErrors.state}
                        </span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>PIN Code</label>

                      <input
                        type="text"
                        name="pincode"
                        placeholder="6-digit PIN code"
                        value={addressForm.pincode}
                        maxLength="6"
                        inputMode="numeric"
                        onChange={handleAddressChange}
                        className={
                          addressErrors.pincode ? "address-input-error" : ""
                        }
                      />

                      {addressErrors.pincode && (
                        <span className="address-error">
                          {addressErrors.pincode}
                        </span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>Address Type</label>

                      <select
                        name="addressType"
                        value={addressForm.addressType}
                        onChange={handleAddressChange}
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="address-default-field address-full-width">
                      <label>
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={addressForm.isDefault}
                          onChange={handleAddressChange}
                        />

                        <span>Make this my default delivery address</span>
                      </label>
                    </div>
                  </div>

                  {addressServerError && (
                    <p className="address-error">{addressServerError}</p>
                  )}

                  <div className="address-form-actions">
                    <button
                      type="button"
                      className="address-cancel-btn"
                      onClick={cancelAddressForm}
                    >
                      <FaTimes />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="address-save-btn"
                      disabled={savingAddress}
                    >
                      <FaSave />
                      {savingAddress
                        ? "Saving..."
                        : editingAddressId
                        ? "Update Address"
                        : "Save Address"}
                    </button>
                  </div>
                </form>
              )}

              {!showAddressForm && (
                <>
                  {addresses.length === 0 ? (
                    <div className="address-empty">
                      <div className="address-empty-icon">
                        <FaMapMarkerAlt />
                      </div>

                      <h3>No saved addresses</h3>

                      <p>Add a delivery address to make checkout faster.</p>

                      <button
                        type="button"
                        className="add-address-btn"
                        onClick={openNewAddressForm}
                      >
                        <FaPlus />
                        Add Address
                      </button>
                    </div>
                  ) : (
                    <div className="saved-address-grid">
                      {addresses.map((address) => (
                        <div
                          className={`saved-address-card ${
                            address.isDefault ? "default-address" : ""
                          }`}
                          key={address.id}
                        >
                          <div className="saved-address-top">
                            <div className="address-type">
                              <FaHome />
                              <strong>{address.addressType}</strong>
                            </div>

                            {address.isDefault && (
                              <span className="default-address-badge">
                                <FaCheckCircle />
                                Default
                              </span>
                            )}
                          </div>

                          <div className="saved-address-details">
                            <h3>{address.fullName}</h3>
                            <p>{address.address}</p>

                            <p>
                              {address.city}, {address.state} -{" "}
                              {address.pincode}
                            </p>

                            <p>+91 {address.phone}</p>
                          </div>

                          <div className="saved-address-actions">
                            {!address.isDefault && (
                              <button
                                type="button"
                                className="set-default-btn"
                                onClick={() => handleSetDefaultAddress(address.id)}
                              >
                                Set as Default
                              </button>
                            )}

                            <button
                              type="button"
                              className="address-edit-btn"
                              onClick={() => handleEditAddress(address)}
                            >
                              <FaEdit />
                              Edit
                            </button>

                            <button
                              type="button"
                              className="address-delete-btn"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              <FaTrash />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* CHANGE PASSWORD */}

          {activeSection === "password" && (
            <div className="password-section">
              <div className="password-section-header">
                <div className="password-heading-icon">
                  <FaShieldAlt />
                </div>

                <div>
                  <h2>Change Password</h2>
                  <p>
                    Update your password to keep your ShopSphere account
                    secure.
                  </p>
                </div>
              </div>

              <div className="profile-divider" />

              <div className="password-security-note">
                <FaLock />

                <div>
                  <strong>Keep your account secure</strong>
                  <span>
                    Use a strong password that you don't use on other
                    websites.
                  </span>
                </div>
              </div>

              {passwordSuccess && (
                <div className="password-success-message">
                  <FaCheckCircle />

                  <div>
                    <strong>Password Updated</strong>
                    <span>{passwordSuccess}</span>
                  </div>
                </div>
              )}

              {passwordServerError && (
                <p className="password-error">{passwordServerError}</p>
              )}

              <form
                className="change-password-form"
                onSubmit={handlePasswordSubmit}
                noValidate
              >
                <div className="password-form-field">
                  <label>Current Password</label>

                  <div className="account-password-input">
                    <FaKey className="password-left-icon" />

                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      placeholder="Enter your current password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className={
                        passwordErrors.currentPassword
                          ? "password-input-error"
                          : ""
                      }
                    />

                    <button
                      type="button"
                      className="account-password-toggle"
                      onClick={() =>
                        setShowCurrentPassword((prev) => !prev)
                      }
                      aria-label="Show or hide current password"
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {passwordErrors.currentPassword && (
                    <span className="password-error">
                      {passwordErrors.currentPassword}
                    </span>
                  )}
                </div>

                <div className="password-form-field">
                  <label>New Password</label>

                  <div className="account-password-input">
                    <FaLock className="password-left-icon" />

                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="Create a new password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className={
                        passwordErrors.newPassword
                          ? "password-input-error"
                          : ""
                      }
                    />

                    <button
                      type="button"
                      className="account-password-toggle"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      aria-label="Show or hide new password"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {passwordErrors.newPassword && (
                    <span className="password-error">
                      {passwordErrors.newPassword}
                    </span>
                  )}
                </div>

                <div className="password-requirements">
                  <strong>Your password should contain:</strong>

                  <div className="password-requirement-grid">
                    <span
                      className={
                        passwordForm.newPassword.length >= 6 ? "valid" : ""
                      }
                    >
                      <FaCheckCircle />
                      At least 6 characters
                    </span>
                  </div>
                </div>

                <div className="password-form-field">
                  <label>Confirm New Password</label>

                  <div className="account-password-input">
                    <FaLock className="password-left-icon" />

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Re-enter your new password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className={
                        passwordErrors.confirmPassword
                          ? "password-input-error"
                          : ""
                      }
                    />

                    <button
                      type="button"
                      className="account-password-toggle"
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                      aria-label="Show or hide confirm password"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {passwordErrors.confirmPassword && (
                    <span className="password-error">
                      {passwordErrors.confirmPassword}
                    </span>
                  )}
                </div>

                <div className="password-form-actions">
                  <button
                    type="button"
                    className="password-cancel-btn"
                    onClick={handlePasswordCancel}
                  >
                    <FaTimes />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="password-save-btn"
                    disabled={changingPassword}
                  >
                    <FaLock />
                    {changingPassword ? "Updating..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Account;
