const LogService = require('../services/logService');

class LogController {
  static async getAll(req, res) {
    try {
      const { limit = 50, action, entityType } = req.query;
      let logs;
      
      if (action) {
        logs = await LogService.getByAction(req.user.id, action, limit);
      } else if (entityType) {
        logs = await LogService.getByEntityType(req.user.id, entityType, limit);
      } else {
        logs = await LogService.getByUserId(req.user.id, limit);
      }
      
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = LogController;
