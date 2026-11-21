import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const data = await forgotPassword(email.trim());
      const message =
        data.message ||
        "If an account exists for that email, a password reset link has been sent.";
      setSuccessMessage(message);
      toast.success(message);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to connect to the server. Please try again.";
      setError(message);
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
          <h1>Forgot Password</h1>
          <p>Enter your registered email and we'll send you a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={handleChange}
              className={error ? "input-error" : ""}
              autoComplete="email"
              disabled={Boolean(successMessage)}
            />

            {error && <span className="error-message">{error}</span>}
          </div>

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
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          )}
        </form>

        <p className="auth-switch">
          Remembered your password? <Link to="/login">Back to Login</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
