import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrderContext";

import {
  FaCreditCard,
  FaMoneyBillWave,
  FaMobileAlt,
  FaShoppingBag,
  FaLock,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";

import gpay from "../../assets/payment/gpay.png";
import phonepe from "../../assets/payment/phonepe.png";
import paytm from "../../assets/payment/paytm.png";

import visa from "../../assets/payment/visa.png";
import mastercard from "../../assets/payment/mastercard.png";
import rupay from "../../assets/payment/rupay.png";

import "../../styles/checkout.css";

const PAYMENT_LABELS = {
  UPI: "UPI / QR Code",
  CARD: "Credit / Debit Card",
  COD: "Cash on Delivery",
};

function Payment() {
  const navigate = useNavigate();

  const { cartItems, refreshCart } = useCart();
  const { checkout } = useOrders();

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [checkoutData, setCheckoutData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  /* =========================================================
     GET CHECKOUT DATA (address + totals from Checkout.jsx)
  ========================================================= */

  useEffect(() => {
    const saved = sessionStorage.getItem("shopsphere-checkout");

    if (!saved) {
      navigate("/checkout", { replace: true });
      return;
    }

    try {
      setCheckoutData(JSON.parse(saved));
    } catch {
      sessionStorage.removeItem("shopsphere-checkout");
      navigate("/checkout", { replace: true });
    }
  }, [navigate]);

  /* =========================================================
     PLACE ORDER
  ========================================================= */

  const handlePlaceOrder = async () => {
    if (!checkoutData || cartItems.length === 0) {
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Dummy payment gateway — no real card/UPI details are ever
      // captured or sent anywhere. A short delay stands in for the
      // "processing" step a real gateway would need; COD skips it.
      if (paymentMethod !== "COD") {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      const order = await checkout(checkoutData.addressId, paymentMethod);

      setPlacedOrder(order);
      setOrderPlaced(true);

      await refreshCart();

      sessionStorage.removeItem("shopsphere-checkout");

      window.scrollTo({ top: 0, behavior: "smooth" });

      // Give the user a moment to see the confirmation, then take them to
      // their order history automatically.
      setTimeout(() => {
        navigate("/account?tab=orders");
      }, 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not place your order. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  /* =========================================================
     ORDER SUCCESS
  ========================================================= */

  if (orderPlaced && placedOrder) {
    return (
      <div className="order-success-page">
        <div className="order-success-box">
          <div className="success-check">✓</div>

          <h1>Order Placed Successfully!</h1>

          <p>Thank you for shopping with ShopSphere.</p>

          <div
            style={{
              margin: "20px 0",
              padding: "15px",
              background: "#f7f4ff",
              borderRadius: "8px",
            }}
          >
            <span
              style={{
                display: "block",
                color: "#888",
                fontSize: "12px",
                marginBottom: "5px",
              }}
            >
              Your Order Number
            </span>

            <strong style={{ color: "#7045e7", fontSize: "17px" }}>
              {placedOrder.order_number}
            </strong>
          </div>

          <p>
            Order Total:{" "}
            <strong>
              ₹{Number(placedOrder.total).toLocaleString("en-IN")}
            </strong>
          </p>

          <p>
            Payment:{" "}
            <strong>{PAYMENT_LABELS[placedOrder.payment_method]}</strong>
          </p>

          <p className="order-success-note">
            {placedOrder.payment_method === "COD"
              ? "Pay in cash when your order is delivered."
              : "Payment received. We'll notify you as your order ships."}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "25px",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/products")}
              style={{
                padding: "11px 18px",
                border: "1px solid #7045e7",
                borderRadius: "7px",
                background: "#fff",
                color: "#7045e7",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Continue Shopping
            </button>

            <button
              type="button"
              onClick={() => navigate("/account?tab=orders")}
              style={{
                padding: "11px 18px",
                border: "none",
                borderRadius: "7px",
                background: "#7045e7",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!checkoutData) {
    return null;
  }

  const { subtotal, shipping, total } = checkoutData;

  /* =========================================================
     PAYMENT PAGE
  ========================================================= */

  return (
    <div className="checkout-page">
      <div className="checkout-progress">
        <div className="checkout-progress-step completed">
          <div className="progress-circle">✓</div>
          <span>Cart</span>
        </div>

        <div className="progress-line completed" />

        <div className="checkout-progress-step completed">
          <div className="progress-circle">✓</div>
          <span>Shipping</span>
        </div>

        <div className="progress-line completed" />

        <div className="checkout-progress-step active">
          <div className="progress-circle">3</div>
          <span>Payment</span>
        </div>

        <div className="progress-line" />

        <div className="checkout-progress-step">
          <div className="progress-circle">4</div>
          <span>Place Order</span>
        </div>
      </div>

      <div className="checkout-heading">
        <span>SECURE PAYMENT</span>
        <h1>Payment</h1>
        <p>Choose your preferred payment method to complete your order.</p>
      </div>

      <div className="checkout-layout">
        <div className="checkout-left">
          <div className="checkout-section payment-section">
            <div className="checkout-section-title">
              <FaCreditCard />

              <div>
                <h2>Payment Options</h2>
                <p>This is a demo checkout — no real payment is processed.</p>
              </div>
            </div>

            <div className="payment-options">
              {/* UPI */}

              <label
                className={`payment-option ${
                  paymentMethod === "UPI" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === "UPI"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />

                <FaMobileAlt />

                <div className="payment-option-content">
                  <strong>UPI / QR Code</strong>
                  <span>Pay using Google Pay, PhonePe or Paytm</span>

                  <div className="payment-brands payment-logo-row">
                    <img src={gpay} alt="Google Pay" />
                    <img src={phonepe} alt="PhonePe" />
                    <img src={paytm} alt="Paytm" />
                  </div>
                </div>
              </label>

              {/* CARD */}

              <label
                className={`payment-option ${
                  paymentMethod === "CARD" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === "CARD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />

                <FaCreditCard />

                <div className="payment-option-content">
                  <strong>Credit / Debit Card</strong>
                  <span>Pay securely using your card</span>

                  <div className="payment-brands payment-logo-row">
                    <img src={visa} alt="Visa" />
                    <img src={mastercard} alt="Mastercard" />
                    <img src={rupay} alt="RuPay" />
                  </div>
                </div>
              </label>

              {/* COD */}

              <label
                className={`payment-option ${
                  paymentMethod === "COD" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />

                <FaMoneyBillWave />

                <div className="payment-option-content">
                  <strong>Cash on Delivery</strong>
                  <span>Pay when your order is delivered</span>
                </div>
              </label>
            </div>

            {error && (
              <p className="checkout-error" style={{ marginTop: "12px" }}>
                {error}
              </p>
            )}

            <p className="payment-demo-note">
              <FaLock />
              This is a dummy checkout for demo purposes. No real payment is
              collected.
            </p>

            <button
              type="button"
              onClick={() => navigate("/checkout")}
              style={{
                marginTop: "18px",
                border: "none",
                background: "transparent",
                color: "#7045e7",
                cursor: "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              <FaArrowLeft />
              Back to Shipping
            </button>
          </div>
        </div>

        {/* ORDER SUMMARY */}

        <div className="checkout-summary">
          <div className="summary-heading">
            <FaShoppingBag />
            <h2>Order Summary</h2>
          </div>

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

            <strong style={{ color: shipping === 0 ? "#169b45" : "inherit" }}>
              {shipping === 0 ? "FREE" : `₹${shipping}`}
            </strong>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total Amount</span>
            <strong>₹{total.toLocaleString("en-IN")}</strong>
          </div>

          <span
            style={{
              display: "block",
              marginBottom: "18px",
              fontSize: "11px",
              color: "#888",
            }}
          >
            Inclusive of all taxes
          </span>

          <button
            type="button"
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={processing}
          >
            <FaLock />
            {processing ? "Processing..." : "Place Order"}
          </button>

          <p className="secure-checkout-note">
            <FaCheckCircle />
            Secure Checkout
          </p>
        </div>
      </div>
    </div>
  );
}

export default Payment;
