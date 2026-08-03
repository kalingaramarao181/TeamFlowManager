const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const token = req.cookies.token; // assuming cookie is named 'token'
  if (!token) return res.status(401).json({ message: "Unauthorized: No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains role, id, name, etc.
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

exports.verifyJWT = verifyJWT;
