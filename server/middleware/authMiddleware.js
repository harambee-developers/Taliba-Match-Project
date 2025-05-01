const jwt = require("jsonwebtoken");

/**
 * authMiddleware
 * Verifies JWT in HTTP-only cookie and attaches `req.user.id`
 */
function authMiddleware(req, res, next) {
  const { token } = req.cookies || {};

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
  } catch (err) {
    // token expired or invalid
    const msg = err.name === 'TokenExpiredError'
      ? 'Token expired'
      : 'Invalid token';
    return res.status(401).json({ message: msg });
  }

  // only keep the minimal claim we need
  req.user = { id: payload.userId };
  next();
}
  
module.exports = authMiddleware;