const DashboardService = require('../services/dashboardService');

class DashboardController {
  static async getStats(req, res) {
    try {
      const stats = await DashboardService.getStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = DashboardController;
