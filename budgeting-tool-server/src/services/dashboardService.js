const { Op } = require('sequelize');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

class DashboardService {
  static async getStats(userId) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get user budgets
    const userBudgets = await Budget.findAll({
      where: { userId },
    });

    // Get monthly transactions
    const monthlyTransactions = await Transaction.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    // Calculate totals
    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Calculate total budget (sum of all budget limits)
    const totalBudget = userBudgets.reduce((sum, budget) => sum + parseFloat(budget.limit || 0), 0);

    const balance = totalBudget - totalExpenses; // Balance = Budget - Expenses

    // Budget progress
    const budgetProgress = userBudgets.map(budget => {
      const budgetExpenses = monthlyTransactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      return {
        ...budget.toJSON(),
        spent: budgetExpenses,
        remaining: parseFloat(budget.limit) - budgetExpenses,
        percentage: parseFloat(budget.limit) > 0 ? (budgetExpenses / parseFloat(budget.limit)) * 100 : 0,
      };
    });

    // Category breakdown
    const categoryBreakdown = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + parseFloat(t.amount);
      });

    return {
      totalIncome,
      totalBudget, // Add total budget
      totalExpenses,
      balance,
      budgetProgress,
      categoryBreakdown,
    };
  }
}

module.exports = DashboardService;
