const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/db");
const { sendMail } = require("../utils/mailer");
const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// At least 6 characters with at least one letter and one number.
const isStrongPassword = (password) =>
  typeof password === "string" &&
  password.length >= 6 &&
  /[A-Za-z]/.test(password) &&
  /\d/.test(password);

const RESET_TOKEN_TTL_MINUTES = 15;

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// ==============================
// REGISTER USER
// ==============================
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (!PHONE_REGEX.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters and include at least one letter and one number",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if phone already exists
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE phone = ?",
      [phone]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    const [existingEmails] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingEmails.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Public registration can only create CUSTOMER or SELLER
    const userRole =
      role && role.toUpperCase() === "SELLER" ? "SELLER" : "CUSTOMER";

    const [result] = await pool.query(
      `INSERT INTO users
       (name, email, password, phone, role)
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), normalizedEmail, hashedPassword, phone, userRole]
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: result.insertId,
        name: name.trim(),
        email: normalizedEmail,
        phone,
        role: userRole,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// ==============================
// LOGIN USER
// ==============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const [users] = await pool.query(
      `SELECT id, name, email, phone, password, role, is_active
       FROM users
       WHERE email = ?`,
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// ==============================
// GET LOGGED-IN USER
// ==============================
const getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, name, email, phone, role, is_active, created_at
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==============================
// UPDATE PROFILE (name, email only — phone is the login identifier)
// ==============================
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : null;

    if (normalizedEmail) {
      const [existingEmails] = await pool.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [normalizedEmail, req.user.id]
      );

      if (existingEmails.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    await pool.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [
      name.trim(),
      normalizedEmail,
      req.user.id,
    ]);

    const [users] = await pool.query(
      `SELECT id, name, email, phone, role, is_active, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: users[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

// ==============================
// CHANGE PASSWORD
// ==============================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters and include at least one letter and one number",
      });
    }

    const [users] = await pool.query(
      "SELECT id, password FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      users[0].password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      req.user.id,
    ]);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while changing password",
    });
  }
};

// ==============================
// FORGOT PASSWORD — request a reset token
// ==============================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [users] = await pool.query(
      "SELECT id, name, email FROM users WHERE email = ?",
      [normalizedEmail]
    );

    // Always respond with a generic success message, whether or not the
    // account exists, so this endpoint can't be used to enumerate emails.
    const genericResponse = {
      success: true,
      message:
        "If an account exists for that email, a password reset link has been sent.",
    };

    if (users.length === 0) {
      return res.status(200).json(genericResponse);
    }

    const user = users[0];
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await pool.query(
      "UPDATE users SET reset_token_hash = ?, reset_token_expires_at = ? WHERE id = ?",
      [tokenHash, expiresAt, user.id]
    );

    const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?email=${encodeURIComponent(user.email)}&token=${rawToken}`;

    await sendMail({
      to: user.email,
      subject: "Reset your ShopSphere password",
      text: `Hi ${user.name},\n\nYou requested a password reset. This link expires in ${RESET_TOKEN_TTL_MINUTES} minutes:\n\n${resetLink}\n\nIf you didn't request this, you can ignore this email.`,
    });

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while processing your request",
    });
  }
};

// ==============================
// RESET PASSWORD — consume the token
// ==============================
const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword, confirmPassword } = req.body;

    if (!email || !token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, token, new password and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters and include at least one letter and one number",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [users] = await pool.query(
      `SELECT id, reset_token_hash, reset_token_expires_at
       FROM users WHERE email = ?`,
      [normalizedEmail]
    );

    if (users.length === 0 || !users[0].reset_token_hash) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link. Please request a new one.",
      });
    }

    const user = users[0];

    if (
      !user.reset_token_expires_at ||
      new Date(user.reset_token_expires_at) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "This reset link has expired. Please request a new one.",
      });
    }

    const tokenMatches = await bcrypt.compare(token, user.reset_token_hash);

    if (!tokenMatches) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link. Please request a new one.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users
       SET password = ?, reset_token_hash = NULL, reset_token_expires_at = NULL
       WHERE id = ?`,
      [hashedPassword, user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while resetting your password",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
