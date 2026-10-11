const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const getJwtSecret = () => {
  return process.env.JWT_SECRET || "househunt_jwt_secret_production_fallback_2026";
};

// Protect routes that require login
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Authentication token missing."
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Invalid token format."
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    // If database is connected, load user from DB
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User account belonging to this token no longer exists."
        });
      }
      req.user = user;
    } else {
      // Graceful fallback when DB is disconnected
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role || "user"
      };
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized. Token is invalid or has expired."
    });
  }
};

// Optional auth for routes that allow public browsing but personalize for logged in users
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    const decoded = jwt.verify(token, getJwtSecret());
    if (mongoose.connection.readyState === 1) {
      req.user = await User.findById(decoded.id).select("-password");
    } else {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role || "user"
      };
    }
    next();
  } catch (err) {
    // Silently continue for optional auth
    next();
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${roles.join(", ")}] roles.`
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize };
