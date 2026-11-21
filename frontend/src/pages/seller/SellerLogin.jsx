import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaShoppingBag,
  FaStore,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

function SellerLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await login(formData.email.trim(), formData.password);

      if (user.role !== "SELLER") {
        setError("This account is not registered as a seller.");
        return;
      }

      toast.success("Login successful");
      navigate("/seller/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f5ff",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#fff",
          padding: "38px",
          borderRadius: "16px",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 14px",
              borderRadius: "14px",
              background: "#7045e7",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "25px",
            }}
          >
            <FaStore />
          </div>

          <h1 style={{ margin: "0 0 6px", fontSize: "27px" }}>
            Seller Login
          </h1>

          <p style={{ color: "#777", margin: 0 }}>
            Sign in to manage your ShopSphere store
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            style={{ display: "block", fontWeight: "600", marginBottom: "7px" }}
          >
            Email Address
          </label>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "0 13px",
              marginBottom: "18px",
            }}
          >
            <FaEnvelope color="#888" />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              autoComplete="email"
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                padding: "13px",
                fontSize: "14px",
                background: "transparent",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "7px",
            }}
          >
            <label style={{ fontWeight: "600" }}>Password</label>
            <Link
              to="/forgot-password"
              style={{ fontSize: "13px", fontWeight: 600, color: "#7045e7" }}
            >
              Forgot Password?
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "0 13px",
            }}
          >
            <FaLock color="#888" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              style={{
                flex: 1,
                width: "100%",
                border: "none",
                outline: "none",
                padding: "13px",
                fontSize: "14px",
                background: "transparent",
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#888",
                fontSize: "17px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px",
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && (
            <p
              style={{
                color: "#dc3545",
                fontSize: "13px",
                marginTop: "10px",
                marginBottom: "0",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "22px",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: "#7045e7",
              color: "#fff",
              fontSize: "15px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Logging in..." : "Login as Seller"}
          </button>
        </form>

        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "13px",
            color: "#888",
          }}
        >
          New seller?{" "}
          <Link to="/register" style={{ color: "#7045e7", fontWeight: 600 }}>
            Create a seller account
          </Link>
        </p>

        <div
          style={{
            marginTop: "25px",
            paddingTop: "20px",
            borderTop: "1px solid #eee",
            textAlign: "center",
            color: "#888",
            fontSize: "13px",
          }}
        >
          <FaShoppingBag style={{ marginRight: "6px" }} />
          ShopSphere Seller Panel
        </div>
      </div>
    </div>
  );
}

export default SellerLogin;
