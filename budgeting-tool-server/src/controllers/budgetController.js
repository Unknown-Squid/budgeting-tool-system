const BudgetService = require('../services/budgetService');
const LogService = require('../services/logService');

class BudgetController {
  static async getAll(req, res) {
    try {
      const budgets = await BudgetService.getByUserId(req.user.id);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async create(req, res) {
    try {
      const { category, limit, startDate, endDate } = req.body;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const budget = await BudgetService.create(req.user.id, category, limit, null, null, startDate, endDate);
      
      // Log the budget creation
      const startDateFormatted = new Date(startDate).toLocaleDateString();
      const endDateFormatted = new Date(endDate).toLocaleDateString();
      await LogService.create(
        req.user.id,
        'budget_created',
        'budget',
        budget.id,
        category,
        limit,
        `Budget created for ${category} with limit ₱${limit} (${startDateFormatted} - ${endDateFormatted})`,
        { period: budget.period, duration: budget.duration, startDate: budget.startDate, endDate: budget.endDate }
      );
      
      res.status(201).json(budget);
    } catch (error) {
      if (error.message === 'End date must be after start date') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const oldBudget = await BudgetService.getById(id, req.user.id);
      const budget = await BudgetService.update(id, req.user.id, req.body);
      
      // Log the budget update
      await LogService.create(
        req.user.id,
        'budget_updated',
        'budget',
        id,
        budget.category,
        budget.limit,
        `Budget updated for ${budget.category} with limit ₱${budget.limit}`,
        { 
          oldCategory: oldBudget.category,
          oldLimit: oldBudget.limit,
          newCategory: budget.category,
          newLimit: budget.limit,
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate
        }
      );
      
      res.json(budget);
    } catch (error) {
      if (error.message === 'Budget not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const budget = await BudgetService.getById(id, req.user.id);
      const category = budget.category;
      const limit = budget.limit;
      const period = budget.period;
      
      const result = await BudgetService.delete(id, req.user.id);
      
      // Log the budget deletion
      await LogService.create(
        req.user.id,
        'budget_deleted',
        'budget',
        id,
        category,
        limit,
        `Budget deleted for ${category} with limit ₱${limit}`,
        { period }
      );
      
      res.json(result);
    } catch (error) {
      if (error.message === 'Budget not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = BudgetController;
