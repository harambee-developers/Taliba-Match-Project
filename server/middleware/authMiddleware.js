const jwt = require("jsonwebtoken")
const axios = require("axios")

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

    // Access token expired → call your refresh endpoint
    try {
      // `withCredentials: true` so cookies go along
      const refreshRes = await axios.post(
        `${process.env.BACKEND_URL}/api/auth/refresh-token`,
        {},
        { withCredentials: true }
      );

      // The refresh endpoint sets new cookies on the response
      // so we just re-verify the new token:
      const newToken = req.cookies.token;
      const newPayload = jwt.verify(newToken, process.env.JWT_SECRET_TOKEN);
      req.user = { id: newPayload.userId };
      return next();

    } catch (refreshErr) {
      // Refresh failed (missing/invalid refreshToken)
      const msg =
        refreshErr.response?.status === 403
          ? 'Session expired, please log in again'
          : 'Could not refresh token';
      return res.status(401).json({ message: msg });
    }
  }
}

module.exports = authMiddleware;
