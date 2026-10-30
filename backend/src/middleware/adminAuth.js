const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

/**
 * Protect middleware: Ensures request has a valid Admin Access Token
 */
exports.protectAdmin = async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && (req.cookies.adminAccessToken || req.cookies.adminToken)) {
    token = req.cookies.adminAccessToken || req.cookies.adminToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Admin authentication token required.",
    });
  }

  try {
    const secret = process.env.JWT_SECRET || "lekhani_super_secret_jwt_key_2026";
    const decoded = jwt.verify(token, secret);

    const admin = await AdminUser.findById(decoded.id).lean();

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found or session expired.",
      });
    }

    if (admin.status === "Blocked") {
      return res.status(403).json({
        success: false,
        message: "Your admin account has been suspended.",
      });
    }

    if (admin.status === "Inactive") {
      return res.status(403).json({
        success: false,
        message: "Your admin account is inactive. Please contact system administrator.",
      });
    }

    // Attach admin to request
    req.admin = admin;
    req.user = admin; // Compatibility for shared middleware
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Admin access token expired.",
        isExpired: true,
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or malformed admin authentication token.",
      error: error.message,
    });
  }
};

/**
 * Role-based authorization middleware for Admin Users
 */
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.admin.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

