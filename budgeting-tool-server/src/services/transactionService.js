const Transaction = require('../models/Transaction');

class TransactionService {
  static async create(userId, description, amount, category, type, date) {
    const transaction = await Transaction.create({
      userId,
      description,
      amount: parseFloat(amount),
      category,
      type,
      date: date || new Date(),
    });
    return transaction;
  }

  static async getByUserId(userId) {
    return await Transaction.findAll({
      where: { userId },
      order: [['date', 'DESC']],
    });
  }

  static async getById(id, userId) {
    const transaction = await Transaction.findOne({
      where: { id, userId },
    });
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return transaction;
  }

  static async update(id, userId, updates) {
    const transaction = await Transaction.findOne({
      where: { id, userId },
    });
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (updates.description) transaction.description = updates.description;
    if (updates.amount !== undefined) transaction.amount = parseFloat(updates.amount);
    if (updates.category) transaction.category = updates.category;
    if (updates.type) transaction.type = updates.type;
    if (updates.date) transaction.date = updates.date;

    await transaction.save();
    return transaction;
  }

  static async delete(id, userId) {
    const transaction = await Transaction.findOne({
      where: { id, userId },
    });
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    await transaction.destroy();
    return { message: 'Transaction deleted' };
  }
}

module.exports = TransactionService;
