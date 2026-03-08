const Budget = require('../models/Budget');

class BudgetService {
  static calculateDates(period, duration) {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    
    const durationNum = parseInt(duration) || 1;
    
    switch (period) {
      case 'weekly':
        endDate.setDate(startDate.getDate() + (durationNum * 7));
        break;
      case 'monthly':
        endDate.setMonth(startDate.getMonth() + durationNum);
        break;
      case 'yearly':
        endDate.setFullYear(startDate.getFullYear() + durationNum);
        break;
      default:
        endDate.setMonth(startDate.getMonth() + durationNum);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  static async create(userId, category, limit, period, duration, startDate, endDate) {
    // Require startDate and endDate
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    // Validate that end date is after start date
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      throw new Error('End date must be after start date');
    }

    // Determine period type based on date range (for backward compatibility)
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    let calculatedPeriod = 'monthly';
    if (daysDiff <= 7) {
      calculatedPeriod = 'weekly';
    } else if (daysDiff >= 365) {
      calculatedPeriod = 'yearly';
    }

    const budget = await Budget.create({
      userId,
      category,
      limit: parseFloat(limit),
      period: period || calculatedPeriod,
      duration: duration || Math.ceil(daysDiff / (calculatedPeriod === 'weekly' ? 7 : calculatedPeriod === 'monthly' ? 30 : 365)),
      startDate: startDate,
      endDate: endDate,
    });
    return budget;
  }

  static async getByUserId(userId) {
    return await Budget.findAll({
      where: { userId },
      order: [['created_at', 'DESC']],
    });
  }

  static async getById(id, userId) {
    const budget = await Budget.findOne({
      where: { id, userId },
    });
    if (!budget) {
      throw new Error('Budget not found');
    }
    return budget;
  }

  static async update(id, userId, updates) {
    const budget = await Budget.findOne({
      where: { id, userId },
    });
    if (!budget) {
      throw new Error('Budget not found');
    }

    if (updates.category) budget.category = updates.category;
    if (updates.limit !== undefined) budget.limit = parseFloat(updates.limit);
    if (updates.period) budget.period = updates.period;
    if (updates.duration !== undefined) budget.duration = parseInt(updates.duration);
    if (updates.startDate) budget.startDate = updates.startDate;
    if (updates.endDate) budget.endDate = updates.endDate;

    // If period or duration changed, recalculate dates if not explicitly provided
    if ((updates.period || updates.duration) && !updates.startDate && !updates.endDate) {
      const dates = this.calculateDates(updates.period || budget.period, updates.duration || budget.duration);
      budget.startDate = dates.startDate;
      budget.endDate = dates.endDate;
    }

    await budget.save();
    return budget;
  }

  static async delete(id, userId) {
    const budget = await Budget.findOne({
      where: { id, userId },
    });
    if (!budget) {
      throw new Error('Budget not found');
    }
    await budget.destroy();
    return { message: 'Budget deleted' };
  }
}

module.exports = BudgetService;
