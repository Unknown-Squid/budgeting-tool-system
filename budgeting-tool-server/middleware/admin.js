const AuthService = require('../src/services/authService');

const requireAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user from database to check role
    const user = await AuthService.getUserById(req.user.id);
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: err.message || 'Access denied' });
  }
};

module.exports = requireAdmin;
