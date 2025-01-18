const jwt = require("jsonwebtoken");

const adminAuthMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = decoded; // Attach user info to the request
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = adminAuthMiddleware;
