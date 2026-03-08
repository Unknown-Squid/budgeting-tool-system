const AuthService = require('../services/authService');

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, name } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');
      
      const result = await AuthService.register(email, password, name, ipAddress, userAgent);
      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'User already exists') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');
      
      const result = await AuthService.login(email, password, ipAddress, userAgent);
      res.json(result);
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');
      
      const result = await AuthService.refreshAccessToken(refreshToken, ipAddress, userAgent);
      res.json(result);
    } catch (error) {
      if (error.message === 'Invalid refresh token' || error.message === 'Refresh token expired') {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      await AuthService.logout(refreshToken);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async logoutAll(req, res) {
    try {
      await AuthService.logoutAll(req.user.id);
      res.json({ message: 'Logged out from all devices' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async getSessions(req, res) {
    try {
      const sessions = await AuthService.getActiveSessions(req.user.id);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async getMe(req, res) {
    try {
      const user = await AuthService.getUserById(req.user.id);
      res.json(user);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = AuthController;
