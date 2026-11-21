import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Admin email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const user = await login(formData.email.trim(), formData.password);

      if (user.role !== "ADMIN") {
        setServerError("This account is not an admin account.");
        return;
      }

      toast.success("Login successful");
      navigate("/admin/dashboard", { replace: true });
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
        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "14px",
              background: "#7045e7",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "25px",
            }}
          >
            <FaShieldAlt />
          </div>
        </div>

        <div className="auth-heading">
          <h1>Admin Login</h1>

          <p>
            Sign in to manage <strong>ShopSphere</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Admin Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter admin email address"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />

            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

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
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {serverError && (
            <div
              className="error-message"
              style={{ textAlign: "center", marginBottom: "15px" }}
            >
              {serverError}
            </div>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "22px",
            fontSize: "13px",
            color: "#888",
          }}
        >
          <FaShieldAlt style={{ marginRight: "5px" }} />
          ShopSphere Administration
        </p>
      </motion.div>
    </div>
  );
}

export default AdminLogin;
