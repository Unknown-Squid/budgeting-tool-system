const TransactionService = require('../services/transactionService');
const LogService = require('../services/logService');

class TransactionController {
  static async getAll(req, res) {
    try {
      const transactions = await TransactionService.getByUserId(req.user.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async create(req, res) {
    try {
      const { description, amount, category, type, date, budgetId } = req.body;
      const transaction = await TransactionService.create(
        req.user.id,
        description,
        amount,
        category,
        type,
        date
      );
      
      // Log the transaction creation
      await LogService.create(
        req.user.id,
        'transaction_created',
        'transaction',
        transaction.id,
        category,
        amount,
        `${type === 'income' ? 'Income' : 'Expense'}: ${description}`,
        { type, date, budgetId: budgetId || null }
      );
      
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const oldTransaction = await TransactionService.getById(id, req.user.id);
      const transaction = await TransactionService.update(id, req.user.id, req.body);
      
      // Log the transaction update
      await LogService.create(
        req.user.id,
        'transaction_updated',
        'transaction',
        id,
        transaction.category,
        transaction.amount,
        `${transaction.type === 'income' ? 'Income' : 'Expense'} updated: ${transaction.description}`,
        { 
          type: transaction.type,
          oldDescription: oldTransaction.description,
          oldAmount: oldTransaction.amount,
          newDescription: transaction.description,
          newAmount: transaction.amount
        }
      );
      
      res.json(transaction);
    } catch (error) {
      if (error.message === 'Transaction not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const transaction = await TransactionService.getById(id, req.user.id);
      const description = transaction.description;
      const amount = transaction.amount;
      const category = transaction.category;
      const type = transaction.type;
      
      const result = await TransactionService.delete(id, req.user.id);
      
      // Log the transaction deletion
      await LogService.create(
        req.user.id,
        'transaction_deleted',
        'transaction',
        id,
        category,
        amount,
        `${type === 'income' ? 'Income' : 'Expense'} deleted: ${description}`,
        { type }
      );
      
      res.json(result);
    } catch (error) {
      if (error.message === 'Transaction not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = TransactionController;
