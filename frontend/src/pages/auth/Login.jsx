import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================
  // HANDLE INPUT
  // =========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  // =========================================
  // VALIDATION
  // =========================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================
  // LOGIN
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const user = await login(formData.email.trim(), formData.password);

      if (user.role !== "CUSTOMER") {
        setServerError("This account is not a customer account.");
        return;
      }

      toast.success("Login successful");
      navigate("/home", { replace: true });
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* HEADING */}

        <div className="auth-heading">
          <h1>Customer Login</h1>

          <p>
            Login to continue shopping on <strong>ShopSphere</strong>
          </p>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} noValidate>
          {/* EMAIL */}

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
              autoComplete="email"
            />

            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {/* PASSWORD */}

          <div className="form-group">
            <div className="auth-label-row">
              <label>Password</label>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            </div>

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {/* SERVER ERROR */}

          {serverError && (
            <div
              className="error-message"
              style={{ marginBottom: "15px", textAlign: "center" }}
            >
              {serverError}
            </div>
          )}

          {/* LOGIN BUTTON */}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login as Customer"}
          </button>
        </form>

        {/* REGISTER */}

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
