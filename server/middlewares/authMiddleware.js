const jwt = require('jsonwebtoken');
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

module.exports = { protect, authMiddleware, authorize, getBearerToken };
