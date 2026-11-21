import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (
      formData.newPassword.length < 6 ||
      !/[A-Za-z]/.test(formData.newPassword) ||
      !/\d/.test(formData.newPassword)
    ) {
      newErrors.newPassword =
        "Password must be at least 6 characters and include a letter and a number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !token) {
      setServerError(
        "This reset link is invalid. Please request a new one from the Forgot Password page."
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const data = await resetPassword({
        email,
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      const message =
        data.message || "Password reset successful. Redirecting to Login...";
      setSuccessMessage(message);
      toast.success(message);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to connect to the server. Please try again.";
      setServerError(message);
      toast.error(message);
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
        <div className="auth-heading">
          <h1>Reset Password</h1>
          <p>Choose a new password for {email || "your account"}.</p>
        </div>

        {!email || !token ? (
          <div
            className="error-message"
            style={{ textAlign: "center", marginBottom: "15px" }}
          >
            This reset link is invalid or incomplete. Please request a new
            one from the{" "}
            <Link to="/forgot-password">Forgot Password page</Link>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>New Password</label>

              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={errors.newPassword ? "input-error" : ""}
                  autoComplete="new-password"
                  disabled={Boolean(successMessage)}
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

              {errors.newPassword && (
                <span className="error-message">{errors.newPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>

              <div className="password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "input-error" : ""}
                  autoComplete="new-password"
                  disabled={Boolean(successMessage)}
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

            {serverError && (
              <div
                className="error-message"
                style={{ textAlign: "center", marginBottom: "15px" }}
              >
                {serverError}
              </div>
            )}

            {successMessage && (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "15px",
                  color: "green",
                  fontWeight: 600,
                }}
              >
                {successMessage}
              </div>
            )}

            {!successMessage && (
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            )}
          </form>
        )}

        <p className="auth-switch">
          Remembered your password? <Link to="/login">Back to Login</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default ResetPassword;
