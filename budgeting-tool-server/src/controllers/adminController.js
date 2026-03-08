const AdminService = require('../services/adminService');

class AdminController {
  // Get all users
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const result = await AdminService.getAllUsers(page, limit, search);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await AdminService.getUserById(id);
      res.json(user);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  // Create new user
  static async createUser(req, res) {
    try {
      const { email, password, name, role } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }

      if (!email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const user = await AdminService.createUser(email, password, name, role || 'user');
      res.status(201).json(user);
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  // Update user
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Don't allow updating password without providing it
      if (updates.password && updates.password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const user = await AdminService.updateUser(id, updates);
      res.json(user);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // Prevent admin from deleting themselves
      if (id === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const result = await AdminService.deleteUser(id);
      res.json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  // Get user statistics
  static async getUserStats(req, res) {
    try {
      const { id } = req.params;
      const stats = await AdminService.getUserStats(id);
      res.json(stats);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  // Get system statistics
  static async getSystemStats(req, res) {
    try {
      const stats = await AdminService.getSystemStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }
}

module.exports = AdminController;
