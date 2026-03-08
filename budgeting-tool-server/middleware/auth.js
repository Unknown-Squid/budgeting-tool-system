const AuthService = require('../src/services/authService');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify token and validate session
    const { decoded } = await AuthService.validateSession(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: err.message || 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
