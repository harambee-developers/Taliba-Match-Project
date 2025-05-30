const jwt = require("jsonwebtoken")

const authMiddleware = async (req, res, next) =>  {
  const { token } = req.cookies || {};

  if (!token) {
    return res.status(401).json({ message: 'No access token provided' });
  }

  try {
    // Try verifying the access token
    const payload = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    req.user = { id: payload.userId };
    return next();

  } catch (err) {
    if (err.name !== 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid access token' });
    }
}
}

module.exports = authMiddleware;
