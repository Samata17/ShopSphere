import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useAddresses } from "../../context/AddressContext";

import {
  FaMapMarkerAlt,
  FaCheckCircle,
  FaPlus,
  FaHome,
  FaShoppingBag,
  FaArrowRight,
} from "react-icons/fa";

import "../../styles/checkout.css";

const SHIPPING_FEE = 49;
const FREE_SHIPPING_THRESHOLD = 999;

function Checkout() {
  const navigate = useNavigate();

  /* =========================================================
     CONTEXT
  ========================================================= */

  const { cartItems } = useCart();
  const { addresses, addAddress, defaultAddress } = useAddresses();

  /* =========================================================
     SAVED ADDRESS
  ========================================================= */

  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [useManualAddress, setUseManualAddress] = useState(
    addresses.length === 0
  );

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  /* =========================================================
     FORM
  ========================================================= */

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});

  /* =========================================================
     DEFAULT ADDRESS
  ========================================================= */

  useEffect(() => {
    if (defaultAddress && !selectedAddressId) {
      setSelectedAddressId(defaultAddress.id);
      setUseManualAddress(false);

      setFormData((prev) => ({
        ...prev,
        fullName: defaultAddress.fullName || "",
        phone: defaultAddress.phone || "",
        address: defaultAddress.address || "",
        city: defaultAddress.city || "",
        state: defaultAddress.state || "",
        pincode: defaultAddress.pincode || "",
      }));
    }
  }, [defaultAddress, selectedAddressId]);

  /* =========================================================
     SELECT FIRST ADDRESS
  ========================================================= */

  useEffect(() => {
    if (
      addresses.length > 0 &&
      !defaultAddress &&
      !selectedAddressId &&
      !useManualAddress
    ) {
      const firstAddress = addresses[0];

      setSelectedAddressId(firstAddress.id);

      setFormData((prev) => ({
        ...prev,
        fullName: firstAddress.fullName || "",
        phone: firstAddress.phone || "",
        address: firstAddress.address || "",
        city: firstAddress.city || "",
        state: firstAddress.state || "",
        pincode: firstAddress.pincode || "",
      }));
    }
  }, [addresses, defaultAddress, selectedAddressId, useManualAddress]);

  /* =========================================================
     SELECT SAVED ADDRESS
  ========================================================= */

  const handleSelectAddress = (savedAddress) => {
    if (selectedAddressId === savedAddress.id && !useManualAddress) {
      setSelectedAddressId(null);
      return;
    }

    setSelectedAddressId(savedAddress.id);
    setUseManualAddress(false);

    setFormData((prev) => ({
      ...prev,
      fullName: savedAddress.fullName || "",
      phone: savedAddress.phone || "",
      address: savedAddress.address || "",
      city: savedAddress.city || "",
      state: savedAddress.state || "",
      pincode: savedAddress.pincode || "",
    }));

    setErrors({});
  };

  /* =========================================================
     USE DIFFERENT ADDRESS
  ========================================================= */

  const handleManualAddress = () => {
    setSelectedAddressId(null);
    setUseManualAddress(true);

    setFormData({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });

    setErrors({});
  };

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === "phone") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "pincode") {
      newValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* =========================================================
     TOTALS
  ========================================================= */

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;

  const total = subtotal + shipping;

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must contain at least 3 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Delivery address is required";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Please enter a complete delivery address";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "PIN code is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit PIN code";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================================================
     CONTINUE TO PAYMENT
  ========================================================= */

  const handleContinueToPayment = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      let addressId = selectedAddressId;

      if (useManualAddress || !addressId) {
        const savedAddress = await addAddress({
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          addressType: "Home",
          isDefault: addresses.length === 0,
        });

        addressId = savedAddress.id;
      }

      sessionStorage.setItem(
        "shopsphere-checkout",
        JSON.stringify({ addressId, subtotal, shipping, total })
      );

      navigate("/payment");

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
          "Could not save your address. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="checkout-page">
      {/* PROGRESS */}

      <div className="checkout-progress">
        <div className="checkout-progress-step completed">
          <div className="progress-circle">✓</div>
          <span>Cart</span>
        </div>

        <div className="progress-line completed" />

        <div className="checkout-progress-step active">
          <div className="progress-circle">2</div>
          <span>Shipping</span>
        </div>

        <div className="progress-line" />

        <div className="checkout-progress-step">
          <div className="progress-circle">3</div>
          <span>Payment</span>
        </div>

        <div className="progress-line" />

        <div className="checkout-progress-step">
          <div className="progress-circle">4</div>
          <span>Place Order</span>
        </div>
      </div>

      {/* HEADING */}

      <div className="checkout-heading">
        <span>SHIPPING</span>
        <h1>Shipping Details</h1>
        <p>Select or enter the address where you want your order delivered.</p>
      </div>

      {/* LAYOUT */}

      <form
        className="checkout-layout"
        onSubmit={handleContinueToPayment}
        noValidate
      >
        {/* LEFT SIDE */}

        <div className="checkout-left">
          <div className="checkout-section">
            <div className="checkout-section-title">
              <FaMapMarkerAlt />

              <div>
                <h2>Shipping Address</h2>
                <p>Where should we deliver your order?</p>
              </div>
            </div>

            {/* SAVED ADDRESSES */}

            {addresses.length > 0 && (
              <div className="checkout-saved-addresses">
                <div className="checkout-address-heading">
                  <div>
                    <h3>Saved Addresses</h3>
                    <p>Select an address for this order.</p>
                  </div>
                </div>

                <div className="checkout-address-list">
                  {addresses.map((savedAddress) => (
                    <button
                      key={savedAddress.id}
                      type="button"
                      className={`checkout-address-card ${
                        selectedAddressId === savedAddress.id &&
                        !useManualAddress
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectAddress(savedAddress)}
                    >
                      <div className="checkout-address-card-top">
                        <div className="checkout-address-type">
                          <FaHome />
                          <strong>{savedAddress.addressType}</strong>
                        </div>

                        {savedAddress.isDefault && (
                          <span className="checkout-default-badge">
                            Default
                          </span>
                        )}

                        {selectedAddressId === savedAddress.id &&
                          !useManualAddress && (
                            <FaCheckCircle className="checkout-selected-check" />
                          )}
                      </div>

                      <strong className="checkout-address-name">
                        {savedAddress.fullName}
                      </strong>

                      <span>{savedAddress.address}</span>

                      <span>
                        {savedAddress.city}, {savedAddress.state} -{" "}
                        {savedAddress.pincode}
                      </span>

                      <span>+91 {savedAddress.phone}</span>
                    </button>
                  ))}
                </div>

                {!selectedAddressId && (
                  <button
                    type="button"
                    className={`checkout-different-address ${
                      useManualAddress ? "active" : ""
                    }`}
                    onClick={handleManualAddress}
                  >
                    <FaPlus />
                    Use a Different Address
                  </button>
                )}
              </div>
            )}

            {/* ADDRESS FORM */}

            {(useManualAddress || addresses.length === 0) && (
              <div className="checkout-form-grid">
                <div className="checkout-field full-width">
                  <label>Full Name</label>

                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? "checkout-input-error" : ""}
                  />

                  {errors.fullName && (
                    <span className="checkout-error">{errors.fullName}</span>
                  )}
                </div>

                <div className="checkout-field">
                  <label>Phone Number</label>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter 10-digit phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength="10"
                    className={errors.phone ? "checkout-input-error" : ""}
                  />

                  {errors.phone && (
                    <span className="checkout-error">{errors.phone}</span>
                  )}
                </div>

                <div className="checkout-field full-width">
                  <label>Address</label>

                  <textarea
                    name="address"
                    rows="3"
                    placeholder="House number, street, area..."
                    value={formData.address}
                    onChange={handleChange}
                    className={errors.address ? "checkout-input-error" : ""}
                  />

                  {errors.address && (
                    <span className="checkout-error">{errors.address}</span>
                  )}
                </div>

                <div className="checkout-field">
                  <label>City</label>

                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? "checkout-input-error" : ""}
                  />

                  {errors.city && (
                    <span className="checkout-error">{errors.city}</span>
                  )}
                </div>

                <div className="checkout-field">
                  <label>State</label>

                  <input
                    type="text"
                    name="state"
                    placeholder="Enter state"
                    value={formData.state}
                    onChange={handleChange}
                    className={errors.state ? "checkout-input-error" : ""}
                  />

                  {errors.state && (
                    <span className="checkout-error">{errors.state}</span>
                  )}
                </div>

                <div className="checkout-field full-width">
                  <label>PIN Code</label>

                  <input
                    type="text"
                    name="pincode"
                    placeholder="Enter 6-digit PIN code"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength="6"
                    inputMode="numeric"
                    className={errors.pincode ? "checkout-input-error" : ""}
                  />

                  {errors.pincode && (
                    <span className="checkout-error">{errors.pincode}</span>
                  )}
                </div>
              </div>
            )}

            {submitError && (
              <p className="checkout-error" style={{ marginTop: "12px" }}>
                {submitError}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE — ORDER SUMMARY */}

        <div className="checkout-summary">
          <div className="summary-heading">
            <FaShoppingBag />
            <h2>Order Summary</h2>
          </div>

          {cartItems.length === 0 ? (
            <div className="checkout-empty">
              <p>Your cart is empty.</p>

              <button
                type="button"
                className="place-order-btn"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="summary-products">
                {cartItems.map((item) => (
                  <div className="summary-product" key={item.id}>
                    <img src={item.image} alt={item.name} />

                    <div className="summary-product-info">
                      <strong>{item.name}</strong>
                      <span>Qty: {item.quantity}</span>
                    </div>

                    <strong className="summary-product-price">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              <div className="summary-row">
                <span>Subtotal</span>
                <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
              </div>

              <div className="summary-row">
                <span>Shipping</span>

                <strong
                  style={{ color: shipping === 0 ? "#169b45" : "inherit" }}
                >
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </strong>
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total Amount</span>
                <strong>₹{total.toLocaleString("en-IN")}</strong>
              </div>

              <button
                type="submit"
                className="place-order-btn"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Continue to Payment"}
                <FaArrowRight />
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default Checkout;
