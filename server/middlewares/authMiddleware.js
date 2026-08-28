const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
require('dotenv').config();

const getBearerToken = (req) => {
    const header = req.headers.authorization;
    if (!header || typeof header !== "string") return null;
    const [scheme, token] = header.trim().split(/\s+/);
    return scheme === "Bearer" && token ? token : null;
};

const protect = (req, res, next) => {
    const token = getBearerToken(req);
    if (!token) {
        return res.status(401).json({ message: "Not authorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access Denied" });
        }
        next();
    };
};

const authorizeSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ message: "Super admin access required" });
  }
  next();
};

const authorizeResource = (resourceKey, action = 'can_view') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (req.user.role === 'super_admin') {
      return next();
    }

    try {
      const access = await User.getResourceAccessForUser(req.user.id);
      const permission = access.find((item) => item.resource_key === resourceKey);

      if (!permission || !permission[action]) {
        return res.status(403).json({ message: `Access denied for resource: ${resourceKey}` });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Permission check failed', error: error.message });
    }
  };
};

const authMiddleware = (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = { protect, authMiddleware, authorize, authorizeSuperAdmin, authorizeResource, getBearerToken };

