const jwt = require("jsonwebtoken");

// ==========================================
// PROTECT ROUTE - VERIFY JWT
// ==========================================

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check Authorization header
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Attach logged-in user to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// ==========================================
// AUTHORIZE USER ROLES
// ==========================================

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // User must first pass protect middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check whether user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to access this resource",
      });
    }

    next();
  };
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  protect,
  authorizeRoles,
};