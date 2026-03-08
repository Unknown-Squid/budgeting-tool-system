const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

class CleanupService {
  /**
   * Auto-delete budgets and transactions after 15 days of data retention period
   * Budgets are deleted if: endDate + 15 days < today
   * Transactions associated with those budgets are also deleted
   */
  static async cleanupExpiredBudgetsAndTransactions() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calculate the cutoff date: budgets that ended 15+ days ago
      const cutoffDate = new Date(today);
      cutoffDate.setDate(cutoffDate.getDate() - 15);
      
      // Find budgets that ended 15+ days ago
      const expiredBudgets = await Budget.findAll({
        where: {
          endDate: {
            [Op.lt]: cutoffDate
          }
        }
      });
      
      if (expiredBudgets.length === 0) {
        console.log(`[Cleanup] No expired budgets to delete (cutoff date: ${cutoffDate.toISOString().split('T')[0]})`);
        return { deletedBudgets: 0, deletedTransactions: 0 };
      }
      
      const budgetIds = expiredBudgets.map(b => b.id);
      const budgetCategories = expiredBudgets.map(b => b.category);
      
      // Delete transactions associated with these budgets (by category)
      // This matches transactions to budgets by category since transactions don't have a direct budgetId
      const deletedTransactions = await Transaction.destroy({
        where: {
          category: {
            [Op.in]: budgetCategories
          }
        }
      });
      
      // Delete the expired budgets
      const deletedBudgets = await Budget.destroy({
        where: {
          id: {
            [Op.in]: budgetIds
          }
        }
      });
      
      console.log(`[Cleanup] Deleted ${deletedBudgets} expired budgets and ${deletedTransactions} associated transactions`);
      
      return {
        deletedBudgets,
        deletedTransactions,
        cutoffDate: cutoffDate.toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('[Cleanup] Error during cleanup:', error);
      throw error;
    }
  }
}

module.exports = CleanupService;
