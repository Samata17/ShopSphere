import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    role: "customer",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
    setSuccessMessage("");
  };

  // =========================================
  // VALIDATION
  // =========================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must contain at least 3 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (
      formData.password.length < 6 ||
      !/[A-Za-z]/.test(formData.password) ||
      !/\d/.test(formData.password)
    ) {
      newErrors.password =
        "Password must be at least 6 characters and include a letter and a number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================
  // REGISTRATION
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const registeredRole = formData.role;

    setLoading(true);
    setServerError("");
    setSuccessMessage("");

    try {
      await register({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: registeredRole.toUpperCase(),
      });

      setSuccessMessage(
        registeredRole === "seller"
          ? "Seller account created successfully! Redirecting to Seller Login..."
          : "Customer account created successfully! Redirecting to Customer Login..."
      );

      setFormData({
        role: "customer",
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate(registeredRole === "seller" ? "/seller/login" : "/login");
      }, 1500);
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Registration failed"
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
          <h1>Create Account</h1>

          <p>Join ShopSphere and start your journey.</p>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} noValidate>
          {/* ROLE SELECTOR */}

          <div className="role-selector">
            <label>
              <input
                type="radio"
                name="role"
                value="customer"
                checked={formData.role === "customer"}
                onChange={handleChange}
              />
              Customer
            </label>

            <label>
              <input
                type="radio"
                name="role"
                value="seller"
                checked={formData.role === "seller"}
                onChange={handleChange}
              />
              Seller
            </label>
          </div>

          {/* FULL NAME */}

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "input-error" : ""}
              autoComplete="name"
            />

            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          {/* PHONE */}

          <div className="form-group">
            <label>Phone Number</label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter 10-digit phone number"
              value={formData.phone}
              onChange={handleChange}
              maxLength="10"
              className={errors.phone ? "input-error" : ""}
              autoComplete="tel"
            />

            {errors.phone && (
              <span className="error-message">{errors.phone}</span>
            )}
          </div>

          {/* EMAIL */}

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
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
            <label>Password</label>

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                autoComplete="new-password"
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

          {/* CONFIRM PASSWORD */}

          <div className="form-group">
            <label>Confirm Password</label>

            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "input-error" : ""}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {/* SERVER ERROR */}

          {serverError && (
            <div
              className="error-message"
              style={{ textAlign: "center", marginBottom: "15px" }}
            >
              {serverError}
            </div>
          )}

          {/* SUCCESS MESSAGE */}

          {successMessage && (
            <div
              style={{
                textAlign: "center",
                marginBottom: "15px",
                color: "green",
                fontWeight: "600",
              }}
            >
              {successMessage}
            </div>
          )}

          {/* CREATE ACCOUNT BUTTON */}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* LOGIN LINK */}

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to={formData.role === "seller" ? "/seller/login" : "/login"}>
            {formData.role === "seller" ? "Seller Login" : "Login here"}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;
