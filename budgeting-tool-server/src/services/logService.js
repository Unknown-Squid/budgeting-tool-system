const Log = require('../models/Log');

class LogService {
  static async create(userId, action, entityType, entityId, category, amount, description, metadata = null) {
    const log = await Log.create({
      userId,
      action,
      entityType,
      entityId,
      category,
      amount: amount ? parseFloat(amount) : null,
      description,
      metadata,
    });
    return log;
  }

  static async getByUserId(userId, limit = 50) {
    return await Log.findAll({
      where: { userId },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
    });
  }

  static async getByAction(userId, action, limit = 50) {
    return await Log.findAll({
      where: { userId, action },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
    });
  }

  static async getByEntityType(userId, entityType, limit = 50) {
    return await Log.findAll({
      where: { userId, entityType },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
    });
  }
}

module.exports = LogService;
